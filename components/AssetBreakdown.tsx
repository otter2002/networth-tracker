'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NetWorthRecord, Currency, Language } from '@/types';
import { calculateAssetBreakdown, getExchangeRate } from '@/lib/data';

interface AssetBreakdownProps {
  record: NetWorthRecord;
  currency?: Currency;
  language?: Language;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

export function AssetBreakdown({ record, currency = 'USD', language = 'zh' }: AssetBreakdownProps) {
  const assetData = calculateAssetBreakdown(record);
  
  // 货币转换
  let exchangeRate = 1;
  if (currency === 'THB') {
    exchangeRate = 1 / getExchangeRate('THB');
  } else if (currency === 'CNY') {
    exchangeRate = 1 / getExchangeRate('CNY');
  }

  const formatValue = (value: number) => {
    let symbol = '$';
    if (currency === 'THB') symbol = '฿';
    else if (currency === 'CNY') symbol = '¥';
    
    const convertedValue = value * exchangeRate;
    
    if (convertedValue >= 1000000) {
      return `${symbol}${(convertedValue / 1000000).toFixed(1)}M`;
    } else if (convertedValue >= 1000) {
      return `${symbol}${(convertedValue / 1000).toFixed(0)}K`;
    }
    return `${symbol}${convertedValue.toFixed(0)}`;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={assetData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {assetData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [formatValue(value), language === 'zh' ? '价值' : 'มูลค่า']}
            labelFormatter={(label: string) => language === 'zh' ? `资产: ${label}` : `สินทรัพย์: ${label}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 