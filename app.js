{
const S = window.SITE, L = window.LAB, QB = window.QB, GM = window.GAMES, app = document.getElementById('app');
{ let r = 11, d = ''; const rnd = () => (r = r * 16807 % 2147483647) / 2147483647; for (let i = 0; i < 90; i++) { const x = (rnd() * 640).toFixed(1), y = (rnd() * 320).toFixed(1), s = (0.4 + rnd() * rnd() * 1.4).toFixed(2), o = (0.35 + rnd() * 0.6).toFixed(2); d += `<circle cx='${x}' cy='${y}' r='${s}' fill='%23eaf4f7' fill-opacity='${o}'/>`; } document.documentElement.style.setProperty('--stars', `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='320'>${d}</svg>")`); }
const byN = n => S.lessons.find(l => l.n === n);
const modOf = l => S.modules.find(m => m.id === l.mod);
const num = L.num;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- сақтау ---------- */
const PF = window.PF, GEN = window.GEN;
const load = () => PF.load();
const save = d => PF.save(d);

/* ---------- мәзір ---------- */
const NAV = [
  { t: 'Басты бет', h: 'home' },
  { t: 'КТП', h: 'plan' },
  { t: 'Сабақтар', items: [['Барлық сабақтар', 'lessons']].concat(...S.modules.map(m => [['§' + m.n, null]].concat(m.lessons.map(n => { const l = byN(n); return [l.code + '. ' + l.title, 'lesson-' + n]; })))) },
  { t: 'Симуляциялар', items: [['Барлық симуляциялар', 'lab']].concat(...[1, 2, 3].map(g => [['§' + S.modules[g].n, null]].concat(L.MODELS.filter(m => m.g === g).map(m => [m.t, 'lab-' + m.id]))), [['§Құралдар', null], ['Telegram-бот', 'bot'], ['ЖИ және комикстер', 'comics']]) },
  { t: 'Ойындар', items: [['Барлық ойындар', 'games']].concat(GM.map(g => [g.t, 'game-' + g.id])) },
  { t: 'Тесттер', items: [['Барлық тесттер', 'tests'], ['Қорытынды тест (20 сұрақ)', 'test-final'], ['Апта сынағы', 'weekly'], ['Есеп генераторы', 'problems'], ['§Диагностика', null], ['Бастапқы диагностика', 'diag-pre'], ['Қорытынды диагностика', 'diag-post'], ['§Анықтама', null], ['Глоссарий', 'glossary']] },
  { t: 'Кабинет', items: [['Менің кабинетім', 'profile'], ['Рейтинг', 'rating'], ['ЖИ-көмекші', 'ai'], ['§Мұғалімге', null], ['Мұғалім кабинеті', 'teacher'], ['Нұсқаулық', 'guide'], ['Құпиялылық және келісім', 'privacy']] }
];
const nav = document.getElementById('nav');
nav.innerHTML = NAV.map((g, i) => g.h ? `<div class="dd" data-g="${i}"><a href="#${g.h}">${g.t}</a></div>` :
  `<div class="dd" data-g="${i}"><button type="button" aria-expanded="false">${g.t}</button><div class="menu">${g.items.map(([t, h]) => h ? `<a href="#${h}">${t}</a>` : `<div class="grp">${t.slice(1)}</div>`).join('')}</div></div>`).join('');
const closeAll = () => nav.querySelectorAll('.dd.open').forEach(d => { d.classList.remove('open'); d.querySelector('button')?.setAttribute('aria-expanded', 'false'); });
nav.querySelectorAll('.dd>button').forEach(b => b.onclick = e => { e.stopPropagation(); const d = b.parentElement, o = d.classList.contains('open'); closeAll(); if (!o) { d.classList.add('open'); b.setAttribute('aria-expanded', 'true'); } });
document.addEventListener('click', e => { if (!nav.contains(e.target)) closeAll(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(); lb.classList.remove('show'); } });
const burger = document.getElementById('burger');
burger.onclick = () => { const s = nav.classList.toggle('show'); burger.setAttribute('aria-expanded', s); };
const groupOf = r => r === 'home' ? 0 : r === 'plan' ? 1 : /^lesson/.test(r) ? 2 : /^(lab|bot|comics)/.test(r) ? 3 : /^game/.test(r) ? 4 : /^(tests|test-|diag|weekly|problems|glossary)/.test(r) ? 5 : 6;

/* ---------- көмекшілер ---------- */
const banner = (title, lead = '', crumb = '') => `<section class="banner"><div class="wrap">${crumb ? `<div class="crumb">${crumb}</div>` : ''}<h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;
const ticks = a => `<ul class="ticks">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
const kindOf = u => /youtu/.test(u) ? ['vid', 'Бейне'] : /wordwall|educaplay|wayground/.test(u) ? ['game', 'Ойын'] : /chatgpt|gamma/.test(u) ? ['ai', 'ЖИ'] : /^#game/.test(u) ? ['game', 'Сайттағы ойын'] : /^#/.test(u) ? ['sim', 'Сайттағы симуляция'] : ['sim', 'Симуляция'];
const res = (t, u, sub) => { const [k, w] = kindOf(u); return `<a href="${u}"${u[0] === '#' ? '' : ' target="_blank" rel="noopener"'}><i class="k-${k}">${k === 'vid' ? '▶' : k === 'game' ? 'Ой' : k === 'ai' ? 'ЖИ' : '◎'}</i><span>${t}<small>${sub || w}</small></span></a>`; };
const simsFor = n => L.MODELS.filter(m => m.l.includes(n));
const gamesFor = n => GM.filter(g => g.l.includes(n));
const sc = id => (load().scores || {})[id];
const critTable = () => `<div class="scroll"><table><thead><tr><th>Критерий</th><th>Сипаттамасы</th><th class="n">Балл</th></tr></thead><tbody>${S.criteria.map(c => `<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td class="n">${c[2]}</td></tr>`).join('')}</tbody><tfoot><tr><td>Барлығы</td><td></td><td class="n">40</td></tr></tfoot></table></div>`;
const gameIcon = g => `<svg viewBox="0 0 100 100" aria-hidden="true">${g.icon}</svg>`;

/* ---------- тест жүйесі ---------- */
const conceptual = q => !/\d/.test(q[0]) && !q[1].some(o => /\d/.test(o));
function testSet(n, lvl) {
  const base = QB[n].map((q, i) => [q[0], q[1], q[2], q[3], { n, i }]);
  if (lvl === 'A') { const c = base.filter(conceptual); return (c.length >= 5 ? c : c.concat(base.filter(q => !conceptual(q)))).slice(0, 6); }
  if (lvl === 'W') { const w = new Set(load().wrong?.[n] || []); return base.filter(q => w.has(q[4].i)); }
  return base.concat(PF.customFor(n).map(q => [q[0], q[1], q[2], q[3], null]));
}
const storeTopic = n => (d, s, t) => { d.scores = d.scores || {}; const prev = d.scores[n]; d.scores[n] = { s, t, ts: Date.now(), b: Math.max(s, prev?.b ?? prev?.s ?? 0) }; return d.scores[n].b + ' / ' + t; };
function runner(el, cfg) {
  const qs = cfg.qs; let order = cfg.shuffle ? shuffle(qs.map((q, i) => i)) : qs.map((q, i) => i), i = 0, ans = [];
  if (!qs.length) { el.innerHTML = `<h2 style="font-size:20px">${cfg.title}</h2><p class="muted">${cfg.empty || 'Сұрақ жоқ.'}</p>`; return; }
  const finish = () => {
    const s = ans.filter(a => a.ok).length, t = qs.length, p = Math.round(s / t * 100), d = load();
    d.wrong = d.wrong || {};
    ans.forEach(a => { const src = qs[a.i][4]; if (!src) return; const w = new Set(d.wrong[src.n] || []); if (a.ok) w.delete(src.i); else w.add(src.i); d.wrong[src.n] = [...w]; });
    const bestTxt = cfg.store ? cfg.store(d, s, t) : '';
    save(d);
    const wrong = ans.filter(a => !a.ok);
    el.innerHTML = `<div class="row" style="justify-content:space-between"><h2 style="font-size:20px;margin:0">${cfg.title}</h2><span class="small muted">Аяқталды</span></div>
    <div class="row" style="margin:16px 0;gap:18px;align-items:center"><div style="font-family:Unbounded,sans-serif;font-size:clamp(34px,6vw,52px);color:${p >= 70 ? 'var(--ok)' : 'var(--gold)'}">${s} / ${t}</div><div><b>${p}%</b><div class="muted small">${p >= 85 ? 'Өте жақсы нәтиже!' : p >= 70 ? 'Жақсы деңгей (70% және жоғары).' : 'Тақырыпты қайталап, тағы тапсырып көр.'}</div>${bestTxt ? `<div class="muted small">Үздік нәтиже: ${bestTxt}</div>` : ''}<div class="muted small">XP: ${PF.xpOf(load())}</div></div></div>
    ${wrong.length ? `<details open><summary>Қателерді қарау (${wrong.length})</summary>${wrong.map(a => { const q = qs[a.i]; return `<div style="margin:10px 0"><b>${q[0]}</b><div class="small" style="color:var(--bad)">Сенің жауабың: ${a.j >= 0 ? q[1][a.j] : '—'}</div><div class="small" style="color:var(--ok)">Дұрыс жауап: ${q[1][q[2]]}</div><div class="small muted">${q[3]}</div></div>`; }).join('')}</details>` : '<p>Барлық жауап дұрыс!</p>'}
    <div class="btns" style="margin-top:14px"><button class="btn" type="button" data-act="again">Қайта тапсыру</button>${cfg.topic && wrong.length ? `<button class="btn ghost" type="button" data-act="wrong">Қателермен жұмыс</button>` : ''}${wrong.length && PF.st.sample ? `<button class="btn ghost" type="button" data-act="ai">ЖИ-ден түсіндіруді сұрау</button>` : ''}<a class="btn ghost" href="#profile">Менің кабинетім</a></div>`;
    el.querySelector('[data-act=again]').onclick = () => { order = shuffle(qs.map((q, k) => k)); i = 0; ans = []; show(); };
    const w = el.querySelector('[data-act=wrong]'); if (w) w.onclick = () => cfg.onLevel && cfg.onLevel('W');
    const ai = el.querySelector('[data-act=ai]'); if (ai) ai.onclick = () => { try { sessionStorage.setItem('ai_preset', 'Мен мына сұрақтарда қателестім. Әрқайсысының дұрыс жауабын қарапайым тілмен түсіндірші:\n' + wrong.slice(0, 4).map(a => { const q = qs[a.i]; return `– ${q[0]} Менің жауабым: ${a.j >= 0 ? q[1][a.j] : '—'}. Дұрыс жауап: ${q[1][q[2]]}.`; }).join('\n')); } catch (e) { } location.hash = cfg.topic ? 'ai-' + cfg.topic : 'ai'; };
  };
  const show = () => {
    const q = qs[order[i]];
    el.innerHTML = `<div class="row" style="justify-content:space-between"><h2 style="font-size:20px;margin:0">${cfg.title}</h2><span class="small muted">${i + 1} / ${qs.length}</span></div>
    <div class="meter" style="margin:12px 0 4px"><i style="width:${i / qs.length * 100}%"></i></div>
    <div class="q" style="font-size:18px;margin:16px 0 12px">${q[0]} ${PF.spk(q[0] + ' ' + q[1].map((o, k) => (k + 1) + ') ' + o).join('. '))}</div><div class="opts">${q[1].map((o, j) => `<button type="button" class="o" data-j="${j}">${o}</button>`).join('')}</div>
    <div class="ex" hidden></div><div class="row" style="margin-top:14px;justify-content:space-between"><span class="small muted">Дұрыс: ${ans.filter(a => a.ok).length}</span><button class="btn" type="button" data-act="next" hidden>${i < qs.length - 1 ? 'Келесі сұрақ →' : 'Нәтижені көру'}</button></div>`;
    el.querySelectorAll('.o').forEach(b => b.onclick = () => {
      const j = +b.dataset.j, ok = j === q[2]; ans.push({ i: order[i], j, ok });
      el.querySelectorAll('.o').forEach((x, k) => { x.disabled = true; if (k === q[2]) x.classList.add('ok'); else if (k === j) x.classList.add('no'); });
      const ex = el.querySelector('.ex'); ex.hidden = false; ex.innerHTML = `<b style="color:${ok ? 'var(--ok)' : 'var(--bad)'}">${ok ? 'Дұрыс!' : 'Қате.'}</b> ${q[3]}`;
      const nb = el.querySelector('[data-act=next]'); nb.hidden = false; nb.focus();
      nb.onclick = () => { i++; i < qs.length ? show() : finish(); };
    });
  };
  show();
}
function problemsBlock(el, topic, count, onSolved) {
  const seeds = () => Array.from({ length: count }, () => Math.floor(Math.random() * 1e9) + 1);
  let sd = seeds();
  const draw = () => {
    const ps = sd.map(s => GEN.make(topic, s));
    el.innerHTML = ps.map((p, k) => `<div class="task prob"><h3><span>${k + 1}-есеп</span>${PF.spk(p.q)}</h3><p>${p.q}</p><div class="row"><input type="text" inputmode="decimal" aria-label="Жауап" placeholder="Жауап${p.u ? ', ' + p.u : ''}" style="max-width:220px"><button class="btn" type="button" data-c="${k}">Тексеру</button><button class="btn ghost" type="button" data-s="${k}" hidden>Шешімі</button></div><div class="ex" hidden></div></div>`).join('') + `<button class="btn ghost" type="button" data-new>Жаңа есептер</button>`;
    el.querySelectorAll('.prob').forEach((card, k) => {
      const p = ps[k], inp = card.querySelector('input'), ex = card.querySelector('.ex'), sb = card.querySelector('[data-s]'); let tries = 0, solved = false;
      const check = () => {
        const r = GEN.check(p, inp.value); ex.hidden = false;
        if (r === null) { ex.innerHTML = '<b style="color:var(--gold)">Санды енгізіңіз</b> (мысалы 12,5 немесе 2,4e-5' + (p.time ? ' немесе 14:30' : '') + ').'; return; }
        if (r) { ex.innerHTML = `<b style="color:var(--ok)">Дұрыс!</b> ${p.sol}`; if (!solved) { solved = true; const d = load(); d.problems = d.problems || { solved: 0, byTopic: {}, ts: {} }; d.problems.solved = (d.problems.solved || 0) + 1; d.problems.byTopic = d.problems.byTopic || {}; d.problems.byTopic[topic] = (d.problems.byTopic[topic] || 0) + 1; d.problems.ts = d.problems.ts || {}; d.problems.ts[topic] = Date.now(); save(d); onSolved && onSolved(); } inp.disabled = true; }
        else { tries++; ex.innerHTML = `<b style="color:var(--bad)">Әзірге дұрыс емес.</b> ${tries >= 2 ? 'Шешімін қарауға болады.' : 'Формуланы тексеріп, тағы көріңіз.'}`; if (tries >= 2) sb.hidden = false; }
      };
      card.querySelector('[data-c]').onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check(); };
      sb.onclick = () => { ex.hidden = false; ex.innerHTML = `Жауабы: <b>${GEN.show(p)} ${p.u}</b>. ${p.sol}`; };
    });
    el.querySelector('[data-new]').onclick = () => { sd = seeds(); draw(); };
  };
  draw();
}

