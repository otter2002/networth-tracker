import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { NetWorthRecord } from '@/types';

// GET - 获取所有净资产记录 (Updated for Neon DB)
export async function GET() {
  try {
    let records = await db
      .select()
      .from(netWorthRecords)
      .orderBy(desc(netWorthRecords.date));

    // 转换数据类型，确保数值字段是数字
    const transformedRecords: NetWorthRecord[] = records.map(record => ({
      id: typeof record.id === 'string' ? record.id : record.id.toString(),
      date: record.date,
      totalValue: typeof record.totalValue === 'string' ? parseFloat(record.totalValue) : record.totalValue,
      onChainAssets: record.onChainAssets as any || [],
      cexAssets: record.cexAssets as any || [],
      bankAssets: record.bankAssets as any || []
    }));

    return NextResponse.json(transformedRecords);
  } catch (error) {
    console.error('Error fetching net worth records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - 创建新的净资产记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, totalValue, onChainAssets, cexAssets, bankAssets } = body;

    if (!date || totalValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRecord = await db
      .insert(netWorthRecords)
      .values({
        userId: null, // 不再需要用户ID
        date,
        totalValue,
        onChainAssets,
        cexAssets,
        bankAssets,
      })
      .returning();

    return NextResponse.json(newRecord[0]);
  } catch (error) {
    console.error('Error creating net worth record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}