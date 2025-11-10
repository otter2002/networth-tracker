import { NetWorthRecord, OnChainAsset, CEXAsset, BankAsset, YieldCalculation } from '@/types';

// 模拟本地存储
let netWorthData: NetWorthRecord[] = [];

// 计算单个钱包的收益
export function calculateWalletYield(asset: OnChainAsset): OnChainAsset {
  let yieldValue = 0; // 生息仓位总价值
  let totalDailyIncome = 0;
  let totalYearlyIncome = 0;
  let totalAPR = 0;

  if (asset.positions && asset.positions.length > 0) {
    asset.positions.forEach(position => {
      // 只有APR > 0的仓位才计算收益
      if (position.apr > 0) {
        yieldValue += position.valueUSD;
        const dailyIncome = (position.valueUSD * position.apr) / 365 / 100;
        const yearlyIncome = position.valueUSD * position.apr / 100;
        totalDailyIncome += dailyIncome;
        totalYearlyIncome += yearlyIncome;
      }
    });
    
    // APR基于生息仓位计算
    totalAPR = yieldValue > 0 ? (totalYearlyIncome / yieldValue) * 100 : 0;
  }

  return {
    ...asset,
    // 保持手动编辑的总价值不变
    totalValueUSD: asset.totalValueUSD,
    yieldValueUSD: yieldValue,
    totalAPR,
    dailyIncome: totalDailyIncome,
    monthlyIncome: totalDailyIncome * 30,
    yearlyIncome: totalYearlyIncome
  };
}

// 计算总收益
export function calculateYield(record: NetWorthRecord): YieldCalculation {
  let totalValue = 0;
  let totalDailyYield = 0;
  let totalAnnualYield = 0;

  // 计算链上资产收益
  if (record.onChainAssets && record.onChainAssets.length > 0) {
    record.onChainAssets.forEach(asset => {
      const calculatedAsset = calculateWalletYield(asset);
      totalValue += calculatedAsset.totalValueUSD;
      totalDailyYield += calculatedAsset.dailyIncome;
      totalAnnualYield += calculatedAsset.yearlyIncome;
    });
  }

  // 计算交易所资产收益
  if (record.cexAssets && record.cexAssets.length > 0) {
    record.cexAssets.forEach(asset => {
      totalValue += asset.totalValueUSD;
      // 如果有APR，计算收益
      if (asset.apr && asset.apr > 0) {
        const dailyIncome = (asset.totalValueUSD * asset.apr) / 365 / 100;
        const yearlyIncome = asset.totalValueUSD * asset.apr / 100;
        totalDailyYield += dailyIncome;
        totalAnnualYield += yearlyIncome;
      }
    });
  }

  // 计算银行资产
  if (record.bankAssets && record.bankAssets.length > 0) {
    record.bankAssets.forEach(asset => {
      totalValue += asset.valueUSD;
    });
  }

  const totalAPR = totalValue > 0 ? (totalAnnualYield / totalValue) * 100 : 0;
  const projectedAnnualYield = totalDailyYield * 365;
  const monthlyYield = totalDailyYield * 30;

  return {
    dailyYield: totalDailyYield,
    monthlyYield,
    annualYield: totalAnnualYield,
    projectedAnnualYield,
    totalAPR
  };
}

// 获取所有净资产记录
export function getAllNetWorthRecords(): NetWorthRecord[] {
  return netWorthData;
}

// 添加新的净资产记录
export function addNetWorthRecord(record: Omit<NetWorthRecord, 'id'>): NetWorthRecord {
  const newRecord: NetWorthRecord = {
    ...record,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  
  netWorthData.push(newRecord);
  netWorthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 保存到localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('netWorthData', JSON.stringify(netWorthData));
  }
  
  return newRecord;
}

