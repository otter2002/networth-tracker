'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, DollarSign } from 'lucide-react';

interface LanguageCurrencyToggleProps {
  onLanguageChange: (language: 'zh' | 'th') => void;
  onCurrencyChange: (currency: 'USD' | 'THB' | 'CNY') => void;
  currentLanguage: 'zh' | 'th';
  currentCurrency: 'USD' | 'THB' | 'CNY';
}

export function LanguageCurrencyToggle({
  onLanguageChange,
  onCurrencyChange,
  currentLanguage,
  currentCurrency
}: LanguageCurrencyToggleProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {/* 语言切换 */}
      <div className="relative" ref={languageRef}>
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Globe className="h-4 w-4 mr-1" />
          {currentLanguage === 'zh' ? '中文' : 'ไทย'}
        </button>
        
        {showLanguageDropdown && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  onLanguageChange('zh');
                  setShowLanguageDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLanguage === 'zh' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => {
                  onLanguageChange('th');
                  setShowLanguageDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLanguage === 'th' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                ไทย
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 货币切换 */}
      <div className="relative" ref={currencyRef}>
        <button
          onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          {currentCurrency}
        </button>
        
        {showCurrencyDropdown && (
          <div className="absolute right-0 mt-2 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  onCurrencyChange('USD');
                  setShowCurrencyDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentCurrency === 'USD' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => {
                  onCurrencyChange('CNY');
                  setShowCurrencyDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentCurrency === 'CNY' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                CNY
              </button>
              <button
                onClick={() => {
                  onCurrencyChange('THB');
                  setShowCurrencyDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentCurrency === 'THB' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                THB
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 