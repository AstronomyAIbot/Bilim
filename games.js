window.GAMES = (() => {
const L = window.LAB, num = L.num, C = { sky: '#38c3e2', sky2: '#7ad9ee', gold: '#f4c84a', ink: '#eaf4f7', mut: '#a3bfca', bg: '#04131a', ok: '#5fd39a', bad: '#ff7a6b' };
const KEY = 'astro_bilim_v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const save = d => { if (window.PF) return window.PF.save(d); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } };
const best = (id, v, lower) => { const d = load(); d.games = d.games || {}; d.gameTs = d.gameTs || {}; const o = d.games[id]; const isNew = v != null && (o == null || (lower ? v < o : v > o)); if (isNew) d.games[id] = v; if (v != null) d.gameTs[id] = Date.now(); save(d); return { best: isNew ? v : o, isNew }; };
const getBest = id => (load().games || {})[id];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const { dot, label, canvas, loop } = L;
const msgBox = (h, html, cls = '') => { const m = h.querySelector('.gmsg'); m.className = 'gmsg note ' + cls; m.innerHTML = html; };

/* ---------- 1. Ньютон зеңбірегі ---------- */
function orbit(h) {
  const GM = 398600.44, R = 6371, r0 = R + 400, vc = Math.sqrt(GM / r0), ve = Math.SQRT2 * vc;
  const M = [
    { t: 'Серікті орбитаға шығар', d: 'Серік Жерге құламай, кемінде бір рет айналып шықсын.', ok: o => o.bound && o.rp > R + 80 },
    { t: 'Дөңгелек орбита', d: 'Эксцентриситеті 0,03-тен кіші орбита құр (KazSat немесе ХҒС сияқты).', ok: o => o.bound && o.rp > R + 80 && o.e < 0.03 },
    { t: 'Биік эллипс', d: 'Апогей биіктігі 10 000 км-ден асатын, бірақ Жерге оралатын орбита құр.', ok: o => o.bound && o.ra - R > 10000 },
    { t: 'Жер тартылысынан шық', d: 'Серікті Жердің тартылысынан мүлдем шығарып жібер (екінші ғарыштық жылдамдық).', ok: o => !o.bound }
  ];
  let mi = 0, v = 6.5, shot = null, tries = 0, done = (load().orbitDone || 0);
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:420px"></div></div>
  <div class="ctl"><div class="card" style="padding:14px"><small class="muted" id="or-n"></small><h3 id="or-t" style="margin:4px 0"></h3><p class="small" id="or-d" style="margin:0"></p></div>
  <label>Ұшыру жылдамдығы v = <b id="or-vv"></b> км/с<input type="range" id="or-v" min="4" max="12" step="0.01"></label>
  <div class="row"><button class="btn" type="button" id="or-go">Ату</button><button class="btn ghost" type="button" id="or-nx" hidden>Келесі миссия →</button></div>
  <div class="gmsg note">Тау басы 400 км биіктікте (Ньютонның ойша тәжірибесі). Зеңбірек көлденең атады.</div>
  <div class="out"><div><small>Эксцентриситет</small><b id="or-e">—</b></div><div><small>Перигей / апогей биіктігі</small><b id="or-pa" style="white-space:normal;font-size:16px">—</b></div></div>
  <p class="small muted">Кеңес: 400 км биіктікте дөңгелек орбитаға v = √(GM/r) қажет. Миссияларды кезекпен орында.</p></div></div>`;
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  const setM = () => { const m = M[mi]; $('#or-n').textContent = 'Миссия ' + (mi + 1) + ' / ' + M.length; $('#or-t').textContent = m.t; $('#or-d').textContent = m.d; $('#or-nx').hidden = true; tries = 0; };
  const orbitOf = vv => { const eps = vv * vv / 2 - GM / r0, hm = r0 * vv, e = Math.sqrt(Math.max(0, 1 + 2 * eps * hm * hm / (GM * GM))); if (eps >= 0) return { bound: false, e, rp: r0, ra: Infinity }; const a = -GM / (2 * eps); return { bound: true, e, a, rp: a * (1 - e), ra: a * (1 + e), T: 2 * Math.PI * Math.sqrt(a ** 3 / GM) }; };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const view = shot ? shot.view : r0 * 1.45, sc = Math.min(W, H) / 2 / view * 0.92, cx = W / 2, cy = H / 2;
    const g = ctx.createRadialGradient(cx - R * sc * .3, cy - R * sc * .3, 2, cx, cy, R * sc); g.addColorStop(0, '#6fc0ff'); g.addColorStop(.6, '#1d6f9a'); g.addColorStop(1, '#0a2a3a');
    ctx.beginPath(); ctx.arc(cx, cy, R * sc, 0, 7); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 40 * sc * 8, cy - R * sc); ctx.lineTo(cx, cy - r0 * sc); ctx.lineTo(cx + 40 * sc * 8, cy - R * sc); ctx.fillStyle = '#5b6b5a'; ctx.fill();
    ctx.fillStyle = '#cfe3ea'; ctx.fillRect(cx - 4, cy - r0 * sc - 10, 22, 7);
    if (shot) {
      ctx.beginPath(); shot.trail.forEach(([x, y], i) => i ? ctx.lineTo(cx + x * sc, cy - y * sc) : ctx.moveTo(cx + x * sc, cy - y * sc)); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
      if (!shot.boom) dot(ctx, cx + shot.x * sc, cy - shot.y * sc, 5, '#fff', 10);
      else { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; dot(ctx, cx + shot.x * sc + Math.cos(a) * 9, cy - shot.y * sc + Math.sin(a) * 9, 3, C.bad); } }
    }
    label(ctx, 'Жер', cx, cy + 5, '#eaf4f7', 'center', 14);
  };
  const st = canvas(fig, draw);
  const upd = () => { $('#or-v').value = v; $('#or-vv').textContent = num(v, 2); };
  const finish = o => {
    const m = M[mi], ok = m.ok(o); tries++;
    $('#or-e').textContent = num(o.e, 3);
    $('#or-pa').textContent = o.bound ? num(Math.max(0, o.rp - R), 0) + ' км / ' + num(o.ra - R, 0) + ' км' : 'Жерге оралмайды';
    if (ok) { msgBox(h, `<b>Миссия орындалды!</b> ${!o.bound ? 'Жылдамдық екінші ғарыштық жылдамдықтан (≈ ' + num(ve, 2) + ' км/с) асты.' : o.e < 0.03 ? 'Дөңгелек орбита үшін v ≈ ' + num(vc, 2) + ' км/с.' : 'Серік эллипс бойымен айналады.'}`, ''); if (mi < M.length - 1) $('#or-nx').hidden = false; else msgBox(h, '<b>Барлық миссия орындалды!</b> Сен Ньютонның ойша тәжірибесін толық қайталадың.'); done = Math.max(done, mi + 1); const d = load(); d.orbitDone = done; d.games = d.games || {}; d.games.orbit = Math.max(d.games.orbit || 0, done); d.gameTs = d.gameTs || {}; d.gameTs.orbit = Date.now(); save(d); }
    else msgBox(h, (o.rp <= R ? '<b>Серік Жерге құлады.</b> Жылдамдықты арттыр.' : !o.bound ? '<b>Серік ғарышқа ұшып кетті.</b> Жылдамдықты азайт.' : '<b>Орбита шықты, бірақ миссия шарты орындалмады.</b>') + (tries >= 3 ? ` Кеңес: v₁ ≈ ${num(vc, 2)} км/с, v₂ ≈ ${num(ve, 2)} км/с (осы биіктікте).` : ''), 'bad');
  };
  $('#or-v').oninput = e => { v = +e.target.value; upd(); };
  $('#or-go').onclick = () => {
    const o = orbitOf(v);
    const view = !o.bound ? r0 * 4 : Math.max(r0 * 1.25, o.ra * 1.08);
    shot = { o, x: 0, y: r0, vx: v, vy: 0, trail: [[0, r0]], ang: 0, prev: Math.PI / 2, view, ts: o.bound ? Math.max(1200, o.T / 5) : 3000, boom: false, end: false };
    msgBox(h, 'Ұшып барады…');
  };
  $('#or-nx').onclick = () => { mi++; shot = null; setM(); msgBox(h, 'Жаңа миссия. Жылдамдықты таңда да, «Ату» бас.'); draw(st); };
  loop(fig, dt => {
    if (!shot || shot.end) { draw(st); return; }
    let sim = dt * shot.ts; const n = Math.ceil(sim / 5), d = sim / n;
    for (let i = 0; i < n; i++) {
      const r = Math.hypot(shot.x, shot.y), a = -GM / (r * r * r);
      shot.vx += a * shot.x * d / 2; shot.vy += a * shot.y * d / 2; shot.x += shot.vx * d; shot.y += shot.vy * d;
      const r2 = Math.hypot(shot.x, shot.y), a2 = -GM / (r2 * r2 * r2); shot.vx += a2 * shot.x * d / 2; shot.vy += a2 * shot.y * d / 2;
      const ang = Math.atan2(shot.y, shot.x); let da = ang - shot.prev; da = Math.atan2(Math.sin(da), Math.cos(da)); shot.ang += Math.abs(da); shot.prev = ang;
      if (r2 <= R) { shot.boom = true; shot.end = true; break; }
      if (shot.ang >= 2 * Math.PI || r2 > shot.view * 1.05) { shot.end = true; break; }
    }
    shot.trail.push([shot.x, shot.y]); if (shot.end) finish(shot.o);
    draw(st);
  });
  setM(); upd();
}

/* ---------- 2. Нысанаға дәл тиі ---------- */
function target(h) {
  const LV = [{ p: 'Жер', g: 9.8, d: 25 }, { p: 'Жер', g: 9.8, d: 60 }, { p: 'Марс', g: 3.71, d: 90 }, { p: 'Ай', g: 1.62, d: 150 }, { p: 'Жер', g: 9.8, d: 40, wall: [20, 12] }];
  let li = 0, v = 15, al = 40, tries = 0, score = 0, arrow = null, traces = [];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:360px"></div></div>
  <div class="ctl"><div class="card" style="padding:14px"><small class="muted" id="tg-n"></small><h3 id="tg-t" style="margin:4px 0"></h3><p class="small" id="tg-d" style="margin:0"></p></div>
  <label>Бұрыш α = <b id="tg-av"></b>°<input type="range" id="tg-a" min="5" max="85" step="1"></label>
  <label>Жылдамдық v₀ = <b id="tg-vv"></b> м/с<input type="range" id="tg-v" min="5" max="45" step="0.5"></label>
  <div class="row"><button class="btn" type="button" id="tg-go">Ату</button><button class="btn ghost" type="button" id="tg-nx" hidden>Келесі деңгей →</button></div>
  <div class="gmsg note">Нысанаға дәл тигіз. Әр деңгейде ұпай: 1-атыс 100, 2-атыс 75, 3-атыс 50.</div>
  <div class="out"><div><small>Ұпай</small><b id="tg-s">0</b></div><div><small>Үздік нәтиже</small><b id="tg-b">${getBest('target') ?? '—'}</b></div></div>
  <details><summary>Формула-кеңес</summary><p class="small" style="margin:6px 0 0">L = v₀²·sin2α / g. Мысалы, Жерде 45° бұрышпен 25 м-ге жету үшін v₀ = √(gL) ≈ 15,7 м/с.</p></details></div></div>`;
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  const tol = () => Math.max(1.5, LV[li].d * 0.03);
  const setL = () => { const l = LV[li]; $('#tg-n').textContent = 'Деңгей ' + (li + 1) + ' / ' + LV.length; $('#tg-t').textContent = l.p + ': нысана ' + l.d + ' м қашықтықта'; $('#tg-d').textContent = 'g = ' + num(l.g, 2) + ' м/с²' + (l.wall ? '. Жолда ' + l.wall[0] + ' м-де биіктігі ' + l.wall[1] + ' м қабырға бар.' : '.'); tries = 0; traces = []; $('#tg-nx').hidden = true; $('#tg-go').disabled = false; };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const l = LV[li], maxX = l.d * 1.3, sc = Math.min((W - 50) / maxX, (H - 60) / (maxX * 0.55)), X = x => 30 + x * sc, Y = y => H - 40 - y * sc;
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, l.p === 'Марс' ? '#3a1f1a' : l.p === 'Ай' ? '#06121a' : '#0d4460'); sky.addColorStop(1, l.p === 'Марс' ? '#7a3a26' : l.p === 'Ай' ? '#1a2a33' : '#1b6f8f'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = l.p === 'Марс' ? '#8a4a30' : l.p === 'Ай' ? '#5a646a' : '#2c5a35'; ctx.fillRect(0, H - 40, W, 40);
    for (let x = 0; x <= maxX; x += maxX > 120 ? 25 : 10) label(ctx, x + ' м', X(x), H - 14, '#eaf4f7', 'center', 12);
    if (l.wall) { ctx.fillStyle = '#9aa9b0'; ctx.fillRect(X(l.wall[0]) - 4, Y(l.wall[1]), 8, l.wall[1] * sc); }
    const tx = X(l.d), tw = tol() * sc; [[1, C.ink], [0.66, C.bad], [0.33, C.ink]].forEach(([k, col]) => { ctx.fillStyle = col; ctx.fillRect(tx - tw * k, H - 46, tw * 2 * k, 8); });
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(tx - 2, H - 70, 4, 26); ctx.fillStyle = C.bad; ctx.fillRect(tx + 2, H - 70, 16, 10);
    traces.forEach(tr => { ctx.beginPath(); tr.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]); });
    ctx.save(); ctx.translate(X(0), Y(0)); ctx.rotate(-al * Math.PI / 180); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 18, -1.2, 1.2); ctx.stroke(); ctx.restore();
    dot(ctx, X(0) - 6, Y(0) - 22, 6, '#eaf4f7'); ctx.fillStyle = '#eaf4f7'; ctx.fillRect(X(0) - 8, Y(0) - 16, 5, 16);
    if (arrow) { ctx.beginPath(); arrow.tr.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke(); const [x, y] = arrow.tr[arrow.tr.length - 1]; dot(ctx, X(x), Y(y), 4, '#fff'); }
  };
  const st = canvas(fig, draw);
  const upd = () => { $('#tg-a').value = al; $('#tg-v').value = v; $('#tg-av').textContent = al; $('#tg-vv').textContent = num(v, 1); draw(st); };
  $('#tg-a').oninput = e => { al = +e.target.value; upd(); }; $('#tg-v').oninput = e => { v = +e.target.value; upd(); };
  $('#tg-go').onclick = () => { if (arrow) return; const a = al * Math.PI / 180; arrow = { vx: v * Math.cos(a), vy: v * Math.sin(a), x: 0, y: 0, t: 0, tr: [[0, 0]] }; $('#tg-go').disabled = true; };
  $('#tg-nx').onclick = () => { li++; setL(); msgBox(h, 'Жаңа деңгей!'); upd(); };
  loop(fig, dt => {
    if (!arrow) return; const l = LV[li], sp = Math.max(1, l.d / 30);
    for (let i = 0; i < 6; i++) {
      const d = dt * sp / 6, px = arrow.x; arrow.vy -= l.g * d; arrow.x += arrow.vx * d; arrow.y += arrow.vy * d; arrow.tr.push([arrow.x, Math.max(0, arrow.y)]);
      const hitWall = l.wall && px < l.wall[0] && arrow.x >= l.wall[0] && arrow.y < l.wall[1];
      if (arrow.y <= 0 || hitWall) {
        tries++; const dx = arrow.x - l.d, hit = !hitWall && Math.abs(dx) <= tol();
        if (hit) { const p = [100, 75, 50][tries - 1] || 25; score += p; $('#tg-s').textContent = score; msgBox(h, `<b>Дәл тиді!</b> +${p} ұпай.`); if (li < LV.length - 1) $('#tg-nx').hidden = false; else { const b = best('target', score); $('#tg-b').textContent = b.best; msgBox(h, `<b>Ойын аяқталды!</b> Барлық ұпай: ${score}${b.isNew ? ' – жаңа рекорд!' : ''}`); } }
        else { msgBox(h, hitWall ? '<b>Қабырғаға тиді.</b> Бұрышты үлкейт.' : `<b>Жебе ${num(arrow.x, 1)} м-ге түсті</b> (нысана ${l.d} м). ${dx < 0 ? 'Алысырақ ат.' : 'Жақынырақ ат.'}${tries >= 3 ? ' Кеңесті ашып қара.' : ''}`, 'bad'); $('#tg-go').disabled = false; }
        traces.push(arrow.tr); if (traces.length > 3) traces.shift(); arrow = null; if (hit) $('#tg-go').disabled = true; break;
      }
    }
    draw(st);
  });
  setL(); upd();
}