/* ---------- беттер ---------- */
const P = {};
const totalQ = Object.values(QB).reduce((a, q) => a + q.length, 0);
P.home = () => `
<section class="hero"><div class="wrap">
  <div>
    <h1>Астрономия негіздерін оқытудағы жаңа әдістер</h1>
    <p class="lead">Комикс, Telegram-бот және жасанды интеллект мүмкіндіктері. 9-сынып оқушыларына арналған авторлық бағдарламаның цифрлық платформасы: 17 сабақ, ${L.MODELS.length} симуляция, ${GM.length} ойын және ${totalQ} тест сұрағы.</p>
    <div class="btns"><a class="btn" href="#lessons">Сабақтарға өту</a><a class="btn ghost" href="#games">Ойындар</a><a class="btn ghost" href="#tests">Тесттер</a></div>
    <div class="who">Құрастырушы автор: <b>Сулейманов Бегдулла Жалгасбайулы</b>, «Ақбөбек лицейі» физика пәні мұғалімі, Ақтөбе қаласы. Аптасына 1 сағат, жылына 34 сағат.</div>
  </div>
  <figure class="sky" style="margin:0">${L.planisphere()}<figcaption>Жұлдызды аспанның жылжымалы картасы, Ақтөбе ендігі (φ ≈ 50°). <a href="#lab-plani">Интерактивті нұсқасы</a></figcaption></figure>
</div></section>
<section class="band alt"><div class="wrap"><h2>Бөлімдер</h2><div class="grid g4" style="margin-top:16px">
  <a class="tile" href="#lessons"><div class="pic"><img src="img/comic-l03.jpg" alt="Ньютон заңдары туралы комикс"></div><div class="t"><b>Сабақтар</b><span>17 сабақ: мақсаты, барысы, тапсырмалар, жауаптар</span></div></a>
  <a class="tile" href="#lab"><div class="pic"><svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="42" ry="26" fill="none" stroke="#7ad9ee" stroke-width="1.5"/><circle cx="62" cy="50" r="7" fill="#f4c84a"/><path d="M62 50L84 33L92 50Z" fill="#38c3e2" opacity=".35"/><path d="M62 50L20 70L12 52Z" fill="#38c3e2" opacity=".35"/><circle cx="84" cy="33" r="3.5" fill="#38c3e2"/></svg></div><div class="t"><b>Симуляциялар</b><span>${L.MODELS.length} интерактивті модель және Python коды</span></div></a>
  <a class="tile" href="#games"><div class="pic">${gameIcon(GM[0])}</div><div class="t"><b>Ойындар</b><span>${GM.length} визуалды ойын: орбита, нысана, шоқжұлдыз, астероид</span></div></a>
  <a class="tile" href="#tests"><div class="pic"><svg viewBox="0 0 100 100"><rect x="22" y="16" width="56" height="70" rx="6" fill="#12364a" stroke="#38c3e2"/>${[30, 44, 58, 72].map((y, i) => `<circle cx="34" cy="${y}" r="4" fill="${i === 1 ? '#5fd39a' : '#1f4a5e'}"/><rect x="44" y="${y - 2}" width="26" height="4" rx="2" fill="#7ad9ee" opacity=".6"/>`).join('')}</svg></div><div class="t"><b>Тесттер</b><span>Әр тақырыпқа 10 сұрақ, қорытынды тест</span></div></a>
  <a class="tile" href="#profile"><div class="pic"><svg viewBox="0 0 100 100"><circle cx="50" cy="38" r="15" fill="#38c3e2"/><path d="M22 84c4-18 16-26 28-26s24 8 28 26z" fill="#12364a" stroke="#38c3e2"/><path d="M74 20l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#f4c84a"/></svg></div><div class="t"><b>Менің кабинетім</b><span>XP, атақ, бейдж, тапсырмалар, мұғалімге нәтиже коды</span></div></a>
  <a class="tile" href="#ai"><div class="pic"><svg viewBox="0 0 100 100"><rect x="16" y="24" width="56" height="38" rx="10" fill="#12364a" stroke="#38c3e2"/><path d="M30 62l-6 12 16-12" fill="#12364a" stroke="#38c3e2"/><rect x="44" y="44" width="42" height="28" rx="9" fill="#18394a" stroke="#7ad9ee"/><circle cx="34" cy="43" r="3" fill="#7ad9ee"/><circle cx="44" cy="43" r="3" fill="#7ad9ee"/><circle cx="54" cy="43" r="3" fill="#7ad9ee"/><path d="M78 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#f4c84a"/></svg></div><div class="t"><b>ЖИ-көмекші</b><span>Тақырыпты түсіндіреді, мысал мен есеп ұсынады</span></div></a>
  <a class="tile" href="#bot"><div class="pic"><img src="img/l01-cover.jpg" alt="Астрономия ботының мұқабасы"></div><div class="t"><b>Telegram-бот</b><span>Демо-нұсқа, мүмкіндіктер, код</span></div></a>
  <a class="tile" href="#comics"><div class="pic"><img src="img/comic-l14.jpg" alt="Параллакс туралы комикс"></div><div class="t"><b>ЖИ және комикстер</b><span>Галерея және комикс жасау жолы</span></div></a>
</div></div></section>
<section class="band"><div class="wrap intro">
  <div><h2>Қалай қолданамыз</h2>
  <div class="task"><h3>Оқушыға</h3>${ticks(['<a href="#profile">Менің кабинетім</a> бетінде атыңды жазып, <a href="#diag-pre">бастапқы диагностиканы</a> тапсыр', 'Сабақты оқы, симуляциямен тәжірибе жаса, тестті А, В немесе С деңгейінде тапсыр', 'Ойын ойна, апта сынағын орында, XP жинап, атақ пен бейдж ал'])}</div>
  <div class="task"><h3>Мұғалімге</h3>${ticks(['<a href="#plan">КТП</a> бойынша сабақты таңдап, симуляция мен ойынды проектор арқылы көрсету', '<a href="#teacher">Мұғалім кабинетінде</a> сынып журналы, тапсырма мен мерзім, өз сұрақтарыңыз, Excel экспорт, апробация', 'Толық сипаттама – <a href="#guide">Нұсқаулық</a> бетінде'])}</div></div>
  <div><h2>Бағдарлама құрылымы</h2><p class="muted">Әр сабақ 2 сағат: 1 сағат теория, 1 сағат практика.</p>
  <div class="mods" style="grid-template-columns:repeat(2,minmax(0,1fr))">${S.modules.map((m, i) => `<a href="#lesson-${m.lessons[0]}" style="${i % 2 ? 'border-right:0' : ''};${i < 2 ? 'border-bottom:1px solid var(--line)' : ''}"><div class="h">${m.hours}<small>сағат</small></div><div class="small muted" style="margin-top:10px">${m.n}</div><b>${m.name}</b></a>`).join('')}</div></div>
</div></section>`;

P.plan = () => {
  const rows = S.modules.map(m => `<tr class="mod"><td colspan="7">${m.n}. ${m.name} (${m.hours} сағ) – ${m.part}</td></tr>` + m.lessons.map(n => { const l = byN(n); return `<tr><td class="n" data-l="№">${n}</td><td data-l="Тақырып"><a href="#lesson-${n}">${l.code.includes('.') ? l.code + '. ' : ''}${l.title}</a></td><td data-l="Оқу мақсаты" class="small">${l.obj.length ? l.obj.map(o => o.split(' – ')[0]).join(', ') : (l.project ? 'Жоба қорғау' : 'Кіріспе')}</td><td class="n" data-l="Сағат">2</td><td class="n" data-l="Т / П">1 / 1</td><td class="n" data-l="Апта">${2 * n - 1}–${2 * n}</td><td data-l="Сайттағы ресурстар" class="small">${simsFor(n).map(m => `<a href="#lab-${m.id}">${m.t}</a>`).concat(gamesFor(n).map(g => `<a href="#game-${g.id}">${g.t}</a>`), [`<a href="#test-${n}">Тест (10)</a>`]).join(', ')}</td></tr>`; }).join('')).join('');
  return banner('Күнтізбелік-тақырыптық жоспар (КТП)', '9-сынып. Аптасына 1 сағат, барлығы 34 сағат: 17 сағат теория, 17 сағат практика. Әр тақырыпқа сайттағы симуляция, ойын және тест сілтемелері берілген.', '<a href="#home">Басты бет</a> / КТП') + `
<section class="band"><div class="wrap"><div class="row" style="justify-content:space-between;margin-bottom:12px"><span class="muted small">Апта – аптасына 1 сағаттық жүктеме бойынша реттік нөмірі.</span><div class="row"><button class="btn" type="button" id="ktp-xl">Excel-ге жүктеу</button><button class="btn ghost" type="button" id="ktp-copy">Кестені көшіру (Excel/Word)</button></div></div>
<div class="scroll"><table class="stack" id="ktp"><thead><tr><th class="n">№</th><th>Тақырып</th><th>Оқу мақсаты</th><th class="n">Сағат</th><th class="n">Т / П</th><th class="n">Апта</th><th>Сайттағы ресурстар</th></tr></thead><tbody>${rows}</tbody>
<tfoot><tr><td></td><td>Барлығы</td><td></td><td class="n">34</td><td class="n">17 / 17</td><td class="n">1–34</td><td></td></tr></tfoot></table></div></div></section>`;
};

P.lessons = () => banner('Сабақтар', 'Кіріспе және үш модуль. Әр сабақтың мақсаты, барысы, ресурстары, тапсырмалары және 10 сұрақтық тесті.', '<a href="#home">Басты бет</a> / Сабақтар') +
  S.modules.map((m, i) => `<section class="band${i % 2 ? ' alt' : ''}"><div class="wrap"><div class="muted small">${m.n} · ${m.hours} сағат</div><h2>${m.name}</h2><p class="muted">${m.part}</p>
  <div class="grid g3" style="margin-top:12px">${m.lessons.map(n => { const l = byN(n), r = sc(n); return `<a class="tile" href="#lesson-${n}">${l.img ? `<div class="pic" style="aspect-ratio:16/9"><img src="${l.img}" alt="" loading="lazy"></div>` : ''}<div class="t"><span>${n}-сабақ${l.code.includes('.') ? ' · ' + l.code : ''}${r ? ' · тест: ' + (r.b ?? r.s) + '/' + r.t : ''}</span><b style="margin-top:4px">${l.title}</b></div></a>`; }).join('')}</div></div></section>`).join('');

const stageText = l => {
  const a = x => x ? `<a href="${x.u}" target="_blank" rel="noopener">${x.t.replace(/^.*?: /, '')}</a>` : '';
  if (l.project) return ['Сәлемдесу, бағалау критерийлерімен және шығармашылық топтармен таныстыру.', 'Бейнеролик, топтардың жоба қорғауы, «2+1» кері байланыс.', '', 'Үздік жобаларды марапаттау, ұжымдық фото не бейнеролик.'];
  return ['Амандасу, түгелдеу, «Смайлик» әдісімен ахуал орнату.' + (l.start ? ' Үй тапсырмасын тексеру: ' + a(l.start) + '.' : ''), 'Жаңа сабақ (бейнеролик), симуляциямен зерттеу, ЖИ комиксіндегі тапсырма, топтық және жұптық жұмыс.', '«Оң қол, сол қол» нейрожаттығуы: оң қолмен сол құлақты, сол қолмен мұрынның ұшын ұстап, алақанды соғып, қолдарды ауыстыру (8–10 рет).', (l.end ? 'Бекіту: ' + a(l.end) + ' немесе сайттағы тест. ' : 'Бекіту: сайттағы тест. ') + 'Рефлексия, бағалау, үй тапсырмасы.'];
};
const taskCard = t => `<div class="task"><h3>${t.h}${t.pts ? `<small>${t.pts}</small>` : ''}</h3>${t.p ? `<p>${t.p}</p>` : ''}${t.list ? `<ul>${t.list.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}${t.ol ? `<ol>${t.ol.map(x => `<li>${x}</li>`).join('')}</ol>` : ''}${t.ans ? `<details><summary>Жауаптар</summary><p style="margin:6px 0 0">${t.ans}</p></details>` : ''}</div>`;

P.lesson = n => {
  const l = byN(n); if (!l) return P.home();
  const m = modOf(l), fl = l.flow, st = stageText(l), names = ['Сабақтың басы', 'Сабақтың ортасы', 'Сергіту', 'Сабақтың соңы'];
  const resources = [l.start && res(l.start.t, l.start.u, 'Сабақтың басы')].concat(l.video.map(v => res(v.t, v.u)), l.sims.filter(s => s.u[0] !== '#').map(s => res(s.t, s.u)), [l.end && res(l.end.t, l.end.u, 'Сабақтың соңы')], (n === 1 || n === 2) ? [res('ChatGPT – иллюстрация мен сценарий', 'https://chatgpt.com/'), res('Gamma – анимациялық комикс', 'https://gamma.app/ru')] : []).filter(Boolean);
  const own = simsFor(n).map(s => res(s.t, '#lab-' + s.id)).concat(gamesFor(n).map(g => res(g.t, '#game-' + g.id)), [res('Тақырып бойынша тест (10 сұрақ)', '#test-' + n, 'Тест')]);
  return banner(`${l.code.includes('.') ? l.code + '. ' : ''}${l.title}`, '', `<a href="#lessons">Сабақтар</a> / ${m.n}: ${m.name}`).replace('</h1>', `</h1><div class="chips"><span class="chip">${n}-сабақ</span><span class="chip">9-сынып</span><span class="chip">2 сағат: 1 теория, 1 практика</span>${l.obj.map(o => `<span class="chip">${o.split(' – ')[0]}</span>`).join('')}</div>`) + `
