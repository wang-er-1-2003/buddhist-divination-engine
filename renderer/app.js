// SPDX-License-Identifier: MIT
// Copyright (c) 2026 wang-er-1-2003
// 佛教占卜引擎 - 渲染层
'use strict';

let DATA = null;
let curQianben = 'guanyin100';

async function init() {
  DATA = await window.fozhan.data();
  if (!DATA || !DATA.ok) {
    document.getElementById('result').innerHTML = '<div class="placeholder" style="color:#f66">数据加载失败</div>';
    return;
  }
  // Tab 切换
  document.querySelectorAll('.tabbar button[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      document.querySelectorAll('.tabbar button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
  // 签本切换
  document.getElementById('qianben').addEventListener('change', (e) => {
    curQianben = e.target.value;
    updateMaxNo();
    showPlaceholder();
  });
  // 摇签
  document.getElementById('btnDraw').addEventListener('click', draw);
  // 直查
  document.getElementById('btnLookup').addEventListener('click', lookup);
  document.getElementById('inputNo').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') lookup();
  });
  updateMaxNo();
}

function updateMaxNo() {
  const items = getItems();
  const max = Math.max(...items.filter(x=>x.no>0).map(x=>x.no));
  const inp = document.getElementById('inputNo');
  inp.max = max;
  inp.placeholder = `1-${max}`;
}

function lookup() {
  const items = getItems();
  const no = parseInt(document.getElementById('inputNo').value);
  if (!no || isNaN(no)) {
    alert('请输入签号');
    return;
  }
  const found = items.find(x => x.no === no);
  if (!found) {
    document.getElementById('result').innerHTML = `<div class="placeholder" style="color:#f66">第${no}签不存在（本签本共 ${items.filter(x=>x.no>0).length} 签）</div>`;
    return;
  }
  renderQian(found);
}

function getItems() {
  if (curQianben === 'guanyin100') return DATA.guanyin100.items;
  if (curQianben === 'liushijiazi') return DATA.liushijiazi.items;
  if (curQianben === 'dizang60') return DATA.dizang60.items;
  if (curQianben === 'fuzu51') return DATA.fuzu51.items;
  return [];
}

function showPlaceholder() {
  document.getElementById('result').innerHTML = '<div class="placeholder">选择签本后点「摇签」</div>';
}

function classifyJi(jiStr) {
  if (!jiStr) return '';
  if (/大吉|上上|上吉|上签|吉$|吉祥|平安|之卦$/.test(jiStr) && !/凶|下/.test(jiStr)) return 'ji-吉';
  if (/中|平/.test(jiStr)) return 'ji-中';
  if (/凶|下|大凶/.test(jiStr)) return 'ji-凶';
  return 'ji-中';
}

function draw() {
  const items = getItems();
  if (!items || !items.length) return;
  // 摇签动画
  const shaker = document.querySelector('.shaker');
  const btn = document.getElementById('btnDraw');
  btn.disabled = true;
  shaker.classList.add('shaking');
  setTimeout(() => {
    shaker.classList.remove('shaking');
    btn.disabled = false;
    const idx = Math.floor(Math.random() * items.length);
    renderQian(items[idx]);
  }, 800);
}

function renderQian(q) {
  const el = document.getElementById('result');
  let html = '<div class="qian-result">';
  // 标题
  if (curQianben === 'guanyin100') {
    html += `<div class="qian-no">第${cnNum(q.no)}签</div>`;
    html += `<span class="qian-ji ${classifyJi(q.ji)}">${q.ji}</span>`;
    if (q.gong) html += `<span class="qian-meta">${q.gong}</span>`;
    if (q['典故']) html += `<span class="qian-meta">典故：${q['典故']}</span>`;
    if (q.poem) html += `<div class="qian-poem">${q.poem}</div>`;
    if (q.shiyi) html += `<div class="qian-detail"><b>诗意：</b>${q.shiyi}</div>`;
    if (q.jie) html += `<div class="qian-detail"><b>解曰：</b>${q.jie}</div>`;
  } else if (curQianben === 'liushijiazi') {
    if (q.no === 0) {
      html += `<div class="qian-no">${q.label}</div>`;
    } else {
      html += `<div class="qian-no">第${cnNum(q.no)}签 · ${q.ganzhi}</div>`;
    }
    if (q.yinyang) html += `<span class="qian-meta">阴阳：${q.yinyang}</span>`;
    if (q.wuxing) html += `<span class="qian-meta">${q.wuxing}</span>`;
    if (q.poem) html += `<div class="qian-poem">${q.poem}</div>`;
  } else if (curQianben === 'dizang60') {
    html += `<div class="qian-no">第${q.no}签</div>`;
    if (q.gong) html += `<span class="qian-meta">${q.gong}</span>`;
    if (q.ji) html += `<span class="qian-ji ${classifyJi(q.ji)}">${q.ji}</span>`;
    if (q['典故']) html += `<span class="qian-meta">${q['典故']}</span>`;
    if (q.poem) html += `<div class="qian-poem">${q.poem}</div>`;
  } else if (curQianben === 'fuzu51') {
    html += `<div class="qian-no">第${q.no}签</div>`;
    if (q.dianGu) html += `<span class="qian-meta">${q.dianGu}</span>`;
    if (q.ji) html += `<span class="qian-ji ${classifyJi(q.ji)}">${q.ji}</span>`;
    if (q.zhao) html += `<span class="qian-meta">${q.zhao}</span>`;
    if (q.shengxiao) html += `<span class="qian-meta">${q.shengxiao}</span>`;
    if (q.neizhao) html += `<div class="qian-detail"><b>内兆：</b>${q.neizhao}</div>`;
    if (q.poem) html += `<div class="qian-poem">${q.poem}</div>`;
    if (q.xiwen) html += `<div class="qian-detail"><b>戏文：</b>${q.xiwen}</div>`;
  }
  html += '</div>';
  el.innerHTML = html;
}

function cnNum(n) {
  if (n <= 10) return ['零','一','二','三','四','五','六','七','八','九','十'][n] || n;
  if (n < 20) return '十' + ['','一','二','三','四','五','六','七','八','九'][n-10];
  if (n < 100) {
    const t = Math.floor(n/10), o = n%10;
    return ['','','二十','三十','四十','五十','六十','七十','八十','九十'][t] + (o ? ['一','二','三','四','五','六','七','八','九'][o-1] : '');
  }
  return n;
}

init();

// ========== Tab2 观音32课 ==========
const WUXING = ['金','木','水','火','土'];
const g32State = { 金:false, 木:false, 水:false, 火:false, 土:false };
function initG32() {
  const wrap = document.getElementById('wuxingBtns');
  wrap.innerHTML = '';
  WUXING.forEach(w => {
    const b = document.createElement('button');
    b.textContent = w + '（字面朝上？）';
    b.style.cssText = 'padding:10px;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#888;cursor:pointer;font-size:15px';
    b.onclick = () => {
      g32State[w] = !g32State[w];
      b.textContent = w + (g32State[w] ? ' ✓ 字面' : ' ○ 幕面');
      b.style.background = g32State[w] ? '#b8860b' : '#0f3460';
      b.style.color = g32State[w] ? '#1a1a2e' : '#888';
    };
    wrap.appendChild(b);
  });
  document.getElementById('btnG32').onclick = lookupG32;
  document.getElementById('btnG32Lookup').onclick = () => {
    const n = parseInt(document.getElementById('g32No').value);
    if (n>=1 && n<=32) renderG32(DATA.guanyin32.items[n-1]);
  };
}
function lookupG32() {
  // 按wx字符串匹配：wx是"金木水火土"或"金○水○土"格式
  const wx = WUXING.map(w => g32State[w] ? w : '○').join('');
  const found = DATA.guanyin32.items.find(it => it.wx === wx);
  if (!found) {
    document.getElementById('result').innerHTML = `<div class="placeholder" style="color:#f66">组合「${wx}」未找到对应课（共32种组合）</div>`;
    return;
  }
  renderG32(found);
}
function renderG32(it) {
  const el = document.getElementById('result');
  el.innerHTML = `<div class="qian-result" style="text-align:left">
    <div class="qian-no" style="text-align:center">第${it.no}课 · ${it.name}</div>
    <div style="text-align:center">
      <span class="qian-ji ${classifyJi(it.ji)}">${it.ji}</span>
      <span class="qian-meta">卦象：${it.wx}</span>
    </div>
    <div class="qian-poem" style="text-align:left">${it.poem}</div>
    <div class="qian-detail" style="text-align:left"><b>断曰：</b>${it.jie}</div>
    <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <div style="text-align:center">
        <div style="color:#b8860b;font-size:12px;margin-bottom:4px">卦辞原文</div>
        <img src="engine/images/32ke/ke_${it.no}.png" style="max-width:280px;border:1px solid #b8860b;border-radius:4px" alt="第${it.no}课原文">
      </div>
      <div style="text-align:center">
        <div style="color:#b8860b;font-size:12px;margin-bottom:4px">课象配图</div>
        <img src="engine/images/32ke/ke_${it.no}_img.png" style="max-width:280px;border:1px solid #b8860b;border-radius:4px" alt="第${it.no}课配图">
      </div>
    </div>
  </div>`;
}

