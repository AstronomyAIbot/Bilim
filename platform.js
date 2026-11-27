/* Платформа қызметтері: сақтау, синхрондау, нәтиже коды, XP, мұғалім деректері, жүктеу, ЖИ, аударма, дауыстап оқу */
window.PF = (() => {
const KEY = 'astro_bilim_v1', TKEY = 'astro_teacher_v1', AKEY = 'astro_a11y';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lsGet = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
const st = { db: null, user: null, sample: null, tts: null, dl: null, uid: null, teacher: false, canWrite: null, ready: false, syncState: 'local', shared: null };
const subs = new Set();
const emit = () => subs.forEach(f => { try { f(); } catch (e) { console.error(e); } });
let readyRes; const readyP = new Promise(r => readyRes = r);
const timeout = (p, ms = 10000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), ms))]);

/* ---------- оқушы деректері ---------- */
const load = () => lsGet(KEY, {});
let syncTimer = null;
const save = d => { lsSet(KEY, d); clearTimeout(syncTimer); syncTimer = setTimeout(sync, 1800); };
const mark = (field, key) => { const d = load(); d[field] = d[field] || {}; d[field][key] = Date.now(); save(d); };

/* ---------- XP, атақ, бейдж ---------- */
const LEVELS = [[0, 'Жұлдыз бақылаушы'], [300, 'Жас астроном'], [700, 'Ғарыш зерттеушісі'], [1200, 'Ұшқыш-ғарышкер'], [1800, 'Ғарыш командирі'], [2500, 'Галактика шебері']];
const best = r => r ? (r.b ?? r.s) : 0;
function xpOf(d) {
  const s = d.scores || {}, g = d.games || {};
  let x = 0;
  for (let n = 1; n <= 17; n++) if (s[n]) x += 10 * best(s[n]);
  if (s.final) x += 10 * best(s.final);
  x += 15 * Math.min(60, d.problems?.solved || 0);
  x += 25 * Math.min(4, g.orbit || 0);
  if (g.target) x += Math.min(100, Math.round(g.target / 4));
  if (g.constellation) x += 100;
  if (g.planets) x += Math.min(100, Math.round(g.planets / 2));
  if (g.memory) x += g.memory <= 14 ? 100 : 60;
  if (g.asteroids) x += Math.min(150, Math.round(g.asteroids / 2));
  x += 50 * Object.values(d.weeks || {}).filter(w => (w.q + w.p) / 8 >= 0.7).length;
  if (d.pre) x += 30; if (d.post) x += 30;
  x += 5 * Math.min(14, Object.keys(d.simTs || {}).length);
  return x;
}
const level = x => { let i = 0; LEVELS.forEach((l, k) => { if (x >= l[0]) i = k; }); const nx = LEVELS[i + 1]; return { i, name: LEVELS[i][1], next: nx ? nx[0] : null, nextName: nx ? nx[1] : null, from: LEVELS[i][0] }; };
const BADGES = [
  ['first', 'Алғашқы қадам', 'Бірінші тестті тапсырдың', d => Object.keys(d.scores || {}).length > 0],
  ['newton', 'Ньютон шәкірті', '3-тақырып тестінен 8+ балл', d => best(d.scores?.[3]) >= 8],
  ['kepler', 'Кеплер шебері', '13-тақырып тестінен 8+ балл', d => best(d.scores?.[13]) >= 8],
  ['stars', 'Жұлдыз жинаушы', '7 шоқжұлдызды құрастырдың', d => d.games?.constellation != null],
  ['orbit', 'Орбита инженері', 'Ньютон зеңбірегінің 4 миссиясы', d => (d.games?.orbit || 0) >= 4],
  ['sniper', 'Мерген', '«Нысанаға дәл тиі»: 400+ ұпай', d => (d.games?.target || 0) >= 400],
  ['solver', 'Есепші', '10 есеп шығардың', d => (d.problems?.solved || 0) >= 10],
  ['explorer', 'Зерттеуші', '10 симуляцияны аштың', d => Object.keys(d.simTs || {}).length >= 10],
  ['week', 'Апта жеңімпазы', 'Апта сынағынан 70%+', d => Object.values(d.weeks || {}).some(w => (w.q + w.p) / 8 >= 0.7)],
  ['growth', 'Өсу жолында', 'Қорытынды диагностика бастапқыдан жоғары', d => d.pre && d.post && d.post.s > d.pre.s],
  ['all', 'Толық курс', '17 тақырыптың бәрінен 7+ балл', d => Array.from({ length: 17 }, (_, i) => best(d.scores?.[i + 1]) >= 7).every(Boolean)]
];
const badgesOf = d => BADGES.map(([id, t, desc, f]) => ({ id, t, desc, on: !!f(d) }));

