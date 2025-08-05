import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';
import { desc } from 'drizzle-orm';

// GET - 获取所有净资产记录
export async function GET() {
  try {
    const records = await db
      .select()
      .from(netWorthRecords)
      .orderBy(desc(netWorthRecords.date));

    return NextResponse.json(records);
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