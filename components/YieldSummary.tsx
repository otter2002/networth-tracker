'use client';

import { NetWorthRecord, Currency, Language } from '@/types';
import { calculateYield, getExchangeRate } from '@/lib/data';
import { TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';

interface YieldSummaryProps {
  record: NetWorthRecord;
  language?: Language;
  currency?: Currency;
}

export function YieldSummary({ record, language = 'zh', currency = 'USD' }: YieldSummaryProps) {
  const yieldData = calculateYield(record);
  
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
      return `${symbol}${(convertedValue / 1000000).toFixed(2)}M`;
    } else if (convertedValue >= 1000) {
      return `${symbol}${(convertedValue / 1000).toFixed(0)}K`;
    }
    return `${symbol}${convertedValue.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 日收益 */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'zh' ? '日收益' : 'รายได้รายวัน'}
                </dt>
                <dd className="text-lg font-medium text-green-600">
                  {formatValue(yieldData.dailyYield)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 月收益 */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'zh' ? '月收益' : 'รายได้รายเดือน'}
                </dt>
                <dd className="text-lg font-medium text-indigo-600">
                  {formatValue(yieldData.monthlyYield)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 年收益 */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'zh' ? '年收益' : 'รายได้รายปี'}
                </dt>
                <dd className="text-lg font-medium text-blue-600">
                  {formatValue(yieldData.annualYield)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 总APR */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'zh' ? '总APR' : 'APR รวม'}
                </dt>
                <dd className="text-lg font-medium text-orange-600">
                  {yieldData.totalAPR.toFixed(2)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 