/* ---------- нәтиже коды ---------- */
const b64e = s => { const bytes = new TextEncoder().encode(s); let b = ''; bytes.forEach(x => b += String.fromCharCode(x)); return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const b64d = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s); return new TextDecoder().decode(Uint8Array.from(b, c => c.charCodeAt(0))); };
const chk = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1679616; return h.toString(36).padStart(4, '0'); };
function summary(d) {
  const t = {}; for (let n = 1; n <= 17; n++) if (d.scores?.[n]) t[n] = [best(d.scores[n]), d.scores[n].t, d.scores[n].ts || 0];
  const w = {}; Object.entries(d.wrong || {}).forEach(([k, v]) => { if (v.length) w[k] = v.slice(0, 10); });
  return { v: 1, n: (d.name || '').slice(0, 40), c: (d.cls || '').slice(0, 16), x: xpOf(d), t, f: d.scores?.final ? [best(d.scores.final), 20] : null, p: d.problems?.solved || 0, g: d.games || {}, pre: d.pre ? [d.pre.s, d.pre.t] : null, post: d.post ? [d.post.s, d.post.t] : null, w, wk: Object.values(d.weeks || {}).filter(x => (x.q + x.p) / 8 >= 0.7).length, ts: Date.now() };
}
const encode = obj => { const b = b64e(JSON.stringify(obj)); return 'AB1.' + b + '.' + chk(b); };
function decode(code) {
  const m = String(code).trim().match(/^AB1\.([A-Za-z0-9_-]+)\.([0-9a-z]{4})$/);
  if (!m || chk(m[1]) !== m[2]) return null;
  try { const o = JSON.parse(b64d(m[1])); return o && typeof o === 'object' ? o : null; } catch (e) { return null; }
}
const keyOf = (n, c) => { const s = (String(n).trim().toLowerCase().replace(/\s+/g, ' ') + '|' + String(c).trim().toLowerCase()); let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return 'k' + h.toString(36); };

/* ---------- мүмкіндіктерді қосу ---------- */
const use = async name => { try { if (!window.claude?.use) return null; return await Promise.race([window.claude.use(name), new Promise(r => setTimeout(() => r(null), 10000))]); } catch (e) { return null; } };
async function init() {
  const [db, user, sample, tts, dl] = await Promise.all(['db', 'user', 'sample', 'tts', 'downloads'].map(use));
  Object.assign(st, { db, user, sample, tts, dl });
  if (user) {
    try { st.uid = await user.id(); } catch (e) { }
    try { st.teacher = !!(await user.canEdit()); } catch (e) { }
    try { st.canWrite = await user.can('data.write'); } catch (e) { }
  }
  st.syncState = db && st.uid && st.canWrite !== false ? 'ready' : 'local';
  st.ready = true; emit();
  await loadShared(); emit(); readyRes();
  if (load().consent) sync();
}

/* ---------- синхрондау (ұйым ішіндегі оқушылар үшін) ---------- */
let syncing = Promise.resolve();
function sync() {
  const d = load();
  if (!d.consent || !st.db || !st.uid || st.canWrite === false || st.teacher) return;
  syncing = syncing.then(async () => {
    try {
      const s = summary(d);
      await timeout(st.db.doc('students/' + st.uid).set(s));
      if (d.rank && d.nick) await timeout(st.db.doc('board/' + st.uid).set({ nick: d.nick.slice(0, 24), cls: s.c, xp: s.x, ts: s.ts }));
      st.syncState = 'synced'; emit();
    } catch (e) { if (e && e.code === 'invalid_argument') st.canWrite = false; st.syncState = 'local'; emit(); }
  });
}

