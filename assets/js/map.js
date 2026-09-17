/* ============================================================
   康鹭记忆 · 交互意象地图
   —— 关系地图（relational map），非测绘成果
   ============================================================ */

const LAYERS = {
  industry:  { name:'产业空间', color:'#9c3b2a' },
  life:      { name:'生活服务', color:'#4a6152' },
  governance:{ name:'治理节点', color:'#2f4459' },
  transit:   { name:'交通连接', color:'#7a6a45' },
  outside:   { name:'区域外联', color:'#5f4a58' }
};

const RELATIONS = [
  { c:'#9c3b2a', t:'实线 · 布料供应', d:'中大布匹市场 → 村内制衣厂（步行 / 电动车）' },
  { c:'#2f4459', t:'实线 · 成衣出货', d:'村内制衣厂 → 十三行、沙河批发档口（凌晨发车）' },
  { c:'#4a6152', t:'虚线 · 用工匹配', d:'招工广场 ⇄ 村内作坊（步行几分钟）' },
  { c:'#5f4a58', t:'虚线 · 产业转移', d:'康鹭 → 清远 · 广清纺织服装产业园（约 80 km）' }
];

/* ---------- 底图构件 ---------- */
const BASE_ROADS = [
  { d:'M0 206 L1000 196', w:6, label:'新港西路', lx:30, ly:200 },
  { d:'M432 40 L436 460', w:5, label:'瑞康路', lx:444, ly:70 },
  { d:'M524 430 L516 680', w:5, label:'逸景路', lx:536, ly:660 },
  { d:'M120 520 L860 470', w:4, label:'', lx:0, ly:0 }
];

const VILLAGE_LANES = [
  'M210 250 L430 236','M206 300 L436 288','M204 350 L440 338','M214 400 L446 386',
  'M250 214 L244 424','M300 210 L296 428','M352 208 L350 430','M404 210 L400 432',
  'M470 262 L706 250','M466 312 L710 300','M462 362 L714 350','M470 412 L706 400',
  'M508 232 L502 436','M560 230 L556 440','M614 228 L610 442','M668 232 L664 444'
];

const RIVER = 'M150 452 C 300 470, 420 430, 520 452 S 700 478, 880 442';

const REGIONS = [
  { id:'rg-kangle', name:'康乐村', x:330, y:318, rx:118, ry:112, layer:'industry' },
  { id:'rg-lujiang',name:'鹭江村', x:588, y:340, rx:118, ry:100, layer:'industry' },
  { id:'rg-zhongda',name:'中大布匹市场', x:648, y:132, rx:120, ry:60, layer:'industry' }
];

