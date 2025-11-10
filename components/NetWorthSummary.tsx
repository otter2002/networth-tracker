'use client';

import { useState, useEffect } from 'react';
import { NetWorthRecord, Currency, Language } from '@/types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getExchangeRate, fetchExchangeRates } from '@/lib/data';

interface NetWorthSummaryProps {
  records: NetWorthRecord[];
  currency?: Currency;
  language?: Language;
}

export function NetWorthSummary({ records, currency = 'USD', language = 'zh' }: NetWorthSummaryProps) {
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

  if (records.length === 0) return null;

  // 重新计算净资产（基于实际资产，不依赖存储的totalValue）
  const calculateActualNetWorth = (record: NetWorthRecord) => {
    const onChainTotal = (record.onChainAssets || []).reduce((sum, asset) => sum + (asset.totalValueUSD || 0), 0);
    const cexTotal = (record.cexAssets || []).reduce((sum, asset) => sum + (asset.totalValueUSD || 0), 0);
    const bankTotal = (record.bankAssets || []).reduce((sum, asset) => sum + (asset.valueUSD || 0), 0);
    const total = onChainTotal + cexTotal + bankTotal;
    
    // 调试信息
    console.log('计算净资产:', {
      date: record.date,
      onChainTotal,
      cexTotal,
      bankTotal,
      total,
      storedTotal: record.totalValue
    });
    
    return total;
  };

  // records已按日期降序排列，第一个是最新的
  const latest = records[0];
  const previous = records.length > 1 ? records[1] : null;
  
  // 使用重新计算的净资产
  const latestValue = calculateActualNetWorth(latest);
  const previousValue = previous ? calculateActualNetWorth(previous) : 0;
  
  const change = previous ? latestValue - previousValue : 0;
  const changePercent = previous && previousValue > 0 ? (change / previousValue) * 100 : 0;
  
  // 货币转换 - 使用实时汇率
  let exchangeRate = 1;
  if (currency === 'THB') {
    exchangeRate = exchangeRates['THB'] || getExchangeRate('THB');
  } else if (currency === 'CNY') {
    exchangeRate = exchangeRates['CNY'] || getExchangeRate('CNY');
  }
  const currentValue = latestValue * exchangeRate;
  const changeValue = change * exchangeRate;
  
  const formatValue = (value: number) => {
    let symbol = '$';
    if (currency === 'THB') symbol = '฿';
    else if (currency === 'CNY') symbol = '¥';
    
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toFixed(0)}`;
  };

  const formatChange = (value: number) => {
    let symbol = '$';
    if (currency === 'THB') symbol = '฿';
    else if (currency === 'CNY') symbol = '¥';
    
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${value >= 0 ? '+' : '-'}${symbol}${(absValue / 1000000).toFixed(2)}M`;
    } else if (absValue >= 1000) {
      return `${value >= 0 ? '+' : '-'}${symbol}${(absValue / 1000).toFixed(0)}K`;
    }
    return `${value >= 0 ? '+' : '-'}${symbol}${absValue.toFixed(0)}`;
  };

  return (
    <>
      {/* 当前净资产 */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {language === 'zh' ? '当前净资产' : 'สินทรัพย์สุทธิปัจจุบัน'}
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatValue(currentValue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 变化金额 */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {change >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {language === 'zh' ? '变化金额' : 'การเปลี่ยนแปลง'}
                </dt>
                <dd className={`text-lg font-medium ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatChange(changeValue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 变化百分比 */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {changePercent >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {language === 'zh' ? '变化百分比' : 'เปอร์เซ็นต์การเปลี่ยนแปลง'}
                </dt>
                <dd className={`text-lg font-medium ${changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 