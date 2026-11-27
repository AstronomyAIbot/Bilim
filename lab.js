window.LAB = (() => {
const RM = false;
const C = { sky: '#38c3e2', sky2: '#7ad9ee', gold: '#f4c84a', ink: '#eaf4f7', mut: '#a3bfca', line: '#1f4a5e', bg: '#04131a', bad: '#ff7a6b', ok: '#5fd39a' };
const G = 6.674e-11;
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const num = (x, d = 2) => Number.isFinite(x) ? x.toLocaleString('ru-RU', { maximumFractionDigits: d }) : '—';
const sci = (x, d = 2) => {
  if (!Number.isFinite(x)) return '—';
  if (x !== 0 && (Math.abs(x) >= 1e6 || Math.abs(x) < 1e-2)) {
    const [m, e] = x.toExponential(d).split('e');
    return m.replace('.', ',') + '·10' + String(+e).split('').map(ch => SUP[ch] || ch).join('');
  }
  return num(x, d);
};
const parseNum = s => {
  s = String(s).trim().replace(/\s/g, '').replace(',', '.').replace(/[·×x\*]10\^?/i, 'e');
  s = s.replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ch => ({ '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' })[ch]);
  return parseFloat(s);
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = (py, title = 'Python коды (Google Colab немесе Jupyter)') => `<details><summary>${title}</summary><div class="pre"><button class="copy" type="button">Көшіру</button><pre><code>${esc(py)}</code></pre></div></details>`;

function canvas(fig, draw) {
  const c = document.createElement('canvas'); fig.appendChild(c);
  const ctx = c.getContext('2d');
  const st = { W: 0, H: 0, ctx };
  const fit = () => {
    const r = fig.getBoundingClientRect(), d = devicePixelRatio || 1;
    st.W = r.width; st.H = r.height; c.width = Math.round(r.width * d); c.height = Math.round(r.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0); draw(st);
  };
  const ro = new ResizeObserver(fit); ro.observe(fig);
  return st;
}
function loop(el, step, ambient) {
  let on = ambient ? !document.documentElement.classList.contains('noanim') : true, last = 0;
  const f = t => {
    if (!el.isConnected) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    if (on) step(dt);
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
  return { toggle() { on = !on; return on; }, get on() { return on; } };
}
function playBtn(host, lp) {
  const b = host.querySelector('.play'); if (!b) return;
  const set = () => b.textContent = lp.on ? 'Тоқтату' : 'Іске қосу';
  set(); b.onclick = () => { lp.toggle(); set(); };
}
const dot = (ctx, x, y, r, col, glow) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = col; if (glow) { ctx.shadowColor = col; ctx.shadowBlur = glow; } ctx.fill(); ctx.shadowBlur = 0; };
const label = (ctx, t, x, y, col = C.ink, al = 'left', size = 13) => { ctx.font = `${size}px "Golos Text", system-ui, sans-serif`; ctx.textAlign = al; ctx.lineWidth = 4; ctx.strokeStyle = C.bg; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); };
const kepE = (M, e) => { let E = e < 0.8 ? M : Math.PI; for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };

/* ---------- Кеплер ---------- */
function kepler(h) {
  const P = [['Жер', 1, 0.017], ['Марс', 1.524, 0.093], ['Сәтпаев астероиді', 2.22, 0.13], ['Темпель кометасы', 3.03, 0.55], ['Галлей кометасы', 17.8, 0.967]];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:380px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button><label class="row small" style="gap:6px"><input type="checkbox" id="k-areas" checked style="width:20px;height:20px"> Тең аудандарды көрсету</label></div></div>
  <div class="ctl"><div class="chips">${P.map((p, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <label>Үлкен жарты ось a = <b id="k-av"></b> а.б.<input type="range" id="k-a" min="-0.5" max="1.6" step="0.005"></label>
  <label>Эксцентриситет e = <b id="k-ev"></b><input type="range" id="k-e" min="0" max="0.97" step="0.005"></label>
  <div class="out"><div><small>Период T = a<sup>3/2</sup></small><b id="k-T"></b></div><div><small>Перигелий q = a(1 − e)</small><b id="k-q"></b></div><div><small>Афелий Q = a(1 + e)</small><b id="k-Q"></b></div><div><small>v перигелийде / афелийде</small><b id="k-v"></b></div></div>
  <p class="small muted">Боялған секторлар бірдей уақыт аралығында сызылады – олардың аудандары тең (Кеплердің II заңы). Жылдамдық: v = 29,8·√(2/r − 1/a) км/с, r және a – а.б.</p></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt

a, e = 1.524, 0.093            # Марс: үлкен жарты ось (а.б.), эксцентриситет
T = a ** 1.5                   # Кеплердің III заңы: T² = a³ (жыл)

t = np.linspace(0, T, 13)      # орбитаны 12 тең уақыт аралығына бөлеміз
M = 2 * np.pi * t / T          # орташа аномалия
E = M.copy()
for _ in range(30):            # Кеплер теңдеуі: E − e·sinE = M
    E -= (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
x = a * (np.cos(E) - e)
y = a * np.sqrt(1 - e**2) * np.sin(E)

th = np.linspace(0, 2 * np.pi, 400)
plt.figure(figsize=(6, 6))
plt.plot(a * (np.cos(th) - e), a * np.sqrt(1 - e**2) * np.sin(th), lw=1)
for i in range(0, 12, 2):      # II заң: тең уақытта тең аудандар
    plt.fill([0, x[i], x[i + 1]], [0, y[i], y[i + 1]], alpha=0.3)
plt.plot(0, 0, 'o', color='orange', ms=14, label='Күн (фокус)')
plt.scatter(x, y, s=12, label='Тең уақыт аралықтары')
plt.gca().set_aspect('equal'); plt.grid(alpha=.3); plt.legend()
plt.title(f'a = {a} а.б., e = {e}, T = {T:.2f} жыл')
plt.show()`);
  const fig = h.querySelector('.fig'), $ = s => h.querySelector(s);
  let a = 1.524, e = 0.093, ph = 0;
  const upd = () => {
    $('#k-a').value = Math.log10(a); $('#k-e').value = e;
    $('#k-av').textContent = num(a, 2); $('#k-ev').textContent = num(e, 3);
    const T = a ** 1.5, q = a * (1 - e), Q = a * (1 + e);
    $('#k-T').textContent = T < 2 ? num(T * 365.25, 0) + ' тәул.' : num(T, 2) + ' жыл';
    $('#k-q').textContent = num(q, 3) + ' а.б.'; $('#k-Q').textContent = num(Q, 3) + ' а.б.';
    const vp = 29.78 * Math.sqrt(2 / q - 1 / a), va = 29.78 * Math.sqrt(2 / Q - 1 / a);
    $('#k-v').textContent = num(vp, 1) + ' / ' + num(va, 1);
    draw(st);
  };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const b = a * Math.sqrt(1 - e * e), sc = Math.min((W - 60) / (2 * a), (H - 60) / (2 * b));
    const cx = W / 2, cy = H / 2, sx = cx + a * e * sc;
    const P = E => [sx + a * (Math.cos(E) - e) * sc, cy - b * Math.sin(E) * sc];
    if ($('#k-areas').checked) {
      for (let k = 0; k < 12; k += 2) {
        ctx.beginPath(); ctx.moveTo(sx, cy);
        for (let j = 0; j <= 20; j++) { const M = 2 * Math.PI * (k + j / 20) / 12; const p = P(kepE(M, e)); ctx.lineTo(p[0], p[1]); }
        ctx.closePath(); ctx.fillStyle = 'rgba(56,195,226,.22)'; ctx.fill();
      }
    }
    ctx.beginPath(); ctx.ellipse(cx, cy, a * sc, b * sc, 0, 0, 7); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
    dot(ctx, sx, cy, 9, C.gold, 18); label(ctx, 'Күн', sx, cy + 26, C.gold, 'center');
    const pq = P(0), pa = P(Math.PI);
    dot(ctx, pq[0], pq[1], 3, C.mut); label(ctx, 'перигелий', pq[0] - 6, pq[1] - 10, C.mut, 'right');
    dot(ctx, pa[0], pa[1], 3, C.mut); label(ctx, 'афелий', pa[0] + 6, pa[1] - 10, C.mut, 'left');
    const p = P(kepE(ph, e));
    ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(p[0], p[1]); ctx.strokeStyle = 'rgba(244,200,74,.6)'; ctx.lineWidth = 1; ctx.stroke();
    dot(ctx, p[0], p[1], 6, C.sky, 10);
  };
  const st = canvas(fig, draw);
  $('#k-a').oninput = ev => { a = 10 ** +ev.target.value; upd(); };
  $('#k-e').oninput = ev => { e = +ev.target.value; upd(); };
  $('#k-areas').onchange = () => draw(st);
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const p = P[+b.dataset.i]; a = p[1]; e = p[2]; upd(); });
  const lp = loop(fig, dt => { ph = (ph + dt * 2 * Math.PI / 8) % (2 * Math.PI); draw(st); }, true);
  playBtn(h, lp); upd();
}

/* ---------- Күн жүйесі ---------- */
const PLANETS = [['Меркурий', 0.387, 87.97, '#b9b2a8', 2.5], ['Шолпан', 0.723, 224.7, '#e8c77a', 4], ['Жер', 1, 365.25, '#4fb0ff', 4.2], ['Марс', 1.524, 687, '#e0704a', 3.2], ['Юпитер', 5.203, 4333, '#d9a66b', 8], ['Сатурн', 9.537, 10759, '#e6d08a', 7], ['Уран', 19.19, 30687, '#8fe0e6', 5.5], ['Нептун', 30.07, 60190, '#5b7cff', 5.5]];
function solarScene(fig, opt = {}) {
  let tilt = opt.tilt ?? 62, speed = opt.speed ?? 40, days = 0;
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W / 2 - 24, (H / 2 - 20) / Math.max(Math.cos(tilt * Math.PI / 180), 0.25)), k = Math.cos(tilt * Math.PI / 180);
    const sc = r => Math.sqrt(r / 30.07) * R;
    PLANETS.forEach(p => { ctx.beginPath(); ctx.ellipse(cx, cy, sc(p[1]), sc(p[1]) * k, 0, 0, 7); ctx.strokeStyle = 'rgba(122,217,238,.25)'; ctx.lineWidth = 1; ctx.stroke(); });
    const items = PLANETS.map(p => { const ang = 2 * Math.PI * days / p[2] + p[1]; return { p, x: cx + sc(p[1]) * Math.cos(ang), y: cy + sc(p[1]) * Math.sin(ang) * k, z: Math.sin(ang) }; });
    const sun = { sun: true, z: 0 };
    [...items, sun].sort((A, B) => A.z - B.z).forEach(it => {
      if (it.sun) { dot(ctx, cx, cy, 11, C.gold, 26); return; }
      const r = it.p[4] * (0.85 + 0.25 * it.z * k);
      dot(ctx, it.x, it.y, r, it.p[3]);
      if (it.p[0] === 'Сатурн') { ctx.beginPath(); ctx.ellipse(it.x, it.y, r * 2, r * 0.7, -0.3, 0, 7); ctx.strokeStyle = '#e6d08a'; ctx.stroke(); }
      if (opt.labels !== false && W > 300) label(ctx, it.p[0], it.x + r + 4, it.y - r - 2, C.mut, 'left', 12);
    });
    if (opt.onDays) opt.onDays(days);
  };
  const st = canvas(fig, draw);
  const lp = loop(fig, dt => { days += dt * speed; draw(st); }, true);
  return { set(o) { if (o.tilt != null) tilt = o.tilt; if (o.speed != null) speed = o.speed; draw(st); }, lp };
}
function solar(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:400px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button><span class="small muted" id="s-d"></span></div></div>
  <div class="ctl"><label>Көлбеу бұрыш (3D көрініс): <b id="s-tv">62°</b><input type="range" id="s-t" min="0" max="80" value="62"></label>
  <label>Жылдамдық: 1 секундта <b id="s-vv">40</b> тәулік<input type="range" id="s-v" min="1" max="400" value="40"></label>
  <div class="scroll"><table><thead><tr><th>Ғаламшар</th><th class="n">a, а.б.</th><th class="n">Период</th></tr></thead><tbody>${PLANETS.map(p => `<tr><td>${p[0]}</td><td class="n">${num(p[1], 3)}</td><td class="n">${p[2] < 1000 ? num(p[2], 0) + ' тәул.' : num(p[2] / 365.25, 1) + ' жыл'}</td></tr>`).join('')}</tbody></table></div>
  <p class="small muted">Қашықтықтар түбір шкаламен (√a) кішірейтілген, ғаламшар өлшемдері масштабсыз. Периодтар нақты.</p></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from IPython.display import HTML

planets = {'Меркурий': (0.387, 88), 'Шолпан': (0.723, 225),
           'Жер': (1.0, 365.25), 'Марс': (1.524, 687)}   # (a, а.б.; T, тәулік)

fig, ax = plt.subplots(figsize=(6, 6))
ax.set_aspect('equal'); ax.set_xlim(-1.8, 1.8); ax.set_ylim(-1.8, 1.8)
ax.set_facecolor('black'); ax.plot(0, 0, 'o', color='gold', ms=16)
dots = {}
for name, (a, T) in planets.items():
    th = np.linspace(0, 2 * np.pi, 200)
    ax.plot(a * np.cos(th), a * np.sin(th), lw=.5, color='gray')
    dots[name], = ax.plot([], [], 'o', label=name)
ax.legend(loc='upper right')

def update(frame):
    day = frame * 5                        # әр кадр – 5 тәулік
    for name, (a, T) in planets.items():
        ang = 2 * np.pi * day / T
        dots[name].set_data([a * np.cos(ang)], [a * np.sin(ang)])
    return list(dots.values())

anim = FuncAnimation(fig, update, frames=146, interval=40, blit=True)
HTML(anim.to_jshtml())`);
  const $ = s => h.querySelector(s);
  const sc = solarScene(h.querySelector('.fig'), { onDays: d => $('#s-d').textContent = 'Өткен уақыт: ' + num(d, 0) + ' тәулік' });
  playBtn(h, sc.lp);
  $('#s-t').oninput = e => { $('#s-tv').textContent = e.target.value + '°'; sc.set({ tilt: +e.target.value }); };
  $('#s-v').oninput = e => { $('#s-vv').textContent = e.target.value; sc.set({ speed: +e.target.value }); };
}

/* ---------- Тартылыс ---------- */
function gravity(h) {
  const P = [['Оқушы мен Жер', '60', '5,972e24', '6371'], ['Жер мен Ай', '5,972e24', '7,35e22', '384400'], ['KazSat-3 орбитада', '1300', '5,972e24', '42157'], ['Зымыран мен ХҒС', '33000', '410000', '0,1'], ['Күн мен Жер', '1,989e30', '5,972e24', '1,496e8']];
  h.innerHTML = `<div class="lab"><div class="ctl"><div class="chips">${P.map((p, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <div class="grid g2"><label>m₁, кг<input type="text" id="g-m1" inputmode="decimal"></label><label>m₂, кг<input type="text" id="g-m2" inputmode="decimal"></label></div>
  <label>Ара қашықтық r, км<input type="text" id="g-r" inputmode="decimal"></label>
  <p class="small muted">Үлкен сандарды 5,972e24 түрінде жазыңыз (5,972·10²⁴).</p></div>
  <div><div class="card" style="text-align:center"><small class="muted">F = G·m₁·m₂ / r²</small><div id="g-F" style="font-family:Unbounded,sans-serif;font-size:clamp(28px,5vw,42px);color:var(--sky);margin:6px 0"></div><div class="small muted" id="g-w"></div></div>
  <div class="card" style="margin-top:14px"><b>Қашықтық артқанда күш қалай кемиді</b><div id="g-bars" style="margin-top:10px"></div></div></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt

G, M, m = 6.674e-11, 5.972e24, 1300      # Жер массасы және KazSat-3 массасы, кг
R = 6.371e6                              # Жер радиусы, м
h = np.linspace(0, 40_000e3, 400)        # биіктік, м
F = G * M * m / (R + h) ** 2

plt.plot(h / 1000, F)
plt.axvline(35_786, ls='--', color='gray', label='Геостационар орбита, 35 786 км')
plt.xlabel('Биіктік, км'); plt.ylabel('F, Н')
plt.title('KazSat-3 спутнигіне әсер ететін тартылыс күші')
plt.legend(); plt.grid(alpha=.3); plt.show()
print(f'Жер бетінде: {F[0]:.0f} Н, орбитада: {G*M*m/(R+35_786e3)**2:.0f} Н')`);
  const $ = s => h.querySelector(s);
  const calc = () => {
    const m1 = parseNum($('#g-m1').value), m2 = parseNum($('#g-m2').value), r = parseNum($('#g-r').value) * 1000;
    const F = G * m1 * m2 / (r * r);
    $('#g-F').textContent = r > 0 ? sci(F, 3) + ' Н' : '—';
    $('#g-w').textContent = r > 0 ? 'G = 6,674·10⁻¹¹ Н·м²/кг², r = ' + sci(r, 3) + ' м' : 'Қашықтықты енгізіңіз';
    $('#g-bars').innerHTML = [1, 2, 3, 4].map(k => `<div class="row" style="margin:6px 0;flex-wrap:nowrap"><span style="width:3.2em;flex:none">${k === 1 ? 'r' : k + 'r'}</span><div class="meter"><i style="width:${100 / (k * k)}%"></i></div><span class="small" style="width:5.5em;flex:none;text-align:right;white-space:nowrap">F/${k * k}</span></div>`).join('');
  };
  const set = i => { const p = P[i]; $('#g-m1').value = p[1]; $('#g-m2').value = p[2]; $('#g-r').value = p[3]; calc(); };
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => set(+b.dataset.i));
  ['#g-m1', '#g-m2', '#g-r'].forEach(s => $(s).oninput = calc);
  set(2);
}

/* ---------- Ғарыштық жылдамдықтар ---------- */
function cosmic(h) {
  const B = [['Жер', 5.972e24, 6371, '#4fb0ff'], ['Ай', 7.35e22, 1737, '#c9c9c9'], ['Марс', 6.42e23, 3390, '#e0704a'], ['Шолпан', 4.867e24, 6052, '#e8c77a'], ['Юпитер', 1.898e27, 69911, '#d9a66b']];
  const H = [['ХҒС', 420], ['GPS', 20200], ['Геостационар', 35786]];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:360px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button></div></div>
  <div class="ctl"><label>Аспан денесі<select id="c-b">${B.map((b, i) => `<option value="${i}">${b[0]}</option>`).join('')}</select></label>
  <label>Орбита биіктігі h = <b id="c-hv"></b> км<input type="range" id="c-h" min="0" max="45000" step="10"></label>
  <div class="chips" id="c-pre">${H.map(x => `<button class="chip" type="button" data-h="${x[1]}" style="cursor:pointer">${x[0]}, ${num(x[1], 0)} км</button>`).join('')}</div>
  <div class="out"><div><small>v₁ = √(GM/R)</small><b id="c-v1"></b></div><div><small>v₂ = √2·v₁</small><b id="c-v2"></b></div><div><small>h биіктіктегі v</small><b id="c-v"></b></div><div><small>Айналу периоды T</small><b id="c-T"></b></div><div><small>h биіктіктегі g</small><b id="c-g"></b></div></div></div></div>` + code(`import math

G = 6.674e-11
bodies = {'Жер': (5.972e24, 6.371e6), 'Ай': (7.35e22, 1.737e6),
          'Марс': (6.42e23, 3.39e6), 'Юпитер': (1.898e27, 6.9911e7)}

for name, (M, R) in bodies.items():
    v1 = math.sqrt(G * M / R)        # бірінші ғарыштық жылдамдық
    v2 = math.sqrt(2) * v1           # екінші ғарыштық жылдамдық
    print(f'{name:7s} v1 = {v1/1000:6.2f} км/с   v2 = {v2/1000:6.2f} км/с')

# Геостационар орбитаның радиусы: T = 23 сағ 56 мин 4 с
M, T = 5.972e24, 86164
r = (G * M * T**2 / (4 * math.pi**2)) ** (1/3)
print(f'Геостационар орбита биіктігі ≈ {(r - 6.371e6)/1000:,.0f} км')`);
  const $ = s => h.querySelector(s);
  let bi = 0, hk = 420, ang = 0;
  const calc = () => {
    const [n, M, Rk] = B[bi], R = Rk * 1000, r = R + hk * 1000;
    const v1 = Math.sqrt(G * M / R), v = Math.sqrt(G * M / r), T = 2 * Math.PI * r / v;
    $('#c-hv').textContent = num(hk, 0); $('#c-h').value = hk;
    $('#c-v1').textContent = num(v1 / 1000, 2) + ' км/с'; $('#c-v2').textContent = num(v1 * Math.SQRT2 / 1000, 2) + ' км/с';
    $('#c-v').textContent = num(v / 1000, 2) + ' км/с';
    const hh = Math.floor(T / 3600), mm = Math.round((T % 3600) / 60);
    $('#c-T').textContent = hh + ' сағ ' + mm + ' мин';
    $('#c-g').textContent = num(G * M / (r * r), 3) + ' м/с²';
    $('#c-pre').style.display = bi === 0 ? '' : 'none';
    draw(st);
  };
  const draw = s => {
    const { ctx, W, H: Hh } = s; if (!W) return; ctx.clearRect(0, 0, W, Hh);
    const [n, M, Rk, col] = B[bi], cx = W / 2, cy = Hh / 2;
    const maxR = Rk + Math.max(hk, bi === 0 ? 35786 : 0), sc = (Math.min(W, Hh) / 2 - 24) / maxR;
    if (bi === 0) { ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(cx, cy, (Rk + 35786) * sc, 0, 7); ctx.strokeStyle = 'rgba(244,200,74,.5)'; ctx.stroke(); ctx.setLineDash([]); label(ctx, 'геостационар орбита', cx, cy - (Rk + 35786) * sc - 6, C.gold, 'center', 12); }
    const g = ctx.createRadialGradient(cx - Rk * sc * .3, cy - Rk * sc * .3, 1, cx, cy, Rk * sc);
    g.addColorStop(0, '#fff'); g.addColorStop(.25, col); g.addColorStop(1, '#0a2a3a');
    ctx.beginPath(); ctx.arc(cx, cy, Rk * sc, 0, 7); ctx.fillStyle = g; ctx.fill();
    const ro = (Rk + hk) * sc;
    ctx.beginPath(); ctx.arc(cx, cy, ro, 0, 7); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
    const x = cx + ro * Math.cos(ang), y = cy + ro * Math.sin(ang);
    dot(ctx, x, y, 5, C.sky, 10);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 26 * Math.sin(ang), y + 26 * Math.cos(ang)); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    label(ctx, n, cx, cy + 4, '#04131a', 'center');
  };
  const st = canvas(h.querySelector('.fig'), draw);
  $('#c-b').onchange = e => { bi = +e.target.value; calc(); };
  $('#c-h').oninput = e => { hk = +e.target.value; calc(); };
  h.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { hk = +b.dataset.h; calc(); });
  const lp = loop(h.querySelector('.fig'), dt => { ang -= dt * 1.2; draw(st); }, true);
  playBtn(h, lp); calc();
}

/* ---------- Параллакс ---------- */
function parallax(h) {
  const P = [['Ай', 57, '′', 0], ['Күн', 8.8, '″', 0], ['Юпитер (қарсы тұруда)', 2.2, '″', 0], ['Сатурн', 0.9, '″', 0], ['Проксима Центавр', 0.768, '″', 1], ['Сириус', 0.379, '″', 1], ['Вега', 0.130, '″', 1]];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:300px"></div></div>
  <div class="ctl"><div class="chips">${P.map((p, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <label>Параллакс түрі<select id="p-m"><option value="0">Көкжиектік (Күн жүйесі денелері)</option><option value="1">Жылдық (жұлдыздар)</option></select></label>
  <div class="grid g2"><label>Параллакс<input type="number" id="p-v" step="any" min="0"></label><label>Өлшем бірлігі<select id="p-u"><option value="″">бұрыштық секунд ″</option><option value="′">бұрыштық минут ′</option></select></label></div>
  <label id="p-rl">Бұрыштық диаметр ρ, ″ (міндетті емес)<input type="number" id="p-r" step="any" min="0" placeholder="мысалы, 25"></label>
  <div class="out" id="p-out"></div></div></div>` + code(`import math

R = 6378                                  # Жердің экваторлық радиусы, км
p = 57 * 60                               # Айдың көкжиектік параллаксы: 57′ = 3420″
D = R / math.sin(math.radians(p / 3600))
print(f'Айға дейінгі қашықтық ≈ {D:,.0f} км')

rho, r_mars = 25, 5.6e7                   # Марс: бұрыштық диаметрі 25″, қашықтығы, км
print(f'Марстың диаметрі ≈ {r_mars * rho / 206265:,.0f} км')

pi_star = 0.379                           # Сириустың жылдық параллаксы, ″
print(f'Сириусқа дейін: {1/pi_star:.2f} пк = {3.26/pi_star:.1f} жарық жылы')`);
  const $ = s => h.querySelector(s);
  let mode = 0, pv = 57, u = '′';
  const calc = () => {
    $('#p-m').value = mode; $('#p-v').value = pv; $('#p-u').value = u; $('#p-rl').style.display = mode ? 'none' : '';
    const sec = pv * (u === '′' ? 60 : 1), o = $('#p-out');
    if (!(sec > 0)) { o.innerHTML = '<div><small>Нәтиже</small><b>—</b></div>'; draw(st); return; }
    if (mode === 0) {
      const D = 6378 / Math.sin(sec / 3600 * Math.PI / 180), rho = parseFloat($('#p-r').value);
      o.innerHTML = `<div><small>D = R⊕ / sin p</small><b>${sci(D, 3)} км</b></div><div><small>Астрономиялық бірлікпен</small><b>${num(D / 1.496e8, 3)} а.б.</b></div>` + (rho > 0 ? `<div><small>Сызықтық диаметр d = D·ρ/206 265</small><b>${num(D * rho / 206265, 0)} км</b></div>` : '');
    } else {
      o.innerHTML = `<div><small>r = 1/π</small><b>${num(1 / sec, 2)} пк</b></div><div><small>Жарық жылымен</small><b>${num(3.2616 / sec, 1)} ж.ж.</b></div><div><small>Километрмен</small><b>${sci(3.086e13 / sec, 2)} км</b></div>`;
    }
    draw(st);
  };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const sec = pv * (u === '′' ? 60 : 1), cy = H / 2, x0 = 70, x1 = W - 60;
    const show = Math.max(4, Math.min(40, 6 + Math.log10(sec + 1) * 12));
    const base = (x1 - x0) * Math.tan(show * Math.PI / 180);
    if (mode === 0) {
      ctx.beginPath(); ctx.arc(x0, cy, Math.min(base, 60), 0, 7); ctx.fillStyle = '#1d6f9a'; ctx.fill();
      label(ctx, 'Жер', x0, cy + Math.min(base, 60) + 18, C.mut, 'center');
      const top = cy - Math.min(base, 60);
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.moveTo(x0, top); ctx.lineTo(x1, cy); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0, top); ctx.strokeStyle = C.gold; ctx.stroke();
      label(ctx, 'R⊕', x0 - 8, (cy + top) / 2, C.gold, 'right');
    } else {
      const ry = Math.min(base, H / 2 - 30);
      ctx.beginPath(); ctx.ellipse(x0, cy, 16, ry, 0, 0, 7); ctx.strokeStyle = 'rgba(122,217,238,.4)'; ctx.stroke();
      dot(ctx, x0, cy, 7, C.gold, 12); label(ctx, 'Күн', x0 - 14, cy + 4, C.gold, 'right');
      dot(ctx, x0, cy - ry, 4, '#4fb0ff'); label(ctx, 'Жер', x0 + 10, cy - ry - 4, C.mut);
      ctx.beginPath(); ctx.moveTo(x0, cy - ry); ctx.lineTo(x1, cy); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.strokeStyle = C.sky2; ctx.lineWidth = 1.5; ctx.stroke();
      label(ctx, '1 а.б.', x0 + 8, cy - ry / 2, C.gold);
    }
    dot(ctx, x1, cy, 6, C.ink, 10);
    label(ctx, mode === 0 ? 'p' : 'π', x1 - 34, cy - 6, C.gold, 'right', 15);
    label(ctx, 'бұрыш үлкейтіліп көрсетілген', W - 12, H - 12, C.mut, 'right', 12);
  };
  const st = canvas(h.querySelector('.fig'), draw);
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const p = P[+b.dataset.i]; pv = p[1]; u = p[2]; mode = p[3]; $('#p-r').value = ''; calc(); });
  $('#p-m').onchange = e => { mode = +e.target.value; if (mode) u = '″'; calc(); };
  $('#p-v').oninput = e => { pv = parseFloat(e.target.value); calc(); };
  $('#p-u').onchange = e => { u = e.target.value; calc(); };
  $('#p-r').oninput = calc;
  calc();
}