<section class="band"><div class="wrap lesson"><div>
  <div class="sec"><h2>Сабақтың мақсаты ${PF.spk(l.title + '. ' + l.goals.join('. '))}</h2>${ticks(l.goals)}${l.obj.length ? `<p class="small muted" style="margin-top:-4px">Оқу бағдарламасына сәйкес оқыту мақсаттары:</p><ul class="small" style="margin-top:0">${l.obj.map(o => `<li>${o}</li>`).join('')}</ul>` : ''}</div>
  <div class="sec"><h2>Сабақ барысы</h2><div class="flow">${fl.map((t, i) => t ? `<div><b>${t} мин</b><span>${names[i]}</span></div>` : '').join('')}</div>
  <div style="margin-top:12px">${fl.map((t, i) => t && st[i] ? `<p><b>${names[i]}.</b> ${st[i]}</p>` : '').join('')}</div></div>
  <div class="sec"><h2>Тапсырмалар</h2>${l.tasks.map(taskCard).join('')}${l.criteria ? `<div class="task"><h3>Бағалау критерийлері</h3>${critTable()}</div>` : ''}</div>
  ${l.fl ? `<div class="sec">${taskCard({ h: l.fl.h, p: l.fl.p, ol: l.fl.ol, ans: l.fl.ans })}</div>` : ''}
  <div class="sec grid g2">
    <div class="task" style="margin:0"><h3>Рефлексия: ${l.reflect.h}</h3><p>${l.reflect.p}</p>${l.reflect.img ? `<img class="comic" src="${l.reflect.img}" alt="Рефлексия парағы" data-zoom style="max-width:260px">` : ''}</div>
    <div class="task" style="margin:0"><h3>Үй тапсырмасы</h3><p>${l.home}</p>${l.homeImg ? `<img class="comic" src="${l.homeImg}" alt="Бұрыш өлшейтін қарапайым құралдар" data-zoom style="max-width:300px">` : ''}</div>
  </div>
  <div class="card quiz" id="runner" data-test="${n}"></div>
  <div class="pager">${n > 1 ? `<a class="btn ghost" href="#lesson-${n - 1}">← ${n - 1}-сабақ</a>` : '<span></span>'}${n < 17 ? `<a class="btn" href="#lesson-${n + 1}">${n + 1}-сабақ →</a>` : `<a class="btn" href="#test-final">Қорытынды тест →</a>`}</div>
</div>
<aside class="side">
  <div class="card res"><h3>Сайттағы ресурстар</h3>${own.join('')}${GEN.has(n) ? res('Есеп генераторы', '#problems-' + n, 'Есептер') : ''}${res('ЖИ-көмекшіден сұрау', '#ai-' + n, 'ЖИ-көмекші')}</div>
  <div class="card res"><h3>Сыртқы ресурстар</h3>${resources.join('') || '<p class="small muted">Бұл сабақ топтық жұмысқа негізделген.</p>'}</div>
  ${(l.comics || []).length ? `<div class="card"><h3>ЖИ комиксі</h3><div class="grid" style="gap:10px">${l.comics.map(c => `<img class="comic" src="${c}" alt="Сабақ тақырыбына ЖИ көмегімен жасалған комикс" data-zoom loading="lazy">`).join('')}</div><p class="small muted" style="margin:8px 0 0">Үлкейту үшін басыңыз.</p></div>` : ''}
