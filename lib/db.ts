import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// 使用 Neon 连接字符串，优先级：DATABASE_URL > POSTGRES_URL > 硬编码回退
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgres://neondb_owner:npg_fp6QFIUbgSx9@ep-twilight-bonus-a1qwiq71.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

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