/* ---------- 3. Шоқжұлдызды құрастыр ---------- */
function constellation(h) {
  const S = L.PST;
  const CS = [
    { n: 'Жетіқарақшы (Үлкен аю)', s: ['dubhe', 'merak', 'phecda', 'megrez', 'alioth', 'mizar', 'alkaid'], f: 'Шөміштің шетіндегі Мерак пен Дубхе арқылы түзу жүргізіп, ара қашықтығын шамамен 5 есе созсақ, Темірқазыққа жетеміз.' },
    { n: 'Кассиопея', s: ['caph', 'schedar', 'gamC', 'ruchbah', 'segin'], f: 'W пішінді шоқжұлдыз Темірқазықтың Жетіқарақшыға қарама-қарсы жағында орналасқан.' },
    { n: 'Кіші аю', s: ['polaris', 'yildun', 'epsU', 'zetU', 'etaU', 'kochab', 'pherkad'], f: 'Темірқазық – Кіші аюдың ең жарық жұлдызы, дүние полюсіне 1°-тан жақын.' },
    { n: 'Лира', s: ['vega', 'zetL', 'sheliak', 'sulafat', 'delL'], f: 'Вега – аспандағы ең жарық жұлдыздардың бірі. Шамамен 12 мың жылдан кейін полюс жұлдызы болады.' },
    { n: 'Аққу', s: ['deneb', 'sadr', 'gienah', 'delC', 'albireo'], f: 'Денеб Вега және Альтаирмен бірге «Жазғы үшбұрышты» құрайды.' },
    { n: 'Арыстан', s: ['regulus', 'algieba', 'zosma', 'denebola', 'chertan'], f: 'Регул эклиптикаға өте жақын жатыр, сондықтан оның маңынан Ай мен ғаламшарлар жиі өтеді.' },
    { n: 'Орион', s: ['betel', 'rigel', 'bellatrix', 'mintaka', 'alnilam', 'alnitak', 'saiph'], f: 'Бетельгейзе – қызыл алып, Ригель – көгілдір алып жұлдыз. Орион – қыс аспанының көркі.' }
  ];
  let ci = 0, drawn = [], sel = null, t0 = 0, total = 0, flash = 0, pts = [], ghost = 0, finished = false;
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:420px;cursor:pointer"></div></div>
  <div class="ctl"><div class="card" style="padding:14px"><small class="muted" id="cs-k"></small><h3 id="cs-n" style="margin:4px 0"></h3><p class="small" style="margin:0">Жұлдызды бас, сосын онымен сызықпен қосылатын келесі жұлдызды бас. Шоқжұлдыздың барлық сызығын қалпына келтір.</p></div>
  <div class="out"><div><small>Сызықтар</small><b id="cs-p"></b></div><div><small>Уақыт</small><b id="cs-t">0 с</b></div><div><small>Үздік уақыт (барлығы)</small><b id="cs-b">${getBest('constellation') != null ? getBest('constellation') + ' с' : '—'}</b></div></div>
  <div class="row"><button class="btn ghost" type="button" id="cs-h">Көмек (+5 с)</button><button class="btn" type="button" id="cs-nx" hidden>Келесі шоқжұлдыз →</button></div>
  <div class="gmsg note">Жарық жұлдыздар – шоқжұлдыздың жұлдыздары. Сызықтың ретін өзің тап.</div></div></div>`;
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  const lines = () => { const set = new Set(CS[ci].s); return L.PLINES.filter(([a, b]) => set.has(a) && set.has(b)); };
  const proj = () => {
    const ids = CS[ci].s, v = ids.map(id => { const a = S[id][0] * 15 * Math.PI / 180, d = S[id][1] * Math.PI / 180; return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)]; });
    const c = [0, 1, 2].map(k => v.reduce((s2, p) => s2 + p[k], 0)), n = Math.hypot(...c), a0 = Math.atan2(c[1], c[0]), d0 = Math.asin(c[2] / n);
    return ids.map((id, i) => { const a = S[id][0] * 15 * Math.PI / 180, d = S[id][1] * Math.PI / 180, cc = Math.sin(d0) * Math.sin(d) + Math.cos(d0) * Math.cos(d) * Math.cos(a - a0); return { id, m: S[id][2], x: -Math.cos(d) * Math.sin(a - a0) / cc, y: (Math.cos(d0) * Math.sin(d) - Math.sin(d0) * Math.cos(d) * Math.cos(a - a0)) / cc }; });
  };
  let bg = [];
  const setC = () => { const p = proj(); pts = p; let r = 7 + ci * 13; bg = Array.from({ length: 34 }, () => { r = r * 16807 % 2147483647; const x = r / 2147483647; r = r * 16807 % 2147483647; return [x, r / 2147483647, 0.5 + (r % 7) / 10]; }); drawn = []; sel = null; t0 = performance.now(); finished = false; $('#cs-k').textContent = (ci + 1) + ' / ' + CS.length; $('#cs-n').textContent = CS[ci].n; $('#cs-nx').hidden = true; msgBox(h, 'Жарық жұлдыздар – шоқжұлдыздың жұлдыздары. Сызықтың ретін өзің тап.'); prog(); };
  const prog = () => { $('#cs-p').textContent = drawn.length + ' / ' + lines().length; };
  let geo = null;
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y), minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const sc = Math.min((W - 80) / (maxx - minx || 1), (H - 80) / (maxy - miny || 1)), ox = W / 2 - (minx + maxx) / 2 * sc, oy = H / 2 + (miny + maxy) / 2 * sc;
    geo = { P: p => [ox + p.x * sc, oy - p.y * sc] };
    bg.forEach(([x, y, r]) => dot(ctx, x * W, y * H, r, 'rgba(234,244,247,.45)'));
    if (ghost > 0) lines().forEach(([a, b]) => { const A = geo.P(pts.find(p => p.id === a)), B = geo.P(pts.find(p => p.id === b)); ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.strokeStyle = `rgba(122,217,238,${Math.min(0.5, ghost)})`; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]); });
    drawn.forEach(([a, b]) => { const A = geo.P(pts.find(p => p.id === a)), B = geo.P(pts.find(p => p.id === b)); ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.strokeStyle = C.sky; ctx.lineWidth = 2.5; ctx.stroke(); });
    pts.forEach(p => { const [x, y] = geo.P(p); const r = Math.max(3, 8 - p.m * 1.4); if (sel === p.id) { ctx.beginPath(); ctx.arc(x, y, r + 8, 0, 7); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke(); } dot(ctx, x, y, r, p.m < 1 ? '#fff6d8' : '#eaf4f7', 12); });
    if (flash > 0) { ctx.fillStyle = `rgba(255,122,107,${flash * 0.25})`; ctx.fillRect(0, 0, W, H); }
  };
  const st = canvas(fig, draw);
  fig.addEventListener('click', e => {
    if (!geo || finished) return; const r = fig.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let near = null, bd = 30; pts.forEach(p => { const [x, y] = geo.P(p), d = Math.hypot(x - mx, y - my); if (d < bd) { bd = d; near = p.id; } });
    if (!near) return;
    if (!sel || sel === near) { sel = sel === near ? null : near; return; }
    const L2 = lines(), ok = L2.find(([a, b]) => (a === sel && b === near) || (b === sel && a === near)), dup = drawn.find(([a, b]) => (a === sel && b === near) || (b === sel && a === near));
    if (ok && !dup) { drawn.push(ok); sel = near; prog(); if (drawn.length === L2.length) { finished = true; const t = Math.round((performance.now() - t0) / 1000); total += t; msgBox(h, `<b>${CS[ci].n} дайын!</b> ${t} с. ${CS[ci].f}`); if (ci < CS.length - 1) $('#cs-nx').hidden = false; else { const b = best('constellation', total, true); $('#cs-b').textContent = b.best + ' с'; msgBox(h, `<b>Барлық 7 шоқжұлдыз құрастырылды!</b> Жалпы уақыт: ${total} с${b.isNew ? ' – жаңа рекорд!' : ''}. ${CS[ci].f}`); } } }
    else if (!dup) { flash = 1; sel = near; }
  });
  $('#cs-h').onclick = () => { ghost = 1.6; t0 -= 5000; };
  $('#cs-nx').onclick = () => { ci++; setC(); };
  loop(fig, dt => { if (flash > 0) flash = Math.max(0, flash - dt * 3); if (ghost > 0) ghost = Math.max(0, ghost - dt); if (!finished) $('#cs-t').textContent = Math.round((performance.now() - t0) / 1000) + ' с'; draw(st); });
  setC();
}

/* ---------- 4. Ғаламшарлар парады ---------- */
function planets(h) {
  const P = [['Меркурий', 4879, '#b9b2a8'], ['Шолпан', 12104, '#e8c77a'], ['Жер', 12742, '#4fb0ff'], ['Марс', 6779, '#e0704a'], ['Юпитер', 139820, '#d9a66b'], ['Сатурн', 116460, '#e6d08a'], ['Уран', 50724, '#8fe0e6'], ['Нептун', 49244, '#5b7cff']];
  const RD = [{ t: 'Күннен қашықтығы бойынша', d: 'Ғаламшарларды Күнге ең жақынынан ең алысына қарай ретте.', key: P.map(p => p[0]) }, { t: 'Өлшемі бойынша', d: 'Ғаламшарларды ең үлкенінен ең кішісіне қарай ретте (диаметрі бойынша).', key: P.slice().sort((a, b) => b[1] - a[1]).map(p => p[0]) }];
  let ri = 0, order = [], sel = null, checks = 0, score = 0;
  h.innerHTML = `<div class="card" style="padding:16px"><small class="muted" id="pp-k"></small><h3 id="pp-t" style="margin:4px 0"></h3><p class="small" id="pp-d" style="margin:0"></p></div>
  <div id="pp-row" style="display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px;margin:16px 0;align-items:end"></div>
  <div class="row"><button class="btn" type="button" id="pp-c">Тексеру</button><button class="btn ghost" type="button" id="pp-nx" hidden>Келесі раунд →</button><span class="small muted">Екі ғаламшарды кезекпен бассаң, орындары ауысады.</span></div>
  <div class="gmsg note" style="margin-top:12px">Реттеп болған соң «Тексеру» бас.</div>
  <div class="out" style="margin-top:12px;max-width:520px"><div><small>Ұпай</small><b id="pp-s">0</b></div><div><small>Үздік нәтиже</small><b id="pp-b">${getBest('planets') ?? '—'}</b></div></div>
  <style>#pp-row button{display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--card);border:2px solid var(--line);border-radius:12px;padding:10px 2px;color:var(--ink);cursor:pointer;min-height:120px;justify-content:flex-end}#pp-row button.sel{border-color:var(--gold)}#pp-row button.ok{border-color:var(--ok)}#pp-row button.no{border-color:var(--bad)}#pp-row span{font-size:13px;overflow-wrap:anywhere;text-align:center}#pp-row i{display:block;border-radius:50%}@media(max-width:640px){#pp-row{grid-template-columns:repeat(4,minmax(0,1fr))!important}}</style>`;
  const $ = s => h.querySelector(s);
  const render = marks => { $('#pp-row').innerHTML = order.map((n, i) => { const p = P.find(x => x[0] === n), d = Math.round(10 + Math.sqrt(p[1] / 139820) * 50); return `<button type="button" data-i="${i}" class="${sel === i ? 'sel' : ''} ${marks ? (marks[i] ? 'ok' : 'no') : ''}"><i style="width:${d}px;height:${d}px;background:radial-gradient(circle at 35% 35%,#fff8,${p[2]} 45%,#0006)"></i><span>${n}</span></button>`; }).join(''); h.querySelectorAll('#pp-row button').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (sel == null) sel = i; else { [order[sel], order[i]] = [order[i], order[sel]]; sel = null; } render(); }); };
  const setR = () => { const r = RD[ri]; $('#pp-k').textContent = 'Раунд ' + (ri + 1) + ' / ' + RD.length; $('#pp-t').textContent = r.t; $('#pp-d').textContent = r.d; do { order = shuffle(P.map(p => p[0])); } while (order.join() === r.key.join()); sel = null; checks = 0; $('#pp-nx').hidden = true; $('#pp-c').disabled = false; render(); };
  $('#pp-c').onclick = () => {
    const key = RD[ri].key, marks = order.map((n, i) => n === key[i]), right = marks.filter(Boolean).length; checks++; render(marks);
    if (right === 8) { const p = Math.max(20, 100 - (checks - 1) * 20); score += p; $('#pp-s').textContent = score; $('#pp-c').disabled = true; if (ri < RD.length - 1) { msgBox(h, `<b>Дұрыс!</b> +${p} ұпай.${ri === 0 ? ' Еске сақта: «Меркурий, Шолпан, Жер, Марс – тасты; Юпитер, Сатурн, Уран, Нептун – алып».' : ''}`); $('#pp-nx').hidden = false; } else { const b = best('planets', score); $('#pp-b').textContent = b.best; msgBox(h, `<b>Жарайсың!</b> Барлық ұпай: ${score}${b.isNew ? ' – жаңа рекорд!' : ''}. Юпитердің диаметрі Жердікінен шамамен 11 есе үлкен.`); } }
    else msgBox(h, `${right} / 8 ғаламшар өз орнында. Қызыл жиектілердің орнын ауыстыр.`, 'bad');
  };
  $('#pp-nx').onclick = () => { ri++; setR(); msgBox(h, 'Жаңа раунд.'); };
  setR();
}

