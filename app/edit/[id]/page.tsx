'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAllNetWorthRecords, deleteNetWorthRecord, addNetWorthRecord, calculateWalletYield, getExchangeRate, getExchangeRateAsync } from '@/lib/data';
import { NetWorthRecord, OnChainAsset, CEXAsset, BankAsset } from '@/types';
import { ArrowLeft, Save, Plus, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function EditRecord() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<NetWorthRecord | null>(null);

  useEffect(() => {
    const records = getAllNetWorthRecords();
    const foundRecord = records.find(r => r.id === recordId);
    if (foundRecord) {
      // 确保银行资产数据格式正确
      const migratedRecord = {
        ...foundRecord,
        bankAssets: (foundRecord.bankAssets || []).map((asset: any) => {
          // 如果是旧格式，转换为新格式
          if (asset.fiatCurrencies && !asset.currency) {
            const currency = Object.keys(asset.fiatCurrencies)[0];
            const amount = asset.fiatCurrencies[currency];
            const exchangeRate = getExchangeRate(currency);
            return {
              id: asset.id,
              institution: asset.institution === '农行' ? '农业银行' : 
                         asset.institution === '民生' ? '民生银行' : 
                         asset.institution === '曼谷' ? 'bkk bank' : asset.institution,
              depositType: '活期',
              currency: currency as any,
              amount: amount,
              exchangeRate: exchangeRate,
              valueUSD: amount * exchangeRate
            };
          }
          // 如果已经是新格式，确保有必要的字段
          return {
            ...asset,
            valueUSD: asset.valueUSD || 0,
            amount: asset.amount || 0,
            exchangeRate: asset.exchangeRate || 1,
            depositType: asset.depositType || '活期',
            currency: asset.currency || 'USD'
          };
        })
      };
      setRecord(migratedRecord);
    } else {
      alert('记录未找到');
      router.push('/');
    }
    setLoading(false);
  }, [recordId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    setSaving(true);
    try {
      // 计算总价值
      const onChainTotal = Object.values(record.onChainAssets || {}).reduce((sum, asset) => {
        return sum + ((asset as any).value ?? (asset as any).amount ?? 0);
      }, 0);
      
      const cexTotal = Object.values(record.cexAssets || {}).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0);
      const bankTotal = Object.values(record.bankAssets || {}).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0);
      const totalValue = onChainTotal + cexTotal + bankTotal;

      // 删除原记录
      deleteNetWorthRecord(recordId);
      // 添加更新后的记录
      addNetWorthRecord({
        date: record.date,
        totalValue,
        onChainAssets: record.onChainAssets,
        cexAssets: record.cexAssets,
        bankAssets: record.bankAssets
      });
      router.push('/');
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setSaving(false);
    }
  };

  const addOnChainAsset = () => {
    if (!record) return;
    const newAsset: OnChainAsset = {
      id: Date.now().toString(),
      walletAddress: '',
      remark: '',
      positions: [],
      totalValueUSD: 0,
      yieldValueUSD: 0,
      totalAPR: 0,
      dailyIncome: 0,
      monthlyIncome: 0,
      yearlyIncome: 0
    };
    setRecord({
      ...record,
      onChainAssets: [...(record.onChainAssets || []), newAsset]
    });
  };

  const addCEXAsset = () => {
    if (!record) return;
    const newAsset: CEXAsset = {
      id: Date.now().toString(),
      exchange: 'binance',
      totalValueUSD: 0
    };
    setRecord({
      ...record,
      cexAssets: [...(record.cexAssets || []), newAsset]
    });
  };

  const addBankAsset = () => {
    if (!record) return;
    const newAsset: BankAsset = {
      id: Date.now().toString(),
      institution: 'za bank',
      depositType: '活期',
      currency: 'USD',
      amount: 0,
      exchangeRate: 1,
      valueUSD: 0
    };
    setRecord({
      ...record,
      bankAssets: [...(record.bankAssets || []), newAsset]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">记录未找到</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">编辑净资产记录</h1>
              <p className="text-sm text-gray-600">
                {new Date(record.date).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  日期
                </label>
                <input
                  type="date"
                  value={record.date}
                  onChange={(e) => setRecord({ ...record, date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  总价值 (USD)
                </label>
                <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium">
                  ${(() => {
                    const onChainTotal = Object.values(record.onChainAssets || {}).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0);
                    const cexTotal = Object.values(record.cexAssets || {}).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0);
                    const bankTotal = Object.values(record.bankAssets || {}).reduce((sum, asset) => sum + ((asset as any).value ?? (asset as any).amount ?? 0), 0);
                    return (onChainTotal + cexTotal + bankTotal).toFixed(2);
                  })()}
                </div>
                <p className="mt-1 text-xs text-gray-500">总价值根据下方资产自动计算</p>
              </div>
            </div>
          </div>

          {/* 链上资产 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">链上资产</h2>
              <button
                type="button"
                onClick={addOnChainAsset}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加钱包
              </button>
            </div>
            {(record.onChainAssets || []).map((asset, index) => (
              <div key={asset.id} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">钱包地址</label>
                    <input
                      type="text"
                      value={asset.walletAddress}
                                             onChange={(e) => {
                         const newAssets = [...(record.onChainAssets || [])];
                         newAssets[index].walletAddress = e.target.value;
                         setRecord({ ...record, onChainAssets: newAssets });
                       }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">备注名</label>
                    <input
                      type="text"
                      value={asset.remark}
                                             onChange={(e) => {
                         const newAssets = [...(record.onChainAssets || [])];
                         newAssets[index].remark = e.target.value;
                         setRecord({ ...record, onChainAssets: newAssets });
                       }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="钱包备注"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">总价值 (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={asset.totalValueUSD}
                      onChange={(e) => {
                        const newAssets = [...(record.onChainAssets || [])];
                        newAssets[index].totalValueUSD = parseFloat(e.target.value) || 0;
                        setRecord({ ...record, onChainAssets: newAssets });
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* 仓位管理 */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">仓位管理</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newAssets = [...(record.onChainAssets || [])];
                        const newPosition = {
                          id: Date.now().toString(),
                          token: '',
                          valueUSD: 0,
                          apr: 0
                        };
                        newAssets[index].positions.push(newPosition);
                        setRecord({ ...record, onChainAssets: newAssets });
                      }}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      添加仓位
                    </button>
                  </div>
                  
                  {(asset.positions || []).map((position, posIndex) => (
                    <div key={position.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">代币</label>
                        <input
                          type="text"
                          value={position.token}
                          onChange={(e) => {
                            const newAssets = [...(record.onChainAssets || [])];
                            newAssets[index].positions[posIndex].token = e.target.value;
                            setRecord({ ...record, onChainAssets: newAssets });
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="USDC"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">价值 (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={position.valueUSD || ''}
                          onChange={(e) => {
                            const newAssets = [...(record.onChainAssets || [])];
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            newAssets[index].positions[posIndex].valueUSD = value;
                            setRecord({ ...record, onChainAssets: newAssets });
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">APR (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={position.apr || ''}
                          onChange={(e) => {
                            const newAssets = [...(record.onChainAssets || [])];
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            newAssets[index].positions[posIndex].apr = value;
                            setRecord({ ...record, onChainAssets: newAssets });
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newAssets = [...(record.onChainAssets || [])];
                          newAssets[index].positions.splice(posIndex, 1);
                          setRecord({ ...record, onChainAssets: newAssets });
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* 钱包收益概览 */}
                  {(asset.positions || []).length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">收益概览</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">仓位总价值:</span>
                          <span className="ml-1 font-medium">${(() => {
                            const positionsTotal = (asset.positions || []).reduce((sum, position) => sum + position.valueUSD, 0);
                            return positionsTotal.toFixed(2);
                          })()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">生息价值:</span>
                          <span className="ml-1 font-medium">${calculateWalletYield(asset).yieldValueUSD.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">总APR:</span>
                          <span className="ml-1 font-medium">{calculateWalletYield(asset).totalAPR.toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">日收入:</span>
                          <span className="ml-1 font-medium">${calculateWalletYield(asset).dailyIncome.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">年收入:</span>
                          <span className="ml-1 font-medium">${calculateWalletYield(asset).yearlyIncome.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newAssets = (record.onChainAssets || []).filter((_, i) => i !== index);
                    setRecord({ ...record, onChainAssets: newAssets });
                  }}
                  className="text-red-600 hover:text-red-800 mt-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* 中心化交易所资产 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">中心化交易所资产</h2>
              <button
                type="button"
                onClick={addCEXAsset}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加交易所
              </button>
            </div>
            {(record.cexAssets || []).map((asset, index) => (
              <div key={asset.id} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">交易所</label>
                    <select
                      value={asset.exchange}
                      onChange={(e) => {
                        const newAssets = [...record.cexAssets];
                        newAssets[index].exchange = e.target.value as any;
                        setRecord({ ...record, cexAssets: newAssets });
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="binance">Binance</option>
                      <option value="okx">OKX</option>
                      <option value="bybit">Bybit</option>
                      <option value="bitget">Bitget</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">总价值 (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={asset.totalValueUSD}
                      onChange={(e) => {
                        const newAssets = [...record.cexAssets];
                        newAssets[index].totalValueUSD = parseFloat(e.target.value) || 0;
                        setRecord({ ...record, cexAssets: newAssets });
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                                 <button
                   type="button"
                   onClick={() => {
                     const newAssets = (record.cexAssets || []).filter((_, i) => i !== index);
                     setRecord({ ...record, cexAssets: newAssets });
                   }}
                   className="text-red-600 hover:text-red-800 mt-2"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>

          {/* 银行和券商资产 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">银行和券商资产</h2>
              <button
                type="button"
                onClick={addBankAsset}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加机构
              </button>
            </div>
            {(record.bankAssets || []).map((asset, index) => (
              <div key={asset.id} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">银行/券商</label>
                    <select
                      value={asset.institution}
                      onChange={(e) => {
                        const newAssets = [...(record.bankAssets || [])];
                        newAssets[index].institution = e.target.value as BankAsset['institution'];
                        // 如果是券商，自动设置为股票类型
                        if (e.target.value === '券商') {
                          newAssets[index].depositType = '股票';
                          newAssets[index].currency = 'USD';
                          newAssets[index].exchangeRate = 1;
                        }
                        setRecord({ ...record, bankAssets: newAssets });
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="za bank">ZA Bank</option>
                      <option value="hsbc hk">HSBC HK</option>
                      <option value="bkk bank">BKK Bank</option>
                      <option value="农业银行">农业银行</option>
                      <option value="民生银行">民生银行</option>
                      <option value="券商">券商</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">存款类型</label>
                    <select
                      value={asset.depositType}
                      onChange={(e) => {
                        const newAssets = [...(record.bankAssets || [])];
                        newAssets[index].depositType = e.target.value as BankAsset['depositType'];
                        setRecord({ ...record, bankAssets: newAssets });
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="活期">活期</option>
                      <option value="定期">定期</option>
                      <option value="股票">股票</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">币种</label>
                    <select
                      value={asset.currency}
                      onChange={async (e) => {
                        const newAssets = [...(record.bankAssets || [])];
                        newAssets[index].currency = e.target.value as BankAsset['currency'];
                        // 获取实时汇率
                        const exchangeRate = await getExchangeRateAsync(e.target.value);
                        newAssets[index].exchangeRate = exchangeRate;
                        // 重新计算美元价值
                        newAssets[index].valueUSD = newAssets[index].amount * exchangeRate;
                        setRecord({ ...record, bankAssets: newAssets });
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">美元 (USD)</option>
                      <option value="HKD">港币 (HKD)</option>
                      <option value="CNY">人民币 (CNY)</option>
                      <option value="THB">泰铢 (THB)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">金额</label>
                    <input
                      type="number"
                      step="0.01"
                      value={(asset.amount || 0) || ''}
                      onChange={(e) => {
                        const newAssets = [...(record.bankAssets || [])];
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        newAssets[index].amount = value;
                        newAssets[index].valueUSD = value * newAssets[index].exchangeRate;
                        setRecord({ ...record, bankAssets: newAssets });
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">美元价值</label>
                    <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium">
                      ${(asset.valueUSD || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newAssets = (record.bankAssets || []).filter((_, i) => i !== index);
                    setRecord({ ...record, bankAssets: newAssets });
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              保存更改
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 