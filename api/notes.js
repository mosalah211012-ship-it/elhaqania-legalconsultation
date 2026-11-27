const fs = require('fs');
const path = require('path');
const L = require('./_lib');

// One-time download of the inheritance notes with the buyer's name watermarked on every page.
module.exports = async function handler(req, res) {
  try {
    const t = String((req.query && req.query.t) || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);
    if (!t) { res.statusCode = 400; return res.end('bad'); }
    const oid = await L.cmd('GETDEL', 'dl:' + t);
    if (!oid) { res.statusCode = 410; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.end('الرابط انتهى أو اتستخدم قبل كده. اطلب رابط جديد من حسابك.'); }
    const raw = await L.cmd('HGET', 'd:orders', oid);
    const o = raw ? JSON.parse(raw) : null;
    if (!o || (o.status !== 'approved' && o.status !== 'provisional')) { res.statusCode = 403; return res.end('no'); }
    const cfg = await L.getCfg();
    const url = String(cfg.notes_file || '');
    if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url)) { res.statusCode = 503; return res.end('file_missing'); }
    const r = await fetch(url);
    if (!r.ok) { res.statusCode = 502; return res.end('fetch_failed'); }
    const bytes = Buffer.from(await r.arrayBuffer());
    const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
    const fontkit = require('@pdf-lib/fontkit');
    const doc = await PDFDocument.load(bytes);
    doc.registerFontkit(fontkit);
    let fontPath = [path.join(process.cwd(), 'assets-fonts', 'kufi.ttf'), path.join(__dirname, '..', 'assets-fonts', 'kufi.ttf')].find(p => fs.existsSync(p));
    const font = await doc.embedFont(fs.readFileSync(fontPath), { subset: true });
    const name = String(o.name || '').slice(0, 60);
    const small = name + '  |  ' + o.id;
    const pages = doc.getPages();
    pages.forEach((p, i) => {
      const { width, height } = p.getSize();
      // diagonal name, light enough that the letterhead logo stays clearly visible
      const w = font.widthOfTextAtSize(name, 34);
      p.drawText(name, { x: width / 2 - w * 0.35, y: height / 2 - w * 0.25, size: 34, font, color: rgb(0.45, 0.45, 0.45), opacity: 0.11, rotate: degrees(32) });
      const w2 = font.widthOfTextAtSize(small, 7);
      p.drawText(small, { x: width / 2 - w2 / 2, y: 6, size: 7, font, color: rgb(0.35, 0.35, 0.35), opacity: 0.7 });
    });
    doc.setTitle('مذكرة المواريث');
    doc.setAuthor('الحقانية للإستشارات القانونية');
    doc.setSubject('نسخة خاصة بـ ' + name);
    const out = Buffer.from(await doc.save());
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="mawarith-notes.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Length', out.length);
    res.end(out);
  } catch (e) {
    res.statusCode = 500; res.end('error');
  }
};
