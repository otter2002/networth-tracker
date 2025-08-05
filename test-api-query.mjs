import { neon } from '@neondatabase/serverless';

const sql = neon('postgres://neondb_owner:npg_MV85stDLEWRX@ep-snowy-pine-a19hjq40-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function testAPIQuery() {
  try {
    console.log('测试 API 查询...');
    
    // 模拟 API 的查询方式
    const records = await sql`
      SELECT * FROM net_worth_records 
      ORDER BY date DESC
    `;
    
    console.log(`查询到 ${records.length} 条记录`);
    
    if (records.length > 0) {
      console.log('第一条记录:', records[0]);
      
      // 转换为 API 格式
      const formatted = records.map(record => ({
        id: record.id,
        date: record.date,
        totalValue: parseFloat(record.total_value || '0'),
        onChainAssets: record.on_chain_assets || {},
        cexAssets: record.cex_assets || {},
        bankAssets: record.bank_assets || {}
      }));
      
      console.log('API 响应格式预览:');
      console.log(JSON.stringify(formatted[0], null, 2));
    }
    
  } catch (error) {
    console.error('查询失败:', error);
  }
}

testAPIQuery();
