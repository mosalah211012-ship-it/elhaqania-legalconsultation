const crypto = require('crypto');
const L = require('./_lib');
const G = require('./_gen');
const E = require('./_engine');

const CAIRO = 'Africa/Cairo';
function cairoParts(ms) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: CAIRO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const o = {}; f.formatToParts(new Date(ms)).forEach(p => { o[p.type] = p.value; });
  return { date: o.year + '-' + o.month + '-' + o.day, h: +o.hour, m: +o.minute };
}
function addDays(dateStr, n) { const d = new Date(dateStr + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
// week starts Saturday (Cairo)
function weekKey(ms) {
  const c = cairoParts(ms); const d = new Date(c.date + 'T12:00:00Z');
  const dow = d.getUTCDay(); // 0 Sun .. 6 Sat
  const back = (dow + 1) % 7; // Sat->0, Sun->1, ... Fri->6
  return addDays(c.date, -back);
}
// daily problem: posted 20:00 Cairo of day D, answer revealed 19:00 of D+1, next problem 20:00 of D+1
function dailyState(ms) {
  const c = cairoParts(ms);
  const today = c.date;
  const mins = c.h * 60 + c.m;
  const cur = mins >= 20 * 60 ? today : addDays(today, -1); // problem currently "live" (posted)
  const revealed = mins >= 19 * 60 ? addDays(today, -1) : addDays(today, -2); // latest day whose answer is revealed
  return { cur, revealed, today, mins };
}
function dailyProblem(day) {
  return G.makeProblem(2 + (Math.abs(hashDay(day)) % 4), 'daily|' + day);
}
function hashDay(d) { let h = 0; for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) | 0; return h; }

const clean = L.clean;
const NOTES_PRICE = 150;
const PAY_METHODS = { number: '01278683280', methods: ['Orange Cash', 'InstaPay'] };

async function getUser(id) {
  const r = await L.cmd('HGET', 'd:students', id);
  return r ? JSON.parse(r) : null;
}
async function putUser(u) { await L.cmd('HSET', 'd:students', u.id, JSON.stringify(u)); }
async function getItem(type, id) { const r = await L.cmd('HGET', 'd:' + type, String(id)); return r ? JSON.parse(r) : null; }
async function putItem(type, it) { await L.cmd('HSET', 'd:' + type, String(it.id), JSON.stringify(it)); }
const rid = (n) => crypto.randomBytes(n).toString('base64url').replace(/[-_]/g, 'x').slice(0, n);
function publicName(u) { return u && u.name ? u.name : 'طالب'; }

function refId() {
  const d = new Date(); const yy = String(d.getUTCFullYear()).slice(2), mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
  const b = crypto.randomBytes(6); for (let i = 0; i < 6; i++) s += abc[b[i] % abc.length];
  return 'MR-' + yy + mm + '-' + s;
}

async function hasNotes(uid) {
  const o = await L.getAll('orders');
  return o.some(x => x.uid === uid && (x.status === 'approved' || x.status === 'provisional'));
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const action = String(b.action || '');
    const now = Date.now();
    const dev = clean(b.dev, 64);

    // ---------- public: save a problem reference (no login needed) ----------
    if (action === 'ref_save') {
      const ip = L.clientIp(req);
      if (!(await L.rateLimit('rl:ref:' + ip, 40, 3600))) return L.send(res, 429, { error: 'slow_down' });
      const inp = {}; Object.keys(b.inp || {}).forEach(k => { if (E.NAMES[k] && +b.inp[k] > 0) inp[k] = Math.min(30, Math.floor(+b.inp[k])); });
      if (!Object.keys(inp).length) return L.send(res, 400, { error: 'empty' });
      const est = b.estate && typeof b.estate === 'object' ? { gross: +b.estate.gross || 0, funeral: +b.estate.funeral || 0, debts: +b.estate.debts || 0, willAmount: +b.estate.willAmount || 0, willConsent: !!b.estate.willConsent } : {};
      const opts = {}; if (Array.isArray(b.opts && b.opts.barred)) opts.barred = b.opts.barred.filter(k => E.NAMES[k]).slice(0, 80);
      const it = { id: refId(), inp, estate: est, opts, source: ['calc', 'edu', 'gen', 'daily'].includes(b.source) ? b.source : 'calc', created: new Date(now).toISOString(), uid: '', log: [] };
      const u = await L.supaUser(req); if (u) it.uid = u.id;
      await putItem('problems', it);
      return L.send(res, 200, { ref: it.id });
    }
    if (action === 'ref_get') {
      const it = await getItem('problems', clean(b.ref, 20));
      if (!it) return L.send(res, 404, { error: 'not_found' });
      return L.send(res, 200, { ref: it.id, inp: it.inp, estate: it.estate, opts: it.opts, source: it.source, created: it.created });
    }

    // ---------- everything else needs a verified student ----------
    let su = await L.supaUser(req);
    let ownerPrev = false;
    if (!su && L.isAdmin(req)) { ownerPrev = true; su = { id: 'owner-preview', email: 'legalelhaqania@gmail.com', user_metadata: { full_name: 'الأستاذ محمد صلاح' }, app_metadata: { provider: 'owner' } }; }
    if (!su) return L.send(res, 401, { error: 'auth' });
    if (ownerPrev && ['order_start', 'order_paid', 'download'].includes(action)) return L.send(res, 403, { error: 'owner_preview' });
    const uid = su.id;
    let me = await getUser(uid);
    const meta = su.user_metadata || {};
    const provName = clean(meta.full_name || meta.name || '', 80);
    if (!me) {
      me = { id: uid, name: provName || clean(b.name, 80) || '', email: su.email || '', created: new Date(now).toISOString(), provider: (su.app_metadata && su.app_metadata.provider) || 'email', role: 'student', devs: [], ips: [], banned: false };
    }
    if (!me.name && provName) me.name = provName;
    const ih = L.ipHash(req);
    if (dev && !me.devs.includes(dev)) me.devs = me.devs.concat([dev]).slice(-8);
    if (!me.ips.includes(ih)) me.ips = me.ips.concat([ih]).slice(-8);
    me.last = new Date(now).toISOString();
    const banned = !ownerPrev && (me.banned || await L.banCheck(req, uid, dev));
    if (banned) {
      if (!me.banned) { me.banned = true; }
      await putUser(me);
      return L.send(res, 403, { error: 'banned', message: L.BAN_MSG });
    }
    if (!ownerPrev) await putUser(me);
    const nameOk = !!me.name;

    if (action === 'me') {
      const orders = (await L.getAll('orders')).filter(x => x.uid === uid).sort((a, c) => String(c.created).localeCompare(String(a.created)));
      const gen = JSON.parse((await L.cmd('GET', 'gen:' + uid)) || 'null') || { level: 1, streak: 0, solved: 0, correct: 0 };
      return L.send(res, 200, {
        me: { id: uid, name: me.name, email: me.email, role: me.role, needName: !nameOk },
        orders: orders.map(o => ({ id: o.id, status: o.status, amount: o.amount, created: o.created, dl_left: o.dl_left })),
        gen: { level: gen.level, streak: gen.streak, solved: gen.solved || 0, correct: gen.correct || 0 },
        price: NOTES_PRICE, pay: PAY_METHODS
      });
    }
    if (action === 'set_name') {
      const n = clean(b.name, 80);
      if (n.split(/\s+/).length < 2 || n.length < 5) return L.send(res, 400, { error: 'name_short' });
      me.name = n; await putUser(me);
      return L.send(res, 200, { ok: true, name: n });
    }
    if (!nameOk) return L.send(res, 403, { error: 'need_name' });

    // ---------- generator ----------
    if (action === 'gen_next') {
      let g = JSON.parse((await L.cmd('GET', 'gen:' + uid)) || 'null') || { level: 1, streak: 0, n: 0, solved: 0, correct: 0 };
      const lv = Math.max(1, Math.min(6, Math.floor(+b.level) || g.level));
      const lvl = Math.min(lv, g.level >= 6 ? 6 : g.level + 0); // student may only go up to the level earned
      g.n = (g.n || 0) + 1; g.cur = { level: lvl, seed: uid.slice(0, 8) + '|' + g.n + '|' + rid(6), t: now };
      await L.cmd('SET', 'gen:' + uid, JSON.stringify(g));
      const p = G.makeProblem(lvl, g.cur.seed);
      return L.send(res, 200, { level: lvl, streak: g.streak, items: G.describeInput(p.inp), ask: { id: p.ask, name: E.nm(p.ask) }, estate: p.estate, studentLevel: g.level });
    }
    if (action === 'gen_answer') {
      let g = JSON.parse((await L.cmd('GET', 'gen:' + uid)) || 'null');
      if (!g || !g.cur) return L.send(res, 400, { error: 'no_problem' });
      if (!(await L.rateLimit('rl:ans:' + uid, 120, 3600))) return L.send(res, 429, { error: 'slow_down' });
      const p = G.makeProblem(g.cur.level, g.cur.seed);
      const c = G.checkAnswer(p, b.answer);
      g.solved = (g.solved || 0) + 1;
      const cur = g.cur; g.cur = null;
      let leveled = false;
      if (c.ok) {
        g.correct = (g.correct || 0) + 1;
        if (cur.level === g.level) { g.streak = (g.streak || 0) + 1; if (g.streak >= 3 && g.level < 6) { g.level++; g.streak = 0; leveled = true; } }
        const wk = weekKey(now);
        await L.pipeline([['HINCRBY', 'hb:' + wk, uid, 1], ['EXPIRE', 'hb:' + wk, 86400 * 120], ['HINCRBY', 'hb:all', uid, 1]]);
      } else if (cur.level === g.level) g.streak = 0;
      await L.cmd('SET', 'gen:' + uid, JSON.stringify(g));
      return L.send(res, 200, { ok: c.ok, want: c.want, solution: G.solutionOf(p.inp), leveled, level: g.level, streak: g.streak });
    }
    // ---------- library: solved problems by level ----------
    if (action === 'library') {
      const lv = Math.max(1, Math.min(6, Math.floor(+b.level) || 1));
      const idx = Math.max(1, Math.min(12, Math.floor(+b.idx) || 1));
      const p = G.makeProblem(lv, 'lib|' + lv + '|' + idx);
      const ans = G.checkAnswer(p, '0');
      return L.send(res, 200, { level: lv, idx, count: 12, items: G.describeInput(p.inp), ask: { id: p.ask, name: E.nm(p.ask) }, estate: p.estate, want: ans.want, solution: G.solutionOf(p.inp) });
    }
    // ---------- daily problem ----------
    if (action === 'daily') {
      const st = dailyState(now);
      const out = { posted: null, previous: null, next_at: '20:00' };
      const mk = async (day, reveal) => {
        let p = null; const ov = await L.cmd('HGET', 'daily:ov', day);
        if (ov) { try { p = JSON.parse(ov); } catch (e) {} }
        if (!p) p = dailyProblem(day);
        if (!p) return null;
        const mine = JSON.parse((await L.cmd('HGET', 'daily:ans:' + day, uid)) || 'null');
        const o = { day, items: G.describeInput(p.inp), ask: { id: p.ask, name: E.nm(p.ask) }, estate: p.estate, mine: mine ? { answer: mine.answer, ok: mine.ok } : null, closed: !!reveal };
        if (reveal) { const c = G.checkAnswer(p, '0'); o.want = c.want; o.solution = G.solutionOf(p.inp); }
        return o;
      };
      out.posted = await mk(st.cur, st.revealed >= st.cur);
      out.previous = await mk(addDays(st.cur, -1), true);
      if (out.previous) {
        const cs = await L.cmd('HLEN', 'daily:ans:' + out.previous.day);
        const flat = await L.cmd('HGETALL', 'daily:ans:' + out.previous.day);
        let wrong = 0, total = 0; for (let i = 0; i < (flat || []).length; i += 2) { total++; try { if (!JSON.parse(flat[i + 1]).ok) wrong++; } catch (e) {} }
        out.previous.stats = { total: cs || 0, wrong };
        out.previous.wrongCommon = out.previous.mine && !out.previous.mine.ok ? 'تأكد من خطوات الحل أدناه، وراجع أين اختلف حلك عنها.' : '';
      }
      return L.send(res, 200, out);
    }
    if (action === 'daily_answer') {
      const st = dailyState(now);
      const day = clean(b.day, 12);
      if (day !== st.cur || st.revealed >= st.cur) return L.send(res, 400, { error: 'closed' });
      const exists = await L.cmd('HEXISTS', 'daily:ans:' + day, uid);
      if (exists) return L.send(res, 400, { error: 'already' });
      let p = null; const ov = await L.cmd('HGET', 'daily:ov', day); if (ov) { try { p = JSON.parse(ov); } catch (e) {} }
      if (!p) p = dailyProblem(day);
      const c = G.checkAnswer(p, b.answer);
      await L.pipeline([['HSET', 'daily:ans:' + day, uid, JSON.stringify({ answer: clean(b.answer, 20), ok: c.ok, t: now })], ['EXPIRE', 'daily:ans:' + day, 86400 * 40]]);
      if (c.ok) { const wk = weekKey(now); await L.pipeline([['HINCRBY', 'hb:' + wk, uid, 1], ['EXPIRE', 'hb:' + wk, 86400 * 120], ['HINCRBY', 'hb:all', uid, 1]]); }
      return L.send(res, 200, { ok: true, saved: true });
    }
    // ---------- honor board ----------
    if (action === 'honor') {
      const wk = weekKey(now);
      const [wf, af] = await L.pipeline([['HGETALL', 'hb:' + wk], ['HGETALL', 'hb:all']]);
      const toList = f => { const a = []; for (let i = 0; i < (f || []).length; i += 2) a.push({ uid: f[i], n: Number(f[i + 1]) }); return a.sort((x, y) => y.n - x.n).slice(0, 20); };
      const W = toList(wf), A = toList(af);
      const ids = Array.from(new Set(W.concat(A).map(x => x.uid)));
      const raw = ids.length ? await L.pipeline(ids.map(i => ['HGET', 'd:students', i])) : [];
      const nm = {}; ids.forEach((i, k) => { try { const u = JSON.parse(raw[k]); nm[i] = u.banned ? null : u.name; } catch (e) { nm[i] = null; } });
      const fin = l => l.filter(x => nm[x.uid]).map(x => ({ name: nm[x.uid], n: x.n, me: x.uid === uid }));
      return L.send(res, 200, { weekStart: wk, week: fin(W), all: fin(A) });
    }
    // ---------- questions space ----------
    if (action === 'q_list') {
      const all = (await L.getAll('questions')).filter(q => q.status !== 'hidden' && (q.uid === uid || q.answer));
      all.sort((a, c) => String(c.created).localeCompare(String(a.created)));
      return L.send(res, 200, { items: all.slice(0, 60).map(q => ({ id: q.id, name: q.name, text: q.text, answer: q.answer || '', created: q.created, mine: q.uid === uid })) });
    }
    if (action === 'q_ask') {
      const text = clean(b.text, 1500);
      if (text.length < 8) return L.send(res, 400, { error: 'too_short' });
      if (!(await L.rateLimit('rl:q:' + uid, 10, 3600))) return L.send(res, 429, { error: 'slow_down' });
      const q = { id: 'q' + Date.now().toString(36) + rid(3), uid, name: me.name, text, created: new Date(now).toISOString(), status: 'open', answer: '' };
      await putItem('questions', q);
      return L.send(res, 200, { ok: true });
    }
    // ---------- community ----------
    if (action === 'post_list') {
      const posts = (await L.getAll('posts')).filter(p => p.status !== 'hidden');
      const comments = (await L.getAll('pcomments')).filter(c => c.status !== 'hidden');
      posts.sort((a, c) => String(c.created).localeCompare(String(a.created)));
      const top = posts.slice(0, 40);
      const lk = await L.pipeline(top.map(p => ['SCARD', 'pl:' + p.id]).concat(top.map(p => ['SISMEMBER', 'pl:' + p.id, uid])));
      const clk = comments.length ? await L.pipeline(comments.map(c => ['SCARD', 'pl:' + c.id])) : [];
      const cm = comments.map((c, i) => ({ id: c.id, post: c.post, parent: c.parent || '', name: c.name, text: c.text, created: c.created, likes: clk[i] || 0 }));
      return L.send(res, 200, { posts: top.map((p, i) => ({ id: p.id, name: p.name, text: p.text, ref: p.ref || '', created: p.created, likes: lk[i] || 0, liked: !!lk[top.length + i], mine: p.uid === uid })), comments: cm });
    }
    if (action === 'post_create') {
      const text = clean(b.text, 3000);
      if (text.length < 5) return L.send(res, 400, { error: 'too_short' });
      if (!(await L.rateLimit('rl:post:' + uid, 12, 3600))) return L.send(res, 429, { error: 'slow_down' });
      const p = { id: 'p' + Date.now().toString(36) + rid(3), uid, name: me.name, text, ref: clean(b.ref, 20), created: new Date(now).toISOString(), status: 'active' };
      await putItem('posts', p);
      return L.send(res, 200, { ok: true });
    }
    if (action === 'comment_create') {
      const text = clean(b.text, 1500);
      if (text.length < 2) return L.send(res, 400, { error: 'too_short' });
      if (!(await L.rateLimit('rl:cm:' + uid, 40, 3600))) return L.send(res, 429, { error: 'slow_down' });
      const post = await getItem('posts', clean(b.post, 40)); if (!post) return L.send(res, 404, { error: 'not_found' });
      const c = { id: 'c' + Date.now().toString(36) + rid(3), uid, name: me.name, post: post.id, parent: clean(b.parent, 40), text, created: new Date(now).toISOString(), status: 'active' };
      await putItem('pcomments', c);
      return L.send(res, 200, { ok: true });
    }
    if (action === 'like') {
      const id = clean(b.id, 40);
      if (!/^[pc][a-z0-9]+$/.test(id)) return L.send(res, 400, { error: 'id' });
      const had = await L.cmd('SISMEMBER', 'pl:' + id, uid);
      await L.cmd(had ? 'SREM' : 'SADD', 'pl:' + id, uid);
      return L.send(res, 200, { liked: !had });
    }
    if (action === 'report') {
      const id = clean(b.id, 40);
      await L.cmd('HSET', 'd:reports', id + ':' + uid, JSON.stringify({ id: id + ':' + uid, target: id, kind: clean(b.kind, 10), by: uid, byName: me.name, reason: clean(b.reason, 300), created: new Date(now).toISOString(), status: 'open' }));
      return L.send(res, 200, { ok: true });
    }
    // ---------- notes store ----------
    if (action === 'order_start') {
      const open = (await L.getAll('orders')).filter(o => o.uid === uid && (o.status === 'awaiting'));
      if (open.length) return L.send(res, 200, { order: pubOrder(open[0]) });
      if (await hasNotes(uid)) return L.send(res, 400, { error: 'owned' });
      const all = await L.getAll('orders');
      const used = new Set(all.filter(o => o.status === 'awaiting' || o.status === 'provisional').map(o => o.amount));
      let amt = null;
      for (let i = 0; i < 60; i++) { const c = (150 + (1 + crypto.randomInt(0, 99)) / 100).toFixed(2); if (!used.has(c)) { amt = c; break; } }
      if (!amt) return L.send(res, 503, { error: 'busy' });
      const o = { id: 'o' + Date.now().toString(36) + rid(3), uid, name: me.name, email: me.email, amount: amt, status: 'awaiting', created: new Date(now).toISOString(), txn: '', shot: '', dl_left: 3 };
      await putItem('orders', o);
      return L.send(res, 200, { order: pubOrder(o) });
    }
    if (action === 'order_paid') {
      const o = await getItem('orders', clean(b.order, 40));
      if (!o || o.uid !== uid) return L.send(res, 404, { error: 'not_found' });
      if (o.status !== 'awaiting') return L.send(res, 400, { error: 'state' });
      const txn = clean(b.txn, 60).replace(/\s+/g, '');
      if (txn.length < 6 || !/^[A-Za-z0-9\-_.]+$/.test(txn)) return L.send(res, 400, { error: 'txn' });
      // automated sanity checks (provisional release; the owner confirms the money later)
      const paid = String(clean(b.paid_amount, 12)).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/٫|،/g, '.').replace(/[^0-9.]/g, '');
      if (!paid || Math.abs(parseFloat(paid) - parseFloat(o.amount)) > 0.001) return L.send(res, 400, { error: 'amount_mismatch', amount: o.amount });
      if (now - Date.parse(o.created) > 6 * 3600 * 1000) return L.send(res, 400, { error: 'expired' });
      const shot = clean(b.shot, 400);
      if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/pay-/i.test(shot)) return L.send(res, 400, { error: 'shot' });
      // same reference cannot be used twice
      const dup = await L.cmd('SET', 'txn:' + txn.toLowerCase(), o.id, 'NX');
      if (!dup) return L.send(res, 409, { error: 'txn_used' });
      o.txn = txn; o.shot = shot; o.paid_amount = paid; o.status = 'provisional'; o.submitted = new Date(now).toISOString(); o.dl_left = 3;
      await putItem('orders', o);
      await alertPayment(o);
      return L.send(res, 200, { ok: true, order: pubOrder(o) });
    }
    if (action === 'download') {
      const o = await getItem('orders', clean(b.order, 40));
      if (!o || o.uid !== uid || (o.status !== 'approved' && o.status !== 'provisional')) return L.send(res, 403, { error: 'not_approved' });
      if ((o.dl_left || 0) < 1) return L.send(res, 403, { error: 'no_links' });
      o.dl_left--; await putItem('orders', o);
      const tok = crypto.randomBytes(24).toString('base64url');
      await L.cmd('SET', 'dl:' + tok, o.id, 'EX', 900);
      return L.send(res, 200, { url: '/api/notes?t=' + tok, left: o.dl_left });
    }
    L.send(res, 400, { error: 'action' });
  } catch (e) {
    L.send(res, 500, { error: 'server_error' });
  }
};

function pubOrder(o) { return { id: o.id, amount: o.amount, status: o.status, dl_left: o.dl_left }; }

async function alertPayment(o) {
  try {
    const user = process.env.BREVO_SMTP_USER, key = process.env.BREVO_SMTP_KEY;
    if (!user || !key) return;
    const nodemailer = require('nodemailer');
    const t = nodemailer.createTransport({ host: 'smtp-relay.brevo.com', port: 587, auth: { user, pass: key } });
    await t.sendMail({
      from: '"الحقانية" <' + (process.env.ALERT_FROM || 'legalelhaqania@gmail.com') + '>', to: 'legalelhaqania@gmail.com',
      subject: 'دفعة جديدة بانتظار المراجعة: ' + o.amount + ' جنيه',
      text: 'طالب: ' + o.name + '\nالمبلغ: ' + o.amount + '\nرقم العملية: ' + o.txn + '\nافتح لوحة التحكم، تبويب المدفوعات.'
    });
  } catch (e) { /* alert is best effort */ }
}
