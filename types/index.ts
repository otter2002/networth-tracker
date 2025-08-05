// 链上资产 - 钱包地址和仓位
export interface OnChainAsset {
  id: string;
  walletAddress: string;
  remark: string; // 备注名
  positions: OnChainPosition[];
  // 可编辑的总价值
  totalValueUSD: number; // 钱包总价值（手动编辑）
  // 计算得出的值
  yieldValueUSD: number; // 生息仓位总价值
  totalAPR: number;
  dailyIncome: number;
  monthlyIncome: number;
  yearlyIncome: number;
}

export interface OnChainPosition {
  id: string;
  token: string; // 代币名称
  valueUSD: number; // 价值USD
  apr: number; // 年化收益率
}

// 中心化交易所资产
export interface CEXAsset {
  id: string;
  exchange: 'bybit' | 'bitget' | 'okx' | 'binance';
  totalValueUSD: number;
}

// 银行和券商资产
export interface BankAsset {
  id: string;
  institution: 'za bank' | 'hsbc hk' | 'bkk bank' | '农业银行' | '民生银行' | '券商'; // 机构名称
  depositType: '活期' | '定期' | '股票'; // 存款类型
  currency: 'HKD' | 'CNY' | 'USD' | 'THB'; // 币种
  amount: number; // 金额
  exchangeRate: number; // 汇率（对美元）
  valueUSD: number; // 美元价值（自动计算）
}

// 净资产记录
export interface NetWorthRecord {
  id: string;
  date: string;
  totalValue: number;
  onChainAssets: OnChainAsset[];
  cexAssets: CEXAsset[];
  bankAssets: BankAsset[];
}

// 收益计算
export interface YieldCalculation {
  dailyYield: number;
  monthlyYield: number;
  annualYield: number;
  projectedAnnualYield: number;
  totalAPR: number;
}

// 支持的货币类型
export type Currency = 'USD' | 'THB' | 'CNY';
export type Language = 'zh' | 'th';

export interface AssetBreakdown {
  name: string;
  value: number;
  percentage: number;
}

export interface AccountBreakdown {
  name: string;
  value: number;
  percentage: number;
} 