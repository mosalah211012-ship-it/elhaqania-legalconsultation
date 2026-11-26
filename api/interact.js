const L = require('./_lib');

const VID = /^[A-Za-z0-9_-]{8,64}$/;
const LINK = /(https?:\/\/|www\.|\.com\b|\.net\b|\.ru\b|t\.me\/)/i;

module.exports = async function handler(req, res) {
  try {
    const ip = L.clientIp(req);
    if (req.method === 'GET') {
      const q = req.query || {};
      const id = L.clean(q.article_id, 40);
      if (!id) return L.send(res, 400, { error: 'article_id' });
      const vid = L.clean(q.vid, 64);
      const r = await L.pipeline([['SCARD', 'likes:' + id], vid && VID.test(vid) ? ['SISMEMBER', 'likes:' + id, vid] : ['PING']]);
      const comments = (await L.getAll('comments')).filter(c => String(c.article_id) === id && c.status === 'approved')
        .sort((a, b) => String(b.created).localeCompare(String(a.created)))
        .map(c => ({ id: c.id, name: c.name, text: c.text, created: c.created, reply: c.reply || '' }));
      const reviews = (await L.getAll('reviews')).filter(c => c.target === 'article' && String(c.article_id) === id && c.status === 'approved')
        .sort((a, b) => String(b.created).localeCompare(String(a.created)))
        .map(c => ({ id: c.id, name: c.name, rating: c.rating, text: c.text, created: c.created, reply: c.reply || '' }));
      return L.send(res, 200, { likes: r[0] || 0, liked: r[1] === 1, comments, reviews });
    }
    if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const action = String(b.action || '');
    const vid = String(b.vid || '');
    if (!VID.test(vid)) return L.send(res, 400, { error: 'vid' });

    if (action === 'like') {
      const id = L.clean(b.article_id, 40);
      if (!id) return L.send(res, 400, { error: 'article_id' });
      if (!(await L.rateLimit('rl:like:' + ip, 60, 3600))) return L.send(res, 429, { error: 'slow_down' });
      const exists = (await L.cmd('HEXISTS', 'd:articles', id)) === 1;
      if (!exists) return L.send(res, 404, { error: 'not_found' });
      const had = await L.cmd('SISMEMBER', 'likes:' + id, vid);
      if (had === 1) await L.cmd('SREM', 'likes:' + id, vid); else await L.cmd('SADD', 'likes:' + id, vid);
      const n = await L.cmd('SCARD', 'likes:' + id);
      return L.send(res, 200, { likes: n, liked: had !== 1 });
    }

    if (action === 'comment' || action === 'review') {
      const name = L.clean(b.name, 60);
      const text = L.clean(b.text, action === 'comment' ? 1000 : 1500);
      if (name.length < 2 || text.length < 3) return L.send(res, 400, { error: 'too_short' });
      if (LINK.test(text) || LINK.test(name)) return L.send(res, 400, { error: 'no_links' });
      if (!(await L.rateLimit('rl:' + action + ':' + ip, action === 'comment' ? 8 : 4, 3600))) return L.send(res, 429, { error: 'slow_down' });
      const cfg = await L.getCfg();
      const id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const created = new Date().toISOString();
      if (action === 'comment') {
        const aid = L.clean(b.article_id, 40);
        if ((await L.cmd('HEXISTS', 'd:articles', aid)) !== 1) return L.send(res, 404, { error: 'not_found' });
        const status = cfg.comments_mode === 'moderate' ? 'pending' : 'approved';
        await L.cmd('HSET', 'd:comments', id, JSON.stringify({ id, article_id: aid, name, text, status, created }));
        return L.send(res, 200, { ok: true, status });
      }
      const target = ['site', 'office', 'article'].includes(b.target) ? b.target : 'site';
      const rating = Math.min(5, Math.max(1, parseInt(b.rating, 10) || 5));
      let aid = '';
      if (target === 'article') {
        aid = L.clean(b.article_id, 40);
        if ((await L.cmd('HEXISTS', 'd:articles', aid)) !== 1) return L.send(res, 404, { error: 'not_found' });
      }
      const status = cfg.reviews_mode === 'auto' ? 'approved' : 'pending';
      await L.cmd('HSET', 'd:reviews', id, JSON.stringify({ id, target, article_id: aid, name, rating, text, status, created }));
      return L.send(res, 200, { ok: true, status });
    }
    L.send(res, 400, { error: 'action' });
  } catch (e) {
    L.send(res, 500, { error: 'server_error' });
  }
};