/* ---------- 生成 SVG ---------- */
function buildMap(){
  const svg = document.getElementById('kangluMap');
  if (!svg) return;

  const P = (id) => POIS.find(p => p.id === id);
  const C = (l) => (LAYERS[l] ? LAYERS[l].color : '#7b7d77');

  let s = '';

  /* defs */
  s += `<defs>
    <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(27,29,30,.10)" stroke-width="1"/>
    </pattern>
    <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>`;

  /* 背景 */
  s += `<rect x="0" y="0" width="1000" height="680" fill="#eef0f0"/>`;

  /* 周边建成区（淡） */
  s += `<rect x="0" y="0" width="1000" height="680" fill="rgba(27,29,30,.018)"/>`;
  s += `<rect x="20" y="20" width="960" height="640" rx="6" fill="none" stroke="rgba(27,29,30,.10)" stroke-dasharray="4 6"/>`;

  /* 中大纺织商圈范围（顶部） */
  s += `<path d="M470 40 L900 40 L900 196 L470 196 Z" fill="rgba(155,59,42,.045)" stroke="rgba(155,59,42,.20)" stroke-dasharray="6 5"/>`;
  s += `<text x="478" y="60" font-size="12" fill="rgba(27,29,30,.45)" font-family="sans-serif">中大纺织商圈 · 59 家专业市场</text>`;

  /* 村域块 */
  REGIONS.forEach(r => {
    s += `<ellipse class="mp-region" data-region="${r.id}" cx="${r.x}" cy="${r.y}" rx="${r.rx}" ry="${r.ry}"
            fill="${C(r.layer)}" fill-opacity=".07" stroke="${C(r.layer)}" stroke-opacity=".30" stroke-dasharray="7 5"/>`;
  });

  /* 村内街巷 */
  s += `<g opacity=".55">` + VILLAGE_LANES.map(d =>
    `<path d="${d}" stroke="rgba(27,29,30,.16)" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('') + `</g>`;

  /* 主干道 */
  s += BASE_ROADS.map(r =>
    `<path d="${r.d}" stroke="#eef0f0" stroke-width="${r.w + 5}" fill="none" stroke-linecap="round"/>
     <path d="${r.d}" stroke="rgba(27,29,30,.22)" stroke-width="${r.w}" fill="none" stroke-linecap="round"/>`).join('');
  s += BASE_ROADS.filter(r => r.label).map(r =>
    `<text x="${r.lx}" y="${r.ly}" font-size="11" fill="rgba(27,29,30,.42)" font-family="sans-serif">${r.label}</text>`).join('');

  /* 河涌 */
  s += `<path d="${RIVER}" stroke="rgba(47,68,89,.28)" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  s += `<path d="${RIVER}" stroke="rgba(47,68,89,.55)" stroke-width="1" fill="none" stroke-dasharray="3 4"/>`;
  s += `<text x="770" y="436" font-size="11" fill="rgba(47,68,89,.75)" font-family="sans-serif">河涌</text>`;

  /* 关系连线 */
  s += `<g id="links">` + LINKS.map((l, i) => {
    const a = P(l.from), b = P(l.to);
    if (!a || !b) return '';
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 34;
    return `<path class="mp-link ${l.dashed ? 'dashed' : ''}" data-link="${l.from}-${l.to}"
              d="M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}"/>
            <text x="${mx}" y="${my - 5}" font-size="10" text-anchor="middle"
              fill="rgba(27,29,30,.42)" font-family="sans-serif">${l.label}</text>`;
  }).join('') + `</g>`;

  /* POI */
  s += `<g id="pois">` + POIS.map(p => {
    const col = C(p.layer);
    const big = p.r >= 40;
    const right = p.x < 740 && !big;
    let g = `<g class="mp-poi" data-id="${p.id}" data-layer="${p.layer}" tabindex="0" role="button" aria-label="${p.name}">`;
    g += `<title>${p.name}</title>`;
    if (big){
      g += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${col}" fill-opacity=".075" stroke="${col}" stroke-opacity=".22" stroke-dasharray="4 5"/>`;
    }
    g += `<circle cx="${p.x}" cy="${p.y}" r="${big ? 16 : 15}" fill="${col}" fill-opacity=".13"/>`;
    g += `<circle class="dot" cx="${p.x}" cy="${p.y}" r="${big ? 8 : 6.5}" fill="${col}" stroke="#eef0f0" stroke-width="2"/>`;
    if (big){
      g += `<text x="${p.x}" y="${p.y + p.r - 12}" text-anchor="middle" font-size="13.5" font-weight="600" fill="#1a1a19">${p.name}</text>`;
      g += `<text class="sm" x="${p.x}" y="${p.y + p.r + 2}" text-anchor="middle">${LAYERS[p.layer].name}</text>`;
    } else {
      const tx = right ? p.x + 20 : p.x - 20;
      const anc = right ? 'start' : 'end';
      g += `<text x="${tx}" y="${p.y + 1}" text-anchor="${anc}" font-size="12.5">${p.name}</text>`;
      g += `<text class="sm" x="${tx}" y="${p.y + 15}" text-anchor="${anc}">${LAYERS[p.layer].name}</text>`;
    }
    g += `</g>`;
    return g;
  }).join('') + `</g>`;

  /* 指北针 + 比例尺 */
  s += `<g transform="translate(928,600)">
      <circle r="19" fill="rgba(238,240,240,.9)" stroke="rgba(27,29,30,.2)"/>
      <path d="M0 -13 L4.5 4 L0 0.5 L-4.5 4 Z" fill="#9c3b2a"/>
      <text y="-20" text-anchor="middle" font-size="10" fill="rgba(27,29,30,.5)" font-family="sans-serif">N</text>
    </g>
    <g transform="translate(56,640)">
      <line x1="0" y1="0" x2="120" y2="0" stroke="rgba(27,29,30,.45)" stroke-width="1.5"/>
      <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(27,29,30,.45)" stroke-width="1.5"/>
      <line x1="120" y1="-5" x2="120" y2="5" stroke="rgba(27,29,30,.45)" stroke-width="1.5"/>
      <text x="60" y="-8" text-anchor="middle" font-size="10.5" fill="rgba(27,29,30,.5)" font-family="sans-serif">示意距离 · 非等比例</text>
    </g>`;

  svg.innerHTML = s;
}

/* ---------- 详情面板 ---------- */
function showPOI(id){
  const p = POIS.find(x => x.id === id);
  const box = document.getElementById('panelBody');
  if (!p || !box) return;

  document.querySelectorAll('.mp-poi').forEach(g => g.classList.toggle('active', g.dataset.id === id));

  box.innerHTML = `
    <div class="ph">${LAYERS[p.layer].name} · ${p.id.toUpperCase()}</div>
    <h3>${p.name}</h3>
    <p class="psum">${p.summary}</p>
    <div class="pdetail">${p.detail}</div>
    <ul class="fact-list">
      ${p.facts.map(f => `<li><span class="k">${f[0]}</span><span class="v">${f[1]}</span></li>`).join('')}
    </ul>`;
  box.scrollIntoView({ block:'nearest' });
}

function resetPanel(){
  const box = document.getElementById('panelBody');
  if (!box) return;
  box.innerHTML = `
    <div class="ph">Spatial Record</div>
    <h3>点击任一节点</h3>
    <p class="psum">地图上共标注 ${POIS.length} 处空间节点，覆盖产业、生活、治理、交通与区域外联${Object.keys(LAYERS).length} 个图层。</p>
    <div class="pdetail">
      这张图不追求测绘精度，而是一张<b>关系地图</b>：它想表达的是供应、用工、出货、治理这四张网络，
      如何被压缩在同一平方公里之内。也正因如此，当产业需要外迁时，被拆散的是一整套关系，而不只是几栋房子。
    </div>
    <ul class="fact-list">
      <li><span class="k">标注节点</span><span class="v">${POIS.length} 处</span></li>
      <li><span class="k">图层</span><span class="v">${Object.keys(LAYERS).length} 类</span></li>
      <li><span class="k">制图方式</span><span class="v">意象示意 / 非测绘</span></li>
    </ul>`;
  document.querySelectorAll('.mp-poi').forEach(g => g.classList.remove('active'));
}

/* ---------- 图层筛选 ---------- */
function initFilters(){
  const bar = document.getElementById('mapFilters');
  if (!bar) return;
  bar.innerHTML = Object.entries(LAYERS).map(([k, v]) =>
    `<button class="chip on" data-layer="${k}"><span class="swatch" style="background:${v.color}"></span>${v.name}</button>`
  ).join('');

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    btn.classList.toggle('on');
    const on = new Set($$('.chip.on', bar).map(b => b.dataset.layer));
    POIS.forEach(p => {
      const g = document.querySelector(`.mp-poi[data-id="${p.id}"]`);
      if (g) g.style.display = on.has(p.layer) ? '' : 'none';
    });
    REGIONS.forEach(r => {
      const g = document.querySelector(`.mp-region[data-region="${r.id}"]`);
      if (g) g.style.display = on.has(r.layer) ? '' : 'none';
    });
    LINKS.forEach(l => {
      const a = POIS.find(p => p.id === l.from), b = POIS.find(p => p.id === l.to);
      const g = document.querySelector(`.mp-link[data-link="${l.from}-${l.to}"]`);
      if (g && a && b) g.style.display = (on.has(a.layer) && on.has(b.layer)) ? '' : 'none';
    });
  });
}

