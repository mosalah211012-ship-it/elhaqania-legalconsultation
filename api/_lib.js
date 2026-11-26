const crypto = require('crypto');
const RURL = process.env.KV_REST_API_URL;
const RTOK = process.env.KV_REST_API_TOKEN;

async function pipeline(cmds) {
  if (!RURL || !RTOK) throw new Error('storage_not_configured');
  const r = await fetch(RURL + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + RTOK, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error('storage_error_' + r.status);
  const j = await r.json();
  return j.map(x => { if (x && x.error) throw new Error(x.error); return x.result; });
}
async function cmd(...a) { return (await pipeline([a]))[0]; }

const TYPES = ['articles', 'library', 'products', 'judgments', 'extras', 'comments', 'reviews'];

async function getAll(type) {
  const flat = await cmd('HGETALL', 'd:' + type);
  const out = [];
  for (let i = 0; i < (flat || []).length; i += 2) {
    try { out.push(JSON.parse(flat[i + 1])); } catch (e) {}
  }
  return out;
}

function send(res, code, obj, cache) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(obj));
}

function clientIp(req) {
  const x = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return x || (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function rateLimit(key, max, windowSec) {
  const r = await pipeline([['INCR', key], ['EXPIRE', key, windowSec, 'NX']]);
  return r[0] <= max;
}

// ---- admin session tokens (stateless, signed with the ADMIN_PASSWORD secret) ----
function secret() {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 12) return null;
  return crypto.createHash('sha256').update('hq-session|' + p).digest();
}
function sign(payload) {
  const s = secret(); if (!s) return null;
  const b = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const m = crypto.createHmac('sha256', s).update(b).digest('base64url');
  return b + '.' + m;
}
function verify(token) {
  const s = secret(); if (!s || !token) return null;
  const [b, m] = String(token).split('.');
  if (!b || !m) return null;
  const e = crypto.createHmac('sha256', s).update(b).digest('base64url');
  const A = Buffer.from(m), B = Buffer.from(e);
  if (A.length !== B.length || !crypto.timingSafeEqual(A, B)) return null;
  try {
    const p = JSON.parse(Buffer.from(b, 'base64url').toString());
    if (!p.exp || p.exp < Date.now()) return null;
    return p;
  } catch (e2) { return null; }
}
function passwordOk(input) {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 12 || typeof input !== 'string') return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(p).digest();
  return crypto.timingSafeEqual(a, b);
}
function isAdmin(req) {
  const h = req.headers.authorization || '';
  return !!verify(h.startsWith('Bearer ') ? h.slice(7) : '');
}

function clean(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}
function today() { return new Date().toISOString().slice(0, 10); }

async function getCfg() {
  const flat = await cmd('HGETALL', 'cfg');
  const c = { comments_mode: 'auto', reviews_mode: 'moderate' };
  for (let i = 0; i < (flat || []).length; i += 2) c[flat[i]] = flat[i + 1];
  return c;
}

function isPublished(a, now) {
  if (a.status && a.status !== 'active' && a.status !== 'published') return false;
  if (a.publish_at && Date.parse(a.publish_at) > now) return false;
  return true;
}
function fmtDate(iso) {
  const d = new Date(iso); if (isNaN(d)) return '';
  const p = n => String(n).padStart(2, '0');
  return p(d.getUTCDate()) + '/' + p(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear();
}

module.exports = { pipeline, cmd, TYPES, getAll, send, clientIp, rateLimit, sign, verify, passwordOk, isAdmin, clean, today, getCfg, isPublished, fmtDate };
