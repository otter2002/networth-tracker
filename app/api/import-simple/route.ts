import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';

export async function POST() {
  try {
    // 根据networth.txt手动解析的数据（已转换为美元）
    const records = [
      { date: '2024-03-29', cex_assets: 51465, onchain_assets: 25806.52, bank_assets: 3334.51 },
      { date: '2024-05-16', cex_assets: 42863.63, onchain_assets: 31459.38, bank_assets: 3384.51 },
      { date: '2024-06-14', cex_assets: 44736.25, onchain_assets: 32748.61, bank_assets: 3434.51 },
      { date: '2024-07-05', cex_assets: 45736.25, onchain_assets: 37748.61, bank_assets: 3484.51 },
      { date: '2024-07-17', cex_assets: 48236.25, onchain_assets: 39248.61, bank_assets: 3534.51 }
    ];

    const results = [];

    for (const record of records) {
      try {
        const totalValue = record.cex_assets + record.onchain_assets + record.bank_assets;
        
        await db.insert(netWorthRecords).values({
          userId: null,
          date: record.date,
          totalValue: totalValue.toString(),
          onChainAssets: record.onchain_assets > 0 ? [{
            id: '1',
            walletAddress: '0x...',
            remark: 'Imported OnChain',
            positions: [{ id: '1', token: 'USDC', valueUSD: record.onchain_assets, apr: 0 }],
            totalValueUSD: record.onchain_assets,
            yieldValueUSD: 0,
            totalAPR: 0,
            dailyIncome: 0,
            monthlyIncome: 0,
            yearlyIncome: 0
          }] : [],
          cexAssets: record.cex_assets > 0 ? [{
            id: '1',
            exchange: 'CEX',
            positions: [{ id: '1', token: 'USDC', valueUSD: record.cex_assets, apr: 0 }],
            totalValueUSD: record.cex_assets,
            yieldValueUSD: 0,
            totalAPR: 0,
            dailyIncome: 0,
            monthlyIncome: 0,
            yearlyIncome: 0
          }] : [],
          bankAssets: record.bank_assets > 0 ? [{
            id: '1',
            bankName: 'Bank',
            positions: [{ id: '1', currency: 'USD', valueUSD: record.bank_assets, apr: 0 }],
            totalValueUSD: record.bank_assets,
            yieldValueUSD: 0,
            totalAPR: 0,
            dailyIncome: 0,
            monthlyIncome: 0,
            yearlyIncome: 0
          }] : []
        });
        
        results.push({ success: true, date: record.date });
      } catch (error: any) {
        results.push({ success: false, date: record.date, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({ 
      success: true, 
      message: `成功导入 ${successCount}/${records.length} 条记录`,
      results: results
    });
    
  } catch (error: any) {
    console.error('导入过程中出错:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