/* ---------- 5. Ғарыш жады ---------- */
function memory(h) {
  const POOL = [['Зенит', 'Төбедегі нүкте'], ['Надир', 'Аяқ астындағы нүкте'], ['Эклиптика', 'Күннің жылдық жолы'], ['Парсек', '3,26 жарық жылы'], ['1 а.б.', '≈ 150 млн км'], ['Перигелий', 'Күнге ең жақын нүкте'], ['Афелий', 'Күннен ең алыс нүкте'], ['v₁', '7,9 км/с'], ['v₂', '11,2 км/с'], ['Темірқазық', 'Полюске жақын жұлдыз'], ['Үркер', 'Жұлдыз шоғыры'], ['Жетіқарақшы', 'Үлкен аюдың 7 жұлдызы'], ['F = ma', 'Ньютонның II заңы'], ['T² = a³', 'Кеплердің III заңы'], ['Коперник', 'Гелиоцентрлік жүйе'], ['Байқоңыр', 'Ғарыш айлағы'], ['Сүмбіле', 'Сириус'], ['Ай', 'Жердің табиғи серігі'], ['Юпитер', 'Ең үлкен ғаламшар'], ['UTC+5', 'Қазақстан уақыты']];
  let cards = [], open = [], moves = 0, found = 0, t0 = 0, lock = false, timer = null;
  h.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="out" style="flex:1;max-width:560px"><div><small>Жүрістер</small><b id="mm-m">0</b></div><div><small>Табылды</small><b id="mm-f">0 / 8</b></div><div><small>Уақыт</small><b id="mm-t">0 с</b></div><div><small>Үздік (жүріс)</small><b id="mm-b">${getBest('memory') ?? '—'}</b></div></div><button class="btn ghost" type="button" id="mm-r">Жаңа ойын</button></div>
  <div id="mm-g" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;max-width:760px"></div>
  <div class="gmsg note" style="margin-top:12px;max-width:760px">Екі картаны аш: ұғым мен оның мағынасы сәйкес келсе, жұп ашық қалады.</div>
  <style>#mm-g button{aspect-ratio:4/3;border-radius:12px;border:1px solid var(--line);background:linear-gradient(135deg,#12364a,#0a2330);color:var(--ink);cursor:pointer;font-size:clamp(13px,1.8vw,16px);padding:6px;line-height:1.25}#mm-g button.op{background:#18394a;border-color:var(--sky)}#mm-g button.ok{background:#5fd39a22;border-color:var(--ok)}#mm-g button .b{color:var(--sky);font-size:24px}</style>`;
  const $ = s => h.querySelector(s);
  const render = () => { $('#mm-g').innerHTML = cards.map((c, i) => `<button type="button" data-i="${i}" class="${c.ok ? 'ok' : open.includes(i) ? 'op' : ''}">${c.ok || open.includes(i) ? c.t : '<span class="b">✦</span>'}</button>`).join(''); h.querySelectorAll('#mm-g button').forEach(b => b.onclick = () => flip(+b.dataset.i)); };
  const flip = i => {
    if (lock || cards[i].ok || open.includes(i)) return; if (!t0) { t0 = performance.now(); timer = setInterval(() => { if (!h.isConnected) return clearInterval(timer); $('#mm-t').textContent = Math.round((performance.now() - t0) / 1000) + ' с'; }, 500); }
    open.push(i); render();
    if (open.length === 2) {
      moves++; $('#mm-m').textContent = moves; const [a, b] = open;
      if (cards[a].p === cards[b].p) { cards[a].ok = cards[b].ok = true; open = []; found++; $('#mm-f').textContent = found + ' / 8'; render(); if (found === 8) { clearInterval(timer); const r = best('memory', moves, true); $('#mm-b').textContent = r.best; msgBox(h, `<b>Барлық жұп табылды!</b> ${moves} жүріс, ${Math.round((performance.now() - t0) / 1000)} с${r.isNew ? ' – жаңа рекорд!' : ''}.`); } }
      else { lock = true; setTimeout(() => { open = []; lock = false; render(); }, 900); }
    }
  };
  const start = () => { clearInterval(timer); const pick = shuffle(POOL).slice(0, 8); cards = shuffle(pick.flatMap((p, i) => [{ t: p[0], p: i }, { t: p[1], p: i }])); open = []; moves = 0; found = 0; t0 = 0; $('#mm-m').textContent = 0; $('#mm-f').textContent = '0 / 8'; $('#mm-t').textContent = '0 с'; msgBox(h, 'Екі картаны аш: ұғым мен оның мағынасы сәйкес келсе, жұп ашық қалады.'); render(); };
  $('#mm-r').onclick = start; start();
}

