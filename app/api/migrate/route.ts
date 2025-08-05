import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid records data' }, { status: 400 });
    }

    const migratedRecords = [];

    for (const record of records) {
      try {
        // 转换旧格式到新格式
        const newRecord = {
          userId: 1, // 使用默认用户ID
          date: record.date,
          totalValue: record.totalValue || 0,
          onChainAssets: record.onChainAssets || [],
          cexAssets: record.cexAssets || [],
          bankAssets: record.bankAssets || [],
        };

        const insertedRecord = await db
          .insert(netWorthRecords)
          .values(newRecord)
          .returning();

        migratedRecords.push(insertedRecord[0]);
      } catch (error) {
        console.error('Error migrating record:', record, error);
        // 继续迁移其他记录
      }
    }

    return NextResponse.json({
      message: `Successfully migrated ${migratedRecords.length} records`,
      migratedCount: migratedRecords.length,
      records: migratedRecords
    });
  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
} 