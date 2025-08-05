import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 直接测试currencylayer API
    const response = await fetch('https://api.currencylayer.com/live?access_key=a28c6b9408ad6bca14f131c23a613e4f');
    const data = await response.json();
    
    return NextResponse.json({
      success: data.success,
      timestamp: data.timestamp,
      source: data.source,
      quotes: data.quotes,
      sampleRates: {
        CNY: data.quotes?.USDCNY,
        HKD: data.quotes?.USDHKD, 
        THB: data.quotes?.USDTHB
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}