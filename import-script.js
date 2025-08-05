const fs = require('fs');

// 读取networth.txt文件内容
const content = `3.29 总价值														2126376.78
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
人民币											405128	127153		73827.3747
5.16 总价值 usd														2257664.73
	okx钱包+okx	minner1evm	minner1 sol	minner2	minner3		binance		hsbc	za bank	农行	民生	曼谷	总量
usdc	491	14	3665	11787	1095845		733127			124813				1969742
sol														0
eth														0
usds														0
vbio														0
penggu														0
btc														0
泰铢													2315352	69460.56
日元														0
港币									229371	1062033.68				164524.9562
人民币											404573	127153		74016.2592
6.14 总价值 usd														2277743.775
	okx钱包+okx	minner1evm	minner1 sol	minner2	minner3	onekey pro	binance+bn钱包	bitget	hsbc+长桥	za bank	农行	民生	曼谷	总量
usdc	1205.73	14.74	3719.7	502734	609872	347178	350236.19	42040		124813				1981813.36
sol														0
eth														0
usds														0
vbio														0
penggu														0
btc														0
泰铢													2316880	69506.4
日元														0
港币									231528.29	1061763.03				164765.3142
人民币											402339	127167		73707.2352
7.5 总价值 usd														2289792.309
	okx钱包+okx	minner1evm	minner1 sol	minner2	minner3	onekey pro	binance+bn钱包	bitget+bybit+bakcpack	hsbc+长桥	za bank	农行	民生	曼谷	总量
usdc	11194	16.55	3924	206091.4	610687	348041	558956	124750		124813				1988472.95
sol														0
eth														0
usds														0
vbio														0
penggu														0
btc														0
泰铢													2316880	69506.4
日元														0
港币									231453.29	1060429.68				164585.8904
人民币											401832	127167		73636.6608
7.17 总价值 usd														2296201.901`;

// 调用导入API
async function importData() {
  try {
    const response = await fetch('https://networth-tracker-lilac.vercel.app/api/import-networth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileContent: content }),
    });

    const result = await response.json();
    console.log('导入结果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('导入失败:', error);
  }
}

importData();
