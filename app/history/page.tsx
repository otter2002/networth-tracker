'use client';

import { useState, useEffect } from 'react';
import { NetWorthRecord } from '@/types';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [records, setRecords] = useState<NetWorthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/networth');
      if (response.ok) {
        const data = await response.json();
        // API直接返回数组格式，不是 {records: []} 格式
        setRecords(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      try {
        const response = await fetch(`/api/networth/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // 重新获取数据
          fetchRecords();
        } else {
          alert('删除失败，请重试');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const formatValue = (value: number | string | undefined) => {
    if (!value) {
      return '$0';
    }
    // 确保转换为数字
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return '$0';
    }
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(2)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(0)}K`;
    }
    return `$${numValue.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/"
              className="mr-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">历史记录</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无历史记录</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              开始添加您的第一笔净资产记录
            </p>
            <div className="mt-6">
              <Link
                href="/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                添加记录
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record) => (
              <div key={record.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {record.date}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-400 dark:text-green-500 mr-2" />
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatValue(record.totalValue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/edit/${record.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </button>
                  </div>
                </div>

                {/* 资产概览 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">链上资产</h3>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                      {formatValue(
                        (Array.isArray(record.onChainAssets) ? record.onChainAssets : Object.values(record.onChainAssets || {}))
                          .reduce((sum: number, asset: any) => {
                            const value = asset.totalValueUSD ?? 0;
                            const numValue = typeof value === 'string' ? parseFloat(value) || 0 : (value as number);
                            return sum + numValue;
                          }, 0)
                      )}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {Array.isArray(record.onChainAssets) ? record.onChainAssets.length : Object.keys(record.onChainAssets || {}).length} 个钱包
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">交易所资产</h3>
                    <p className="text-lg font-semibold text-green-900 dark:text-green-200">
                      {formatValue(
                        (Array.isArray(record.cexAssets) ? record.cexAssets : Object.values(record.cexAssets || {}))
                          .reduce((sum: number, asset: any) => {
                            const value = asset.totalValueUSD ?? 0;
                            const numValue = typeof value === 'string' ? parseFloat(value) || 0 : (value as number);
                            return sum + numValue;
                          }, 0)
                      )}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {Array.isArray(record.cexAssets) ? record.cexAssets.length : Object.keys(record.cexAssets || {}).length} 个交易所
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">银行资产</h3>
                    <p className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                      {formatValue(
                        (Array.isArray(record.bankAssets) ? record.bankAssets : Object.values(record.bankAssets || {}))
                          .reduce((sum: number, asset: any) => {
                            const value = asset.valueUSD ?? 0;
                            const numValue = typeof value === 'string' ? parseFloat(value) || 0 : (value as number);
                            return sum + numValue;
                          }, 0)
                      )}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {Array.isArray(record.bankAssets) ? record.bankAssets.length : Object.keys(record.bankAssets || {}).length} 个机构
                    </p>
                  </div>
                </div>

                {/* 详细资产列表 */}
                <div className="space-y-4">
                  {/* 链上资产 */}
                  {(record.onChainAssets || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">链上资产详情</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {record.onChainAssets.map((asset) => (
                          <div key={asset.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.remark || '未命名钱包'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{asset.walletAddress || '地址未设置'}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">{formatValue(asset.totalValueUSD)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 交易所资产 */}
                  {(record.cexAssets || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">交易所资产详情</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {record.cexAssets.map((asset) => (
                          <div key={asset.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.exchange.toUpperCase()}</div>
                            <div className="text-sm text-green-600 dark:text-green-400">{formatValue(asset.totalValueUSD)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 银行资产 */}
                  {(record.bankAssets || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">银行资产详情</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {record.bankAssets.map((asset) => (
                          <div key={asset.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.institution}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {asset.depositType} - {asset.currency}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">{formatValue(asset.valueUSD)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 