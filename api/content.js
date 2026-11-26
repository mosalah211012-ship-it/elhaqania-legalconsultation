const L = require('./_lib');

// Public read endpoint. Also accepts the legacy form: ?action=get_data&sheet=articles
module.exports = async function handler(req, res) {
  try {
    const q = req.query || {};
    const type = String(q.type || q.sheet || '');
    if (!['articles', 'library', 'products', 'judgments', 'extras', 'reviews'].includes(type)) {
      return L.send(res, 400, { error: 'bad_type' });
    }
    const now = Date.now();
    let items = await L.getAll(type);
    if (type === 'reviews') {
      items = items.filter(r => r.status === 'approved' && (!q.target || r.target === q.target));
      items.sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
      return L.send(res, 200, items.map(r => ({ id: r.id, name: r.name, rating: Number(r.rating) > 0 && Number(r.rating) <= 5 ? Number(r.rating) : 0, text: r.text, target: r.target, article_id: r.article_id || '', reply: r.reply || '', created: r.created })), 'public, s-maxage=30, stale-while-revalidate=120');
    }
    items = items.filter(a => L.isPublished(a, now)).map(a => Object.assign({}, a, { status: 'active' }));
    if (type === 'articles') {
      items.sort((a, b) => Date.parse(b.publish_at || 0) - Date.parse(a.publish_at || 0));
      const counts = await L.pipeline(items.map(a => ['SCARD', 'likes:' + a.id]));
      items = items.map((a, i) => Object.assign({}, a, { date: a.publish_at ? L.fmtDate(a.publish_at) : (a.date || ''), likes: counts[i] || 0 }));
    } else {
      items.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    }
    L.send(res, 200, items, 'public, s-maxage=30, stale-while-revalidate=120');
  } catch (e) {
    L.send(res, 500, { error: 'server_error' });
  }
};
