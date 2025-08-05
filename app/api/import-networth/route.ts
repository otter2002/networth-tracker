import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { netWorthRecords } from '@/lib/schema';
import { NetWorthRecord, OnChainAsset, CEXAsset, BankAsset } from '@/types';

// 解析networth.txt文件的函数
function parseNetworthFile(content: string): NetWorthRecord[] {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const records: NetWorthRecord[] = [];
  
  let currentRecord: NetWorthRecord | null = null;
  let headerLine = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检查是否是日期和总价值行
    if (line.match(/^\d+\.\d+\s+总价值.*\d+(\.\d+)?$/)) {
      // 保存之前的记录
      if (currentRecord) {
        records.push(currentRecord);
      }
      
      // 解析日期和总价值
      const parts = line.split(/\s+/);
      const dateStr = parts[0]; // 如 "3.29"
      const totalValue = parseFloat(parts[parts.length - 1]);
      
      // 转换日期格式 (假设是2024年)
      const [month, day] = dateStr.split('.');
      const date = `2024-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      currentRecord = {
        id: `import_${records.length + 1}`,
        date,
        totalValue,
        onChainAssets: [],
        cexAssets: [],
        bankAssets: []
      };
      
      // 下一行应该是表头
      if (i + 1 < lines.length) {
        headerLine = lines[i + 1];
      }
    }
    // 解析USDC行
    else if (line.startsWith('usdc') && currentRecord) {
      const parts = line.split(/\s+/);
      // parts[0] = 'usdc', 然后是各个钱包的数值
      
      // 根据表头解析每列对应的钱包
      const headers = headerLine.split(/\s+/);
      
      for (let j = 1; j < Math.min(parts.length, headers.length); j++) {
        const valueStr = parts[j];
        if (!valueStr || valueStr === '' || isNaN(parseFloat(valueStr))) continue;
        
        const value = parseFloat(valueStr);
        const header = headers[j];
        
        if (value > 0 && header && header !== '总量') {
          // 判断是CEX还是链上钱包
          if (header.includes('okx') && !header.includes('钱包') && !header.includes('evm') && !header.includes('sol')) {
            // CEX资产
            const existingCex = currentRecord.cexAssets.find(asset => asset.exchange === 'okx');
            if (existingCex) {
              existingCex.totalValueUSD += value;
            } else {
              const cexAsset: CEXAsset = {
                id: `cex_okx_${j}`,
                exchange: 'okx',
                totalValueUSD: value
              };
              currentRecord.cexAssets.push(cexAsset);
            }
          } else if (header.includes('binance')) {
            const existingCex = currentRecord.cexAssets.find(asset => asset.exchange === 'binance');
            if (existingCex) {
              existingCex.totalValueUSD += value;
            } else {
              const cexAsset: CEXAsset = {
                id: `cex_binance_${j}`,
                exchange: 'binance',
                totalValueUSD: value
              };
              currentRecord.cexAssets.push(cexAsset);
            }
          } else if (header.includes('bitget') || header.includes('bybit') || header.includes('bakcpack')) {
            const existingCex = currentRecord.cexAssets.find(asset => asset.exchange === 'bitget');
            if (existingCex) {
              existingCex.totalValueUSD += value;
            } else {
              const cexAsset: CEXAsset = {
                id: `cex_bitget_${j}`,
                exchange: 'bitget',
                totalValueUSD: value
              };
              currentRecord.cexAssets.push(cexAsset);
            }
          } else if (header.includes('minner') || header.includes('onekey') || header.includes('evm') || header.includes('sol')) {
            // 链上资产
            const onChainAsset: OnChainAsset = {
              id: `wallet_${header.replace(/[^a-zA-Z0-9]/g, '_')}_${j}`,
              walletAddress: '0x...',
              remark: header,
              positions: [
                { id: `pos_${j}`, token: 'USDC', valueUSD: value, apr: 0 }
              ],
              totalValueUSD: value,
              yieldValueUSD: 0,
              totalAPR: 0,
              dailyIncome: 0,
              monthlyIncome: 0,
              yearlyIncome: 0
            };
            currentRecord.onChainAssets.push(onChainAsset);
          }
        }
      }
    }
    // 解析银行资产
    else if ((line.includes('泰铢') || line.includes('日元') || line.includes('港币') || line.includes('人民币')) && currentRecord) {
      const parts = line.split(/\s+/);
      const currency = parts[0];
      
      // 查找银行对应的金额
      const headers = headerLine.split(/\s+/);
      
      for (let j = 1; j < Math.min(parts.length, headers.length); j++) {
        const valueStr = parts[j];
        if (!valueStr || valueStr === '' || isNaN(parseFloat(valueStr))) continue;
        
        const value = parseFloat(valueStr);
        const header = headers[j];
        
        if (value > 0 && header && header !== '总量') {
          let institution = '';
          let currencyCode = '';
          let exchangeRate = 0;
          
          // 根据header和currency确定银行和汇率
          if (currency === '泰铢' && header.includes('曼谷')) {
            institution = 'bkk bank';
            currencyCode = 'THB';
            exchangeRate = 0.028;
          } else if (currency === '日元' && (header.includes('za') || header.includes('bank'))) {
            institution = 'za bank';
            currencyCode = 'JPY';
            exchangeRate = 0.0069;
          } else if (currency === '港币') {
            if (header.includes('hsbc') || header.includes('长桥')) {
              institution = 'hsbc hk';
            } else {
              institution = 'hsbc hk';
            }
            currencyCode = 'HKD';
            exchangeRate = 0.128;
          } else if (currency === '人民币') {
            if (header.includes('农行')) {
              institution = '农业银行';
            } else if (header.includes('民生')) {
              institution = '民生银行';
            } else {
              institution = '中国银行';
            }
            currencyCode = 'CNY';
            exchangeRate = 0.138;
          }
          
          if (institution) {
            const bankAsset: BankAsset = {
              id: `bank_${institution.replace(/[^a-zA-Z0-9]/g, '_')}_${j}`,
              institution: institution as any,
              depositType: '活期',
              currency: currencyCode as any,
              amount: value,
              exchangeRate,
              valueUSD: value * exchangeRate
            };
            currentRecord.bankAssets.push(bankAsset);
          }
        }
      }
    }
  }
  
  // 添加最后一条记录
  if (currentRecord) {
    records.push(currentRecord);
  }
  
  return records;
}

// POST - 导入networth.txt数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileContent } = body;
    
    if (!fileContent) {
      return NextResponse.json({ error: 'File content is required' }, { status: 400 });
    }
    
    // 解析文件内容
    const parsedRecords = parseNetworthFile(fileContent);
    
    if (parsedRecords.length === 0) {
      return NextResponse.json({ error: 'No valid records found in file' }, { status: 400 });
    }
    
    // 清空现有数据
    await db.delete(netWorthRecords);
    
    // 插入解析的数据
    const insertedRecords = [];
    for (const record of parsedRecords) {
      const result = await db
        .insert(netWorthRecords)
        .values({
          userId: null,
          date: record.date,
          totalValue: record.totalValue.toString(),
          onChainAssets: record.onChainAssets,
          cexAssets: record.cexAssets,
          bankAssets: record.bankAssets,
        })
        .returning();
      
      insertedRecords.push(result[0]);
    }
    
    return NextResponse.json({
      message: `Successfully imported ${insertedRecords.length} records from networth.txt`,
      count: insertedRecords.length,
      records: insertedRecords
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: 'Import failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
