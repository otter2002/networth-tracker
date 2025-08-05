import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';

// 初始示例数据
const initialData = [
  {
    date: '2024-11-01',
    totalValue: 1200000,
    onChainAssets: [
      {
        id: '1',
        walletAddress: '0x1234...abcd',
        remark: 'DeFi Yield Farm',
        positions: [
          { id: '1', token: 'USDC', valueUSD: 40000, apr: 8.5 },
          { id: '2', token: 'ETH', valueUSD: 80000, apr: 4.2 },
          { id: '3', token: 'WBTC', valueUSD: 60000, apr: 3.8 }
        ],
        totalValueUSD: 180000,
        yieldValueUSD: 180000,
        totalAPR: 5.5,
        dailyIncome: 27.1,
        monthlyIncome: 813.0,
        yearlyIncome: 9900.0
      }
    ],
    cexAssets: [
      { id: '1', exchange: 'binance', totalValueUSD: 350000 },
      { id: '2', exchange: 'okx', totalValueUSD: 250000 }
    ],
    bankAssets: [
      {
        id: '1',
        institution: '农业银行',
        depositType: '定期',
        currency: 'CNY',
        amount: 1800000,
        exchangeRate: 0.14,
        valueUSD: 252000
      },
      {
        id: '2',
        institution: 'hsbc hk',
        depositType: '活期',
        currency: 'HKD',
        amount: 520000,
        exchangeRate: 0.128,
        valueUSD: 66560
      }
    ]
  },
  {
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
    ]
  },
  {
    date: '2025-01-01',
    totalValue: 1650000,
    onChainAssets: [
      {
        id: '1',
        walletAddress: '0x1234...abcd',
        remark: 'DeFi Yield Farm',
        positions: [
          { id: '1', token: 'USDC', valueUSD: 55000, apr: 9.2 },
          { id: '2', token: 'ETH', valueUSD: 110000, apr: 4.8 },
          { id: '3', token: 'WBTC', valueUSD: 85000, apr: 4.1 }
        ],
        totalValueUSD: 250000,
        yieldValueUSD: 250000,
        totalAPR: 6.2,
        dailyIncome: 42.47,
        monthlyIncome: 1274.1,
        yearlyIncome: 15500.0
      },
      {
        id: '2',
        walletAddress: '0x5678...efgh',
        remark: 'Staking Rewards',
        positions: [
          { id: '4', token: 'SOL', valueUSD: 90000, apr: 7.1 },
          { id: '5', token: 'ATOM', valueUSD: 45000, apr: 13.2 }
        ],
        totalValueUSD: 135000,
        yieldValueUSD: 135000,
        totalAPR: 9.5,
        dailyIncome: 35.14,
        monthlyIncome: 1054.2,
        yearlyIncome: 12825.0
      }
    ],
    cexAssets: [
      { id: '1', exchange: 'binance', totalValueUSD: 450000 },
      { id: '2', exchange: 'okx', totalValueUSD: 320000 }
    ],
    bankAssets: [
      {
        id: '1',
        institution: '农业银行',
        depositType: '定期',
        currency: 'CNY',
        amount: 2200000,
        exchangeRate: 0.14,
        valueUSD: 308000
      },
      {
        id: '2',
        institution: 'hsbc hk',
        depositType: '活期',
        currency: 'HKD',
        amount: 650000,
        exchangeRate: 0.128,
        valueUSD: 83200
      }
    ]
  }
];

// GET - 初始化数据库
export async function GET() {
  try {
    // 检查是否已经有数据
    const existingRecords = await db
      .select()
      .from(netWorthRecords)
      .limit(1);

    if (existingRecords.length > 0) {
      return NextResponse.json({ 
        message: 'Database already has data. Migration skipped.',
        count: existingRecords.length 
      });
    }

    // 插入初始数据
    const insertedRecords = [];
    for (const record of initialData) {
      const result = await db
        .insert(netWorthRecords)
        .values({
          userId: null,
          date: record.date,
          totalValue: record.totalValue.toString(),
          onChainAssets: record.onChainAssets,
          cexAssets: record.cexAssets,
          bankAssets: record.bankAssets,
        })
        .returning();
      
      insertedRecords.push(result[0]);
    }

    return NextResponse.json({ 
      message: 'Initial data migration completed successfully!',
      count: insertedRecords.length,
      records: insertedRecords
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - 从客户端迁移数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid records data' }, { status: 400 });
    }

    const migratedRecords = [];

    for (const record of records) {
      try {
        // 转换旧格式到新格式
        const newRecord = {
          userId: null, // 不再需要用户ID
          date: record.date,
          totalValue: record.totalValue || 0,
          onChainAssets: record.onChainAssets || [],
          cexAssets: record.cexAssets || [],
          bankAssets: record.bankAssets || [],
        };

        const insertedRecord = await db
          .insert(netWorthRecords)
          .values(newRecord)
          .returning();

        migratedRecords.push(insertedRecord[0]);
      } catch (error) {
        console.error('Error migrating record:', record, error);
        // 继续迁移其他记录
      }
    }

    return NextResponse.json({
      message: `Successfully migrated ${migratedRecords.length} records`,
      migratedCount: migratedRecords.length,
      records: migratedRecords
    });
  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
} 