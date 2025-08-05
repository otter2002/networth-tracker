import { NextResponse } from 'next/server';

// 直接使用免费的汇率API
export async function GET() {
  try {
    // 使用exchangerate-api.com的免费API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (data.rates) {
      console.log('Exchange-api.com响应:', data);
      
      // 提取我们需要的汇率
      const rates = {
        USD: 1,
        CNY: data.rates.CNY || 7.3,
        HKD: data.rates.HKD || 7.8,
        THB: data.rates.THB || 35.0
      };
      
      console.log('处理后的汇率:', rates);
      return NextResponse.json(rates);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Exchange rate API error:', error);
    
    // 返回当前市场汇率作为备用
    const defaultRates = {
      USD: 1,
      CNY: 7.25,  // 当前人民币汇率约7.25
      HKD: 7.82,  // 港币汇率约7.82
      THB: 35.5   // 泰铢汇率约35.5
    };
    
    return NextResponse.json(defaultRates);
  }
}