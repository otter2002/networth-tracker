'use client';

import { useState, useEffect, useRef } from 'react';
  // 密码弹窗相关
  const [auth, setAuth] = useState(false);
  const [showPwd, setShowPwd] = useState(true);
  const [pwd, setPwd] = useState('');
  const pwdInputRef = useRef<HTMLInputElement>(null);
  // 密码校验
  useEffect(() => {
    if (showPwd && pwdInputRef.current) {
      pwdInputRef.current.focus();
    }
  }, [showPwd]);

  const handlePwdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === '675258') {
      setAuth(true);
      setShowPwd(false);
    } else {
      alert('密码错误');
      setPwd('');
      if (pwdInputRef.current) pwdInputRef.current.focus();
    }
  };
import { useRouter } from 'next/navigation';
import { addNetWorthRecord, calculateWalletYield, getExchangeRate, getExchangeRateAsync } from '@/lib/data';
import { ArrowLeft, Save, Plus, Trash2, Copy, History } from 'lucide-react';
import Link from 'next/link';
import ExchangeRateDisplay from '@/components/ExchangeRateDisplay';
import { OnChainAsset, CEXAsset, BankAsset, NetWorthRecord } from '@/types';

export default function AddRecord() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    onChainAssets: [] as OnChainAsset[],
    cexAssets: [] as CEXAsset[],
    bankAssets: [] as BankAsset[]
  });
  const [historicalRecords, setHistoricalRecords] = useState<NetWorthRecord[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // 获取历史记录
  useEffect(() => {
    const fetchHistoricalRecords = async () => {
      try {
        const response = await fetch('/api/networth');
        if (response.ok) {
          const records = await response.json();
          setHistoricalRecords(records);
        }
      } catch (error) {
        console.error('Error fetching historical records:', error);
      }
    };

    fetchHistoricalRecords();
  }, []);

  // 使用历史记录作为模板
  const loadTemplate = (templateRecord: NetWorthRecord) => {
    // 生成新的ID
    const generateNewId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // 深拷贝并更新ID
    const newOnChainAssets = templateRecord.onChainAssets.map(asset => ({
      ...asset,
      id: generateNewId(),
      positions: asset.positions.map(pos => ({
        ...pos,
        id: generateNewId()
      }))
    }));

    const newCexAssets = templateRecord.cexAssets.map(asset => ({
      ...asset,
      id: generateNewId()
    }));

    const newBankAssets = templateRecord.bankAssets.map(asset => ({
      ...asset,
      id: generateNewId()
    }));

    setFormData({
      date: new Date().toISOString().split('T')[0], // 使用今天的日期
      onChainAssets: newOnChainAssets,
      cexAssets: newCexAssets,
      bankAssets: newBankAssets
    });

    setShowTemplateSelector(false);
    setTemplateLoaded(true);
    
    // 3秒后隐藏成功提示
    setTimeout(() => {
      setTemplateLoaded(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 计算总价值
      const onChainTotal = formData.onChainAssets.reduce((sum, asset) => {
        return sum + asset.totalValueUSD;
      }, 0);
      
      const cexTotal = formData.cexAssets.reduce((sum, asset) => sum + asset.totalValueUSD, 0);
      const bankTotal = formData.bankAssets.reduce((sum, asset) => sum + asset.valueUSD, 0);
      const totalValue = onChainTotal + cexTotal + bankTotal;

      const record = {
        date: formData.date,
        totalValue,
        onChainAssets: formData.onChainAssets,
        cexAssets: formData.cexAssets,
        bankAssets: formData.bankAssets
      };

      // 使用API添加记录
      const response = await fetch('/api/networth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (response.ok) {
        router.push('/');
      } else {
        console.error('Failed to add record');
      }
    } catch (error) {
      console.error('Error adding record:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOnChainAsset = () => {
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
    setFormData(prev => ({
      ...prev,
      onChainAssets: [...prev.onChainAssets, newAsset]
    }));
  };

  const addCEXAsset = () => {
    const newAsset: CEXAsset = {
      id: Date.now().toString(),
      exchange: 'binance',
      totalValueUSD: 0
    };
    setFormData(prev => ({
      ...prev,
      cexAssets: [...prev.cexAssets, newAsset]
    }));
  };

  const addBankAsset = () => {
    const newAsset: BankAsset = {
      id: Date.now().toString(),
      institution: 'za bank',
      depositType: '活期',
      currency: 'USD',
      amount: 0,
      exchangeRate: 1,
      valueUSD: 0
    };
    setFormData(prev => ({
      ...prev,
      bankAssets: [...prev.bankAssets, newAsset]
    }));
  };

  // 密码弹窗
  if (showPwd || !auth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <form onSubmit={handlePwdSubmit} className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center min-w-[320px]">
          <h2 className="text-lg font-semibold mb-4">请输入访问密码</h2>
          <input
            ref={pwdInputRef}
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-full text-center"
            placeholder="请输入密码"
            autoFocus
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">确认</button>
        </form>
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
            <h1 className="text-2xl font-bold text-gray-900">添加净资产记录</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
              <button
                type="button"
                onClick={() => setShowTemplateSelector(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <History className="w-4 h-4 mr-2" />
                使用历史记录作为模板
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            {templateLoaded && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ 模板已加载成功！请根据需要调整资产信息和数值
                </p>
              </div>
            )}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 总价值将根据下方填写的资产自动计算
              </p>
            </div>
          </div>

          {/* 汇率显示 */}
          <ExchangeRateDisplay />

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
            {formData.onChainAssets.map((asset, index) => (
              <div key={asset.id} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">钱包地址</label>
                    <input
                      type="text"
                      value={asset.walletAddress}
                      onChange={(e) => {
                        const newAssets = [...formData.onChainAssets];
                        newAssets[index].walletAddress = e.target.value;
                        setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
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
                        const newAssets = [...formData.onChainAssets];
                        newAssets[index].remark = e.target.value;
                        setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
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
                        const newAssets = [...formData.onChainAssets];
                        newAssets[index].totalValueUSD = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
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
                        const newAssets = [...formData.onChainAssets];
                        const newPosition = {
                          id: Date.now().toString(),
                          token: '',
                          valueUSD: 0,
                          apr: 0
                        };
                        newAssets[index].positions.push(newPosition);
                        setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
                      }}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      添加仓位
                    </button>
                  </div>
                  
                  {asset.positions.map((position, posIndex) => (
                    <div key={position.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">代币</label>
                        <input
                          type="text"
                          value={position.token}
                          onChange={(e) => {
                            const newAssets = [...formData.onChainAssets];
                            newAssets[index].positions[posIndex].token = e.target.value;
                            setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
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
                            const newAssets = [...formData.onChainAssets];
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            newAssets[index].positions[posIndex].valueUSD = value;
                            setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
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
                            const newAssets = [...formData.onChainAssets];
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            newAssets[index].positions[posIndex].apr = value;
                            setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newAssets = [...formData.onChainAssets];
                          newAssets[index].positions.splice(posIndex, 1);
                          setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* 钱包收益概览 */}
                  {asset.positions.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">收益概览</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">仓位总价值:</span>
                          <span className="ml-1 font-medium">${(() => {
                            const positionsTotal = asset.positions.reduce((sum, position) => sum + position.valueUSD, 0);
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
                    const newAssets = formData.onChainAssets.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, onChainAssets: newAssets }));
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
            {formData.cexAssets.map((asset, index) => (
              <div key={asset.id} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">交易所</label>
                    <select
                      value={asset.exchange}
                      onChange={(e) => {
                        const newAssets = [...formData.cexAssets];
                        newAssets[index].exchange = e.target.value as any;
                        setFormData(prev => ({ ...prev, cexAssets: newAssets }));
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
                        const newAssets = [...formData.cexAssets];
                        newAssets[index].totalValueUSD = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, cexAssets: newAssets }));
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newAssets = formData.cexAssets.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, cexAssets: newAssets }));
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
            {formData.bankAssets.map((asset, index) => (
              <div key={asset.id} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">银行/券商</label>
                    <select
                      value={asset.institution}
                      onChange={(e) => {
                        const newAssets = [...formData.bankAssets];
                        newAssets[index].institution = e.target.value as BankAsset['institution'];
                        // 如果是券商，自动设置为股票类型
                        if (e.target.value === '券商') {
                          newAssets[index].depositType = '股票';
                          newAssets[index].currency = 'USD';
                          newAssets[index].exchangeRate = 1;
                        }
                        setFormData(prev => ({ ...prev, bankAssets: newAssets }));
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
                        const newAssets = [...formData.bankAssets];
                        newAssets[index].depositType = e.target.value as BankAsset['depositType'];
                        setFormData(prev => ({ ...prev, bankAssets: newAssets }));
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
                        const newAssets = [...formData.bankAssets];
                        newAssets[index].currency = e.target.value as BankAsset['currency'];
                        // 获取实时汇率
                        const exchangeRate = await getExchangeRateAsync(e.target.value);
                        newAssets[index].exchangeRate = exchangeRate;
                        // 重新计算美元价值
                        newAssets[index].valueUSD = newAssets[index].amount * exchangeRate;
                        setFormData(prev => ({ ...prev, bankAssets: newAssets }));
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
                      value={asset.amount || ''}
                      onChange={(e) => {
                        const newAssets = [...formData.bankAssets];
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        newAssets[index].amount = value;
                        newAssets[index].valueUSD = value * newAssets[index].exchangeRate;
                        setFormData(prev => ({ ...prev, bankAssets: newAssets }));
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">美元价值</label>
                    <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium">
                      ${asset.valueUSD.toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newAssets = formData.bankAssets.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, bankAssets: newAssets }));
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
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              保存记录
            </button>
          </div>
        </form>

        {/* 模板选择器模态框 */}
        {showTemplateSelector && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">选择历史记录作为模板</h3>
                  <button
                    type="button"
                    onClick={() => setShowTemplateSelector(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">关闭</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {historicalRecords.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">暂无历史记录</p>
                  ) : (
                    <div className="space-y-3">
                      {historicalRecords.map((record) => (
                        <div 
                          key={record.id} 
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => loadTemplate(record)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {new Date(record.date).toLocaleDateString('zh-CN')}
                                </h4>
                                <span className="text-sm font-medium text-green-600">
                                  ${record.totalValue.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                {record.onChainAssets.length > 0 && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {record.onChainAssets.length}个链上钱包
                                  </span>
                                )}
                                {record.cexAssets.length > 0 && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {record.cexAssets.length}个交易所
                                  </span>
                                )}
                                {record.bankAssets.length > 0 && (
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    {record.bankAssets.length}个银行账户
                                  </span>
                                )}
                              </div>
                            </div>
                            <Copy className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowTemplateSelector(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 