// 删除净资产记录
export function deleteNetWorthRecord(id: string): boolean {
  const initialLength = netWorthData.length;
  netWorthData = netWorthData.filter(record => record.id !== id);
  
  if (netWorthData.length !== initialLength) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('netWorthData', JSON.stringify(netWorthData));
    }
    return true;
  }
  
  return false;
}

// 初始数据 - 基于您的networth.txt转换
const initialData: NetWorthRecord[] = [
  {
    id: '1',
    date: '2024-03-29',
    totalValue: 2126376.78,
    onChainAssets: [
      {
        id: '1',
        walletAddress: '0x...',
        remark: 'Minner1EVM',
        positions: [
          { id: '1', token: 'USDC', valueUSD: 14.14, apr: 0 }
        ],
        totalValueUSD: 14.14,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '2',
        walletAddress: '0x...',
        remark: 'Minner2',
        positions: [
          { id: '2', token: 'USDC', valueUSD: 15724, apr: 0 }
        ],
        totalValueUSD: 15724,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '3',
        walletAddress: '0x...',
        remark: 'Minner3',
        positions: [
          { id: '3', token: 'USDC', valueUSD: 1089544, apr: 0 }
        ],
        totalValueUSD: 1089544,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 51465 },
      { id: '2', exchange: 'binance', totalValueUSD: 666219 }
    ],
    bankAssets: [
      {
        id: '1',
        institution: '农业银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 405128,
        exchangeRate: 0.138,
        valueUSD: 55907.66
      },
      {
        id: '2',
        institution: '民生银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 127153,
        exchangeRate: 0.138,
        valueUSD: 17547.11
      },
      {
        id: '3',
        institution: 'bkk bank',
        depositType: '活期',
        currency: 'THB',
        amount: 2318990,
        exchangeRate: 0.028,
        valueUSD: 64931.72
      }
    ]
  },
  {
    id: '2',
    date: '2024-05-16',
    totalValue: 2257664.73,
    onChainAssets: [
      {
        id: '1',
        walletAddress: '0x...',
        remark: 'Minner1EVM',
        positions: [
          { id: '1', token: 'USDC', valueUSD: 14, apr: 0 }
        ],
        totalValueUSD: 14,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '2',
        walletAddress: '0x...',
        remark: 'Minner1SOL',
        positions: [
          { id: '2', token: 'USDC', valueUSD: 3665, apr: 0 }
        ],
        totalValueUSD: 3665,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '3',
        walletAddress: '0x...',
        remark: 'Minner2',
        positions: [
          { id: '3', token: 'USDC', valueUSD: 11787, apr: 0 }
        ],
        totalValueUSD: 11787,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '4',
        walletAddress: '0x...',
        remark: 'Minner3',
        positions: [
          { id: '4', token: 'USDC', valueUSD: 1095845, apr: 0 }
        ],
        totalValueUSD: 1095845,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 491 },
      { id: '2', exchange: 'binance', totalValueUSD: 733127 }
    ],
    bankAssets: [
      {
        id: '1',
        institution: '农业银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 404573,
        exchangeRate: 0.138,
        valueUSD: 55831.07
      },
      {
        id: '2',
        institution: '民生银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 127153,
        exchangeRate: 0.138,
        valueUSD: 17547.11
      },
      {
        id: '3',
        institution: 'bkk bank',
        depositType: '活期',
        currency: 'THB',
        amount: 2315352,
        exchangeRate: 0.028,
        valueUSD: 64829.86
      }
    ]
  },
  {
    id: '3',
    date: '2024-06-14',
    totalValue: 2277743.775,
    onChainAssets: [
      {
        id: '1',
        walletAddress: '0x...',
        remark: 'Minner1EVM',
        positions: [
          { id: '1', token: 'USDC', valueUSD: 14.74, apr: 0 }
        ],
        totalValueUSD: 14.74,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '2',
        walletAddress: '0x...',
        remark: 'Minner1SOL',
        positions: [
          { id: '2', token: 'USDC', valueUSD: 3719.7, apr: 0 }
        ],
        totalValueUSD: 3719.7,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '3',
        walletAddress: '0x...',
        remark: 'Minner2',
        positions: [
          { id: '3', token: 'USDC', valueUSD: 502734, apr: 0 }
        ],
        totalValueUSD: 502734,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '4',
        walletAddress: '0x...',
        remark: 'Minner3',
        positions: [
          { id: '4', token: 'USDC', valueUSD: 609872, apr: 0 }
        ],
        totalValueUSD: 609872,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 1205.73 },
      { id: '2', exchange: 'binance', totalValueUSD: 350236.19 },
      { id: '3', exchange: 'bitget', totalValueUSD: 42040 }
    ],
    bankAssets: [
      {
        id: '1',
        institution: '农业银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 402339,
        exchangeRate: 0.138,
        valueUSD: 55522.78
      },
      {
        id: '2',
        institution: '民生银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 127167,
        exchangeRate: 0.138,
        valueUSD: 17548.85
      },
      {
        id: '3',
        institution: 'bkk bank',
        depositType: '活期',
        currency: 'THB',
        amount: 2316880,
        exchangeRate: 0.028,
        valueUSD: 64872.64
      }
    ]
  },
  {
    id: '4',
    date: '2024-07-05',
    totalValue: 2289792.309,
    onChainAssets: [
      {
        id: '1',
        walletAddress: '0x...',
        remark: 'Minner1EVM',
        positions: [
          { id: '1', token: 'USDC', valueUSD: 16.55, apr: 0 }
        ],
        totalValueUSD: 16.55,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '2',
        walletAddress: '0x...',
        remark: 'Minner1SOL',
        positions: [
          { id: '2', token: 'USDC', valueUSD: 3924, apr: 0 }
        ],
        totalValueUSD: 3924,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '3',
        walletAddress: '0x...',
        remark: 'Minner2',
        positions: [
          { id: '3', token: 'USDC', valueUSD: 206091.4, apr: 0 }
        ],
        totalValueUSD: 206091.4,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '4',
        walletAddress: '0x...',
        remark: 'Minner3',
        positions: [
          { id: '4', token: 'USDC', valueUSD: 610687, apr: 0 }
        ],
        totalValueUSD: 610687,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 11194 },
      { id: '2', exchange: 'binance', totalValueUSD: 558956 },
      { id: '3', exchange: 'bitget', totalValueUSD: 124750 }
    ],
    bankAssets: [
      {
        id: '1',
        institution: '农业银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 401832,
        exchangeRate: 0.138,
        valueUSD: 55452.82
      },
      {
        id: '2',
        institution: '民生银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 127167,
        exchangeRate: 0.138,
        valueUSD: 17549.05
      },
      {
        id: '3',
        institution: 'bkk bank',
        depositType: '活期',
        currency: 'THB',
        amount: 2316880,
        exchangeRate: 0.028,
        valueUSD: 64872.64
      }
    ]
  },
  {
    id: '5',
    date: '2024-07-17',
    totalValue: 2296201.901,
    onChainAssets: [
      {
        id: '1',
        walletAddress: '0x...',
        remark: 'Minner1EVM',
        positions: [
          { id: '1', token: 'USDC', valueUSD: 16.55, apr: 0 }
        ],
        totalValueUSD: 16.55,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '2',
        walletAddress: '0x...',
        remark: 'Minner1SOL',
        positions: [
          { id: '2', token: 'USDC', valueUSD: 3924, apr: 0 }
        ],
        totalValueUSD: 3924,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '3',
        walletAddress: '0x...',
        remark: 'Minner2',
        positions: [
          { id: '3', token: 'USDC', valueUSD: 206091.4, apr: 0 }
        ],
        totalValueUSD: 206091.4,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      },
      {
        id: '4',
        walletAddress: '0x...',
        remark: 'Minner3',
        positions: [
          { id: '4', token: 'USDC', valueUSD: 610687, apr: 0 }
        ],
        totalValueUSD: 610687,
        yieldValueUSD: 0,
        totalAPR: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0
      }
    ],
    cexAssets: [
      { id: '1', exchange: 'okx', totalValueUSD: 11194 },
      { id: '2', exchange: 'binance', totalValueUSD: 558956 },
      { id: '3', exchange: 'bitget', totalValueUSD: 124750 }
    ],
    bankAssets: [
      {
        id: '1',
        institution: '农业银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 401832,
        exchangeRate: 0.138,
        valueUSD: 55452.82
      },
      {
        id: '2',
        institution: '民生银行',
        depositType: '活期',
        currency: 'CNY',
        amount: 127167,
        exchangeRate: 0.138,
        valueUSD: 17549.05
      },
      {
        id: '3',
        institution: 'bkk bank',
        depositType: '活期',
        currency: 'THB',
        amount: 2316880,
        exchangeRate: 0.028,
        valueUSD: 64872.64
      }
    ]
  }
];