/* ---------- мұғалім деректері (db немесе осы браузер) ---------- */
const tl = () => lsGet(TKEY, { journal: {}, classes: [], assignments: [], custom: [], notice: '', board: {} });
const tlSet = v => lsSet(TKEY, v);
const useDb = () => !!st.db;
const T = {
  async journal() {
    if (useDb() && st.teacher) {
      const [a, b] = await Promise.all([timeout(st.db.collection('journal').get()), timeout(st.db.collection('students').get()).catch(() => ({ docs: [] }))]);
      return a.docs.map(x => ({ key: x.id, src: 'code', ...x.data() })).concat(b.docs.map(x => ({ key: x.id, src: 'sync', ...x.data() })));
    }
    return Object.entries(tl().journal).map(([key, v]) => ({ key, src: 'code', ...v }));
  },
  async putEntry(o) {
    const key = keyOf(o.n || '', o.c || '');
    if (useDb() && st.teacher) {
      const ref = st.db.doc('journal/' + key), old = await timeout(ref.get());
      const merged = mergeEntry(old.exists ? old.data() : null, o);
      await timeout(ref.set(merged)); return key;
    }
    const v = tl(); v.journal[key] = mergeEntry(v.journal[key], o); tlSet(v); return key;
  },
  async delEntry(key, src) { if (useDb() && st.teacher) return timeout(st.db.doc((src === 'sync' ? 'students/' : 'journal/') + key).delete()); const v = tl(); delete v.journal[key]; tlSet(v); },
  async list(kind) { if (useDb()) { const q = await timeout(st.db.collection(kind).get()); return q.docs.map(x => ({ id: x.id, ...x.data() })); } return tl()[kind].slice(); },
  async add(kind, obj) { obj.created = Date.now(); if (useDb()) { const r = await timeout(st.db.collection(kind).add(obj)); return r.id; } const v = tl(); obj.id = 'L' + Date.now().toString(36); v[kind].push(obj); tlSet(v); return obj.id; },
  async del(kind, id) { if (useDb()) return timeout(st.db.doc(kind + '/' + id).delete()); const v = tl(); v[kind] = v[kind].filter(x => x.id !== id); tlSet(v); },
  async getDoc(path, def) { if (useDb()) { const s = await timeout(st.db.doc(path).get()); return s.exists ? s.data() : def; } const v = tl(); return path === 'settings/site' ? { notice: v.notice } : path === 'settings/classes' ? { list: v.classes } : def; },
  async setDoc(path, data) { if (useDb()) return timeout(st.db.doc(path).set(data)); const v = tl(); if (path === 'settings/site') v.notice = data.notice; if (path === 'settings/classes') v.classes = data.list; tlSet(v); },
  async board() { if (useDb()) { const q = await timeout(st.db.collection('board').get()); return q.docs.map(x => ({ id: x.id, ...x.data() })); } return Object.entries(tl().board).map(([id, v]) => ({ id, ...v })); },
  async publishBoard(rows) { if (useDb()) { for (const r of rows) await timeout(st.db.doc('board/' + r.key).set({ nick: r.nick, cls: r.cls, xp: r.xp, ts: Date.now() })); return; } const v = tl(); rows.forEach(r => v.board[r.key] = { nick: r.nick, cls: r.cls, xp: r.xp, ts: Date.now() }); tlSet(v); },
  async clearBoard(ids) { if (useDb()) { for (const id of ids) await timeout(st.db.doc('board/' + id).delete()); return; } const v = tl(); v.board = {}; tlSet(v); }
};
function mergeEntry(old, o) {
  const m = old ? JSON.parse(JSON.stringify(old)) : { n: o.n || 'Атсыз', c: o.c || '', t: {}, g: {}, bot: {} };
  if (o.src === 'bot') { Object.entries(o.t || {}).forEach(([k, v]) => { const pv = m.bot?.[k]; if (!pv || v[0] >= pv[0]) { m.bot = m.bot || {}; m.bot[k] = v; } }); }
  else if (!old || (o.ts || 0) >= (old.ts || 0)) { ['x', 't', 'f', 'p', 'g', 'pre', 'post', 'w', 'wk'].forEach(k => { if (o[k] !== undefined) m[k] = o[k]; }); m.ts = o.ts || Date.now(); }
  m.n = o.n || m.n; m.c = o.c ?? m.c; m.imported = Date.now();
  return m;
}

/* ---------- бәріне ортақ деректер ---------- */
async function loadShared(force) {
  if (st.shared && !force) return st.shared;
  const out = { notice: '', classes: [], assignments: [], custom: [] };
  try {
    const [site, cls, asg, cus] = await Promise.all([T.getDoc('settings/site', {}), T.getDoc('settings/classes', {}), T.list('assignments'), T.list('custom')]);
    out.notice = site?.notice || ''; out.classes = Array.isArray(cls?.list) ? cls.list : []; out.assignments = asg; out.custom = cus;
  } catch (e) { }
  st.shared = out; return out;
}
const customFor = n => (st.shared?.custom || []).filter(q => +q.topic === +n && Array.isArray(q.o) && q.o.length >= 2).map(q => [String(q.q), q.o.map(String), +q.a || 0, String(q.e || '')]);

