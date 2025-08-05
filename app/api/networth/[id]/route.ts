import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET - 获取单个净资产记录
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = await db
      .select()
      .from(netWorthRecords)
      .where(eq(netWorthRecords.id, parseInt(params.id)))
      .limit(1);

    if (!record[0]) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(record[0]);
  } catch (error) {
    console.error('Error fetching net worth record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - 更新净资产记录
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, totalValue, onChainAssets, cexAssets, bankAssets } = body;

    if (!date || totalValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedRecord = await db
      .update(netWorthRecords)
      .set({
        date,
        totalValue,
        onChainAssets,
        cexAssets,
        bankAssets,
        updatedAt: new Date(),
      })
      .where(eq(netWorthRecords.id, parseInt(params.id)))
      .returning();

    if (!updatedRecord[0]) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRecord[0]);
  } catch (error) {
    console.error('Error updating net worth record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - 删除净资产记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedRecord = await db
      .delete(netWorthRecords)
      .where(eq(netWorthRecords.id, parseInt(params.id)))
      .returning();

    if (!deletedRecord[0]) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting net worth record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 