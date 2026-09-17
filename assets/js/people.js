/* ============================================================
   康鹭记忆 · 人物档案卡片
   —— 本文件是「展示逻辑」，一般不需要修改。
      要改的是档案内容：assets/js/people-data.js
   ============================================================ */

/* 身份分类（如要新增分类，请同时在这里和 people-data.js 的 cat 字段中增加） */
const CATS = ['全部', '制衣厂主', '制衣工人', '观察者'];

/* 未指定 color 时的自动配色 */
const CAT_COLOR = {
  '制衣厂主': '#9c3b2a',
  '制衣工人': '#2f4459',
  '观察者':     '#5f4a58'
};

/* 当前正在展示的档案列表 */
let LIST = [];
let state = { cat:'全部', q:'' };

const colorOf = p => p.color || CAT_COLOR[p.cat] || '#7b7d77';

/* 年份显示：since 可填数字（2005）或文字（「二十余年前」）；years 留空则不显示年数 */
function sinceText(p){
  const s = p.since;
  if (s === '' || s === null || s === undefined) return '';
  return typeof s === 'number' ? `${s} 年来康鹭` : String(s);
}
function spanText(p){
  return (p.years === '' || p.years === null || p.years === undefined) ? '' : `已 ${p.years} 年`;
}
const lineText = p => [sinceText(p), spanText(p)].filter(Boolean).join(' · ');

/* ---------- 头像（avatar 字段优先，其次取姓名首字） ---------- */
function avatarHTML(p, size){
  const c = colorOf(p);
  const nm = String(p.name || '');
  /* 未填 avatar 时：化名「老陈」「小刘」取第二个字，否则取首字 */
  const ch = p.avatar || (/^[老小大阿]/.test(nm) && nm.length > 1 ? nm.charAt(1) : nm.charAt(0));
  const inner = p.photo
    ? `<img src="${p.photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<span style="color:#fff">${ch}</span>`;
  return `<div class="avatar" style="width:${size};height:${size};font-size:${parseInt(size) * 0.4}px;background:${c};color:${c}">${inner}</div>`;
}

/* ---------- 卡片渲染 ---------- */
function renderPeople(){
  const grid = document.getElementById('peopleGrid');
  if (!grid) return;

  const q = state.q.trim().toLowerCase();
  const list = LIST.filter(p => {
    const okCat = state.cat === '全部' || p.cat === state.cat;
    if (!okCat) return false;
    if (!q) return true;
    return [p.name, p.cat, p.hometown, p.quote, p.story, (p.tags || []).join(' ')]
      .join(' ').toLowerCase().includes(q);
  });

  const cnt = document.getElementById('pCount');
  if (cnt) cnt.textContent = list.length;

  if (!list.length){
    grid.innerHTML = `<div class="empty">没有匹配的档案，试试换个关键词。</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="pcard reveal" data-id="${p.id}">
      <div class="bar" style="background:${colorOf(p)}"></div>
      <div class="top">
        ${avatarHTML(p, '60px')}
        <div class="who">
          <h3>${p.name} <small>${p.hometown} · ${p.cat}</small></h3>
          <span class="tagline">${lineText(p)}</span>
        </div>
      </div>
      <p class="quote">${p.quote}</p>
      <div class="tags">${(p.tags || []).map(t => `<span>${t}</span>`).join('')}</div>
      <div class="foot">
        <span>NO.${String(LIST.indexOf(p) + 1).padStart(2, '0')} / ${String(LIST.length).padStart(2, '0')}</span>
        <span class="read">展开档案 →</span>
      </div>
    </article>`).join('');
}

/* ---------- 筛选条 ---------- */
function initPeopleFilters(){
  const bar = document.getElementById('pFilters');
  if (!bar) return;

  bar.innerHTML = CATS.map(c => {
    const n = c === '全部' ? LIST.length : LIST.filter(p => p.cat === c).length;
    return `<button class="chip ${c === state.cat ? 'on' : ''}" data-cat="${c}">${c} <span style="opacity:.6">${n}</span></button>`;
  }).join('');

  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.dataset.cat;
    $$('.chip', bar).forEach(x => x.classList.toggle('on', x === b));
    renderPeople(); initReveal();
  });

  const input = document.getElementById('pSearch');
  if (input){
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = input.value; renderPeople(); initReveal(); }, 180);
    });
  }
}

/* ---------- 弹窗 ---------- */
function openPerson(id){
  const p = LIST.find(x => x.id === id);
  if (!p) return;
  const modal = document.getElementById('pModal');
  const idx = LIST.indexOf(p) + 1;

  modal.querySelector('.modal-hd').innerHTML = `
    <button class="close" aria-label="关闭">×</button>
    <div class="mavatar">
      ${avatarHTML(p, '66px')}
      <div>
        <h2>${p.name}</h2>
        <div class="msub">${[p.cat, p.hometown, lineText(p), (p.age && p.age !== '—') ? p.age : ''].filter(Boolean).join(' · ')}</div>
      </div>
    </div>`;

  const metaKeys = Object.keys(p.meta || {});
  modal.querySelector('.modal-ct').innerHTML = `
    ${metaKeys.length ? `<div class="meta-grid">
      ${metaKeys.map(k => `<div><div class="k">${k}</div><div class="v">${p.meta[k]}</div></div>`).join('')}
    </div>` : ''}
    <h5>口述摘录</h5>
    <blockquote class="pull" style="margin-top:0;font-size:19px">${p.quote}</blockquote>
    <h5>档案正文</h5>
    <p class="story">${p.story}</p>
    <div class="tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
      ${(p.tags || []).map(t => `<span style="font-size:11.5px;padding:2px 9px;border:1px solid var(--line);border-radius:2px;color:var(--ink-3);background:var(--paper-2)">${t}</span>`).join('')}
    </div>
    <div class="src">
      档案编号 NO.${String(idx).padStart(2, '0')} · 化名 · 资料来源：${p.source || '未注明'}
    </div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  const modal = document.getElementById('pModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function initModal(){
  const modal = document.getElementById('pModal');
  if (!modal) return;
  modal.addEventListener('click', e => {
    if (e.target.classList.contains('modal-bd') || e.target.closest('.close')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  document.getElementById('peopleGrid').addEventListener('click', e => {
    const card = e.target.closest('.pcard');
    if (card) openPerson(card.dataset.id);
  });
}

/* ---------- 身份分布 ---------- */
function initDist(){
  const box = document.getElementById('pDist');
  if (!box) return;
  const groups = {};
  LIST.forEach(p => { groups[p.cat] = (groups[p.cat] || 0) + 1; });
  const total = LIST.length || 1;
  box.innerHTML = Object.entries(groups).map(([k, v]) => {
    const pct = Math.round(v / total * 100);
    return `<div class="bar-row reveal">
      <span class="bl">${k}</span>
      <span class="bar-track"><span class="bar-fill" style="background:${CAT_COLOR[k] || '#7b7d77'}" data-w="${pct}"></span></span>
      <span class="bv">${v} 人 / ${pct}%</span>
    </div>`;
  }).join('');
}

/* ---------- 启动 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  LIST = (typeof PEOPLE !== 'undefined' ? PEOPLE : []).slice();
  renderPeople();
  initPeopleFilters();
  initModal();
  initDist();
  initReveal();
  initBars();
});