/* ---------- жүктеу ---------- */
const scriptCache = {};
const loadScript = src => scriptCache[src] || (scriptCache[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));
async function saveFile(filename, data) {
  if (!st.dl) throw { code: 'unavailable' };
  return st.dl.save({ filename, data });
}
async function xlsx(filename, sheets) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  const wb = window.XLSX.utils.book_new();
  sheets.forEach(([name, rows]) => window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(rows), name.slice(0, 31)));
  const arr = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return saveFile(filename, new Blob([arr]));
}
const csv = rows => rows.map(r => r.map(c => { const s = String(c ?? ''); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\n');
async function offlineHTML() {
  const files = ['data.js', 'quiz.js', 'lab.js', 'games.js', 'gen.js', 'platform.js', 'teacher.js', 'app.js'];
  let html = await (await fetch('index.html')).text();
  for (const f of files) { const js = await (await fetch(f)).text(); html = html.replace(`<script src="${f}"></script>`, () => '<script>' + js.replace(/<\/script/gi, '<\\/script') + '</script>'); }
  const imgs = [...new Set(html.match(/img\/[a-z0-9-]+\.jpg/g) || [])];
  for (const p of imgs) { const b = await (await fetch(p)).blob(); const du = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); }); html = html.split(p).join(du); }
  return html;
}

/* ---------- дауыстап оқу ---------- */
let speakingBtn = null;
async function say(text, btn) {
  if (!st.tts) return;
  try {
    if (speakingBtn === btn && btn) { st.tts.stop(); speakingBtn = null; return; }
    speakingBtn = btn || null; if (btn) btn.classList.add('on');
    await st.tts.speak(String(text).slice(0, 1990));
  } catch (e) { } finally { if (btn) btn.classList.remove('on'); if (speakingBtn === btn) speakingBtn = null; }
}
const spk = text => st.tts ? `<button type="button" class="spk" data-say="${esc(text)}" aria-label="Тыңдау" title="Тыңдау"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>` : '';
document.addEventListener('click', e => { const b = e.target.closest('.spk'); if (b) { e.preventDefault(); say(b.dataset.say, b); } });

/* ---------- ЖИ ---------- */
const AI_RULES = 'Сен – 9-сынып оқушыларына арналған «Astro_bilim» астрономия курсының ЖИ-көмекшісісің. Оқушы қай тілде жазса, сол тілде (әдетте қазақша) қысқа әрі түсінікті жауап бер. Тек физика, астрономия және курс тақырыптары аясында көмектес; басқа тақырыпқа сыпайы түрде курсқа қайтар. Үй тапсырмасының дайын жауабын бірден берме: алдымен идеяны, формуланы, қадамдарды көрсет; оқушы сұраса, толық шешімін бер. Фактілерде мұқият бол, сенімсіз болсаң, оқулықпен тексеруді ұсын. Формулаларды қарапайым мәтінмен жаз (мысалы, v = √(GM/R)). Markdown кестелерін қолданба.';
async function ask(messages, onText, signal) {
  if (!st.sample) throw { code: 'not_granted' };
  return st.sample(messages, { onText, signal, cache: false, modelTier: 'default' });
}

