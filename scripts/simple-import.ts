import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { netWorthRecords } from '../lib/schema';

// 数据库连接
const connectionString = 'postgres://neondb_owner:npg_fp6QFIUbgSx9@ep-twilight-bonus-a1qwiq71-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);
const db = drizzle(sql);

// 根据networth.txt手动整理的历史数据
const historicalData = [
  {
    date: '2024-03-29',
    totalValue: 2126376.78,
    // 简化的资产结构，主要用于历史记录展示
    onChainAssets: [
      { id: '1', walletAddress: '0x...', remark: 'Minner1EVM', positions: [{ id: '1', token: 'USDC', valueUSD: 14.14, apr: 0 }], totalValueUSD: 14.14, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '2', walletAddress: '0x...', remark: 'Minner2', positions: [{ id: '2', token: 'USDC', valueUSD: 15724, apr: 0 }], totalValueUSD: 15724, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '3', walletAddress: '0x...', remark: 'Minner3', positions: [{ id: '3', token: 'USDC', valueUSD: 1089544, apr: 0 }], totalValueUSD: 1089544, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 51465 },
      { id: '2', exchange: 'binance', totalValueUSD: 666219 }
    ],
    bankAssets: [
      { id: '1', institution: 'za bank', depositType: '活期', currency: 'USD', amount: 124813, exchangeRate: 1, valueUSD: 124813 },
      { id: '2', institution: '农业银行', depositType: '活期', currency: 'CNY', amount: 405128, exchangeRate: 0.138, valueUSD: 55907.66 },
      { id: '3', institution: '民生银行', depositType: '活期', currency: 'CNY', amount: 127153, exchangeRate: 0.138, valueUSD: 17547.11 },
      { id: '4', institution: 'bkk bank', depositType: '活期', currency: 'THB', amount: 2318990, exchangeRate: 0.028, valueUSD: 64931.72 },
      { id: '5', institution: 'hsbc hk', depositType: '活期', currency: 'JPY', amount: 4015092, exchangeRate: 0.0069, valueUSD: 27704.13 },
      { id: '6', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 1086064.68, exchangeRate: 0.128, valueUSD: 139016.28 }
    ]
  },
  {
    date: '2024-05-16',
    totalValue: 2257664.73,
    onChainAssets: [
      { id: '1', walletAddress: '0x...', remark: 'Minner1EVM', positions: [{ id: '1', token: 'USDC', valueUSD: 14, apr: 0 }], totalValueUSD: 14, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '2', walletAddress: '0x...', remark: 'Minner1SOL', positions: [{ id: '2', token: 'USDC', valueUSD: 3665, apr: 0 }], totalValueUSD: 3665, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '3', walletAddress: '0x...', remark: 'Minner2', positions: [{ id: '3', token: 'USDC', valueUSD: 11787, apr: 0 }], totalValueUSD: 11787, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '4', walletAddress: '0x...', remark: 'Minner3', positions: [{ id: '4', token: 'USDC', valueUSD: 1095845, apr: 0 }], totalValueUSD: 1095845, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 491 },
      { id: '2', exchange: 'binance', totalValueUSD: 733127 }
    ],
    bankAssets: [
      { id: '1', institution: 'za bank', depositType: '活期', currency: 'USD', amount: 124813, exchangeRate: 1, valueUSD: 124813 },
      { id: '2', institution: '农业银行', depositType: '活期', currency: 'CNY', amount: 404573, exchangeRate: 0.138, valueUSD: 55831.07 },
      { id: '3', institution: '民生银行', depositType: '活期', currency: 'CNY', amount: 127153, exchangeRate: 0.138, valueUSD: 17547.11 },
      { id: '4', institution: 'bkk bank', depositType: '活期', currency: 'THB', amount: 2315352, exchangeRate: 0.028, valueUSD: 64829.86 },
      { id: '5', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 229371, exchangeRate: 0.128, valueUSD: 29359.49 },
      { id: '6', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 1062033.68, exchangeRate: 0.128, valueUSD: 135940.31 }
    ]
  },
  {
    date: '2024-06-14',
    totalValue: 2277743.775,
    onChainAssets: [
      { id: '1', walletAddress: '0x...', remark: 'Minner1EVM', positions: [{ id: '1', token: 'USDC', valueUSD: 14.74, apr: 0 }], totalValueUSD: 14.74, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '2', walletAddress: '0x...', remark: 'Minner1SOL', positions: [{ id: '2', token: 'USDC', valueUSD: 3719.7, apr: 0 }], totalValueUSD: 3719.7, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '3', walletAddress: '0x...', remark: 'Minner2', positions: [{ id: '3', token: 'USDC', valueUSD: 502734, apr: 0 }], totalValueUSD: 502734, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '4', walletAddress: '0x...', remark: 'Minner3', positions: [{ id: '4', token: 'USDC', valueUSD: 609872, apr: 0 }], totalValueUSD: 609872, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '5', walletAddress: '0x...', remark: 'OnekeyPro', positions: [{ id: '5', token: 'USDC', valueUSD: 347178, apr: 0 }], totalValueUSD: 347178, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 1205.73 },
      { id: '2', exchange: 'binance', totalValueUSD: 350236.19 },
      { id: '3', exchange: 'bitget', totalValueUSD: 42040 }
    ],
    bankAssets: [
      { id: '1', institution: 'za bank', depositType: '活期', currency: 'USD', amount: 124813, exchangeRate: 1, valueUSD: 124813 },
      { id: '2', institution: '农业银行', depositType: '活期', currency: 'CNY', amount: 402339, exchangeRate: 0.138, valueUSD: 55522.78 },
      { id: '3', institution: '民生银行', depositType: '活期', currency: 'CNY', amount: 127167, exchangeRate: 0.138, valueUSD: 17549.05 },
      { id: '4', institution: 'bkk bank', depositType: '活期', currency: 'THB', amount: 2316880, exchangeRate: 0.028, valueUSD: 64872.64 },
      { id: '5', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 231528.29, exchangeRate: 0.128, valueUSD: 29635.62 },
      { id: '6', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 1061763.03, exchangeRate: 0.128, valueUSD: 135905.67 }
    ]
  },
  {
    date: '2024-07-05',
    totalValue: 2289792.309,
    onChainAssets: [
      { id: '1', walletAddress: '0x...', remark: 'Minner1EVM', positions: [{ id: '1', token: 'USDC', valueUSD: 16.55, apr: 0 }], totalValueUSD: 16.55, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '2', walletAddress: '0x...', remark: 'Minner1SOL', positions: [{ id: '2', token: 'USDC', valueUSD: 3924, apr: 0 }], totalValueUSD: 3924, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '3', walletAddress: '0x...', remark: 'Minner2', positions: [{ id: '3', token: 'USDC', valueUSD: 206091.4, apr: 0 }], totalValueUSD: 206091.4, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '4', walletAddress: '0x...', remark: 'Minner3', positions: [{ id: '4', token: 'USDC', valueUSD: 610687, apr: 0 }], totalValueUSD: 610687, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '5', walletAddress: '0x...', remark: 'OnekeyPro', positions: [{ id: '5', token: 'USDC', valueUSD: 348041, apr: 0 }], totalValueUSD: 348041, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 11194 },
      { id: '2', exchange: 'binance', totalValueUSD: 558956 },
      { id: '3', exchange: 'bitget', totalValueUSD: 124750 }
    ],
    bankAssets: [
      { id: '1', institution: 'za bank', depositType: '活期', currency: 'USD', amount: 124813, exchangeRate: 1, valueUSD: 124813 },
      { id: '2', institution: '农业银行', depositType: '活期', currency: 'CNY', amount: 401832, exchangeRate: 0.138, valueUSD: 55452.82 },
      { id: '3', institution: '民生银行', depositType: '活期', currency: 'CNY', amount: 127167, exchangeRate: 0.138, valueUSD: 17549.05 },
      { id: '4', institution: 'bkk bank', depositType: '活期', currency: 'THB', amount: 2316880, exchangeRate: 0.028, valueUSD: 64872.64 },
      { id: '5', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 231453.29, exchangeRate: 0.128, valueUSD: 29626.02 },
      { id: '6', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 1060429.68, exchangeRate: 0.128, valueUSD: 135735.00 }
    ]
  },
  {
    date: '2024-07-17',
    totalValue: 2296201.901,
    onChainAssets: [
      { id: '1', walletAddress: '0x...', remark: 'Minner1EVM', positions: [{ id: '1', token: 'USDC', valueUSD: 16.55, apr: 0 }], totalValueUSD: 16.55, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '2', walletAddress: '0x...', remark: 'Minner1SOL', positions: [{ id: '2', token: 'USDC', valueUSD: 3924, apr: 0 }], totalValueUSD: 3924, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '3', walletAddress: '0x...', remark: 'Minner2', positions: [{ id: '3', token: 'USDC', valueUSD: 206091.4, apr: 0 }], totalValueUSD: 206091.4, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '4', walletAddress: '0x...', remark: 'Minner3', positions: [{ id: '4', token: 'USDC', valueUSD: 610687, apr: 0 }], totalValueUSD: 610687, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 },
      { id: '5', walletAddress: '0x...', remark: 'OnekeyPro', positions: [{ id: '5', token: 'USDC', valueUSD: 348041, apr: 0 }], totalValueUSD: 348041, yieldValueUSD: 0, totalAPR: 0, dailyIncome: 0, monthlyIncome: 0, yearlyIncome: 0 }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 11194 },
      { id: '2', exchange: 'binance', totalValueUSD: 558956 },
      { id: '3', exchange: 'bitget', totalValueUSD: 124750 }
    ],
    bankAssets: [
      { id: '1', institution: 'za bank', depositType: '活期', currency: 'USD', amount: 124813, exchangeRate: 1, valueUSD: 124813 },
      { id: '2', institution: '农业银行', depositType: '活期', currency: 'CNY', amount: 401832, exchangeRate: 0.138, valueUSD: 55452.82 },
      { id: '3', institution: '民生银行', depositType: '活期', currency: 'CNY', amount: 127167, exchangeRate: 0.138, valueUSD: 17549.05 },
      { id: '4', institution: 'bkk bank', depositType: '活期', currency: 'THB', amount: 2316880, exchangeRate: 0.028, valueUSD: 64872.64 },
      { id: '5', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 231453.29, exchangeRate: 0.128, valueUSD: 29626.02 },
      { id: '6', institution: 'hsbc hk', depositType: '活期', currency: 'HKD', amount: 1060429.68, exchangeRate: 0.128, valueUSD: 135735.00 }
    ]
  }
];

async function importHistoricalData() {
  try {
    console.log('开始导入networth.txt历史数据到Vercel数据库...');
    
    for (const record of historicalData) {
      console.log(`导入 ${record.date} 的数据，总价值: $${record.totalValue.toLocaleString()}`);
      
      await db.insert(netWorthRecords).values({
        userId: null, // 不关联用户
        date: record.date,
        totalValue: record.totalValue.toString(),
        onChainAssets: record.onChainAssets,
        cexAssets: record.cexAssets,
        bankAssets: record.bankAssets
      });
      
      console.log(`✅ ${record.date} 数据导入成功`);
    }
    
    console.log('🎉 所有历史数据导入完成！');
    console.log(`总共导入了 ${historicalData.length} 条记录`);
  } catch (error) {
    console.error('❌ 数据导入失败:', error);
  }
}

// 运行导入
importHistoricalData();