/* ---------- 节点列表（移动端友好） ---------- */
function initList(){
  const box = document.getElementById('poiList');
  if (!box) return;
  box.innerHTML = POIS.map(p => `
    <button class="chip" data-goto="${p.id}" style="border-radius:2px">
      <span class="swatch" style="background:${LAYERS[p.layer].color}"></span>${p.name}
    </button>`).join('');
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-goto]'); if (!b) return;
    showPOI(b.dataset.goto);
    document.getElementById('kangluMap').scrollIntoView({ behavior:'smooth', block:'center' });
  });
}

/* ---------- 关系图例 ---------- */
function initRelations(){
  const box = document.getElementById('relList');
  if (!box) return;
  box.innerHTML = RELATIONS.map(r => `
    <div style="display:flex;gap:12px;align-items:flex-start">
      <span style="flex-shrink:0;margin-top:8px;width:24px;height:2px;background:${r.c}"></span>
      <div><b style="font-size:13.5px">${r.t}</b><div class="small muted">${r.d}</div></div>
    </div>`).join('');
}

/* ---------- 启动 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildMap();
  resetPanel();
  initFilters();
  initList();
  initRelations();

  const pc = document.getElementById('poiCount');
  if (pc) pc.textContent = POIS.length;
  const lc = document.getElementById('layerCount');
  if (lc) lc.textContent = Object.keys(LAYERS).length;

  const svg = document.getElementById('kangluMap');
  svg.addEventListener('click', e => {
    const g = e.target.closest('.mp-poi');
    if (g) showPOI(g.dataset.id);
  });
  svg.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('.mp-poi');
    if (g){ e.preventDefault(); showPOI(g.dataset.id); }
  });
});