</aside></div></section>`;
};

P.lab = () => banner('Симуляциялар', `Астрономия мен физика заңдарының ${L.MODELS.length} интерактивті моделі. Әр модельде Google Colab-та іске қосуға болатын Python коды бар.`, '<a href="#home">Басты бет</a> / Симуляциялар') +
  [1, 2, 3].map((g, i) => `<section class="band${i % 2 ? ' alt' : ''}"><div class="wrap"><div class="muted small">${S.modules[g].n}</div><h2>${S.modules[g].name}</h2><div class="grid g3" style="margin-top:12px">${L.MODELS.filter(m => m.g === g).map(m => `<a class="card" href="#lab-${m.id}" style="text-decoration:none;color:var(--ink);display:block"><h3>${m.t}</h3><p class="small muted" style="margin:0 0 8px">${m.d}</p><span class="small" style="color:var(--sky2)">${m.l.map(n => n + '-сабақ').join(', ')} →</span></a>`).join('')}</div></div></section>`).join('') +
  `<section class="band"><div class="wrap"><p class="small muted">Python кодын іске қосу: <a href="https://colab.research.google.com/" target="_blank" rel="noopener">colab.research.google.com</a> → жаңа блокнот → кодты қойып, «Іске қосу». Сондай-ақ <a href="#bot">Telegram-бот</a> және <a href="#comics">ЖИ комикстері</a>.</p></div></section>`;
P.model = id => {
  const k = L.MODELS.findIndex(m => m.id === id), m = L.MODELS[k]; if (!m) return P.lab();
  const pr = L.MODELS[k - 1], nx = L.MODELS[k + 1];
  return banner(m.t, m.d, `<a href="#lab">Симуляциялар</a> / ${m.l.map(n => `<a href="#lesson-${n}">${n}-сабақ</a>`).join(', ')}`) + `<section class="band"><div class="wrap"><div data-model="${m.id}"></div>
  <div class="pager" style="margin-top:24px">${pr ? `<a class="btn ghost" href="#lab-${pr.id}">← ${pr.t}</a>` : '<span></span>'}${nx ? `<a class="btn" href="#lab-${nx.id}">${nx.t} →</a>` : `<a class="btn" href="#games">Ойындар →</a>`}</div></div></section>`;
};

P.games = () => banner('Ойындар', 'Астрономия заңдарын ойнап үйрен: орбитаға серік шығар, нысанаға ат, шоқжұлдыз құрастыр, астероидтарды тоқтат. Үздік нәтижелер сақталады.', '<a href="#home">Басты бет</a> / Ойындар') + `
<section class="band"><div class="wrap"><div class="grid g3">${GM.map(g => { const b = (load().games || {})[g.id]; return `<a class="tile" href="#game-${g.id}"><div class="pic">${gameIcon(g)}</div><div class="t"><b>${g.t}</b><span>${g.d}</span><span style="display:block;margin-top:6px;color:var(--sky2)">${g.l.map(n => n + '-сабақ').join(', ')}${b != null ? ' · үздік: ' + b : ''}</span></div></a>`; }).join('')}</div></div></section>
<section class="band alt" id="ext"><div class="wrap"><h2>Сыртқы платформалардағы ойындар</h2><p class="muted">Wordwall, Educaplay, Wayground ойындары, симуляциялар мен бейнероликтер – жаңа бетте ашылады.</p><div class="scroll"><table class="stack"><thead><tr><th>Сабақ</th><th>Сабақ басында</th><th>Бекіту</th><th>Бейне және симуляциялар</th></tr></thead><tbody>
${S.lessons.map(l => { const a = x => x ? `<a href="${x.u}" target="_blank" rel="noopener">${x.t.replace(/^.*?: /, '')}</a>` : '–'; const ex = l.video.concat(l.sims.filter(s => s.u[0] !== '#')); return `<tr><td data-l="Сабақ"><a href="#lesson-${l.n}"><b>${l.n}.</b> ${l.title}</a></td><td data-l="Басында">${a(l.start)}</td><td data-l="Бекіту">${a(l.end)}</td><td data-l="Ресурстар">${ex.map((v, i) => `<a href="${v.u}" target="_blank" rel="noopener">${/youtu/.test(v.u) ? 'Бейне' : /phet/.test(v.u) ? 'PhET' : 'Симуляция'}${ex.length > 1 ? ' ' + (i + 1) : ''}</a>`).join(', ') || '–'}</td></tr>`; }).join('')}
</tbody></table></div></div></section>`;
P.game = id => {
  const k = GM.findIndex(g => g.id === id), g = GM[k]; if (!g) return P.games();
  const nx = GM[(k + 1) % GM.length];
  return banner(g.t, g.d, `<a href="#games">Ойындар</a> / ${g.l.map(n => `<a href="#lesson-${n}">${n}-сабақ</a>`).join(', ')}`) + `<section class="band"><div class="wrap"><div data-game="${g.id}"></div><div class="pager" style="margin-top:24px"><a class="btn ghost" href="#games">← Барлық ойындар</a><a class="btn" href="#game-${nx.id}">${nx.t} →</a></div></div></section>`;
};

P.tests = () => banner('Тесттер', `Әр тақырып бойынша 10 сұрақ, барлығы ${totalQ} сұрақ. Әр жауаптан кейін түсініктеме шығады, соңында қателерді қарауға болады.`, '<a href="#home">Басты бет</a> / Тесттер') + `
<section class="band"><div class="wrap"><a class="card" href="#test-final" style="display:flex;justify-content:space-between;align-items:center;gap:16px;text-decoration:none;color:var(--ink);margin-bottom:22px;border-color:var(--sky)"><div><h3 style="margin:0 0 4px">Қорытынды тест</h3><span class="small muted">Барлық тақырыптан кездейсоқ 20 сұрақ</span></div><b style="font-family:Unbounded,sans-serif;color:var(--sky)">${sc('final') ? (sc('final').b ?? sc('final').s) + ' / 20' : 'Бастау →'}</b></a>
<div class="grid g4" style="margin-bottom:22px">${[['Апта сынағы', 'Әр аптада жаңа 6 сұрақ және 2 есеп', '#weekly'], ['Есеп генераторы', 'Сандары өзгеретін есептер', '#problems'], ['Бастапқы диагностика', 'Курс басында, 20 сұрақ', '#diag-pre'], ['Қорытынды диагностика', 'Курс соңында, 20 сұрақ', '#diag-post']].map(([t, d, h]) => `<a class="card" href="${h}" style="text-decoration:none;color:var(--ink);display:block"><h3 style="margin:0 0 4px">${t}</h3><span class="small muted">${d}</span></a>`).join('')}</div>
<p class="small muted">Әр тақырыптық тест үш деңгейде: А – ұғымдық 6 сұрақ, В – толық тест, С – тест және есептер. «Қателермен жұмыс» тек қате жауап берген сұрақтарды қайталатады.</p>
${S.modules.map(m => `<h2 style="font-size:20px;margin-top:10px">${m.n}: ${m.name}</h2><div class="grid g3" style="margin:10px 0 20px">${m.lessons.map(n => { const l = byN(n), r = sc(n), p = r ? Math.round((r.b ?? r.s) / r.t * 100) : 0; return `<a class="card" href="#test-${n}" style="text-decoration:none;color:var(--ink);display:block"><span class="small muted">${n}-тақырып · 10 сұрақ</span><h3 style="margin:4px 0 10px">${l.title}</h3><div class="row" style="flex-wrap:nowrap"><div class="meter"><i style="width:${p}%;background:${p >= 70 ? 'var(--ok)' : 'var(--sky)'}"></i></div><span class="small" style="white-space:nowrap">${r ? (r.b ?? r.s) + ' / ' + r.t : 'тапсырылмаған'}</span></div></a>`; }).join('')}</div>`).join('')}
</div></section>`;
P.test = id => {
  const l = id === 'final' ? null : byN(+id);
  return banner(l ? `${l.n}-тақырып бойынша тест` : 'Қорытынды тест', l ? l.title : 'Барлық тақырыптан кездейсоқ 20 сұрақ. Әр жолы жаңа сұрақтар.', `<a href="#tests">Тесттер</a>${l ? ` / <a href="#lesson-${l.n}">${l.n}-сабақ</a>` : ''}`) + `<section class="band"><div class="wrap" style="max-width:880px">${l ? `<div class="chips" id="lvl" style="margin-bottom:14px"></div>` : ''}<div class="card quiz" id="runner"></div><div id="probs" style="margin-top:18px"></div><div class="pager" style="margin-top:20px"><a class="btn ghost" href="#tests">← Барлық тесттер</a>${l && l.n < 17 ? `<a class="btn" href="#test-${l.n + 1}">${l.n + 1}-тақырып →</a>` : '<a class="btn" href="#games">Ойындар →</a>'}</div></div></section>`;
};
function testInit(id) {
  const el = document.getElementById('runner');
  if (id === 'final') { const all = Object.entries(QB).flatMap(([n, qs]) => qs.map((q, i) => [q[0], q[1], q[2], q[3], { n: +n, i }])); return runner(el, { title: 'Қорытынды тест', qs: shuffle(all).slice(0, 20), store: storeTopic('final') }); }
  const n = +id, box = document.getElementById('lvl'), probs = document.getElementById('probs');
  let lvl; try { lvl = sessionStorage.getItem('lvl_' + n) || 'B'; } catch (e) { lvl = 'B'; }
  const go = v => {
    lvl = v; try { sessionStorage.setItem('lvl_' + n, v); } catch (e) { }
    const wn = (load().wrong?.[n] || []).length, names = { A: 'А – базалық (' + testSet(n, 'A').length + ')', B: 'В – толық (' + testSet(n, 'B').length + ')', C: GEN.has(n) ? 'С – тест + есептер' : null, W: 'Қателермен жұмыс (' + wn + ')' };
    box.innerHTML = Object.entries(names).filter(x => x[1]).map(([k, t]) => `<button type="button" class="chip ${k === lvl ? 'act' : ''}" data-l="${k}" style="cursor:pointer">${t}</button>`).join('');
    box.querySelectorAll('[data-l]').forEach(b => b.onclick = () => go(b.dataset.l));
    const title = { A: 'А деңгейі: ұғымдар', B: 'В деңгейі: толық тест', C: 'С деңгейі: тест және есептер', W: 'Қателермен жұмыс' }[lvl];
    runner(el, { title: `${n}-тақырып. ${title}`, topic: n, qs: testSet(n, lvl === 'C' ? 'B' : lvl), empty: 'Бұл тақырыпта қате жауап сақталмаған. Алдымен В деңгейін тапсыр.', store: lvl === 'A' ? (d, s, t) => { d.scoresA = d.scoresA || {}; d.scoresA[n] = { s, t, ts: Date.now() }; return ''; } : lvl === 'W' ? null : storeTopic(n), onLevel: go });
    probs.innerHTML = ''; if (lvl === 'C') { probs.innerHTML = '<h2 style="font-size:20px">Есептер</h2><div id="pb"></div>'; problemsBlock(document.getElementById('pb'), n, 3); }
  };
  go(lvl);
}
P.diag = kind => banner(kind === 'pre' ? 'Бастапқы диагностика' : 'Қорытынды диагностика', 'Курс бойынша 20 сұрақ. Бастапқы диагностика курс басында, қорытынды диагностика курс соңында тапсырылады: екеуін салыстырып, оқу нәтижесінің өсімі анықталады.', '<a href="#tests">Тесттер</a> / Диагностика') + `<section class="band"><div class="wrap" style="max-width:880px"><div id="dcmp"></div><div class="card quiz" id="runner"></div></div></section>`;
function diagInit(kind) {
  const d = load(), cmp = document.getElementById('dcmp');
  if (d.pre || d.post) cmp.innerHTML = `<div class="out" style="margin-bottom:16px"><div><small>Бастапқы</small><b>${d.pre ? Math.round(d.pre.s / d.pre.t * 100) + '%' : '—'}</b></div><div><small>Қорытынды</small><b>${d.post ? Math.round(d.post.s / d.post.t * 100) + '%' : '—'}</b></div></div>`;
  const qs = PF.DIAG.map(([n, i]) => { const q = QB[n][i]; return [q[0], q[1], q[2], q[3], { n, i }]; });
  runner(document.getElementById('runner'), { title: kind === 'pre' ? 'Бастапқы диагностика' : 'Қорытынды диагностика', qs, shuffle: true, store: (dd, s, t) => { dd[kind] = { s, t, ts: Date.now() }; return ''; } });
}
P.weekly = () => { const w = PF.weekId(); return banner('Апта сынағы', `${w.replace('-W', ' жыл, ')}-апта. Әр аптада жаңа 6 сұрақ және 2 есеп. 70% және одан жоғары нәтиже +50 XP береді.`, '<a href="#tests">Тесттер</a> / Апта сынағы') + `<section class="band"><div class="wrap" style="max-width:880px"><div class="out" id="wkst" style="margin-bottom:16px"></div><div class="card quiz" id="runner"></div><h2 style="font-size:20px;margin-top:22px">Апта есептері</h2><div id="pb"></div></div></section>`; };
function weeklyInit() {
  const wid = PF.weekId(), seed = [...wid].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483647 || 1;
  let s = seed; const rnd = () => (s = s * 16807 % 2147483647) / 2147483647;
  const tops = [1, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 16].sort(() => rnd() - 0.5).slice(0, 6);
  const qs = tops.map(n => { const i = Math.floor(rnd() * QB[n].length), q = QB[n][i]; return [q[0], q[1], q[2], q[3], { n, i }]; });
  const status = () => { const w = load().weeks?.[wid] || { q: 0, p: 0 }, pc = Math.round((w.q + w.p) / 8 * 100); document.getElementById('wkst').innerHTML = `<div><small>Сұрақтар</small><b>${w.q} / 6</b></div><div><small>Есептер</small><b>${w.p} / 2</b></div><div><small>Нәтиже</small><b style="color:${pc >= 70 ? 'var(--ok)' : 'inherit'}">${pc}%${pc >= 70 ? ' · +50 XP' : ''}</b></div>`; };
  runner(document.getElementById('runner'), { title: 'Апта сұрақтары', qs, store: (d, sc) => { d.weeks = d.weeks || {}; const w = d.weeks[wid] || { q: 0, p: 0 }; w.q = Math.max(w.q, sc); d.weeks[wid] = w; setTimeout(status, 0); return ''; } });
  const el = document.getElementById('pb');
  problemsBlock(el, 'mix', 2, () => { const d = load(); d.weeks = d.weeks || {}; const w = d.weeks[wid] || { q: 0, p: 0 }; w.p = Math.min(2, w.p + 1); d.weeks[wid] = w; save(d); status(); });
  status();
}
P.problems = n => { const l = n ? byN(+n) : null; return banner('Есеп генераторы', 'Әр жолы сандары өзгеретін есептер: жауапты енгіз, тексер, шешімін қара. Әр дұрыс шығарылған есеп +15 XP.', '<a href="#tests">Тесттер</a> / Есептер') + `<section class="band"><div class="wrap" style="max-width:880px"><div class="chips" id="ptop" style="margin-bottom:16px">${['mix'].concat(GEN.topics).map(t => `<a class="chip ${String(t) === String(n || 'mix') ? 'act' : ''}" href="#problems${t === 'mix' ? '' : '-' + t}">${t === 'mix' ? 'Аралас' : t + '. ' + byN(t).title.split('.')[0].slice(0, 34)}</a>`).join('')}</div><div id="pb"></div><p class="small muted">Үлкен сандарды 2,4e-5 түрінде, уақытты 14:30 түрінде жазуға болады. Жауап 2%-ға дейінгі дәлдікпен қабылданады.</p></div></section>`; };

/* ---------- оқушы кабинеті ---------- */
P.profile = () => banner('Менің кабинетім', 'Профиль, XP мен атақтар, тапсырмалар, ұсыныстар және мұғалімге жіберілетін нәтиже коды.', '<a href="#home">Басты бет</a> / Кабинет') + `<section class="band"><div class="wrap" id="prof"><p class="muted">Жүктелуде…</p></div></section>`;
const asgLink = a => ({ test: '#test-', problems: '#problems-', lesson: '#lesson-', lab: '#lab-', game: '#game-' }[a.kind] ? { test: '#test-', problems: '#problems-', lesson: '#lesson-', lab: '#lab-', game: '#game-' }[a.kind] + a.ref : a.kind === 'weekly' ? '#weekly' : '#diag-' + a.kind);
function asgStatus(a, d) {
  const after = t => t && t >= (a.created || 0);
  switch (a.kind) {
    case 'test': { const r = d.scores?.[a.ref]; return after(r?.ts) ? PF.best(r) + '/' + r.t : null; }
    case 'problems': return after(d.problems?.ts?.[a.ref]) ? 'орындалды' : null;
    case 'lesson': return after(d.lessonTs?.[a.ref]) ? 'ашылды' : null;
    case 'lab': return after(d.simTs?.[a.ref]) ? 'ашылды' : null;
    case 'game': return after(d.gameTs?.[a.ref]) ? 'ойналды' : null;
    case 'weekly': { const w = d.weeks?.[PF.weekId()]; return w ? Math.round((w.q + w.p) / 8 * 100) + '%' : null; }
    default: { const r = d[a.kind]; return r && after(r.ts) ? Math.round(r.s / r.t * 100) + '%' : null; }
  }
}
function recs(d) {
  const out = [], sc = d.scores || {};
  if (!d.pre) out.push(['Бастапқы диагностиканы тапсыр', '#diag-pre']);
  S.lessons.forEach(l => { const r = sc[l.n]; if (r && PF.best(r) / r.t < 0.7) out.push([`Қайтала: ${l.n}-тақырып (${PF.best(r)}/${r.t})`, '#test-' + l.n]); });
  Object.entries(d.wrong || {}).forEach(([n, a]) => { if (a.length) out.push([`Қателермен жұмыс: ${n}-тақырып (${a.length} сұрақ)`, '#test-' + n]); });
  const nx = S.lessons.find(l => !sc[l.n]); if (nx) out.push([`Келесі тақырып: ${nx.n}. ${nx.title}`, '#lesson-' + nx.n]);
  if (!d.weeks?.[PF.weekId()]) out.push(['Осы аптаның сынағы', '#weekly']);
  if ((d.problems?.solved || 0) < 10) out.push(['Есеп генераторымен жаттық', '#problems']);
  return out.slice(0, 6);
}
async function profileInit() {
  const el = document.getElementById('prof'); await PF.readyP;
  const d = load(), sh = PF.st.shared || { classes: [], assignments: [] }, xp = PF.xpOf(d), lv = PF.level(xp), bd = PF.badgesOf(d), esc = PF.esc;
  const mine = sh.assignments.filter(a => !a.cls || a.cls === d.cls).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
  const today = new Date(Date.now() + 5 * 36e5).toISOString().slice(0, 10), clsNames = sh.classes.map(c => c.name);
  const syncTxt = { synced: 'Нәтижелерің мұғалімнің журналына автоматты түсіп тұр.', ready: 'Келісім берілсе, нәтижелер мұғалімге автоматты жіберіледі.', local: 'Нәтижелер осы браузерде сақталады. Мұғалімге төмендегі кодпен жібер.' }[PF.st.syncState];
  const s = d.scores || {}, g = d.games || {}, gl = { orbit: ' / 4 миссия', target: ' ұпай', constellation: ' с', planets: ' ұпай', memory: ' жүріс', asteroids: ' ұпай' };
  el.innerHTML = `<div class="intro">
  <div class="card"><div class="row" style="justify-content:space-between"><span class="small muted">Атақ</span><span class="small muted">${lv.next ? 'Келесі: ' + lv.nextName + ' (' + lv.next + ' XP)' : 'Ең жоғары атақ'}</span></div>
    <div style="font-family:Unbounded,sans-serif;font-size:clamp(24px,4vw,34px);margin:6px 0">${lv.name}</div><div class="row" style="flex-wrap:nowrap"><div class="meter"><i style="width:${lv.next ? Math.round((xp - lv.from) / (lv.next - lv.from) * 100) : 100}%;background:var(--gold)"></i></div><b style="white-space:nowrap">${xp} XP</b></div>
    <h3 style="margin-top:18px">Бейдждер (${bd.filter(b => b.on).length} / ${bd.length})</h3><div class="badges">${bd.map(b => `<div class="bdg ${b.on ? 'on' : ''}" title="${b.desc}"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="18" r="13" fill="${b.on ? '#f4c84a' : '#1f4a5e'}"/><path d="M20 9l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="${b.on ? '#8a5a00' : '#0e2b3a'}"/><path d="M13 29l-3 8 6-2 4 4 0-9M27 29l3 8-6-2-4 4" fill="${b.on ? '#38c3e2' : '#163646'}"/></svg><b>${b.t}</b><span>${b.desc}</span></div>`).join('')}</div></div>
  <div class="card"><h3>Профиль</h3>
    <label class="small muted" for="pn">Аты-жөні (аты және тегінің бас әрпі жеткілікті)</label><input type="text" id="pn" maxlength="40" value="${esc(d.name)}" placeholder="Мысалы: Айгерім С." style="margin:6px 0 12px">
    <label class="small muted" for="pc">Сынып</label>${clsNames.length ? `<select id="pc" style="margin:6px 0 12px"><option value="">— таңда —</option>${clsNames.map(c => `<option ${c === d.cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}<option value="__">Басқа…</option></select>` : ''}<input type="text" id="pco" maxlength="16" value="${esc(d.cls)}" placeholder="Мысалы: 9А" style="margin:6px 0 12px;${clsNames.length && (!d.cls || clsNames.includes(d.cls)) ? 'display:none' : ''}">
    <label class="row small" style="gap:8px;flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" id="pcons" ${d.consent ? 'checked' : ''} style="width:20px;height:20px;flex:none;margin-top:2px"> <span>Атымды және нәтижелерімді мұғаліміме беруге келісемін. <a href="#privacy">Құпиялылық туралы</a></span></label>
    ${PF.st.db ? `<label class="row small" style="gap:8px;margin-top:8px;flex-wrap:nowrap"><input type="checkbox" id="prk" ${d.rank ? 'checked' : ''} style="width:20px;height:20px;flex:none"> Рейтингке лақап атпен қатысамын</label><input type="text" id="pnk" maxlength="24" value="${esc(d.nick)}" placeholder="Лақап ат" style="margin-top:6px">` : ''}
    <div class="row" style="margin-top:12px"><button class="btn" type="button" id="psave">Сақтау</button><span class="small muted" id="pst"></span></div>
    <p class="small muted" style="margin:10px 0 0">${syncTxt}</p></div></div>
  <div class="intro" style="margin-top:20px"><div class="card"><h3>Тапсырмалар ${d.cls ? '(' + esc(d.cls) + ')' : ''}</h3>${mine.length ? mine.map(a => { const st = asgStatus(a, d), late = !st && a.due && a.due < today; return `<a href="${asgLink(a)}" class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:10px 0;text-decoration:none;color:var(--ink);flex-wrap:nowrap;gap:10px"><span><b>${esc(a.title)}</b>${a.note ? `<span class="small muted"> · ${esc(a.note)}</span>` : ''}<br><span class="small" style="color:${late ? 'var(--bad)' : 'var(--mut)'}">${a.due ? 'Мерзімі: ' + esc(a.due) + (late ? ' (өтіп кетті)' : '') : 'Мерзімсіз'}</span></span><b style="white-space:nowrap;color:${st ? 'var(--ok)' : 'var(--gold)'}">${st ? esc(st) : 'орындалмаған'}</b></a>`; }).join('') : `<p class="small muted" style="margin:0">${PF.st.db ? 'Мұғалім әзірге тапсырма бермеген.' : 'Тапсырмалар мұғалім артефакт арқылы бергенде көрінеді.'}</p>`}</div>
  <div class="card"><h3>Саған ұсынылатын қадамдар</h3>${recs(d).map(([t, h]) => `<a href="${h}" class="row" style="border-bottom:1px solid var(--line);padding:9px 0;text-decoration:none;color:var(--ink)">→ ${t}</a>`).join('') || '<p class="small muted">Керемет! Барлығы орындалған.</p>'}</div></div>
  <div class="intro" style="margin-top:20px"><div class="card"><h3>Тақырыптық тесттер</h3>${S.lessons.map(l => { const r = s[l.n], b = r ? PF.best(r) : 0, p = r ? Math.round(b / r.t * 100) : 0; return `<div class="row" style="flex-wrap:nowrap;margin:8px 0;gap:10px"><a href="#test-${l.n}" class="small" style="width:46%;flex:none">${l.n}. ${l.title}</a><div class="meter"><i style="width:${p}%;background:${p >= 70 ? 'var(--ok)' : 'var(--sky)'}"></i></div><span class="small" style="width:3.2em;flex:none;text-align:right">${r ? b + '/' + r.t : '–'}</span></div>`; }).join('')}
    <div class="out" style="margin-top:12px"><div><small>Қорытынды тест</small><b>${s.final ? PF.best(s.final) + ' / 20' : '–'}</b></div><div><small>Диагностика</small><b>${d.pre ? Math.round(d.pre.s / d.pre.t * 100) + '%' : '–'} → ${d.post ? Math.round(d.post.s / d.post.t * 100) + '%' : '–'}</b></div><div><small>Шығарған есеп</small><b>${d.problems?.solved || 0}</b></div></div></div>
  <div><div class="card"><h3>Ойындар</h3>${GM.map(x => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:8px 0"><a href="#game-${x.id}">${x.t}</a><b>${g[x.id] != null ? g[x.id] + gl[x.id] : '–'}</b></div>`).join('')}</div>
  <div class="card" style="margin-top:16px"><h3>Мұғалімге жіберу</h3><p class="small">Кодты көшіріп, мұғаліміңе мессенджер арқылы жібер. Мұғалім оны сынып журналына енгізеді.</p><textarea id="pcode" readonly rows="4" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--ink);font:13px/1.4 ui-monospace,monospace" data-notr></textarea><div class="row" style="margin-top:8px"><button class="btn" type="button" id="pcopy">Кодты көшіру</button><span class="small muted" id="pcs"></span></div></div>
  <div class="card" style="margin-top:16px"><h3>Деректерім</h3><p class="small">Барлық нәтижені осы құрылғыдан ${PF.st.db ? 'және ортақ қордан ' : ''}өшіруге болады.</p><button class="btn ghost" type="button" id="pdel">Деректерімді өшіру</button></div></div></div>`;
  const codeBox = el.querySelector('#pcode');
  const refreshCode = () => { const dd = load(); codeBox.value = dd.name ? PF.encode(PF.summary(dd)) : 'Алдымен аты-жөніңді жазып, «Сақтау» бас.'; };
  refreshCode();
  const pc = el.querySelector('#pc'), pco = el.querySelector('#pco');
  if (pc) pc.onchange = () => { pco.style.display = pc.value === '__' ? '' : 'none'; if (pc.value !== '__') pco.value = pc.value; };
  el.querySelector('#psave').onclick = () => {
    const dd = load(); dd.name = el.querySelector('#pn').value.trim().slice(0, 40); dd.cls = (pc && pc.value && pc.value !== '__' ? pc.value : pco.value).trim().slice(0, 16); dd.consent = el.querySelector('#pcons').checked;
    const rk = el.querySelector('#prk'); if (rk) { dd.rank = rk.checked; dd.nick = el.querySelector('#pnk').value.trim().slice(0, 24); }
    save(dd); PF.sync(); refreshCode(); el.querySelector('#pst').textContent = 'Сақталды';
  };
  el.querySelector('#pcopy').onclick = async () => { try { await navigator.clipboard.writeText(codeBox.value); el.querySelector('#pcs').textContent = 'Көшірілді'; } catch (e) { codeBox.select(); el.querySelector('#pcs').textContent = 'Белгіленді: Ctrl+C'; } };
  let armed = false; el.querySelector('#pdel').onclick = async e => { const b = e.currentTarget; if (!armed) { armed = true; b.textContent = 'Растау үшін тағы басыңыз'; setTimeout(() => { armed = false; b.textContent = 'Деректерімді өшіру'; }, 3000); return; } try { if (PF.st.db && PF.st.uid) { await PF.st.db.doc('students/' + PF.st.uid).delete().catch(() => { }); await PF.st.db.doc('board/' + PF.st.uid).delete().catch(() => { }); } } catch (er) { } try { localStorage.removeItem('astro_bilim_v1'); } catch (er) { } lastRoute = ''; render(); };
}

/* ---------- рейтинг ---------- */
P.rating = () => banner('Рейтинг', 'XP ұпайы бойынша оқушылар рейтингі. Тек лақап ат немесе аты мен тегінің бас әрпі көрсетіледі.', '<a href="#profile">Кабинет</a> / Рейтинг') + `<section class="band"><div class="wrap" style="max-width:860px" id="rat"><p class="muted">Жүктелуде…</p></div></section>`;
async function ratingInit() {
  const el = document.getElementById('rat'); await PF.readyP; let rows = [];
  try { rows = await PF.T.board(); } catch (e) { }
  const d = load(), my = PF.xpOf(d), cls = [...new Set(rows.map(r => r.cls).filter(Boolean))];
  const draw = f => { const list = rows.filter(r => !f || r.cls === f).sort((a, b) => b.xp - a.xp); el.querySelector('#rl').innerHTML = list.length ? list.slice(0, 50).map((r, i) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:10px 0;${r.id === PF.st.uid ? 'background:#38c3e214' : ''}"><span><b style="display:inline-block;width:2em;color:${i < 3 ? 'var(--gold)' : 'var(--mut)'}">${i + 1}</b>${PF.esc(r.nick)} <span class="small muted">${PF.esc(r.cls)}</span></span><b>${r.xp} XP</b></div>`).join('') : '<p class="muted">Рейтинг әзірге бос. Мұғалім журналдан жариялағанда немесе оқушылар рейтингке қатысқанда толады.</p>'; };
  el.innerHTML = `<div class="out" style="margin-bottom:16px"><div><small>Сенің XP</small><b>${my}</b></div><div><small>Атағың</small><b style="white-space:normal;font-size:16px">${PF.level(my).name}</b></div></div>${cls.length ? `<select id="rc" style="width:auto;margin-bottom:12px"><option value="">Барлық сыныптар</option>${cls.map(c => `<option>${PF.esc(c)}</option>`).join('')}</select>` : ''}<div class="card" id="rl"></div>`;
  const rc = el.querySelector('#rc'); if (rc) rc.onchange = () => draw(rc.value); draw('');
}

