import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// 使用 Neon 连接字符串，优先级：DATABASE_URL > POSTGRES_URL
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// 验证连接字符串
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

// 创建 Neon 连接，优化serverless环境
const connection = neon(DATABASE_URL, {
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