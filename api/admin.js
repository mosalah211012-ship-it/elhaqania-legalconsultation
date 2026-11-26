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
      if (cmds.length) await L.pipeline(cmds);
      return L.send(res, 200, { ok: true, cfg: await L.getCfg() });
    }

    if (action === 'import_legacy') {
      return L.send(res, 200, { report: await legacyImport(!!b.overwrite) });
    }
    L.send(res, 400, { error: 'action' });
  } catch (e) {
    L.send(res, 500, { error: 'server_error' });
  }
};