/* ---------- аударма ---------- */
const LANGS = { kk: 'Қазақша', ru: 'Русский', en: 'English' };
let lang = lsGet('astro_lang', 'kk'), trCache = {}, orig = new Map(), trBusy = false, trQueue = new Set(), trTimer = null, mo = null;
const trStatus = t => { const el = document.getElementById('trs'); if (el) { el.textContent = t || ''; el.hidden = !t; } };
const SKIP = 'script,style,pre,code,textarea,input,select,[data-notr]';
function textNodes(root) {
  const out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (!n.parentElement || n.parentElement.closest(SKIP) || !/[Ѐ-ӿ]{2}/.test(n.data)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  while (w.nextNode()) out.push(w.currentNode); return out;
}
function applyCached(nodes) {
  const miss = [];
  nodes.forEach(n => { if (!orig.has(n)) orig.set(n, n.data); const src = orig.get(n), k = src.trim(); if (!k) return; const t = trCache[k]; if (t) { const nv = src.replace(k, t); if (n.data !== nv) n.data = nv; } else miss.push(k); });
  return [...new Set(miss)];
}
async function translateRoot(root) {
  if (lang === 'kk') return;
  const nodes = textNodes(root); let miss = applyCached(nodes);
  if (!miss.length) return;
  if (!st.sample) { trStatus('Аударма бұл жерде қолжетімсіз'); setTimeout(() => trStatus(''), 4000); return; }
  if (trBusy) { miss.forEach(m => trQueue.add(m)); return; }
  trBusy = true; trStatus(lang === 'ru' ? 'Перевод…' : 'Translating…');
  try {
    while (miss.length) {
      const batch = []; let len = 0;
      while (miss.length && batch.length < 40 && len < 3500) { const s = miss.shift(); batch.push(s); len += s.length; }
      const target = lang === 'ru' ? 'Russian' : 'English';
      const prompt = `Translate each string of this JSON array from Kazakh into ${target}. It is the interface and content of a 9th-grade astronomy course website. Keep numbers, formulas, units, symbols (°, ′, ″, ², ·, √, ≈, →), emoji, punctuation and leading or trailing spaces as they are. Use standard ${target} names for stars, constellations and planets. Return only a JSON array of strings with the same length and order.\n\n` + JSON.stringify(batch);
      const res = await st.sample.json(prompt, { modelTier: 'quick' });
      if (Array.isArray(res) && res.length === batch.length) batch.forEach((s, i) => { if (typeof res[i] === 'string' && res[i].trim()) trCache[s] = res[i]; });
      lsSet('astro_tr_' + lang, trCache);
      applyCached(textNodes(root));
      if (!miss.length && trQueue.size) { miss = [...trQueue]; trQueue.clear(); }
    }
    trStatus('');
  } catch (e) { trStatus(e && e.code === 'rate_limited' ? 'Аударма кейінірек жалғасады' : 'Аударма сәтсіз аяқталды'); setTimeout(() => trStatus(''), 4000); }
  trBusy = false;
}
function setLang(l) {
  lang = l; lsSet('astro_lang', l); document.documentElement.lang = l === 'kk' ? 'kk' : l;
  if (mo) { mo.disconnect(); mo = null; }
  if (l === 'kk') { orig.forEach((v, n) => { if (n.isConnected) n.data = v; }); orig.clear(); return; }
  orig.forEach((v, n) => { if (n.isConnected) n.data = v; }); orig.clear();
  trCache = lsGet('astro_tr_' + l, {});
  translateRoot(document.body);
  mo = new MutationObserver(() => { clearTimeout(trTimer); trTimer = setTimeout(() => { orig.forEach((v, n) => { if (!n.isConnected) orig.delete(n); }); translateRoot(document.body); }, 300); });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
}

/* ---------- қолжетімділік ---------- */
const A11Y_DEF = { size: 0, hc: false, dys: false, anim: true };
const a11y = () => ({ ...A11Y_DEF, ...lsGet(AKEY, {}) });
function applyA11y(o = a11y()) {
  const r = document.documentElement;
  r.classList.toggle('hc', !!o.hc); r.classList.toggle('dys', !!o.dys); r.classList.toggle('noanim', !o.anim);
  r.style.fontSize = ''; document.body && (document.body.style.zoom = [1, 1.15, 1.3][o.size] || 1);
}
const setA11y = patch => { const o = { ...a11y(), ...patch }; lsSet(AKEY, o); applyA11y(o); return o; };

/* ---------- апта сынағы, диагностика ---------- */
const weekId = (t = Date.now()) => { const d = new Date(t + 5 * 36e5); const day = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - day + 3); const y = d.getUTCFullYear(), first = new Date(Date.UTC(y, 0, 4)); const wk = 1 + Math.round(((d - first) / 864e5 - 3 + ((first.getUTCDay() + 6) % 7)) / 7); return y + '-W' + String(wk).padStart(2, '0'); };
const DIAG = [[1, 0], [3, 1], [3, 4], [4, 2], [4, 4], [5, 3], [6, 0], [6, 6], [8, 2], [9, 0], [9, 4], [10, 1], [11, 0], [11, 4], [13, 0], [13, 5], [14, 1], [14, 3], [15, 0], [16, 4]];

return { readyP, st, esc, load, save, mark, init, sync, subs, xpOf, level, LEVELS, badgesOf, summary, encode, decode, keyOf, T, loadShared, customFor, saveFile, xlsx, csv, offlineHTML, loadScript, say, spk, ask, AI_RULES, LANGS, setLang, get lang() { return lang; }, a11y, setA11y, applyA11y, weekId, DIAG, best };
})();
