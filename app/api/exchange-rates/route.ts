import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exchangeRates } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

// GET - 获取汇率数据
export async function GET() {
  try {
    // 外部实时汇率优先：currencylayer
    try {
      console.log('正在调用currencylayer API...');
      const externalRes = await fetch('https://api.currencylayer.com/live?access_key=a28c6b9408ad6bca14f131c23a613e4f', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('API响应状态:', externalRes.status, externalRes.statusText);
      
      if (!externalRes.ok) {
        throw new Error(`HTTP错误: ${externalRes.status}`);
      }
      
      const externalData = await externalRes.json();
      console.log('Currencylayer API完整响应:', JSON.stringify(externalData, null, 2));
      
      if (externalData.success && externalData.quotes) {
        const liveRates: { [key: string]: number } = { USD: 1 };
        
        // currencylayer返回的quotes格式：{ "USDCNY": 7.23, "USDHKD": 7.8, "USDTHB": 35.5 }
        Object.entries(externalData.quotes as Record<string, number>).forEach(([pair, rate]) => {
          // 提取货币代码，例如从"USDCNY"提取"CNY"
          const currency = pair.slice(3);
          if (rate && typeof rate === 'number' && currency) {
            liveRates[currency] = rate;
          }
        });
        
        console.log('Processed exchange rates:', liveRates);
        
        // 清理旧汇率数据（保留最近的100条记录）
        try {
          const oldRates = await db
            .select()
            .from(exchangeRates)
            .orderBy(desc(exchangeRates.timestamp))
            .offset(100);
          
          if (oldRates.length > 0) {
            await db.delete(exchangeRates).where(eq(exchangeRates.id, oldRates[0].id));
          }
        } catch (cleanupError) {
          console.warn('清理旧汇率数据失败:', cleanupError);
        }
        
        // 同步写入数据库并返回
        const entries = Object.entries(liveRates).map(([currency, rate]) => ({ currency, rate: rate.toString() }));
        await db.insert(exchangeRates).values(entries);
        return NextResponse.json(liveRates);
      }
      // currencylayer API失败
      console.error('Currencylayer API失败:', externalData);
      throw new Error('currencylayer fetch unsuccessful');
    } catch (error) {
      console.error('Currencylayer调用出错:', error);
      console.warn('currencylayer unavailable or unauthorized, trying exchangerate.host');
      // 使用 exchangerate.host 作为次选
      try {
        const hostRes = await fetch('https://api.exchangerate.host/latest?base=USD');
        const hostData = await hostRes.json();
        if (hostData && hostData.rates) {
          const liveRates: { [key: string]: number } = { USD: 1 };
          Object.entries(hostData.rates as Record<string, number>).forEach(([currency, rate]) => {
            if (rate && typeof rate === 'number') {
              liveRates[currency] = rate;
            }
          });
          // 写入数据库并返回
          const entries = Object.entries(liveRates).map(([currency, rate]) => ({ currency, rate: rate.toString() }));
          await db.insert(exchangeRates).values(entries);
          return NextResponse.json(liveRates);
        }
      } catch (hostError) {
        console.error('exchangerate.host fetch failed:', hostError);
      }
    }
    // 获取最新的汇率数据
    const rates = await db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.timestamp)); // 获取所有记录并按时间降序

    // 如果数据库中没有汇率记录，返回默认汇率
    if (rates.length === 0) {
      // 默认汇率: 1 USD = X 外币
      const defaultRates = { USD: 1, HKD: 7.8, CNY: 7.3, THB: 35.0 };
      return NextResponse.json(defaultRates);
    }

    // 按货币分组，获取每种货币的最新汇率
    const latestRates: { [key: string]: number } = {};
    rates.forEach((rate: any) => {
      if (!latestRates[rate.currency]) {
        latestRates[rate.currency] = parseFloat(rate.rate.toString());
      }
    });

    return NextResponse.json(latestRates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - 更新汇率数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rates } = body; // { USD: 1, CNY: 0.138, THB: 0.0285, ... }

    if (!rates || typeof rates !== 'object') {
      return NextResponse.json({ error: 'Invalid rates data' }, { status: 400 });
    }

    // 批量插入汇率数据，确保rate为字符串（数据库schema要求string），但先parseFloat再toString
    const rateEntries = Object.entries(rates).map(([currency, rate]) => ({
      currency,
      rate: (typeof rate === 'number' ? rate : parseFloat(rate as string)).toString(),
    }));
    await db.insert(exchangeRates).values(rateEntries);

    return NextResponse.json({ message: 'Exchange rates updated successfully' });
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}