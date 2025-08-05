import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

// GET - 获取用户的所有净资产记录
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await db
      .select()
      .from(netWorthRecords)
      .where(eq(netWorthRecords.userId, parseInt(session.user.id)))
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
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, totalValue, onChainAssets, cexAssets, bankAssets } = body;

    if (!date || totalValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRecord = await db
      .insert(netWorthRecords)
      .values({
        userId: parseInt(session.user.id),
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