// ========== Tab3 地藏木轮189相 ==========
// 六个木轮，每轮四面（三面数字+一面空白），三掷求和
const LZ_WHEELS = [
  [1,2,3], [4,5,6], [7,8,9], [10,11,12], [13,14,15], [16,17,18]
];
function initDlz() {
  const form = document.getElementById('lzForm');
  let html = `<div style="font-size:12px;color:#9ab;margin-bottom:10px;line-height:1.8">
    <b style="color:#ffd700">一、真实占法（《占察善恶业报经》）</b><br>
    六个木轮一起掷，连掷三次。每个木轮四面：三面写数字、一面空白（空白不计）。<br>
    轮1=1/2/3，轮2=4/5/6，轮3=7/8/9，轮4=10/11/12，轮5=13/14/15，轮6=16/17/18。<br>
    把三次掷出的所有数字加起来，总和即轮相（1-189）。三掷全空=证入无所有空智。<br><br>

    <b style="color:#ffd700">二、什么时候摇几次（三种占法）</b><br>
    ① <b>问三世果报/吉凶</b>（只占第三组，本引擎就是这个）：礼拜供养称名千声后，六轮<b>连掷三次</b>，记所有数字求和。<br>
    ② <b>修忏求清净相</b>（占前两组）：先占第一组十轮（十善十恶），再按初轮善恶别占第二组身口意轮。<b>不占第三组。</b>本引擎不含前两组。<br>
    ③ <b>全占三轮</b>（查宿业+果报）：①先占第一组十轮→②按初轮善恶别占第二组身口意轮→③最后占第三组六轮三掷。<br>
    ④ <b>修忏七日之后</b>：清晨只占第二组，<b>频三掷之</b>，须连续三次都得身口意纯善才算清净。<br><br>

    <b style="color:#ffd700">三、189相区间分类（提问前先对号入座）</b><br>
    <table style="width:100%;font-size:11px;border-collapse:collapse;margin-top:4px">
      <tr style="background:#0f3460"><td style="padding:3px;border:1px solid #1a1a2e">轮相</td><td style="padding:3px;border:1px solid #1a1a2e">问什么</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">1-46</td><td style="padding:3px;border:1px solid #1a1a2e">修持佛法/道业：法门对不对、有无魔障、戒定慧</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">47-54</td><td style="padding:3px;border:1px solid #1a1a2e">学业事业：事成就否、财富官位、学问通达否</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">55-78</td><td style="padding:3px;border:1px solid #1a1a2e">人际姻缘：父母子女夫妻师友、所思人会见否</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">79-101</td><td style="padding:3px;border:1px solid #1a1a2e">财物失物：所见人、所求事、所失物、资生丰歉</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">102-131</td><td style="padding:3px;border:1px solid #1a1a2e">家国出行：所去处安否、国灾乱、怪异、住处</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">132-135</td><td style="padding:3px;border:1px solid #1a1a2e">梦境吉凶</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">136-144</td><td style="padding:3px;border:1px solid #1a1a2e">灾难能否化解</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">145-160</td><td style="padding:3px;border:1px solid #1a1a2e">疾病：可治否、药得力否、医对治否、命尽否</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">161-171</td><td style="padding:3px;border:1px solid #1a1a2e">过去世：从哪道来、何业、何道</td></tr>
      <tr><td style="padding:3px;border:1px solid #1a1a2e">172-189</td><td style="padding:3px;border:1px solid #1a1a2e">未来世：舍身后生哪道、值佛否、证果否</td></tr>
    </table><br>

    <b style="color:#ffd700">四、提问与不相应规则</b><br>
    ① 问题要具体、单一，不要模糊。"我今年运势如何"不行，要问"某件事成不成"。<br>
    ② 掷出的轮相必须和你问的事对号入座——问疾病却掷出"求出家当得去"=不相应。<br>
    ③ 不相应=不至心，须重新礼拜、重占，<b>不可反复掷到出好结果为止</b>。<br>
    ④ 第一次不相应可心里承诺放生/念咒数量后重占。<br>
    ⑤ 小事不用此法，重大事才占。<br><br>

    <b style="color:#ffd700">五、前两组木轮（修忏用，本引擎不做但须知）</b><br>
    经中木轮共三组，本引擎只做了第三组（查果报）：<br>
    · <b>第一组十轮</b>：十个木轮，每轮一面写善、一面写恶（杀生/盗/淫/妄/酒/不杀生/不盗/不淫/不妄/不酒），占身口意十善十恶何者偏重。<br>
    · <b>第二组三轮</b>：身轮/口轮/意轮，每轮三面（善/恶/无记），占三业纯不纯。修忏七日后清晨频掷，连续三次得纯善=清净相。<br>
    · <b>第三组六轮</b>：即本引擎，占果报/吉凶。<br><br>

    <b style="color:#ffd700">六、行法十科流程（智旭《占察行法》）</b><br>
    1.严净道场 2.清净三业（澡浴洗衣） 3.香花供养 4.启请三宝诸天（释迦/七佛/五十三佛/坚净信/普贤/观音/地藏）<br>
    5.赞礼三宝 6.修行忏悔（五体投地，说所作罪，发露无覆藏） 7.立誓愿 8.旋绕归命 9.发善愿 10.以时将息<br>
    <span style="color:#888">本引擎只做占轮查表，完整行法需依智旭大师《占察善恶业报经行法》（卍续藏X74n1485）。</span><br><br>

    <details style="margin-top:10px;border:1px solid #b8860b;border-radius:6px;padding:8px;background:#1a1a2e">
      <summary style="cursor:pointer;color:#ffd700;font-size:13px;font-weight:bold">📜 展开：经文原文·非卦辞部分（约7000字，《占察善恶业报经》卷上）</summary>
      <div style="margin-top:10px;font-size:12px;line-height:1.9;color:#ccc;text-align:left">

      <b style="color:#ffd700">【缘起】</b><br>
      如是我闻：一时，婆伽婆在王舍城耆阇崛山中。会中有一菩萨名坚净信，白佛言："我今为此未来恶世，像法向尽及末法中有微少善根者，请问如来。设何方便，开化示导，令生信心，得除衰恼？"佛告坚净信："今此众中，有菩萨摩诃萨名曰地藏，汝应以此事而请问之。"<br><br>

      <b style="color:#ffd700">【木轮总说】</b><br>
      欲学木轮相者，先当刻木如小指许，使长短减于一寸，正中令其四面方平，自余向两头斜渐去之。仰手傍掷，令使易转，因是义故，说名为轮。其轮相者有三种差别：一者轮相能示夙世所作善恶业种差别，其轮有十；二者轮相能示夙世集业久近、所作强弱大小差别，其轮有三；三者轮相能示三世中受报差别，其轮有六。<br><br>

      <b style="color:#ffd700">【第一轮·十轮（占善恶业种）】</b><br>
      当刻木为十轮，依此十轮书记十善之名，一善主在一轮，于一面记；次以十恶书对十善，令使相当，亦各记在一面。言十善者，则为一切众善根本；言十恶者，亦为一切众恶根本。<br>
      占法：先至心总礼十方一切诸佛，立愿"愿令众生速得亲近供养咨受正法"；次礼法藏、贤圣、地藏菩萨，各发愿。随所有香花修供养。次当称名"南无地藏菩萨摩诃萨"，满足至千。经千念已，作是言："地藏菩萨摩诃萨！大慈大悲！唯愿护念我及一切众生，速除诸障，增长净信，令今所观称实相应。"作此语已，手执木轮，于净物上而傍掷之。<br>
      相应判定：随所现业，一一谛观思验。或纯具十善，或纯具十恶，或善恶交杂。与今世果报所经苦乐吉凶相当者名为相应；若不相当者，谓不至心，名虚谬。若善恶俱不现者，此人已证无漏智心，专求出离。<br><br>

      <b style="color:#ffd700">【第二轮·三轮（占业久近强弱）】</b><br>
      当复刻木为三轮，以身口意各主一轮，书字记之。又于轮正中：一面书一画，令粗长使彻畔；次第二面书一画，令细短使不至畔；次第三面作一傍刻画，令其粗深；次第四面亦作傍刻，令使细浅。<br>
      当知善业庄严犹如画饰，恶业衰害犹如损刻。其画长大者，显示积善来久、行业猛利、所作增上；其画细短者，显示积善来近、始习基钝、所作微薄。其刻粗深者，显示习恶来久、所作增上、余殃亦厚；其刻细浅者，显示退善来近、始习恶法、所作之业未至增上，或虽起重恶已曾改悔，此谓小恶。<br>
      占法：依初轮相中所现之业——若属身者掷身轮，若属口者掷口轮，若属意者掷意轮。不得以此三轮之相一掷通占，应当随业主念一一善恶依所属轮别掷占之。<br><br>

      <b style="color:#ffd700">【忏悔法（恶业多厚者不得即学禅定智慧）】</b><br>
      欲修忏悔法者，当住静处，随力所能，庄严一室。内置佛事及安经法，悬缯幡盖，求集香花以修供养。澡沐身体及洗衣服，勿令臭秽。于昼日分在此室内，三时称名，一心敬礼过去七佛及五十三佛；次随十方面一一总归，拟心遍礼一切诸佛所有色身舍利形像浮图庙塔；次复总礼十方三世诸佛、法藏、贤圣，然后更别称名礼我地藏菩萨摩诃萨。<br>
      礼已，应当说所作罪，一心仰告："唯愿十方诸大慈尊证知护念，我今忏悔，不复更造。愿我及一切众生速得除灭无量劫来十恶四重五逆颠倒谤毁三宝一阐提罪。"复应思惟："如是罪性但从虚妄颠倒心起，无有定实而可得者，本唯空寂。愿我及一切众生速达心本，永灭罪根。"<br>
      复发四愿：①劝请愿（菩萨未成正觉者速成正觉，已成者常住世间转正法轮）；②随喜愿（永舍嫉妒，于三世一切修学功德悉皆随喜）；③回向愿（所修功德资益一切众生同趣佛智至涅槃城）。<br>
      发愿已，复往余静室端坐一心，若称诵若默念我之名号。当减省睡眠，若昏盖多者应于道场室中旋绕诵念。次至夜分，若有灯烛光明事者亦应三时恭敬供养悔过发愿。日日如是行忏悔法勿令懈废。<br>
      得清净时限：罪障轻微者七日；或二七日、三七日、七七日；过去现在俱有增上重罪者百日、二百日乃至千日。极钝根罪障最重者，但当发勇猛之心不顾身命，常勤称念昼夜旋绕，乃至失命要不休退，千日中必获清净。<br><br>

      <b style="color:#ffd700">【清净相验证】</b><br>
      从始修行过七日后，应当日日于晨朝旦，以第二轮相具安手中，频三掷之。若身口意皆纯善者，名得清净。<br>
      附加瑞相：或于一日一夜中复见光明遍满其室；或闻殊特异好香气身意快然；或作善梦，梦中见佛色身来为作证，手摩其头叹言"善哉！汝今清净，我来证汝"；或梦见菩萨身来作证；或梦见佛形像放光而为作证。<br>
      <span style="color:#f99">⚠ 若人未得三业善相，但先见闻如此诸事者，则为虚妄诳惑诈伪，非善相也。</span><br><br>

      <b style="color:#ffd700">【得戒法】</b><br>
      未来世若在家若出家诸众生等，欲求受清净妙戒而先已作增上重罪不得受者，亦当如上修忏悔法，令其至心得身口意善相已，即应可受。<br>
      若欲习摩诃衍道求受菩萨根本重戒，及愿总受在家出家一切禁戒（摄律仪戒、摄善法戒、摄化众生戒），而不能得善好戒师广解菩萨法藏先修行者，应当至心于道场内恭敬供养仰告十方诸佛菩萨请为师证，一心立愿称辩戒相——先说十根本重戒，次当总举三种戒聚，自誓而受，此亦得戒。<br>
      若年未满二十，应先誓愿受十根本戒及沙弥沙弥尼所有别戒，既受已亦名沙弥沙弥尼，即应亲近先旧出家学大乘心具受戒者求为依止之师。沙弥尼年十八者亦当自誓受式叉摩那六戒之法。年满二十乃可总受菩萨三种戒聚，然后得名比丘尼。<br>
      <span style="color:#f99">⚠ 若虽学忏悔不能至心不获善相者，设作受相，不名得戒。</span><br><br>

      <b style="color:#ffd700">【至心差别（坚净兴起问）】</b><br>
      地藏言：我所说至心者略有二种。一者初始学习求愿至心；二者摄意专精成就勇猛相应至心。得此第二至心者能获善相。此第二至心复有下中上三种差别：一者一心（系想不纷乱住了了）；二者勇猛心（专求不懈不顾身命）；三者深心（与法相应究竟不退）。若人修习此忏悔法乃至不得下至心者，终不能获清净善相。<br><br>

      <b style="color:#ffd700">【第三轮·六轮（占三世受报，即本引擎）】</b><br>
      当复刻木为六轮。于此六轮，以一二三、四五六、七八九、十十一十二、十三十四十五、十六十七十八等数书字记之。一数主一面，各书三面，令数次第不错不乱。当知如此诸数皆从一数而起以一为本。如是数相者显示一切众生六根之聚皆从如来藏自性清净心一实境界而起。若未来世佛诸弟子于三世中所受果报欲决疑意者，应当三掷此第三轮相，占计合数，依数观之以定善恶。如是所观三世果报善恶之相有一百八十九种。
      </div>
    </details>
  </div>`;
  for (let t=1; t<=3; t++) {
    html += `<div style="margin-bottom:10px;padding:8px;background:#0f3460;border-radius:4px">
      <div style="color:#ffd700;font-size:12px;margin-bottom:5px">第${t}掷</div>`;
    LZ_WHEELS.forEach((opts, i) => {
      html += `<select id="lz_t${t}_w${i}" style="width:55px;padding:4px;margin:2px;background:#1a1a2e;color:#e0d8c8;border:1px solid #0f3460">
        <option value="0">空</option>
        ${opts.map(n=>`<option value="${n}">${n}</option>`).join('')}
      </select>`;
    });
    html += `<span id="lz_t${t}_sum" style="color:#aaa;margin-left:8px"></span></div>`;
  }
  form.innerHTML = html;
  const upd = () => {
    let total = 0;
    for (let t=1; t<=3; t++) {
      let s = 0;
      LZ_WHEELS.forEach((_, i) => s += parseInt(document.getElementById(`lz_t${t}_w${i}`).value)||0);
      document.getElementById(`lz_t${t}_sum`).textContent = `= ${s}`;
      total += s;
    }
    document.getElementById('lzSum').textContent = `轮相：${total}`;
  };
  LZ_WHEELS.forEach((_, i) => {
    [1,2,3].forEach(t => document.getElementById(`lz_t${t}_w${i}`).onchange = upd);
  });
  upd();
  document.getElementById('btnDlz').onclick = () => {
    let sum = 0;
    for (let t=1; t<=3; t++) {
      LZ_WHEELS.forEach((_, i) => sum += parseInt(document.getElementById(`lz_t${t}_w${i}`).value)||0);
    }
    document.getElementById('lzSum').textContent = `轮相：${sum}`;
    if (sum<1 || sum>189) {
      document.getElementById('result').innerHTML = `<div class="placeholder" style="color:#f66">轮相 ${sum} 超出1-189范围</div>`;
      return;
    }
    const it = DATA.dizang189.items.find(x => x.no === sum);
    if (!it) {
      document.getElementById('result').innerHTML = `<div class="placeholder" style="color:#f66">第${sum}相未收录</div>`;
      return;
    }
    const cat = sum<=160 ? '果报差别' : '舍身已生处';
    document.getElementById('result').innerHTML = `<div class="qian-result">
      <div class="qian-no">第 ${sum} 轮相</div>
      <span class="qian-meta">类别：${cat}</span>
      <div class="qian-poem">${it.text}</div>
      <div class="qian-detail" style="color:#888">源：《占察善恶业报经》</div>
    </div>`;
  };
}

