// 本地测试脚本：验证汇率方向与银行资产美元价值计算
function migrateBankAssetOldFormat(asset, exchangeRatesCache) {
  const currency = Object.keys(asset.fiatCurrencies)[0];
  const amount = asset.fiatCurrencies[currency];
  const rateCurrencyPerUSD = exchangeRatesCache[currency]; // e.g. 150 (JPY per 1 USD)
  const exchangeRate = rateCurrencyPerUSD && rateCurrencyPerUSD > 0 ? 1 / rateCurrencyPerUSD : 1; // USD per unit
  return {
    id: asset.id,
    institution: asset.institution,
    depositType: '活期',
    currency,
    amount,
    exchangeRate,
    valueUSD: amount * exchangeRate
  };
}

function calculateBankAssetValue(asset) {
  return asset.amount * asset.exchangeRate;
}

// 模拟不同汇率情形（汇率值为 外币 / USD）
const exchangeRatesCache = {
  USD: 1,
  CNY: 7.3,   // 1 USD = 7.3 CNY
  THB: 35.0,  // 1 USD = 35 THB
  JPY: 150.0  // 1 USD = 150 JPY
};

// 测试数据
const oldAssetJPY = { id: 'a1', institution: '民生', fiatCurrencies: { JPY: 15000 } };
const migratedJPY = migrateBankAssetOldFormat(oldAssetJPY, exchangeRatesCache);
console.log('迁移结果 JPY:', migratedJPY);
console.log('calculateBankAssetValue JPY:', calculateBankAssetValue(migratedJPY));

const oldAssetCNY = { id: 'a2', institution: '农行', fiatCurrencies: { CNY: 7300 } };
const migratedCNY = migrateBankAssetOldFormat(oldAssetCNY, exchangeRatesCache);
console.log('迁移结果 CNY:', migratedCNY);
console.log('calculateBankAssetValue CNY:', calculateBankAssetValue(migratedCNY));

const oldAssetTHB = { id: 'a3', institution: 'bkk bank', fiatCurrencies: { THB: 3500 } };
const migratedTHB = migrateBankAssetOldFormat(oldAssetTHB, exchangeRatesCache);
console.log('迁移结果 THB:', migratedTHB);
console.log('calculateBankAssetValue THB:', calculateBankAssetValue(migratedTHB));

// 断言（简单检查）
function approxEqual(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

// JPY: 15000 JPY -> USD = 15000 / 150 = 100
if (!approxEqual(migratedJPY.valueUSD, 100)) {
  console.error('JPY 计算错误:', migratedJPY.valueUSD);
  process.exit(2);
}

// CNY: 7300 CNY -> USD = 7300 / 7.3 = 1000
if (!approxEqual(migratedCNY.valueUSD, 1000)) {
  console.error('CNY 计算错误:', migratedCNY.valueUSD);
  process.exit(2);
}

// THB: 3500 THB -> USD = 3500 / 35 = 100
if (!approxEqual(migratedTHB.valueUSD, 100)) {
  console.error('THB 计算错误:', migratedTHB.valueUSD);
  process.exit(2);
}

console.log('所有断言通过 — 汇率迁移与美元计算正确');
