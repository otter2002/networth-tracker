'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NetWorthRecord } from '@/types';
import { calculateExchangeBreakdown } from '@/lib/data';

interface AccountBreakdownProps {
  record: NetWorthRecord;
}

export function AccountBreakdown({ record }: AccountBreakdownProps) {
  const accountData = calculateExchangeBreakdown(record);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={accountData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            tickFormatter={formatValue}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip 
            formatter={(value: number) => [formatValue(value), '价值']}
            labelFormatter={(label: string) => `账户: ${label}`}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 