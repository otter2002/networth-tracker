# 净资产追踪器 (Net Worth Tracker)

一个现代化的净资产追踪和财富管理应用，支持多语言和多货币显示。

## 🌟 主要功能

### 📊 资产管理
- **链上资产**: 支持多个钱包地址，每个钱包可添加多个仓位
- **交易所资产**: 支持主流交易所（Binance、OKX、Bitget等）
- **银行资产**: 支持多种银行和券商，实时汇率转换

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
- **数据存储**: Browser Local Storage
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
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
POSTGRES_URL=postgresql://username:password@localhost:5432/networth

# Exchange Rate API
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

## 📁 项目结构

```
networth/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主页面
│   ├── add/page.tsx       # 添加记录页面
│   ├── history/page.tsx   # 历史记录页面
│   └── edit/[id]/page.tsx # 编辑记录页面
├── components/            # React组件
│   ├── NetWorthChart.tsx  # 净资产趋势图
│   ├── AssetBreakdown.tsx # 资产分布图
│   ├── AssetComposition.tsx # 净资产组合详情
│   ├── YieldSummary.tsx   # 收益概览
│   ├── NetWorthSummary.tsx # 净资产概览
│   └── LanguageCurrencyToggle.tsx # 语言货币切换
├── lib/                   # 工具函数
│   └── data.ts           # 数据处理和存储
├── types/                # TypeScript类型定义
│   └── index.ts         # 接口定义
└── networth.txt         # 历史数据文件
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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🚀 部署到Vercel

### 1. 准备部署
1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 配置环境变量

### 2. Vercel环境变量
在Vercel项目设置中添加以下环境变量：
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
POSTGRES_URL=your-vercel-postgres-url
EXCHANGE_RATE_API_KEY=your-api-key-here
```

### 3. 数据库设置
1. 在Vercel中创建PostgreSQL数据库
2. 复制数据库连接URL到环境变量
3. 部署后运行数据库迁移

### 4. 部署命令
```bash
# 构建时运行数据库迁移
pnpm db:migrate
```

## 🔗 相关链接

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide React](https://lucide.dev/)
- [Exchange Rate API](https://exchangerate-api.com/) 