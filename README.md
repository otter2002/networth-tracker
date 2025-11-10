# 净资产追踪器 (Net Worth Tracker)

一个现代化的净资产追踪和财富管理应用，支持多语言和多货币显示。

## 🌟 主要功能

### 📊 资产管理
- **链上资产**: 支持多个钱包地址，每个钱包可添加多个仓位
- **交易所资产**: 支持主流交易所（Binance、OKX、Bitget等）
- **银行资产**: 支持多种银行和券商，实时汇率转换
- **🆕 历史记录模板**: 一键使用历史记录作为新记录的模板，快速创建记录

### 💰 收益分析
- **日收益**: 基于APR计算的每日收益
- **月收益**: 月度收益预测
- **年收益**: 年度收益计算
- **总APR**: 加权平均年化收益率

### 📈 数据可视化
- **净资产趋势图**: 显示净资产变化趋势
- **资产分布图**: 饼图展示各类资产占比
- **净资产组合详情**: 详细的资产构成分析

### 🌐 多语言支持
- **中文**: 完整的中文界面
- **泰语**: 泰语界面支持

### 💱 多货币支持
- **美元 (USD)**: 默认货币
- **人民币 (CNY)**: 人民币计价
- **泰铢 (THB)**: 泰铢计价
- **实时汇率**: 自动获取最新汇率数据

## 🚀 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI组件**: React + TypeScript
- **样式**: Tailwind CSS
- **图表**: Recharts
- **图标**: Lucide React
- **数据库**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **部署**: Vercel
- **汇率API**: exchangerate-api.com

## 📦 安装和运行

### 环境要求
- Node.js 18+
- pnpm (推荐) 或 npm
- PostgreSQL 数据库

### 安装依赖
```bash
pnpm install
```

### 环境变量配置
创建 `.env.local` 文件：
```bash
# Database
POSTGRES_URL=your-neon-database-url

# Exchange Rate API (可选)
EXCHANGE_RATE_API_KEY=your-api-key-here
```

### 数据库设置
```bash
# 生成迁移文件
pnpm db:generate

# 推送数据库结构（开发环境）
pnpm db:push

# 或运行迁移（生产环境）
pnpm db:migrate
```

