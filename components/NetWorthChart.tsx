'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NetWorthRecord, Currency, Language } from '@/types';
import { getExchangeRate } from '@/lib/data';

interface NetWorthChartProps {
  records: NetWorthRecord[];
  currency?: Currency;
  language?: Language;
}

export function NetWorthChart({ records, currency = 'USD', language = 'zh' }: NetWorthChartProps) {
  // 货币转换
  let exchangeRate = 1;
  if (currency === 'THB') {
    exchangeRate = getExchangeRate('THB');
  } else if (currency === 'CNY') {
    exchangeRate = getExchangeRate('CNY');
  }
  
  // 按日期升序排列用于图表显示
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const chartData = sortedRecords.map(record => ({
    date: new Date(record.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'th-TH', { month: 'short', day: 'numeric' }),
    value: record.totalValue * exchangeRate,
    fullDate: record.date
  }));

  const formatValue = (value: number) => {
    let symbol = '$';
    if (currency === 'THB') symbol = '฿';
    else if (currency === 'CNY') symbol = '¥';
    
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          tickFormatter={formatValue}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => {
            let symbol = '$';
            if (currency === 'THB') symbol = '฿';
            else if (currency === 'CNY') symbol = '¥';
            return [`${symbol}${value.toLocaleString()}`, language === 'zh' ? '净资产' : 'สินทรัพย์สุทธิ'];
          }}
          labelFormatter={(label) => language === 'zh' ? `日期: ${label}` : `วันที่: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 