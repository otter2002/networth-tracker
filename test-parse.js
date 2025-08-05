// 测试解析networth.txt格式的脚本

const testContent = `3.29 总价值														2126376.78
	okx钱包+okx	minner1evm	minner1 sol	minner2	minner3		binance		hsbc	za bank	农行	民生	曼谷	总量
usdc	51465	14.14		15724	1089544		666219			124813				1947779.14
sol														0
eth														0
usds														0
vbio														0
penggu														0
btc														0
泰铢													2318990	69337.801
日元									4015092					27704.1348
港币										1086064.68				139016.279
人民币											405128	127153		73827.3747`;

function parseNetworthFile(content) {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const records = [];
  
  let currentRecord = null;
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
      const dateStr = parts[0];
      const totalValueStr = parts[parts.length - 1];
      const totalValue = parseFloat(totalValueStr);
      
      // 转换日期格式
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
        i++; // 跳过表头行
      }
    }
    // 解析USDC行
    else if (line.startsWith('usdc') && currentRecord) {
      console.log('解析USDC行:', line);
      console.log('表头:', headerLine);
      
      // 使用制表符分割
      const parts = line.split('\t').filter(part => part.trim() !== '');
      const headers = headerLine.split('\t').filter(header => header.trim() !== '');
      
      console.log('USDC数据:', parts);
      console.log('表头数据:', headers);
      
      for (let j = 1; j < Math.min(parts.length, headers.length); j++) {
        const valueStr = parts[j]?.trim();
        if (!valueStr || valueStr === '' || valueStr === '0' || isNaN(parseFloat(valueStr))) continue;
        
        const value = parseFloat(valueStr);
        const header = headers[j]?.trim();
        
        console.log(`处理: header=${header}, value=${value}`);
        
        if (value > 0 && header && header !== '总量') {
          // 判断是CEX还是链上钱包
          if (header.includes('okx') && !header.includes('钱包') && !header.includes('minner')) {
            console.log('添加OKX CEX资产:', value);
            currentRecord.cexAssets.push({
              id: `cex_okx_${j}`,
              exchange: 'okx',
              totalValueUSD: value
            });
          } else if (header.includes('binance')) {
            console.log('添加Binance CEX资产:', value);
            currentRecord.cexAssets.push({
              id: `cex_binance_${j}`,
              exchange: 'binance',
              totalValueUSD: value
            });
          } else if (header.includes('minner') || header.includes('onekey') || header.includes('evm') || header.includes('sol')) {
            console.log('添加链上资产:', header, value);
            currentRecord.onChainAssets.push({
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
            });
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

const result = parseNetworthFile(testContent);
console.log('解析结果:', JSON.stringify(result, null, 2));
