import { pgTable, serial, text, timestamp, integer, decimal, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 净资产记录表
export const netWorthRecords = pgTable('net_worth_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }), // 可选字段
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  onChainAssets: jsonb('on_chain_assets'), // JSON格式存储
  cexAssets: jsonb('cex_assets'), // JSON格式存储
  bankAssets: jsonb('bank_assets'), // JSON格式存储
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 汇率缓存表
export const exchangeRates = pgTable('exchange_rates', {
  id: serial('id').primaryKey(),
  currency: varchar('currency', { length: 10 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 6 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
  netWorthRecords: many(netWorthRecords),
}));

export const netWorthRecordsRelations = relations(netWorthRecords, ({ one }) => ({
  user: one(users, {
    fields: [netWorthRecords.userId],
    references: [users.id],
  }),
})); 