// 佛教占卜引擎数据层测试
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'engine', 'data');

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}

console.log('=== 数据层测试 ===');

const g100 = JSON.parse(fs.readFileSync(path.join(dir,'guanyin_100.json'),'utf-8'));
assert(g100.items.length === 100, `观音100签: 100条 (实际${g100.items.length})`);
assert(g100.items[0].poem && g100.items[0].poem.length > 10, '观音首签有签诗');
assert(g100.items[99].poem, '观音尾签有签诗');
assert(g100.items[0].shiyi, '观音首签有诗意');
assert(g100.items[0].jie, '观音首签有解曰');

const ljz = JSON.parse(fs.readFileSync(path.join(dir,'liushijiazi_63.json'),'utf-8'));
assert(ljz.items.length === 63, `六十甲子: 63条 (实际${ljz.items.length})`);
assert(ljz.items.filter(x=>x.no>=1).length === 60, '六十甲子: 60干支签');
assert(ljz.items.filter(x=>x.no===0).length === 3, '六十甲子: 3特签');
assert(ljz.items[3].ganzhi === '甲子', '六十甲子首签甲子');
assert(ljz.items[3].poem.length > 10, '六十甲子首签有诗');

const dz = JSON.parse(fs.readFileSync(path.join(dir,'dizang_60.json'),'utf-8'));
assert(dz.items.length === 60, `地藏60: 60条 (实际${dz.items.length})`);
assert(dz.items[0].poem.length > 10, '地藏首签有诗');
assert(dz.items[59].poem, '地藏尾签有诗');

const fz = JSON.parse(fs.readFileSync(path.join(dir,'fuzu_51.json'),'utf-8'));
assert(fz.items.length === 50, `佛祖51: 50条 (实际${fz.items.length}, 缺45为源文件缺)`);
assert(fz.items[0].poem, '佛祖首签有诗曰');
assert(fz.items[49].poem, '佛祖尾签(51)有诗曰');
assert(fz.items[0].neizhao, '佛祖首签有内兆');

const gj = JSON.parse(fs.readFileSync(path.join(dir,'guanyin_mingjinglun_6.json'),'utf-8'));
assert(gj.items.length === 6, `明镜论: 6卦 (实际${gj.items.length})`);
gj.items.forEach(g => assert(Object.keys(g.items).length >= 6, `卦${g.no} ${g.name} 分项≥6`));

const tm = JSON.parse(fs.readFileSync(path.join(dir,'jixiang_tianmu.json'),'utf-8'));
assert(tm.items.length === 10, `吉祥天母: 10卦完整 (实际${tm.items.length})`);
assert(tm.missing_detail.length === 6, '吉祥天母: 13-18卦缺详细');
assert(Object.keys(tm.jixing_table).length === 16, '吉祥天母: 吉凶表16级');
tm.items.forEach(g => assert(Object.keys(g.items).length >= 15, `点数${g.no} 分项≥15`));

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
