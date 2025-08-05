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
        setRecords(data.records || []);
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

  const formatValue = (value: number | undefined) => {
    if (!value || isNaN(value)) {
      return '$0';
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无历史记录</h3>
            <p className="mt-1 text-sm text-gray-500">
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
              <div key={record.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-lg font-semibold text-gray-900">
                        {new Date(record.date).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-lg font-semibold text-green-600">
                        {formatValue(record.totalValue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/edit/${record.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </button>
                  </div>
                </div>

                {/* 资产概览 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800">链上资产</h3>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatValue(((Array.isArray(record.onChainAssets) ? record.onChainAssets : Object.values(record.onChainAssets || {})).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0)) as number)}
                    </p>
                    <p className="text-sm text-blue-600">
                      {(record.onChainAssets || []).length} 个钱包
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800">交易所资产</h3>
                    <p className="text-lg font-semibold text-green-900">
                      {formatValue(((Array.isArray(record.cexAssets) ? record.cexAssets : Object.values(record.cexAssets || {})).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0)) as number)}
                    </p>
                    <p className="text-sm text-green-600">
                      {(record.cexAssets || []).length} 个交易所
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-purple-800">银行资产</h3>
                    <p className="text-lg font-semibold text-purple-900">
                      {formatValue(((Array.isArray(record.bankAssets) ? record.bankAssets : Object.values(record.bankAssets || {})).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0)) as number)}
                    </p>
                    <p className="text-sm text-purple-600">
                      {(record.bankAssets || []).length} 个机构
                    </p>
                  </div>
                </div>

                {/* 详细资产列表 */}
                <div className="space-y-4">
                  {/* 链上资产 */}
                  {(record.onChainAssets || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">链上资产详情</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {record.onChainAssets.map((asset) => (
                          <div key={asset.id} className="bg-gray-50 rounded p-3">
                            <div className="text-sm font-medium text-gray-900">{asset.remark || '未命名钱包'}</div>
                            <div className="text-xs text-gray-500">{asset.walletAddress || '地址未设置'}</div>
                            <div className="text-sm text-blue-600">{formatValue(asset.totalValueUSD)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 交易所资产 */}
                  {(record.cexAssets || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">交易所资产详情</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {record.cexAssets.map((asset) => (
                          <div key={asset.id} className="bg-gray-50 rounded p-3">
                            <div className="text-sm font-medium text-gray-900">{asset.exchange.toUpperCase()}</div>
                            <div className="text-sm text-green-600">{formatValue(asset.totalValueUSD)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 银行资产 */}
                  {(record.bankAssets || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">银行资产详情</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {record.bankAssets.map((asset) => (
                          <div key={asset.id} className="bg-gray-50 rounded p-3">
                            <div className="text-sm font-medium text-gray-900">{asset.institution}</div>
                            <div className="text-xs text-gray-500">
                              {asset.depositType} - {asset.currency}
                            </div>
                            <div className="text-sm text-purple-600">{formatValue(asset.valueUSD)}</div>
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