/* ---------- Шарықтау ---------- */
const CITIES = [['Ақтөбе', 50.28, 57.17], ['Астана', 51.17, 71.43], ['Алматы', 43.24, 76.89], ['Шымкент', 42.32, 69.59], ['Қарағанды', 49.80, 73.10], ['Тараз', 42.90, 71.37], ['Павлодар', 52.29, 76.97], ['Өскемен', 49.95, 82.61], ['Семей', 50.41, 80.25], ['Атырау', 47.11, 51.92], ['Қостанай', 53.21, 63.63], ['Орал', 51.23, 51.37], ['Петропавл', 54.87, 69.15], ['Ақтау', 43.65, 51.17], ['Түркістан', 43.30, 68.25], ['Қызылорда', 44.85, 65.51], ['Сарыағаш', 41.45, 69.17]];
const STARS = [['Сириус (Сүмбіле)', -16.72], ['Вега', 38.78], ['Альтаир', 8.87], ['Капелла', 46.0], ['Темірқазық', 89.26], ['Бетельгейзе', 7.41], ['Антарес', -26.43], ['Дубхе (Жетіқарақшы)', 61.75]];
const dm = x => { const s = x < 0 ? '−' : ''; x = Math.abs(x); let d = Math.floor(x), m = Math.round((x - d) * 60); if (m === 60) { d++; m = 0; } return s + d + '°' + String(m).padStart(2, '0') + '′'; };
function culm(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:380px"><svg></svg></div></div>
  <div class="ctl"><label>Қала<select id="u-c">${CITIES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join('')}<option value="-1">Солтүстік полюс</option><option value="-2">Экватор</option></select></label>
  <label>Ендік φ = <b id="u-fv"></b><input type="range" id="u-f" min="-90" max="90" step="0.05"></label>
  <label>Жұлдыз<select id="u-s">${STARS.map((s, i) => `<option value="${i}">${s[0]}</option>`).join('')}</select></label>
  <label>Еңістік δ = <b id="u-dv"></b><input type="range" id="u-d" min="-90" max="90" step="0.05"></label>
  <div class="out"><div><small>Жоғарғы шарықтау</small><b id="u-h1"></b></div><div><small>Төменгі шарықтау</small><b id="u-h2"></b></div></div>
  <div class="note" id="u-st"></div></div></div>`;
  const $ = s => h.querySelector(s), svg = h.querySelector('svg');
  let phi = 43.24, del = -16.72;
  const draw = () => {
    const W = svg.clientWidth, H = svg.clientHeight; if (!W) return;
    const cx = W / 2, cy = H / 2 + 6, R = Math.min(W / 2 - 54, H / 2 - 36);
    const pt = (th, r = R) => [cx + r * Math.cos(th * Math.PI / 180), cy - r * Math.sin(th * Math.PI / 180)];
    const tU = 90 - phi + del, tL = 270 - phi - del, tP = 180 - phi, tE = 90 - phi;
    const [ux, uy] = pt(tU), [lx, ly] = pt(tL), [px, py] = pt(tP), [qx, qy] = pt(tP + 180), [ex, ey] = pt(tE), [fx, fy] = pt(tE + 180);
    const hU = 90 - Math.abs(phi - del), hL = Math.abs(phi + del) - 90;
    let seg = '';
    if (hU > 0 && hL < 0) { const ix = ux + (lx - ux) * (cy - uy) / (ly - uy); seg = `<line x1="${ux}" y1="${uy}" x2="${ix}" y2="${cy}" stroke="${C.gold}" stroke-width="4"/>`; }
    else if (hL >= 0) seg = `<line x1="${ux}" y1="${uy}" x2="${lx}" y2="${ly}" stroke="${C.gold}" stroke-width="4"/>`;
    svg.innerHTML = `<rect x="0" y="${cy}" width="${W}" height="${H - cy}" fill="#0b2a22" opacity=".55"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
      <line x1="${cx - R - 20}" y1="${cy}" x2="${cx + R + 20}" y2="${cy}" stroke="${C.ok}" stroke-width="2"/>
      <line x1="${qx}" y1="${qy}" x2="${px}" y2="${py}" stroke="${C.mut}" stroke-dasharray="5 5"/>
      <line x1="${ex}" y1="${ey}" x2="${fx}" y2="${fy}" stroke="${C.sky}" stroke-dasharray="3 4"/>
      <line x1="${ux}" y1="${uy}" x2="${lx}" y2="${ly}" stroke="${C.gold}" stroke-opacity=".35" stroke-width="2"/>${seg}
      <circle cx="${px}" cy="${py}" r="4" fill="${C.ink}"/><circle cx="${ux}" cy="${uy}" r="7" fill="${C.gold}"/><circle cx="${lx}" cy="${ly}" r="5" fill="${C.gold}" opacity=".6"/>
      <g font-size="13" font-family="Golos Text, sans-serif" paint-order="stroke" stroke="${C.bg}" stroke-width="4">
      <text x="${cx}" y="${cy - R - 10}" text-anchor="middle" fill="${C.ink}">Зенит</text>
      <text x="${cx + R + 8}" y="${cy - 8}" text-anchor="end" fill="${C.ok}">О</text><text x="${cx - R - 8}" y="${cy - 8}" fill="${C.ok}">С</text>
      <text x="${px + (px < cx ? -8 : 8)}" y="${py - 8}" text-anchor="${px < cx ? 'end' : 'start'}" fill="${C.ink}">Дүние полюсі</text>
      <text x="${ex + (ex > cx ? 8 : -8)}" y="${ey + 16}" text-anchor="${ex > cx ? 'start' : 'end'}" fill="${C.sky}">экватор</text>
      <text x="${cx + 10}" y="${cy + 18}" fill="${C.ok}">көкжиек</text></g>`;
  };
  const calc = () => {
    $('#u-f').value = phi; $('#u-d').value = del; $('#u-fv').textContent = dm(phi); $('#u-dv').textContent = dm(del);
    const hU = 90 - Math.abs(phi - del), hL = Math.abs(phi + del) - 90;
    const side = del < phi ? 'зениттің оңтүстігінде' : del > phi ? 'зениттің солтүстігінде' : 'дәл зенитте';
    $('#u-h1').textContent = dm(hU); $('#u-h2').textContent = dm(hL);
    $('#u-st').innerHTML = hU <= 0 ? '<b>Бұл жұлдыз бұл ендікте ешқашан шықпайды.</b>' : hL >= 0 ? `<b>Жұлдыз батпайды</b> – тәулік бойы көкжиектен жоғары. Жоғарғы шарықтау ${side}, биіктігі ${dm(hU)}.` : `<b>Жұлдыз шығып-батады.</b> Жоғарғы шарықтау ${side}, биіктігі h = 90° − |φ − δ| = ${dm(hU)}.`;
    draw();
  };
  new ResizeObserver(draw).observe(svg);
  $('#u-c').onchange = e => { const i = +e.target.value; phi = i >= 0 ? CITIES[i][1] : i === -1 ? 90 : 0; calc(); };
  $('#u-s').onchange = e => { del = STARS[+e.target.value][1]; calc(); };
  $('#u-f').oninput = e => { phi = +e.target.value; calc(); };
  $('#u-d').oninput = e => { del = +e.target.value; calc(); };
  $('#u-c').value = 2; calc();
}

/* ---------- Уақыт ---------- */
function time(h) {
  const now = new Date(), hm = d => String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
  h.innerHTML = `<div class="lab"><div class="ctl"><label>Бүкіләлемдік уақыт (UTC, GMT)<input type="time" id="t-u" value="${hm(now)}"></label>
  <label>Қала<select id="t-c">${CITIES.map((c, i) => `<option value="${i}">${c[0]} (λ = ${num(c[2], 2)}°)</option>`).join('')}</select></label>
  <div class="out"><div><small>Белдеулік уақыт (UTC+5)</small><b id="t-z"></b></div><div><small>Жергілікті орташа күн уақыты</small><b id="t-l"></b></div><div><small>Айырмасы</small><b id="t-d"></b></div></div>
  <p class="small muted">T<sub>жерг</sub> = UT + λ/15°. 2024 жылғы 1 наурыздан бастап Қазақстанның бүкіл аумағы бір уақыт белдеуінде – UTC+5.</p>
  <div class="card"><b>Екі бойлықтың уақыт айырмасы</b><div class="grid g2" style="margin-top:10px"><label>λ₁, градус<input type="number" id="t-a" value="89.333" step="any"></label><label>λ₂, градус<input type="number" id="t-b" value="46.5" step="any"></label></div><div style="margin-top:8px">Δt = <b id="t-ab"></b></div></div></div>
  <div><div class="card"><b>Қазақстан қалаларындағы жергілікті уақыт</b><p class="small muted" style="margin:4px 0 10px">Жолақ – жергілікті уақыттың белдеулік уақыттан айырмасы (минут).</p><div id="t-rows"></div></div></div></div>` + code(`from datetime import datetime, timedelta, timezone

utc = datetime.now(timezone.utc)                 # бүкіләлемдік уақыт
cities = {'Орал': 51.37, 'Ақтөбе': 57.17, 'Астана': 71.43, 'Алматы': 76.89, 'Өскемен': 82.61}

zone = utc + timedelta(hours=5)                  # Қазақстан: UTC+5
print('Белдеулік уақыт:', zone.strftime('%H:%M'))
for city, lon in cities.items():
    local = utc + timedelta(hours=lon / 15)      # жергілікті орташа күн уақыты
    diff = (lon / 15 - 5) * 60
    print(f'{city:8s} {local:%H:%M:%S}   ({diff:+.0f} мин)')`);
  const $ = s => h.querySelector(s);
  const fmt = m => { m = ((m % 1440) + 1440) % 1440; const H = Math.floor(m / 60), M = Math.floor(m % 60), S = Math.round((m * 60) % 60); return String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0') + ':' + String(S % 60).padStart(2, '0'); };
  const dur = m => { const s = m < 0 ? '−' : '+'; m = Math.abs(m); const H = Math.floor(m / 60), M = Math.floor(m % 60), S = Math.round((m * 60) % 60); return s + (H ? H + ' сағ ' : '') + M + ' мин' + (S ? ' ' + S + ' с' : ''); };
  const calc = () => {
    const [H, M] = ($('#t-u').value || '00:00').split(':').map(Number), ut = H * 60 + M, c = CITIES[+$('#t-c').value];
    $('#t-z').textContent = fmt(ut + 300).slice(0, 5); $('#t-l').textContent = fmt(ut + c[2] * 4); $('#t-d').textContent = dur(c[2] * 4 - 300);
    const d = Math.abs(parseFloat($('#t-a').value) - parseFloat($('#t-b').value)) * 4;
    $('#t-ab').textContent = Number.isFinite(d) ? dur(d).replace('+', '') : '—';
    const rows = [...CITIES].sort((a, b) => a[2] - b[2]);
    $('#t-rows').innerHTML = rows.map(r => { const off = r[2] * 4 - 300, w = Math.abs(off) / 100 * 50; return `<div class="row" style="flex-wrap:nowrap;margin:5px 0;gap:8px"><span style="width:6.6em;flex:none" class="small">${r[0]}</span><div style="flex:1;position:relative;height:12px;background:var(--bg2);border-radius:6px"><i style="position:absolute;top:0;bottom:0;${off < 0 ? 'right:50%' : 'left:50%'};width:${w}%;background:${off < 0 ? C.sky : C.gold};border-radius:6px"></i><i style="position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:var(--mut)"></i></div><span class="small" style="width:4.4em;flex:none;text-align:right;white-space:nowrap">${fmt(ut + r[2] * 4).slice(0, 5)}</span></div>`; }).join('');
  };
  ['#t-u', '#t-c', '#t-a', '#t-b'].forEach(s => $(s).oninput = calc);
  calc();
}

/* ---------- Жұлдыздық шама ---------- */
function mag(h) {
  const S = [['Сириус', -1.46, 1.42], ['Вега', 0.03, 0.58], ['Бетельгейзе', 0.42, -5.85], ['Темірқазық', 1.98, -3.64], ['Алькор', 3.99, 2.0], ['Күн', -26.74, 4.83]];
  h.innerHTML = `<div class="lab"><div class="ctl"><div class="chips">${S.map((s, i) => `<button class="chip" type="button" data-i="${i}" style="cursor:pointer">${s[0]}</button>`).join('')}</div>
  <div class="grid g2"><label>Көрінерлік шама m<input type="number" id="m-m" step="0.01"></label><label>Абсолюттік шама M<input type="number" id="m-M" step="0.01"></label></div>
  <div class="out"><div><small>Қашықтық r = 10<sup>(m − M + 5)/5</sup></small><b id="m-r"></b></div><div><small>Жарық жылымен</small><b id="m-ly"></b></div><div><small>Жарқырауы L/L☉</small><b id="m-L"></b></div></div>
  <p class="small muted">m − M = 5·lg r − 5 (r – парсекпен). Күннің абсолюттік шамасы M☉ = 4,83, сондықтан L/L☉ = 10<sup>0,4·(4,83 − M)</sup>. Погсон: шамасы 1-ге кем жұлдыз 2,512 есе жарық.</p></div>
  <div class="card"><b>Шкалада салыстыру</b><p class="small muted">Сол жақ – жарығырақ (шама кіші).</p><div id="m-sc"></div></div></div>` + code(`import math

stars = {'Сириус': (-1.46, 1.42), 'Бетельгейзе': (0.42, -5.85),
         'Темірқазық': (1.98, -3.64), 'Алькор': (3.99, 2.0)}   # (m, M)

for name, (m, M) in stars.items():
    r = 10 ** ((m - M + 5) / 5)                  # парсек
    L = 10 ** (0.4 * (4.83 - M))                 # Күнмен салыстырғанда
    print(f'{name:11s} r = {r:7.1f} пк ({r*3.26:7.0f} ж.ж.)   L = {L:9.1f} L☉')

# Погсон формуласы: екі жұлдыздың жарықтық қатынасы
m1, m2 = -1.46, 3.99
print('Сириус Алькордан', round(2.512 ** (m2 - m1)), 'есе жарық көрінеді')`);
  const $ = s => h.querySelector(s);
  const calc = () => {
    const m = parseFloat($('#m-m').value), M = parseFloat($('#m-M').value), r = 10 ** ((m - M + 5) / 5);
    $('#m-r').textContent = r < 0.001 ? sci(r * 206265, 3) + ' а.б.' : num(r, 2) + ' пк'; $('#m-ly').textContent = num(r * 3.2616, r < 1 ? 5 : 1); $('#m-L').textContent = sci(10 ** (0.4 * (4.83 - M)), 2);
    const lo = -8, hi = 8, pos = x => (Math.max(lo, Math.min(hi, x)) - lo) / (hi - lo) * 100;
    $('#m-sc').innerHTML = `<div style="position:relative;height:96px;margin-top:12px"><div style="position:absolute;left:0;right:0;top:46px;height:2px;background:var(--line)"></div>
      <div style="position:absolute;left:${pos(m)}%;top:12px;transform:translateX(-50%);text-align:center" class="small"><span style="color:var(--sky2)">m = ${num(m, 2)}</span><div style="width:14px;height:14px;border-radius:50%;background:var(--sky);margin:6px auto 0"></div></div>
      <div style="position:absolute;left:${pos(M)}%;top:42px;transform:translateX(-50%);text-align:center" class="small"><div style="width:14px;height:14px;border-radius:50%;background:var(--gold);margin:0 auto 6px"></div><span style="color:var(--gold)">M = ${num(M, 2)}</span></div></div>
      <div class="row small muted" style="justify-content:space-between"><span>−8</span><span>0</span><span>+8</span></div>`;
  };
  const set = i => { $('#m-m').value = S[i][1]; $('#m-M').value = S[i][2]; calc(); };
  h.querySelectorAll('[data-i]').forEach(b => b.onclick = () => set(+b.dataset.i));
  $('#m-m').oninput = calc; $('#m-M').oninput = calc; set(0);
}

/* ---------- Марстың ілмек қозғалысы ---------- */
function retro(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:430px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button><button class="btn ghost" type="button" id="r-reset">Басынан</button></div></div>
  <div class="ctl"><p>Жоғарыда – Күн, Жер және Марс орбиталары (Коперник жүйесі). Төменгі жолақта – Жерден қарағанда Марстың жұлдыздар фонындағы орны. Жер Марсты басып озғанда (қарсы тұру кезінде) Марс біраз уақыт кері жылжиды – «ілмек» сызады.</p>
  <div class="out"><div><small>Уақыт</small><b id="r-t"></b></div><div><small>Марстың көрінерлік қозғалысы</small><b id="r-dir" style="white-space:normal;font-size:16px"></b></div></div>
  <p class="small muted">Ілмек айқын көрінуі үшін Марс орбитасының көлбеулігі (1,85°) 8 есе үлкейтілген. Марстың эклиптикалық бойлығы жолақтың ортасына келтірілген.</p></div></div>`;
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  let t = 0, trail = [], prevL = null, dirTxt = '';
  const pos = tt => {
    const ae = 2 * Math.PI * tt, am = 2 * Math.PI * tt / 1.8808 + 0.9;
    const E = [Math.cos(ae), Math.sin(ae), 0], i = 1.85 * 8 * Math.PI / 180;
    const M = [1.524 * Math.cos(am), 1.524 * Math.sin(am) * Math.cos(i), 1.524 * Math.sin(am) * Math.sin(i)];
    const d = [M[0] - E[0], M[1] - E[1], M[2] - E[2]];
    return { E, M, L: Math.atan2(d[1], d[0]), B: Math.atan2(d[2], Math.hypot(d[0], d[1])) };
  };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const top = H * 0.62, cx = W / 2, cy = top / 2 + 6, R = Math.min(W / 2 - 20, top / 2 - 14) / 1.6;
    [1, 1.524].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r * R, 0, 7); ctx.strokeStyle = 'rgba(122,217,238,.25)'; ctx.stroke(); });
    const p = pos(t);
    dot(ctx, cx, cy, 8, C.gold, 16);
    const ex = cx + p.E[0] * R, ey = cy - p.E[1] * R, mx = cx + p.M[0] * R, my = cy - p.M[1] * R;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + (mx - ex) * 3, ey + (my - ey) * 3); ctx.strokeStyle = 'rgba(244,200,74,.45)'; ctx.stroke();
    dot(ctx, ex, ey, 5, '#4fb0ff'); dot(ctx, mx, my, 4.5, '#e0704a');
    label(ctx, 'Жер', ex + 8, ey - 6, C.mut, 'left', 12); label(ctx, 'Марс', mx + 8, my - 6, '#e0a080', 'left', 12);
    const y0 = top + 10, hh = H - y0 - 10;
    ctx.fillStyle = '#071c26'; ctx.fillRect(0, y0, W, hh);
    let s1 = 7; for (let k = 0; k < 60; k++) { s1 = s1 * 16807 % 2147483647; const x = s1 % 1000 / 1000 * W; s1 = s1 * 16807 % 2147483647; const y = y0 + s1 % 1000 / 1000 * hh; dot(ctx, x, y, 0.9, '#cfe'); }
    const Lc = p.L, mapX = (L) => { let d = L - Lc; d = Math.atan2(Math.sin(d), Math.cos(d)); return W / 2 + d / (Math.PI / 3) * W / 2; };
    const mapY = B => y0 + hh / 2 - B / 0.3 * (hh / 2 - 8);
    ctx.beginPath(); trail.forEach((q, j) => { const x = mapX(q.L), y = mapY(q.B); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = '#e0704a'; ctx.lineWidth = 2; ctx.stroke();
    dot(ctx, mapX(p.L), mapY(p.B), 5, '#ff9a70', 8);
    label(ctx, 'жұлдыздар фоны', 10, y0 + 18, C.mut, 'left', 12);
  };
  const st = canvas(fig, draw);
  const step = dt => {
    t += dt * 0.25; const p = pos(t); trail.push(p); if (trail.length > 900) trail.shift();
    if (prevL != null) { let d = p.L - prevL; d = Math.atan2(Math.sin(d), Math.cos(d)); dirTxt = d >= 0 ? 'тура (батыстан шығысқа)' : 'кері (ілмек)'; }
    prevL = p.L; $('#r-t').textContent = num(t * 12, 1) + ' ай'; $('#r-dir').textContent = dirTxt; draw(st);
  };
  for (let k = 0; k < 40; k++) step(0.05);
  const lp = loop(fig, step, true); playBtn(h, lp);
  $('#r-reset').onclick = () => { t = 0; trail = []; prevL = null; step(0); };
}

