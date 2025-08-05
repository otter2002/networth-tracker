import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { netWorthRecords } from '../lib/schema';
import { NetWorthRecord, OnChainAsset, CEXAsset, BankAsset } from '../types';

// 数据库连接
const connectionString = 'postgres://neondb_owner:npg_fp6QFIUbgSx9@ep-twilight-bonus-a1qwiq71-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);
const db = drizzle(sql);

// 解析networth.txt数据
const networthData = [
  {
    date: '2024-03-29',
    totalValue: 2126376.78,
    data: {
      // 链上资产
      onChain: {
        'minner1evm': 14.14,
        'minner1 sol': 0, // 没有数据
        'minner2': 15724,
        'minner3': 1089544
      },
      // 交易所资产
      cex: {
        'okx': 51465,
        'binance': 666219
      },
      // 银行资产
      bank: {
        'za bank': { currency: 'USD', amount: 124813 },
        '农行': { currency: 'CNY', amount: 405128 },
        '民生': { currency: 'CNY', amount: 127153 },
        '曼谷': { currency: 'THB', amount: 2318990 },
        'hsbc': { currency: 'JPY', amount: 4015092 },
        'hsbc_hkd': { currency: 'HKD', amount: 1086064.68 }
      }
    }
  },
  {
    date: '2024-05-16',
    totalValue: 2257664.73,
    data: {
      onChain: {
        'minner1evm': 14,
        'minner1 sol': 3665,
        'minner2': 11787,
        'minner3': 1095845
      },
      cex: {
        'okx': 491,
        'binance': 733127
      },
      bank: {
        'za bank': { currency: 'USD', amount: 124813 },
        '农行': { currency: 'CNY', amount: 404573 },
        '民生': { currency: 'CNY', amount: 127153 },
        '曼谷': { currency: 'THB', amount: 2315352 },
        'hsbc': { currency: 'HKD', amount: 229371 },
        'hsbc_hkd': { currency: 'HKD', amount: 1062033.68 }
      }
    }
  },
  {
    date: '2024-06-14',
    totalValue: 2277743.775,
    data: {
      onChain: {
        'minner1evm': 14.74,
        'minner1 sol': 3719.7,
        'minner2': 502734,
        'minner3': 609872,
        'onekey pro': 347178
      },
      cex: {
        'okx': 1205.73,
        'binance': 350236.19,
        'bitget': 42040
      },
      bank: {
        'za bank': { currency: 'USD', amount: 124813 },
        '农行': { currency: 'CNY', amount: 402339 },
        '民生': { currency: 'CNY', amount: 127167 },
        '曼谷': { currency: 'THB', amount: 2316880 },
        'hsbc': { currency: 'HKD', amount: 231528.29 },
        'hsbc_hkd': { currency: 'HKD', amount: 1061763.03 }
      }
    }
  },
  {
    date: '2024-07-05',
    totalValue: 2289792.309,
    data: {
      onChain: {
        'minner1evm': 16.55,
        'minner1 sol': 3924,
        'minner2': 206091.4,
        'minner3': 610687,
        'onekey pro': 348041
      },
      cex: {
        'okx': 11194,
        'binance': 558956,
        'bitget': 124750
      },
      bank: {
        'za bank': { currency: 'USD', amount: 124813 },
        '农行': { currency: 'CNY', amount: 401832 },
        '民生': { currency: 'CNY', amount: 127167 },
        '曼谷': { currency: 'THB', amount: 2316880 },
        'hsbc': { currency: 'HKD', amount: 231453.29 },
        'hsbc_hkd': { currency: 'HKD', amount: 1060429.68 }
      }
    }
  },
  {
    date: '2024-07-17',
    totalValue: 2296201.901,
    data: {
      onChain: {
        'minner1evm': 16.55,
        'minner1 sol': 3924,
        'minner2': 206091.4,
        'minner3': 610687,
        'onekey pro': 348041
      },
      cex: {
        'okx': 11194,
        'binance': 558956,
        'bitget': 124750
      },
      bank: {
        'za bank': { currency: 'USD', amount: 124813 },
        '农行': { currency: 'CNY', amount: 401832 },
        '民生': { currency: 'CNY', amount: 127167 },
        '曼谷': { currency: 'THB', amount: 2316880 },
        'hsbc': { currency: 'HKD', amount: 231453.29 },
        'hsbc_hkd': { currency: 'HKD', amount: 1060429.68 }
      }
    }
  }
];

