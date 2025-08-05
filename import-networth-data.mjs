import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon('postgres://neondb_owner:npg_MV85stDLEWRX@ep-snowy-pine-a19hjq40-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

// 解析networth.txt文件
function parseNetworthData(content) {
  const lines = content.split('\n');
  const records = [];
  
  let currentDate = '';
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行
    if (!line) continue;
    
    // 检查是否是日期行（如：3.29 总价值 或 5.16 总价值 usd）
    const dateMatch = line.match(/^(\d+\.\d+)\s+总价值/);
    if (dateMatch) {
      currentDate = `2024/${dateMatch[1]}`;
      currentSection = { date: currentDate, data: [] };
      continue;
    }
    
    // 如果在一个数据区域内，收集数据
    if (currentSection && line.includes('\t')) {
      currentSection.data.push(line);
    }
    
    // 当遇到下一个日期或文件结束时，处理当前区域
    if ((dateMatch || i === lines.length - 1) && currentSection && currentSection.data.length > 0) {
      const record = parseSection(currentSection);
      if (record) {
        records.push(record);
      }
    }
  }
  
  return records;
}

function parseSection(section) {
  const { date, data } = section;
  let totalCexUsd = 0;
  let totalOnChainUsd = 0;
  let totalBankUsd = 0;
  
  // 找到USDC行来获取汇率信息
  const usdcLine = data.find(line => line.startsWith('usdc'));
  if (!usdcLine) return null;
  
  const parts = usdcLine.split('\t');
  
  // 解析USDC行的各个部分
  let okxAmount = 0, minnerEvm = 0, minnerSol = 0, minner2 = 0, minner3 = 0;
  let binanceAmount = 0, bitgetAmount = 0, hsbcAmount = 0;
  
  // 提取数值（跳过空值）
  const values = parts.slice(1).map(val => val.trim()).filter(val => val !== '');
  
  if (values.length >= 1) okxAmount = parseFloat(values[0]) || 0;
  if (values.length >= 2) minnerEvm = parseFloat(values[1]) || 0;
  if (values.length >= 3) minnerSol = parseFloat(values[2]) || 0;
  if (values.length >= 4) minner2 = parseFloat(values[3]) || 0;
  if (values.length >= 5) minner3 = parseFloat(values[4]) || 0;
  
  // 查找binance相关的列
  for (let i = 5; i < values.length; i++) {
    const val = parseFloat(values[i]) || 0;
    if (val > 100000) { // 假设大额为交易所资产
      if (i === 5 || i === 6) binanceAmount += val;
      else if (i === 7) bitgetAmount = val;
    }
  }
  
  // 计算CEX资产（交易所资产）
  totalCexUsd = okxAmount + binanceAmount + bitgetAmount;
  
  // 计算链上资产（minner钱包）
  totalOnChainUsd = minnerEvm + minnerSol + minner2 + minner3;
  
  // 处理银行资产行
  for (const line of data) {
    if (line.includes('泰铢') || line.includes('日元') || 
        line.includes('港币') || line.includes('人民币')) {
      const bankParts = line.split('\t');
      const bankValues = bankParts.slice(1).map(val => val.trim()).filter(val => val !== '');
      
      // 银行资产通常在后面的列，需要根据实际格式调整
      for (const val of bankValues) {
        const amount = parseFloat(val) || 0;
        if (amount > 0) {
          // 简单汇率转换（实际应该使用历史汇率）
          if (line.includes('泰铢')) totalBankUsd += amount / 35; // 泰铢兑美元
          else if (line.includes('日元')) totalBankUsd += amount / 150; // 日元兑美元
          else if (line.includes('港币')) totalBankUsd += amount / 7.8; // 港币兑美元
          else if (line.includes('人民币')) totalBankUsd += amount / 7.2; // 人民币兑美元
        }
      }
    }
  }
  
  return {
    date: formatDate(date),
    cex_assets: Math.round(totalCexUsd * 100) / 100,
    onchain_assets: Math.round(totalOnChainUsd * 100) / 100,
    bank_assets: Math.round(totalBankUsd * 100) / 100,
    apr: null
  };
}

