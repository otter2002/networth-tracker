'use client';

import { NetWorthRecord, Currency, Language } from '@/types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getExchangeRate } from '@/lib/data';

interface NetWorthSummaryProps {
  records: NetWorthRecord[];
  currency?: Currency;
  language?: Language;
}

export function NetWorthSummary({ records, currency = 'USD', language = 'zh' }: NetWorthSummaryProps) {
  if (records.length === 0) return null;

  // records已按日期降序排列，第一个是最新的
  const latest = records[0];
  const previous = records.length > 1 ? records[1] : null;
  
  const change = previous ? latest.totalValue - previous.totalValue : 0;
  const changePercent = previous ? (change / previous.totalValue) * 100 : 0;
  
  // 货币转换
  let exchangeRate = 1;
  if (currency === 'THB') {
    exchangeRate = 1 / getExchangeRate('THB');
  } else if (currency === 'CNY') {
    exchangeRate = 1 / getExchangeRate('CNY');
  }
  const currentValue = latest.totalValue * exchangeRate;
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
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'zh' ? '当前净资产' : 'สินทรัพย์สุทธิปัจจุบัน'}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatValue(currentValue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 变化金额 */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
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
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'zh' ? '变化金额' : 'การเปลี่ยนแปลง'}
                </dt>
                <dd className={`text-lg font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatChange(changeValue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 变化百分比 */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
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
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'zh' ? '变化百分比' : 'เปอร์เซ็นต์การเปลี่ยนแปลง'}
                </dt>
                <dd className={`text-lg font-medium ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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