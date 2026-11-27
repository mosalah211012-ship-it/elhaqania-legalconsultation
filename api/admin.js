const L = require('./_lib');

const LEGACY = 'https://script.google.com/macros/s/AKfycbwyCWHX5yhkM4Knyt_55Ad0MzWXT3t2DUngCq_8zhgUCTPZ7qGHFdnEKiJwyvBH-dwE/exec';
const EDITABLE = ['articles', 'library', 'products', 'judgments', 'extras'];
const MODERATED = ['comments', 'reviews'];

function parseLegacyDate(s) {
  s = String(s || '').trim();
  if (!s) return '';
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 9, 0, 0)).toISOString();
  m = s.match(/^(\d{1,2})\s*[-\/]\s*(\d{1,2})\s*[-\/]\s*(\d{4})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 9, 0, 0)).toISOString();
  return '';
}

function sanitizeItem(type, it) {
  const out = {};
  for (const k of Object.keys(it || {})) {
    if (k === 'row_number' || k.length > 40) continue;
    const v = it[k];
    if (typeof v === 'string') out[k] = v.slice(0, type === 'articles' ? 60000 : 8000);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}

async function nextId(type) {
  const all = await L.getAll(type);
  const nums = all.map(x => Number(x.id)).filter(n => Number.isFinite(n));
  return String((nums.length ? Math.max.apply(null, nums) : 0) + 1);
}

async function legacyImport(overwrite) {
  const report = {};
  const sheets = ['articles', 'library', 'products', 'judgments', 'extras', 'reviews'];
  for (const s of sheets) {
    const have = await L.cmd('HLEN', 'd:' + s);
    if (have > 0 && !overwrite) { report[s] = 'skipped_has_data'; continue; }
    const r = await fetch(LEGACY + '?action=get_data&sheet=' + s, { redirect: 'follow' });
    const data = await r.json();
    if (!Array.isArray(data)) { report[s] = 'no_data'; continue; }
    const cmds = [];
    for (const row of data) {
      const it = sanitizeItem(s, row);
      it.id = String(it.id);
      if (s === 'articles') {
        it.publish_at = parseLegacyDate(row.date) || new Date().toISOString();
        it.date = L.fmtDate(it.publish_at);
        it.status = it.status === 'draft' ? 'draft' : 'active';
        it.comments_enabled = true;
      } else if (s === 'reviews') {
        it.target = 'site';
        it.article_id = '';
        it.status = row.status === 'active' ? 'approved' : 'pending';
        it.reply = row.reply && row.reply !== 'active' ? row.reply : '';
        it.created = /^\d{4}-/.test(String(row.id)) ? String(row.id) : new Date(Date.UTC(2026, 2, 1)).toISOString();
        it.id = 'L' + String(row.id).replace(/[^A-Za-z0-9]/g, '');
      } else if (!it.status) {
        it.status = 'active';
      }
      cmds.push(['HSET', 'd:' + s, it.id, JSON.stringify(it)]);
    }
    if (cmds.length) await L.pipeline(cmds);
    report[s] = cmds.length;
  }
  return report;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const action = String(b.action || '');
    const ip = L.clientIp(req);

    if (action === 'login') {
      if (!(await L.rateLimit('rl:login:' + ip, 8, 900))) return L.send(res, 429, { error: 'locked' });
      if (!L.passwordOk(String(b.password || ''))) return L.send(res, 401, { error: 'bad_password' });
      const token = L.sign({ exp: Date.now() + 12 * 3600 * 1000, r: 'admin' });
      return L.send(res, 200, { token });
    }
    if (!L.isAdmin(req)) return L.send(res, 401, { error: 'auth' });

    if (action === 'list') {
      const type = String(b.type || '');
      if (!EDITABLE.concat(MODERATED).includes(type)) return L.send(res, 400, { error: 'type' });
      let items = await L.getAll(type);
      if (type === 'articles') {
        const counts = await L.pipeline(items.map(a => ['SCARD', 'likes:' + a.id]));
        items = items.map((a, i) => Object.assign({}, a, { likes: counts[i] || 0 }));
        items.sort((a, b2) => Date.parse(b2.publish_at || 0) - Date.parse(a.publish_at || 0));
      } else if (MODERATED.includes(type)) {
        items.sort((a, b2) => String(b2.created || '').localeCompare(String(a.created || '')));
      } else {
        items.sort((a, b2) => (Number(a.id) || 0) - (Number(b2.id) || 0));
      }
      return L.send(res, 200, { items });
    }

    if (action === 'save') {
      const type = String(b.type || '');
      if (!EDITABLE.concat(MODERATED).includes(type)) return L.send(res, 400, { error: 'type' });
      const it = sanitizeItem(type, b.item);
      if (!it.id) it.id = type === 'articles' || EDITABLE.includes(type) ? await nextId(type) : 'a' + Date.now().toString(36);
      it.id = String(it.id);
      if (type === 'articles') {
        const t = Date.parse(it.publish_at || '');
        if (!it.publish_at || isNaN(t)) it.publish_at = new Date().toISOString();
        it.date = L.fmtDate(it.publish_at);
        if (!it.status) it.status = 'active';
      }
      if (EDITABLE.includes(type) && !it.status) it.status = 'active';
      await L.cmd('HSET', 'd:' + type, it.id, JSON.stringify(it));
      return L.send(res, 200, { ok: true, item: it });
    }

    if (action === 'delete') {
      const type = String(b.type || '');
      if (!EDITABLE.concat(MODERATED).includes(type)) return L.send(res, 400, { error: 'type' });
      const id = String(b.id || '');
      await L.cmd('HDEL', 'd:' + type, id);
      if (type === 'articles') await L.cmd('DEL', 'likes:' + id);
      return L.send(res, 200, { ok: true });
    }

    if (action === 'status') {
      const type = String(b.type || '');
      if (!EDITABLE.concat(MODERATED).includes(type)) return L.send(res, 400, { error: 'type' });
      const raw = await L.cmd('HGET', 'd:' + type, String(b.id || ''));
      if (!raw) return L.send(res, 404, { error: 'not_found' });
      const it = JSON.parse(raw);
      it.status = L.clean(b.status, 20);
      if (b.reply !== undefined) it.reply = L.clean(b.reply, 1000);
      await L.cmd('HSET', 'd:' + type, it.id, JSON.stringify(it));
      return L.send(res, 200, { ok: true });
    }

    if (action === 'stats') {
      const days = [];
      for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
      const cmds = [['GET', 'st:views'], ['PFCOUNT', 'st:uv'], ['HGETALL', 'st:pages'], ['GET', 'st:wa'], ['HGETALL', 'st:wapages']];
      days.forEach(d => { cmds.push(['GET', 'st:views:' + d]); cmds.push(['PFCOUNT', 'st:uv:' + d]); cmds.push(['GET', 'st:wa:' + d]); });
      const r = await L.pipeline(cmds);
      const pagesFlat = r[2] || [], pages = [];
      for (let i = 0; i < pagesFlat.length; i += 2) pages.push({ path: pagesFlat[i], views: Number(pagesFlat[i + 1]) });
      pages.sort((a, b2) => b2.views - a.views);
      const daily = days.map((d, i) => ({ day: d, views: Number(r[5 + i * 3] || 0), visitors: r[6 + i * 3] || 0, wa: Number(r[7 + i * 3] || 0) }));
      const waFlat = r[4] || [], wapages = [];
      for (let i = 0; i < waFlat.length; i += 2) wapages.push({ path: waFlat[i], clicks: Number(waFlat[i + 1]) });
      wapages.sort((a, b2) => b2.clicks - a.clicks);
      const comments = await L.getAll('comments'), reviews = await L.getAll('reviews'), articles = await L.getAll('articles');
      const likeCounts = await L.pipeline(articles.map(a => ['SCARD', 'likes:' + a.id]));
      return L.send(res, 200, {
        views: Number(r[0] || 0), visitors: r[1] || 0, daily, pages: pages.slice(0, 12), wa_total: Number(r[3] || 0), wa_pages: wapages.slice(0, 8),
        pending_comments: comments.filter(c => c.status === 'pending').length,
        pending_reviews: reviews.filter(c => c.status === 'pending').length,
        total_likes: likeCounts.reduce((a, b2) => a + (b2 || 0), 0),
        articles: articles.length
      });
    }

    if (action === 'get_settings') return L.send(res, 200, { cfg: await L.getCfg() });
    if (action === 'set_settings') {
      const c = b.cfg || {};
      const cmds = [];
      if (['auto', 'moderate'].includes(c.comments_mode)) cmds.push(['HSET', 'cfg', 'comments_mode', c.comments_mode]);
      if (['auto', 'moderate'].includes(c.reviews_mode)) cmds.push(['HSET', 'cfg', 'reviews_mode', c.reviews_mode]);
      if (['0', '1'].includes(String(c.show_counter))) cmds.push(['HSET', 'cfg', 'show_counter', String(c.show_counter)]);
      if (typeof c.notes_file === 'string' && /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(c.notes_file)) cmds.push(['HSET', 'cfg', 'notes_file', c.notes_file]);
      if (cmds.length) await L.pipeline(cmds);
      return L.send(res, 200, { ok: true, cfg: await L.getCfg() });
    }


    // ================= site / students / payments (release 2) =================
    const ADM2 = ['students', 'orders', 'posts', 'pcomments', 'questions', 'problems', 'reports'];
    if (action === 'site_get') {
      const [ov, certs, prices, cfg] = await Promise.all([L.cmd('GET', 'site:ov'), L.cmd('GET', 'site:certs'), L.cmd('GET', 'site:prices'), L.getCfg()]);
      const j = x => { try { return x ? JSON.parse(x) : null; } catch (e) { return null; } };
      return L.send(res, 200, { ov: j(ov) || { t: {}, i: {} }, certs: j(certs), prices: j(prices), cfg });
    }
    if (action === 'site_set') {
      const cmds = [];
      if (b.ov && typeof b.ov === 'object') {
        const ov = { t: {}, i: {} };
        Object.keys(b.ov.t || {}).slice(0, 800).forEach(k => { const v = b.ov.t[k]; if (v && typeof v === 'object') ov.t[L.clean(k, 300)] = { ar: L.clean(v.ar, 2000), en: L.clean(v.en, 2000), fr: L.clean(v.fr, 2000) }; });
        Object.keys(b.ov.i || {}).slice(0, 300).forEach(k => { const v = L.clean(b.ov.i[k], 500); if (/^https:\/\//.test(v)) ov.i[L.clean(k, 500)] = v; });
        cmds.push(['SET', 'site:ov', JSON.stringify(ov)]);
      }
      if (Array.isArray(b.certs)) {
        const c = b.certs.slice(0, 30).map(x => ({ id: L.clean(x.id, 20) || ('c' + Date.now().toString(36)), image: L.clean(x.image, 500), ar: L.clean(x.ar, 600), en: L.clean(x.en, 600), fr: L.clean(x.fr, 600) }));
        cmds.push(['SET', 'site:certs', JSON.stringify(c)]);
      }
      if (b.prices && typeof b.prices === 'object') {
        const n = v => Math.max(0, Math.min(100000, Number(v) || 0));
        const p = b.prices;
        cmds.push(['SET', 'site:prices', JSON.stringify({ eg: { wa: n(p.eg && p.eg.wa), call: n(p.eg && p.eg.call), urgent_wa: n(p.eg && p.eg.urgent_wa), urgent_call: n(p.eg && p.eg.urgent_call) }, foreign: { wa: n(p.foreign && p.foreign.wa), urgent: n(p.foreign && p.foreign.urgent) }, urgent_promise_hours: n(p.urgent_promise_hours) || 1 })]);
      }
      if (cmds.length) await L.pipeline(cmds);
      return L.send(res, 200, { ok: true });
    }
    if (action === 't_list') {
      const type = String(b.type || '');
      if (!ADM2.includes(type)) return L.send(res, 400, { error: 'type' });
      const items = await L.getAll(type);
      items.sort((a, c) => String(c.created || c.last || '').localeCompare(String(a.created || a.last || '')));
      return L.send(res, 200, { items });
    }
    if (action === 't_save') {
      const type = String(b.type || '');
      if (!['posts', 'pcomments', 'questions'].includes(type)) return L.send(res, 400, { error: 'type' });
      const raw = await L.cmd('HGET', 'd:' + type, String(b.id || ''));
      if (!raw) return L.send(res, 404, { error: 'not_found' });
      const it = JSON.parse(raw);
      if (b.text !== undefined) it.text = L.clean(b.text, 3000);
      if (b.answer !== undefined) { it.answer = L.clean(b.answer, 4000); it.status = it.answer ? 'answered' : 'open'; it.answered = new Date().toISOString(); }
      if (b.status !== undefined && ['active', 'hidden', 'open', 'answered'].includes(b.status)) it.status = b.status;
      await L.cmd('HSET', 'd:' + type, it.id, JSON.stringify(it));
      return L.send(res, 200, { ok: true });
    }
    if (action === 't_delete') {
      const type = String(b.type || '');
      if (!['posts', 'pcomments', 'questions', 'reports', 'problems'].includes(type)) return L.send(res, 400, { error: 'type' });
      await L.cmd('HDEL', 'd:' + type, String(b.id || ''));
      return L.send(res, 200, { ok: true });
    }
    if (action === 'student_act') {
      const raw = await L.cmd('HGET', 'd:students', String(b.id || ''));
      if (!raw) return L.send(res, 404, { error: 'not_found' });
      const u = JSON.parse(raw); const op = String(b.op || '');
      const cmds = [];
      if (op === 'ban' || op === 'ban_network') {
        u.banned = true; u.ban_reason = L.clean(b.reason, 200) || 'admin';
        cmds.push(['SET', 'ban:u:' + u.id, '1']);
        (u.devs || []).forEach(d => cmds.push(['SET', 'ban:d:' + d, '1']));
        if (op === 'ban_network') (u.ips || []).forEach(i => cmds.push(['SET', 'ban:i:' + i, '1']));
      } else if (op === 'unban') {
        u.banned = false; u.ban_reason = '';
        cmds.push(['DEL', 'ban:u:' + u.id]);
        (u.devs || []).forEach(d => cmds.push(['DEL', 'ban:d:' + d]));
        (u.ips || []).forEach(i => cmds.push(['DEL', 'ban:i:' + i]));
      } else if (op === 'rename') { u.name = L.clean(b.name, 80); }
      else if (op === 'role') { if (['student', 'staff'].includes(b.role)) u.role = b.role; }
      else if (op === 'delete') {
        cmds.push(['HDEL', 'd:students', u.id]);
        const q = await L.getAll('orders'); q.filter(o => o.uid === u.id).forEach(o => cmds.push(['HDEL', 'd:orders', o.id]));
        if (cmds.length) await L.pipeline(cmds);
        return L.send(res, 200, { ok: true });
      } else return L.send(res, 400, { error: 'op' });
      cmds.push(['HSET', 'd:students', u.id, JSON.stringify(u)]);
      await L.pipeline(cmds);
      return L.send(res, 200, { ok: true, student: u });
    }
    if (action === 'order_act') {
      const raw = await L.cmd('HGET', 'd:orders', String(b.id || ''));
      if (!raw) return L.send(res, 404, { error: 'not_found' });
      const o = JSON.parse(raw); const op = String(b.op || '');
      if (op === 'approve' || op === 'confirm') { o.status = 'approved'; o.approved_at = new Date().toISOString(); if (!o.dl_left) o.dl_left = 3; }
      else if (op === 'reject') { o.status = 'rejected'; if (o.txn) await L.cmd('DEL', 'txn:' + String(o.txn).toLowerCase()); }
      else if (op === 'reset_dl') { o.dl_left = 3; }
      else if (op === 'cheat') {
        o.status = 'cheat';
        const ur = await L.cmd('HGET', 'd:students', o.uid);
        if (ur) {
          const u = JSON.parse(ur); u.banned = true; u.ban_reason = 'cheat';
          const cmds = [['SET', 'ban:u:' + u.id, '1'], ['HSET', 'd:students', u.id, JSON.stringify(u)]];
          (u.devs || []).forEach(d => cmds.push(['SET', 'ban:d:' + d, '1']));
          await L.pipeline(cmds); // account + devices only; a shared network is banned only by the explicit 'ban + network' button
        }
      } else return L.send(res, 400, { error: 'op' });
      await L.cmd('HSET', 'd:orders', o.id, JSON.stringify(o));
      return L.send(res, 200, { ok: true, order: o });
    }
    if (action === 'grant_notes') {
      const ur = await L.cmd('HGET', 'd:students', String(b.uid || ''));
      if (!ur) return L.send(res, 404, { error: 'not_found' });
      const u = JSON.parse(ur);
      const o = { id: 'o' + Date.now().toString(36) + 'g', uid: u.id, name: u.name, email: u.email, amount: '0.00', status: 'approved', free: true, created: new Date().toISOString(), approved_at: new Date().toISOString(), dl_left: 3, txn: '', shot: '' };
      await L.cmd('HSET', 'd:orders', o.id, JSON.stringify(o));
      return L.send(res, 200, { ok: true });
    }
    if (action === 'problem_save') {
      const raw = await L.cmd('HGET', 'd:problems', String(b.ref || ''));
      if (!raw) return L.send(res, 404, { error: 'not_found' });
      const it = JSON.parse(raw);
      const E = require('./_engine');
      const inp = {}; Object.keys(b.inp || {}).forEach(k => { if (E.NAMES[k] && +b.inp[k] > 0) inp[k] = Math.min(30, Math.floor(+b.inp[k])); });
      it.log = (it.log || []).concat([{ at: new Date().toISOString(), by: 'admin', before: it.inp, after: inp, note: L.clean(b.note, 200) }]).slice(-50);
      it.inp = inp;
      if (b.estate && typeof b.estate === 'object') it.estate = { gross: +b.estate.gross || 0, funeral: +b.estate.funeral || 0, debts: +b.estate.debts || 0, willAmount: +b.estate.willAmount || 0, willConsent: !!b.estate.willConsent };
      await L.cmd('HSET', 'd:problems', it.id, JSON.stringify(it));
      return L.send(res, 200, { ok: true, item: it });
    }
    if (action === 'daily_set') {
      const E = require('./_engine'); const day = L.clean(b.day, 12);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return L.send(res, 400, { error: 'day' });
      const inp = {}; Object.keys(b.inp || {}).forEach(k => { if (E.NAMES[k] && +b.inp[k] > 0) inp[k] = Math.min(30, Math.floor(+b.inp[k])); });
      const r = E.solve(inp, {}); if (!r.rows.length || !E.NAMES[b.ask]) return L.send(res, 400, { error: 'bad_problem' });
      await L.cmd('HSET', 'daily:ov', day, JSON.stringify({ inp, ask: b.ask, estate: Math.max(1000, Number(b.estate) || 240000), level: 0, seed: 'admin' }));
      return L.send(res, 200, { ok: true });
    }
    if (action === 'honor_admin') {
      const wk = L.clean(b.week, 12);
      const flat = await L.cmd('HGETALL', wk ? 'hb:' + wk : 'hb:all');
      const a = []; for (let i = 0; i < (flat || []).length; i += 2) a.push({ uid: flat[i], n: Number(flat[i + 1]) });
      a.sort((x, y) => y.n - x.n);
      const top = a.slice(0, 10); const raw = top.length ? await L.pipeline(top.map(x => ['HGET', 'd:students', x.uid])) : [];
      return L.send(res, 200, { top: top.map((x, i) => { let u = {}; try { u = JSON.parse(raw[i]) || {}; } catch (e) {} return { uid: x.uid, n: x.n, name: u.name || '', email: u.email || '' }; }) });
    }
    if (action === 'stats2') {
      const [st, orders, posts, qs, reps] = await Promise.all([L.getAll('students'), L.getAll('orders'), L.getAll('posts'), L.getAll('questions'), L.getAll('reports')]);
      return L.send(res, 200, { students: st.length, banned: st.filter(x => x.banned).length, orders_pending: orders.filter(o => o.status === 'provisional').length, orders_approved: orders.filter(o => o.status === 'approved' && !o.free).length, posts: posts.length, questions_open: qs.filter(q => !q.answer).length, reports_open: reps.filter(r => r.status === 'open').length });
    }

    if (action === 'import_legacy') {
      return L.send(res, 200, { report: await legacyImport(!!b.overwrite) });
    }
    L.send(res, 400, { error: 'action' });
  } catch (e) {
    L.send(res, 500, { error: 'server_error' });
  }
};
