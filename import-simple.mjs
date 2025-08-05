import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon('postgres://neondb_owner:npg_MV85stDLEWRX@ep-snowy-pine-a19hjq40-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function importData() {
  try {
    console.log('开始清理旧数据...');
    // 清理现有数据
    await sql`DELETE FROM net_worth_records`;
    
    console.log('开始导入新数据...');
    
    // 手动创建基于文件的数据记录
    const records = [
      {
        date: '2024-03-29',
        total_networth_usd: 2126376.78,
        total_cex_usd: 1800000, // 估计值
        total_onchain_usd: 200000, // 估计值
        total_bank_usd: 126376.78, // 估计值
        assets: {
          'USDC': { amount: 1947779.14, value: 1947779.14 },
          'THB': { amount: 2318990, value: 69337.80 },
          'JPY': { amount: 4015092, value: 27704.13 },
          'HKD': { amount: 1086064.68, value: 139016.28 },
          'CNY': { amount: 405128, value: 73827.37 }
        }
      },
      {
        date: '2024-05-16',
        total_networth_usd: 2257664.73,
        total_cex_usd: 1850000,
        total_onchain_usd: 250000,
        total_bank_usd: 157664.73,
        assets: {
          'USDC': { amount: 1969742, value: 1969742 },
          'THB': { amount: 2315352, value: 69460.56 },
          'HKD': { amount: 1291404.68, value: 164524.96 },
          'CNY': { amount: 531726, value: 74016.26 }
        }
      },
      {
        date: '2024-06-14',
        total_networth_usd: 2277743.78,
        total_cex_usd: 1900000,
        total_onchain_usd: 280000,
        total_bank_usd: 97743.78,
        assets: {
          'USDC': { amount: 1981813.36, value: 1981813.36 },
          'THB': { amount: 2316880, value: 69506.40 },
          'HKD': { amount: 1293291.32, value: 164765.31 },
          'CNY': { amount: 529506, value: 73707.24 }
        }
      },
      {
        date: '2024-07-05',
        total_networth_usd: 2289792.31,
        total_cex_usd: 1950000,
        total_onchain_usd: 300000,
        total_bank_usd: 39792.31,
        assets: {
          'USDC': { amount: 1988472.95, value: 1988472.95 },
          'THB': { amount: 2316880, value: 69506.40 },
          'HKD': { amount: 1291883.97, value: 164585.89 },
          'CNY': { amount: 528999, value: 73636.66 }
        }
      },
      {
        date: '2024-07-17',
        total_networth_usd: 2296201.90,
        total_cex_usd: 2000000,
        total_onchain_usd: 250000,
        total_bank_usd: 46201.90,
        assets: {
          'USDC': { amount: 2000000, value: 2000000 }, // 估计值
          'THB': { amount: 2316880, value: 69506.40 },
          'HKD': { amount: 1291883.97, value: 164585.89 },
          'CNY': { amount: 528999, value: 73636.66 }
        }
      }
    ];

    // 导入每条记录
    for (const record of records) {
      const allAssets = {
        onChain: {},
        cex: record.assets,
        bank: {}
      };
      
      await sql`
        INSERT INTO net_worth_records (
          date, 
          total_value, 
          on_chain_assets, 
          cex_assets, 
          bank_assets
        ) VALUES (
          ${record.date}, 
          ${record.total_networth_usd}, 
          ${JSON.stringify(allAssets.onChain)}, 
          ${JSON.stringify(allAssets.cex)}, 
          ${JSON.stringify(allAssets.bank)}
        )
      `;
      console.log(`导入记录: ${record.date} - $${record.total_networth_usd}`);
    }

    console.log('数据导入完成！');
    console.log(`总共导入了 ${records.length} 条记录`);
    
    // 验证导入结果
    const result = await sql`SELECT COUNT(*) as count FROM net_worth_records`;
    console.log(`数据库中现在有 ${result[0].count} 条记录`);
    
  } catch (error) {
    console.error('导入失败:', error);
  }
}

importData();