/* ---------- ЖИ-көмекші ---------- */
P.ai = n => banner('ЖИ-көмекші', 'Курс тақырыптары бойынша сұрақ қой: түсіндіреді, мысал келтіреді, есеп құрастырады. Жауаптарды оқулықпен салыстырып отыр.', '<a href="#profile">Кабинет</a> / ЖИ-көмекші') + `<section class="band"><div class="wrap" style="max-width:900px" id="aiw"><p class="muted">Жүктелуде…</p></div></section>`;
let aiAbort = null;
async function aiInit(n) {
  const el = document.getElementById('aiw'); await PF.readyP;
  if (!PF.st.sample) { el.innerHTML = '<div class="card"><h3>ЖИ-көмекші бұл жерде қолжетімсіз</h3><p style="margin:0">Көмекші сайт claude.ai ішінде ашылып, жүйеге кірген кезде жұмыс істейді. Офлайн нұсқада және кейбір құрылғыларда ол өшірулі болады.</p></div>'; return; }
  let topic = n ? +n : 0, msgs = [];
  el.innerHTML = `<div class="row" style="margin-bottom:12px"><select id="ait" style="width:auto;max-width:100%"><option value="0">Жалпы астрономия</option>${S.lessons.map(l => `<option value="${l.n}" ${l.n === topic ? 'selected' : ''}>${l.n}. ${l.title}</option>`).join('')}</select><button class="btn ghost" type="button" id="aiclr">Жаңа әңгіме</button></div>
  <div class="card" style="padding:0"><div id="ailog" class="chat" style="min-height:320px;max-height:60svh;background:transparent"></div>
  <div class="chips" id="aiq" style="padding:0 14px"></div>
  <form id="aif" class="row" style="padding:14px;flex-wrap:nowrap;gap:8px;border-top:1px solid var(--line)"><textarea id="aiin" rows="2" placeholder="Сұрағыңды жаз…" style="flex:1;min-height:48px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--ink);font:16px/1.4 'Golos Text',sans-serif;resize:vertical"></textarea><button class="btn" type="submit" id="aisend">Жіберу</button></form></div>
  <p class="small muted">Көмекші – Claude жасанды интеллекті. Ол қателесуі мүмкін: маңызды фактілерді оқулықпен тексер. Жеке деректеріңді жазба.</p>`;
  const log = el.querySelector('#ailog'), inp = el.querySelector('#aiin');
  const bubble = (t, who) => { const b = document.createElement('div'); b.className = 'msg ' + who; b.textContent = t; log.appendChild(b); log.scrollTop = log.scrollHeight; return b; };
  const quick = () => { const l = topic ? byN(topic) : null; el.querySelector('#aiq').innerHTML = (l ? ['Осы тақырыпты қарапайым тілмен түсіндірші', 'Тақырып бойынша 3 есеп құрастыр', 'Өмірден мысал келтірші', 'Мені 3 сұрақпен тексерші'] : ['Жұлдыздар неге жыпылықтайды?', 'Ай фазалары қалай пайда болады?', 'Кеплер заңдарын қысқаша түсіндір']).map(q => `<button type="button" class="chip" style="cursor:pointer;margin:10px 0 0">${q}</button>`).join(''); el.querySelectorAll('#aiq .chip').forEach(b => b.onclick = () => send(b.textContent)); };
  const context = () => { const l = topic ? byN(topic) : null; return l ? `\n\nҚазіргі сабақ: ${l.n}. ${l.title}. Мақсаттары: ${l.goals.join('; ')}. Тапсырмалар тақырыптары: ${l.tasks.map(t => t.h).join('; ')}.` : ''; };
  const send = async text => {
    text = String(text || '').trim(); if (!text) return; inp.value = '';
    if (aiAbort) aiAbort.abort(); aiAbort = new AbortController();
    bubble(text, 'u'); msgs.push({ role: 'user', content: text });
    const out = bubble('Ойланып жатыр…', 'b'), btn = el.querySelector('#aisend'); btn.disabled = true;
    const input = msgs.map((m, k) => k === 0 ? { role: 'user', content: PF.AI_RULES + context() + '\n\nОқушының сұрағы: ' + m.content } : m);
    try { const r = await PF.ask(input, ({ text: t }) => { out.textContent = t; log.scrollTop = log.scrollHeight; }, aiAbort.signal); out.textContent = r.text; msgs.push({ role: 'assistant', content: r.text }); }
    catch (e) { out.textContent = e && e.code === 'rate_limited' ? 'Сұраныс тым көп. Бір минуттан кейін қайталап көр.' : e && e.code === 'not_granted' ? 'ЖИ-көмекшіге рұқсат берілмеген.' : 'Жауап алу мүмкін болмады. Кейінірек қайталап көр.'; msgs.pop(); }
    btn.disabled = false;
  };
  el.querySelector('#aif').onsubmit = e => { e.preventDefault(); send(inp.value); };
  inp.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inp.value); } };
  el.querySelector('#ait').onchange = e => { topic = +e.target.value; quick(); };
  el.querySelector('#aiclr').onclick = () => { msgs = []; log.innerHTML = ''; bubble('Сәлем! Мен – Astro_bilim ЖИ-көмекшісімін. Тақырыпты таңдап, сұрағыңды жаз.', 'b'); };
  bubble('Сәлем! Мен – Astro_bilim ЖИ-көмекшісімін. Тақырыпты таңдап, сұрағыңды жаз.', 'b'); quick();
  let preset = null; try { preset = sessionStorage.getItem('ai_preset'); sessionStorage.removeItem('ai_preset'); } catch (e) { }
  if (preset) send(preset);
}

/* ---------- мұғалім кабинеті ---------- */
P.teacher = () => banner('Мұғалім кабинеті', 'Сынып журналы, нәтиже кодтары, тапсырмалар, сыныптар, өз сұрақтарыңыз, апробация, талдау, рейтинг және хабарландыру.', '<a href="#guide">Нұсқаулық</a> / Мұғалім кабинеті') + `<section class="band"><div class="wrap" id="tch"><p class="muted">Жүктелуде…</p></div></section>`;
async function teacherInit() {
  const el = document.getElementById('tch'); await PF.readyP;
  if (PF.st.db && !PF.st.teacher) { el.innerHTML = '<div class="card"><h3>Бұл бөлім мұғалімге арналған</h3><p>Мұғалім кабинеті артефакт иесіне және редакторларына ғана ашылады. Оқушы болсаңыз, <a href="#profile">Менің кабинетім</a> бетіне өтіңіз.</p></div>'; return; }
  window.TEACHER.render(el);
}

/* ---------- нұсқаулық және құпиялылық ---------- */
P.guide = () => banner('Нұсқаулық', 'Мұғалім мен оқушыға арналған қысқа нұсқаулық, офлайн нұсқа және Telegram-бот пакеті.', '<a href="#home">Басты бет</a> / Нұсқаулық') + `
<section class="band"><div class="wrap intro"><div><h2>Мұғалімге</h2>
<div class="task"><h3>1. Оқушылармен бөлісу</h3><p style="margin:0">Сайттың жоғарғы оң жағындағы Share батырмасы арқылы сілтемені оқушыларға жіберіңіз. Сабақтар, симуляциялар, ойындар мен тесттер кез келген оқушыда жұмыс істейді; нәтижелер оның браузерінде сақталады.</p></div>
<div class="task"><h3>2. Нәтижелерді жинау</h3><p style="margin:0">Оқушы «Менің кабинетім» бетінен нәтиже кодын жібереді, сіз оны <a href="#teacher">Мұғалім кабинеті</a> → «Кодтарды енгізу» бөліміне қоясыз. Ұйымыңыз Team немесе Enterprise жоспарында болса және оқушылар Contributor деңгейімен кірсе, нәтижелер журналға өзі түседі.</p></div>
<div class="task"><h3>3. Сынып, тапсырма, мерзім</h3><p style="margin:0">«Сыныптар» бөлімінде сыныптарды қосып, «Тапсырмалар» бөлімінде тест, есеп, сабақ, симуляция, ойын немесе диагностиканы мерзімімен беріңіз. Тапсырманы оқушылар өз кабинетінен көреді (claude.ai-ға кірген кезде).</p></div>
<div class="task"><h3>4. Журнал, Excel, апробация</h3><p style="margin:0">Журналды Excel-ге жүктеңіз. Курс басында «Бастапқы», соңында «Қорытынды диагностика» беріп, «Апробация» бөлімінде орташа өсім мен нормаланған өсімді (g) алыңыз – бұл бағдарлама тиімділігінің дәлелі.</p></div>
<div class="task"><h3>5. Өз сұрақтарыңыз және хабарландыру</h3><p style="margin:0">«Сұрақтар» бөлімінде кез келген тақырыпқа сұрақ қосыңыз: олар тестке және «Астероид жаңбыры» ойынына кіреді. «Хабарландыру» мәтіні сайттың жоғарғы жолағында шығады.</p></div></div>
<div><h2>Оқушыға</h2>
<div class="task"><h3>Бастау</h3><p style="margin:0"><a href="#profile">Менің кабинетім</a> бетінде атың мен сыныбыңды жазып, «Сақтау» бас. Сосын <a href="#diag-pre">бастапқы диагностиканы</a> тапсыр.</p></div>
<div class="task"><h3>Әр сабақта</h3><p style="margin:0">Сабақты оқы → симуляцияны аш → тестті тапсыр (А, В, С деңгейі) → қатесі бар сұрақтарды «Қателермен жұмыс» арқылы қайтала → ойын ойна. Түсініксіз жерді <a href="#ai">ЖИ-көмекшіден</a> сұра.</p></div>
<div class="task"><h3>Қолжетімділік</h3><p style="margin:0">Жоғарыдағы «Aa» батырмасы: үлкен шрифт, жоғары контраст, оқуға ыңғайлы аралық, анимацияны өшіру. Тесттегі динамик белгісі сұрақты дауыстап оқиды (қолжетімді болса). Тілді ҚАЗ / РУС / ENG ауыстыруға болады – аударманы ЖИ жасайды.</p></div>
<h2 style="margin-top:22px">Офлайн нұсқа және өз сайтыңыз</h2>
<div class="task"><h3>Бір файлдық нұсқа</h3><p>Сайтты барлық суреттерімен бірге бір HTML файлына жинап жүктеңіз. Файл интернетсіз ашылады; оны мектеп компьютерлеріне көшіруге немесе кез келген хостингке (GitHub Pages, Netlify, мектеп сервері) салып, өз доменіңізге қосуға болады. Офлайн нұсқада ЖИ, ортақ журнал мен рейтинг жұмыс істемейді.</p><button class="btn" type="button" id="dloff">Офлайн нұсқаны жүктеу</button> <span class="small muted" id="dlst"></span></div>
<div class="task"><h3>Telegram-бот пакеті</h3><p style="margin:0">Боттың толық Python коды мен сайттағы барлық тест сұрақтары <a href="#bot">Telegram-бот</a> бетінде бір .zip файлмен жүктеледі.</p></div></div></div></section>`;
P.privacy = () => banner('Құпиялылық және келісім', 'Сайт қандай деректерді сақтайды, оларды кім көреді және қалай өшіруге болады.', '<a href="#guide">Нұсқаулық</a> / Құпиялылық') + `
<section class="band"><div class="wrap" style="max-width:860px">
<div class="task"><h3>Қандай деректер сақталады</h3><ul><li>Оқушы өзі жазған аты (аты мен тегінің бас әрпі жеткілікті) және сыныбы.</li><li>Тест, ойын, есеп нәтижелері, XP, қате жіберілген сұрақтардың нөмірлері.</li><li>Қолжетімділік және тіл баптаулары.</li></ul><p style="margin:0">Туған күн, телефон, мекенжай, сурет сияқты деректер сұралмайды. ЖИ-көмекшіге жеке деректер жазбаңыз.</p></div>
<div class="task"><h3>Қайда және кім көреді</h3><ul><li>Әдепкі бойынша барлық дерек тек оқушының өз браузерінде (localStorage) сақталады.</li><li>Оқушы нәтиже кодын өзі мұғалімге жіберсе ғана, ол мұғалімнің журналына түседі.</li><li>Ұйым ішінде автоматты синхрондау оқушы келісім белгісін қойғанда ғана жұмыс істейді; журналды тек артефакт иесі мен редакторлары көреді.</li><li>Рейтингте тек лақап ат немесе аты мен тегінің бас әрпі және XP көрсетіледі.</li></ul></div>
<div class="task"><h3>Кәмелетке толмағандардың деректері</h3><p style="margin:0">Қазақстан Республикасының «Дербес деректер және оларды қорғау туралы» Заңына сәйкес 18 жасқа толмаған оқушының дербес деректерін өңдеуге ата-анасының (заңды өкілінің) келісімі қажет. Мұғалім сайтты сыныпта қолданар алдында ата-аналардан жазбаша келісім алуы және оқушыларға толық аты-жөнін емес, аты мен тегінің бас әрпін жазуды ұсынуы керек.</p></div>
<div class="task"><h3>Өшіру</h3><p style="margin:0">Оқушы <a href="#profile">Менің кабинетім</a> → «Деректерімді өшіру» батырмасымен өз деректерін өшіреді. Мұғалім журналдағы жазбаны «×» батырмасымен жояды.</p></div>
<p class="small muted">Бұл бет заң кеңесі емес. Мектептің дербес деректер жөніндегі ішкі ережелерін де басшылыққа алыңыз.</p></div></section>`;

