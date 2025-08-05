'use client';

import { useState, useEffect } from 'react';
import { getExchangeRate, fetchExchangeRates } from '@/lib/data';
import { RefreshCw } from 'lucide-react';

export default function ExchangeRateDisplay() {
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const currencies = [
    { code: 'USD', name: '美元' },
    { code: 'HKD', name: '港币' },
    { code: 'CNY', name: '人民币' },
    { code: 'THB', name: '泰铢' }
  ];

  const updateRates = async () => {
    setLoading(true);
    try {
      await fetchExchangeRates();
      const currentRates = currencies.reduce((acc, currency) => {
        acc[currency.code] = getExchangeRate(currency.code);
        return acc;
      }, {} as { [key: string]: number });
      
      setRates(currentRates);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('更新汇率失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateRates();
    const timer = setInterval(updateRates, 60000); // 60秒自动刷新
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-900">实时汇率 (对美元)</h3>
        <button
          type="button"
          onClick={updateRates}
          disabled={loading}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {currencies.map(currency => (
          <div key={currency.code} className="text-center">
            <div className="text-xs text-gray-500">{currency.name}</div>
            <div className="text-sm font-medium">
              {currency.code === 'USD' ? '1.000' : rates[currency.code]?.toFixed(4) || '...'}
            </div>
          </div>
        ))}
      </div>
      
      {lastUpdate && (
        <div className="text-xs text-gray-400 mt-2 text-center">
          最后更新: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
} 