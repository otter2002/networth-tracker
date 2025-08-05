import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgres://neondb_owner:npg_fp6QFIUbgSx9@ep-twilight-bonus-a1qwiq71-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
} satisfies Config; 