# 汇率倒数转换修复总结

## 问题描述

日元（JPY）、人民币（CNY）和其他非美元货币在添加或编辑记录时显示严重错误的美元价值。

**示例：**
- 126,475 JPY 显示为 $19,864,163.50 USD ❌
- 应该显示为 $843.83 USD ✓

这个错误导致美元价值被放大了大约 22,800 倍！

## 根本原因

汇率 API 返回的格式是"**外币 per USD**"（例如 150 日元 = 1 美元），但代码直接使用这个值进行乘法计算，没有取倒数转换。

```javascript
// ❌ 错误的计算方式
const exchangeRate = await getExchangeRateAsync('JPY');  // 返回 150
valueUSD = amount * exchangeRate;  // 126475 * 150 = 18,971,250 ❌
```

数据库中的 `exchangeRate` 字段应该存储"**USD per 外币**"格式（即倒数），用于正确计算。

## 修复方案

在获取 API 汇率时应用倒数转换：

```javascript
// ✓ 正确的计算方式
const rateCurrencyPerUSD = await getExchangeRateAsync('JPY');  // 返回 150
const exchangeRate = 1 / rateCurrencyPerUSD;  // 1/150 = 0.00667
valueUSD = amount * exchangeRate;  // 126475 * 0.00667 = 843.83 ✓
```

## 修复位置

### 1. `/app/add/page.tsx` - 添加记录页面

**货币选择处理（第 704-715 行）：**
- 从 API 获取汇率时取倒数
- 存储转换后的值到 `exchangeRate` 字段
- 重新计算美元价值

**金额输入处理（第 732-740 行）：**
- 使用已转换的 `exchangeRate` 计算（无需再次转换）

### 2. `/app/edit/[id]/page.tsx` - 编辑记录页面

应用完全相同的修复逻辑到：
- 货币选择处理
- 金额输入处理

## 验证结果

运行 `test-reciprocal.js` 验证修复：

```
JPY: 126475 JPY → $843.17 USD ✓ (误差 < $1)
CNY: 216160 CNY → $29610.96 USD ✓ (误差 < $2)
THB: 35000 THB → $1000.00 USD ✓
HKD: 78000 HKD → $10000.00 USD ✓
USD: 1000 USD → $1000.00 USD ✓
```

## 与其他代码的一致性

- ✓ `lib/data.ts` 中的 `migrateBankAssets()` 函数已经正确使用倒数转换
- ✓ 该修复现在使添加/编辑表单的逻辑与迁移逻辑保持一致
- ✓ 所有货币现在使用统一的汇率转换格式

## 提交信息

- **844163c**: 修复货币兑换美元价值计算 - 应用倒数转换
- **a733ab1**: 添加汇率倒数转换验证脚本

## 下一步

1. 本地测试前端 (`npm run dev`)
2. 手动测试添加/编辑不同货币的记录
3. 验证显示的美元价值是否正确
4. 如需要，可在生产环境重新计算现有数据的 `valueUSD` 字段