/* ---------- Жылжымалы жұлдыз картасы ---------- */
const PST = {
  dubhe: [11.062, 61.75, 1.8], merak: [11.031, 56.38, 2.4], phecda: [11.897, 53.69, 2.4], megrez: [12.257, 57.03, 3.3], alioth: [12.900, 55.96, 1.8], mizar: [13.399, 54.93, 2.2], alkaid: [13.792, 49.31, 1.9],
  polaris: [2.53, 89.26, 2.0], yildun: [17.537, 86.59, 4.4], epsU: [16.766, 82.04, 4.2], zetU: [15.734, 77.79, 4.3], etaU: [16.292, 75.76, 4.9], kochab: [14.845, 74.16, 2.1], pherkad: [15.345, 71.83, 3.0],
  caph: [0.153, 59.15, 2.3], schedar: [0.675, 56.54, 2.2], gamC: [0.945, 60.72, 2.4], ruchbah: [1.430, 60.24, 2.7], segin: [1.907, 63.67, 3.4],
  deneb: [20.690, 45.28, 1.3], sadr: [20.370, 40.26, 2.2], gienah: [20.770, 33.97, 2.5], delC: [19.750, 45.13, 2.9], albireo: [19.512, 27.96, 3.1],
  vega: [18.616, 38.78, 0.0], zetL: [18.746, 37.61, 4.3], sheliak: [18.835, 33.36, 3.5], sulafat: [18.982, 32.69, 3.3], delL: [18.908, 36.90, 4.3],
  altair: [19.846, 8.87, 0.8], tarazed: [19.771, 10.61, 2.7], alshain: [19.922, 6.41, 3.7],
  betel: [5.919, 7.41, 0.5], rigel: [5.242, -8.20, 0.1], bellatrix: [5.419, 6.35, 1.6], mintaka: [5.533, -0.30, 2.2], alnilam: [5.604, -1.20, 1.7], alnitak: [5.679, -1.94, 1.8], saiph: [5.796, -9.67, 2.1],
  sirius: [6.752, -16.72, -1.4], aldebaran: [4.599, 16.51, 0.9], capella: [5.278, 46.0, 0.1], menk: [5.992, 44.95, 1.9], thetaA: [5.995, 37.21, 2.6], alnath: [5.438, 28.61, 1.7], hass: [4.950, 33.17, 2.7],
  castor: [7.577, 31.89, 1.6], pollux: [7.755, 28.03, 1.1], procyon: [7.655, 5.22, 0.4],
  regulus: [10.140, 11.97, 1.4], algieba: [10.333, 19.84, 2.0], zosma: [11.235, 20.52, 2.6], denebola: [11.818, 14.57, 2.1], chertan: [11.237, 15.43, 3.3],
  arcturus: [14.261, 19.18, 0.0], spica: [13.420, -11.16, 1.0], antares: [16.490, -26.43, 1.0],
  markab: [23.079, 15.21, 2.5], scheat: [23.063, 28.08, 2.4], algenib: [0.220, 15.18, 2.8], alpheratz: [0.140, 29.09, 2.1], mirach: [1.162, 35.62, 2.1], almach: [2.065, 42.33, 2.1],
  mirfak: [3.405, 49.86, 1.8], algol: [3.136, 40.96, 2.1]
};
const PLINES = 'dubhe-merak merak-phecda phecda-megrez megrez-dubhe megrez-alioth alioth-mizar mizar-alkaid polaris-yildun yildun-epsU epsU-zetU zetU-kochab kochab-pherkad pherkad-etaU etaU-zetU caph-schedar schedar-gamC gamC-ruchbah ruchbah-segin deneb-sadr sadr-albireo delC-sadr sadr-gienah vega-zetL zetL-sheliak sheliak-sulafat sulafat-delL delL-zetL tarazed-altair altair-alshain betel-bellatrix betel-alnitak bellatrix-mintaka mintaka-alnilam alnilam-alnitak alnitak-saiph mintaka-rigel capella-menk menk-thetaA thetaA-alnath alnath-hass hass-capella castor-pollux regulus-algieba algieba-zosma zosma-denebola denebola-chertan chertan-regulus markab-scheat scheat-alpheratz alpheratz-algenib algenib-markab alpheratz-mirach mirach-almach mirfak-algol'.split(' ').map(s => s.split('-'));
const PNAMES = [['polaris', 'Темірқазық', 0, -12], ['megrez', 'Жетіқарақшы', 0, -14], ['sirius', 'Сүмбіле', 0, 22], ['vega', 'Вега', 12, 4], ['capella', 'Капелла', 12, 4], ['arcturus', 'Арктур', 12, 4], ['schedar', 'Кассиопея', 0, 22], ['deneb', 'Аққу', 12, -6], ['altair', 'Альтаир', 12, 4], ['aldebaran', 'Альдебаран', 12, 4], ['regulus', 'Арыстан', 12, 4], ['rigel', 'Орион', 12, 14]];
function planisphere(o = {}) {
  const phiD = o.phi ?? 50.28, rot = o.rot ?? null, phi = phiD * Math.PI / 180;
  const cx = 400, cy = 400, R = 330, k = R / 135, f = v => v.toFixed(1);
  const P = (ra, de) => { const a = ra * 15 * Math.PI / 180, r = k * (90 - de); return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
  const T = (x, y, txt, attr) => `<text x="${f(x)}" y="${f(y)}" ${attr}${rot != null ? ` transform="rotate(${-rot} ${f(x)} ${f(y)})"` : ''}>${txt}</text>`;
  let g = `<circle cx="${cx}" cy="${cy}" r="${R + 42}" fill="#0e3345"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#skyg)"/>`;
  for (let h = 0; h < 24; h++) { const a = h * 15 * Math.PI / 180, r1 = R + 3, r2 = R + 12; g += `<line x1="${f(cx + r1 * Math.sin(a))}" y1="${f(cy - r1 * Math.cos(a))}" x2="${f(cx + r2 * Math.sin(a))}" y2="${f(cy - r2 * Math.cos(a))}" stroke="#7ad9ee"/>` + T(cx + (R + 27) * Math.sin(a), cy - (R + 27) * Math.cos(a) + 5, h + 'ʰ', 'text-anchor="middle" font-size="15" fill="#a3bfca"'); }
  [60, 30, 0, -30].forEach(d => g += `<circle cx="${cx}" cy="${cy}" r="${f(k * (90 - d))}" fill="none" stroke="#38c3e2" stroke-opacity="${d === 0 ? .35 : .14}" ${d === 0 ? '' : 'stroke-dasharray="3 6"'}/>`);
  for (let h = 0; h < 24; h += 2) { const [x, y] = P(h, -45); g += `<line x1="${cx}" y1="${cy}" x2="${f(x)}" y2="${f(y)}" stroke="#38c3e2" stroke-opacity=".1"/>`; }
  let ec = ''; for (let i = 0; i <= 72; i++) { const Lm = i * 5 * Math.PI / 180, e = 23.44 * Math.PI / 180; const ra = Math.atan2(Math.sin(Lm) * Math.cos(e), Math.cos(Lm)) * 12 / Math.PI, de = Math.asin(Math.sin(e) * Math.sin(Lm)) * 180 / Math.PI; const [x, y] = P((ra + 24) % 24, de); ec += (i ? 'L' : 'M') + f(x) + ' ' + f(y); }
  g += `<path d="${ec}" fill="none" stroke="#f4c84a" stroke-opacity=".55" stroke-dasharray="6 5"/>`;
  PLINES.forEach(([a, b]) => { const [x1, y1] = P(PST[a][0], PST[a][1]), [x2, y2] = P(PST[b][0], PST[b][1]); g += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#7ad9ee" stroke-opacity=".55" stroke-width="1.2"/>`; });
  Object.values(PST).forEach(([ra, de, m]) => { const [x, y] = P(ra, de); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(1.3, 4.6 - m * 0.95))}" fill="${m < 0.6 ? '#fff6d8' : '#eaf4f7'}"/>`; });
  [[3.79, 24.1], [3.75, 24.4], [3.82, 23.9], [3.77, 23.6], [3.71, 24.2], [3.80, 24.6]].forEach(([ra, de]) => { const [x, y] = P(ra, de); g += `<circle cx="${f(x)}" cy="${f(y)}" r="1.4" fill="#dff"/>`; });
  const [ux, uy] = P(3.79, 24.1); g += T(ux, uy - 10, 'Үркер', 'text-anchor="middle" font-size="15" fill="#cfe3ea"');
  PNAMES.forEach(([id, t, dx, dy]) => { const [x, y] = P(PST[id][0], PST[id][1]); g += T(x + dx, y + dy, t, `text-anchor="${dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle'}" font-size="15" fill="#cfe3ea"`); });
  const hp = A => { const de = Math.asin(Math.cos(phi) * Math.cos(A)) * 180 / Math.PI, H = Math.atan2(-Math.sin(A), -Math.sin(phi) * Math.cos(A)), al = Math.PI - H; return [de, al]; };
  let hz = ''; for (let i = 0; i <= 120; i++) { const [de, al] = hp(i * 3 * Math.PI / 180), r = k * (90 - de); hz += (i ? 'L' : 'M') + f(cx + r * Math.sin(al)) + ' ' + f(cy - r * Math.cos(al)); }
  const cover = `<path d="M${cx - R - 1} ${cy}a${R + 1} ${R + 1} 0 1 0 ${2 * R + 2} 0a${R + 1} ${R + 1} 0 1 0 ${-2 * R - 2} 0Z${hz}Z" fill="#0b2a38" fill-opacity=".86" fill-rule="evenodd"/><path d="${hz}Z" fill="none" stroke="#38c3e2" stroke-width="2"/>`;
  const comp = [['Солтүстік', 0], ['Оңтүстік', 180], ['Шығыс', 90], ['Батыс', 270]].map(([t, A]) => { const [de, al] = hp(A * Math.PI / 180), r = k * (90 - de) + (A === 0 ? -20 : 22); return `<text x="${f(cx + r * Math.sin(al))}" y="${f(cy - r * Math.cos(al) + 5)}" text-anchor="middle" font-size="16" font-weight="600" fill="#7ad9ee" paint-order="stroke" stroke="#0b2a38" stroke-width="5">${t}</text>`; }).join('');
  return `<svg viewBox="0 0 800 800" role="img" aria-label="Жұлдызды аспанның жылжымалы картасы, ендік ${num(phiD, 1)}°"><defs><radialGradient id="skyg"><stop offset="0" stop-color="#0d3a4f"/><stop offset="1" stop-color="#051720"/></radialGradient></defs>
  <g ${rot == null ? 'class="spin"' : `transform="rotate(${rot} 400 400)"`} font-family="Golos Text, sans-serif">${g}</g>${cover}${comp}</svg>`;
}
const STARNAMES = [['polaris', 'Темірқазық'], ['vega', 'Вега'], ['capella', 'Капелла'], ['arcturus', 'Арктур'], ['altair', 'Альтаир'], ['deneb', 'Денеб'], ['sirius', 'Сүмбіле (Сириус)'], ['betel', 'Бетельгейзе'], ['rigel', 'Ригель'], ['aldebaran', 'Альдебаран'], ['procyon', 'Процион'], ['regulus', 'Регул'], ['spica', 'Спика'], ['antares', 'Антарес'], ['pollux', 'Поллукс'], ['dubhe', 'Дубхе (Жетіқарақшы)'], ['schedar', 'Шедар (Кассиопея)']];
const gmst = d => ((18.697374558 + 24.06570982441908 * (d.getTime() / 864e5 + 2440587.5 - 2451545)) % 24 + 24) % 24;
function plani(h) {
  const pad = n => String(n).padStart(2, '0'), now = new Date(Date.now() + 5 * 36e5);
  h.innerHTML = `<div class="lab"><div><div class="sky" style="max-width:560px;margin:0 auto" id="pl-sky"></div><div class="row" style="margin-top:10px;justify-content:center"><button class="btn ghost play" type="button"></button><button class="btn ghost" type="button" id="pl-now">Қазір</button></div></div>
  <div class="ctl"><label>Қала<select id="pl-c">${CITIES.map((c, i) => `<option value="${i}">${c[0]} (φ = ${num(c[1], 1)}°)</option>`).join('')}</select></label>
  <div class="grid g2"><label>Күні<input type="date" id="pl-d" value="${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}"></label><label>Уақыты (UTC+5)<input type="time" id="pl-t" value="${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}"></label></div>
  <label>Уақытты жылжыту: <b id="pl-hv"></b><input type="range" id="pl-h" min="0" max="1439" step="5"></label>
  <div class="out"><div><small>Жергілікті жұлдыздық уақыт</small><b id="pl-s"></b></div><div><small>Көкжиектен жоғары жарық жұлдыздар</small><b id="pl-n"></b></div></div>
  <div class="card" style="padding:14px"><b>Қазір аспанда</b><div id="pl-v" class="small" style="margin-top:6px;columns:2 140px"></div></div>
  <p class="small muted">Сопақ терезе – көкжиек. Терезе ішіндегі жұлдыздар осы сәтте көрінеді. Оңтүстік – төменде, шығыс – сол жақта (аспанға қарап тұрғандай).</p></div></div>`;
  const $ = s => h.querySelector(s);
  let ci = 0, minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const date = () => { const [y, m, d] = ($('#pl-d').value || '2026-01-01').split('-').map(Number); return Date.UTC(y, m - 1, d) + (minutes - 300) * 60000; };
  const upd = () => {
    const c = CITIES[ci], t = new Date(date()), lst = (gmst(t) + c[2] / 15 + 24) % 24;
    $('#pl-sky').innerHTML = planisphere({ phi: c[1], rot: 180 - 15 * lst });
    $('#pl-h').value = minutes; const hh = pad(Math.floor(minutes / 60) % 24) + ':' + pad(minutes % 60); $('#pl-hv').textContent = hh; $('#pl-t').value = hh;
    $('#pl-s').textContent = pad(Math.floor(lst)) + ' сағ ' + pad(Math.floor(lst % 1 * 60)) + ' мин';
    const ph = c[1] * Math.PI / 180;
    const vis = STARNAMES.map(([id, n]) => { const [ra, de] = PST[id], H = (lst - ra) * 15 * Math.PI / 180, d = de * Math.PI / 180; return [n, Math.asin(Math.sin(ph) * Math.sin(d) + Math.cos(ph) * Math.cos(d) * Math.cos(H)) * 180 / Math.PI]; }).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    $('#pl-n').textContent = vis.length + ' / ' + STARNAMES.length;
    $('#pl-v').innerHTML = vis.map(([n, a]) => `<div>${n} <span class="muted">${num(a, 0)}°</span></div>`).join('') || 'Жарық жұлдыздар көкжиектен төмен.';
  };
  $('#pl-c').onchange = e => { ci = +e.target.value; upd(); };
  $('#pl-d').onchange = upd;
  $('#pl-t').onchange = e => { const [a, b] = e.target.value.split(':').map(Number); minutes = a * 60 + b; upd(); };
  $('#pl-h').oninput = e => { minutes = +e.target.value; upd(); };
  $('#pl-now').onclick = () => { const n = new Date(Date.now() + 5 * 36e5); $('#pl-d').value = `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())}`; minutes = n.getUTCHours() * 60 + n.getUTCMinutes(); upd(); };
  let acc = 0;
  const lp = loop($('#pl-sky'), dt => { acc += dt; if (acc > 0.12) { acc = 0; minutes = (minutes + 5) % 1440; upd(); } });
  if (lp.on) lp.toggle();
  playBtn(h, lp); upd();
}

/* ---------- Ай фазалары ---------- */
const moonPhase = d => d < 10 || d >= 350 ? 'Жаңа ай' : d < 80 ? 'Өспелі орақ ай' : d < 100 ? 'Бірінші ширек' : d < 170 ? 'Өспелі дөңес ай' : d < 190 ? 'Толған ай' : d < 260 ? 'Кемімелі дөңес ай' : d < 280 ? 'Соңғы ширек' : 'Кемімелі орақ ай';
function drawMoon(ctx, x, y, r, th) {
  const dark = '#24333c', lit = '#f2ecd8', c = Math.cos(th), wax = Math.sin(th) >= 0;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = dark; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !wax); ctx.closePath(); ctx.fillStyle = lit; ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, r * Math.abs(c)), r, 0, 0, 7); ctx.fillStyle = c > 0 ? dark : lit; ctx.fill();
}
function moon(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:380px"></div><div class="row" style="margin-top:10px"><button class="btn ghost play" type="button"></button></div></div>
  <div class="ctl"><label>Айдың орбитадағы орны (Күннен бұрыштық қашықтығы): <b id="mo-av"></b><input type="range" id="mo-a" min="0" max="359" step="1"></label>
  <div class="chips">${[['Жаңа ай', 0], ['Бірінші ширек', 90], ['Толған ай', 180], ['Соңғы ширек', 270]].map(p => `<button class="chip" type="button" data-a="${p[1]}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <div class="out"><div><small>Фаза</small><b id="mo-p" style="white-space:normal;font-size:17px"></b></div><div><small>Жарықталған бөлігі</small><b id="mo-k"></b></div><div><small>Айдың жасы</small><b id="mo-d"></b></div><div><small>Шамамен шығу уақыты</small><b id="mo-r"></b></div></div>
  <p class="small muted">Синодтық ай ≈ 29,53 тәулік. Сол жақта – солтүстіктен қарағандағы көрініс (Күн сол жақта), оң жақта – Жерден көрінетін Ай. Шығу уақыты күн мен түн тең кезге шамамен берілген.</p></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt

days = np.linspace(0, 29.53, 300)          # синодтық ай, тәулік
theta = 2 * np.pi * days / 29.53            # Айдың Күннен бұрыштық қашықтығы
k = (1 - np.cos(theta)) / 2                 # жарықталған бөлігі

plt.plot(days, k * 100)
plt.xlabel('Айдың жасы, тәулік'); plt.ylabel('Жарықталған бөлігі, %')
plt.title('Ай фазаларының өзгеруі'); plt.grid(alpha=.3); plt.show()`);
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  let a = 60;
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const narrow = W < 560, ox = narrow ? W / 2 : W * 0.36, oy = narrow ? H * 0.34 : H / 2, R = narrow ? Math.min(W * 0.36, H * 0.26) : Math.min(W * 0.26, H * 0.38);
    for (let i = 0; i < 7; i++) { const y = oy - R + i * R / 3; ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(28, y); ctx.strokeStyle = 'rgba(244,200,74,.55)'; ctx.stroke(); }
    label(ctx, 'Күн сәулесі', 8, oy - R - 10, C.gold);
    ctx.beginPath(); ctx.arc(ox, oy, R, 0, 7); ctx.strokeStyle = 'rgba(122,217,238,.3)'; ctx.setLineDash([4, 5]); ctx.stroke(); ctx.setLineDash([]);
    const ge = ctx.createLinearGradient(ox - 14, 0, ox + 14, 0); ge.addColorStop(0, '#6fc0ff'); ge.addColorStop(1, '#0f3550');
    ctx.beginPath(); ctx.arc(ox, oy, 14, 0, 7); ctx.fillStyle = ge; ctx.fill(); label(ctx, 'Жер', ox, oy + 30, C.mut, 'center');
    for (let d = 0; d < 360; d += 45) { const t = (180 + d) * Math.PI / 180, x = ox + R * Math.cos(t), y = oy - R * Math.sin(t) * -1; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = 'rgba(163,191,202,.5)'; ctx.fill(); }
    const t = (180 + a) * Math.PI / 180, mx = ox + R * Math.cos(t), my = oy - R * Math.sin(t);
    ctx.beginPath(); ctx.arc(mx, my, 10, 0, 7); ctx.fillStyle = '#24333c'; ctx.fill();
    ctx.beginPath(); ctx.arc(mx, my, 10, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fillStyle = '#f2ecd8'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(mx, my); ctx.strokeStyle = 'rgba(244,200,74,.35)'; ctx.stroke();
    const vx = narrow ? W / 2 : W * 0.8, vy = narrow ? H * 0.8 : H / 2, vr = narrow ? Math.min(W * 0.18, H * 0.14) : Math.min(W * 0.14, H * 0.3);
    drawMoon(ctx, vx, vy, vr, a * Math.PI / 180);
    label(ctx, 'Жерден көрінісі', vx, vy - vr - 12, C.mut, 'center');
  };
  const upd = () => {
    $('#mo-a').value = a; $('#mo-av').textContent = Math.round(a) + '°';
    $('#mo-p').textContent = moonPhase(a); $('#mo-k').textContent = num((1 - Math.cos(a * Math.PI / 180)) / 2 * 100, 0) + '%';
    $('#mo-d').textContent = num(a / 360 * 29.53, 1) + ' тәул.';
    const r = (6 + a / 360 * 24) % 24; $('#mo-r').textContent = String(Math.floor(r)).padStart(2, '0') + ':' + String(Math.round(r % 1 * 60) % 60).padStart(2, '0');
    draw(st);
  };
  const st = canvas(fig, draw);
  $('#mo-a').oninput = e => { a = +e.target.value; upd(); };
  h.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { a = +b.dataset.a; upd(); });
  const lp = loop(fig, dt => { a = (a + dt * 24) % 360; upd(); }, true); playBtn(h, lp); upd();
}

