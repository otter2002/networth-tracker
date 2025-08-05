import { neon } from '@neondatabase/serverless';

const sql = neon('postgres://neondb_owner:npg_MV85stDLEWRX@ep-snowy-pine-a19hjq40-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function checkData() {
  try {
    console.log('正在检查 Vercel 后端数据库状态...');
    
    // 检查表是否存在
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'net_worth_records'
    `;
    
    console.log('数据表状态:', tables);
    
    if (tables.length === 0) {
      console.log('❌ 表 net_worth_records 不存在');
      return;
    }
    
    // 检查数据记录数
    const count = await sql`SELECT COUNT(*) as count FROM net_worth_records`;
    console.log(`✅ 数据库中有 ${count[0].count} 条记录`);
    
    // 查看所有记录
    const records = await sql`SELECT * FROM net_worth_records ORDER BY date`;
    console.log('\n📊 所有记录:');
    records.forEach(record => {
      console.log(`日期: ${record.date}, 总价值: $${record.total_value}`);
    });
    
    // 模拟 API 调用格式
    const formattedRecords = records.map(record => ({
      id: record.id,
      date: record.date,
      totalValue: parseFloat(record.total_value),
      onChainAssets: record.on_chain_assets || {},
      cexAssets: record.cex_assets || {},
      bankAssets: record.bank_assets || {}
    }));
    
    console.log('\n🔍 API 格式数据预览:');
    console.log(JSON.stringify(formattedRecords.slice(0, 2), null, 2));
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkData();
