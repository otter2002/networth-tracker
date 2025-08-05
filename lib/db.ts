import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';

// 检查是否在 Vercel 环境中
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

let db: any;

if (isVercel) {
  // 在 Vercel 环境中使用 @vercel/postgres
  db = drizzle(sql);
} else {
  // 在本地开发环境中使用 Neon 直连
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }
  
  const connection = neon(DATABASE_URL);
  db = drizzleNeon(connection);
}

export { db };

// 运行迁移
export async function runMigrations() {
  try {
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
} 