/* ---------- Жыл мезгілдері ---------- */
function seasons(h) {
  const MON = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
  const SEAS = ['қыс', 'қыс', 'көктем', 'көктем', 'көктем', 'жаз', 'жаз', 'жаз', 'күз', 'күз', 'күз', 'қыс'];
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:330px"><svg id="se-s"></svg></div><div class="fig" style="min-height:200px;margin-top:12px"><svg id="se-c"></svg></div></div>
  <div class="ctl"><label>Қала<select id="se-ci">${CITIES.map((c, i) => `<option value="${i}">${c[0]} (φ = ${num(c[1], 1)}°)</option>`).join('')}</select></label>
  <label>Күн: <b id="se-dv"></b><input type="range" id="se-d" min="1" max="365"></label>
  <div class="chips">${[['Көктемгі теңелу', 80], ['Жазғы тоқырау', 172], ['Күзгі теңелу', 266], ['Қысқы тоқырау', 356]].map(p => `<button class="chip" type="button" data-d="${p[1]}" style="cursor:pointer">${p[0]}</button>`).join('')}</div>
  <div class="out"><div><small>Күннің еңістігі δ☉</small><b id="se-de"></b></div><div><small>Түстегі биіктігі h = 90° − φ + δ☉</small><b id="se-h"></b></div><div><small>Күн ұзақтығы (шамамен)</small><b id="se-l"></b></div><div><small>1 м таяқтың көлеңкесі</small><b id="se-sh"></b></div></div>
  <p class="small muted">Жыл мезгілдері Жер осінің орбита жазықтығына 66,6° көлбеулігінен болады: Күннің түстегі биіктігі мен күн ұзақтығы өзгереді. Жер Күнге ең жақын (перигелий) қаңтардың басында болады.</p></div></div>`;
  const $ = s => h.querySelector(s);
  let ci = 0, N = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 864e5);
  const dec = n => -23.44 * Math.cos(2 * Math.PI * (n + 10) / 365);
  const calc = () => {
    const phi = CITIES[ci][1], de = dec(N), hN = 90 - phi + de, d = new Date(Date.UTC(2026, 0, N)), m = d.getUTCMonth();
    const cw = -Math.tan(phi * Math.PI / 180) * Math.tan(de * Math.PI / 180), L = Math.acos(Math.max(-1, Math.min(1, cw))) * 2 / Math.PI * 12;
    $('#se-d').value = N; $('#se-dv').textContent = d.getUTCDate() + ' ' + MON[m] + ' (' + SEAS[m] + ')';
    $('#se-de').textContent = dm(de); $('#se-h').textContent = dm(hN); $('#se-l').textContent = Math.floor(L) + ' сағ ' + Math.round(L % 1 * 60) + ' мин';
    $('#se-sh').textContent = hN > 0 ? num(1 / Math.tan(hN * Math.PI / 180), 2) + ' м' : '—';
    const s = $('#se-s'), W = s.clientWidth, H = s.clientHeight;
    if (W) {
      const gy = H - 50, px = W * 0.42, ar = Math.min(W * 0.4, gy - 30), hr = hN * Math.PI / 180, sx = px + ar * Math.cos(hr), sy = gy - ar * Math.sin(hr), poleH = 70, shL = Math.min(W * 0.5, poleH / Math.tan(Math.max(hr, 0.05)));
      s.innerHTML = `<defs><linearGradient id="se-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d4460"/><stop offset="1" stop-color="#1b6f8f"/></linearGradient></defs><rect width="${W}" height="${gy}" fill="url(#se-g)"/><rect y="${gy}" width="${W}" height="${H - gy}" fill="#1f3b2c"/>
      <path d="M${px + ar} ${gy}A${ar} ${ar} 0 0 0 ${px} ${gy - ar}" fill="none" stroke="#ffffff" stroke-opacity=".25" stroke-dasharray="4 6"/>
      <line x1="${px}" y1="${gy}" x2="${sx}" y2="${sy}" stroke="${C.gold}" stroke-opacity=".5"/>
      <circle cx="${sx}" cy="${sy}" r="16" fill="${C.gold}"/><circle cx="${sx}" cy="${sy}" r="26" fill="${C.gold}" opacity=".18"/>
      <rect x="${px - shL}" y="${gy - 1}" width="${shL}" height="7" rx="3" fill="#000" opacity=".55"/><text x="${px - shL / 2}" y="${gy + 40}" text-anchor="middle" font-family="Golos Text, sans-serif" font-size="13" fill="#a3bfca">көлеңке</text>
      <line x1="${px}" y1="${gy}" x2="${px}" y2="${gy - poleH}" stroke="#eaf4f7" stroke-width="4"/>
      <g font-family="Golos Text, sans-serif" font-size="13" fill="#eaf4f7" paint-order="stroke" stroke="#0d4460" stroke-width="4"><text x="${W - 10}" y="${gy + 22}" text-anchor="end">Оңтүстік</text><text x="10" y="${gy + 22}">Солтүстік</text><text x="${px + 40}" y="${gy - 10}">h = ${num(hN, 1)}°</text><text x="${px - 8}" y="${gy - poleH - 8}" text-anchor="middle">1 м</text></g>`;
    }
    const c = $('#se-c'), Wc = c.clientWidth, Hc = c.clientHeight;
    if (Wc) {
      const l = 40, r = 14, t = 16, b = 30, y = v => t + (90 - v) / 90 * (Hc - t - b), x = n => l + (n - 1) / 364 * (Wc - l - r);
      let p = ''; for (let n = 1; n <= 365; n += 4) p += (n === 1 ? 'M' : 'L') + x(n).toFixed(1) + ' ' + y(Math.max(0, 90 - phi + dec(n))).toFixed(1);
      c.innerHTML = `<g font-family="Golos Text, sans-serif" font-size="12" fill="#a3bfca">${[0, 30, 60, 90].map(v => `<line x1="${l}" x2="${Wc - r}" y1="${y(v)}" y2="${y(v)}" stroke="#1f4a5e"/><text x="${l - 6}" y="${y(v) + 4}" text-anchor="end">${v}°</text>`).join('')}
        ${[1, 91, 182, 274].map((n, i) => `<text x="${x(n)}" y="${Hc - 8}">${['қаң', 'сәу', 'шіл', 'қаз'][i]}</text>`).join('')}</g>
        <path d="${p}" fill="none" stroke="${C.sky}" stroke-width="2.5"/><circle cx="${x(N)}" cy="${y(Math.max(0, hN))}" r="6" fill="${C.gold}"/>
        <text x="${Wc - r}" y="${t + 10}" text-anchor="end" font-size="13" fill="#eaf4f7" font-family="Golos Text, sans-serif">Күннің түстегі биіктігі, жыл бойы</text>`;
    }
  };
  const ro = new ResizeObserver(calc); ro.observe($('#se-s'));
  $('#se-ci').onchange = e => { ci = +e.target.value; calc(); };
  $('#se-d').oninput = e => { N = +e.target.value; calc(); };
  h.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { N = +b.dataset.d; calc(); });
  calc();
}

/* ---------- Ньютонның II заңы ---------- */
function newton(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:300px"></div><div class="row" style="margin-top:10px"><button class="btn" type="button" id="nw-go">Бастау</button><button class="btn ghost" type="button" id="nw-re">Қайта қою</button></div></div>
  <div class="ctl"><label>Арбаның массасы m = <b id="nw-mv"></b> кг<input type="range" id="nw-m" min="1" max="50" step="1"></label>
  <label>Тарту күші F = <b id="nw-fv"></b> Н<input type="range" id="nw-f" min="0" max="200" step="1"></label>
  <label>Үйкеліс коэффициенті μ = <b id="nw-uv"></b><input type="range" id="nw-u" min="0" max="0.5" step="0.01"></label>
  <div class="out"><div><small>Үйкеліс күші μmg</small><b id="nw-ff"></b></div><div><small>Тең әсерлі күш</small><b id="nw-fr"></b></div><div><small>Үдеу a = F/m</small><b id="nw-a"></b></div><div><small>Жылдамдық / жол</small><b id="nw-v"></b></div></div>
  <p class="small muted">g = 9,8 м/с². Тарту күші үйкелістен аз болса, арба орнынан қозғалмайды (I заң). Жол ұзындығы 20 м.</p></div></div>`;
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  let m = 10, F = 50, mu = 0.1, x = 0, v = 0, t = 0, run = false;
  const forces = () => { const ff = mu * m * 9.8, net = F > ff || v > 0 ? F - ff : 0; return { ff, net, a: net / m }; };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const gy = H * 0.68, x0 = 30, x1 = W - 30, px = x0 + (x / 20) * (x1 - x0 - 90);
    ctx.fillStyle = '#123444'; ctx.fillRect(0, gy, W, H - gy);
    for (let i = 0; i <= 20; i += 5) { const xx = x0 + i / 20 * (x1 - x0 - 90) + 45; ctx.fillStyle = C.mut; ctx.fillRect(xx, gy + 2, 1, 8); label(ctx, i + ' м', xx, gy + 26, C.mut, 'center', 12); }
    const cw = 90, ch = 44 + m * 0.6;
    ctx.fillStyle = '#2b6a83'; ctx.fillRect(px, gy - ch - 14, cw, ch); ctx.strokeStyle = C.sky2; ctx.strokeRect(px, gy - ch - 14, cw, ch);
    dot(ctx, px + 20, gy - 8, 8, '#cfe3ea'); dot(ctx, px + cw - 20, gy - 8, 8, '#cfe3ea');
    label(ctx, m + ' кг', px + cw / 2, gy - ch / 2 - 10, '#fff', 'center', 14);
    const { ff, net } = forces(), ay = gy - ch / 2 - 14, sc = 1.2;
    const arrow = (x1a, x2a, y, col, txt) => { if (Math.abs(x2a - x1a) < 2) return; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1a, y); ctx.lineTo(x2a, y); ctx.stroke(); const d = Math.sign(x2a - x1a); ctx.beginPath(); ctx.moveTo(x2a, y); ctx.lineTo(x2a - d * 10, y - 6); ctx.lineTo(x2a - d * 10, y + 6); ctx.fill(); label(ctx, txt, x2a + d * 6, y - 8, col, d > 0 ? 'left' : 'right', 13); };
    arrow(px + cw, px + cw + Math.min(F * sc, W * 0.3), ay, C.sky, 'F = ' + F + ' Н');
    arrow(px, px - Math.min((F > ff || v > 0 ? ff : F) * sc, W * 0.3), gy - 4, C.bad, 'Fүйк');
    if (net > 0) label(ctx, 'a = ' + num(net / m, 2) + ' м/с²', W / 2, 26, C.gold, 'center', 15);
  };
  const upd = () => {
    $('#nw-m').value = m; $('#nw-f').value = F; $('#nw-u').value = mu; $('#nw-mv').textContent = m; $('#nw-fv').textContent = F; $('#nw-uv').textContent = num(mu, 2);
    const { ff, net, a } = forces();
    $('#nw-ff').textContent = num(ff, 1) + ' Н'; $('#nw-fr').textContent = num(net, 1) + ' Н'; $('#nw-a').textContent = num(a, 2) + ' м/с²';
    $('#nw-v').textContent = num(v, 1) + ' м/с · ' + num(x, 1) + ' м'; draw(st);
  };
  const st = canvas(fig, draw);
  const reset = () => { x = 0; v = 0; t = 0; run = false; $('#nw-go').textContent = 'Бастау'; upd(); };
  $('#nw-m').oninput = e => { m = +e.target.value; upd(); }; $('#nw-f').oninput = e => { F = +e.target.value; upd(); }; $('#nw-u').oninput = e => { mu = +e.target.value; upd(); };
  $('#nw-go').onclick = () => { if (x >= 20) reset(); run = !run; $('#nw-go').textContent = run ? 'Тоқтату' : 'Жалғастыру'; };
  $('#nw-re').onclick = reset;
  loop(fig, dt => { if (!run) return; const { a } = forces(); v = Math.max(0, v + a * dt); x += v * dt; t += dt; if (x >= 20) { x = 20; run = false; $('#nw-go').textContent = 'Қайта бастау'; } upd(); });
  upd();
}

