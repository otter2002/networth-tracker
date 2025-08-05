'use client';

import { useState, useEffect } from 'react';
import { NetWorthRecord, Currency, Language } from '@/types';
import { calculateAssetBreakdown, getExchangeRate, fetchExchangeRates } from '@/lib/data';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, Building2, Banknote } from 'lucide-react';

interface AssetCompositionProps {
  record: NetWorthRecord;
  language?: Language;
  currency?: Currency;
}

export function AssetComposition({ record, language = 'zh', currency = 'USD' }: AssetCompositionProps) {
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

  const breakdown = calculateAssetBreakdown(record);
  
  // 货币转换 - 使用实时汇率
  let exchangeRate = 1;
  if (currency === 'THB') {
    exchangeRate = exchangeRates['THB'] || getExchangeRate('THB');
  } else if (currency === 'CNY') {
    exchangeRate = exchangeRates['CNY'] || getExchangeRate('CNY');
  }
  
  const data = breakdown.map(item => {
    let icon = Wallet;
    let color = '#3B82F6';
    let name = item.name;
    
    if (item.name === '交易所资产') {
      icon = Building2;
      color = '#10B981';
      name = language === 'zh' ? '交易所资产' : 'สินทรัพย์ในตลาด';
    } else if (item.name === '银行资产') {
      icon = Banknote;
      color = '#F59E0B';
      name = language === 'zh' ? '银行资产' : 'สินทรัพย์ในธนาคาร';
    } else if (item.name === '链上资产') {
      name = language === 'zh' ? '链上资产' : 'สินทรัพย์บนบล็อกเชน';
    }
    
    return {
      ...item,
      name,
      color,
      icon
    };
  });

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

  const formatPercentage = (value: number, total: number) => {
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Wallet className="h-6 w-6 text-blue-500 mr-2" />
                          <h3 className="text-lg font-medium text-gray-900">
                  {language === 'zh' ? '净资产组合详情' : 'รายละเอียดพอร์ตโฟลิโอ'}
                </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 饼图 */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatValue(value), language === 'zh' ? '价值' : 'มูลค่า']}
                  labelFormatter={(label) => `${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 详细列表 */}
          <div className="space-y-4">
            {data.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <Icon className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatValue(item.value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(item.value, total)}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* 总计 */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">
                  {language === 'zh' ? '总计' : 'รวม'}
                </span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatValue(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 