// 汇率映射
const exchangeRates = {
  'USD': 1,
  'CNY': 0.138,
  'THB': 0.0285,
  'HKD': 0.128,
  'JPY': 0.0069
};

// 机构名称映射
const institutionMap: { [key: string]: BankAsset['institution'] } = {
  'za bank': 'za bank',
  '农行': '农业银行',
  '民生': '民生银行',
  '曼谷': 'bkk bank',
  'hsbc': 'hsbc hk',
  'hsbc_hkd': 'hsbc hk'
};

// 交易所名称映射
const exchangeMap: { [key: string]: CEXAsset['exchange'] } = {
  'okx': 'okx',
  'binance': 'binance',
  'bitget': 'bitget'
};

function convertToNetWorthRecord(item: any): Omit<NetWorthRecord, 'id'> {
  // 转换链上资产
  const onChainAssets: OnChainAsset[] = Object.entries(item.data.onChain)
    .filter(([_, value]) => (value as number) > 0)
    .map(([name, value], index) => ({
      id: `onchain_${index + 1}`,
      walletAddress: '0x...',
      remark: name,
      positions: [{
        id: `pos_${index + 1}`,
        token: 'USDC',
        valueUSD: value as number,
        apr: 0 // 不填写APR
      }],
      totalValueUSD: value as number,
      yieldValueUSD: 0,
      totalAPR: 0,
      dailyIncome: 0,
      monthlyIncome: 0,
      yearlyIncome: 0
    }));

  // 转换交易所资产
  const cexAssets: CEXAsset[] = Object.entries(item.data.cex)
    .map(([name, value], index) => ({
      id: `cex_${index + 1}`,
      exchange: exchangeMap[name] || 'binance',
      totalValueUSD: value as number
    }));

  // 转换银行资产
  const bankAssets: BankAsset[] = Object.entries(item.data.bank)
    .map(([name, data], index) => {
      const bankData = data as { currency: string; amount: number };
      const exchangeRate = exchangeRates[bankData.currency as keyof typeof exchangeRates] || 1;
      return {
        id: `bank_${index + 1}`,
        institution: institutionMap[name] || 'za bank',
        depositType: '活期' as const,
        currency: bankData.currency as BankAsset['currency'],
        amount: bankData.amount,
        exchangeRate: exchangeRate,
        valueUSD: bankData.amount * exchangeRate
      };
    });

  return {
    date: item.date,
    totalValue: item.totalValue,
    onChainAssets,
    cexAssets,
    bankAssets
  };
}

async function importData() {
  try {
    console.log('开始导入数据到Vercel数据库...');
    
    for (const item of networthData) {
      const record = convertToNetWorthRecord(item);
      
      console.log(`导入 ${record.date} 的数据...`);
      
      await db.insert(netWorthRecords).values({
        userId: null, // 暂时不关联用户
        date: record.date,
        totalValue: record.totalValue.toString(),
        onChainAssets: JSON.stringify(record.onChainAssets),
        cexAssets: JSON.stringify(record.cexAssets),
        bankAssets: JSON.stringify(record.bankAssets)
      });
      
      console.log(`✅ ${record.date} 数据导入成功`);
    }
    
    console.log('🎉 所有数据导入完成！');
  } catch (error) {
    console.error('❌ 数据导入失败:', error);
  }
}

// 运行导入
if (require.main === module) {
  importData();
}

export { importData };