/* ---------- Снаряд қозғалысы ---------- */
const GRAV = [['Жер', 9.8], ['Ай', 1.62], ['Марс', 3.71], ['Юпитер', 24.8]];
function projectile(h) {
  h.innerHTML = `<div class="lab"><div><div class="fig" style="min-height:360px"></div><div class="row" style="margin-top:10px"><button class="btn" type="button" id="pj-go">Ату</button><button class="btn ghost" type="button" id="pj-cl">Тазалау</button></div></div>
  <div class="ctl"><label>Бастапқы жылдамдық v₀ = <b id="pj-vv"></b> м/с<input type="range" id="pj-v" min="5" max="40" step="0.5"></label>
  <label>Лақтыру бұрышы α = <b id="pj-av"></b>°<input type="range" id="pj-a" min="5" max="85" step="1"></label>
  <label>Аспан денесі<select id="pj-g">${GRAV.map((g, i) => `<option value="${i}">${g[0]} (g = ${num(g[1], 2)} м/с²)</option>`).join('')}</select></label>
  <div class="out"><div><small>Ұшу қашықтығы L = v₀²sin2α/g</small><b id="pj-L"></b></div><div><small>Ең үлкен биіктік H</small><b id="pj-H"></b></div><div><small>Ұшу уақыты T</small><b id="pj-T"></b></div><div><small>v₀ₓ / v₀ᵧ</small><b id="pj-c"></b></div></div>
  <p class="small muted">Бірнеше рет атып, бұрыштарды салыстырыңыз: 30° пен 60° бірдей қашықтыққа ұшады, ал 45° – ең алысқа.</p></div></div>` + code(`import numpy as np
import matplotlib.pyplot as plt

g, v0 = 9.8, 20
for alpha in [30, 45, 60]:
    a = np.radians(alpha)
    T = 2 * v0 * np.sin(a) / g
    t = np.linspace(0, T, 100)
    x = v0 * np.cos(a) * t
    y = v0 * np.sin(a) * t - g * t**2 / 2
    plt.plot(x, y, label=f'{alpha}°: L = {x[-1]:.1f} м')
plt.xlabel('x, м'); plt.ylabel('y, м'); plt.legend(); plt.grid(alpha=.3)
plt.gca().set_aspect('equal'); plt.show()`);
  const $ = s => h.querySelector(s), fig = h.querySelector('.fig');
  let v0 = 20, al = 45, gi = 0, shots = [], anim = null;
  const res = () => { const g = GRAV[gi][1], a = al * Math.PI / 180; return { g, a, L: v0 * v0 * Math.sin(2 * a) / g, H: (v0 * Math.sin(a)) ** 2 / (2 * g), T: 2 * v0 * Math.sin(a) / g }; };
  const draw = s => {
    const { ctx, W, H } = s; if (!W) return; ctx.clearRect(0, 0, W, H);
    const all = shots.concat(anim ? [anim] : []), cur = res();
    const maxL = Math.max(cur.L, ...all.map(q => q.L), 10), maxH = Math.max(cur.H, ...all.map(q => q.H), 5);
    const l = 40, b = 34, sc = Math.min((W - l - 20) / (maxL * 1.08), (H - b - 20) / (maxH * 1.15)), X = x => l + x * sc, Y = y => H - b - y * sc;
    ctx.fillStyle = '#123444'; ctx.fillRect(0, H - b, W, b);
    const step = [1, 2, 5, 10, 20, 50, 100, 200, 500][[1, 2, 5, 10, 20, 50, 100, 200, 500].findIndex(s2 => s2 * sc > 60)] || 1000;
    for (let x = 0; x * sc < W; x += step) { ctx.fillStyle = C.mut; ctx.fillRect(X(x), H - b, 1, 6); label(ctx, x + ' м', X(x), H - b + 20, C.mut, 'center', 12); }
    all.forEach((q, i) => {
      const last = i === all.length - 1, tEnd = q === anim ? q.t : q.T;
      ctx.beginPath(); for (let j = 0; j <= 60; j++) { const t = tEnd * j / 60, x = q.v * Math.cos(q.a) * t, y = q.v * Math.sin(q.a) * t - q.g * t * t / 2; j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
      ctx.strokeStyle = last ? C.sky : 'rgba(122,217,238,.35)'; ctx.lineWidth = last ? 2.5 : 1.5; ctx.stroke();
      const t = tEnd, x = q.v * Math.cos(q.a) * t, y = q.v * Math.sin(q.a) * t - q.g * t * t / 2;
      dot(ctx, X(x), Y(Math.max(0, y)), last ? 6 : 4, last ? C.gold : 'rgba(244,200,74,.5)');
      if (q !== anim) label(ctx, q.lab, X(q.L), Y(0) - 10, C.mut, 'center', 12);
    });
    ctx.save(); ctx.translate(X(0), Y(0)); ctx.rotate(-cur.a); ctx.fillStyle = '#cfe3ea'; ctx.fillRect(0, -5, 34, 10); ctx.restore();
  };
  const upd = () => { const r = res(); $('#pj-v').value = v0; $('#pj-a').value = al; $('#pj-vv').textContent = num(v0, 1); $('#pj-av').textContent = al; $('#pj-L').textContent = num(r.L, 1) + ' м'; $('#pj-H').textContent = num(r.H, 1) + ' м'; $('#pj-T').textContent = num(r.T, 2) + ' с'; $('#pj-c').textContent = num(v0 * Math.cos(r.a), 1) + ' / ' + num(v0 * Math.sin(r.a), 1); draw(st); };
  const st = canvas(fig, draw);
  $('#pj-v').oninput = e => { v0 = +e.target.value; upd(); }; $('#pj-a').oninput = e => { al = +e.target.value; upd(); }; $('#pj-g').onchange = e => { gi = +e.target.value; upd(); };
  $('#pj-go').onclick = () => { const r = res(); anim = { v: v0, a: r.a, g: r.g, L: r.L, H: r.H, T: r.T, t: 0, lab: al + '°, ' + num(r.L, 1) + ' м' }; };
  $('#pj-cl').onclick = () => { shots = []; anim = null; upd(); };
  loop(fig, dt => { if (!anim) return; anim.t += dt * Math.max(1, anim.T / 2.5); if (anim.t >= anim.T) { anim.t = anim.T; shots.push(anim); if (shots.length > 4) shots.shift(); anim = null; } draw(st); });
  upd();
}

const MODELS = [
  { id: 'newton', g: 1, t: 'Ньютонның II заңы: арба', d: 'Күш, масса, үйкеліс және үдеу', f: newton, l: [3] },
  { id: 'gravity', g: 1, t: 'Бүкіләлемдік тартылыс', d: 'F = G·m₁m₂/r², KazSat-3, Жер мен Ай', f: gravity, l: [4] },
  { id: 'projectile', g: 1, t: 'Снаряд қозғалысы', d: 'Бұрыш, жылдамдық, траектория; Жер, Ай, Марс', f: projectile, l: [5] },
  { id: 'cosmic', g: 1, t: 'Ғарыштық жылдамдықтар', d: 'v₁, v₂, орбита биіктігі, период, геостационар орбита', f: cosmic, l: [6] },
  { id: 'mag', g: 2, t: 'Жұлдыздық шама және қашықтық', d: 'm, M және r байланысы, Погсон шкаласы', f: mag, l: [8] },
  { id: 'plani', g: 2, t: 'Жылжымалы жұлдыз картасы (ЖАЖК)', d: 'Кез келген күн мен уақыттағы аспан, көрінетін жұлдыздар', f: plani, l: [9, 10] },
  { id: 'culm', g: 2, t: 'Жұлдыздың шарықтау биіктігі', d: 'Ендік пен еңістік: h = 90° − φ + δ, батпайтын жұлдыздар', f: culm, l: [10] },
  { id: 'seasons', g: 2, t: 'Жыл мезгілдері және Күн биіктігі', d: 'Күннің еңістігі, түстегі биіктігі, күн ұзақтығы, көлеңке', f: seasons, l: [10, 11] },
  { id: 'time', g: 2, t: 'Жергілікті және белдеулік уақыт', d: 'UTC, UTC+5 және жергілікті орташа күн уақыты', f: time, l: [11] },
  { id: 'kepler', g: 3, t: 'Кеплер заңдары: орбита', d: 'Эллипс, эксцентриситет, тең аудандар, T² = a³', f: kepler, l: [13, 14] },
  { id: 'parallax', g: 3, t: 'Параллакс', d: 'Көкжиектік және жылдық параллакс, қашықтық пен өлшем', f: parallax, l: [14, 16] },
  { id: 'retro', g: 3, t: 'Марстың ілмек тәрізді қозғалысы', d: 'Ғаламшарлардың көрінерлік қозғалысы', f: retro, l: [15] },
  { id: 'solar', g: 3, t: 'Күн жүйесі (3D көрініс)', d: 'Сегіз ғаламшардың нақты периодтармен қозғалысы', f: solar, l: [15, 16] },
  { id: 'moon', g: 3, t: 'Ай фазалары', d: 'Жаңа айдан толған айға дейін: жарықталу, жасы, шығу уақыты', f: moon, l: [1, 15] }
];
return { MODELS, solarScene, num, sci, CITIES, esc, code, planisphere, PST, PLINES, GRAV, drawMoon, dot, label, canvas, loop, RM };
})();
