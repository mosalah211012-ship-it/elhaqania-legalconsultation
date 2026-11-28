/* Calculator page glue: keeps the original page look, uses the verified engine for the maths. */
(function () {
  var E = window.InheritanceEngine, F = E.F, X = window.HQCalcT || { T: {}, EN: {}, FR: {} };
  var ARHAM_NEW = E.ARHAM_IDS.filter(function (id) { return id !== 'grandfatherMother'; });
  var BASE = ['husband', 'wife', 'father', 'mother', 'grandfatherFather', 'grandfatherFatherFather', 'grandmotherFather', 'grandmotherMother', 'grandmotherMotherMother', 'grandmotherFatherFather', 'grandmotherMotherFather', 'grandfatherMother', 'sons', 'daughters', 'sonSons', 'sonDaughters', 'sonSonSons', 'sonSonDaughters', 'sonSonSonSons', 'sonSonSonDaughters', 'fullBrothers', 'fullSisters', 'paternalBrothers', 'paternalSisters', 'maternalBrothers', 'maternalSisters', 'sonFullBrothers', 'sonPaternalBrothers', 'sonSonFullBrothers', 'sonSonPaternalBrothers', 'fullUncles', 'paternalUncles', 'sonFullUncles', 'sonPaternalUncles', 'sonSonFullUncles', 'sonSonPaternalUncles', 'grandfatherFullBrothers', 'grandfatherPaternalBrothers', 'sonGrandfatherFullBrothers', 'sonGrandfatherPaternalBrothers'];
  var IDS = BASE.concat(ARHAM_NEW);
  function lang() { try { return localStorage.getItem('siteLang') || 'ar'; } catch (e) { return 'ar'; } }
  var U = {
    ar: { blockedBy: '🚫 محجوب بسبب', gender: '🚫 لا ينطبق على جنس المتوفى', maxw: 'الحد الأقصى أربع زوجات', number: 'العدد:', numberF: 'العدد:', barLbl: 'ممنوع من الإرث', refT: 'رقم مسألتك', refNote: 'احتفظ بهذا الرقم، فهو محفوظ لدينا ويمكنك متابعة مسألتك به مع المكتب.', refSave: 'جاري حفظ الرقم...', refFail: 'تعذّر حفظ الرقم الآن. اضغط احسب مرة أخرى.', copy: 'نسخ الرقم', copied: 'تم النسخ ✓', stepsT: 'شرح الحل خطوة بخطوة', addPred: '+ إضافة ابن أو بنت متوفى قبل المورث', predHint: 'ابن أو بنت توفي قبل المتوفى وله أولاد (تُحسب الوصية الواجبة للأحفاد).', predKind: 'المتوفى سابقًا', son: 'ابن', daughter: 'بنت', gs: 'عدد الأحفاد الذكور', gd: 'عدد الحفيدات', gift: 'ما أعطاه المتوفى للأحفاد في حياته (جنيه)', rm: 'حذف', heirsHdr: 'الورثة وأنصبتهم', reasonProof: 'السبب والدليل', errEmpty: '❌ يرجى تحديد وريث واحد على الأقل', errGross: '', unit: 'سهم', of: 'من', mad: '(قريبًا)', waRef: 'رقم مسألتي: ', each: 'نصيب الفرد', blkT: 'الورثة المحجوبون', noBlk: '' },
    en: { blockedBy: '🚫 Blocked by', gender: '🚫 Not applicable to the deceased\'s gender', maxw: 'Maximum four wives', number: 'Number:', numberF: 'Number:', barLbl: 'Barred from inheriting', refT: 'Your problem number', refNote: 'Keep this number. It is saved with us and you can follow up on your problem with the office using it.', refSave: 'Saving your number...', refFail: 'Could not save the number now. Press Calculate again.', copy: 'Copy number', copied: 'Copied ✓', stepsT: 'Step-by-step solution', addPred: '+ Add a son or daughter who died before the deceased', predHint: 'A son or daughter who died before the deceased leaving children (obligatory bequest for the grandchildren).', predKind: 'Predeceased', son: 'Son', daughter: 'Daughter', gs: 'Number of grandsons', gd: 'Number of granddaughters', gift: 'Gift the deceased gave them in life (EGP)', rm: 'Remove', heirsHdr: 'Heirs and shares', reasonProof: 'Reason and evidence', errEmpty: '❌ Please select at least one heir', unit: 'units', of: 'of', mad: '(soon)', waRef: 'My problem number: ', each: 'Per person', blkT: 'Blocked heirs' },
    fr: { blockedBy: '🚫 Exclu par', gender: '🚫 Non applicable au sexe du défunt', maxw: 'Maximum quatre épouses', number: 'Nombre :', numberF: 'Nombre :', barLbl: 'Exclu de l\'héritage', refT: 'Numéro de votre dossier', refNote: 'Conservez ce numéro. Il est enregistré chez nous et vous permet de suivre votre dossier avec le cabinet.', refSave: 'Enregistrement du numéro...', refFail: 'Impossible d\'enregistrer le numéro. Recalculez.', copy: 'Copier le numéro', copied: 'Copié ✓', stepsT: 'Solution pas à pas', addPred: '+ Ajouter un fils ou une fille décédé avant le défunt', predHint: 'Un fils ou une fille décédé avant le défunt en laissant des enfants (legs obligatoire pour les petits-enfants).', predKind: 'Prédécédé', son: 'Fils', daughter: 'Fille', gs: 'Nombre de petits-fils', gd: 'Nombre de petites-filles', gift: 'Don du défunt de son vivant (EGP)', rm: 'Supprimer', heirsHdr: 'Héritiers et parts', reasonProof: 'Motif et preuve', errEmpty: '❌ Veuillez sélectionner au moins un héritier', unit: 'parts', of: 'sur', mad: '(bientôt)', waRef: 'Mon numéro de dossier : ', each: 'Par personne', blkT: 'Héritiers exclus' }
  };
  function t(k) { var L = lang(); return (U[L] && U[L][k] != null ? U[L][k] : U.ar[k]); }
  function xt(k) { var L = lang(); var d = X.T[L] || X.T.ar || {}; return d[k] != null ? d[k] : ((X.T.ar || {})[k] || k); }
  function nm(id) { var L = lang(); return L === 'en' ? (X.EN[id] || E.nm(id)) : L === 'fr' ? (X.FR[id] || E.nm(id)) : E.nm(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function fmt(n) { var L = lang(); return (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function cur() { return lang() === 'ar' ? 'جنيه' : 'EGP'; }
  var ARABIC_BY = null;
  function byName(by) { // translate the Arabic blocker name when we can
    if (lang() === 'ar') return by;
    if (!ARABIC_BY) { ARABIC_BY = {}; E.ALL.forEach(function (id) { ARABIC_BY[E.nm(id)] = id; }); }
    var parts = String(by).split(/[،,]\s*/); return parts.map(function (p) { return ARABIC_BY[p] ? nm(ARABIC_BY[p]) : p; }).join(', ');
  }

  // ---------- arham grid ----------
  (function buildArham() {
    var g = $('arhamGrid'); if (!g) return;
    g.innerHTML = ARHAM_NEW.map(function (id) {
      return '<div class="heir-option" id="opt-' + id + '"><label><input type="checkbox" id="' + id + '" onchange="toggleHeir(\'' + id + '\')"> <span data-ar="' + esc(E.nm(id)) + '" data-en="' + esc(X.EN[id] || E.nm(id)) + '" data-fr="' + esc(X.FR[id] || E.nm(id)) + '">' + esc(E.nm(id)) + '</span></label><div class="heir-count" id="count-' + id + '"><label data-ar="العدد:" data-en="Number:" data-fr="Nombre:">العدد:</label><input type="number" min="1" value="1"></div></div>';
    }).join('');
  })();

  // ---------- reading the form ----------
  function cnt(id) {
    var cb = $(id); if (!cb || !cb.checked) return 0;
    var cd = $('count-' + id); if (cd) { var i = cd.querySelector('input'); return Math.max(1, parseInt(i.value, 10) || 1); }
    return 1;
  }
  function gender() { return $('deceasedGender').value; }
  function sel() { var o = {}; IDS.forEach(function (id) { var n = cnt(id); if (n > 0) o[id] = n; }); if (o.wife > 4) o.wife = 4; return o; }
  function barredSel() { var r = []; document.querySelectorAll('#barredList input[data-bar]').forEach(function (i) { if (i.checked) r.push(i.getAttribute('data-bar')); }); return r; }
  function solveBl(inp, barred) { try { return E.solve(inp, { barred: barred.filter(function (b) { return inp[b] > 0; }) }).blocked || []; } catch (e) { return []; } }
  var BAR = {}; // remembered "barred" ticks

  // ---------- blocking (auto, from the verified engine) ----------
  function setBlocked(id, text) {
    var opt = $('opt-' + id), cb = $(id); if (!opt || !cb) return;
    cb.checked = false; cb.disabled = true; opt.classList.add('heir-blocked'); opt.classList.remove('has-heir');
    var cd = $('count-' + id); if (cd) cd.classList.remove('active');
    var msg = opt.querySelector('.blocked-msg');
    if (!msg) { msg = document.createElement('div'); msg.className = 'blocked-msg'; msg.style.cssText = 'font-size:0.75rem;color:#c0392b;margin-top:5px;font-weight:600;'; opt.appendChild(msg); }
    msg.textContent = text;
  }
  function clearBlocked(id) {
    var opt = $('opt-' + id), cb = $(id); if (!opt || !cb) return;
    cb.disabled = false; opt.classList.remove('heir-blocked');
    var msg = opt.querySelector('.blocked-msg'); if (msg) msg.remove();
  }
  window.updateBlockedHeirs = function () {
    var g = gender(), barred = barredSel();
    IDS.forEach(clearBlocked);
    var info = {};
    // 1) selected heirs that the current selection blocks get unticked
    for (var pass = 0; pass < 4; pass++) {
      var inp = sel(); if (g === 'male') delete inp.husband; else delete inp.wife;
      var bl = solveBl(inp, barred), changed = false;
      bl.forEach(function (b) { if (inp[b.id] > 0 && $(b.id) && $(b.id).checked) { info[b.id] = b.by; $(b.id).checked = false; changed = true; } });
      if (!changed) break;
    }
    // 2) unselected heirs that would be blocked by what is selected become unavailable
    var cur0 = sel(); if (g === 'male') delete cur0.husband; else delete cur0.wife;
    IDS.forEach(function (id) {
      var cb = $(id); if (!cb) return;
      if (id === 'husband' && g === 'male') { setBlocked(id, t('gender')); return; }
      if (id === 'wife' && g === 'female') { setBlocked(id, t('gender')); return; }
      if (cb.checked) return;
      if (info[id]) { setBlocked(id, t('blockedBy') + ': ' + byName(info[id])); return; }
      var test = Object.assign({}, cur0); test[id] = 1;
      var b = solveBl(test, barred).filter(function (x) { return x.id === id; })[0];
      if (b) setBlocked(id, t('blockedBy') + ': ' + byName(b.by));
    });
    IDS.forEach(function (id) { var opt = $('opt-' + id), cb = $(id), cd = $('count-' + id); if (!opt || !cb) return; if (cb.checked) { opt.classList.add('has-heir'); if (cd) cd.classList.add('active'); } else { opt.classList.remove('has-heir'); if (cd) cd.classList.remove('active'); } });
    renderBarred();
  };
  // count changes can change blocking too (for example two daughters)
  document.addEventListener('input', function (e) { if (e.target && e.target.closest && e.target.closest('.heir-count')) window.updateBlockedHeirs(); });
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'deceasedGender') window.updateBlockedHeirs();
    if (e.target && e.target.getAttribute && e.target.getAttribute('data-bar')) { BAR[e.target.getAttribute('data-bar')] = e.target.checked; window.updateBlockedHeirs(); }
    if (e.target && e.target.id === 'special-pregnancy') $('pregBox').style.display = e.target.checked ? 'block' : 'none';
    if (e.target && e.target.id === 'special-wasiyaWajiba') { $('predBox').style.display = e.target.checked ? 'block' : 'none'; if (e.target.checked && !PRED.length) HQUI.addPred(); }
  });
  function renderBarred() {
    var box = $('barredBox'), list = $('barredList'); if (!box) return;
    var inp = sel(); if (gender() === 'male') delete inp.husband; else delete inp.wife;
    var ids = Object.keys(inp);
    box.style.display = ids.length ? 'block' : 'none';
    list.innerHTML = ids.map(function (id) { return '<label style="display:inline-flex;align-items:center;gap:8px;margin:4px 14px 4px 0;cursor:pointer"><input type="checkbox" data-bar="' + id + '"' + (BAR[id] ? ' checked' : '') + ' style="width:18px;height:18px;accent-color:#b59461"> ' + esc(nm(id)) + ' <small style="color:#888">(' + esc(t('barLbl')) + ')</small></label>'; }).join('');
  }

  // ---------- predeceased children (obligatory bequest) ----------
  var PRED = [];
  window.HQUI = {
    addPred: function () { PRED.push({ kind: 'son', sons: 0, daughters: 0, gift: 0 }); renderPred(); },
    rmPred: function (i) { PRED.splice(i, 1); renderPred(); },
    setPred: function (i, k, v) { PRED[i][k] = k === 'kind' ? v : (+v || 0); }
  };
  function renderPred() {
    var l = $('predList'); if (!l) return;
    $('predHint').textContent = t('predHint'); $('predAdd').textContent = t('addPred');
    l.innerHTML = PRED.map(function (p, i) {
      return '<div class="input-row" style="background:#fff;border:1px solid #e3dccb;border-radius:10px;padding:12px;margin-bottom:10px">' +
        '<div class="input-group"><label>' + esc(t('predKind')) + '</label><select onchange="HQUI.setPred(' + i + ',\'kind\',this.value)"><option value="son"' + (p.kind === 'son' ? ' selected' : '') + '>' + esc(t('son')) + '</option><option value="daughter"' + (p.kind === 'daughter' ? ' selected' : '') + '>' + esc(t('daughter')) + '</option></select></div>' +
        '<div class="input-group"><label>' + esc(t('gs')) + '</label><input type="number" min="0" value="' + p.sons + '" oninput="HQUI.setPred(' + i + ',\'sons\',this.value)"></div>' +
        '<div class="input-group"><label>' + esc(t('gd')) + '</label><input type="number" min="0" value="' + p.daughters + '" oninput="HQUI.setPred(' + i + ',\'daughters\',this.value)"></div>' +
        '<div class="input-group"><label>' + esc(t('gift')) + '</label><input type="number" min="0" value="' + p.gift + '" oninput="HQUI.setPred(' + i + ',\'gift\',this.value)"></div>' +
        '<div><button type="button" class="calc-btn secondary" style="padding:6px 18px;font-size:.9rem" onclick="HQUI.rmPred(' + i + ')">' + esc(t('rm')) + '</button></div></div>';
    }).join('');
  }

  // ---------- state of last result ----------
  var LAST = null;
  window.calculateInheritance = function () {
    try {
      var g = gender(), inp = sel(); if (g === 'male') delete inp.husband; else delete inp.wife;
      if (!Object.keys(inp).length) { alert(t('errEmpty')); return; }
      var barred = barredSel().filter(function (b) { return inp[b] > 0; });
      var gross = parseFloat($('estateValue').value) || 0, funeral = parseFloat($('funeralValue').value) || 0, debts = parseFloat($('debtsValue').value) || 0;
      var net0 = Math.max(0, gross - funeral - debts), willAmt = 0;
      if ($('hasWill').value === 'yes') {
        var raw = ($('willValue').value || '').trim(), m = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(raw);
        willAmt = m ? net0 * (parseFloat(m[1]) / (parseFloat(m[2]) || 1)) : (parseFloat(raw) || 0);
      }
      var est = { gross: gross, funeral: funeral, debts: debts, willAmount: willAmt, willConsent: $('willConsent').value === 'yes' };
      var pred = ($('special-wasiyaWajiba').checked ? PRED : []).filter(function (p) { return (p.sons || 0) + (p.daughters || 0) > 0; }).map(function (p) { return { kind: p.kind, sons: +p.sons || 0, daughters: +p.daughters || 0, gift: +p.gift || 0 }; });
      var mad = ($('madhab') && $('madhab').value) || 'egypt'; if (mad !== 'egypt') pred = [];
      var R = { calc: E.calculate(inp, est, { barred: barred, predeceased: pred, madhab: mad }), inp: inp, est: est, barred: barred, madhab: mad };
      if ($('special-pregnancy').checked) R.preg = E.solvePregnancy(inp, { barred: barred, unbornKind: $('pregKind').value, madhab: mad });
      R.ref = ''; R.refState = 'saving'; LAST = R;
      render();
      $('calcResult').classList.add('active'); $('calcResult').scrollIntoView({ behavior: 'smooth' });
      fetch('/api/student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ref_save', inp: inp, estate: est, opts: { barred: barred, madhab: mad }, source: 'calc' }) })
        .then(function (r) { return r.json(); }).then(function (j) { if (LAST === R) { if (j && j.ref) { R.ref = j.ref; R.refState = 'ok'; } else R.refState = 'fail'; renderRef(); } })
        .catch(function () { if (LAST === R) { R.refState = 'fail'; renderRef(); } });
    } catch (e) { console.error(e); alert('Error: ' + e.message); }
  };

  function renderRef() {
    var R = LAST, box = $('resRef'); if (!R || !box) return;
    var inner;
    if (R.refState === 'ok') inner = '<div style="font-size:.95rem;color:#555">' + esc(t('refT')) + '</div><div style="font-size:1.7rem;font-weight:700;letter-spacing:1px;direction:ltr;color:#9c7e4d" id="refNo">' + esc(R.ref) + '</div><div style="font-size:.85rem;color:#666;margin:4px 0 8px">' + esc(t('refNote')) + '</div><button type="button" class="calc-btn secondary" style="padding:6px 20px;font-size:.9rem" onclick="HQUI.copyRef(this)">' + esc(t('copy')) + '</button>';
    else if (R.refState === 'fail') inner = '<div style="color:#c0392b">' + esc(t('refFail')) + '</div>';
    else inner = '<div style="color:#666">' + esc(t('refSave')) + '</div>';
    box.innerHTML = '<div style="background:#fff9e6;border:2px dashed #b59461;border-radius:12px;padding:14px 18px;margin-bottom:18px;text-align:center">' + inner + '</div>';
    var wa = $('resWa'); if (wa) { var base = 'https://wa.me/201554797398'; wa.href = R.refState === 'ok' ? base + '?text=' + encodeURIComponent(t('waRef') + R.ref) : base; }
    var pd = $('printRef'); if (pd) pd.textContent = R.ref || '';
  }
  HQUI.copyRef = function (b) { var r = LAST && LAST.ref; if (!r) return; try { navigator.clipboard.writeText(r); } catch (e) {} b.textContent = t('copied'); setTimeout(function () { b.textContent = t('copy'); }, 1500); };

  function money(fr, d) { return fmt(F.val(fr) * d); }
  function ftxt(fr) { return F.txt(fr); }
  function render() {
    var R = LAST; if (!R) return;
    renderRef();
    var c = R.calc, res = c.result, dist = c.distributable, gross = +c.gross;
    // money summary
    var mh = '';
    if (gross) {
      mh = '<div style="background:#fff;border:1px solid #e3dccb;border-radius:10px;padding:14px;margin-bottom:18px;line-height:2">' +
        '<div>' + esc(xt('gross')) + ': <b>' + fmt(gross) + '</b> ' + cur() + '</div>' +
        (c.funeral ? '<div>' + esc(xt('funeral')) + ': <b>' + fmt(c.funeral) + '</b> ' + cur() + '</div>' : '') +
        (c.debts ? '<div>' + esc(xt('debts')) + ': <b>' + fmt(c.debts) + '</b> ' + cur() + '</div>' : '') +
        '<div>' + esc(xt('net')) + ': <b>' + fmt(c.net) + '</b> ' + cur() + '</div>' +
        (c.wajibaTotal ? '<div>' + esc(xt('wajiba')) + ': <b>' + fmt(c.wajibaTotal) + '</b> ' + cur() + '</div>' : '') +
        (c.will ? '<div>' + esc(xt('willv')) + ': <b>' + fmt(c.will) + '</b> ' + cur() + '</div>' : '') +
        '<div>' + esc(xt('dist')) + ': <b>' + fmt(dist) + '</b> ' + cur() + '</div></div>';
    }
    (c.wajiba || []).forEach(function (w) { mh += '<div class="legal-notice" style="margin-bottom:12px">' + esc(xt('wajiba')) + ' (' + esc(xt(w.kind)) + '): ' + (w.inherits ? esc(w.note) : '<b>' + fmt(w.amount) + '</b> ' + cur()) + '</div>'; });
    (c.notes || []).forEach(function (n) { mh += '<div class="legal-notice" style="margin-bottom:12px">' + esc(n) + '</div>'; });
    if (res.madhabName) mh = '<div class="legal-notice" style="margin-bottom:12px"><strong>' + esc((function(l){return l==='ar'?'المذهب / النظام':l==='en'?'School / system':'École / système'})(lang())) + ':</strong> ' + esc(res.madhabName) + '</div>' + mh;
    $('resMoney').innerHTML = mh;
    // shares table (reason and evidence always visible, all evidence together)
    var th = '<h3 style="color:#b59461;margin:10px 0">' + esc(t('heirsHdr')) + '</h3>';
    if (R.preg) th += pregHtml(R.preg);
    else {
      th += '<div style="overflow-x:auto"><table class="result-table"><thead><tr><th>' + esc(xt('heir')) + '</th><th>' + esc(xt('cnt')) + '</th><th>' + esc(xt('share')) + '</th><th>' + esc(xt('units')) + '</th>' + (gross ? '<th>' + esc(xt('amount')) + '</th><th>' + esc(t('each')) + '</th>' : '') + '<th>' + esc(t('reasonProof')) + '</th></tr></thead><tbody>' +
        res.rows.map(function (r) {
          return '<tr><td>' + esc(nm(r.id)) + '</td><td>' + r.count + '</td><td dir="ltr" style="text-align:center">' + ftxt(r.frac) + '</td><td>' + r.units + ' ' + esc(t('of')) + ' ' + res.asl + '</td>' + (gross ? '<td>' + money(r.frac, dist) + '</td><td>' + money(F.div(r.frac, F.make(r.count)), dist) + '</td>' : '') +
            '<td style="font-size:.9rem;line-height:1.8"><b>' + esc(r.reason || '') + (r.law ? ' (' + esc(r.law) + ')' : '') + '</b>' + (r.evidence ? '<div style="margin-top:6px;color:#333">📖 ' + esc(r.evidence) + '</div>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    if (res.blocked.length) th += '<div class="legal-notice" style="margin-bottom:12px"><strong>' + esc(t('blkT')) + ':</strong> ' + res.blocked.map(function (b) { return esc(nm(b.id)) + ' (' + esc(byName(b.by)) + (b.law ? ' ' + esc(b.law) : '') + ')'; }).join(lang() === 'ar' ? '، ' : ', ') + '</div>';
    (res.notes || []).forEach(function (n) { th += '<div class="legal-notice" style="margin-bottom:12px">' + esc(n) + '</div>'; });
    if (res.flags && res.flags.length) th += '<div class="legal-notice" style="margin-bottom:12px"><strong>⚖ ' + esc(xt('flags')) + '</strong><ul style="padding-inline-start:20px">' + res.flags.map(function (f) { return '<li>' + esc(f.text) + '</li>'; }).join('') + '</ul></div>';
    $('resTable').innerHTML = th;
    // chart
    var cc = $('chartContainer');
    if (gross && res.rows.length && !R.preg && window.Chart) {
      cc.style.display = 'block'; if (window.inheritanceChartInstance) window.inheritanceChartInstance.destroy();
      var colors = ['#b59461', '#111111', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#95a5a6', '#d35400', '#2980b9', '#27ae60', '#8e44ad', '#16a085', '#c0392b'];
      window.inheritanceChartInstance = new Chart($('inheritanceChart').getContext('2d'), { type: 'doughnut', data: { labels: res.rows.map(function (r) { return nm(r.id); }), datasets: [{ data: res.rows.map(function (r) { return dist * F.val(r.frac); }), backgroundColor: colors.slice(0, res.rows.length), borderWidth: 2, borderColor: '#fff' }] }, options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Cairo', size: 13 }, padding: 15 } }, title: { display: true, text: lang() === 'ar' ? '📊 توزيع الأنصبة' : lang() === 'en' ? '📊 Distribution of Shares' : '📊 Répartition des parts', font: { family: 'Cairo', size: 16 } } } } });
    } else { cc.style.display = 'none'; }
    $('resSteps').innerHTML = stepsHtml(R);
    // consolidated evidence
    var pe = res.evidenceSummary || [], eh = '';
    if (pe.length) eh = '<div style="background:#fff;border:1px solid #e3dccb;border-radius:10px;padding:14px;margin:18px 0"><h3 style="color:#b59461;margin:0 0 8px">📖 ' + esc(xt('evid')) + '</h3>' + pe.map(function (p) { return p.evidence.map(function (e) { return '<div style="margin:6px 0;line-height:1.9"><b>' + esc(e.type) + ':</b> ' + esc(e.text) + '</div>'; }).join(''); }).join('') + '<div style="font-size:.8rem;color:#888;margin-top:6px">' + esc(xt('langnote')) + '</div></div>';
    $('resEvidence').innerHTML = eh;
  }

  function pregHtml(P) {
    var sc = P.scenarios, ids = {};
    [sc.male.rows, sc.female.rows, P.noneBorn.rows].forEach(function (rs) { rs.forEach(function (r) { ids[r.id] = 1; }); });
    function f(rows, id) { var r = rows.filter(function (x) { return x.id === id; }); if (!r.length) return '—'; var s = F.zero(); r.forEach(function (x) { s = F.add(s, x.frac); }); return ftxt(s); }
    var h = '<div class="legal-notice" style="margin-bottom:10px"><b>🤰 ' + esc(xt('pregT')) + '</b></div><div style="overflow-x:auto"><table class="result-table"><thead><tr><th>' + esc(xt('heir')) + '</th><th>' + esc(xt('ifmale')) + '</th><th>' + esc(xt('iffemale')) + '</th><th>' + esc(xt('ifnot')) + '</th><th>' + esc(xt('now')) + '</th></tr></thead><tbody>';
    Object.keys(ids).forEach(function (id) { h += '<tr><td>' + esc(nm(id)) + '</td><td dir="ltr">' + f(sc.male.rows, id) + '</td><td dir="ltr">' + f(sc.female.rows, id) + '</td><td dir="ltr">' + f(P.noneBorn.rows, id) + '</td><td dir="ltr">' + (P.immediate[id] ? ftxt(P.immediate[id]) : '—') + '</td></tr>'; });
    h += '<tr><td><b>' + esc(xt('unborn')) + '</b></td><td dir="ltr">' + ftxt(sc.male.unborn) + '</td><td dir="ltr">' + ftxt(sc.female.unborn) + '</td><td>—</td><td dir="ltr">' + esc(xt('reserve')) + ': ' + ftxt(P.reserve) + '</td></tr></tbody></table></div>';
    h += '<div class="legal-notice" style="margin-bottom:10px">' + esc(xt('khuntha')) + ': <b dir="ltr">' + ftxt(P.khuntha.unborn) + '</b></div>';
    (P.notes || []).forEach(function (n) { h += '<div class="legal-notice" style="margin-bottom:10px">' + esc(n) + '</div>'; });
    (P.evidence || []).forEach(function (p) { (p.evidence || []).forEach(function (e) { h += '<div style="margin:6px 0;line-height:1.9"><b>' + esc(e.type) + ':</b> ' + esc(e.text) + '</div>'; }); });
    return h;
  }

  // ---------- the solution, explained while solving ----------
  function stepsHtml(R) {
    var L = lang(), res = R.calc.result, rows = res.rows, st = res.steps, ar = L === 'ar', en = L === 'en';
    var S = [];
    function T3(a, e, f) { return ar ? a : en ? e : f; }
    var sep = ar ? '، ' : ', ';
    var present = Object.keys(R.inp).map(function (id) { return nm(id) + (R.inp[id] > 1 ? ' (' + R.inp[id] + ')' : ''); }).join(sep);
    var blockedTxt = res.blocked.length ? T3(' ثم استبعدنا المحجوبين: ', ' Then we removed the blocked heirs: ', ' Puis nous avons écarté les exclus : ') + res.blocked.map(function (b) { return nm(b.id) + ' (' + byName(b.by) + ')'; }).join(sep) + T3('. المحجوب لا يرث لأن وجود من هو أقرب منه أو أقوى يمنعه.', '. A blocked heir does not inherit because a closer or stronger heir stands in front of him.', '. Un héritier exclu ne reçoit rien car un héritier plus proche ou plus fort passe avant lui.') : '';
    S.push([T3('تحديد الورثة والمحجوبين', 'Who inherits and who is blocked', 'Qui hérite et qui est exclu'), T3('الورثة الموجودون: ', 'Heirs present: ', 'Héritiers présents : ') + present + '.' + blockedTxt]);
    S.push([T3('تحديد الفروض', 'Fixed shares', 'Parts fixées'), rows.map(function (r) { return '<b>' + esc(nm(r.id)) + '</b>: ' + ftxt(r.frac) + (r.kind ? ' (' + esc(r.kind) + ')' : '') + ' ' + T3('لأن', 'because', 'car') + ' ' + esc(r.reason || ''); }).join('<br>')]);
    var type = res.awl ? T3('عائلة (العول)', 'Awl (shares exceed the whole)', 'Awl (parts supérieures au tout)') : res.radd ? T3('ردّية (الرد)', 'Radd (remainder returned)', 'Radd (reliquat restitué)') : T3('عادلة', 'Balanced', 'Équilibrée');
    S.push([T3('أصل المسألة', 'Base of the problem', 'Base du problème'), T3('أصل المسألة هو أصغر عدد يقبل القسمة على مقامات الفروض كلها، فصار: ', 'The base is the smallest number divisible by all the fraction denominators. Here it is: ', 'La base est le plus petit nombre divisible par tous les dénominateurs. Ici : ') + '<b>' + res.asl + '</b>.']);
    S.push([T3('نوع المسألة', 'Type of problem', 'Type de problème'), type + '. ' + (res.awl ? T3('مجموع السهام زاد على الأصل فنُقصت حصة كل وارث بنسبة واحدة (العول).', 'The total of shares exceeded the base, so every heir’s share is reduced in the same proportion (awl).', 'Le total des parts dépasse la base, chaque part est réduite proportionnellement (awl).') : res.radd ? T3('مجموع السهام نقص عن الأصل ولا عاصب، فيُرد الباقي على أصحاب الفروض بنسبة فروضهم.', 'The shares are below the base and there is no residuary heir, so the remainder is returned to the share-holders in proportion (radd).', 'Les parts sont inférieures à la base et il n’y a pas d’asaba : le reste est restitué proportionnellement (radd).') : T3('مجموع السهام يساوي الأصل أو يأخذ الباقي العاصب.', 'The shares equal the base, or the residuary heir takes the rest.', 'Les parts égalent la base ou l’asaba prend le reste.'))]);
    S.push([T3('توزيع السهام', 'Distribution of units', 'Répartition des parts'), rows.map(function (r) { return esc(nm(r.id)) + ': ' + r.units + ' ' + t('unit') + ' ' + t('of') + ' ' + res.asl + (r.count > 1 ? ' (' + T3('لكل فرد', 'each', 'chacun') + ' ' + (r.units / r.count) + ')' : ''); }).join('<br>')]);
    var br = (st[6] && st[6].length) ? st[6] : [];
    S.push([T3('الانكسار والتصحيح', 'Fractions that do not divide', 'Parts non divisibles'), (st[5] && /يوجد انكسار/.test(st[5]) && !/لا يوجد/.test(st[5])) ? T3('بعض الأنصبة لا تنقسم على عدد أصحابها بلا كسر، فصُحّحت المسألة. ', 'Some shares do not divide evenly among their holders, so the problem was corrected. ', 'Certaines parts ne se divisent pas exactement, le problème a été corrigé. ') + br.map(function (g) { return esc(nm(g.id)) + ': ' + g.heads + '/' + g.units; }).join(sep) : T3('لا يوجد انكسار، فلا حاجة لتصحيح المسألة.', 'No fraction problem, so no correction is needed.', 'Pas de problème de divisibilité, aucune correction nécessaire.')]);
    S.push([T3('النصيب النهائي', 'Final shares', 'Parts finales'), rows.map(function (r) { return '<b>' + esc(nm(r.id)) + '</b>: ' + ftxt(r.frac) + (R.calc.gross ? ' = ' + money(r.frac, R.calc.distributable) + ' ' + cur() : ''); }).join('<br>') + '<br>' + esc(st[7] || '')]);
    return '<div style="background:#fff;border:1px solid #e3dccb;border-radius:10px;padding:16px;margin:18px 0"><h3 style="color:#b59461;margin:0 0 10px">' + esc(t('stepsT')) + '</h3><ol style="padding-inline-start:22px;line-height:2">' + S.map(function (x) { return '<li style="margin-bottom:10px"><b>' + x[0] + ':</b> ' + x[1] + '</li>'; }).join('') + '</ol></div>';
  }

  window.printPDF = function () {
    var d = $('printDate'); if (d) d.textContent = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB');
    $('calcResult').classList.add('active');
    window.print();
  };
  // wrap setLang so dynamic parts follow the language
  var _sl = window.setLang;
  window.setLang = function (l) { _sl.apply(this, arguments); try { window.updateBlockedHeirs(); renderPred(); if (LAST) render(); fixMadhab(); } catch (e) {} };
  function fixPreg() { var k = ['child', 'sonChild', 'fullSibling', 'paternalSibling']; document.querySelectorAll('#pregKind option').forEach(function (o, i) { o.textContent = xt('pk_' + k[i]); }); }
  function fixMadhab() { fixPreg(); document.querySelectorAll('#madhab option[disabled]').forEach(function (o) { var base = o.getAttribute('data-' + lang()) || o.textContent; o.textContent = base.replace(/\s*\((قريبًا|soon|bientôt)\)$/, '') + ' ' + t('mad'); }); }
  window.addEventListener('DOMContentLoaded', function () { window.updateBlockedHeirs(); renderPred(); fixMadhab(); try { if (window.HQVerse) HQVerse(null, { auto: true }); } catch (e) {} });
  // pregnancy select labels follow language
})();
