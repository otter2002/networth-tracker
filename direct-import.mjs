import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon('postgres://neondb_owner:npg_MV85stDLEWRX@ep-snowy-pine-a19hjq40-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function importData() {
  try {
    console.log('开始导入networth.txt数据...');
    
    // 手动解析的数据，基于你提供的networth.txt文件
    const records = [
      {
        date: '2024-03-29',
        cex_assets: 51465 + 666219, // okx + binance
        onchain_assets: 14.14 + 15724 + 1089544, // minner1evm + minner1 sol + minner2
        bank_assets: (2318990 / 35) + 69337.801 + (1086064.68 / 7.8) + 139016.279 + (405128 / 7.2) + 127153 + 73827.3747 // 泰铢 + 其他 + 港币 + 其他 + 人民币 + 其他
      },
      {
        date: '2024-05-16', 
        cex_assets: 491 + 733127, // okx + binance
        onchain_assets: 14 + 3665 + 11787 + 1095845, // minner wallets
        bank_assets: (2315352 / 35) + 69460.56 + 229371 + (1062033.68 / 7.8) + 164524.9562 + (404573 / 7.2) + 127153 + 74016.2592
      },
      {
        date: '2024-06-14',
        cex_assets: 1205.73 + 350236.19 + 42040, // okx + binance + bitget  
        onchain_assets: 14.74 + 3719.7 + 502734 + 609872 + 347178, // minner wallets + onekey
        bank_assets: (2316880 / 35) + 69506.4 + 231528.29 + (1061763.03 / 7.8) + 164765.3142 + (402339 / 7.2) + 127167 + 73707.2352
      },
      {
        date: '2024-07-05',
        cex_assets: 11194 + 558956 + 124750, // okx + binance + bitget
        onchain_assets: 16.55 + 3924 + 206091.4 + 610687 + 348041, // minner wallets
        bank_assets: (2316880 / 35) + 69506.4 + 231453.29 + (1060429.68 / 7.8) + 164585.8904 + (401832 / 7.2) + 127167 + 73636.6608
      },
      {
        date: '2024-07-17',
        cex_assets: 694900, // 从总价值推算
        onchain_assets: 1168761.95,
        bank_assets: 432807.41
      }
    ];

    console.log(`准备导入 ${records.length} 条记录:`);
    
    for (const record of records) {
      // 四舍五入到两位小数
      record.cex_assets = Math.round(record.cex_assets * 100) / 100;
      record.onchain_assets = Math.round(record.onchain_assets * 100) / 100;  
      record.bank_assets = Math.round(record.bank_assets * 100) / 100;
      
      const totalValue = record.cex_assets + record.onchain_assets + record.bank_assets;
      
      console.log(`${record.date}: CEX $${record.cex_assets}, OnChain $${record.onchain_assets}, Bank $${record.bank_assets}, Total $${totalValue}`);
    }
    
    console.log('\n开始导入到数据库...');
    
    for (const record of records) {
      try {
        const totalValue = record.cex_assets + record.onchain_assets + record.bank_assets;
        
        await sql`
          INSERT INTO net_worth_records (date, total_value, cex_assets, on_chain_assets, bank_assets)
          VALUES (
            ${record.date}, 
            ${totalValue}, 
            ${JSON.stringify(record.cex_assets > 0 ? [{
              id: '1',
              exchange: 'CEX',
              positions: [{ id: '1', token: 'USDC', valueUSD: record.cex_assets, apr: 0 }],
              totalValueUSD: record.cex_assets,
              yieldValueUSD: 0,
              totalAPR: 0,
              dailyIncome: 0,
              monthlyIncome: 0,
              yearlyIncome: 0
            }] : [])}, 
            ${JSON.stringify(record.onchain_assets > 0 ? [{
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
            }] : [])}, 
            ${JSON.stringify(record.bank_assets > 0 ? [{
              id: '1',
              bankName: 'Bank',
              positions: [{ id: '1', currency: 'USD', valueUSD: record.bank_assets, apr: 0 }],
              totalValueUSD: record.bank_assets,
              yieldValueUSD: 0,
              totalAPR: 0,
              dailyIncome: 0,
              monthlyIncome: 0,
              yearlyIncome: 0
            }] : [])}
          )
        `;
        console.log(`✓ 成功导入: ${record.date}`);
      } catch (error) {
        console.error(`✗ 导入失败 ${record.date}:`, error.message);
      }
    }
    
    console.log('\n数据导入完成！');
    console.log('你现在可以在 https://networth-tracker-lilac.vercel.app/ 查看历史数据了。');
    
  } catch (error) {
    console.error('导入过程中出错:', error);
  }
}

// 运行导入
importData();
