// Daily keep-alive: tiny requests to Supabase (so the free project is not paused) and to Redis.
const L = require('./_lib');
module.exports = async function handler(req, res) {
  const auth = req.headers.authorization || '';
  if (process.env.CRON_SECRET && auth !== 'Bearer ' + process.env.CRON_SECRET) { res.statusCode = 401; return res.end('no'); }
  const out = {};
  try {
    const r = await fetch((process.env.SUPABASE_URL || 'https://vjzhmbdkrsanzmedremg.supabase.co') + '/auth/v1/settings', { headers: { apikey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_S7_fqWmzfh-SfpaC5oQ5sg_2JG7Av4D' } });
    out.supabase = r.status;
  } catch (e) { out.supabase = 'err'; }
  try { out.redis = await L.cmd('PING'); } catch (e) { out.redis = 'err'; }
  L.send(res, 200, out);
};
