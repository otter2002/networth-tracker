# Vercel 部署指南

这个项目已经配置为可以部署到 Vercel，支持前端和后端 API。

**更新**: vercel.json已移除，使用Vercel自动检测配置。

## 部署步骤

### 1. 准备环境变量
确保您的 Neon 数据库正在运行，并获取数据库连接字符串。

### 2. Vercel 部署

#### 方法一：通过 Vercel CLI (推荐)
```bash
# 安装 Vercel CLI (如果还没有安装)
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到预览环境
npm run vercel:preview

# 部署到生产环境
npm run vercel:deploy
```

#### 方法二：通过 Vercel Dashboard
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入这个 Git 仓库
4. Vercel 会自动检测到 Next.js 项目

### 3. 配置环境变量
在 Vercel Dashboard 中设置以下环境变量：

1. 进入项目的 Settings 页面
2. 点击 "Environment Variables"
3. 添加以下变量：
   - `DATABASE_URL`: 您的 Neon 数据库连接字符串
   - `POSTGRES_URL`: 您的 Neon 数据库连接字符串 (备用)

### 4. 数据库迁移
如果需要运行数据库迁移：
```bash
# 本地运行迁移
npm run db:push
```

## 项目特性

- ✅ Next.js 14 App Router
- ✅ 服务器端渲染 (SSR)
- ✅ API Routes 作为 Serverless Functions
- ✅ Neon PostgreSQL 数据库
- ✅ 响应式设计
- ✅ TypeScript 支持
- ✅ Tailwind CSS 样式

## API 端点

部署后，以下 API 端点将可用：
- `GET /api/networth` - 获取所有净资产记录
- `POST /api/networth` - 创建新的净资产记录
- `GET /api/networth/[id]` - 获取特定记录
- `PUT /api/networth/[id]` - 更新特定记录
- `DELETE /api/networth/[id]` - 删除特定记录
- `GET /api/exchange-rates` - 获取汇率数据
- `POST /api/exchange-rates` - 更新汇率数据

## 故障排除

### 1. 数据库连接问题
- 确保 DATABASE_URL 环境变量设置正确
- 检查 Neon 数据库是否正在运行
- 验证连接字符串中的凭据

### 2. 构建错误
- 检查 TypeScript 错误：`npm run lint`
- 确保所有依赖项已安装：`npm install`

### 3. 部署超时
- API 函数在 Vercel 上有 10 秒的执行限制
- 优化数据库查询以减少执行时间

## 性能优化

项目已包含以下优化：
- 服务器组件用于更好的性能
- Neon serverless 数据库连接优化
- Next.js 静态导出配置
- SWC 编译器启用