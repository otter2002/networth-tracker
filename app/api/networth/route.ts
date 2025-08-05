import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';
import { desc } from 'drizzle-orm';

// GET - 获取所有净资产记录 (Updated for Neon DB)
export async function GET() {
  try {
    let records = await db
      .select()
      .from(netWorthRecords)
      .orderBy(desc(netWorthRecords.date));

    // 如果没有记录，返回示例数据
    if (records.length === 0) {
      console.log('No records found in database, returning sample data');
      const sampleRecord = {
        id: 1,
        date: '2024-12-01',
        totalValue: 1500000,
        onChainAssets: [
          {
            id: '1',
            walletAddress: '0x1234...abcd',
            remark: 'DeFi Yield Farm',
            positions: [
              { id: '1', token: 'USDC', valueUSD: 50000, apr: 8.5 },
              { id: '2', token: 'ETH', valueUSD: 100000, apr: 4.2 },
              { id: '3', token: 'WBTC', valueUSD: 75000, apr: 3.8 }
            ],
            totalValueUSD: 225000,
            yieldValueUSD: 225000,
            totalAPR: 5.8,
            dailyIncome: 35.62,
            monthlyIncome: 1068.6,
            yearlyIncome: 13040.0
          },
          {
            id: '2',
            walletAddress: '0x5678...efgh',
            remark: 'Staking Rewards',
            positions: [
              { id: '4', token: 'SOL', valueUSD: 80000, apr: 6.2 },
              { id: '5', token: 'ATOM', valueUSD: 40000, apr: 12.5 }
            ],
            totalValueUSD: 120000,
            yieldValueUSD: 120000,
            totalAPR: 8.3,
            dailyIncome: 27.4,
            monthlyIncome: 822.0,
            yearlyIncome: 9960.0
          }
        ],
        cexAssets: [
          { id: '1', exchange: 'binance', totalValueUSD: 400000 },
          { id: '2', exchange: 'okx', totalValueUSD: 300000 }
        ],
        bankAssets: [
          {
            id: '1',
            institution: '农业银行',
            depositType: '定期',
            currency: 'CNY',
            amount: 2000000,
            exchangeRate: 0.14,
            valueUSD: 280000
          },
          {
            id: '2',
            institution: 'hsbc hk',
            depositType: '活期',
            currency: 'HKD',
            amount: 600000,
            exchangeRate: 0.128,
            valueUSD: 76800
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return NextResponse.json([sampleRecord]);
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching net worth records:', error);
    console.error('Database connection error, returning sample data');
    
    // 如果数据库连接失败，返回示例数据
    const sampleRecord = {
      id: 1,
      date: '2024-12-01',
      totalValue: 1500000,
      onChainAssets: [
        {
          id: '1',
          walletAddress: '0x1234...abcd',
          remark: 'DeFi Yield Farm (Fallback)',
          positions: [
            { id: '1', token: 'USDC', valueUSD: 50000, apr: 8.5 },
            { id: '2', token: 'ETH', valueUSD: 100000, apr: 4.2 },
            { id: '3', token: 'WBTC', valueUSD: 75000, apr: 3.8 }
          ],
          totalValueUSD: 225000,
          yieldValueUSD: 225000,
          totalAPR: 5.8,
          dailyIncome: 35.62,
          monthlyIncome: 1068.6,
          yearlyIncome: 13040.0
        }
      ],
      cexAssets: [
        { id: '1', exchange: 'binance', totalValueUSD: 400000 }
      ],
      bankAssets: [
        {
          id: '1',
          institution: '农业银行',
          depositType: '定期',
          currency: 'CNY',
          amount: 2000000,
          exchangeRate: 0.14,
          valueUSD: 280000
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json([sampleRecord]);
  }
}

// POST - 创建新的净资产记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, totalValue, onChainAssets, cexAssets, bankAssets } = body;

    if (!date || totalValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRecord = await db
      .insert(netWorthRecords)
      .values({
        userId: null, // 不再需要用户ID
        date,
        totalValue,
        onChainAssets,
        cexAssets,
        bankAssets,
      })
      .returning();

    return NextResponse.json(newRecord[0]);
  } catch (error) {
    console.error('Error creating net worth record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 