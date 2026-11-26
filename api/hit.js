const L = require('./_lib');
const VID = /^[A-Za-z0-9_-]{8,64}$/;
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor/i;

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const d = L.today();
      const r = await L.pipeline([['GET', 'st:views'], ['PFCOUNT', 'st:uv'], ['GET', 'st:views:' + d], ['PFCOUNT', 'st:uv:' + d]]);
      return L.send(res, 200, { views: Number(r[0] || 0), visitors: r[1] || 0, today_views: Number(r[2] || 0), today_visitors: r[3] || 0 }, 'public, s-maxage=60, stale-while-revalidate=300');
    }
    if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const ua = String(req.headers['user-agent'] || '');
    if (BOT.test(ua) || !VID.test(String(b.vid || ''))) return L.send(res, 200, { ok: false });
    if (!(await L.rateLimit('rl:hit:' + L.clientIp(req), 200, 3600))) return L.send(res, 200, { ok: false });
    let path = L.clean(b.path, 80).split('?')[0].replace(/\.html$/, '') || '/';
    if (!path.startsWith('/')) path = '/' + path;
    const d = L.today();
    await L.pipeline([
      ['INCR', 'st:views'], ['INCR', 'st:views:' + d], ['EXPIRE', 'st:views:' + d, 60 * 86400, 'NX'],
      ['PFADD', 'st:uv', b.vid], ['PFADD', 'st:uv:' + d, b.vid], ['EXPIRE', 'st:uv:' + d, 60 * 86400, 'NX'],
      ['HINCRBY', 'st:pages', path, 1]
    ]);
    L.send(res, 200, { ok: true });
  } catch (e) {
    L.send(res, 200, { ok: false });
  }
};
