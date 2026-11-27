const L = require('./_lib');

const DEFAULT_PRICES = {
  eg: { wa: 300, call: 500, urgent_wa: 450, urgent_call: 750 },
  foreign: { wa: 40, urgent: 60 },
  urgent_promise_hours: 1
};
const ARAB = ['EG','SA','AE','KW','QA','BH','OM','JO','LB','SY','IQ','YE','PS','LY','SD','TN','DZ','MA','MR','SO','DJ','KM'];
const FRENCH = ['FR','BE','LU','CH','MC','SN','CI','CM','CD','GA','CG','ML','BF','NE','TG','BJ','GN','MG','HT'];

async function getJson(key, def) {
  try { const r = await L.cmd('GET', key); return r ? JSON.parse(r) : def; } catch (e) { return def; }
}

module.exports = async function handler(req, res) {
  try {
    const country = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
    const lang = ARAB.includes(country) ? 'ar' : FRENCH.includes(country) ? 'fr' : 'en';
    const dev = String((req.query && req.query.dev) || '').slice(0, 64);
    const keys = ['site:ov', 'site:certs', 'site:prices'];
    const [ov, certs, prices] = await Promise.all(keys.map((k, i) => getJson(k, i === 0 ? { t: {}, i: {} } : i === 1 ? null : null)));
    let banned = false;
    if (dev || true) { try { banned = await L.banCheck(req, null, dev); } catch (e) {} }
    L.send(res, 200, {
      country, lang, ov: ov || { t: {}, i: {} }, certs: certs, prices: Object.assign({}, DEFAULT_PRICES, prices || {}),
      banned
    }, 'no-store');
  } catch (e) {
    L.send(res, 200, { country: '', lang: 'ar', ov: { t: {}, i: {} }, certs: null, prices: DEFAULT_PRICES, banned: false });
  }
};
