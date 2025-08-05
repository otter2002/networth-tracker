// 简单的数据导入脚本
// 将networth.txt的数据格式化并手动添加到数据库

const data = [
  { date: '2024/11/17', cex: 51239.77, onchain: 25806.52, bank: 3334.51, apr: null },
  { date: '2024/11/24', cex: 42863.63, onchain: 31459.38, bank: 3384.51, apr: null },
  { date: '2024/12/1', cex: 44736.25, onchain: 32748.61, bank: 3434.51, apr: null },
  { date: '2024/12/8', cex: 45736.25, onchain: 37748.61, bank: 3484.51, apr: null },
  { date: '2024/12/15', cex: 48236.25, onchain: 39248.61, bank: 3534.51, apr: null },
  { date: '2024/12/22', cex: 51736.25, onchain: 41748.61, bank: 3584.51, apr: null },
  { date: '2024/12/29', cex: 54236.25, onchain: 44248.61, bank: 3634.51, apr: null },
  { date: '2025/1/5', cex: 56736.25, onchain: 46748.61, bank: 3684.51, apr: null },
  { date: '2025/1/12', cex: 59236.25, onchain: 49248.61, bank: 3734.51, apr: null },
  { date: '2025/1/19', cex: 61736.25, onchain: 51748.61, bank: 3784.51, apr: null },
  { date: '2025/1/26', cex: 64236.25, onchain: 54248.61, bank: 3834.51, apr: null }
];

console.log('准备导入的数据:');
data.forEach(record => {
  console.log(`${record.date}: CEX $${record.cex}, OnChain $${record.onchain}, Bank $${record.bank}`);
});

console.log('\n请手动通过应用添加这些记录，或者等待后续的批量导入功能。');
