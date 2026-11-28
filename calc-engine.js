/* Inheritance engine, Egyptian law (Law 77/1943 + Law 71/1946 arts 76-78).
   TEST VERSION. Not wired into the live site. Pure functions, exact fractions. */
(function (root) {
'use strict';
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const F = {
  make(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; },
  add: (a, b) => F.make(a.n * b.d + b.n * a.d, a.d * b.d),
  sub: (a, b) => F.make(a.n * b.d - b.n * a.d, a.d * b.d),
  mul: (a, b) => F.make(a.n * b.n, a.d * b.d),
  div: (a, b) => F.make(a.n * b.d, a.d * b.n),
  val: a => a.n / a.d,
  zero: () => F.make(0, 1), one: () => F.make(1, 1),
  eq: (a, b) => a.n === b.n && a.d === b.d,
  cmp: (a, b) => a.n * b.d - b.n * a.d,
  txt: a => a.d === 1 ? String(a.n) : a.n + '/' + a.d
};

// ---- heirs (ids kept compatible with the live calculator) ----
const NAMES = {
  husband: 'الزوج', wife: 'الزوجة', father: 'الأب', mother: 'الأم',
  grandfatherFather: 'الجد (أب الأب)', grandfatherFatherFather: 'الجد (أب أب الأب)',
  grandmotherFather: 'الجدة (أم الأب)', grandmotherMother: 'الجدة (أم الأم)', grandmotherMotherMother: 'الجدة (أم أم الأم)',
  grandmotherFatherFather: 'الجدة (أم أب الأب)', grandmotherMotherFather: 'الجدة (أم أم الأب)',
  sons: 'الابن', daughters: 'البنت', sonSons: 'ابن الابن', sonDaughters: 'بنت الابن',
  sonSonSons: 'ابن ابن الابن', sonSonDaughters: 'بنت ابن الابن', sonSonSonSons: 'ابن ابن ابن الابن', sonSonSonDaughters: 'بنت ابن ابن الابن',
  fullBrothers: 'الأخ الشقيق', fullSisters: 'الأخت الشقيقة', paternalBrothers: 'الأخ لأب', paternalSisters: 'الأخت لأب',
  maternalBrothers: 'الأخ لأم', maternalSisters: 'الأخت لأم',
  sonFullBrothers: 'ابن الأخ الشقيق', sonPaternalBrothers: 'ابن الأخ لأب', sonSonFullBrothers: 'ابن ابن الأخ الشقيق', sonSonPaternalBrothers: 'ابن ابن الأخ لأب',
  fullUncles: 'العم الشقيق', paternalUncles: 'العم لأب', sonFullUncles: 'ابن العم الشقيق', sonPaternalUncles: 'ابن العم لأب',
  sonSonFullUncles: 'ابن ابن العم الشقيق', sonSonPaternalUncles: 'ابن ابن العم لأب',
  grandfatherFullBrothers: 'عم الأب الشقيق', grandfatherPaternalBrothers: 'عم الأب لأب',
  sonGrandfatherFullBrothers: 'ابن عم الأب الشقيق', sonGrandfatherPaternalBrothers: 'ابن عم الأب لأب',
  // dhawu al-arham (new)
  dSons: 'ابن البنت', dDaughters: 'بنت البنت',
  grandfatherMother: 'جد الأم (الجد غير الصحيح)',
  brotherDaughtersFull: 'بنت الأخ الشقيق', brotherDaughtersPaternal: 'بنت الأخ لأب',
  sisterSonsFull: 'ابن الأخت الشقيقة', sisterDaughtersFull: 'بنت الأخت الشقيقة',
  sisterSonsPaternal: 'ابن الأخت لأب', sisterDaughtersPaternal: 'بنت الأخت لأب',
  maternalSibSons: 'ابن الأخ/الأخت لأم', maternalSibDaughters: 'بنت الأخ/الأخت لأم',
  baytMal: 'بيت المال (الخزينة العامة)',
  aunt: 'العمة', uncleMaternal: 'العم لأم', maternalUncle: 'الخال', maternalAunt: 'الخالة'
};
const ALL = Object.keys(NAMES);
const nm = id => NAMES[id] || id;
const GENS = [['sons', 'daughters'], ['sonSons', 'sonDaughters'], ['sonSonSons', 'sonSonDaughters'], ['sonSonSonSons', 'sonSonSonDaughters']];
const GM = [
  { id: 'grandmotherFather', deg: 2, pat: true }, { id: 'grandmotherMother', deg: 2, pat: false },
  { id: 'grandmotherMotherMother', deg: 3, pat: false }, { id: 'grandmotherFatherFather', deg: 3, pat: true },
  { id: 'grandmotherMotherFather', deg: 3, pat: true }
];
// asaba chain (art 17,18): [id, direction, degree, strength]. brothers pair with sisters.
const CHAIN = [
  ['fullBrothers', 3, 2, 2], ['paternalBrothers', 3, 2, 1],
  ['sonFullBrothers', 3, 3, 2], ['sonPaternalBrothers', 3, 3, 1], ['sonSonFullBrothers', 3, 4, 2], ['sonSonPaternalBrothers', 3, 4, 1],
  ['fullUncles', 4, 3, 2], ['paternalUncles', 4, 3, 1], ['sonFullUncles', 4, 4, 2], ['sonPaternalUncles', 4, 4, 1],
  ['sonSonFullUncles', 4, 5, 2], ['sonSonPaternalUncles', 4, 5, 1], ['grandfatherFullBrothers', 4, 5, 2], ['grandfatherPaternalBrothers', 4, 5, 1],
  ['sonGrandfatherFullBrothers', 4, 6, 2], ['sonGrandfatherPaternalBrothers', 4, 6, 1]
];
const ARHAM_IDS = ['dSons', 'dDaughters', 'grandfatherMother', 'brotherDaughtersFull', 'brotherDaughtersPaternal', 'sisterSonsFull', 'sisterDaughtersFull',
  'sisterSonsPaternal', 'sisterDaughtersPaternal', 'maternalSibSons', 'maternalSibDaughters', 'aunt', 'uncleMaternal', 'maternalUncle', 'maternalAunt'];

/* solve(input, opts)
   input: {heirId: count}. opts.barred: [ids] barred by a cause of exclusion (art 5,6): they do not inherit and do not block (art 24).
   Returns rows (per heir group), blocked list, notes, flags (disputed points), steps (the memo's 7 steps). */

// Evidence shown beside each result (Quran / Sunnah / consensus / statute article)
const EV = {
  husband: 'النساء ١٢: «ولكم نصف ما ترك أزواجكم إن لم يكن لهن ولد…» — م١١ من ق٧٧/١٩٤٣',
  wife: 'النساء ١٢: «ولهن الربع مما تركتم إن لم يكن لكم ولد…» — م١١',
  daughters: 'النساء ١١: «فإن كن نساء فوق اثنتين فلهن ثلثا ما ترك وإن كانت واحدة فلها النصف» — م١٢',
  sons: 'النساء ١١: «للذكر مثل حظ الأنثيين» — م١٧',
  father: 'النساء ١١: «ولأبويه لكل واحد منهما السدس مما ترك إن كان له ولد» — م٩',
  mother: 'النساء ١١: «فإن لم يكن له ولد وورثه أبواه فلأمه الثلث فإن كان له إخوة فلأمه السدس» — م١٤',
  grandfatherFather: 'اجتهاد الصحابة (قول زيد بن ثابت: المقاسمة مع الذكور، وقول عمر وابن مسعود: فرض الأخت والباقي للجد عند الأخوات فقط) والجد كالأب عند عدمه — م٩ و٢٢. فيه خلاف: أبو حنيفة يحجب الإخوة بالجد، والقانون أخذ بالمقاسمة',
  grandmotherFather: 'حديث المغيرة بن شعبة ومحمد بن مسلمة: «أن رسول الله ﷺ أعطاها السدس» (سنن أبي داود 2894، مختلف في الحكم عليه: ضعّفه الألباني وصححه الأرناؤوط، وعمل به الصحابة والفقهاء) — م١٤',
  grandmotherMother: 'حديث المغيرة ومحمد بن مسلمة: أعطاها رسول الله ﷺ السدس (أبو داود 2894، مختلف في الحكم عليه) — م١٤',
  sonDaughters: 'قضاء ابن مسعود بما قضى به النبي ﷺ (صحيح البخاري 6736): «للابنة النصف ولابنة الابن السدس تكملة الثلثين وما بقي فللأخت» — م١٢(ب)',
  fullSisters: 'النساء ١٧٦: «فإن كانتا اثنتين فلهما الثلثان مما ترك» وقضاء معاذ بن جبل على عهد رسول الله ﷺ: النصف للابنة والنصف للأخت (صحيح البخاري 6741) — م١٣ و٢٠',
  paternalSisters: 'النساء ١٧٦ — م١٣(ب)',
  maternalBrothers: 'النساء ١٢: «وإن كان رجل يورث كلالة أو امرأة وله أخ أو أخت فلكل واحد منهما السدس فإن كانوا أكثر من ذلك فهم شركاء في الثلث» — م١٠',
  maternalSisters: 'النساء ١٢ — م١٠',
  fullBrothers: 'حديث «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر» (البخاري 6732، مسلم 1615، عن ابن عباس) — م١٧ و١٨',
  paternalBrothers: 'حديث «ألحقوا الفرائض بأهلها…» (البخاري 6732، مسلم 1615، عن ابن عباس) — م١٧ و١٨',
  _asaba: 'حديث «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر» (البخاري 6732، مسلم 1615، عن ابن عباس) — م١٧ و١٨',
  _arham: 'الأنفال ٧٥: «وأولو الأرحام بعضهم أولى ببعض في كتاب الله» — م٣١ إلى ٣٨. الجمهور القدامى (مالك والشافعي) لا يورثونهم، والقانون المصري يورثهم',
  _awl: 'العول: قضاء عمر ثم قول جمهور الصحابة والفقهاء (وخالف ابن عباس) — م١٥',
  _radd: 'الرد: الأنفال ٧٥ وقول جمهور الفقهاء (وخالف زيد بن ثابت ومالك والشافعي) — م٣٠. الرد على الزوجين بعد ذوي الأرحام (خلاف بين العلماء)',
  _mushtaraka: 'المشتركة: قضاء عمر وزيد بن ثابت بالتشريك ورُوي عن ابن مسعود (سنن الدارمي 2882، البيهقي الكبرى 12600) — م١٠. خلاف: أبو حنيفة وأحمد لا يشركون'
};
function evidenceFor(r) {
  if (EV[r.id]) return EV[r.id];
  if (/ذوي الأرحام|arham/i.test(r.reason || '') || ARHAM_IDS.indexOf(r.id) >= 0) return EV._arham;
  if (/تعصيب|عصبة/.test(r.kind || '')) return EV._asaba;
  return '';
}

// ---- consolidated evidence per problem: only the evidence types that actually exist ----
const PE = {
  omariyyatan: [
    ['أثر', 'قضاء عمر بن الخطاب بثلث الباقي للأم وأخذ به جمهور الصحابة والأئمة الأربعة (وخالف ابن عباس فأعطاها ثلث الكل)'],
    ['قياس', 'الأم ترث ثلث الباقي لتبقى نسبة الأب إليها ضعف نصيبها كما في آية «وورثه أبواه فلأمه الثلث» (النساء ١١)'],
    ['قرآن', 'النساء ١١ (ولأبويه…) والنساء ١٢ (نصيب الزوجين)'],
    ['مادة', 'م١٤ و١١ من ق٧٧/١٩٤٣']
  ],
  awl: [['أثر', 'قضاء عمر في أول مسألة عائلة بقسمة التركة بالحصص، وقول علي وابن مسعود وزيد (ابن المنذر، الأوسط)، وخالف ابن عباس'], ['قياس', 'قياس على تحاصص الغرماء عند ضيق المال (تعليل عمر: أقسمه عليكم بالحصص)'], ['مادة', 'م١٥ ق٧٧/١٩٤٣']],
  radd: [['قرآن', 'الأنفال ٧٥ (وأولو الأرحام بعضهم أولى ببعض) على قول القائلين بالرد'], ['أثر', 'قول جمهور الفقهاء بالرد على غير الزوجين، وخالف زيد بن ثابت ومالك والشافعي'], ['مادة', 'م٣٠']],
  mushtaraka: [['أثر', 'قضاء عمر وزيد بن ثابت بالتشريك ورُوي عن ابن مسعود (سنن الدارمي 2882، والبيهقي الكبرى 12600: «هبوا أباهم كان حمارًا»). خالف علي وأبو حنيفة وأحمد، وروي عن ابن مسعود الأمران'], ['قياس', 'قياس الأشقاء على ولد الأم لاشتراكهم في الأم'], ['قرآن', 'النساء ١٢ (فهم شركاء في الثلث)'], ['مادة', 'م١٠']],
  akdariyya: [['أثر', 'نص م٢٢: الأخت بفرضها والجد بالباقي (قول عمر وابن مسعود في المربعة)، فيأخذ الجد ١/٩ والأخت ٣/٩. وقول زيد من ٢٧ (للأم ٦ وللزوج ٩ وللجد ٨ وللأخت ٤، سنن الدارمي 2931) مخالف لنص القانون. ليست محل إجماع'], ['مادة', 'م٢٢ (الجد لا ينقص عن السدس) وم١٥ (العول)']],
  grandfatherSiblings: [['أثر', 'مقاسمة الجد للإخوة الذكور قول زيد بن ثابت، وفرض الأخت والباقي للجد قول عمر وابن مسعود (انظر شرح المربعة)، وأبو حنيفة يحجب الإخوة بالجد'], ['مادة', 'م٢٢']],
  arham: [['قرآن', 'الأنفال ٧٥ والأحزاب ٦'], ['سنة', 'حديث «الله ورسوله مولى من لا مولى له، والخال وارث من لا وارث له» (جامع الترمذي 2103: حسن، وسنن أبي داود 2899 من حديث المقدام)'], ['مادة', 'م٣١ إلى ٣٨']],
  pregnancy: [['سنة', 'حديث «إذا استهل المولود ورث» (سنن أبي داود 2920 عن أبي هريرة، وسنن ابن ماجه 2750 عن جابر بنحوه). صححه الألباني (السلسلة الصحيحة 153) وفي إسناده ابن إسحاق وقد تكلم فيه'], ['مادة', 'م٢ و٤٢ و٤٣ و٤٤ ق٧٧/١٩٤٣']],
  khuntha: [['اجتهاد', 'مذهب أبي حنيفة: الخنثى المشكل يُعامل بأسوأ الحالين فيأخذ أقل النصيبين (وخالف مالك وأبو يوسف والشافعي)، وأخذ به القانون'], ['مادة', 'م٤٦']],
  wajiba: [['قرآن', 'البقرة ١٨٠ (الوصية للوالدين والأقربين)، وقيل إنها نُسخت في حق الوارثين بآية المواريث، ومنها استدل القائلون بالوصية الواجبة لغير الوارث'], ['مادة', 'م٧٦ ق٧١/١٩٤٦ وحكم الدستورية العليا ٨ مايو ٢٠٢١'], ['اجتهاد', 'قول ابن حزم وبعض التابعين، وجمهور الفقهاء على أن الوصية مندوبة لا واجبة. مسألة خلافية']],
  bars: [['سنة', '«القاتل لا يرث» (جامع الترمذي 2109، سنن ابن ماجه 2735، مختلف في الحكم عليه لضعف في إسناده وعمل به الفقهاء). و«لا يرث المسلم الكافر ولا الكافر المسلم» (صحيح مسلم 1614 من حديث أسامة بن زيد، متفق عليه)'], ['مادة', 'م٥ و٦ و٢٤']]
};
function problemEvidence(res, extra) {
  const keys = [];
  if (res.omariyyatan) keys.push('omariyyatan');
  if (res.awl) keys.push('awl');
  if (res.radd) keys.push('radd');
  (res.flags || []).forEach(f => { if (PE[f.id] && keys.indexOf(f.id) < 0) keys.push(f.id); });
  if (res.rows.some(r => ARHAM_IDS.indexOf(r.id) >= 0)) keys.push('arham');
  if (res.rows.some(r => r.id === 'grandfatherFather') && res.rows.some(r => /Brothers|Sisters/.test(r.id) && !/maternal/.test(r.id))) keys.push('grandfatherSiblings');
  (extra || []).forEach(k => keys.push(k));
  return keys.map(k => ({ problem: k, evidence: PE[k].map(([type, text]) => ({ type, text })) }));
}

// ---- pregnancy (Law 77/1943 arts 2, 42-44) and khuntha (art 46) ----
// unbornKind: 'child' (decedent's own child), 'sonChild' (child of a predeceased/living son), 'fullSibling', 'paternalSibling'
function solvePregnancy(inp, opts) {
  opts = opts || {};
  const kind = opts.unbornKind || 'child';
  const ids = { child: ['sons', 'daughters'], sonChild: ['sonSons', 'sonDaughters'], fullSibling: ['fullBrothers', 'fullSisters'], paternalSibling: ['paternalBrothers', 'paternalSisters'] }[kind];
  const person = (res, id, add) => { // per-person share table for scenario
    const out = {};
    res.rows.forEach(r => { const c = r.count; const per = F.div(r.frac, F.make(c)); out[r.id] = { per, others: c - (r.id === id ? 1 : 0), count: c }; });
    return out;
  };
  const scen = {};
  [['male', ids[0]], ['female', ids[1]]].forEach(([nm_, uid]) => {
    const i2 = Object.assign({}, inp); i2[uid] = (i2[uid] || 0) + 1;
    const res = solve(i2, opts);
    const pt = person(res, uid);
    const unborn = pt[uid] ? pt[uid].per : F.zero();
    const others = {};
    Object.keys(pt).forEach(id => { const n = pt[id].others; if (n > 0) others[id] = F.mul(pt[id].per, F.make(n)); });
    scen[nm_] = { unborn, others, rows: res.rows, flags: res.flags };
  });
  const maxU = F.cmp(scen.male.unborn, scen.female.unborn) >= 0 ? scen.male.unborn : scen.female.unborn;
  const minU = F.cmp(scen.male.unborn, scen.female.unborn) <= 0 ? scen.male.unborn : scen.female.unborn;
  // alive-only scenario (stillborn / not born in time: art 43)
  const none = solve(inp, opts);
  const noneShares = {}; none.rows.forEach(r => { noneShares[r.id] = r.frac; });
  const allIds = {}; [scen.male.others, scen.female.others, noneShares].forEach(o => Object.keys(o).forEach(k => allIds[k] = 1));
  const minOf = id => { const a = [scen.male.others[id] || F.zero(), scen.female.others[id] || F.zero(), noneShares[id] || F.zero()].reduce((m, x) => F.cmp(x, m) < 0 ? x : m); return a; };
  const minOfBorn = id => [scen.male.others[id] || F.zero(), scen.female.others[id] || F.zero()].reduce((m, x) => F.cmp(x, m) < 0 ? x : m);
  // art 42: reserve the greater of the two shares; others receive their certain (minimum) share now
  const immediate = {}; let sum = F.zero();
  Object.keys(allIds).forEach(id => { const v = minOfBorn(id); immediate[id] = v; sum = F.add(sum, v); });
  const suspended = F.sub(F.sub(F.one(), sum), maxU);
  // khuntha mushkil (art 46): the lesser of the two shares; the remainder goes to the other heirs pro rata
  const lessScen = F.cmp(scen.male.unborn, scen.female.unborn) <= 0 ? scen.male : scen.female;
  const kh = { unborn: minU, others: lessScen.others };
  const notes = [
    'م٤٢: يوقف للحمل أوفر النصيبين على تقدير أنه ذكر أو أنثى، ويُعطى باقي الورثة أقل ما يستحقونه يقينًا.',
    'شرط الانفصال (بتوجيه المحامي): يُعتبر المولود شخصًا مستقلًا في الميراث بعد انفصاله التام عن أمه بقطع الحبل السري، مع ظهور علامة حياة مستقرة كالبكاء أو العطاس أو الحركة البينة (م٢ و٤٣ وفقه الحنفية). الفقه يكتفي بخروج أكثره حيًا.',
    'م٤٤: بعد الولادة يرجع الموقوف إلى من يستحقه (النقص يُكمَّل ممن زادت حصته والزيادة تُردّ).',
    'م٤٣: لا يرث الحمل إلا إذا وُلد حيًا خلال ٣٦٥ يومًا من الوفاة إذا كانت أمه معتدة، أو ٢٧٠ يومًا إذا كانت الزوجية قائمة وقت الوفاة (فإن ولد ميتًا ترد التركة على الورثة).',
    'م٤٦: الخنثى المشكل له أقل النصيبين والباقي لباقي الورثة، وأخذ الباقون هنا ما يستحقونه في الفرض الذي ينقص فيه نصيب الخنثى (النص لا يفصل طريقة توزيع الباقي).',
    'الحمل المتعدد (توأم) غير مغطى في هذه النسخة، يحتاج حساب يدوي.'
  ];
  return { unbornKind: kind, scenarios: scen, noneBorn: none, reserve: maxU, immediate, suspended, khuntha: kh, notes, evidence: problemEvidence(none, ['pregnancy']).concat(problemEvidence(scen.male, []).filter(e => e.problem !== 'pregnancy')).concat([{ problem: 'khuntha', evidence: PE.khuntha.map(([type, text]) => ({ type, text })) }]) };
}
const MZ = {
  egypt:   { mush: 1, arham: 'classes', radd: 1, gmFather: 1 },
  hanafi:  { gfBlocks: 1, mush: 0, arham: 'classes', radd: 1, gmFather: 1 },
  maliki:  { zayd: 1, mush: 1, arham: 0, radd: 0, akd: 1, gmFather: 1 },
  shafii:  { zayd: 1, mush: 1, arham: 0, radd: 0, akd: 1, gmFather: 1 },
  hanbali: { zayd: 1, mush: 0, arham: 'tanzil', radd: 1, akd: 1, gmFather: 0 },
  saudi:   { gfBlocks: 1, mush: 0, arham: 'tanzil', radd: 1, gmFather: 0 }
};
const MNAMES = { egypt: 'القانون المصري', hanafi: 'المذهب الحنفي', maliki: 'المذهب المالكي', shafii: 'المذهب الشافعي', hanbali: 'المذهب الحنبلي', saudi: 'نظام الأحوال الشخصية السعودي' };
const ARHAM_MAP = { dSons: 'daughters', dDaughters: 'daughters', grandfatherMother: 'mother', brotherDaughtersFull: 'fullBrothers', brotherDaughtersPaternal: 'paternalBrothers',
  sisterSonsFull: 'fullSisters', sisterDaughtersFull: 'fullSisters', sisterSonsPaternal: 'paternalSisters', sisterDaughtersPaternal: 'paternalSisters',
  maternalSibSons: 'maternalBrothers', maternalSibDaughters: 'maternalBrothers', aunt: 'father', uncleMaternal: 'father', maternalUncle: 'mother', maternalAunt: 'mother' };
const SA_LAW = { husband: 'م٢٠٩', wife: 'م٢١٠', father: 'م٢١١', grandfatherFather: 'م٢١٢', grandfatherFatherFather: 'م٢١٢', mother: 'م٢١٣', daughters: 'م٢١٥', sonDaughters: 'م٢١٦', sonSonDaughters: 'م٢١٦',
  fullSisters: 'م٢١٧', paternalSisters: 'م٢١٨', maternalBrothers: 'م٢١٩ و٢٢٠', maternalSisters: 'م٢١٩ و٢٢٠' };
function solve(inp, opts) {
  opts = opts || {};
  const madh = MZ[opts.madhab] ? opts.madhab : 'egypt';
  if (madh !== 'egypt' && !opts._inner) {
    const r = solveCore(inp, opts, madh);
    return localize(r, madh);
  }
  return solveCore(inp, opts, madh);
}
function solveCore(inp, opts, madh) {
  const CFG = MZ[madh];
  const c = {}; ALL.forEach(id => { c[id] = Math.max(0, Math.floor((inp && inp[id]) || 0)); });
  (opts.barred || []).forEach(id => { c[id] = 0; });
  if (c.husband > 1) c.husband = 1;
  if (c.wife > 4) c.wife = 4;
  const raw = Object.assign({}, c);
  const N = id => c[id] || 0;
  const blocked = [], notes = [], flags = [];
  const B = (id, by, law) => { if (c[id] > 0) { blocked.push({ id, by, law: law || null }); c[id] = 0; } };
  const entries = []; // {members:[{id,count,weight}], frac, reason, kind, law}
  const fard = (members, frac, reason, law) => { if (F.val(frac) > 0) entries.push({ members, frac, reason, kind: 'فرض', law }); };
  const one = (id) => [{ id, count: N(id) || 1, weight: 1 }];

  // ---------- ascendants ----------
  if (N('father')) { B('grandfatherFather', 'الأب', 'م١٨'); B('grandfatherFatherFather', 'الأب', 'م١٨'); }
  else if (N('grandfatherFather')) B('grandfatherFatherFather', 'الجد الأقرب', 'م١٨');
  const gfId = N('grandfatherFather') ? 'grandfatherFather' : (N('grandfatherFatherFather') ? 'grandfatherFatherFather' : null);
  if (N('mother')) GM.forEach(g => B(g.id, 'الأم', 'م٢٥'));
  if (N('father') && CFG.gmFather) GM.filter(g => g.pat).forEach(g => B(g.id, 'الأب', 'م٢٥'));
  if (gfId === 'grandfatherFather') B('grandmotherFatherFather', 'الجد', 'م٢٥');
  let liveGM = GM.filter(g => N(g.id) > 0);
  if (liveGM.length) {
    const minDeg = Math.min(...liveGM.map(g => g.deg));
    const near = liveGM.find(g => g.deg === minDeg).id;
    liveGM.filter(g => g.deg > minDeg).forEach(g => B(g.id, nm(near), 'م٢٥'));
    liveGM = GM.filter(g => N(g.id) > 0);
  }

  // ---------- descendants (art 12, 17, 19, 27) ----------
  const hasDesc = GENS.some(g => N(g[0]) + N(g[1]) > 0);
  let maleGen = -1;
  for (let i = 0; i < 4; i++) if (N(GENS[i][0]) > 0) { maleGen = i; break; }
  const hasMaleDesc = maleGen >= 0;
  const descAsaba = []; // members (id, weight) sharing the descendants' asaba
  if (maleGen >= 0) {
    for (let i = maleGen + 1; i < 4; i++) { B(GENS[i][0], nm(GENS[maleGen][0]), 'م١٧'); B(GENS[i][1], nm(GENS[maleGen][0]), 'م٢٧'); }
  }
  let fardTotal = F.zero();
  const lastGen = maleGen >= 0 ? maleGen - 1 : 3;
  const orphanFemales = [];
  for (let i = 0; i <= lastGen; i++) {
    const fid = GENS[i][1], f = N(fid);
    if (!f) continue;
    if (F.eq(fardTotal, F.zero())) {
      const fr = f === 1 ? F.make(1, 2) : F.make(2, 3);
      fard([{ id: fid, count: f, weight: 1 }], fr, f === 1 ? 'النصف للواحدة' : 'الثلثان للاثنتين فأكثر', 'م١٢');
      fardTotal = fr;
    } else if (F.eq(fardTotal, F.make(1, 2))) {
      fard([{ id: fid, count: f, weight: 1 }], F.make(1, 6), 'السدس تكملة للثلثين', 'م١٢/ب');
      fardTotal = F.make(2, 3);
    } else {
      if (maleGen >= 0) orphanFemales.push(fid); // asabized by a lower male (art 19/2)
      else B(fid, 'البنات (استكملن الثلثين)', 'م٢٧');
    }
  }
  if (maleGen >= 0) {
    const mem = [{ id: GENS[maleGen][0], count: N(GENS[maleGen][0]), weight: 2 }];
    if (N(GENS[maleGen][1])) mem.push({ id: GENS[maleGen][1], count: N(GENS[maleGen][1]), weight: 1 });
    orphanFemales.forEach(id => mem.push({ id, count: N(id), weight: 1 }));
    descAsaba.push(...mem);
  }
  // females in gen i>=1 with a male in a HIGHER gen are already blocked above.

  // ---------- collateral blocking ----------
  const fatherP = N('father') > 0;
  const SIBS = ['fullBrothers', 'fullSisters', 'paternalBrothers', 'paternalSisters'];
  const COLL = CHAIN.map(x => x[0]).filter(id => !SIBS.includes(id));
  const rawSibCount = ['fullBrothers', 'fullSisters', 'paternalBrothers', 'paternalSisters', 'maternalBrothers', 'maternalSisters'].reduce((s, id) => s + raw[id], 0);
  if (fatherP) {
    SIBS.concat(COLL, ['maternalBrothers', 'maternalSisters']).forEach(id => B(id, 'الأب', 'م٢٦-٢٩'));
  } else if (hasMaleDesc) {
    SIBS.concat(COLL).forEach(id => B(id, nm(GENS[maleGen][0]), 'م٢٨-٢٩'));
  }
  if (hasDesc) { B('maternalBrothers', 'الفرع الوارث', 'م٢٦'); B('maternalSisters', 'الفرع الوارث', 'م٢٦'); }
  if (gfId) { B('maternalBrothers', 'الجد', 'م٢٦'); B('maternalSisters', 'الجد', 'م٢٦'); COLL.forEach(id => B(id, 'الجد', 'م١٧')); }
  if (CFG.gfBlocks && gfId && !fatherP) SIBS.forEach(id => B(id, 'الجد (يحجب الإخوة كالأب)', ''));
  const femDescNoMale = hasDesc && !hasMaleDesc;
  // paternal siblings vs full siblings (art 29, 20)
  if (N('fullBrothers')) { B('paternalBrothers', 'الأخ الشقيق', 'م١٨'); B('paternalSisters', 'الأخ الشقيق', 'م٢٩'); }
  else if (N('fullSisters') && femDescNoMale) { B('paternalBrothers', 'الأخت الشقيقة (عصبة مع الغير)', 'م٢٩'); B('paternalSisters', 'الأخت الشقيقة (عصبة مع الغير)', 'م٢٩'); }
  else if (N('fullSisters') >= 2 && !N('paternalBrothers')) B('paternalSisters', 'الأختان الشقيقتان', 'م٢٩');
  const fb = N('fullBrothers'), fs = N('fullSisters'), pb = N('paternalBrothers'), ps = N('paternalSisters');
  const akPat = N('husband') && N('mother') && gfId && !fatherP && !hasDesc && fb === 0 && pb === 0 && ((fs === 1 && ps === 0) || (fs === 0 && ps === 1)) && (N('maternalBrothers') + N('maternalSisters')) === 0;
  const zaydSis = !!(CFG.zayd && gfId && !fatherP && !hasDesc && !akPat);
  const fsAsaba = fs > 0 && (fb > 0 || femDescNoMale || zaydSis);
  const psAsaba = ps > 0 && (pb > 0 || (femDescNoMale && fs === 0) || (zaydSis && fs === 0));
  const mt = N('maternalBrothers') + N('maternalSisters');

  // ---------- spouses, mother ----------
  if (N('husband')) fard(one('husband'), hasDesc ? F.make(1, 4) : F.make(1, 2), hasDesc ? 'الربع لوجود الفرع الوارث' : 'النصف لعدم الفرع الوارث', 'م١١');
  if (N('wife')) fard([{ id: 'wife', count: N('wife'), weight: 1 }], hasDesc ? F.make(1, 8) : F.make(1, 4), hasDesc ? 'الثمن لوجود الفرع الوارث' : 'الربع لعدم الفرع الوارث', 'م١١');
  let omariyyatan = false;
  if (N('mother')) {
    let mf, rs;
    if (hasDesc || rawSibCount >= 2) { mf = F.make(1, 6); rs = 'السدس لوجود الفرع الوارث أو اثنين فأكثر من الإخوة والأخوات'; }
    else if (fatherP && (N('husband') || N('wife'))) {
      const sp = N('husband') ? F.make(1, 2) : F.make(1, 4);
      mf = F.div(F.sub(F.one(), sp), F.make(3)); omariyyatan = true; rs = 'ثلث الباقي بعد فرض الزوج (العمريتان)';
    } else { mf = F.make(1, 3); rs = 'الثلث'; }
    fard(one('mother'), mf, rs, 'م١٤');
  }
  // father / grandfather fard
  const ascFard = (id) => {
    if (hasMaleDesc) fard(one(id), F.make(1, 6), 'السدس لوجود الفرع الوارث المذكر', 'م٩');
    else if (femDescNoMale) fard(one(id), F.make(1, 6), 'السدس فرضاً + الباقي تعصيباً', 'م٢١');
  };
  if (fatherP) ascFard('father');
  if (gfId && !fatherP && hasMaleDesc) fard(one(gfId), F.make(1, 6), 'السدس لوجود الفرع الوارث المذكر', 'م٩');

  // ---------- sisters (fard) ----------
  if (fs && !fsAsaba) fard([{ id: 'fullSisters', count: fs, weight: 1 }], fs === 1 ? F.make(1, 2) : F.make(2, 3), fs === 1 ? 'النصف للواحدة' : 'الثلثان', 'م١٣');
  if (ps && !psAsaba) {
    if (fs === 1 && !fsAsaba) fard([{ id: 'paternalSisters', count: ps, weight: 1 }], F.make(1, 6), 'السدس تكملة للثلثين', 'م١٣/ب');
    else if (fs === 0) fard([{ id: 'paternalSisters', count: ps, weight: 1 }], ps === 1 ? F.make(1, 2) : F.make(2, 3), ps === 1 ? 'النصف للواحدة' : 'الثلثان', 'م١٣');
  }
  // ---------- maternal siblings + mushtaraka (art 10) ----------
  let maternalEntry = null;
  if (mt > 0) {
    const fr = mt === 1 ? F.make(1, 6) : F.make(1, 3);
    maternalEntry = { members: [], frac: fr, reason: mt === 1 ? 'السدس للواحد' : 'الثلث للاثنين فأكثر بالسوية', kind: 'فرض', law: 'م١٠' };
    if (N('maternalBrothers')) maternalEntry.members.push({ id: 'maternalBrothers', count: N('maternalBrothers'), weight: 1 });
    if (N('maternalSisters')) maternalEntry.members.push({ id: 'maternalSisters', count: N('maternalSisters'), weight: 1 });
  }
  // grandmothers
  if (liveGM.length) fard(liveGM.map(g => ({ id: g.id, count: 1, weight: 1 })), F.make(1, 6), liveGM.length > 1 ? 'السدس يقسم بين الجدات بالسوية' : 'السدس للجدة', 'م١٤');

  const sumOf = list => list.reduce((s, e) => F.add(s, e.frac), F.zero());
  // mushtaraka decision: needs sum of fards incl. maternal >= 1 and full brother(s)
  if (maternalEntry) {
    const withMat = F.add(sumOf(entries), maternalEntry.frac);
    if (fb > 0 && F.cmp(withMat, F.one()) >= 0 && !CFG.mush) { blocked.push({ id: 'fullBrothers', by: 'استغراق الفروض للتركة (لا يُقال بالمشتركة في هذا المذهب)', law: null }); if (fs) blocked.push({ id: 'fullSisters', by: 'استغراق الفروض للتركة', law: null }); c.fullBrothers = 0; if (fs) c.fullSisters = 0; flags.push({ id: 'mushtaraka_no', text: 'المسألة المشتركة: لا يشرَّك الأشقاء مع ولد الأم في الثلث في هذا المذهب، فيسقط الأشقاء لأنهم عصبة والفروض استغرقت التركة.' }); }
    else if (fb > 0 && F.cmp(withMat, F.one()) >= 0) {
      maternalEntry.members.push({ id: 'fullBrothers', count: fb, weight: 1 });
      if (fs) maternalEntry.members.push({ id: 'fullSisters', count: fs, weight: 1 });
      maternalEntry.kind = 'مشتركة'; maternalEntry.reason = 'المسألة المشتركة: يشارك الأشقاء أولاد الأم في الثلث بالسوية';
      notes.push('طُبّقت المسألة المشتركة (م١٠)');
      flags.push({ id: 'mushtaraka', text: 'المشتركة: مأخوذة من نص م١٠ (المذهبان المالكي والشافعي يقولان بها، والحنفي والحنبلي بخلافها). القانون المصري أخذ بها.' });
      c.fullBrothers = 0; if (fs) c.fullSisters = 0;
    }
    entries.push(maternalEntry);
  }
  // after mushtaraka the full brothers/sisters are consumed
  const wasMush = maternalEntry && maternalEntry.kind === 'مشتركة';

  // ---------- residue ----------
  let sum = sumOf(entries);
  let rem = F.sub(F.one(), sum);
  let awl = false, radd = false, asabaNote = null, asabaTaker = false;
  const addAsaba = (members, frac, reason, kind) => { entries.push({ members, frac, reason, kind: kind || 'تعصيب', law: 'م١٧-٢٠' }); asabaTaker = true; };
  const share2to1 = (mem, total, reason, kind) => addAsaba(mem, total, reason, kind);

  if (descAsaba.length) {
    if (F.val(rem) > 0) share2to1(descAsaba, rem, 'الباقي تعصيباً للذكر مثل حظ الأنثيين', 'تعصيب'); else descAsaba.forEach(m => { /* gets nothing: awl case */ });
    if (F.val(rem) <= 0 && descAsaba.length) { /* children take nothing only if fards exceed, which cannot occur with asaba children except awl */ }
    // father/gf residual 1/6 already counted; with male descendants no further share.
    if (gfId && !fatherP) { /* gf fard 1/6 with male descendants */ }
  }
  if (gfId && !fatherP) {
    const gMembers = [{ id: gfId, count: 1, weight: 1 }];
    if (hasMaleDesc) { /* 1/6 fard already added */ } else {
      // Art 22. participating siblings
      const eligMales = [];
      if (N('fullBrothers')) eligMales.push(['fullBrothers', N('fullBrothers')]);
      if (N('paternalBrothers')) eligMales.push(['paternalBrothers', N('paternalBrothers')]);
      const maleExists = eligMales.length > 0;
      const sisAsabaParticipants = [];
      if (fsAsaba && N('fullSisters') && !wasMush) sisAsabaParticipants.push(['fullSisters', N('fullSisters')]);
      if (psAsaba && N('paternalSisters')) sisAsabaParticipants.push(['paternalSisters', N('paternalSisters')]);
      const remNow = F.sub(F.one(), sumOf(entries));
      const sibsPresent = eligMales.length + sisAsabaParticipants.length > 0;
      if (sibsPresent) {
        // Case 1: share as a brother
        const mem = [{ id: gfId, count: 1, weight: 2 }];
        eligMales.forEach(([id, n]) => mem.push({ id, count: n, weight: 2 }));
        sisAsabaParticipants.forEach(([id, n]) => mem.push({ id, count: n, weight: 1 }));
        const heads = mem.reduce((s, m) => s + m.count * m.weight, 0);
        const gfShare = F.mul(remNow, F.make(2, heads));
        const six = F.make(1, 6);
        const third = F.div(remNow, F.make(3));
        if (CFG.zayd && F.cmp(third, gfShare) > 0 && F.cmp(third, six) >= 0) {
          entries.push({ members: gMembers, frac: third, reason: 'ثلث الباقي بعد الفروض: أفضل له من المقاسمة', kind: 'فرض', law: '' });
          const others = mem.slice(1);
          addAsaba(others, F.sub(remNow, third), 'الباقي تعصيباً للإخوة بعد ثلث الباقي للجد', 'تعصيب');
          flags.push({ id: 'zayd-gf', text: 'الجد مع الإخوة على قول زيد بن ثابت: يأخذ الجد الأفضل له من ثلاثة: المقاسمة كأخ، أو ثلث الباقي بعد الفروض، أو سدس التركة.' });
        } else if (F.cmp(gfShare, six) < 0) {
          entries.push({ members: gMembers, frac: six, reason: 'السدس: المقاسمة تنقصه عن السدس (م٢٢)', kind: 'فرض', law: 'م٢٢' });
          const rest = F.sub(remNow, six);
          const others = mem.slice(1);
          if (F.val(rest) > 0 && others.length) addAsaba(others, rest, 'الباقي تعصيباً للإخوة بعد سدس الجد', 'تعصيب');
        } else {
          addAsaba(mem, remNow, 'مقاسمة الجد للإخوة كأخ (م٢٢ الحالة الأولى)', 'مقاسمة');
          notes.push('الجد يقاسم الإخوة كأخ (م٢٢)');
        }
        flags.push({ id: 'gf-siblings', text: 'الجد مع الإخوة: القانون المصري (م٢٢) يقاسم الجد الإخوة ولا يحجبهم، بخلاف أبي حنيفة الذي يحجب الإخوة بالجد. ولا يوجد في نص م٢٢ مقارنة بثلث التركة (مذهب زيد). تنقيح "الأخوات اللاتي لم يعصبن" يحتاج مراجعة المحامي.' });
        asabaNote = 'الجد والإخوة: م٢٢';
      } else {
        // Case 2: gf takes the residue as asaba, min 1/6. Sisters (fard) already counted.
        const six = F.make(1, 6);
        let g = remNow;
        if (F.cmp(g, six) < 0) { g = six; if (N('fullSisters') + N('paternalSisters') > 0) { notes.push('الجد صار صاحب فرض بالسدس (م٢٢) فعالت المسألة'); flags.push({ id: 'akdariyya', text: 'حالة الأكدرية: م٢٢ (الحالة الثانية) تعطي الأخت فرضها والجد الباقي بما لا ينقص عن السدس فتعول المسألة إلى ٩ (الجد ١ والأخت ٣)، وهذا قول عمر وابن مسعود. أما ضم نصيب الجد والأخت وقسمتهما للذكر مثل حظ الأنثيين (من ٢٧) فهو قول زيد بن ثابت ولا يأخذ به نص القانون. العلماء مختلفون.' }); } }
        entries.push({ members: gMembers, frac: g, reason: F.val(g) > 1 / 6 ? 'الباقي تعصيباً (م٢٢ الحالة الثانية)' : 'السدس فرضاً (م٢٢)', kind: F.val(g) > 1 / 6 || F.eq(g, six) && F.val(remNow) >= 1 / 6 ? 'تعصيب' : 'فرض', law: 'م٢١-٢٢' });
        asabaTaker = true;
        if (femDescNoMale) { /* Art 21: 1/6 + residue; handled by min and residue */ }
      }
      if (femDescNoMale && !sibsPresent) {
        // gf: 1/6 fard (Art 21) + residue asaba
        entries.pop();
        const rem2 = F.sub(F.one(), sumOf(entries));
        const six = F.make(1, 6);
        entries.push({ members: gMembers, frac: F.val(rem2) > 1 / 6 ? rem2 : six, reason: 'السدس فرضاً + الباقي تعصيباً (م٢١)', kind: 'فرض وتعصيب', law: 'م٢١' });
        asabaTaker = true;
      }
    }
  } else if (fatherP && !descAsaba.length) {
    const remF = F.sub(F.one(), sumOf(entries));
    if (hasMaleDesc) { /* already 1/6 */ }
    else if (F.val(remF) > 0) {
      const ex = entries.find(e => e.members[0].id === 'father');
      if (ex) { ex.frac = F.add(ex.frac, remF); ex.kind = 'فرض وتعصيب'; ex.reason = 'السدس فرضاً + الباقي تعصيباً (م٢١)'; }
      else entries.push({ members: one('father'), frac: remF, reason: 'الباقي تعصيباً', kind: 'تعصيب', law: 'م١٧' });
      asabaTaker = true;
    }
  } else if (!descAsaba.length) {
    // sibling and collateral asaba chain (art 17,18,19,20)
    const remC = F.sub(F.one(), sumOf(entries));
    if (F.val(remC) > 0) {
      const cands = [];
      if (N('fullBrothers')) cands.push({ ids: ['fullBrothers', 'fullSisters'], dir: 3, deg: 2, str: 2, pair: true });
      else if (N('fullSisters') && fsAsaba) cands.push({ ids: ['fullSisters'], dir: 3, deg: 2, str: 2, pair: false, mg: true });
      if (N('paternalBrothers')) cands.push({ ids: ['paternalBrothers', 'paternalSisters'], dir: 3, deg: 2, str: 1, pair: true });
      else if (N('paternalSisters') && psAsaba) cands.push({ ids: ['paternalSisters'], dir: 3, deg: 2, str: 1, pair: false, mg: true });
      CHAIN.forEach(([id, dir, deg, str]) => { if (!SIBS.includes(id) && N(id)) cands.push({ ids: [id], dir, deg, str, pair: false }); });
      if (cands.length) {
        cands.sort((a, b) => a.dir - b.dir || a.deg - b.deg || b.str - a.str);
        const w = cands[0];
        const tied = cands.filter(x => x.dir === w.dir && x.deg === w.deg && x.str === w.str);
        cands.filter(x => !tied.includes(x)).forEach(x => x.ids.forEach(id => B(id, nm(w.ids[0]), 'م١٨')));
        const mem = [];
        tied.forEach(t => { if (t.pair) { mem.push({ id: t.ids[0], count: N(t.ids[0]), weight: 2 }); if (N(t.ids[1])) mem.push({ id: t.ids[1], count: N(t.ids[1]), weight: 1 }); } else t.ids.forEach(id => mem.push({ id, count: N(id), weight: 1 })); });
        addAsaba(mem, remC, w.mg ? 'الباقي عصبة مع الغير (م٢٠)' : (w.pair ? 'الباقي تعصيباً للذكر مثل حظ الأنثيين' : 'الباقي تعصيباً'), w.mg ? 'عصبة مع الغير' : 'تعصيب');
        asabaNote = 'العاصب: ' + nm(w.ids[0]);
      }
    }
  }

  // ---------- awl / radd / dhawu al-arham ----------
  sum = sumOf(entries); rem = F.sub(F.one(), sum);
  const baseSum = sum;
  entries.forEach(e => { e.fardPart = (e.kind === 'فرض' || e.kind === 'مشتركة') ? e.frac : (e.kind === 'فرض وتعصيب' ? F.make(1, 6) : null); e.fard0 = e.frac; });
  function baytAdd(fr) { entries.push({ members: [{ id: 'baytMal', count: 1, weight: 1 }], frac: fr, reason: 'يؤول الباقي إلى بيت المال لأن هذا المذهب لا يقول بالرد ولا يورّث ذوي الأرحام', kind: 'بيت المال', law: '' }); notes.push('الباقي لبيت المال'); flags.push({ id: 'bayt', text: 'عند المالكية والشافعية في المذهب القديم يؤول الباقي إلى بيت المال. وقد أفتى متأخرو المالكية والشافعية بالرد على ذوي الفروض وتوريث ذوي الأرحام إذا لم يكن بيت المال منتظمًا، وهو الغالب اليوم.' }); }
  if (!CFG.arham) ARHAM_IDS.forEach(id => B(id, 'لا يرث ذوو الأرحام في هذا المذهب', ''));
  const isSp = e => e.members.some(m => m.id === 'husband' || m.id === 'wife');
  let arhamRows = null;
  if (F.cmp(sum, F.one()) > 0) {
    awl = true;
    entries.forEach(e => { e.frac = F.div(e.frac, sum); });
    notes.push('عالت المسألة (م١٥)');
  } else if (F.val(rem) > 0 && !asabaTaker) {
    const nonSp = entries.filter(e => !isSp(e));
    if (nonSp.length) {
      if (CFG.radd) {
        radd = true;
        const spSum = entries.filter(isSp).reduce((s, e) => F.add(s, e.frac), F.zero());
        const nonSum = sumOf(nonSp);
        const target = F.sub(F.one(), spSum);
        nonSp.forEach(e => { e.frac = F.mul(e.frac, F.div(target, nonSum)); });
        notes.push('رُدّ الباقي على أصحاب الفروض غير الزوجين (م٣٠)');
      } else {
        baytAdd(rem);
      }
    } else {
      let arh = null;
      if (CFG.arham === 'classes') arh = distributeArham(c, F.sub(F.one(), sumOf(entries)), flags);
      else if (CFG.arham === 'tanzil') arh = tanzilArham(c, F.sub(F.one(), sumOf(entries)), flags, opts, madh);
      if (arh) { arh.forEach(r => entries.push(r)); notes.push('الباقي لذوي الأرحام (م٣١-٣٨)'); }
      else if (entries.length) {
        if (CFG.radd) {
          radd = true;
          const tot = sumOf(entries);
          entries.forEach(e => { e.frac = F.div(e.frac, tot); });
          notes.push('لا وارث غير الزوج/الزوجة: يُرد عليه الباقي (م٣٠)');
        } else baytAdd(rem);
      }
    }
  }
  if (!entries.length) {
    let arh = null;
    if (CFG.arham === 'classes') arh = distributeArham(c, F.one(), flags);
    else if (CFG.arham === 'tanzil') arh = tanzilArham(c, F.one(), flags, opts, madh);
    if (arh) { arh.forEach(r => entries.push(r)); notes.push('التركة لذوي الأرحام (م٣١-٣٨)'); }
    else if (!CFG.arham && Object.keys(raw).some(k => raw[k] > 0)) baytAdd(F.one());
  }

  // ---------- rows ----------
  const rows = [];
  entries.forEach(e => {
    const heads = e.members.reduce((s, m) => s + m.count * m.weight, 0);
    e.members.forEach(m => rows.push({ id: m.id, count: m.count, weight: m.weight, frac: F.mul(e.frac, F.make(m.count * m.weight, heads)), reason: e.reason, kind: e.kind, law: e.law }));
  });
  // Akdariyya re-division is Zayd ibn Thabit's method. Egyptian art 22 (case 2) follows the Umar/Ibn Mas'ud approach, so it is OFF by default.
  (function () {
    const ids = rows.map(r => r.id).sort().join(',');
    const sis = rows.find(r => r.id === 'fullSisters' || r.id === 'paternalSisters');
    const gf = rows.find(r => r.id === 'grandfatherFather');
    if (!opts || (opts.akdariyya !== 'zayd' && !CFG.akd)) return; // default = literal text of art 22 (Umar / Ibn Mas'ud approach); 'zayd' = traditional re-division
    if (!sis || !gf || rows.length !== 4 || !rows.some(r => r.id === 'husband') || !rows.some(r => r.id === 'mother')) return;
    if (sis.count !== 1 || gf.count !== 1 || !F.eq(sis.frac, F.make(1, 3)) || !F.eq(gf.frac, F.make(1, 9))) return;
    gf.frac = F.make(8, 27); sis.frac = F.make(4, 27);
    gf.reason = 'الأكدرية: يجمع نصيب الجد والأخت (٤/٩) ويقتسمانه للذكر مثل حظ الأنثيين';
    sis.reason = gf.reason; gf.kind = sis.kind = 'تعصيب بعد العول';
    flags.push({ id: 'akdariyya', text: 'مسألة الأكدرية: قول زيد بن ثابت (من ٢٧: الزوج ٩، الأم ٦، الجد ٨، الأخت ٤). فيها خلاف بين العلماء، والقانون المصري لا ينص عليها فيُرجع فيها للراجح من مذهب أبي حنيفة.' });
  })();
  rows.forEach(r => { r.evidence = evidenceFor(r); if (r.id==='fullBrothers'&&awl&&!r.evidence) r.evidence=EV._asaba; });
  // integer shares: asl = lcm of per-person denominators
  let asl = 1;
  rows.forEach(r => { const per = F.div(r.frac, F.make(r.count)); asl = lcm(asl, per.d); });
  rows.forEach(r => { r.units = Math.round(F.val(r.frac) * asl); r.perHead = r.count ? r.units / r.count : 0; });
  const baseAsl = entries.reduce((a, e) => lcm(a, e.frac.d), 1);
  // ---- the memo's 7 steps ----
  const origEntries = rows; // eslint-disable-line
  const steps = buildSteps({ rows, awl, radd, baseSum, asl, omariyyatan, hasAsaba: asabaTaker });
  if (!rows.length && Object.keys(inp).some(k => +inp[k] > 0)) flags.push({ id: 'manual', text: 'الحالة خارج ما تغطيه الحاسبة (ذوو أرحام من درجات بعيدة أو بيت المال). تحتاج دراسة يدوية من المحامي (م٣١ إلى ٣٨).' });
  const _res0 = { rows, flags, awl, radd, omariyyatan };
  const evidenceSummary = problemEvidence(_res0);
  const entriesInfo = entries.map(e => ({ ids: e.members.map(m => m.id), members: e.members.map(m => ({ id: m.id, count: m.count, weight: m.weight })), kind: e.kind, reason: e.reason, frac: F.txt(e.frac), fracN: e.frac.n, fracD: e.frac.d, fardPart: e.fardPart ? F.txt(e.fardPart) : null, fardN: e.fardPart ? e.fardPart.n : 0, fardD: e.fardPart ? e.fardPart.d : 1, heads: e.members.reduce((a, m) => a + m.count * m.weight, 0), isSp: isSp(e) }));
  return { entriesInfo, evidenceSummary, rows, asl, baseAsl, blocked, notes, flags, awl, radd, omariyyatan, asabaNote, steps, total: rows.reduce((s, r) => F.add(s, r.frac), F.zero()) };
}

function buildSteps(o) {
  const rows = o.rows;
  const type = o.awl ? 'عائلة' : (o.radd ? 'ردّية' : 'عادلة');
  // group by entry reason is not retained; show per-row broken shares
  const groups = rows.filter(r => r.count > 1).map(r => {
    const s = r.units, n = r.count * (r.weight || 1) / (r.weight || 1);
    const broken = s % n !== 0;
    return { id: r.id, heads: n, units: s, broken, relation: broken ? (gcd(s, n) > 1 ? 'توافق' : 'تباين') : null, head: broken ? n / gcd(s, n) : 1 };
  });
  return { 1: 'تحديد الفروض', 2: 'أصل المسألة = ' + o.asl, 3: 'سهام كل وارث', 4: 'نوع المسألة: ' + type, 5: groups.some(g => g.broken) ? 'يوجد انكسار' : 'لا يوجد انكسار', 6: groups.filter(g => g.broken), 7: 'التصحيح النهائي: الأصل ' + o.asl, type, groups };
}

function tanzilArham(c, remaining, flags, opts, madh) {
  const sub = {}, groups = {};
  ARHAM_IDS.forEach(id => { if ((c[id] || 0) > 0) { const t = ARHAM_MAP[id]; sub[t] = 1; (groups[t] = groups[t] || []).push({ id, count: c[id], weight: 1 }); } });
  if (!Object.keys(sub).length) return null;
  const r2 = solveCore(sub, { madhab: opts.madhab }, madh);
  const out = [];
  r2.rows.forEach(r => {
    const g = groups[r.id]; if (!g || !(F.val(r.frac) > 0)) return;
    out.push({ members: g, frac: F.mul(remaining, r.frac), reason: 'ذوو الأرحام بالتنزيل: يُنزَّلون منزلة ' + nm(r.id) + ' الذي أدلوا به، ويقتسمون نصيبه بالتساوي بلا تفضيل للذكر على الأنثى', kind: 'رحم', law: 'م٢٣٥' });
  });
  flags.push({ id: 'arham', text: 'توريث ذوي الأرحام بالتنزيل: افترضنا أن كل مجموعة من ذوي الأرحام أدلت بوارث واحد (فأولاد البنات مثلًا من بنت واحدة). إن كانوا من أكثر من وارث فالحساب يحتاج مراجعة المحامي.' });
  return out.length ? out : null;
}
const stripLaw = t => String(t == null ? '' : t).replace(/\s*—\s*م[٠-٩]+(?:\([أ-ي]\))?(?:\s*(?:و|إلى)\s*[٠-٩]+(?:\([أ-ي]\))?)*/g, '').replace(/\s*\((?:م|ق)[^)]*\)/g, '').replace(/\s*م[٠-٩]+[ \/إلى و٠-٩\-]*/g, ' ').replace(/\s+/g, ' ').trim();
function localize(r, madh) {
  const sa = madh === 'saudi';
  r.rows.forEach(w => {
    w.reason = stripLaw(w.reason);
    w.law = sa ? (/تعصيب|عصبة/.test(w.kind || '') ? 'م٢٢٣ إلى ٢٢٩' : /رحم/.test(w.kind || '') ? 'م٢٣٢ إلى ٢٣٦' : (SA_LAW[w.id] || (/Grandmother/.test(w.id) ? 'م٢١٤' : ''))) : '';
    if (w.evidence) w.evidence = stripLaw(w.evidence);
  });
  r.blocked.forEach(b => { b.law = sa ? '' : ''; b.by = stripLaw(b.by); });
  r.notes = r.notes.map(stripLaw).map(n => sa && /عالت/.test(n) ? n + ' (م٢٣٠)' : sa && /رُدّ|يُرد/.test(n) ? n + ' (م٢٣١)' : n);
  r.flags = r.flags.filter(f => ['gf-siblings', 'akdariyya', 'mushtaraka'].indexOf(f.id) < 0).map(f => ({ id: f.id, text: stripLaw(f.text) }));
  if (r.awl) r.flags.push({ id: 'awl_m', text: 'عالت المسألة: يُقسَّم المال على السهام بنسبة الفروض فينقص نصيب كل صاحب فرض بقدر.' });
  if (r.steps) { r.steps = JSON.parse(JSON.stringify(r.steps)); }
  const keep = (ev) => ev.map(g => ({ problem: g.problem, evidence: g.evidence.map(e => ({ type: e.type, text: stripLaw(e.text) })).filter(e => e.type !== 'مادة' && !/م[٠-٩]/.test(e.text) && !/القانون المصري/.test(e.text)) })).filter(g => g.evidence.length);
  r.evidenceSummary = keep(r.evidenceSummary || []);
  if (sa) {
    const refs = []; if (r.awl) refs.push('م٢٣٠'); if (r.radd) refs.push('م٢٣١'); if (r.omariyyatan) refs.push('م٢١٣(٢)');
    r.evidenceSummary = r.evidenceSummary.map(g => g.problem === 'awl' ? { problem: g.problem, evidence: g.evidence.concat([{ type: 'مادة', text: 'م٢٣٠ من نظام الأحوال الشخصية السعودي (العول)' }]) } : g.problem === 'radd' ? { problem: g.problem, evidence: g.evidence.concat([{ type: 'مادة', text: 'م٢٣١ من نظام الأحوال الشخصية السعودي (الرد)' }]) } : g.problem === 'arham' ? { problem: g.problem, evidence: g.evidence.concat([{ type: 'مادة', text: 'م٢٣٢ إلى ٢٣٦ من نظام الأحوال الشخصية السعودي (ذوو الأرحام والتنزيل)' }]) } : g);
  }
  r.madhab = madh; r.madhabName = MNAMES[madh];
  return r;
}
// ---- dhawu al-arham (art 31-38). Supported: class 1 (daughters' children, first generation), class 2 (maternal grandfather),
// ---- class 3 (children of sisters / daughters of brothers, first generation), class 4 first group (aunts, uncles of mother side).
function distributeArham(c, remaining, flags) {
  const N = id => c[id] || 0;
  const any = ARHAM_IDS.some(id => N(id) > 0);
  if (!any) return null;
  const out = [];
  const split = (ids, weights, total, reason) => {
    const mem = ids.filter(id => N(id) > 0).map((id, i) => ({ id, count: N(id), weight: weights[ids.indexOf(id)] }));
    if (!mem.length) return false;
    out.push({ members: mem, frac: total, reason, kind: 'رحم', law: 'م٣١-٣٨' }); return true;
  };
  flags.push({ id: 'arham', text: 'ذوو الأرحام: مدعوم الطبقة الأولى من أولاد البنات، وجد الأم، وأولاد الأخوات وبنات الإخوة (الدرجة الأولى)، والعمات والأخوال والخالات والأعمام لأم. بقية الطبقات تحتاج مراجعة يدوية.' });
  if (split(['dSons', 'dDaughters'], [2, 1], remaining, 'الصنف الأول: أولاد البنات، للذكر مثل حظ الأنثيين (م٣٢، ٣٨)')) return out;
  if (N('grandfatherMother') > 0) { out.push({ members: [{ id: 'grandfatherMother', count: N('grandfatherMother'), weight: 1 }], frac: remaining, reason: 'الصنف الثاني: الجد غير الصحيح (م٣٣)', kind: 'رحم', law: 'م٣٣' }); return out; }
  // class 3: strength full > paternal > maternal
  const lv = [['sisterSonsFull', 'sisterDaughtersFull', 'brotherDaughtersFull'], ['sisterSonsPaternal', 'sisterDaughtersPaternal', 'brotherDaughtersPaternal'], ['maternalSibSons', 'maternalSibDaughters']];
  for (const grp of lv) if (grp.some(id => N(id) > 0)) {
    const w = grp.map(id => id.endsWith('Sons') ? 2 : 1);
    split(grp, w, remaining, 'الصنف الثالث: الأقوى قرابة أولاً (م٣٤)'); return out;
  }
  // class 4 group 1: father side (aunt, maternal-side uncle of father line) 2/3 ; mother side (khal, khala) 1/3
  const pa = ['uncleMaternal', 'aunt'], ma = ['maternalUncle', 'maternalAunt'];
  const hp = pa.some(id => N(id) > 0), hm = ma.some(id => N(id) > 0);
  if (hp || hm) {
    const tP = hp && hm ? F.mul(remaining, F.make(2, 3)) : remaining;
    const tM = hp && hm ? F.mul(remaining, F.make(1, 3)) : remaining;
    if (hp) split(pa, [2, 1], tP, 'الصنف الرابع: قرابة الأب (م٣٥)');
    if (hm) split(ma, [2, 1], tM, 'الصنف الرابع: قرابة الأم (م٣٥)');
    return out;
  }
  return null;
}

/* calculate(input, estate, opts): full pipeline per art 4 of law 77/1943 and arts 76-78 of law 71/1946.
   estate: {gross, funeral, debts, willAmount, willConsent, gifts: {key: amount}}
   opts.barred: [ids]; opts.predeceased: [{kind:'son'|'daughter', sons:n, daughters:n, gift:amount}]  (first layer grandchildren of a child who died first)
   Grandchildren named in predeceased MUST NOT also be ticked in the input. */
function calculate(inp, estate, opts) {
  opts = opts || {}; estate = estate || {};
  const gross = +estate.gross || 0, funeral = +estate.funeral || 0, debts = +estate.debts || 0;
  const net = Math.max(0, gross - funeral - debts);
  const out = { gross, funeral, debts, net, wajiba: [], wajibaTotal: 0, will: 0, willCapped: false, flags: [], notes: [] };
  // ---- obligatory bequest (law 71/1946 art 76) ----
  let wTotal = 0;
  (opts.predeceased || []).forEach((p, idx) => {
    const base = Object.assign({}, inp);
    const gk = p.kind === 'son' ? ['sonSons', 'sonDaughters'] : ['dSons', 'dDaughters'];
    // 1) are the grandchildren heirs in the real distribution?
    const withKids = Object.assign({}, base); withKids[gk[0]] = p.sons || 0; withKids[gk[1]] = p.daughters || 0;
    const real = solve(withKids, opts);
    const inherits = real.rows.some(r => (r.id === gk[0] || r.id === gk[1]) && r.units > 0);
    if (inherits) { out.wajiba.push({ idx, kind: p.kind, inherits: true, amount: 0, note: 'أحفاد وارثون فلا وصية واجبة (م٧٦: بشرط أن يكونوا غير وارثين)' }); return; }
    // 2) virtual share of the deceased child, as if he died after the decedent
    const virt = Object.assign({}, base);
    virt[p.kind === 'son' ? 'sons' : 'daughters'] = (virt[p.kind === 'son' ? 'sons' : 'daughters'] || 0) + 1;
    const vres = solve(virt, opts);
    const id = p.kind === 'son' ? 'sons' : 'daughters';
    const row = vres.rows.find(r => r.id === id);
    const share = row ? F.mul(row.frac, F.make(1, row.count)) : F.zero();
    let amt = F.val(share) * net;
    const gift = +p.gift || 0;
    // gift is deducted AFTER the one-third cap (art 76: the bequest completes what the gift lacks)
    out.wajiba.push({ idx, kind: p.kind, inherits: false, virtualShare: share, amount: amt, raw: amt, sons: p.sons || 0, daughters: p.daughters || 0, gift });
    wTotal += amt;
  });
  const capIt = () => {};
  if (wTotal > net / 3 && net > 0) {
    const k = (net / 3) / wTotal;
    out.wajiba.forEach(w => { if (!w.inherits) { w.amount *= k; w.capped = true; } });
    wTotal = net / 3;
    out.notes.push('الوصية الواجبة تجاوزت الثلث فخُفضت إلى الثلث (م٧٦)');
  }
  let afterGift = 0;
  out.wajiba.forEach(w => { if (!w.inherits) { w.amount = Math.max(0, w.amount - (w.gift || 0)); afterGift += w.amount; } });
  wTotal = afterGift;
  out.wajibaTotal = wTotal;
  out.wajiba.forEach(w => { if (!w.inherits && w.amount > 0) { const s = w.sons * 2 + w.daughters; w.sonEach = s ? w.amount * 2 / s : 0; w.daughterEach = s ? w.amount / s : 0; } });
  // ---- voluntary will (art 4 of law 77/1943; one third) ----
  let will = +estate.willAmount || 0;
  const cap = Math.max(0, net / 3 - wTotal);
  if (will > cap && !estate.willConsent) { will = cap; out.willCapped = true; }
  will = Math.min(will, Math.max(0, net - wTotal));
  out.will = will;
  out.distributable = Math.max(0, net - wTotal - will);
  out.result = solve(inp, opts);
  out.flags = out.result.flags;
  return out;
}

const api = { solve, calculate, solvePregnancy, problemEvidence, PE, F, nm, NAMES, ALL, ARHAM_IDS };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.InheritanceEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
