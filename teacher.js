/* Мұғалім кабинеті */
window.TEACHER = (() => {
const PF = window.PF, S = window.SITE, QB = window.QB, GM = window.GAMES, L = window.LAB, esc = PF.esc;
const TABS = [['journal', 'Сынып журналы'], ['codes', 'Кодтарды енгізу'], ['tasks', 'Тапсырмалар'], ['classes', 'Сыныптар'], ['questions', 'Сұрақтар'], ['pilot', 'Апробация'], ['stats', 'Талдау'], ['board', 'Рейтинг'], ['notice', 'Хабарландыру']];
let tab = 'journal', clsF = '', cache = null;
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const fmtDate = t => t ? new Date(t + 5 * 36e5).toISOString().slice(0, 16).replace('T', ' ') : '—';
const msg = (el, html, bad) => { const m = el.querySelector('.tmsg'); if (m) { m.className = 'tmsg note' + (bad ? ' bad' : ''); m.innerHTML = html; m.hidden = false; } };
async function data(force) {
  if (cache && !force) return cache;
  const [journal, shared] = await Promise.all([PF.T.journal().catch(() => []), PF.loadShared(true)]);
  cache = { journal, ...shared }; return cache;
}
const testCell = (e, n) => { const v = e.t?.[n] || e.bot?.[n]; if (!v) return '<td class="n muted">–</td>'; const p = pct(v[0], v[1]); return `<td class="n" style="background:${p >= 70 ? '#5fd39a2e' : p >= 50 ? '#f4c84a26' : '#ff7a6b26'}">${v[0]}</td>`; };
const rowsFor = j => j.filter(e => !clsF || (e.c || '') === clsF).sort((a, b) => (a.c || '').localeCompare(b.c || '') || (a.n || '').localeCompare(b.n || ''));

function shell(el, inner) {
  const st = PF.st;
  el.innerHTML = `<div class="note" style="margin-top:0">${st.db ? (st.teacher ? 'Деректер артефакт қорында сақталады: оларды тек сіз (иесі) және редакторлар көреді.' : 'Сіз мұғалім емессіз: бұл бөлімді тек артефакт иесі мен редакторлар басқарады.') : 'Деректер қоры қолжетімсіз (офлайн нұсқа немесе жүйеге кірмегенсіз). Кабинет осы браузерде ғана жұмыс істейді.'}</div>
  <div class="chips" style="margin:14px 0 18px">${TABS.map(([id, t]) => `<button type="button" class="chip ${tab === id ? 'act' : ''}" data-tab="${id}" style="cursor:pointer">${t}</button>`).join('')}</div>
  <div class="tmsg note" hidden></div><div id="tbody">${inner}</div>`;
  el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(el); });
}
const clsSelect = (list, id = 'tcls', all = 'Барлық сыныптар') => `<select id="${id}" style="width:auto;min-width:180px"><option value="">${all}</option>${[...new Set(list)].filter(Boolean).map(c => `<option value="${esc(c)}" ${c === clsF ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>`;

async function render(el) {
  shell(el, '<p class="muted">Жүктелуде…</p>');
  let d; try { d = await data(); } catch (e) { msg(el, 'Деректерді жүктеу мүмкін болмады. Кейінірек қайталаңыз.', true); return; }
  const body = el.querySelector('#tbody'), allCls = d.classes.map(c => c.name).concat(d.journal.map(e => e.c));
  const reload = async () => { cache = null; await render(el); };

  if (tab === 'journal') {
    const rows = rowsFor(d.journal);
    body.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="row">${clsSelect(allCls)}<span class="small muted">${rows.length} оқушы</span></div><div class="row"><button class="btn" type="button" id="xl">Excel-ге жүктеу</button><button class="btn ghost" type="button" id="cp">CSV көшіру</button><button class="btn ghost" type="button" id="rf">Жаңарту</button></div></div>
    ${rows.length ? `<div class="scroll"><table class="jt"><thead><tr><th>Аты-жөні</th><th>Сынып</th><th class="n">XP</th>${S.lessons.map(l => `<th class="n" title="${esc(l.title)}">${l.n}</th>`).join('')}<th class="n">Қор.</th><th class="n">Есеп</th><th class="n">Баст.</th><th class="n">Соңғы</th><th>Жаңартылды</th><th></th></tr></thead><tbody>
    ${rows.map(e => `<tr><td><b>${esc(e.n)}</b>${e.src === 'sync' ? ' <span class="small muted">авто</span>' : ''}</td><td>${esc(e.c)}</td><td class="n">${e.x ?? '–'}</td>${S.lessons.map(l => testCell(e, l.n)).join('')}<td class="n">${e.f ? e.f[0] : '–'}</td><td class="n">${e.p ?? '–'}</td><td class="n">${e.pre ? pct(e.pre[0], e.pre[1]) + '%' : '–'}</td><td class="n">${e.post ? pct(e.post[0], e.post[1]) + '%' : '–'}</td><td class="small">${fmtDate(e.ts || e.imported)}</td><td><button type="button" class="chip del" data-k="${esc(e.key)}" data-src="${e.src}" title="Жою" style="cursor:pointer">×</button></td></tr>`).join('')}
    </tbody></table></div><p class="small muted">Тест бағаналары – тақырып нөмірі, ұяшықта ең жоғары балл (10-нан). Жасыл – 70% және жоғары. «авто» – ұйым ішіндегі оқушы нәтижесі өзі түсті.</p>` : '<div class="card"><p style="margin:0">Журнал әзірге бос. Оқушылар «Менің кабинетім» бетінен нәтиже кодын жіберсін, сіз оны «Кодтарды енгізу» бөліміне қойыңыз.</p></div>'}`;
    body.querySelector('#tcls').onchange = e => { clsF = e.target.value; render(el); };
    body.querySelector('#rf').onclick = reload;
    const table = () => [['Аты-жөні', 'Сынып', 'XP'].concat(S.lessons.map(l => l.n + '-тақырып'), ['Қорытынды', 'Есептер', 'Бастапқы %', 'Соңғы %', 'Жаңартылды'])].concat(rows.map(e => [e.n, e.c, e.x ?? ''].concat(S.lessons.map(l => (e.t?.[l.n] || e.bot?.[l.n])?.[0] ?? ''), [e.f ? e.f[0] : '', e.p ?? '', e.pre ? pct(e.pre[0], e.pre[1]) : '', e.post ? pct(e.post[0], e.post[1]) : '', fmtDate(e.ts || e.imported)])));
    body.querySelector('#xl').onclick = async () => { try { await PF.xlsx('Astro_bilim_jurnal' + (clsF ? '_' + clsF : '') + '.xlsx', [['Журнал', table()]]); msg(el, 'Файл дайын.'); } catch (e) { msg(el, e.code === 'declined' ? 'Жүктеу тоқтатылды.' : 'Жүктеу бұл жерде қолжетімсіз: «CSV көшіру» батырмасын қолданып, Excel-ге қойыңыз.', true); } };
    body.querySelector('#cp').onclick = async () => { try { await navigator.clipboard.writeText(PF.csv(table())); msg(el, 'Кесте көшірілді. Excel-ге қойыңыз (бөлгіш – нүктелі үтір).'); } catch (e) { msg(el, 'Көшіру мүмкін болмады.', true); } };
    body.querySelectorAll('.del').forEach(b => { let armed = false; b.onclick = async () => { if (!armed) { armed = true; b.textContent = 'Жою?'; setTimeout(() => { armed = false; b.textContent = '×'; }, 3000); return; } try { await PF.T.delEntry(b.dataset.k, b.dataset.src); reload(); } catch (e) { msg(el, 'Жою мүмкін болмады.', true); } }; });
  }

  if (tab === 'codes') {
    body.innerHTML = `<div class="intro"><div><label class="small muted" for="codes">Оқушылардан келген кодтарды қойыңыз (әрқайсысы жаңа жолдан немесе бос орынмен)</label><textarea id="codes" rows="9" style="width:100%;margin-top:6px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--bg2);color:var(--ink);font:14px/1.4 ui-monospace,monospace" placeholder="AB1.eyJ2IjoxLC…"></textarea><div class="row" style="margin-top:10px"><button class="btn" type="button" id="imp">Журналға енгізу</button></div></div>
    <div class="card"><h3>Нәтиже қалай келеді</h3><ul class="small" style="padding-left:1.2em;margin:0"><li>Оқушы «Менің кабинетім» бетінде «Мұғалімге жіберу» кодын көшіріп, сізге мессенджермен жібереді.</li><li>Telegram-боттағы «Нәтиже коды» да осында енгізіледі.</li><li>Бір оқушының жаңа коды ескісін жаңартады (аты мен сыныбы бойынша).</li><li>Ұйымыңыздың Team/Enterprise жоспарындағы оқушылар Contributor деңгейімен кірсе, нәтижесі журналға өзі түседі.</li></ul></div></div>`;
    body.querySelector('#imp').onclick = async () => {
      const codes = body.querySelector('#codes').value.split(/\s+/).filter(Boolean); let ok = 0, bad = 0;
      for (const c of codes) { const o = PF.decode(c); if (!o) { bad++; continue; } try { await PF.T.putEntry(o); ok++; } catch (e) { bad++; } }
      cache = null; msg(el, `Енгізілді: ${ok}. ${bad ? 'Қате код: ' + bad + '.' : ''}`, bad > 0 && !ok); if (ok) body.querySelector('#codes').value = '';
    };
  }

  if (tab === 'classes') {
    body.innerHTML = `<div class="intro"><div><div class="row"><input type="text" id="cn" placeholder="Сынып атауы, мысалы 9А" style="max-width:260px"><button class="btn" type="button" id="cadd">Сынып қосу</button></div>
    <div style="margin-top:14px">${d.classes.length ? d.classes.map((c, i) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:10px 0"><span><b>${esc(c.name)}</b> <span class="muted small">коды: ${esc(c.code)}</span></span><button type="button" class="chip" data-i="${i}" style="cursor:pointer">Жою</button></div>`).join('') : '<p class="muted">Сынып әлі қосылмаған.</p>'}</div></div>
    <div class="card"><h3>Сынып коды</h3><p class="small" style="margin:0">Оқушы «Менің кабинетім» бетінде сыныбын тізімнен таңдайды немесе кодын енгізеді. Тапсырмалар мен журнал сыныптар бойынша сүзіледі.</p></div></div>`;
    const saveList = async list => { try { await PF.T.setDoc('settings/classes', { list }); reload(); } catch (e) { msg(el, 'Сақтау мүмкін болмады.', true); } };
    body.querySelector('#cadd').onclick = () => { const n = body.querySelector('#cn').value.trim().slice(0, 16); if (!n) return; if (d.classes.some(c => c.name === n)) return msg(el, 'Мұндай сынып бар.', true); const code = n.replace(/\s/g, '').toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(); saveList(d.classes.concat([{ name: n, code }])); };
    body.querySelectorAll('[data-i]').forEach(b => b.onclick = () => saveList(d.classes.filter((_, i) => i !== +b.dataset.i)));
  }

  if (tab === 'tasks') {
    const kinds = { test: ['Тақырып тесті', S.lessons.map(l => [l.n, l.n + '. ' + l.title])], problems: ['Есептер (5)', window.GEN.topics.map(n => [n, n + '. ' + S.lessons.find(l => l.n === n).title])], lesson: ['Сабақ материалы', S.lessons.map(l => [l.n, l.n + '. ' + l.title])], lab: ['Симуляция', L.MODELS.map(m => [m.id, m.t])], game: ['Ойын', GM.map(g => [g.id, g.t])], weekly: ['Апта сынағы', [['w', 'Осы аптаның сынағы']]], post: ['Қорытынды диагностика', [['post', 'Қорытынды диагностика (20 сұрақ)']]], pre: ['Бастапқы диагностика', [['pre', 'Бастапқы диагностика (20 сұрақ)']]] };
    const done = (a, e) => { if (a.kind === 'test') { const v = e.t?.[a.ref]; return v && (v[2] || 0) >= (a.created || 0) ? v[0] + '/' + v[1] : null; } if (a.kind === 'post') return e.post ? pct(e.post[0], e.post[1]) + '%' : null; if (a.kind === 'pre') return e.pre ? pct(e.pre[0], e.pre[1]) + '%' : null; return undefined; };
    body.innerHTML = `<div class="card"><h3>Жаңа тапсырма</h3><div class="grid g3" style="gap:12px"><label class="small muted">Сынып${clsSelect(d.classes.map(c => c.name), 'acls', 'Барлық сыныптар')}</label><label class="small muted">Түрі<select id="akind">${Object.entries(kinds).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select></label><label class="small muted">Не<select id="aref"></select></label><label class="small muted">Мерзімі<input type="date" id="adue"></label><label class="small muted" style="grid-column:span 2">Түсініктеме (міндетті емес)<input type="text" id="anote" maxlength="120" placeholder="Мысалы: 2 рет тапсырып, ең жақсы нәтиже"></label></div><button class="btn" type="button" id="aadd" style="margin-top:12px">Тапсырма беру</button></div>
    <h3 style="margin-top:20px">Берілген тапсырмалар</h3>${d.assignments.length ? d.assignments.sort((a, b) => (a.due || '').localeCompare(b.due || '')).map(a => { const rows = d.journal.filter(e => !a.cls || e.c === a.cls), dn = rows.map(e => done(a, e)), cnt = dn.filter(x => x).length; return `<div class="task"><h3><span>${esc(a.title)}</span><small>${a.due ? 'мерзімі: ' + esc(a.due) : ''}</small></h3><p class="small muted" style="margin:0 0 6px">${esc(a.cls || 'Барлық сыныптар')}${a.note ? ' · ' + esc(a.note) : ''}</p>${dn.every(x => x === undefined) ? '<p class="small" style="margin:0">Орындалуы оқушы кабинетінде белгіленеді.</p>' : `<p class="small" style="margin:0">Орындағаны (журнал бойынша): <b>${cnt} / ${rows.length}</b>${rows.length ? ' – ' + rows.map((e, i) => `${esc(e.n)}: ${dn[i] ? esc(dn[i]) : '—'}`).join(', ') : ''}</p>`}<button type="button" class="chip" data-del="${esc(a.id)}" style="cursor:pointer;margin-top:8px">Жою</button></div>`; }).join('') : '<p class="muted">Тапсырма жоқ.</p>'}`;
    const fill = () => { const k = body.querySelector('#akind').value; body.querySelector('#aref').innerHTML = kinds[k][1].map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join(''); };
    body.querySelector('#akind').onchange = fill; fill();
    body.querySelector('#aadd').onclick = async () => {
      const k = body.querySelector('#akind').value, ref = body.querySelector('#aref').value, opt = body.querySelector('#aref').selectedOptions[0].textContent;
      const a = { cls: body.querySelector('#acls').value, kind: k, ref, title: kinds[k][0] + ': ' + opt, due: body.querySelector('#adue').value || '', note: body.querySelector('#anote').value.trim().slice(0, 120) };
      try { await PF.T.add('assignments', a); reload(); } catch (e) { msg(el, 'Сақтау мүмкін болмады.', true); }
    };
    body.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { try { await PF.T.del('assignments', b.dataset.del); reload(); } catch (e) { msg(el, 'Жою мүмкін болмады.', true); } });
  }

  if (tab === 'questions') {
    body.innerHTML = `<div class="card"><h3>Өз сұрағыңызды қосу</h3><p class="small muted">Сұрақ таңдалған тақырып тестіне (В деңгейі) және «Астероид жаңбыры» ойынына қосылады.</p>
    <div class="grid g2" style="gap:12px"><label class="small muted">Тақырып<select id="qt">${S.lessons.map(l => `<option value="${l.n}">${l.n}. ${esc(l.title)}</option>`).join('')}</select></label><label class="small muted">Дұрыс жауап<select id="qa"><option value="0">1-нұсқа</option><option value="1">2-нұсқа</option><option value="2">3-нұсқа</option><option value="3">4-нұсқа</option></select></label></div>
    <label class="small muted" style="display:block;margin-top:10px">Сұрақ<input type="text" id="qq" maxlength="240"></label>
    <div class="grid g2" style="gap:12px;margin-top:10px">${[1, 2, 3, 4].map(i => `<label class="small muted">${i}-нұсқа<input type="text" id="qo${i}" maxlength="80"></label>`).join('')}</div>
    <label class="small muted" style="display:block;margin-top:10px">Түсініктеме<input type="text" id="qe" maxlength="240"></label><button class="btn" type="button" id="qadd" style="margin-top:12px">Сұрақты қосу</button></div>
    <h3 style="margin-top:20px">Қосылған сұрақтар (${d.custom.length})</h3>${d.custom.map(q => `<div class="task"><h3><span>${esc(q.topic)}-тақырып: ${esc(q.q)}</span></h3><p class="small" style="margin:0">${(q.o || []).map((o, i) => i === +q.a ? `<b style="color:var(--ok)">${esc(o)}</b>` : esc(o)).join(' · ')}</p><button type="button" class="chip" data-del="${esc(q.id)}" style="cursor:pointer;margin-top:8px">Жою</button></div>`).join('') || '<p class="muted">Әзірге жоқ.</p>'}`;
    body.querySelector('#qadd').onclick = async () => {
      const g = id => body.querySelector(id).value.trim(), o = [1, 2, 3, 4].map(i => g('#qo' + i)).filter(Boolean), a = +g('#qa');
      if (!g('#qq') || o.length < 2 || a >= o.length) return msg(el, 'Сұрақты, кемінде 2 нұсқаны және дұрыс жауапты толтырыңыз.', true);
      try { await PF.T.add('custom', { topic: +g('#qt'), q: g('#qq'), o, a, e: g('#qe') }); reload(); } catch (e) { msg(el, 'Сақтау мүмкін болмады.', true); }
    };
    body.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { try { await PF.T.del('custom', b.dataset.del); reload(); } catch (e) { msg(el, 'Жою мүмкін болмады.', true); } });
  }

  if (tab === 'pilot') {
    const rows = rowsFor(d.journal).filter(e => e.pre && e.post), avg = k => rows.length ? rows.reduce((s, e) => s + pct(e[k][0], e[k][1]), 0) / rows.length : 0;
    const a1 = avg('pre'), a2 = avg('post'), g = a1 < 100 ? (a2 - a1) / (100 - a1) : 0;
    body.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px">${clsSelect(allCls)}<button class="btn ghost" type="button" id="pxl">Есепті Excel-ге жүктеу</button></div>
    <div class="out" style="margin-bottom:16px"><div><small>Екі диагностиканы да тапсырғандар</small><b>${rows.length}</b></div><div><small>Бастапқы, орташа</small><b>${Math.round(a1)}%</b></div><div><small>Қорытынды, орташа</small><b>${Math.round(a2)}%</b></div><div><small>Нормаланған өсім g</small><b>${rows.length ? g.toFixed(2).replace('.', ',') : '—'}</b></div></div>
    ${rows.length ? `<div class="card">${rows.map(e => { const p1 = pct(e.pre[0], e.pre[1]), p2 = pct(e.post[0], e.post[1]); return `<div style="margin:10px 0"><div class="row" style="justify-content:space-between"><b class="small">${esc(e.n)} <span class="muted">${esc(e.c)}</span></b><span class="small">${p1}% → ${p2}%</span></div><div style="position:relative;height:12px;background:var(--bg2);border-radius:6px;margin-top:4px"><i style="position:absolute;left:0;top:0;bottom:0;width:${p2}%;background:var(--ok);opacity:.55;border-radius:6px"></i><i style="position:absolute;left:0;top:3px;bottom:3px;width:${p1}%;background:var(--gold);border-radius:6px"></i></div></div>`; }).join('')}<p class="small muted" style="margin:10px 0 0">Сары – бастапқы, жасыл – қорытынды. g = (соңғы − бастапқы)/(100 − бастапқы): 0,3-тен жоғары – орташа, 0,7-ден жоғары – жоғары тиімділік (Хейк әдісі).</p></div>` : '<div class="card"><p style="margin:0">Апробация үшін сабақ басында оқушыларға «Бастапқы диагностика», курс соңында «Қорытынды диагностика» тапсырмасын беріңіз (Тапсырмалар бөлімі). Екі нәтиже де журналға түскенде, осы жерде салыстыру шығады.</p></div>'}`;
    body.querySelector('#tcls').onchange = e => { clsF = e.target.value; render(el); };
    body.querySelector('#pxl').onclick = async () => { try { await PF.xlsx('Astro_bilim_aprobacia.xlsx', [['Апробация', [['Аты-жөні', 'Сынып', 'Бастапқы %', 'Қорытынды %', 'Өсім, п.п.']].concat(rows.map(e => [e.n, e.c, pct(e.pre[0], e.pre[1]), pct(e.post[0], e.post[1]), pct(e.post[0], e.post[1]) - pct(e.pre[0], e.pre[1])]), [[], ['Орташа', '', Math.round(a1), Math.round(a2), Math.round(a2 - a1)], ['Нормаланған өсім g', '', '', '', +g.toFixed(2)]])]]); } catch (e) { msg(el, 'Жүктеу бұл жерде қолжетімсіз.', true); } };
  }

  if (tab === 'stats') {
    const rows = rowsFor(d.journal), avg = S.lessons.map(l => { const v = rows.map(e => e.t?.[l.n]).filter(Boolean); return [l, v.length, v.length ? v.reduce((s, x) => s + pct(x[0], x[1]), 0) / v.length : 0]; });
    const miss = {}; rows.forEach(e => Object.entries(e.w || {}).forEach(([n, arr]) => arr.forEach(i => { const k = n + ':' + i; miss[k] = (miss[k] || 0) + 1; })));
    const top = Object.entries(miss).sort((a, b) => b[1] - a[1]).slice(0, 12);
    body.innerHTML = `<div class="row" style="margin-bottom:12px">${clsSelect(allCls)}</div><div class="intro"><div class="card"><h3>Тақырыптар бойынша орташа нәтиже</h3>${avg.map(([l, c, p]) => `<div class="row" style="flex-wrap:nowrap;margin:8px 0;gap:10px"><span class="small" style="width:46%;flex:none">${l.n}. ${esc(l.title)}</span><div class="meter"><i style="width:${p}%;background:${p >= 70 ? 'var(--ok)' : p >= 50 ? 'var(--gold)' : 'var(--bad)'}"></i></div><span class="small" style="width:5.4em;flex:none;text-align:right">${c ? Math.round(p) + '% (' + c + ')' : '–'}</span></div>`).join('')}</div>
    <div class="card"><h3>Ең көп қате жіберілген сұрақтар</h3>${top.length ? top.map(([k, c]) => { const [n, i] = k.split(':'), q = QB[n]?.[i]; return q ? `<div style="border-bottom:1px solid var(--line);padding:8px 0"><span class="small muted">${n}-тақырып · ${c} оқушы</span><div class="small">${esc(q[0])}</div></div>` : ''; }).join('') : '<p class="muted small">Дерек жоқ.</p>'}<p class="small muted" style="margin:10px 0 0">Осы сұрақтар бойынша сабақта қайталау немесе ЖИ-көмекшімен қосымша түсіндіру ұсынылады.</p></div></div>`;
    body.querySelector('#tcls').onchange = e => { clsF = e.target.value; render(el); };
  }

  if (tab === 'board') {
    let b = []; try { b = await PF.T.board(); } catch (e) { }
    const rows = rowsFor(d.journal).filter(e => e.x != null).sort((a, b) => b.x - a.x);
    body.innerHTML = `<div class="intro"><div class="card"><h3>Рейтингті жариялау</h3><p class="small">Журналдағы оқушылардың XP ұпайы бойынша рейтинг кестесін «Рейтинг» бетінде көрсетеді. Аты-жөні толық емес, тек аты мен тегінің бас әрпі жарияланады.</p><div class="row">${clsSelect(allCls)}<button class="btn" type="button" id="bpub">Жариялау (${rows.length})</button><button class="btn ghost" type="button" id="bclr">Рейтингті тазалау</button></div></div>
    <div class="card"><h3>Қазіргі рейтинг (${b.length})</h3>${b.sort((x, y) => y.xp - x.xp).slice(0, 15).map((r, i) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:6px 0"><span>${i + 1}. ${esc(r.nick)} <span class="muted small">${esc(r.cls)}</span></span><b>${r.xp} XP</b></div>`).join('') || '<p class="muted small">Бос.</p>'}</div></div>`;
    body.querySelector('#tcls').onchange = e => { clsF = e.target.value; render(el); };
    const short = n => { const p = String(n).trim().split(/\s+/); return (p[0] || 'Оқушы') + (p[1] ? ' ' + p[1][0] + '.' : ''); };
    body.querySelector('#bpub').onclick = async () => { try { await PF.T.publishBoard(rows.map(e => ({ key: e.key, nick: short(e.n), cls: e.c || '', xp: e.x }))); render(el); msg(el, 'Рейтинг жарияланды.'); } catch (e) { msg(el, 'Жариялау мүмкін болмады.', true); } };
    body.querySelector('#bclr').onclick = async () => { try { await PF.T.clearBoard(b.map(r => r.id)); render(el); } catch (e) { msg(el, 'Тазалау мүмкін болмады.', true); } };
  }

  if (tab === 'notice') {
    body.innerHTML = `<div class="card"><h3>Сайттың жоғарғы жолағындағы хабарландыру</h3><input type="text" id="nt" maxlength="160" value="${esc(d.notice)}" placeholder="Мысалы: 5 желтоқсанға дейін 8-тақырып тестін тапсырыңыздар!"><div class="row" style="margin-top:12px"><button class="btn" type="button" id="nsave">Сақтау</button><button class="btn ghost" type="button" id="nclr">Әдепкі мәтінге қайтару</button></div></div>`;
    const put = async v => { try { await PF.T.setDoc('settings/site', { notice: v }); await PF.loadShared(true); window.dispatchEvent(new Event('pf-shared')); msg(el, 'Сақталды.'); } catch (e) { msg(el, 'Сақтау мүмкін болмады.', true); } };
    body.querySelector('#nsave').onclick = () => put(body.querySelector('#nt').value.trim());
    body.querySelector('#nclr').onclick = () => { body.querySelector('#nt').value = ''; put(''); };
  }
}
return { render };
})();
