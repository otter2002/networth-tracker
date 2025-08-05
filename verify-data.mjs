import { neon } from '@neondatabase/serverless';

const sql = neon('postgres://neondb_owner:npg_MV85stDLEWRX@ep-snowy-pine-a19hjq40-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function checkData() {
  try {
    console.log('🔍 正在检查 Vercel 后端数据库状态...');
    
    // 检查数据记录数
    const count = await sql`SELECT COUNT(*) as count FROM net_worth_records`;
    console.log(`✅ 数据库中有 ${count[0].count} 条记录`);
    
    if (count[0].count > 0) {
      // 查看所有记录
      const records = await sql`SELECT * FROM net_worth_records ORDER BY date`;
      console.log('\n📊 所有记录:');
      records.forEach(record => {
        console.log(`日期: ${record.date}, 总价值: $${record.total_value}`);
      });
      
      console.log('\n✅ 数据已成功导入到 Vercel 后端数据库！');
      console.log('🌐 你现在可以访问 https://networth-tracker-lilac.vercel.app/ 查看数据');
    } else {
      console.log('❌ 数据库为空，需要导入数据');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkData();