/* ---------- бот пакеті ---------- */
const BOT_PY = `# -*- coding: utf-8 -*-
"""Astro_bilim Telegram-боты.
Орнату:  pip install -r requirements.txt
Іске қосу (Windows):  set BOT_TOKEN=токен && python bot.py
Іске қосу (Linux/Mac): BOT_TOKEN=токен python bot.py
"""
import base64
import json
import os
import random
import time

import requests
import telebot
from telebot import types

TOKEN = os.environ.get("BOT_TOKEN", "")
if not TOKEN:
    raise SystemExit("BOT_TOKEN орнатылмаған: @BotFather берген токенді жазыңыз.")
bot = telebot.TeleBot(TOKEN)

with open("questions.json", encoding="utf-8") as f:
    DATA = json.load(f)
QB = DATA["questions"]      # {"1": [[сұрақ, [нұсқалар], дұрыс, түсініктеме], ...]}
TITLES = DATA["titles"]     # {"1": "Тақырып атауы", ...}
FACTS = DATA["facts"]
STATE = {}                  # chat_id -> оқушы күйі (бот қайта іске қосылғанда тазарады)


def st(cid):
    return STATE.setdefault(cid, {"name": "", "cls": "", "results": {}})


def menu():
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    kb.add("📝 Тест", "✨ Факт", "🛰 ХҒС орны", "🔑 Нәтиже коды", "👤 Атымды енгізу")
    return kb


@bot.message_handler(commands=["start"])
def start(m):
    bot.send_message(m.chat.id, "Сәлем! Мен – Astro_bilim астрономия көмекшісімін.\\n"
                     "Алдымен «👤 Атымды енгізу» батырмасын басыңыз.", reply_markup=menu())


@bot.message_handler(func=lambda m: m.text == "👤 Атымды енгізу")
def ask_name(m):
    msg = bot.send_message(m.chat.id, "Аты-жөніңіз бен сыныбыңызды үтір арқылы жазыңыз. Мысалы: Айгерім С., 9А")
    bot.register_next_step_handler(msg, save_name)


def save_name(m):
    parts = [p.strip() for p in (m.text or "").split(",")]
    s = st(m.chat.id)
    s["name"] = parts[0][:40]
    s["cls"] = parts[1][:16] if len(parts) > 1 else ""
    bot.send_message(m.chat.id, f"Сақталды: {s['name']} {s['cls']}", reply_markup=menu())


@bot.message_handler(func=lambda m: m.text == "📝 Тест")
def choose_topic(m):
    kb = types.InlineKeyboardMarkup(row_width=1)
    for k, t in TITLES.items():
        kb.add(types.InlineKeyboardButton(f"{k}. {t}"[:60], callback_data=f"t:{k}"))
    bot.send_message(m.chat.id, "Тақырыпты таңдаңыз:", reply_markup=kb)


@bot.callback_query_handler(func=lambda c: c.data.startswith("t:"))
def start_test(c):
    k = c.data[2:]
    s = st(c.message.chat.id)
    s.update(topic=k, order=random.sample(range(len(QB[k])), len(QB[k])), i=0, score=0)
    bot.answer_callback_query(c.id)
    ask(c.message.chat.id)


def ask(cid):
    s = st(cid)
    q = QB[s["topic"]][s["order"][s["i"]]]
    kb = types.InlineKeyboardMarkup(row_width=1)
    for j, o in enumerate(q[1]):
        kb.add(types.InlineKeyboardButton(o[:60], callback_data=f"a:{s['i']}:{j}"))
    bot.send_message(cid, f"❓ {s['i'] + 1}/{len(s['order'])}\\n{q[0]}", reply_markup=kb)


@bot.callback_query_handler(func=lambda c: c.data.startswith("a:"))
def answer(c):
    cid = c.message.chat.id
    s = st(cid)
    _, qi, j = c.data.split(":")
    if "order" not in s or int(qi) != s.get("i"):
        return bot.answer_callback_query(c.id, "Бұл сұраққа жауап берілген")
    q = QB[s["topic"]][s["order"][s["i"]]]
    ok = int(j) == q[2]
    s["score"] += 1 if ok else 0
    bot.answer_callback_query(c.id, "Дұрыс! ✅" if ok else "Қате ❌")
    bot.send_message(cid, ("✅ " if ok else f"❌ Дұрыс жауап: {q[1][q[2]]}\\n") + q[3])
    s["i"] += 1
    if s["i"] < len(s["order"]):
        ask(cid)
    else:
        best = s["results"].get(s["topic"], [0, 0, 0])
        if s["score"] >= best[0]:
            s["results"][s["topic"]] = [s["score"], len(s["order"]), int(time.time() * 1000)]
        bot.send_message(cid, f"Тест аяқталды: {s['score']}/{len(s['order'])}.\\n"
                         "«🔑 Нәтиже коды» арқылы мұғалімге жіберіңіз.", reply_markup=menu())


def base36(n):
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while True:
        n, r = divmod(n, 36)
        out = digits[r] + out
        if n == 0:
            return out


def make_code(payload):
    raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    b = base64.urlsafe_b64encode(raw).decode().rstrip("=")
    h = 0
    for ch in b:
        h = (h * 31 + ord(ch)) % 1679616
    return "AB1." + b + "." + base36(h).rjust(4, "0")


@bot.message_handler(func=lambda m: m.text == "🔑 Нәтиже коды")
def code(m):
    s = st(m.chat.id)
    if not s["results"]:
        return bot.send_message(m.chat.id, "Әлі тест тапсырылған жоқ.")
    payload = {"v": 1, "src": "bot", "n": s["name"] or "Атсыз", "c": s["cls"],
               "t": s["results"], "ts": int(time.time() * 1000)}
    bot.send_message(m.chat.id, "Осы кодты көшіріп, мұғаліміңізге жіберіңіз (сайттағы «Мұғалім кабинеті → Кодтарды енгізу»):")
    bot.send_message(m.chat.id, make_code(payload))


@bot.message_handler(func=lambda m: m.text == "✨ Факт")
def fact(m):
    bot.send_message(m.chat.id, "💡 " + random.choice(FACTS))


@bot.message_handler(func=lambda m: m.text == "🛰 ХҒС орны")
def iss(m):
    try:
        pos = requests.get("http://api.open-notify.org/iss-now.json", timeout=10).json()["iss_position"]
        bot.send_message(m.chat.id, f"🛰 ХҒС қазір:\\nЕндік: {pos['latitude']}\\nБойлық: {pos['longitude']}")
    except Exception:
        bot.send_message(m.chat.id, "Дерек алу мүмкін болмады, кейінірек қайталаңыз.")


bot.infinity_polling()
`;
async function botZip(btn, stEl) {
  const set = t => stEl.textContent = t;
  try {
    set('Дайындалуда…'); await PF.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    const z = new window.JSZip(), questions = {}, titles = {};
    S.lessons.forEach(l => { questions[l.n] = QB[l.n].concat(PF.customFor(l.n)); titles[l.n] = l.title; });
    z.file('bot.py', BOT_PY);
    z.file('questions.json', JSON.stringify({ titles, questions, facts: FACTS }, null, 1));
    z.file('requirements.txt', 'pyTelegramBotAPI>=4.14\nrequests>=2.31\n');
    z.file('README.txt', 'Astro_bilim Telegram-боты\r\n\r\n1. Telegram-да @BotFather ботына /newbot жіберіп, токен алыңыз.\r\n2. Python 3.9+ орнатыңыз, осы папкада: pip install -r requirements.txt\r\n3. Токенді BOT_TOKEN айнымалысына жазып, python bot.py іске қосыңыз.\r\n4. Бот сайттағы барлық тест сұрақтарын (questions.json) қолданады. Оқушы «Нәтиже коды» батырмасымен код алып, мұғалімге жібереді; мұғалім оны сайттағы «Мұғалім кабинеті → Кодтарды енгізу» бөліміне қояды.\r\n5. Боттың есте сақтауы (оқушы аты, нәтижелер) бот қайта іске қосылғанда тазарады. Ұзақ сақтау үшін деректер қорын (мысалы, SQLite) қосыңыз.\r\n');
    const blob = await z.generateAsync({ type: 'blob' });
    await PF.saveFile('astro_bilim_bot.zip', blob); set('Дайын.');
  } catch (e) { set(e && e.code === 'declined' ? 'Жүктеу тоқтатылды.' : 'Жүктеу бұл жерде қолжетімсіз. Кодты төменнен көшіріңіз.'); }
}