// ========== Tab4 藏传骰子 ==========
const DICE6 = [
  {n:1,c:'阿'},{n:2,c:'Ra'},{n:3,c:'巴'},{n:4,c:'匝'},{n:5,c:'纳'},{n:6,c:'德'}
];
function initZang() {
  const sel = document.getElementById('zangfa');
  sel.onchange = renderZangWrap;
  renderZangWrap();
  document.getElementById('btnZang').onclick = () => {
    const fa = sel.value;
    if (fa === 'wenzhu') {
      const d1 = parseInt(document.getElementById('zd1').value);
      const d2 = parseInt(document.getElementById('zd2').value);
      const dice = `${d1}${d2}`;
      const it = DATA.wenzhu36.items.find(x => x.dice === dice);
      if (!it) { document.getElementById('result').innerHTML='<div class="placeholder" style="color:#f66">未找到</div>'; return; }
      let html = `<div class="qian-result" style="text-align:left">
        <div class="qian-no" style="text-align:center">第${it.no}卦 · ${it.name}</div>
        <div style="text-align:center"><span class="qian-ji ${classifyJi(it.ji)}">${it.ji}</span>
        <span class="qian-meta">${it.dice_label}</span></div>
        ${it.main?`<div class="qian-detail" style="text-align:left;line-height:1.9"><b>卦义：</b>${it.main}</div>`:''}
        ${it.symbol?`<div class="qian-detail" style="text-align:left;line-height:1.9"><b>象征：</b>${it.symbol}</div>`:''}
      `;
      for (const [k,v] of Object.entries(it.fields||{})) {
        html += `<div class="qian-detail" style="margin-top:6px;padding:6px;background:#1a1a2e;border-radius:4px;text-align:left;line-height:1.9"><b style="color:#ffd700">${k}：</b><span style="line-height:1.9">${v}</span></div>`;
      }
      html += '</div>';
      document.getElementById('result').innerHTML = html;
    } else if (fa === 'guanyinLiu') {
      const d = parseInt(document.getElementById('zd1').value);
      const it = DATA.guanyinLiu.items.find(x => x.no === d);
      if (!it) { document.getElementById('result').innerHTML='<div class="placeholder" style="color:#f66">未找到</div>'; return; }
      let html = `<div class="qian-result" style="text-align:left"><div class="qian-no" style="text-align:center">第${it.no}卦 · ${it.name||''}</div>`;
      if (it.ji) html += `<div style="text-align:center"><span class="qian-ji ${classifyJi(it.ji)}">${it.ji}</span></div>`;
      if (it.summary) html += `<div style="margin:8px 0;padding:8px;background:#0f3460;border-radius:4px;color:#ffd700;font-size:13px;line-height:1.8;text-align:left"><b>白话：</b>${it.summary}</div>`;
      if (it.fields && Object.keys(it.fields).length) {
        for (const [k,v] of Object.entries(it.fields)) {
          html += `<div class="qian-detail" style="margin-top:6px;padding:6px;background:#1a1a2e;border-radius:4px;text-align:left"><b style="color:#ffd700">${k}：</b><span style="line-height:1.9">${v}</span></div>`;
        }
      } else if (it.text) {
        html += `<div class="qian-detail" style="line-height:2;text-align:left">${it.text}</div>`;
      }
      html += '</div>';
      document.getElementById('result').innerHTML = html;
    } else if (fa === 'tianmu') {
      const d = (parseInt(document.getElementById('zd1').value)||0) +
                (parseInt(document.getElementById('zd2').value)||0) +
                (parseInt(document.getElementById('zd3').value)||0);
      const it = DATA.tianmu.items.find(x => x.no === d);
      if (!it) { document.getElementById('result').innerHTML=`<div class="placeholder" style="color:#f66">三骰和${d}未找到（吉祥天母共3-18卦）</div>`; return; }
      let html = `<div class="qian-result" style="text-align:left"><div style="margin:8px 0;padding:10px;background:#5a0000;border:2px solid #ff3333;border-radius:4px;color:#ff4444;font-weight:bold;text-align:center;font-size:14px;line-height:1.6">⚠ 非师父授意许可，不应当自行使用此套占卜 ⚠</div><div class="qian-no" style="text-align:center">第${d}卦 · ${it.ji}</div>`;
      if (it.note) html += `<div style="margin:8px 0;padding:8px;background:#3a1515;border-radius:4px;color:#ff9999;font-size:12px">${it.note}</div>`;
      if (it.fields && Object.keys(it.fields).length) {
        for (const [k,v] of Object.entries(it.fields)) {
          html += `<div class="qian-detail" style="margin-top:6px;padding:6px;background:#1a1a2e;border-radius:4px;text-align:left"><b style="color:#ffd700">${k}：</b><span style="line-height:1.9">${v}</span></div>`;
        }
      }
      html += '</div>';
      document.getElementById('result').innerHTML = html;
    }
  };
}
function renderZangWrap() {
  const fa = document.getElementById('zangfa').value;
  const wrap = document.getElementById('zangWrap');
  // 索达吉序言折叠块（藏传三法共用）
  const PREFACE =
    '<details style="margin-top:8px;border:1px solid #b8860b;border-radius:6px;padding:6px;background:#1a1a2e">' +
    '<summary style="cursor:pointer;color:#ffd700;font-size:12px;font-weight:bold">📜 展开：索达吉堪布总序（2003）</summary>' +
    '<div style="margin-top:8px;font-size:12px;line-height:1.9;color:#ccc;text-align:left">' +
    '<b style="color:#ffd700">【一、为什么有占卜】</b><br>大千世界森罗万象，命运忽然变故常使人措手不及。面对纷繁复杂的世界、无法主宰的命运，许多人渴望获得不谬的启示，古老的占卜术由此应运而生。<br><br>' +
    '<b style="color:#ffd700">【二、佛教占卜 vs 假占卜】</b><br>不能因其被别有用心者利用（略知一二就打佛教旗号借占卜生财），就一眚掩大德。评价任何事物应一分为二。<br><br>' +
    '<b style="color:#ffd700">【三、藏地占卜三派】</b><br>' +
    '① <b>民间传统卜</b>：眼跳、耳鸣、耳热、肌肉颤动、打喷嚏、摔碗、火星喷射、狗吠、喜鹊叫等，传甚广。<br>' +
    '② <b>苯波教卜</b>：麦彭仁波切曾写600多页专门介绍。<br>' +
    '③ <b>佛教卜</b>：诸佛菩萨化身成就者以无漏智慧、无碍神通洞悉因缘所赐予的金刚语。如观音、吉祥天女、马头明王、单坚、格萨尔等本尊护法的占卜法，见《六字真言取舍明镜》《六字定胜真实明镜》《马头明王密修珠卦法》《阿底峡梦现卦法》。<br><br>' +
    '<b style="color:#ffd700">【四、两大权威】</b><br>被公认为最具权威、流传最广的是<b>麦彭仁波切</b>（文殊占筮法）与<b>法王松赞干布</b>（观音明镜论）。<br><b>此两种占卜法无需传承，简便易行，只要发心清净、对三宝有至诚信心，就会得到明确宣示。</b><br><br>' +
    '<b style="color:#ffd700">【五、这两法的特点】</b><br>市面上的占卜法往往给一个铁定结局，不利也难逆转。而这两法不仅预测，<b>还提供化解良方</b>——并非让人消极听天由命，而是以各种积极方式临机应变、制造及改变因缘，达到避凶趋吉。<br><br>' +
    '<b style="color:#ffd700">【六、发心要求（原文）】</b><br>' +
    '① 不论为自己打卦还是受人所托，<b>必须发心清净，不被五毒所染，万万不可有害人之心</b>。<br>' +
    '② 对结果以旷达心待之，不必患得患失。<br>' +
    '③ 结果不好→知前世业力，励力忏悔、祈祷、供养、改过迁善，因祸为福。<br>' +
    '④ 结果很好→不必大喜过望、得意忘形，更不可依运势做伤天害理损人利己之事，否则遭因果制裁。<br>' +
    '⑤ 结果似是而非→事在人为，力修顺缘，善业终不空耗。<br><br>' +
    '<b style="color:#ffd700">【七、警告（原文）】</b><br>' +
    '① 若浅慧之人以此为佛法本质，放弃闻思修行，整日打卦求签度日=背本逐末、买椟还珠，蹉跎暇满人生。<br>' +
    '② 若好逸恶劳之徒以此为生财求荣之道，投机取巧牟取暴利、欺骗信众=必招其损，追悔莫及。<br>' +
    '望三思！！' +
    '</div></details>';

  // 三个法各自的定位
  const PURPOSE = {
    wenzhu: '<b style="color:#ffd700">这个法解决什么：</b><br>麦彭仁波切著、索达吉堪布译。两枚骰子（佛父黄+佛母白），问<b>修行取舍</b>——修法有无障碍、怨敌疾病根源、智慧障/魔障在哪、该念什么咒对治。每卦9-10项分项断语，藏地大德观察缘起的主力法。<br><br><b style="color:#ffd700">前置要求（原文）：</b><br>① 用珍宝或上等木料制四方骰子，六面写六字（阿Ra巴匝纳德）<br>② 平时观想本尊，念根本咒及缘起咒三遍或七遍，<b>远离诅咒之心</b>妥为保存<br>③ 占时先念仪轨一遍+缘起咒3或7遍，再念文殊心咒"嗡阿Ra巴匝纳德"至少100遍（重要事300遍以上）<br>④ 观想文殊菩萨及众眷金光降临面前虚空，心里忆念所占之事，猛烈祈祷后掷骰<br>⑤ 重大事可占两次，两次吉凶一致才算定；不一致再占<br>⑥ <b>最多打两次</b>，不能一直打到出好结果<br>⑦ 第一次不满意可心里承诺放生/念咒数量后重占，第二次不用重念仪轨<br><br>' +
    '<details style="margin-top:8px;border:1px solid #b8860b;border-radius:6px;padding:6px;background:#1a1a2e">' +
    '<summary style="cursor:pointer;color:#ffd700;font-size:12px;font-weight:bold">📜 展开：完整仪轨原文+咒语表+索达吉讲记</summary>' +
    '<div style="margin-top:8px;font-size:12px;line-height:1.9;color:#ccc;text-align:left">' +
    '<b style="color:#ffd700">【一、观想（原文）】</b><br>首先观想前方虚空当中，莲花月垫之上，文殊菩萨呈圆满报身装饰，双足结跏趺坐式，身色红黄，一面二臂，右手持宝剑，左手拈乌巴拉花，花蕊之上为般若经函。并了知彼等一切显现均如水月般现而无自性。<br><br>' +
    '<b style="color:#ffd700">【二、祈请文（念一遍）】</b><br>嗡<br>三时恒常无遮智慧眼，祈请文殊勇识垂念我，<br>三宝三根本及缘起性，无欺真实之力明取舍。<br>' +
    '<span style="color:#888">藏音：དུས་གསུམ་ཀུན་ཏུ་མ་བསྒྲིབས་ཡེ་ཤེས་སྤྱན། འཇམ་དཔལ་དཔའ་བོ་བདག་ལ་དགོངས་སུ་གསོལ། མཆོག་གསུམ་རྩ་གསུམ་རྟེན་འབྲེལ་བསླུ་མེད་ཀྱིས། བདེན་པའི་མཐུ་ཡིས་བླང་དོར་གསལ་གྱུར་ཅིག།</span><br><br>' +
    '<b style="color:#ffd700">【三、缘起咒（念三遍或七遍）】</b><br>嗡 耶达玛黑德抓巴瓦 黑顿得堪达塔噶多哈亚挖达 得堪杂哟讷若达 诶望巴德玛哈夏玛呢耶 娑哈<br>' +
    '<span style="color:#888">藏音：ཨོཾ་ཡེ་དྷརྨ་ཧེ་ཏུ་པྲ་བྷ་ཝཱ་ཧེ་ཏུན་ཏེཥཱནྟ་ཐཱ་ག་ཏོ་ཧྱ་ཝ་དཏ། ཏེཥཱཉྩ་ཡོ་ནི་རོ་དྷ་ཨེ་ཝཾ་བཱ་དཱི་མ་ཧཱ་ཤྲ་མ་ཎཿ སྭཱཱཱ་ཧཱ།</span><br><br>' +
    '<b style="color:#ffd700">【四、心咒与掷骰】</b><br>其后尽力念诵文殊菩萨心咒"嗡阿Ra巴匝纳德"（ཨ་ར་པ་ཙ་ན་དྷཱི）。此时观想前方虚空中文殊菩萨与众眷金光灿烂真实降临。心中忆念所占之事并猛烈祈祷，然后扔出骰子，结果凶吉定可通过骰子明示。<br><br>' +
    '<b style="color:#ffd700">【五、占卜工具】</b><br>最佳工具为骰子，分佛父佛母两枚：佛父黄色，佛母白色。麦彭传承方位：上方=དྷི（德），下方=ཨ（阿），东方=ར（Ra），南方=ན（纳），西方=ཙ（匝），北方=པ（巴）。<br>1-6分别对应：1=阿ཨ，2=Raར，3=巴པ，4=匝ཙ，5=纳ན，6=德དྷི。<br>佛父佛母排列组合共36种卦象。<br><br>' +
    '<b style="color:#ffd700">【六、念珠占卜法（无骰子时）】</b><br>随意选择一段念珠，以三粒念珠为单位，两手同时拨向中点，最后所得之<b>小于或等于6</b>的数字，即为占卜结果。文殊法需占两次（佛父+佛母各一次）。观音法只需占一次，共6种卦。以念珠占卜，观想方法与骰子一致。<br><br>' +
    '<b style="color:#ffd700">【七、结果预测及措施】</b><br>① 重大事宜可占两次。两次吉凶一致=定；不同=再占。<br>② 文殊两次结果佛父佛母相互颠倒=重新占。<br>③ 结果对所问之事无明确答复=按卦象吉凶推断。<br>④ 结果不尽如人意=心中默念承诺做善事（放生/念咒），再占；仍不满意=换其他善法。<br>⑤ 文中提及的诸多修法心咒汉地未普及者，可采用同种事业之仪轨/心咒或其他积资净障善法代替。<br>⑥ 平时尽力念诵此等本尊心咒，常时祈祷，不要"平时不烧香临时抱佛脚"。<br><br>' +
    '<b style="color:#ffd700">【八、附录心咒速查表】</b><br>' +
    '<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="background:#0f3460"><td style="padding:3px;border:1px solid #1a1a2e">本尊</td><td style="padding:3px;border:1px solid #1a1a2e">心咒</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">文殊菩萨</td><td style="padding:3px;border:1px solid #1a1a2e">嗡阿Ra巴匝纳德</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">黄财神</td><td style="padding:3px;border:1px solid #1a1a2e">嗡匝靶拉杂联札雅 兑兑嘛嘛 沽奈沽奈娑哈</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">释迦牟尼佛</td><td style="padding:3px;border:1px solid #1a1a2e">嗡牟尼牟尼 嘛哈牟尼耶娑哈</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">药师佛</td><td style="padding:3px;border:1px solid #1a1a2e">达雅塔 嗡贝卡宰贝卡宰 嘛哈贝卡宰 惹杂萨牟噶代娑哈</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">具光佛母</td><td style="padding:3px;border:1px solid #1a1a2e">嗡嘛日再雅娑哈</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">白伞盖佛母</td><td style="padding:3px;border:1px solid #1a1a2e">吽嘛嘛吽尼娑哈</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">二十一度母</td><td style="padding:3px;border:1px solid #1a1a2e">嗡答热嘟答热嘟热娑哈</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">马头明王</td><td style="padding:3px;border:1px solid #1a1a2e">嗡舍叭嘛答嗝热哈雅给儿瓦舍吽呸</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">不动明王</td><td style="padding:3px;border:1px solid #1a1a2e">嗡簪咋嘛哈若卡那吽呸</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">摧破金刚</td><td style="padding:3px;border:1px solid #1a1a2e">纳嘛簪扎班杂儿呙儿达雅呼噜呼噜堤楂堤楂坂达坂达哈纳哈纳阿弥儿代吽呸</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">金刚手</td><td style="padding:3px;border:1px solid #1a1a2e">嗡班杂儿巴呢吽</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">大威德</td><td style="padding:3px;border:1px solid #1a1a2e">嗡雅曼答嘎吽呸</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">金刚亥母</td><td style="padding:3px;border:1px solid #1a1a2e">嗡嘻儿班杂儿拔惹嘿阿吽吽呸娑哈</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">大黑天</td><td style="padding:3px;border:1px solid #1a1a2e">嗡嘛哈嘎啦吽呸</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">金刚萨埵</td><td style="padding:3px;border:1px solid #1a1a2e">嗡班杂儿萨埵吽</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">莲师</td><td style="padding:3px;border:1px solid #1a1a2e">嗡阿吽班杂儿咕汝叭嘛色德吽</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">观音</td><td style="padding:3px;border:1px solid #1a1a2e">嗡嘛呢叭美吽</td></tr>' +
    '</table><br>' +
    '<b style="color:#ffd700">【九、索达吉讲记要点】</b><br>' +
    '① <b>不要试探卦</b>："观察观察到底准不准，看看龙泉水这会儿有没有人，能不能打得到水？"拿小事试卦=有过失。<br>' +
    '② <b>非常重要/实在决定不了才打</b>：每天打卦、买菜也打=没必要。<br>' +
    '③ <b>最多打两次</b>：一直打到出好结果=不像打卦。第二次结果还是不满意=就那样了，不要第三次。<br>' +
    '④ <b>信心是关键</b>：卦准不准很大程度取决于信心。打得不准不要骂"作者仪轨不好"。<br>' +
    '⑤ <b>发心清净</b>：不能有害人之心。对占卜结果也应以因果正见对待，不要执着。<br>' +
    '⑥ <b>不要把占卜当佛法本质</b>：它只是方便，不能放弃闻思修行。<br>' +
    '⑦ 麦彭传承的骰子上方是"德"下方是"阿"，方位不要搞反。' +
    '</div></details>' + PREFACE,
    guanyinLiu: '<b style="color:#ffd700">这个法解决什么：</b><br>松赞干布传，一枚骰子（或念珠）掷6卦，问<b>世俗日常吉凶</b>——家庭、财物、病患、出行、失物、转生。直接告诉你魔障来自哪里、什么时辰、什么颜色物品，要做什么佛事化解。<br><br><b style="color:#ffd700">前置要求（原文）：</b><br>① 尽力念诵六字真言"嗡玛呢巴美吽"<br>② 心无疑惑而虔诚祈祷大悲观世音菩萨<br>③ 边口中叙述所问事宜，边抛掷骰子，以所得卦象判定<br>④ 用念珠法时：两手随意抓念珠一段，三粒一组同时拨向中点，最后剩余≤6粒即结果' + PREFACE,
    tianmu: '<div style="margin:8px 0;padding:10px;background:#5a0000;border:2px solid #ff3333;border-radius:4px;color:#ff4444;font-weight:bold;text-align:center;font-size:13px;line-height:1.6">⚠ 非师父授意许可，不应当自行使用此套占卜 ⚠</div><br><b style="color:#ffd700">这个法解决什么：</b><br>吉祥天母护法法，三枚骰子点数和3-18，问<b>凶险事/护法感应</b>。比前两个更凶暴，卦象分大吉/略凶/大极端。<br><br><b style="color:#ffd700">前置要求：</b><br>依传承须先修天母自生念诵、食子供养结界，直至天女修证现量显露后方可掷骰。本引擎仅作文本查阅，不替代师承仪轨。<br><br>' +
    '<details style="margin-top:8px;border:1px solid #b8860b;border-radius:6px;padding:6px;background:#1a1a2e">' +
    '<summary style="cursor:pointer;color:#ffd700;font-size:12px;font-weight:bold">📜 展开：前行仪轨原文（坛城/祈请/陀罗尼/法轮寺实操）</summary>' +
    '<div style="margin-top:8px;font-size:12px;line-height:1.9;color:#ccc;text-align:left">' +
    '<b style="color:#ffd700">【坛城布置（原文）】</b><br>此乃缘依吉祥天母而掷骰子占卜所问。于寂静处设天母身像并加持之。前铺一块适中黑布，放着依口诀而修造的占卜骰子，再放置金刚铃杵等必要资具及荟供供品等一切，还有特殊内供、八供、药、血、食子等均妥善备置。之后，行怖畏尊之自生念诵、食子供养等修法结界，直至天女之修证现量显露。<br><br>' +
    '<b style="color:#ffd700">【祈请文（原文）】</b><br>吽 自性怖畏勇士阎罗王，伏三界忿怒身显现，心间持命吽字放光明，长寿五女护法眷属众，照射誓愿续请息等业，共与不共三时诸取舍，无遮明朗显现神通慧，当愿赐予任运悉地成。<br><br>' +
    '<b style="color:#ffd700">【天母陀罗尼】</b><br>久 拉莫久 拉莫久久 拉莫吞久 卡拉拉噶千莫 拉莫阿加达加吞久 路鲁路鲁吽久吽<br><br>' +
    '<b style="color:#ffd700">【补阙真言】</b><br>嗡 耶达玛 嘿都巴 巴哇 嘿敦 爹肯 达他噶多 哈哇达爹 爹肯乍右 尼洛大 耶旺 巴地 玛哈夏玛那 梭哈<br><br>' +
    '<b style="color:#ffd700">【百字明】</b><br>嗡 班杂萨埵剎玛呀 玛努巴拉呀 班杂萨埵帝洛巴 地叉则卓美巴哇 速埵卡右美巴哇 速波卡右美巴哇 阿努拉多美巴哇 剎哇悉地美乍呀查 剎哇噶玛速乍美 积当希利呀 古鲁吽 哈哈哈哈霍 巴噶问 剎哇达他噶达 班杂玛美目杂 班知巴哇玛哈剎玛呀剎埵阿<br><br>' +
    '<b style="color:#ffd700">【加持偈】</b><br>南无 根本传承具德上师圣众真实谛，佛陀真实谛，正法真实谛，圣僧真实谛，本尊勇父空行护法一切守护真实谛，殊别吉祥天母退敌咒母列玛帝本尊荟供众真实谛，依此广大真实谛加持，于我所问无误当显现。<br><br>' +
    '以真言嘱咐后，抱持真诚渴求问卜之心而作观想，眼视虚空，掷骰子占卜。<br><br>' +
    '<b style="color:#ffd700">【沈阳法轮寺实操（活的寺院仪轨）】</b><br>① 跪于天母像前，双手合掌捧持三颗骰子及连接吉祥天母心间的哈达。<br>② 由护法殿僧人击鼓诵经。<br>③ 心中忆念想要求问的内容，极其虔诚地向天母祈请答案。<br>④ 僧人击鼓结束时，将手中哈达和骰子掷于卦盒内。<br>⑤ 将三枚骰子的点数相加，得到结果，查卦书断吉凶。<br><br>' +
    '<b style="color:#ffd700">【学术背景】</b><br>藏族骰子卜文献最早为博东·乔勒南杰（1306–1386）所著《掷骰子之占算》。第二世达赖喇嘛根敦嘉措（1475–1542）亦撰骰子占卜著作。藏语称骰子为"秀"（sho），远古即作为打卦卜辞，1642年甘丹颇章时期才逐渐演变为娱乐游戏。与"文殊Mo"并列为藏传占卜两大系统。<br><br>' +
    '<b style="color:#ffd700">【骰子造法】</b><br>以当地黑荆棘须成白红蓝三种，再予以点孔，上下方为五和一，四方为二、三、四、六次序而定，每骰二十一点。<br><br>' +
    '<b style="color:#ffd700">【补遗附录一：僧人课诵本尊对应（3-18点）】</b><br>' +
    '<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="background:#0f3460"><td style="padding:3px;border:1px solid #1a1a2e">点数</td><td style="padding:3px;border:1px solid #1a1a2e">本尊</td><td style="padding:3px;border:1px solid #1a1a2e">护法</td><td style="padding:3px;border:1px solid #1a1a2e">课诵</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">3</td><td style="padding:3px;border:1px solid #1a1a2e">十一面观音</td><td style="padding:3px;border:1px solid #1a1a2e">六臂大黑天</td><td style="padding:3px;border:1px solid #1a1a2e">十一面观音仪轨及相关斋戒守护</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">4</td><td style="padding:3px;border:1px solid #1a1a2e">马头明王密修</td><td style="padding:3px;border:1px solid #1a1a2e">贝借护法</td><td style="padding:3px;border:1px solid #1a1a2e">马头明王密修仪轨</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">5</td><td style="padding:3px;border:1px solid #1a1a2e">上乐金刚</td><td style="padding:3px;border:1px solid #1a1a2e">四面护法</td><td style="padding:3px;border:1px solid #1a1a2e">上乐金刚仪轨及百字明</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">6</td><td style="padding:3px;border:1px solid #1a1a2e">尊胜佛母</td><td style="padding:3px;border:1px solid #1a1a2e">贝借护法</td><td style="padding:3px;border:1px solid #1a1a2e">尊胜佛母仪轨及陀罗尼</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">7</td><td style="padding:3px;border:1px solid #1a1a2e">金刚瑜伽母</td><td style="padding:3px;border:1px solid #1a1a2e">贝借护法</td><td style="padding:3px;border:1px solid #1a1a2e">金刚瑜伽母仪轨及上师瑜伽</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">8</td><td style="padding:3px;border:1px solid #1a1a2e">白度母</td><td style="padding:3px;border:1px solid #1a1a2e">吉祥天母</td><td style="padding:3px;border:1px solid #1a1a2e">白度母仪轨及赞颂</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">9</td><td style="padding:3px;border:1px solid #1a1a2e">大日如来</td><td style="padding:3px;border:1px solid #1a1a2e">财宝天王</td><td style="padding:3px;border:1px solid #1a1a2e">大日如来仪轨及度母</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">10</td><td style="padding:3px;border:1px solid #1a1a2e">白妙音佛母</td><td style="padding:3px;border:1px solid #1a1a2e">吉祥天母</td><td style="padding:3px;border:1px solid #1a1a2e">妙音佛母仪轨及度母</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">11</td><td style="padding:3px;border:1px solid #1a1a2e">密集不动金刚</td><td style="padding:3px;border:1px solid #1a1a2e">六臂大黑天</td><td style="padding:3px;border:1px solid #1a1a2e">密集不动金刚修持及兜率百尊</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">12</td><td style="padding:3px;border:1px solid #1a1a2e">金刚手忿怒三尊合修</td><td style="padding:3px;border:1px solid #1a1a2e">财宝天王</td><td style="padding:3px;border:1px solid #1a1a2e">金刚手忿怒三尊合修仪轨及忏罪经</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">13</td><td style="padding:3px;border:1px solid #1a1a2e">大威德金刚</td><td style="padding:3px;border:1px solid #1a1a2e">法王</td><td style="padding:3px;border:1px solid #1a1a2e">大威德金刚修持及观悲母</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">14</td><td style="padding:3px;border:1px solid #1a1a2e">狮吼文殊</td><td style="padding:3px;border:1px solid #1a1a2e">法王</td><td style="padding:3px;border:1px solid #1a1a2e">文殊仪轨及真实名经</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">15</td><td style="padding:3px;border:1px solid #1a1a2e">大轮金刚</td><td style="padding:3px;border:1px solid #1a1a2e">财宝天王</td><td style="padding:3px;border:1px solid #1a1a2e">大轮金刚仪轨及金刚手百零八名号陀罗尼</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">16</td><td style="padding:3px;border:1px solid #1a1a2e">白文殊</td><td style="padding:3px;border:1px solid #1a1a2e">法王</td><td style="padding:3px;border:1px solid #1a1a2e">白文殊仪轨及罗汉礼赞</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">17</td><td style="padding:3px;border:1px solid #1a1a2e">密集文殊金刚</td><td style="padding:3px;border:1px solid #1a1a2e">法王</td><td style="padding:3px;border:1px solid #1a1a2e">文殊金刚修持及真实名经</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">18</td><td style="padding:3px;border:1px solid #1a1a2e">四臂伏魔金刚手</td><td style="padding:3px;border:1px solid #1a1a2e">财宝天王</td><td style="padding:3px;border:1px solid #1a1a2e">四臂伏魔金刚手修持及普贤行愿品</td></tr>' +
    '</table><br>' +
    '<b style="color:#ffd700">【补遗附录二：一般僧人及居士课诵本尊（3-18点）】</b><br>' +
    '<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="background:#0f3460"><td style="padding:3px;border:1px solid #1a1a2e">点数</td><td style="padding:3px;border:1px solid #1a1a2e">本尊</td><td style="padding:3px;border:1px solid #1a1a2e">护法</td><td style="padding:3px;border:1px solid #1a1a2e">课诵</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">3</td><td style="padding:3px;border:1px solid #1a1a2e">弥勒菩萨</td><td style="padding:3px;border:1px solid #1a1a2e">六臂大黑天</td><td style="padding:3px;border:1px solid #1a1a2e">弥勒誓句</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">4</td><td style="padding:3px;border:1px solid #1a1a2e">尊胜佛母</td><td style="padding:3px;border:1px solid #1a1a2e">吉祥天母</td><td style="padding:3px;border:1px solid #1a1a2e">尊胜陀罗尼及仪轨</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">5</td><td style="padding:3px;border:1px solid #1a1a2e">观世音</td><td style="padding:3px;border:1px solid #1a1a2e">六臂大黑天</td><td style="padding:3px;border:1px solid #1a1a2e">观音观修及六字大明咒</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">6</td><td style="padding:3px;border:1px solid #1a1a2e">金刚手</td><td style="padding:3px;border:1px solid #1a1a2e">财宝天王</td><td style="padding:3px;border:1px solid #1a1a2e">金刚手观修</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">7</td><td style="padding:3px;border:1px solid #1a1a2e">文殊菩萨</td><td style="padding:3px;border:1px solid #1a1a2e">法王</td><td style="padding:3px;border:1px solid #1a1a2e">五字文殊及真实名经</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">8</td><td style="padding:3px;border:1px solid #1a1a2e">度母</td><td style="padding:3px;border:1px solid #1a1a2e">吉祥天母</td><td style="padding:3px;border:1px solid #1a1a2e">度母</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">9</td><td style="padding:3px;border:1px solid #1a1a2e">长寿佛</td><td style="padding:3px;border:1px solid #1a1a2e">贝借护法</td><td style="padding:3px;border:1px solid #1a1a2e">长寿陀罗尼及长寿经</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">10</td><td style="padding:3px;border:1px solid #1a1a2e">不动明王</td><td style="padding:3px;border:1px solid #1a1a2e">法王</td><td style="padding:3px;border:1px solid #1a1a2e">不动明王观修及百字明</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">11</td><td style="padding:3px;border:1px solid #1a1a2e">摧破金刚</td><td style="padding:3px;border:1px solid #1a1a2e">财宝天王</td><td style="padding:3px;border:1px solid #1a1a2e">摧破金刚陀罗尼</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">12</td><td style="padding:3px;border:1px solid #1a1a2e">金刚萨埵</td><td style="padding:3px;border:1px solid #1a1a2e">六臂大黑天</td><td style="padding:3px;border:1px solid #1a1a2e">百字明及金刚萨埵观修</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">13</td><td style="padding:3px;border:1px solid #1a1a2e">大白伞盖佛母</td><td style="padding:3px;border:1px solid #1a1a2e">法王</td><td style="padding:3px;border:1px solid #1a1a2e">大白伞盖佛母</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">14</td><td style="padding:3px;border:1px solid #1a1a2e">马头明王</td><td style="padding:3px;border:1px solid #1a1a2e">贝借护法</td><td style="padding:3px;border:1px solid #1a1a2e">马头明王心咒及普贤行愿品</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">15</td><td style="padding:3px;border:1px solid #1a1a2e">药师佛</td><td style="padding:3px;border:1px solid #1a1a2e">财宝天王</td><td style="padding:3px;border:1px solid #1a1a2e">药师佛仪轨及陀罗尼</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">16</td><td style="padding:3px;border:1px solid #1a1a2e">狮子吼文殊</td><td style="padding:3px;border:1px solid #1a1a2e">六臂大黑天</td><td style="padding:3px;border:1px solid #1a1a2e">狮子吼文殊观修及忏悔</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">17</td><td style="padding:3px;border:1px solid #1a1a2e">妙音佛母</td><td style="padding:3px;border:1px solid #1a1a2e">吉祥天母</td><td style="padding:3px;border:1px solid #1a1a2e">妙音佛母观修及度母</td></tr>' +
    '<tr><td style="padding:3px;border:1px solid #1a1a2e">18</td><td style="padding:3px;border:1px solid #1a1a2e">白度母</td><td style="padding:3px;border:1px solid #1a1a2e">吉祥天母</td><td style="padding:3px;border:1px solid #1a1a2e">白度母观修及赞颂</td></tr>' +
    '</table><br>' +
    '<b style="color:#ffd700">【补遗附录三：前生辨认占法（3-18点）】</b><br>' +
    '3=三宝下归依者，无论生何处均安乐。<br>4=中士。<br>5=转生为具法者。<br>6=饿鬼或类属同道。<br>7=具法女子。<br>8=国王转世（障碍重应修法）。<br>9=格西类善知识。<br>10=转生为富者（不如前生）。<br>11=天道而降生善净之处。<br>12=由恶道而升至此。<br>13=龙或非天等类转生，甚残暴。<br>14=普通人。<br>15=上士转生或依善种，大吉。<br>16=畜生道转生，愚痴。<br>17=由净土降此，甚善。<br>18=前生虽恶，后能转善。<br><br>' +
    '<b style="color:#ffd700">【补遗附录四：寿量及障碍轻重占法（3-18点）】</b><br>' +
    '3=三宝大悲加持，身命安乐无障。<br>4=身命有障，应修法。<br>5=三年无障。<br>6=明年稍有凶。<br>7=五年无障。<br>8=七年无障。<br>9=九年至十年多静象。<br>10=寿障虽多，修法回遮能延寿。<br>11=无寿障如金刚石。<br>12=寿障大，难延寿。<br>13=六十多静象，期间无大障。<br>14=能到五十岁左右，修长寿法则更上。<br>15=决到七十岁，期间无大障。<br>16=四十岁内有大障，能过则无害。<br>17=决到八十岁。<br>18=多修法则长寿幸福广增长久。<br><br>' +
    '<b style="color:#ffd700">【补遗附录五：死因及中阴善恶占法（3-18点）】</b><br>' +
    '3=胆病或瘟疫。<br>4=涎分或水肿。<br>5=风症或寒病。<br>6=魔或因火水悬崖三者令暴死。<br>7=人魔妖王作障或更微细因。<br>8=地魔或痛风。<br>9=死缘甚静，中阴甚善。<br>10=死缘苦乐适当，中阴亦似。<br>11=死缘缓静，中阴中等。<br>12=死缘猛断命根甚苦，中阴有恐惧，应勤修善。<br>13=死缘缓静，中阴自主。<br>14=无猛断命根，但中阴甚乱。<br>15=不知死而得善依。<br>16=死缘凶恶残暴，病期长久生大苦，即时祈求三宝可于中阴免恐惧。<br>17=死时不生恐惧，得依善愿往生净土。<br>18=死缘缓静，病期虽长，中阴有业力苦难，但渐生安乐无过。<br><br>' +
    '<b style="color:#ffd700">【补遗附录六：来生善恶占法（3-18点）】</b><br>' +
    '3=恒受三宝加持，决生善趣。<br>4=难得善依，应勤修善业。<br>5=往生天道。<br>6=生饿鬼道。<br>7=生阿修罗道。<br>8=定得人身。<br>9=生王族。<br>10=生穷人或苦种姓。<br>11=生富贵种姓。<br>12=生野蛮具罪种姓。<br>13=生具法种姓。<br>14=生畜生道。<br>15=定得财法圆满善依。<br>16=生地獄。<br>17=欢喜当生净土。<br>18=生龙族。<br><br>' +
    '<b style="color:#ffd700">【补遗附录七：取舍占法（3-18点）】</b><br>' +
    '3=勤修皈依供养则善。<br>4=心不舍轮回根本则于法无益，当断贪执依治烦恼法。<br>5=修出离菩提心则愿成。<br>6=精勤正见胜义即能解脱。<br>7=如法清净守护誓句戒律业果取捨为关键。<br>8=修护法供及嘱咐事业法即成。<br>9=虽未明显积善净障，力续行亦恒生吉祥圆满。<br>10=不适其他修持，勤修上乐本尊速得悉地。<br>11=勤修任一适当本尊则善。<br>12=勤修斋戒苦行或诵十万百字明或十万大礼拜净障，别则难净大罪。<br>13=反复祈求观音菩萨，能生普陀山净土。<br>14=勤修浊世怙主八大如来礼供发愿即大利益。<br>15=勤行广修供僧、布施贫困等善业则善。<br>16=以勤诵佛经、修经忏、献曼达拉、绕礼拜等外身语修法为要。<br>17=勤修建佛身语意所依及僧众伽蓝则善。<br>18=浊世中多修不力，唯自诵六字大明咒则于现今后世均大利益。<br><br>' +
    '<b style="color:#ffd700">【注释】</b><br>' +
    '<b>守舍护法</b>：经常守护人体各器官与寿命共存亡的护法，有五类：乡土神、父族神、母族神、战神、生命神。<br>' +
    '<b>舍衣延寿</b>：为息灭命中灾难、延年益寿而施自用衣服之修法。<br>' +
    '<b>焰口女王灵器供仪</b>：给饿鬼女王焰口母施放替死物品以求禳灾除病。用彩线绕或糌粑捏成日用品、牲畜、房屋等模拟物，上供神者称上供灵器、下施鬼类者称下施灵器。类似汉地放焰口。<br>' +
    '<b>四百禳灾</b>：用灯、食子、舍利塔、替身各百个供施以求禳灾除病。<br>' +
    '<b>五部陀罗尼</b>：事部本尊大千摧破佛母、大孔雀佛母、随持佛母、大寒林佛母、随行佛母陀罗尼，常用为塔佛像装藏用。<br>' +
    '<b>夭折鬼</b>：专门危害小孩的魔，修法在地上挖三角形将魔埋内降伏。' +
    '</div></details>' + PREFACE
  };
  if (fa === 'wenzhu') {
    wrap.innerHTML = `
      <label style="font-size:13px;color:#aaa">佛父骰子（黄）</label>
      <select id="zd1" style="width:100%;padding:8px;margin:6px 0;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#e0d8c8">
        ${DICE6.map(d=>`<option value="${d.n}">${d.n}=${d.c}</option>`).join('')}
      </select>
      <label style="font-size:13px;color:#aaa">佛母骰子（白）</label>
      <select id="zd2" style="width:100%;padding:8px;margin:6px 0;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#e0d8c8">
        ${DICE6.map(d=>`<option value="${d.n}">${d.n}=${d.c}</option>`).join('')}
      </select>
      <div style="margin-top:15px;padding:12px;background:#0f3460;border-radius:6px;font-size:12px;color:#9ab;line-height:1.7">${PURPOSE.wenzhu}</div>`;
  } else if (fa === 'tianmu') {
    wrap.innerHTML = `
      <label style="font-size:13px;color:#aaa">骰子1</label>
      <select id="zd1" style="width:100%;padding:8px;margin:6px 0;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#e0d8c8">
        ${[1,2,3,4,5,6].map(n=>`<option value="${n}">${n}</option>`).join('')}
      </select>
      <label style="font-size:13px;color:#aaa">骰子2</label>
      <select id="zd2" style="width:100%;padding:8px;margin:6px 0;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#e0d8c8">
        ${[1,2,3,4,5,6].map(n=>`<option value="${n}">${n}</option>`).join('')}
      </select>
      <label style="font-size:13px;color:#aaa">骰子3</label>
      <select id="zd3" style="width:100%;padding:8px;margin:6px 0;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#e0d8c8">
        ${[1,2,3,4,5,6].map(n=>`<option value="${n}">${n}</option>`).join('')}
      </select>
      <div id="tmSum" style="text-align:center;color:#ffd700;margin-top:8px"></div>
      <div style="margin-top:15px;padding:12px;background:#0f3460;border-radius:6px;font-size:12px;color:#9ab;line-height:1.7">${PURPOSE.tianmu}</div>`;
    const upd = () => {
      const s = (parseInt(document.getElementById('zd1').value)||0) +
                (parseInt(document.getElementById('zd2').value)||0) +
                (parseInt(document.getElementById('zd3').value)||0);
      document.getElementById('tmSum').textContent = `点数和：${s}`;
    };
    ['zd1','zd2','zd3'].forEach(id => document.getElementById(id).onchange = upd);
    upd();
  } else {
    wrap.innerHTML = `
      <label style="font-size:13px;color:#aaa">骰子点数（1=阿,2=Ra,3=巴,4=匝,5=纳,6=德）</label>
      <select id="zd1" style="width:100%;padding:8px;margin:6px 0;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#e0d8c8">
        ${DICE6.map(d=>`<option value="${d.n}">${d.n}=${d.c}</option>`).join('')}
      </select>
      <div style="margin-top:15px;padding:12px;background:#0f3460;border-radius:6px;font-size:12px;color:#9ab;line-height:1.7">${PURPOSE.guanyinLiu}</div>`;
  }
}

// 初始化新Tab
initG32();
initDlz();
initZang();
