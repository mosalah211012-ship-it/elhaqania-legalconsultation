const fs = require('fs');
const path = require('path');
const L = require('./_lib');

const SITE = 'https://elhaqania-legalconsultation.vercel.app';
const CARD = 'https://jfa9qoskskljefrl.public.blob.vercel-storage.com/og-card-0Sh3IiYikRb9yjJDLLfGx3NOMcn2ln.jpg';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function plain(s, n) {
  const t = String(s || '').replace(/<[^>]*>/g, ' ').replace(/[*_#>`]+/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t;
}
function readTemplate() {
  const cands = [path.join(process.cwd(), 'article-detail.html'), path.join(__dirname, '..', 'article-detail.html')];
  for (const p of cands) { try { return fs.readFileSync(p, 'utf8'); } catch (e) {} }
  throw new Error('template_missing');
}

// Serves the article page with per-article title, description and image in the HTML head,
// so Facebook, WhatsApp and other crawlers (which do not run JS) show a proper preview.
module.exports = async function handler(req, res) {
  let html;
  try { html = readTemplate(); } catch (e) { res.statusCode = 500; return res.end('error'); }
  try {
    const id = String((req.query && req.query.id) || '').slice(0, 40);
    const items = await L.getAll('articles');
    const a = items.find(x => String(x.id) === id && L.isPublished(x, Date.now()));
    if (a) {
      const title = plain(a.title_ar || a.title_en || '', 110);
      const desc = plain(a.content_ar || a.content_en || '', 200);
      const img = /^https:\/\//.test(String(a.image || '')) ? a.image : CARD;
      const url = SITE + '/article-detail?id=' + encodeURIComponent(id);
      const t = esc(title + ' - الحقانية'), d = esc(desc), i = esc(img), u = esc(url);
      html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/, '<title>' + t + '</title>');
      html = html.replace(/<meta name="description"[^>]*>/, '<meta name="description" content="' + d + '">');
      html = html.replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="' + u + '">');
      html = html.replace(/<meta property="og:(title|description|url|type|image)"[^>]*>\s*/g, '');
      html = html.replace(/<meta name="twitter:(card|title|description|image)"[^>]*>\s*/g, '');
      const tags = [
        '<meta property="og:type" content="article">',
        '<meta property="og:title" content="' + esc(title) + '">',
        '<meta property="og:description" content="' + d + '">',
        '<meta property="og:url" content="' + u + '">',
        '<meta property="og:image" content="' + i + '">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="' + esc(title) + '">',
        '<meta name="twitter:description" content="' + d + '">',
        '<meta name="twitter:image" content="' + i + '">'
      ].join('\n');
      html = html.replace('</head>', tags + '\n</head>');
    }
  } catch (e) { /* fall back to the plain template */ }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.end(html);
};