/* ---------- Telegram-бот ---------- */
const FACTS = ['Күннен шыққан жарық Жерге шамамен 8 минут 20 секундта жетеді.', 'Шолпан өз осінен 243 тәулікте бір айналады, ал Күнді 225 тәулікте айналып шығады: оның «тәулігі» жылынан ұзақ.', 'Күн массасы бүкіл Күн жүйесі массасының шамамен 99,86%-ын құрайды.', 'Ай Жерден жыл сайын шамамен 3,8 см алыстап барады.', 'Марстағы Олимп тауы – Күн жүйесіндегі ең биік жанартау, биіктігі шамамен 22 км.', '1961 жылғы 12 сәуірде Юрий Гагарин Байқоңырдан ұшып, ғарышқа шыққан алғашқы адам болды.', 'Тоқтар Әубәкіров – ғарышқа ұшқан тұңғыш қазақ (1991 ж.).', 'Талғат Мұсабаев ғарышқа үш рет ұшқан (1994, 1998, 2001).', 'Айдын Айымбетов 2015 жылы Халықаралық ғарыш станциясына ұшты.', 'ХҒС Жерді шамамен 90 минутта бір айналады, жылдамдығы ≈ 7,7 км/с.', 'Сатурнның орташа тығыздығы судан аз – шамамен 0,69 г/см³.', 'Юпитердегі Үлкен қызыл дақ – Жерден үлкен алып дауыл.', 'Бетельгейзе – қызыл алып жұлдыз, радиусы Күннен шамамен 700 есе үлкен.', 'Байқоңыр – әлемдегі тұңғыш және ең ірі ғарыш айлақтарының бірі.', 'Жарық бір жылда шамамен 9,46 трлн км жол жүреді – бұл 1 жарық жылы.'];
const PL = [['Меркурий', '0,39 а.б.', '4 879 км', '88 тәулік', '59 тәулік', '−173…+427 °C'], ['Шолпан', '0,72 а.б.', '12 104 км', '225 тәулік', '243 тәулік (кері бағытта)', '≈ +465 °C'], ['Жер', '1 а.б.', '12 742 км', '365,25 тәулік', '23 сағ 56 мин', 'орташа +15 °C'], ['Марс', '1,52 а.б.', '6 779 км', '687 тәулік', '24 сағ 37 мин', 'орташа −63 °C'], ['Юпитер', '5,2 а.б.', '139 820 км', '11,9 жыл', '9 сағ 56 мин', '≈ −110 °C (бұлттар)'], ['Сатурн', '9,5 а.б.', '116 460 км', '29,5 жыл', '10 сағ 33 мин', '≈ −140 °C'], ['Уран', '19,2 а.б.', '50 724 км', '84 жыл', '17 сағ 14 мин', '≈ −195 °C'], ['Нептун', '30,1 а.б.', '49 244 км', '165 жыл', '16 сағ 6 мин', '≈ −200 °C']];
const QZ = [['Күн жүйесіндегі ең үлкен ғаламшар қайсы?', ['Марс', 'Юпитер', 'Сатурн', 'Нептун'], 1], ['Күнге ең жақын ғаламшар?', ['Шолпан', 'Меркурий', 'Марс', 'Жер'], 1], ['«Қызыл ғаламшар» деп қайсысын атайды?', ['Марс', 'Юпитер', 'Шолпан', 'Уран'], 0], ['Жерге ең жақын жұлдыз?', ['Сириус', 'Күн', 'Темірқазық', 'Вега'], 1], ['Темірқазық қай шоқжұлдызда?', ['Үлкен аю', 'Кіші аю', 'Орион', 'Кассиопея'], 1], ['Сақиналары ең айқын көрінетін ғаламшар?', ['Сатурн', 'Марс', 'Меркурий', 'Жер'], 0], ['Күн жарығы Жерге шамамен қанша уақытта жетеді?', ['8 секунд', '8 минут', '1 сағат', '1 тәулік'], 1], ['Ай Жерді шамамен неше тәулікте бір айналады (жұлдыздық ай)?', ['7', '27,3', '365', '1'], 1], ['Ең ыстық ғаламшар?', ['Меркурий', 'Шолпан', 'Марс', 'Юпитер'], 1], ['Ю. Гагарин қай ғарыш айлағынан ұшты?', ['Байқоңыр', 'Канаверал', 'Плесецк', 'Восточный'], 0]];
const ECL = [['2027-02-06', 'Сақиналы Күн тұтылуы', 'Оңтүстік Америка, Атлант мұхиты'], ['2027-02-20', 'Ай тұтылуы (жартылай көлеңкелі)', ''], ['2027-07-18', 'Ай тұтылуы (жартылай көлеңкелі)', ''], ['2027-08-02', 'Толық Күн тұтылуы', 'Испания, Солтүстік Африка, Египет, Арабия түбегі'], ['2027-08-17', 'Ай тұтылуы (жартылай көлеңкелі)', ''], ['2028-01-12', 'Ішінара Ай тұтылуы', ''], ['2028-01-26', 'Сақиналы Күн тұтылуы', 'Эквадор, Перу, Бразилия, Португалия, Испания'], ['2028-07-06', 'Ішінара Ай тұтылуы', ''], ['2028-07-22', 'Толық Күн тұтылуы', 'Австралия, Жаңа Зеландия'], ['2028-12-31', 'Толық Ай тұтылуы', '']];
const BOTC = ['Астана', 'Алматы', 'Шымкент', 'Қарағанды', 'Ақтөбе', 'Тараз', 'Павлодар', 'Өскемен', 'Семей', 'Атырау', 'Қостанай', 'Орал', 'Петропавл', 'Ақтау', 'Түркістан'];
function sun(lat, lon, d = new Date()) {
  const rad = Math.PI / 180, jd = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 7) / 864e5 + 2440587.5;
  const n = Math.ceil(jd - 2451545 + 0.0008), Js = n - lon / 360, M = (357.5291 + 0.98560028 * Js) % 360;
  const Cc = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad), lam = (M + Cc + 282.9372) % 360;
  const Jt = 2451545 + Js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lam * rad), sd = Math.sin(lam * rad) * Math.sin(23.4397 * rad), cd = Math.cos(Math.asin(sd));
  const cw = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sd) / (Math.cos(lat * rad) * cd);
  const t = j => { const x = new Date((j - 2440587.5) * 864e5 + 5 * 36e5); return String(x.getUTCHours()).padStart(2, '0') + ':' + String(x.getUTCMinutes()).padStart(2, '0'); };
  if (cw < -1 || cw > 1) return null;
  const w = Math.acos(cw) / rad / 360;
  return { rise: t(Jt - w), set: t(Jt + w), noon: t(Jt), len: Math.floor(w * 48) + ' сағ ' + Math.round((w * 48 % 1) * 60) + ' мин' };
}
P.bot = () => banner('Telegram-бот', 'Астрономия бойынша цифрлық көмекші: Күннің шығуы мен батуы, ХҒС орны, қызықты фактілер, ғаламшарлар, формулалар, тест және тұтылулар.', '<a href="#lab">Симуляциялар</a> / Telegram-бот') + `
<section class="band"><div class="wrap intro"><div>
  <div class="phone" id="phone"><div class="ph"><i>A</i><div><b>Астрономия боты</b><small>демо-нұсқа · бот</small></div></div><div class="chat" id="chat" aria-live="polite"></div><div class="kb" id="kb"></div></div>
  <p class="small muted" style="text-align:center;margin-top:10px">Сайттағы демо интернетке сұраныс жібере алмайды: ХҒС пен Марс деректері – мысал. Күннің шығуы мен батуы бүгінгі күнге нақты есептеледі.</p>
</div><div>
  <h2>Бот не істейді</h2><p>Боттың басты мақсаты – оқушылардың физика мен астрономияға қызығушылығын ояту. Ол оқушыны ыңғайлы, еркін ортада ойын түрінде білім алуға шақырады: әр бала кез келген уақытта өз қарқынымен үйрене алады.</p>
  ${ticks(['Кез келген қаладағы Күннің шығуы мен батуы', 'Астрономия туралы кездейсоқ және күнделікті фактілер', 'Ғаламшарлар туралы анықтама', 'Негізгі астрономиялық формулалар', '10 сұрақтық астрономиялық тест', 'Келесі Күн және Ай тұтылулары', 'Марстағы ауа райы, ХҒС-ның ағымдағы орны, 3D Күн жүйесі'])}
  <h2 style="margin-top:22px">Ботты қалай жасауға болады</h2>
  <div class="task"><h3>1. Ботты тіркеу</h3><p style="margin:0">Telegram-да <b>@BotFather</b> ботына /newbot командасын жіберіп, ат беріңіз. Ол берген <b>токенді</b> ешкімге көрсетпеңіз.</p></div>
  <div class="task"><h3>2. Кодты жазу</h3><p style="margin:0">Python орнатып, <code>pip install pyTelegramBotAPI requests</code> командасын орындаңыз. Төмендегі кодты ЖИ көмегімен толықтыруға болады: «Ботқа Күн шығу уақытын есептейтін батырма қос» деп сұраңыз.</p></div>
  <div class="task"><h3>3. Іске қосу және сынау</h3><p style="margin:0">Кодты компьютерде, бұлттық ортада немесе Replit-те іске қосып, ботқа /start жіберіңіз. Сыныппен бірге тексеріп, жаңа батырмалар қосыңыз.</p></div>
  <div class="task"><h3>Кодсыз жол: n8n</h3><p style="margin:0">Сабақта «Telegram Trigger → AI Agent» сызбасы да көрсетілді: Telegram хабарламасы ЖИ агентіне жіберіліп, жауап қайтадан чатқа түседі. Мұндай боттың білімін тексеріп отыру керек – ЖИ қателесуі мүмкін.</p></div>
</div></div></section>
<section class="band alt"><div class="wrap"><h2>Бот пакеті</h2><p class="muted">Толық бот (тақырыптық тесттер, факт, ХҒС, мұғалімге нәтиже коды) және сайттағы барлық сұрақтар бір архивте: bot.py, questions.json, README.txt.</p><div class="row" style="margin-bottom:22px"><button class="btn" type="button" id="botzip">Бот пакетін жүктеу (.zip)</button><span class="small muted" id="botzs"></span></div><h2>Қысқа мысал коды</h2><p class="muted">pyTelegramBotAPI кітапханасы. ХҒС координатасы open-notify API арқылы алынады.</p>${L.code(`# pip install pyTelegramBotAPI requests
import random
import requests
import telebot
from telebot import types

bot = telebot.TeleBot("СІЗДІҢ_ТОКЕН")        # @BotFather берген токен

FACTS = [
    "Күннен шыққан жарық Жерге шамамен 8 минут 20 секундта жетеді.",
    "Шолпанның өз осінен айналуы (243 тәулік) оның жылынан (225 тәулік) ұзақ.",
    "ХҒС Жерді шамамен 90 минутта бір рет айналады.",
]
QUIZ = [
    ("Күн жүйесіндегі ең үлкен ғаламшар?", ["Марс", "Юпитер", "Сатурн", "Нептун"], 1),
    ("Күнге ең жақын ғаламшар?", ["Шолпан", "Меркурий", "Марс", "Жер"], 1),
]

def menu():
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    kb.add("🛰 ХҒС орны", "✨ Факт", "📝 Тест")
    return kb

@bot.message_handler(commands=["start"])
def start(m):
    bot.send_message(m.chat.id, "Сәлем! Мен – астрономия көмекшісімін.", reply_markup=menu())

@bot.message_handler(func=lambda m: m.text == "🛰 ХҒС орны")
def iss(m):
    data = requests.get("http://api.open-notify.org/iss-now.json", timeout=10).json()
    pos = data["iss_position"]
    bot.send_message(m.chat.id, f"ХҒС қазір:\\nЕндік: {pos['latitude']}\\nБойлық: {pos['longitude']}")

@bot.message_handler(func=lambda m: m.text == "✨ Факт")
def fact(m):
    bot.send_message(m.chat.id, random.choice(FACTS))

@bot.message_handler(func=lambda m: m.text == "📝 Тест")
def quiz(m):
    i = random.randrange(len(QUIZ))
    question, options, _ = QUIZ[i]
    kb = types.InlineKeyboardMarkup()
    for j, text in enumerate(options):
        kb.add(types.InlineKeyboardButton(text, callback_data=f"q{i}_{j}"))
    bot.send_message(m.chat.id, question, reply_markup=kb)

@bot.callback_query_handler(func=lambda c: c.data.startswith("q"))
def answer(c):
    i, j = map(int, c.data[1:].split("_"))
    ok = j == QUIZ[i][2]
    bot.answer_callback_query(c.id, "Дұрыс! ✅" if ok else "Қате ❌")

bot.infinity_polling()`, 'Кодты ашу')}</div></section>`;

function botInit() {
  const chat = document.getElementById('chat'), kb = document.getElementById('kb'); if (!chat) return;
  const MAIN = ['🛰 ХҒС орны', '📈 Астрономия туралы факт', '🪐 Ғаламшарлар туралы ақпарат', '📘 Астрономия формулалары', '✏️ Астрономиялық тест', '🌒 Келесі тұтылу', '🔴 Марстағы ауа райы', '🌅 Күн шығуы/Батуы', '🌌 3D Күн жүйесі'];
  let lastFact = null, qi = 0, qs = 0;
  const say = (t, who = 'b') => { const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = t; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; };
  const keys = (arr, wide = []) => { kb.innerHTML = arr.map(b => `<button type="button" class="${wide.includes(b) || arr.length === 1 ? 'w' : ''}">${b}</button>`).join(''); kb.querySelectorAll('button').forEach(b => b.onclick = () => press(b.textContent)); };
  const main = () => keys(MAIN, ['🌌 3D Күн жүйесі']);
  const back = '⬅️ Артқа';
  const ask = () => { const q = QZ[qi]; say(`❓ ${qi + 1}/10\n${q[0]}`); keys(q[1]); };
  let mode = 'main';
  const press = t => {
    say(t, 'u');
    if (t === back) { mode = 'main'; say('Негізгі мәзір:'); return main(); }
    if (mode === 'quiz') { const q = QZ[qi], j = q[1].indexOf(t); if (j === q[2]) { qs++; say('Дұрыс! ✅'); } else say('Қате ❌ Дұрыс жауап: ' + q[1][q[2]]); qi++; if (qi < QZ.length) return ask(); mode = 'main'; say(`Тест аяқталды: ${qs} / ${QZ.length} 🎉`); return keys(['✏️ Астрономиялық тест', back]); }
    if (mode === 'city' && BOTC.includes(t)) { const c = L.CITIES.find(x => x[0] === t), r = sun(c[1], c[2]); const d = new Date(Date.now() + 5 * 36e5); say(r ? `🌅 ${t}, ${d.getUTCDate()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()} (UTC+5)\nКүн шығуы: <b>${r.rise}</b>\nКүн батуы: <b>${r.set}</b>\nКүн ұзақтығы: ${r.len}\nКүн меридианда: ${r.noon}` : 'Бүгін бұл қалада Күн батпайды не шықпайды.'); return; }
    if (mode === 'planet') { const p = PL.find(x => x[0] === t); if (p) { say(`🪐 <b>${p[0]}</b>\nКүннен қашықтығы: ${p[1]}\nДиаметрі: ${p[2]}\nКүнді айналу периоды: ${p[3]}\nӨз осінен айналуы: ${p[4]}\nТемпературасы: ${p[5]}`); return; } }
    if (mode === 'fact') {
      if (t === '🎲 Кездейсоқ факт') { lastFact = FACTS[Math.floor(Math.random() * FACTS.length)]; return say('💡 ' + lastFact); }
      if (t === '📅 Күнделікті факт') { const d = Math.floor(Date.now() / 864e5); lastFact = FACTS[d % FACTS.length]; return say('📅 Бүгінгі факт:\n' + lastFact); }
      if (t === '🔁 Соңғы фактіні қайталау') return say(lastFact ? '🔁 ' + lastFact : 'Әлі факт сұралған жоқ.');
    }
    switch (t) {
      case '🛰 ХҒС орны': return say('🛰 Халықаралық ғарыш станциясы (ХҒС)\n📍 Ағымдағы орны (мысал):\nЕндік: 50.0778\nБойлық: 35.0896\nНақты бот бұл деректі open-notify API-ден алады. Тірі картасы: <a href="https://wheretheiss.at/" target="_blank" rel="noopener">wheretheiss.at</a>');
      case '📈 Астрономия туралы факт': mode = 'fact'; say('Факт түрін таңдаңыз:'); return keys(['🎲 Кездейсоқ факт', '📅 Күнделікті факт', '🔁 Соңғы фактіні қайталау', back], ['🔁 Соңғы фактіні қайталау', back]);
      case '🪐 Ғаламшарлар туралы ақпарат': mode = 'planet'; say('Ғаламшарды таңдаңыз:'); return keys(PL.map(p => p[0]).concat(back), [back]);
      case '📘 Астрономия формулалары': return say('📘 Негізгі формулалар\nF = G·m₁·m₂ / r²\nv₁ = √(GM/R),  v₂ = √2·v₁\nT₁² / T₂² = a₁³ / a₂³\nD = R⊕ / sin p\nr (пк) = 1 / π″\nM = m + 5 − 5·lg r\nh = 90° − φ + δ\nT_жерг = UT + λ/15°');
      case '✏️ Астрономиялық тест': mode = 'quiz'; qi = 0; qs = 0; return ask();
      case '🌒 Келесі тұтылу': { const today = new Date().toISOString().slice(0, 10), next = ECL.filter(e => e[0] >= today).slice(0, 3); return say(next.length ? '🌒 Келесі тұтылулар:\n' + next.map(e => `• ${e[0].split('-').reverse().join('.')} – ${e[1]}${e[2] ? ' (' + e[2] + ')' : ''}`).join('\n') : 'Тізім жаңартуды қажет етеді.'); }
      case '🔴 Марстағы ауа райы': return say('🔴 Марстағы ауа райы (Perseverance марсоходынан алынған мәліметтер, имитация):\n🌡 Температура: −80 °C-ден −20 °C-ге дейін (күндіз)\n💨 Жел: 40 км/сағ-қа дейін\n🧭 Қысым: ≈ 750 Па (Жердегіден 0,75%)\n👁 Көрінуі: шаң салдарынан жиі төмендейді');
      case '🌅 Күн шығуы/Батуы': mode = 'city'; say('Қазақстандағы қаланы таңдаңыз:'); return keys(BOTC.concat(back), [back]);
      case '🌌 3D Күн жүйесі': { const m = say('🌌 3D Күн жүйесі: ғаламшарлар нақты периодтармен айналады.'); const f = document.createElement('div'); f.style.cssText = 'position:relative;height:220px;margin-top:6px;border-radius:10px;overflow:hidden;background:#04131a'; m.appendChild(f); L.solarScene(f, { tilt: 65, speed: 60, labels: false }); say('Толық модель: <a href="#lab-solar">Симуляциялар</a>'); return; }
    }
    say('Мәзірдегі батырмаларды қолданыңыз 🙂');
  };
  say('/start', 'u'); say('Сәлем! 👋 Мен – астрономия көмекшісімін.\nТөмендегі мәзірден бөлімді таңдаңыз.'); main();
}

