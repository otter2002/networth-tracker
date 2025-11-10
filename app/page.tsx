'use client';

import { useState, useEffect } from 'react';
import { NetWorthChart } from '@/components/NetWorthChart';
import { AssetBreakdown } from '@/components/AssetBreakdown';
import { AssetComposition } from '@/components/AssetComposition';
import { NetWorthSummary } from '@/components/NetWorthSummary';
import { YieldSummary } from '@/components/YieldSummary';
import { BankAssetTrend } from '@/components/BankAssetTrend';
import { NetWorthRecord } from '@/types';
import { fetchExchangeRates } from '@/lib/data';
import { Plus, BarChart3, PieChart, TrendingUp, Wallet, Building2, Banknote, Calendar } from 'lucide-react';
import Link from 'next/link';
import { LanguageCurrencyToggle } from '@/components/LanguageCurrencyToggle';
import DataMigration from '@/components/DataMigration';

export default function Dashboard() {
  const [records, setRecords] = useState<NetWorthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'zh' | 'th'>('zh');
  const [currency, setCurrency] = useState<'USD' | 'THB' | 'CNY'>('USD');

  useEffect(() => {
    // 每次页面加载前刷新汇率，然后再获取净资产记录
    const init = async () => {
      try {
        await fetchExchangeRates();
      } catch (error) {
        console.error('Error refreshing exchange rates:', error);
      }
      // 获取净资产记录
      try {
        const response = await fetch('/api/networth');
        if (response.ok) {
          const data = await response.json();
          const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRecords(sorted);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const latestRecord = records[0]; // 已按日期降序排列，第一个是最新的

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {language === 'zh' ? '净资产追踪器' : 'ตัวติดตามสินทรัพย์สุทธิ'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {language === 'zh' ? '监控您的财富增长' : 'ติดตามการเติบโตของความมั่งคั่งของคุณ'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageCurrencyToggle
                onLanguageChange={setLanguage}
                onCurrencyChange={setCurrency}
                currentLanguage={language}
                currentCurrency={currency}
              />
              <Link
                href="/history"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {language === 'zh' ? '历史记录' : 'ประวัติ'}
              </Link>
              <Link
                href="/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'zh' ? '+ 添加记录' : '+ เพิ่มรายการ'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 数据迁移提示 */}
        <DataMigration />
        
        {records.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无数据</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              开始添加您的第一笔净资产记录
            </p>
            <div className="mt-6">
              <Link
                href="/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加记录
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <NetWorthSummary records={records} currency={currency} language={language} />
            </div>

            {/* Yield Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'zh' ? '收益概览' : 'ภาพรวมรายได้'}
              </h2>
              {latestRecord && <YieldSummary record={latestRecord} language={language} currency={currency} />}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Net Worth Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'zh' ? '净资产趋势' : 'แนวโน้มสินทรัพย์สุทธิ'}
                  </h2>
                </div>
                <NetWorthChart records={records} currency={currency} language={language} />
              </div>

              {/* Asset Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <PieChart className="w-5 h-5 text-green-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'zh' ? '资产分布' : 'การกระจายสินทรัพย์'}
                  </h2>
                </div>
                {latestRecord && <AssetBreakdown record={latestRecord} currency={currency} language={language} />}
              </div>
            </div>

            {/* Bank Asset Trend */}
            {records.length > 1 && (
              <div className="mb-8">
                <BankAssetTrend records={records} language={language} currency={currency} />
              </div>
            )}

            {/* Asset Composition */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Wallet className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'zh' ? '净资产组合详情' : 'รายละเอียดพอร์ตโฟลิโอ'}
                </h2>
              </div>
              {latestRecord && <AssetComposition record={latestRecord} language={language} currency={currency} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 