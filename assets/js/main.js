/* ============================================================
   康鹭记忆 · 公共脚本
   ============================================================ */

/* ---------- 工具 ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

/* ---------- 顶栏 ---------- */
function initHeader(){
  const cur = document.body.dataset.page || 'home';
  $$('.nav a').forEach(a => {
    if (a.dataset.nav === cur) a.classList.add('on');
  });
  const toggle = $('.nav-toggle');
  const nav = $('.nav');
  if (toggle && nav){
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  }
}

/* ---------- 滚动显现 ---------- */
function initReveal(){
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)){ items.forEach(i => i.classList.add('in')); return; }
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en, i) => {
      if (en.isIntersecting){
        setTimeout(() => en.target.classList.add('in'), i * 60);
        io.unobserve(en.target);
      }
    });
  }, { threshold:.12, rootMargin:'0px 0px -40px 0px' });
  items.forEach(i => io.observe(i));
}

/* ---------- 数字滚动 ---------- */
function initCounters(){
  const nodes = $$('[data-count]');
  if (!nodes.length) return;
  const run = el => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1] || '').length;
    const dur = 1100, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec);
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)){ nodes.forEach(run); return; }
  const io = new IntersectionObserver(ents => {
    ents.forEach(en => { if (en.isIntersecting){ run(en.target); io.unobserve(en.target); } });
  }, { threshold:.5 });
  nodes.forEach(n => io.observe(n));
}

/* ---------- 进度条动画 ---------- */
function initBars(){
  const fills = $$('.bar-fill[data-w]');
  if (!fills.length) return;
  const set = f => { f.style.width = f.dataset.w + '%'; };
  if (!('IntersectionObserver' in window)){ fills.forEach(set); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting){ set(e.target); io.unobserve(e.target); } });
  }, { threshold:.4 });
  fills.forEach(f => io.observe(f));
}

/* ---------- 统计条 ---------- */
function renderStats(sel){
  const box = $(sel); if (!box) return;
  box.innerHTML = STATS.map(s => `
    <div class="stat reveal">
      <div class="v">${s.suffix}<span data-count="${s.num}">0</span><span class="u">${s.unit}</span></div>
      <div class="l">${s.label}</div>
      <div class="d">${s.desc}</div>
    </div>`).join('');
}

/* ---------- 时间轴 ---------- */
function renderTimeline(sel, limit){
  const box = $(sel); if (!box) return;
  const list = limit ? TIMELINE.slice(-limit) : TIMELINE;
  box.innerHTML = list.map((t, i) => `
    <li class="tl-item reveal ${limit && i < list.length - 4 ? 'ghost' : ''}" data-tag="${t.tag}">
      <span class="tl-dot"></span>
      <div class="tl-body">
        <span class="tl-year">${t.year}</span>
        <span class="tl-tag">${t.tag} · ${t.phase}</span>
        <h4>${t.title}</h4>
        <p>${t.body}</p>
      </div>
    </li>`).join('');
}

/* ---------- 产业链 ---------- */
const CHAIN_ICON = {
  fabric:'<path d="M3 6c3-2 6 2 9 0s6-2 9 0M3 12c3-2 6 2 9 0s6-2 9 0M3 18c3-2 6 2 9 0s6-2 9 0"/>',
  cut:'<path d="M4 20 20 4M8 4h12v12M4 16v4h4"/><path d="M14 4l6 6"/>',
  sew:'<path d="M8 3h8l-2 18H10L8 3z"/><path d="M10 8h4M10 13h4"/><path d="M12 3v18"/>',
  iron:'<path d="M4 14h16v6H4z"/><path d="M6 14V8a6 6 0 0112 0v6"/><path d="M9 6h6"/>',
  ship:'<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  loop:'<path d="M20 12a8 8 0 11-3-6.2"/><path d="M20 4v5h-5"/>'
};
function renderChain(sel){
  const box = $(sel); if (!box) return;
  box.innerHTML = CHAIN.map(c => `
    <div class="chain-step reveal">
      <div class="chain-ic"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">${CHAIN_ICON[c.icon] || ''}</svg></div>
      <span class="chain-time">${c.time}</span>
      <h5>${c.step} ${c.title}</h5>
      <p>${c.desc}</p>
    </div>`).join('');
}

/* ---------- 参考文献 ---------- */
function renderRefs(sel){
  const box = $(sel); if (!box) return;
  box.innerHTML = REFS.map(r => `<li><b>${r.t}</b><span>${r.d}</span></li>`).join('');
}

/* ---------- 启动 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initReveal();
  initCounters();
});
