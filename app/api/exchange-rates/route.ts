import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exchangeRates } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

// GET - 获取汇率数据
export async function GET() {
  try {
    // 首先从 currencylayer 获取实时汇率
    try {
      const externalRes = await fetch('https://api.currencylayer.com/live?access_key=a28c6b9408ad6bca14f131c23a613e4f');
      const externalData = await externalRes.json();
      if (externalData.success && externalData.quotes) {
        const liveRates: { [key: string]: number } = { USD: 1 };
        Object.entries(externalData.quotes as Record<string, number>).forEach(([pair, rate]) => {
          const currency = pair.slice(3);
          if (rate && typeof rate === 'number') {
            liveRates[currency] = rate; // 直接使用 currency per USD
          }
        });
        // 同步写入数据库
        const entries = Object.entries(liveRates).map(([currency, rate]) => ({ currency, rate: rate.toString() }));
        await db.insert(exchangeRates).values(entries);
        return NextResponse.json(liveRates);
      }
    } catch (extError) {
      console.error('外部API获取失败，使用数据库缓存：', extError);
    }
    // 获取最新的汇率数据
    const rates = await db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.timestamp)); // 获取所有记录并按时间降序

    // 如果数据库中没有汇率记录，返回默认汇率
    if (rates.length === 0) {
      const defaultRates = { USD: 1, HKD: 0.128, CNY: 0.138, THB: 0.0285 };
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