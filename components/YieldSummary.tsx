'use client';

import { NetWorthRecord, Currency, Language, YieldCalculation } from '@/types';
import { calculateYield, getExchangeRate, fetchExchangeRates } from '@/lib/data';
import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';

interface YieldSummaryProps {
  record: NetWorthRecord;
  language?: Language;
  currency?: Currency;
  yieldData?: YieldCalculation;
}

export function YieldSummary({ record, language = 'zh', currency = 'USD', yieldData: externalYieldData }: YieldSummaryProps) {
  // 优先使用外部传入的收益数据，否则自行计算
  const yieldData = externalYieldData || calculateYield(record);
  // 实时汇率状态
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExchangeRates()
      .then((rates: { [key: string]: number }) => {
        setExchangeRates(rates);
        setLoading(false);
      })
      .catch((error: any) => {
        console.error('Failed to fetch yields rates:', error);
        setLoading(false);
      });
  }, []);

  // 货币转换倍率 - 需要取倒数（API返回"外币 per USD"，需要"USD per 外币"）
  let exchangeRate = 1;
  if (currency === 'THB') {
    const thbRate = exchangeRates['THB'] || getExchangeRate('THB');
    // 确保汇率有效，避免除以0或无效值
    const validRate = (thbRate && thbRate > 0 && isFinite(thbRate)) ? thbRate : 35;
    exchangeRate = 1 / validRate;
  } else if (currency === 'CNY') {
    const cnyRate = exchangeRates['CNY'] || getExchangeRate('CNY');
    const validRate = (cnyRate && cnyRate > 0 && isFinite(cnyRate)) ? cnyRate : 7.3;
    exchangeRate = 1 / validRate;
  } else if (currency === 'JPY') {
    const jpyRate = exchangeRates['JPY'] || getExchangeRate('JPY');
    const validRate = (jpyRate && jpyRate > 0 && isFinite(jpyRate)) ? jpyRate : 150;
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
    return `${symbol}${convertedValue.toFixed(2)}`;
  };

  // 非USD货币在汇率加载完成前显示加载状态，避免闪烁错误值
  if (loading && currency !== 'USD') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 日收益 */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {language === 'zh' ? '日收益' : 'รายได้รายวัน'}
                </dt>
                <dd className="text-lg font-medium text-green-600 dark:text-green-400">
                  {formatValue(yieldData.dailyYield)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 月收益 */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {language === 'zh' ? '月收益' : 'รายได้รายเดือน'}
                </dt>
                <dd className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                  {formatValue(yieldData.monthlyYield)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 年收益 */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {language === 'zh' ? '年收益' : 'รายได้รายปี'}
                </dt>
                <dd className="text-lg font-medium text-blue-600 dark:text-blue-400">
                  {formatValue(yieldData.annualYield)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 总APR */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {language === 'zh' ? '总APR' : 'APR รวม'}
                </dt>
                <dd className="text-lg font-medium text-orange-600 dark:text-orange-400">
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