/* ---------- 6. Астероид жаңбыры ---------- */
function asteroids(h) {
  const QB = window.QB, S = window.SITE;
  const bank = sel => Object.entries(Object.fromEntries(Object.entries(QB).map(([n, qs]) => [n, qs.concat(window.PF ? window.PF.customFor(n) : [])]))).filter(([n]) => sel === 'all' || S.lessons.find(l => l.n === +n).mod === sel).flatMap(([n, qs]) => qs.filter(q => q[1].length === 4 && q[1].every(o => o.length <= 22)).map(q => ({ q, n: +n })));
  let pool = [], lives = 3, score = 0, dur = 9, row = null, on = false, streak = 0;
  h.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="out" style="flex:1;max-width:520px"><div><small>Ұпай</small><b id="as-s">0</b></div><div><small>Өмір</small><b id="as-l">♥♥♥</b></div><div><small>Үздік</small><b id="as-b">${getBest('asteroids') ?? '—'}</b></div></div>
  <div class="row"><select id="as-m" style="width:auto"><option value="all">Барлық тақырыптар</option>${S.modules.map(m => `<option value="${m.id}">${m.n}</option>`).join('')}</select><button class="btn" type="button" id="as-go">Бастау</button></div></div>
  <div id="as-a" style="position:relative;height:460px;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:radial-gradient(1px 1px at 20% 30%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 70% 60%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 40% 80%,#cef 50%,transparent 51%),linear-gradient(#04131a,#0a2a3a);background-size:170px 140px,230px 190px,190px 160px,100% 100%">
    <div id="as-q" style="position:absolute;left:12px;right:12px;top:10px;z-index:2;background:#061821dd;border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-weight:600;text-align:center">«Бастау» батырмасын бас. Сұраққа дұрыс жауап берген астероидты ол Жерге жеткенше атып түсір!</div>
    <div id="as-r" style="position:absolute;left:0;right:0;top:0;height:100%"></div>
    <div style="position:absolute;left:-10%;right:-10%;bottom:-120px;height:170px;border-radius:50%;background:radial-gradient(circle at 50% 20%,#6fc0ff,#1d6f9a 45%,#0a2a3a);box-shadow:0 0 40px #38c3e266"></div></div>
  <div class="gmsg note" style="margin-top:12px">Әр дұрыс жауап +10 ұпай және жылдамдықты арттырады. Қате жауап не уақыттың бітуі – бір өмір.</div>
  <style>#as-r .lane{position:absolute;top:0;width:25%;display:flex;justify-content:center}#as-r button{width:min(94%,150px);aspect-ratio:1.2;border:0;border-radius:46% 54% 50% 50%/55% 45% 55% 45%;background:radial-gradient(circle at 35% 30%,#a98a6d,#6b5442 55%,#3d3027);color:#fff;font-weight:600;font-size:14px;padding:8px;cursor:pointer;box-shadow:inset -6px -8px 0 #0004;text-shadow:0 1px 2px #000}#as-r button:hover{filter:brightness(1.2)}#as-r button.ok{background:radial-gradient(circle,#5fd39a,#1f6b48)}#as-r button.no{background:radial-gradient(circle,#ff7a6b,#7a2a22)}@media(max-width:520px){#as-r button{font-size:12px;padding:4px}}</style>`;
  const $ = s => h.querySelector(s);
  const hearts = () => $('#as-l').textContent = '♥'.repeat(lives) + '♡'.repeat(3 - lives);
  const next = () => {
    if (!pool.length) pool = shuffle(bank($('#as-m').value));
    const it = pool.pop(), q = it.q, ord = shuffle([0, 1, 2, 3]);
    $('#as-q').innerHTML = `<span class="small muted">${it.n}-тақырып</span><br>${q[0]}`;
    $('#as-r').innerHTML = ord.map((k, i) => `<div class="lane" style="left:${i * 25}%"><button type="button" data-k="${k}">${q[1][k]}</button></div>`).join('');
    row = { y: 0, q, t: 0, done: false };
    h.querySelectorAll('#as-r button').forEach(b => b.onclick = () => answer(+b.dataset.k, b));
  };
  const end = () => { on = false; row = null; const b = best('asteroids', score); $('#as-b').textContent = b.best; $('#as-q').innerHTML = `<b>Ойын аяқталды!</b> Ұпай: ${score}${b.isNew ? ' – жаңа рекорд!' : ''}`; $('#as-go').textContent = 'Қайта бастау'; $('#as-go').disabled = false; };
  const answer = (k, b) => {
    if (!row || row.done) return; row.done = true; const ok = k === row.q[2];
    h.querySelectorAll('#as-r button').forEach(x => { if (+x.dataset.k === row.q[2]) x.classList.add('ok'); });
    if (ok) { streak++; score += 10 + Math.max(0, Math.round((1 - row.t / dur) * 10)); dur = Math.max(4.5, dur - 0.35); msgBox(h, '<b>Дұрыс!</b> ' + row.q[3]); }
    else { if (b) b.classList.add('no'); lives--; streak = 0; hearts(); msgBox(h, (b ? '<b>Қате.</b> ' : '<b>Уақыт бітті.</b> ') + 'Дұрыс жауап: ' + row.q[1][row.q[2]] + '. ' + row.q[3], 'bad'); }
    $('#as-s').textContent = score;
    setTimeout(() => { if (!h.isConnected) return; if (lives <= 0) end(); else if (on) next(); }, 1300);
  };
  $('#as-go').onclick = () => { pool = shuffle(bank($('#as-m').value)); lives = 3; score = 0; dur = 9; streak = 0; hearts(); $('#as-s').textContent = 0; on = true; $('#as-go').disabled = true; msgBox(h, 'Сәттілік!'); next(); };
  loop($('#as-a'), dt => {
    if (!on || !row || row.done) return; row.t += dt; const H = $('#as-a').clientHeight, top = $('#as-q').offsetHeight + 18, y = top + (row.t / dur) * Math.max(60, H - top - 130);
    h.querySelectorAll('#as-r button').forEach(b => b.parentElement.style.transform = `translateY(${y}px) rotate(${Math.sin(row.t * 2 + +b.dataset.k) * 6}deg)`);
    if (row.t >= dur) answer(-1, null);
  });
}

