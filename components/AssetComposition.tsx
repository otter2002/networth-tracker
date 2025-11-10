'use client';

import { useState, useEffect } from 'react';
import { NetWorthRecord, Currency, Language } from '@/types';
import { calculateAssetBreakdown, getExchangeRate, fetchExchangeRates } from '@/lib/data';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, Building2, Banknote, TrendingUp } from 'lucide-react';

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
      return `${symbol}${(convertedValue / 1000000).toFixed(2)}M`;
    } else if (convertedValue >= 1000) {
      return `${symbol}${(convertedValue / 1000).toFixed(0)}K`;
    }
    return `${symbol}${convertedValue.toFixed(0)}`;
  };

  const formatPercentage = (value: number, total: number) => {
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // 收集所有正在生息的仓位（APR > 0）
  const onChainYieldingPositions = record.onChainAssets.flatMap(asset =>
    asset.positions
      .filter(position => position.apr > 0)
      .map(position => ({
        type: 'onchain' as const,
        walletRemark: asset.remark || asset.walletAddress.substring(0, 6) + '...',
        token: position.token,
        valueUSD: position.valueUSD,
        apr: position.apr,
        dailyIncome: (position.valueUSD * position.apr) / 365 / 100
      }))
  );

  // 收集交易所生息资产（APR > 0）
  const cexYieldingPositions = record.cexAssets
    .filter(asset => asset.apr && asset.apr > 0)
    .map(asset => ({
      type: 'cex' as const,
      walletRemark: asset.exchange.toUpperCase(),
      token: language === 'zh' ? '总资产' : 'สินทรัพย์รวม',
      valueUSD: asset.totalValueUSD,
      apr: asset.apr || 0,
      dailyIncome: (asset.totalValueUSD * (asset.apr || 0)) / 365 / 100
    }));

  // 合并所有生息资产
  const yieldingPositions = [...onChainYieldingPositions, ...cexYieldingPositions];

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Wallet className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
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
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatValue(item.value)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatPercentage(item.value, total)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 总计 */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">
                  {language === 'zh' ? '总计' : 'รวม'}
                </span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {formatValue(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 正在生息的资产仓位 */}
        {yieldingPositions.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h4 className="text-base font-medium text-gray-900 dark:text-white">
                {language === 'zh' ? '正在生息的资产仓位' : 'ตำแหน่งสินทรัพย์ที่สร้างผลตอบแทน'}
              </h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'zh' ? '类型' : 'ประเภท'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'zh' ? '账户/代币' : 'บัญชี/โทเค็น'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'zh' ? '价值' : 'มูลค่า'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      APR
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'zh' ? '每日收益' : 'รายได้รายวัน'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {yieldingPositions.map((position, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          position.type === 'onchain'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {position.type === 'onchain' ? (language === 'zh' ? '链上' : 'บนเชน') : (language === 'zh' ? '交易所' : 'ตลาด')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">{position.walletRemark}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">{position.token}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {formatValue(position.valueUSD)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                        {position.apr.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                        {formatValue(position.dailyIncome)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 生息仓位汇总 */}
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {language === 'zh' ? '生息仓位总价值' : 'มูลค่ารวมตำแหน่งที่สร้างผลตอบแทน'}
                  </div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {formatValue(yieldingPositions.reduce((sum, p) => sum + p.valueUSD, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {language === 'zh' ? '加权平均APR' : 'APR เฉลี่ยถ่วงน้ำหนัก'}
                  </div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {(() => {
                      const totalValue = yieldingPositions.reduce((sum, p) => sum + p.valueUSD, 0);
                      const weightedAPR = totalValue > 0
                        ? yieldingPositions.reduce((sum, p) => sum + (p.valueUSD * p.apr), 0) / totalValue
                        : 0;
                      return weightedAPR.toFixed(2);
                    })()}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {language === 'zh' ? '每日总收益' : 'รายได้รวมรายวัน'}
                  </div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {formatValue(yieldingPositions.reduce((sum, p) => sum + p.dailyIncome, 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}