### 开发模式
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
pnpm start
```

## 🎯 使用指南

### 1. 添加记录
- 点击右上角"添加记录"按钮
- 填写各类资产信息
- 系统自动计算总净资产
- **🆕 使用模板**: 点击"使用历史记录作为模板"快速复制历史记录结构

### 2. 查看历史
- 点击"历史记录"查看所有记录
- 支持编辑和删除历史记录

### 3. 切换语言和货币
- 右上角语言切换：中文/泰语
- 右上角货币切换：USD/CNY/THB

### 4. 资产分类管理

#### 链上资产
- 输入钱包地址和备注名
- 添加多个仓位（代币、价值、APR）
- 系统自动计算钱包总收益

#### 交易所资产
- 选择交易所（Binance、OKX、Bitget等）
- 直接输入总资产价值

#### 银行资产
- 选择银行机构
- 选择存款类型（活期、定期、股票）
- 选择货币（HKD、CNY、USD、THB）
- 输入金额，系统自动计算美元价值

### 5. 🆕 使用历史记录模板

#### 功能特点
- **一键复制**: 从历史记录中选择任意记录作为模板
- **智能处理**: 自动生成新的唯一ID，避免数据冲突
- **日期自动更新**: 使用当前日期，无需手动修改
- **完整结构复制**: 包括所有链上资产、交易所资产、银行资产

#### 使用方法
1. 在添加记录页面点击"使用历史记录作为模板"按钮
2. 从弹出的模态框中浏览历史记录
3. 每个记录显示日期、总价值和资产统计
4. 点击任意记录即可加载为模板
5. 根据需要调整资产信息和数值
6. 保存新记录

#### 适用场景
- **定期记录**: 每月定期记录净资产变化
- **相似结构**: 资产结构基本相同，只需调整数值
- **快速输入**: 避免重复输入相同的钱包地址、银行账户等信息

## 📁 项目结构

```
networth/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主页面
│   ├── add/page.tsx       # 添加记录页面
│   ├── history/page.tsx   # 历史记录页面
│   ├── edit/[id]/page.tsx # 编辑记录页面
│   └── api/               # API路由
├── components/            # React组件
│   ├── NetWorthChart.tsx  # 净资产趋势图
│   ├── AssetBreakdown.tsx # 资产分布图
│   ├── AssetComposition.tsx # 净资产组合详情
│   ├── YieldSummary.tsx   # 收益概览
│   ├── NetWorthSummary.tsx # 净资产概览
│   └── LanguageCurrencyToggle.tsx # 语言货币切换
├── lib/                   # 工具函数
│   ├── data.ts           # 数据处理和存储
│   ├── db.ts             # 数据库连接
│   └── schema.ts         # 数据库模式
├── types/                # TypeScript类型定义
│   └── index.ts         # 接口定义
└── drizzle.config.ts    # Drizzle配置
```

## 🔧 数据模型

### NetWorthRecord
```typescript
interface NetWorthRecord {
  id: string;
  date: string;
  totalValue: number;
  onChainAssets: OnChainAsset[];
  cexAssets: CEXAsset[];
  bankAssets: BankAsset[];
}
```

### OnChainAsset
```typescript
interface OnChainAsset {
  id: string;
  walletAddress: string;
  remark: string;
  positions: OnChainPosition[];
  totalValueUSD: number;
  yieldValueUSD: number;
  totalAPR: number;
  dailyIncome: number;
  monthlyIncome: number;
  yearlyIncome: number;
}
```

## 🌍 多语言支持

### 中文界面
- 净资产追踪器
- 监控您的财富增长
- 收益概览
- 净资产趋势
- 资产分布
- 净资产组合详情

### 泰语界面
- ตัวติดตามสินทรัพย์สุทธิ
- ติดตามการเติบโตของความมั่งคั่งของคุณ
- ภาพรวมรายได้
- แนวโน้มสินทรัพย์สุทธิ
- การกระจายสินทรัพย์
- รายละเอียดพอร์ตโฟลิโอ

## 💱 货币显示

### 美元模式
- 当前净资产: $2.34M
- 日收益: $783.21
- 月收益: $23.5K

### 人民币模式
- 当前净资产: ¥16.9M
- 日收益: ¥5.7K
- 月收益: ¥170K

### 泰铢模式
- 当前净资产: ฿83.4M
- 日收益: ฿27.4K
- 月收益: ฿823K

## 🔄 汇率更新

- 使用 exchangerate-api.com 获取实时汇率
- 1小时缓存机制，避免频繁API调用
- 支持 USD、CNY、THB、HKD 等主要货币
- API失败时使用默认汇率

## 📝 开发说明

### 添加新货币
1. 在 `types/index.ts` 中更新 `Currency` 类型
2. 在相关组件中添加货币符号映射
3. 在 `lib/data.ts` 中添加汇率处理逻辑

### 添加新语言
1. 在 `types/index.ts` 中更新 `Language` 类型
2. 在相关组件中添加语言文本映射
3. 更新日期格式化逻辑

## 🚀 部署到Vercel

### 1. 准备部署
1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 配置环境变量

### 2. Vercel环境变量
在Vercel项目设置中添加以下环境变量：
```
POSTGRES_URL=your-neon-database-url
EXCHANGE_RATE_API_KEY=your-api-key-here
```

### 3. 数据库设置
1. 在Neon中创建PostgreSQL数据库
2. 复制数据库连接URL到环境变量
3. 部署后自动运行数据库迁移

### 4. 部署命令
```bash
# 构建时运行数据库迁移
pnpm db:push
```

## 📸 功能截图

### 主页面
- 净资产概览和趋势图表
- 资产分布图和详细组合
- 多语言和多货币支持

### 添加记录页面
- 完整的资产输入表单
- 🆕 历史记录模板选择功能
- 实时汇率显示和自动计算

### 历史记录页面
- 所有净资产记录列表
- 支持编辑和删除操作
- 净资产变化趋势分析

## 🔄 更新日志

### v1.2.1 (最新 - 2024-11-10)
- 🔧 优化数据库连接配置
- 🔒 改进环境变量安全管理
- 🚀 提升Vercel部署稳定性
- ✨ 完善多语言支持和汇率转换

### v1.2.0
- 🆕 新增历史记录模板功能
- 🚀 优化用户体验，支持一键复制历史记录结构
- 🔧 修复净资产显示和图表错误
- 📊 完善数据库集成和API路由

### v1.1.0
- 📊 集成PostgreSQL数据库
- 🔄 实现完整的CRUD操作
- 🌐 部署到Vercel平台
- 💾 导入历史数据功能

### v1.0.0
- 🎉 初始版本发布
- 📊 基础资产管理功能
- 📈 数据可视化图表
- 🌐 多语言和多货币支持

## 🎯 未来计划

- [ ] 资产自动同步功能
- [ ] 更多币种和语言支持
- [ ] 移动端PWA应用
- [ ] 高级数据分析功能
- [ ] 资产价格提醒功能
- [ ] 多用户支持和权限管理

## 🔗 相关链接

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide React](https://lucide.dev/)
- [Exchange Rate API](https://exchangerate-api.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

## 💝 支持项目

如果这个项目对您有帮助，请给我们一个 ⭐ Star！

## 📧 联系我们

如有问题或建议，请通过 GitHub Issues 联系我们。