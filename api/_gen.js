// Seeded problem generator + answer checking, on top of the tested inheritance engine.
const crypto = require('crypto');
const E = require('./_engine');
const F = E.F;

function rng(seedStr) {
  let h = crypto.createHash('sha256').update(String(seedStr)).digest();
  let a = h.readUInt32LE(0), b = h.readUInt32LE(4), c = h.readUInt32LE(8), d = h.readUInt32LE(12);
  return function () { // sfc32
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const ri = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
const maybe = (r, p) => r() < p;

const T = {
  1: r => {
    const o = {}; const sp = pick(r, ['husband', 'wife', null]); if (sp) o[sp] = 1;
    const s = ri(r, 0, 3), d = ri(r, 0, 3); if (!s && !d) { if (maybe(r, .5)) o.sons = 1; else o.daughters = ri(r, 1, 3); }
    if (s) o.sons = s; if (d) o.daughters = d; return o;
  },
  2: r => {
    const o = T[1](r); const k = ri(r, 0, 2);
    if (k === 0) { o.father = 1; o.mother = 1; } else if (k === 1) o.mother = 1; else o.father = 1;
    return o;
  },
  3: r => {
    const o = {}; const sp = pick(r, ['husband', 'wife', null]); if (sp) o[sp] = 1;
    const k = ri(r, 0, 4);
    if (k === 0) { o.mother = 1; o.fullBrothers = ri(r, 1, 2); o.fullSisters = ri(r, 0, 2); }
    else if (k === 1) { o.fullSisters = ri(r, 1, 3); o.paternalBrothers = ri(r, 0, 2); }
    else if (k === 2) { o.mother = 1; o.maternalBrothers = ri(r, 1, 2); o.paternalBrothers = ri(r, 1, 2); }
    else if (k === 3) { o.grandmotherMother = 1; o.daughters = ri(r, 1, 2); o.fullBrothers = 1; }
    else { o.father = 1; o.grandmotherMother = 1; o.maternalSisters = ri(r, 1, 2); o.daughters = 1; }
    return o;
  },
  4: r => {
    const k = ri(r, 0, 5);
    if (k === 0) return { husband: 1, fullSisters: 2, mother: 1 };
    if (k === 1) return { mother: 1, daughters: ri(r, 1, 2) };
    if (k === 2) return { wife: 1, mother: 1, daughters: 2, father: 1 };
    if (k === 3) return { husband: 1, daughters: 2, mother: 1, father: 1 };
    if (k === 4) return { fullSisters: ri(r, 2, 3), mother: 1, maternalBrothers: 1, husband: 1 };
    return { wife: 1, fullSisters: ri(r, 1, 2), maternalSisters: 2 };
  },
  5: r => {
    const k = ri(r, 0, 5);
    if (k === 0) return { husband: 1, mother: 1, father: 1 };
    if (k === 1) return { wife: 1, mother: 1, father: 1 };
    if (k === 2) return { husband: 1, mother: 1, maternalBrothers: 2, fullBrothers: ri(r, 1, 2) };
    if (k === 3) return { grandfatherFather: 1, fullBrothers: ri(r, 1, 2), fullSisters: ri(r, 0, 2) };
    if (k === 4) return { daughters: 1, sonSons: ri(r, 1, 2), sonDaughters: ri(r, 0, 2) };
    return { wife: 1, grandfatherFather: 1, fullSisters: 1, mother: 1 };
  },
  6: r => {
    const k = ri(r, 0, 5);
    if (k === 0) return { husband: 1, mother: 1, grandfatherFather: 1, fullSisters: 1 };
    if (k === 1) return { dDaughters: 1, maternalUncle: 1 };
    if (k === 2) return { sisterSonsFull: 1, aunt: 1 };
    if (k === 3) return { wife: 1, daughters: 1, grandfatherFather: 1, fullBrothers: 1, fullSisters: 2 };
    if (k === 4) return { husband: 1, daughters: 2, sonSons: 1, sonDaughters: 2, mother: 1 };
    return { wife: 1, father: 1, mother: 1, daughters: 2, sonSons: ri(r, 1, 2) };
  }
};

function describeInput(inp) {
  return Object.keys(inp).filter(k => inp[k] > 0).map(k => ({ id: k, count: inp[k], name: E.NAMES[k] }));
}

// Make problem for level+seed. Returns {inp, ask:{id}, estate} or null
function makeProblem(level, seed) {
  level = Math.max(1, Math.min(6, level | 0));
  for (let attempt = 0; attempt < 40; attempt++) {
    const r = rng(seed + '|' + attempt);
    const inp = T[level](r);
    let res;
    try { res = E.solve(inp, {}); } catch (e) { continue; }
    if (!res.rows.length || res.flags.some(f => f.id === 'manual')) continue;
    if (!F.eq(res.total, F.one())) continue;
    // pick the asked heir among rows with positive share (prefer non-trivial)
    const rows = res.rows.filter(x => F.val(x.frac) > 0);
    if (!rows.length) continue;
    const row = rows[Math.floor(r() * rows.length)];
    const estate = pick(r, [60000, 120000, 240000, 360000, 480000, 720000, 960000]);
    return { inp, ask: row.id, estate, level, seed: String(seed) };
  }
  return null;
}

function parseAns(s) {
  s = String(s == null ? '' : s).trim()
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/٫/g, '.').replace(/،/g, '.').replace(/÷/g, '/').replace(/\s+/g, '');
  let m = s.match(/^(\d{1,7})\/(\d{1,7})$/);
  if (m && +m[2] > 0) return +m[1] / +m[2];
  m = s.match(/^(\d{1,7})\.?(\d*)$/);
  if (m) return parseFloat(s);
  m = s.match(/^(\d+(?:\.\d+)?)%$/);
  if (m) return parseFloat(m[1]) / 100;
  return NaN;
}
function checkAnswer(problem, answer) {
  const res = E.solve(problem.inp, {});
  const row = res.rows.find(x => x.id === problem.ask);
  const want = F.val(row.frac);
  const got = parseAns(answer);
  const ok = isFinite(got) && Math.abs(got - want) < 1e-6;
  return { ok, want: F.txt(row.frac), res };
}

function frac(f) { return F.txt(f); }
function solutionOf(inp, opts) {
  const res = E.solve(inp, opts || {});
  return {
    asl: res.asl, awl: !!res.awl, radd: !!res.radd, omariyyatan: !!res.omariyyatan,
    steps: res.steps, notes: res.notes, flags: res.flags, asabaNote: res.asabaNote || null,
    blocked: res.blocked.map(b => ({ id: b.id, name: E.nm(b.id), by: b.by, law: b.law })),
    rows: res.rows.map(r => ({ id: r.id, name: E.nm(r.id), count: r.count, frac: frac(r.frac), units: r.units, perHead: r.perHead, kind: r.kind, reason: r.reason, law: r.law, evidence: r.evidence })),
    evidenceSummary: res.evidenceSummary
  };
}

module.exports = { makeProblem, checkAnswer, solutionOf, describeInput, parseAns, rng };
