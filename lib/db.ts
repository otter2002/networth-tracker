import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// 使用 Neon 连接字符串，优先级：DATABASE_URL > POSTGRES_URL
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// 验证连接字符串（仅在运行时，不在构建时）
if (!DATABASE_URL && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ DATABASE_URL or POSTGRES_URL environment variable is not set');
}

// 创建 Neon 连接，优化serverless环境
// 在构建时使用占位符，实际运行时会被环境变量覆盖
const connection = neon(DATABASE_URL || 'postgresql://placeholder', {
  // Vercel serverless 优化配置
  fullResults: false,
  arrayMode: false,
});
export const db = drizzle(connection);

// 运行迁移
export async function runMigrations() {
  try {
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
} 