// 迁移旧的银行资产数据格式
function migrateBankAssets(record: any): any {
  if (record.bankAssets && Array.isArray(record.bankAssets)) {
    record.bankAssets = record.bankAssets.map((asset: any) => {
      // 如果是旧格式，转换为新格式
      if (asset.fiatCurrencies && !asset.currency) {
        const currency = Object.keys(asset.fiatCurrencies)[0];
        const amount = asset.fiatCurrencies[currency];
        const exchangeRate = getExchangeRate(currency);
        return {
          id: asset.id,
          institution: asset.institution === '农行' ? '农业银行' : 
                     asset.institution === '民生' ? '民生银行' : 
                     asset.institution === '曼谷' ? 'bkk bank' : asset.institution,
          depositType: '活期',
          currency: currency as any,
          amount: amount,
          exchangeRate: exchangeRate,
          valueUSD: amount * exchangeRate
        };
      }
      // 如果已经是新格式，确保有必要的字段
      return {
        ...asset,
        valueUSD: asset.valueUSD || 0,
        amount: asset.amount || 0,
        exchangeRate: asset.exchangeRate || 1
      };
    });
  }
  return record;
}

// 初始化数据
export function initializeData(): void {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('netWorthData');
    if (savedData) {
      netWorthData = JSON.parse(savedData);
      // 迁移旧数据格式
      netWorthData = netWorthData.map(migrateBankAssets);
      
      // 检查是否需要导入历史数据
      const hasHistoricalData = netWorthData.some(record => 
        record.date === '2024-03-29' || 
        record.date === '2024-05-16' || 
        record.date === '2024-06-14' || 
        record.date === '2024-07-05' || 
        record.date === '2024-07-17'
      );
      
      if (!hasHistoricalData) {
        // 如果没有历史数据，则添加
        netWorthData = [...initialData, ...netWorthData];
        localStorage.setItem('netWorthData', JSON.stringify(netWorthData));
        console.log('已导入历史净资产数据');
      }
      
      localStorage.setItem('netWorthData', JSON.stringify(netWorthData));
    } else {
      // 如果没有现有数据，则导入初始数据
      netWorthData = initialData;
      localStorage.setItem('netWorthData', JSON.stringify(initialData));
      console.log('已导入初始净资产数据');
    }
    
    // 初始化时获取实时汇率
    fetchExchangeRates().then(() => {
      console.log('汇率数据初始化完成');
    }).catch(error => {
      console.error('汇率数据初始化失败:', error);
    });
  }
}

