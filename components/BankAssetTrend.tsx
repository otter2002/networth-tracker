'use client';

import { useState, useEffect } from 'react';
import { NetWorthRecord, Currency, Language } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getExchangeRate, fetchExchangeRates } from '@/lib/data';

interface BankAssetTrendProps {
  records: NetWorthRecord[];
  language?: Language;
  currency?: Currency;
}

type BankCurrency = 'USD' | 'CNY' | 'THB' | 'HKD';

export function BankAssetTrend({ records, language = 'zh', currency = 'USD' }: BankAssetTrendProps) {
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [selectedCurrency, setSelectedCurrency] = useState<BankCurrency>('CNY');

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
    const interval = setInterval(updateRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 计算每条记录中各币种银行资产的总额
  const calculateBankAssetsByCurrency = (record: NetWorthRecord) => {
    const currencyTotals: { [key: string]: number } = {
      'USD': 0,
      'CNY': 0,
      'THB': 0,
      'HKD': 0
    };

    (record.bankAssets || []).forEach(asset => {
      currencyTotals[asset.currency] = (currencyTotals[asset.currency] || 0) + asset.amount;
    });

    return currencyTotals;
  };

  // 准备图表数据
  const chartData = records
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => {
      const totals = calculateBankAssetsByCurrency(record);
      return {
        date: record.date,
        USD: totals.USD,
        CNY: totals.CNY,
        THB: totals.THB,
        HKD: totals.HKD
      };
    });

  // 计算最新和上一次的变化
  const latest = chartData[chartData.length - 1];
  const previous = chartData.length > 1 ? chartData[chartData.length - 2] : null;

  const currencies: BankCurrency[] = ['CNY', 'THB', 'HKD', 'USD'];
  
  const currencyInfo = {
    'CNY': { name: '人民币', symbol: '¥', color: '#EF4444' },
    'THB': { name: '泰铢', symbol: '฿', color: '#10B981' },
    'HKD': { name: '港币', symbol: 'HK$', color: '#F59E0B' },
    'USD': { name: '美元', symbol: '$', color: '#3B82F6' }
  };

  const formatValue = (value: number, curr: BankCurrency) => {
    const info = currencyInfo[curr];
    if (value >= 1000000) {
      return `${info.symbol}${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${info.symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${info.symbol}${value.toFixed(0)}`;
  };

  const formatChange = (value: number, curr: BankCurrency) => {
    const info = currencyInfo[curr];
    const absValue = Math.abs(value);
    const prefix = value >= 0 ? '+' : '-';
    
    if (absValue >= 1000000) {
      return `${prefix}${info.symbol}${(absValue / 1000000).toFixed(2)}M`;
    } else if (absValue >= 1000) {
      return `${prefix}${info.symbol}${(absValue / 1000).toFixed(0)}K`;
    }
    return `${prefix}${info.symbol}${absValue.toFixed(0)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'zh' ? '银行资产趋势' : 'แนวโน้มสินทรัพย์ธนาคาร'}
          </h2>
        </div>
        
        {/* 币种切换按钮 */}
        <div className="flex space-x-2">
          {currencies.map(curr => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedCurrency === curr
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {currencyInfo[curr].name}
            </button>
          ))}
        </div>
      </div>

      {/* 概况卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {currencies.map(curr => {
          const currentValue = latest ? latest[curr] : 0;
          const previousValue = previous ? previous[curr] : 0;
          const change = currentValue - previousValue;
          const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
          const info = currencyInfo[curr];

          return (
            <div
              key={curr}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCurrency === curr
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {info.name}
                </span>
                {change !== 0 && (
                  change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )
                )}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatValue(currentValue, curr)}
              </div>
              {previous && (
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className={change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {formatChange(change, curr)}
                  </span>
                  <span className={change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 趋势图 */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#F3F4F6'
              }}
              formatter={(value: number, name: string) => [
                formatValue(value, name as BankCurrency),
                currencyInfo[name as BankCurrency].name
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString('zh-CN')}
            />
            <Line
              type="monotone"
              dataKey={selectedCurrency}
              stroke={currencyInfo[selectedCurrency].color}
              strokeWidth={3}
              dot={{ fill: currencyInfo[selectedCurrency].color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}