function formatDate(dateStr) {
  // 将 2024/3.29 转换为 2024-03-29
  const [year, monthDay] = dateStr.split('/');
  const [month, day] = monthDay.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function importData() {
  try {
    console.log('开始读取和解析networth.txt文件...');
    
    const content = fs.readFileSync('networth.txt', 'utf-8');
    const records = parseNetworthData(content);
    
    console.log(`解析到 ${records.length} 条记录:`);
    records.forEach(record => {
      console.log(`${record.date}: CEX $${record.cex_assets}, OnChain $${record.onchain_assets}, Bank $${record.bank_assets}`);
    });
    
    console.log('\n开始导入到数据库...');
    
    for (const record of records) {
      try {
        // 使用正确的数据库表和字段名
        const totalValue = record.cex_assets + record.onchain_assets + record.bank_assets;
        
        await sql`
          INSERT INTO net_worth_records (date, total_value, cex_assets, on_chain_assets, bank_assets)
          VALUES (${record.date}, ${totalValue}, ${JSON.stringify([{
            id: '1',
            exchange: 'CEX',
            positions: [{ id: '1', token: 'USDC', valueUSD: record.cex_assets, apr: 0 }],
            totalValueUSD: record.cex_assets,
            yieldValueUSD: 0,
            totalAPR: 0,
            dailyIncome: 0,
            monthlyIncome: 0,
            yearlyIncome: 0
          }])}, ${JSON.stringify([{
            id: '1',
            walletAddress: '0x...',
            remark: 'Imported Wallet',
            positions: [{ id: '1', token: 'USDC', valueUSD: record.onchain_assets, apr: 0 }],
            totalValueUSD: record.onchain_assets,
            yieldValueUSD: 0,
            totalAPR: 0,
            dailyIncome: 0,
            monthlyIncome: 0,
            yearlyIncome: 0
          }])}, ${JSON.stringify([{
            id: '1',
            bankName: 'Bank',
            positions: [{ id: '1', currency: 'USD', valueUSD: record.bank_assets, apr: 0 }],
            totalValueUSD: record.bank_assets,
            yieldValueUSD: 0,
            totalAPR: 0,
            dailyIncome: 0,
            monthlyIncome: 0,
            yearlyIncome: 0
          }])})
          ON CONFLICT (date) DO UPDATE SET
            total_value = ${totalValue},
            cex_assets = ${JSON.stringify([{
              id: '1',
              exchange: 'CEX',
              positions: [{ id: '1', token: 'USDC', valueUSD: record.cex_assets, apr: 0 }],
              totalValueUSD: record.cex_assets,
              yieldValueUSD: 0,
              totalAPR: 0,
              dailyIncome: 0,
              monthlyIncome: 0,
              yearlyIncome: 0
            }])},
            on_chain_assets = ${JSON.stringify([{
              id: '1',
              walletAddress: '0x...',
              remark: 'Imported Wallet',
              positions: [{ id: '1', token: 'USDC', valueUSD: record.onchain_assets, apr: 0 }],
              totalValueUSD: record.onchain_assets,
              yieldValueUSD: 0,
              totalAPR: 0,
              dailyIncome: 0,
              monthlyIncome: 0,
              yearlyIncome: 0
            }])},
            bank_assets = ${JSON.stringify([{
              id: '1',
              bankName: 'Bank',
              positions: [{ id: '1', currency: 'USD', valueUSD: record.bank_assets, apr: 0 }],
              totalValueUSD: record.bank_assets,
              yieldValueUSD: 0,
              totalAPR: 0,
              dailyIncome: 0,
              monthlyIncome: 0,
              yearlyIncome: 0
            }])}
        `;
        console.log(`✓ 成功导入: ${record.date}`);
      } catch (error) {
        console.error(`✗ 导入失败 ${record.date}:`, error.message);
      }
    }
    
    console.log('\n数据导入完成！');
    console.log('你现在可以在应用中查看历史数据了。');
    
  } catch (error) {
    console.error('导入过程中出错:', error);
  }
}

// 运行导入
importData();