// 计算资产分布
export function calculateAssetBreakdown(record: NetWorthRecord) {
  const onChainTotal = (record.onChainAssets || []).reduce((sum, asset) => sum + asset.totalValueUSD, 0);
  const cexTotal = (record.cexAssets || []).reduce((sum, asset) => sum + asset.totalValueUSD, 0);
  const bankTotal = (record.bankAssets || []).reduce((sum, asset) => sum + asset.valueUSD, 0);

  return [
    { name: '链上资产', value: onChainTotal, percentage: (onChainTotal / record.totalValue) * 100 },
    { name: '交易所资产', value: cexTotal, percentage: (cexTotal / record.totalValue) * 100 },
    { name: '银行资产', value: bankTotal, percentage: (bankTotal / record.totalValue) * 100 }
  ].filter(item => item.value > 0);
}

// 计算交易所分布
export function calculateExchangeBreakdown(record: NetWorthRecord) {
  const exchangeMap = new Map<string, number>();
  
  if (record.cexAssets && record.cexAssets.length > 0) {
    record.cexAssets.forEach(asset => {
      const current = exchangeMap.get(asset.exchange) || 0;
      exchangeMap.set(asset.exchange, current + asset.totalValueUSD);
    });
  }

  return Array.from(exchangeMap.entries()).map(([exchange, value]) => ({
    name: exchange.toUpperCase(),
    value,
    percentage: (value / record.totalValue) * 100
  })).sort((a, b) => b.value - a.value);
}