const GAMES = [
  { id: 'orbit', t: 'Ньютон зеңбірегі', d: 'Серікті орбитаға шығар: 4 ғарыштық миссия', l: [4, 6], f: orbit, icon: '<circle cx="50" cy="58" r="26" fill="#1d6f9a"/><ellipse cx="50" cy="58" rx="40" ry="30" fill="none" stroke="#f4c84a" stroke-width="2" stroke-dasharray="4 4"/><path d="M44 32 50 22 56 32Z" fill="#5b6b5a"/><circle cx="90" cy="58" r="4" fill="#fff"/>' },
  { id: 'target', t: 'Нысанаға дәл тиі', d: 'Бұрыш пен жылдамдықты таңдап, Жерде, Марста және Айда нысанаға ат', l: [5], f: target, icon: '<path d="M14 80Q45 10 80 76" fill="none" stroke="#f4c84a" stroke-width="2.5" stroke-dasharray="5 4"/><circle cx="80" cy="78" r="12" fill="#eaf4f7"/><circle cx="80" cy="78" r="7" fill="#ff7a6b"/><circle cx="80" cy="78" r="2.5" fill="#eaf4f7"/>' },
  { id: 'constellation', t: 'Шоқжұлдызды құрастыр', d: 'Жұлдыздарды қосып, 7 шоқжұлдызды қалпына келтір', l: [8, 9], f: constellation, icon: '<path d="M14 30 30 26 44 38 58 34 70 50 88 46 80 70" fill="none" stroke="#7ad9ee" stroke-width="2"/>' + [[14, 30], [30, 26], [44, 38], [58, 34], [70, 50], [88, 46], [80, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff6d8"/>`).join('') },
  { id: 'planets', t: 'Ғаламшарлар парады', d: 'Ғаламшарларды Күннен қашықтығы және өлшемі бойынша ретте', l: [1, 15], f: planets, icon: '<circle cx="10" cy="50" r="9" fill="#f4c84a"/>' + [[26, 3, '#b9b2a8'], [36, 4, '#e8c77a'], [47, 4.5, '#4fb0ff'], [57, 3.5, '#e0704a'], [72, 9, '#d9a66b'], [90, 7, '#e6d08a']].map(([x, r, c]) => `<circle cx="${x}" cy="50" r="${r}" fill="${c}"/>`).join('') },
  { id: 'memory', t: 'Ғарыш жады', d: 'Ұғым мен анықтаманың жұбын тап: 16 карта', l: [2, 16], f: memory, icon: [[12, 22], [52, 22], [12, 56], [52, 56]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="34" height="28" rx="5" fill="${i === 1 ? '#18394a' : '#12364a'}" stroke="${i === 1 ? '#38c3e2' : '#1f4a5e'}"/>`).join('') + '<text x="69" y="41" text-anchor="middle" font-size="12" fill="#eaf4f7">v₁</text>' },
  { id: 'asteroids', t: 'Астероид жаңбыры', d: 'Дұрыс жауапты астероидты Жерге жеткенше атып түсір', l: [16, 17], f: asteroids, icon: '<ellipse cx="50" cy="104" rx="70" ry="30" fill="#1d6f9a"/><circle cx="30" cy="30" r="10" fill="#6b5442"/><circle cx="62" cy="44" r="13" fill="#8a6d55"/><path d="M62 44 80 20" stroke="#f4c84a" stroke-width="2"/>' }
];
return GAMES;
})();