P.comics = () => banner('ЖИ және комикстер', 'Астрономия заңдарын ЖИ көмегімен жасалған комикс арқылы түсіндіру. Галерея және өз комиксіңді жасау жолы.', '<a href="#lab">Симуляциялар</a> / Комикстер') + `
<section class="band"><div class="wrap"><div class="gal">
${S.lessons.flatMap(l => (l.comics || []).map(c => `<figure><img src="${c}" alt="${l.title} – ЖИ комиксі" data-zoom loading="lazy"><figcaption><a href="#lesson-${l.n}">${l.code.includes('.') ? l.code + '. ' : ''}${l.title}</a></figcaption></figure>`)).join('')}
</div><p class="small muted">Суреттер авторлық бағдарламадан алынды. Үлкейту үшін басыңыз.</p></div></section>
<section class="band alt"><div class="wrap intro"><div><h2>Комиксті қалай жасаймыз</h2>
<div class="task"><h3>1. Тақырып таңдау</h3><p style="margin:0">Астрономия бастамасы, Күн жүйесіндегі ғаламшарлар, Күн – біздің жұлдызымыз, ғарыштық жылдамдықтар, Ньютон заңдары.</p></div>
<div class="task"><h3>2. Сценарий жазу</h3><p style="margin:0">Тақырыпқа қызықты оқиға ойлап, 4–6 кадрлық сценарий жазыңыз. ChatGPT көмегімен жетілдіріңіз; ғылыми фактілерді оқулықпен тексеріңіз.</p></div>
<div class="task"><h3>3. Иллюстрация</h3><p style="margin:0">Әр кадрдың суретін ЖИ арқылы жасаңыз (<a href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a>, DALL·E, Stable Diffusion). Мәтінді суретке емес, кейін сөз бұлттарына жазған дұрыс.</p></div>
<div class="task"><h3>4. Құрастыру және анимация</h3><p style="margin:0"><a href="https://gamma.app/ru" target="_blank" rel="noopener">Gamma</a>, Canva, Pixton немесе ComicStrip Creator-да кадрларды жинап, сөз бұлттарын қосыңыз. Соңғы кадрға оқушыға сұрақ немесе тапсырма қойыңыз.</p></div>
</div><div><h2>Дайын промпттар</h2><p class="muted">Көшіріп, тақырыпты ауыстырыңыз.</p>
${L.code('Сен 9-сынып оқушыларына арналған астрономия комиксінің сценаристісің. Тақырып: «Кеплердің екінші заңы». 6 кадрлық сценарий жаз: әр кадрда сахна сипаттамасы және кейіпкерлердің қысқа сөздері (қазақ тілінде, 15 сөзден аспасын). Ғылыми дұрыс бол. Соңғы кадрда оқушыға бір есеп немесе сұрақ қой.', 'Сценарий промпты')}
${L.code('Мультфильм стиліндегі комикс кадры: қазақ мектеп оқушысы мен мұғалім телескоп жанында түнгі аспанға қарап тұр, аспанда Жетіқарақшы мен Темірқазық анық көрінеді. Жарқын түстер, жұмсақ жарық, 16:9, суретте мәтін болмасын.', 'Сурет промпты')}
</div></div></section>`;

P.glossary = () => banner('Глоссарий', 'Бағдарламада қолданылатын негізгі ұғымдар, қысқартулар және астрономиялық тұрақтылар.', '<a href="#tests">Тесттер</a> / Глоссарий') + `
<section class="band"><div class="wrap"><label class="small muted" for="gq">Іздеу</label><input type="text" id="gq" placeholder="мысалы, параллакс" style="max-width:420px;margin:6px 0 16px">
<div class="glo" id="glo">${S.glossary.map(g => `<div data-k="${(g[0] + ' ' + g[1]).toLowerCase()}"><b>${g[0]}</b> – ${g[1]}</div>`).join('')}</div><p id="gno" class="muted" hidden>Ештеңе табылмады.</p></div></section>
<section class="band alt"><div class="wrap intro"><div><h2>Астрономиялық тұрақтылар</h2><div class="scroll"><table><thead><tr><th>Белгі</th><th>Шама</th><th class="n">Мәні</th></tr></thead><tbody>${S.constants.map(c => `<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td class="n">${c[2]}</td></tr>`).join('')}</tbody></table></div></div>
<div><h2>Қысқартулар</h2>${S.abbr.map(a => `<p><b>${a[0]}</b> – ${a[1]}</p>`).join('')}</div></div></section>`;

P.results = () => P.profile();

/* ---------- маршрут ---------- */
const lb = document.getElementById('lb');
lb.onclick = () => lb.classList.remove('show');
function after(route, arg) {
  app.querySelectorAll('[data-zoom]').forEach(i => i.onclick = () => { lb.querySelector('img').src = i.src; lb.querySelector('img').alt = i.alt; lb.classList.add('show'); });
  app.querySelectorAll('[data-model]').forEach(h => { const m = L.MODELS.find(x => x.id === h.dataset.model); try { m.f(h); } catch (e) { h.innerHTML = '<p class="muted">Модельді жүктеу мүмкін болмады.</p>'; console.error(e); } });
  app.querySelectorAll('[data-game]').forEach(h => { const g = GM.find(x => x.id === h.dataset.game); try { g.f(h); } catch (e) { h.innerHTML = '<p class="muted">Ойынды жүктеу мүмкін болмады.</p>'; console.error(e); } });
  app.querySelectorAll('.copy').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.nextElementSibling.textContent); b.textContent = 'Көшірілді'; } catch (e) { const r = document.createRange(); r.selectNodeContents(b.nextElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Белгіленді: Ctrl+C'; } setTimeout(() => b.textContent = 'Көшіру', 2000); });
  try {
    if (route === 'bot') { botInit(); const z = document.getElementById('botzip'); z.onclick = () => botZip(z, document.getElementById('botzs')); }
    if (route === 'lesson') { PF.mark('lessonTs', arg); const rn = document.getElementById('runner'); runner(rn, { title: `Өзіңді тексер: ${arg}-тақырып`, topic: arg, qs: testSet(arg, 'B'), store: storeTopic(arg), onLevel: v => { try { sessionStorage.setItem('lvl_' + arg, v); } catch (e) { } location.hash = 'test-' + arg; } }); }
    if (route === 'model') PF.mark('simTs', arg);
    if (route === 'test') testInit(arg);
    if (route === 'diag') diagInit(arg);
    if (route === 'weekly') weeklyInit();
    if (route === 'problems') problemsBlock(document.getElementById('pb'), arg ? +arg : 'mix', 5);
    if (route === 'profile' || route === 'results') profileInit();
    if (route === 'rating') ratingInit();
    if (route === 'ai') aiInit(arg);
    if (route === 'teacher') teacherInit();
    if (route === 'guide') { const b = document.getElementById('dloff'), st = document.getElementById('dlst'); b.onclick = async () => { st.textContent = 'Жиналуда…'; try { const html = await PF.offlineHTML(); await PF.saveFile('Astro_bilim_offline.html', html); st.textContent = 'Дайын.'; } catch (e) { st.textContent = e && e.code === 'declined' ? 'Жүктеу тоқтатылды.' : 'Жүктеу бұл жерде қолжетімсіз (claude.ai ішінде ашыңыз).'; } }; }
  } catch (e) { console.error(e); }
  const kc = document.getElementById('ktp-copy');
  if (kc) kc.onclick = async () => { const t = document.getElementById('ktp'), txt = [...t.rows].map(r => [...r.cells].map(c => c.textContent.trim()).join('\t')).join('\n'); try { await navigator.clipboard.writeText(txt); kc.textContent = 'Көшірілді – Excel не Word-қа қойыңыз'; } catch (e) { const r = document.createRange(); r.selectNodeContents(t); const s = getSelection(); s.removeAllRanges(); s.addRange(r); kc.textContent = 'Кесте белгіленді: Ctrl+C'; } setTimeout(() => kc.textContent = 'Кестені көшіру (Excel/Word)', 3000); };
  const kx = document.getElementById('ktp-xl');
  if (kx) kx.onclick = async () => { const t = document.getElementById('ktp'); try { await PF.xlsx('Astro_bilim_KTP.xlsx', [['КТП', [...t.rows].map(r => [...r.cells].map(c => c.textContent.trim()))]]); } catch (e) { kx.textContent = 'Жүктеу қолжетімсіз – «көшіру» батырмасын қолданыңыз'; } };
  const gq = document.getElementById('gq');
  if (gq) gq.oninput = () => { const v = gq.value.trim().toLowerCase(); let c = 0; document.querySelectorAll('#glo>div').forEach(d => { const s = !v || d.dataset.k.includes(v); d.hidden = !s; c += s; }); document.getElementById('gno').hidden = c > 0; };
}
let lastRoute = '';
function render() {
  const h = (location.hash || '#home').slice(1);
  let route = h, arg = null, m;
  if ((m = h.match(/^lesson-(\d+)$/))) { route = 'lesson'; arg = +m[1]; }
  else if ((m = h.match(/^lab-([a-z]+)$/))) { route = 'model'; arg = m[1]; }
  else if ((m = h.match(/^game-([a-z]+)$/))) { route = 'game'; arg = m[1]; }
  else if ((m = h.match(/^test-(\d+|final)$/))) { route = 'test'; arg = m[1]; }
  else if ((m = h.match(/^problems-(\d+)$/))) { route = 'problems'; arg = m[1]; }
  else if ((m = h.match(/^ai-(\d+)$/))) { route = 'ai'; arg = m[1]; }
  else if ((m = h.match(/^diag-(pre|post)$/))) { route = 'diag'; arg = m[1]; }
  else if (!P[h] || /^(lesson|model|game|test|diag)$/.test(h)) route = 'home';
  if (route === 'lesson' && !byN(arg)) route = 'home';
  if (h !== lastRoute) {
    app.innerHTML = arg != null ? P[route](arg) : P[route]();
    after(route, arg);
    lastRoute = h;
    window.scrollTo(0, 0);
  }
  nav.querySelectorAll('.dd').forEach((d, i) => d.classList.toggle('cur', i === groupOf(h)));
  closeAll(); nav.classList.remove('show'); burger.setAttribute('aria-expanded', 'false');
  const t = route === 'lesson' ? arg + '-сабақ' : route === 'model' ? (L.MODELS.find(x => x.id === arg)?.t || '') : route === 'game' ? (GM.find(x => x.id === arg)?.t || '') : route === 'test' ? 'Тест' : '';
  document.title = (t ? t + ' · ' : '') + 'Astro_bilim';
}

/* ---------- тіл, қолжетімділік, хабарландыру ---------- */
const langSel = document.getElementById('lang');
langSel.value = PF.lang; langSel.onchange = () => PF.setLang(langSel.value);
const a11yBtn = document.getElementById('a11yb'), a11yP = document.getElementById('a11yp');
const drawA11y = () => { const o = PF.a11y(); a11yP.innerHTML = `<b>Қолжетімділік</b>
  <div class="small muted" style="margin:8px 0 4px">Мәтін өлшемі</div><div class="chips">${['Қалыпты', 'Үлкен', 'Өте үлкен'].map((t, i) => `<button type="button" class="chip ${o.size === i ? 'act' : ''}" data-sz="${i}" style="cursor:pointer">${t}</button>`).join('')}</div>
  ${[['hc', 'Жоғары контраст'], ['dys', 'Оқуға ыңғайлы аралық (дислексия)'], ['anim', 'Анимация']].map(([k, t]) => `<label class="row small" style="margin-top:10px;gap:8px;flex-wrap:nowrap"><input type="checkbox" data-k="${k}" ${o[k] ? 'checked' : ''} style="width:20px;height:20px;flex:none"> ${t}</label>`).join('')}
  <p class="small muted" style="margin:10px 0 0">${PF.st.tts ? 'Тест сұрақтары мен есептердің жанындағы динамик белгісі мәтінді дауыстап оқиды.' : 'Дауыстап оқу бұл құрылғыда қолжетімсіз.'}</p>`;
  a11yP.querySelectorAll('[data-sz]').forEach(b => b.onclick = () => { PF.setA11y({ size: +b.dataset.sz }); drawA11y(); });
  a11yP.querySelectorAll('[data-k]').forEach(c => c.onchange = () => { PF.setA11y({ [c.dataset.k]: c.checked }); drawA11y(); if (c.dataset.k === 'anim') { lastRoute = ''; render(); } }); };
a11yBtn.onclick = e => { e.stopPropagation(); const show = a11yP.hidden; a11yP.hidden = !show; a11yBtn.setAttribute('aria-expanded', show); if (show) drawA11y(); };
document.addEventListener('click', e => { const path = e.composedPath(); if (!a11yP.hidden && !path.includes(a11yP) && !path.includes(a11yBtn)) { a11yP.hidden = true; a11yBtn.setAttribute('aria-expanded', 'false'); } });
const noticeEl = document.querySelector('.notice'), noticeDef = noticeEl.textContent;
const applyNotice = () => { const n = PF.st.shared?.notice; noticeEl.textContent = n ? n : noticeDef; };
window.addEventListener('pf-shared', applyNotice);
PF.applyA11y();
window.addEventListener('hashchange', render);
render();
PF.init().then(() => { applyNotice(); if (PF.lang !== 'kk') PF.setLang(PF.lang); });
}
