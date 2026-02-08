'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NetWorthRecord, Currency, Language } from '@/types';
import { calculateAssetBreakdown, getExchangeRate, fetchExchangeRates } from '@/lib/data';

interface AssetBreakdownProps {
  record: NetWorthRecord;
  currency?: Currency;
  language?: Language;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

export function AssetBreakdown({ record, currency = 'USD', language = 'zh' }: AssetBreakdownProps) {
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  
  // 获取最新汇率
  useEffect(() => {
    const updateRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };
    
    updateRates();
    // 每5分钟更新一次汇率
    const interval = setInterval(updateRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const assetData = calculateAssetBreakdown(record);
  
  // 货币转换 - 使用实时汇率（需要取倒数：API返回"外币 per USD"，需要"USD per 外币"）
  let exchangeRate = 1;
  if (currency === 'THB') {
    const thbRate = exchangeRates['THB'] || getExchangeRate('THB');
    const validRate = (thbRate && thbRate > 20 && thbRate < 50) ? thbRate : 35;
    exchangeRate = 1 / validRate;
  } else if (currency === 'CNY') {
    const cnyRate = exchangeRates['CNY'] || getExchangeRate('CNY');
    const validRate = (cnyRate && cnyRate > 5 && cnyRate < 10) ? cnyRate : 7.3;
    exchangeRate = 1 / validRate;
  } else if (currency === 'JPY') {
    const jpyRate = exchangeRates['JPY'] || getExchangeRate('JPY');
    const validRate = (jpyRate && jpyRate > 100 && jpyRate < 200) ? jpyRate : 150;
    exchangeRate = 1 / validRate;
  }

  const formatValue = (value: number) => {
    let symbol = '$';
    if (currency === 'THB') symbol = '฿';
    else if (currency === 'CNY') symbol = '¥';
    else if (currency === 'JPY') symbol = '¥';

    const convertedValue = value / exchangeRate;
    
    if (convertedValue >= 1000000) {
      return `${symbol}${(convertedValue / 1000000).toFixed(2)}M`;
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