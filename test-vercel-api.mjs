// 测试 Vercel API 端点
async function testVercelAPI() {
  try {
    console.log('🔍 测试 Vercel API 端点...');
    
    const response = await fetch('https://networth-tracker-lilac.vercel.app/api/networth');
    
    if (!response.ok) {
      console.error('❌ API 响应错误:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ API 错误:', data.error);
      return;
    }
    
    console.log('✅ API 响应成功！');
    console.log(`📊 获取到 ${data.length} 条记录`);
    
    if (data.length > 0) {
      console.log('📈 最新记录:');
      console.log(`日期: ${data[0].date}`);
      console.log(`总价值: $${data[0].totalValue}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testVercelAPI();
