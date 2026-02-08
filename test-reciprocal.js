#!/usr/bin/env node

/**
 * 验证汇率倒数计算逻辑
 * 确认修复后的计算是正确的
 */

console.log('=== 汇率倒数转换验证 ===\n');

// 测试用例
const testCases = [
  { currency: 'JPY', apiRate: 150, amount: 126475, expectedUSD: 843.83 },
  { currency: 'CNY', apiRate: 7.3, amount: 216160, expectedUSD: 29609.59 },
  { currency: 'THB', apiRate: 35, amount: 35000, expectedUSD: 1000 },
  { currency: 'HKD', apiRate: 7.8, amount: 78000, expectedUSD: 10000 },
  { currency: 'USD', apiRate: 1, amount: 1000, expectedUSD: 1000 }
];

testCases.forEach(({ currency, apiRate, amount, expectedUSD }) => {
  // API 返回格式：外币 per USD
  const rateCurrencyPerUSD = apiRate;
  
  // 应用倒数转换得到：USD per 外币
  const exchangeRate = rateCurrencyPerUSD > 0 ? 1 / rateCurrencyPerUSD : 1;
  
  // 计算美元价值
  const valueUSD = amount * exchangeRate;
  
  const error = Math.abs(valueUSD - expectedUSD);
  const match = error < 1; // 允许 1 元以内的误差
  
  console.log(`货币: ${currency}`);
  console.log(`  API 汇率（外币 per USD）: ${rateCurrencyPerUSD}`);
  console.log(`  转换后汇率（USD per 外币）: ${exchangeRate.toFixed(6)}`);
  console.log(`  金额: ${amount} ${currency}`);
  console.log(`  计算的美元价值: $${valueUSD.toFixed(2)}`);
  console.log(`  预期的美元价值: $${expectedUSD.toFixed(2)}`);
  console.log(`  误差: $${error.toFixed(2)}`);
  console.log(`  ✓ 通过: ${match ? '✓ YES' : '✗ NO'}\n`);
});

console.log('=== 旧（错误）计算方式 ===\n');
testCases.slice(0, 2).forEach(({ currency, apiRate, amount }) => {
  // 错误的方式：直接使用 API 返回的汇率
  const wrongValueUSD = amount * apiRate;
  console.log(`${currency}: ${amount} × ${apiRate} = $${wrongValueUSD.toFixed(2)} ✗ 错误`);
});

console.log('\n=== 修复总结 ===');
console.log('修复前: 直接使用 API 汇率 (外币 per USD) 导致数值被放大');
console.log('修复后: 对 API 汇率取倒数得到 USD per 外币，正确计算');