// 汇率缓存
let exchangeRatesCache: { [key: string]: number } = {
  'USD': 1
};

// 汇率缓存时间戳
let exchangeRatesTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存

// 获取实时汇率
export async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  const now = Date.now();
  
  // 暂时禁用缓存以确保获取最新汇率
  // if (now - exchangeRatesTimestamp < CACHE_DURATION && Object.keys(exchangeRatesCache).length > 1) {
  //   return exchangeRatesCache;
  // }

  try {
    // 先尝试直接API
    let response = await fetch('/api/exchange-rates-direct');
    if (response.ok) {
      const rates = await response.json();
      console.log('从直接API获取的汇率数据:', rates);
      exchangeRatesCache = { ...rates, 'USD': 1 };
      exchangeRatesTimestamp = now;
      return exchangeRatesCache;
    }
    
    // 如果直接API失败，尝试原来的API
    response = await fetch('/api/exchange-rates');
    if (response.ok) {
      const rates = await response.json();
      console.log('从原API获取的汇率数据:', rates);
      exchangeRatesCache = { ...rates, 'USD': 1 };
      exchangeRatesTimestamp = now;
      return exchangeRatesCache;
    }
    
    // 如果API失败，使用可靠的汇率API作为备选
    const fallbackResponse = await fetch('https://api.exchangerate.host/latest?base=USD');
    const data = await fallbackResponse.json();
    
    if (data.rates) {
      // exchangerate.host返回的是以USD为基准的汇率，直接使用
      const rates: { [key: string]: number } = { 'USD': 1 };
    
      // 直接使用汇率数据，无需转换
      Object.entries(data.rates as Record<string, number>).forEach(([currency, rate]) => {
        if (rate && typeof rate === 'number') {
          rates[currency] = rate;
        }
      });
      
      exchangeRatesCache = rates;
      exchangeRatesTimestamp = now;
      
      console.log('汇率数据已更新:', rates);
      return rates;
    }
  } catch (error) {
    console.error('获取汇率失败:', error);
  }

  // 如果API调用失败，返回默认汇率（1 USD = X 外币）
  const defaultRates = {
    'USD': 1,
    'HKD': 7.8,    // 1 USD = 7.8 HKD
    'CNY': 7.3,    // 1 USD = 7.3 CNY  
    'THB': 35.0    // 1 USD = 35 THB
  };
  
  return defaultRates;
}

// 计算银行资产美元价值
export function calculateBankAssetValue(asset: BankAsset): number {
  return asset.amount * asset.exchangeRate;
}

// 获取汇率（同步版本，使用缓存）
export function getExchangeRate(currency: string): number {
  return exchangeRatesCache[currency] || 1;
}

// 获取汇率（异步版本，会更新缓存）
export async function getExchangeRateAsync(currency: string): Promise<number> {
  await fetchExchangeRates();
  return getExchangeRate(currency);
}