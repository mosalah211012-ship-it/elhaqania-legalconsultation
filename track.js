/* Reference-number tracker: a client or student enters the problem number and sees its status and shares. */
(function () {
  var host = document.getElementById('refTrack'); if (!host) return;
  var TX = {
    ar: { h: 'تابع مسألتك بالرقم المرجعي', p: 'اكتب الرقم الذي ظهر لك بعد حساب المسألة (مثل MR-2611-ABC234) لتعرف حالتها ونتيجتها.', ph: 'الرقم المرجعي', go: 'متابعة', busy: 'جارٍ البحث...', nf: 'لا توجد مسألة بهذا الرقم. راجع الرقم وأعد المحاولة.', bad: 'اكتب الرقم المرجعي كما ظهر لك.', slow: 'محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.', err: 'تعذّر الاتصال الآن. حاول بعد قليل.',
      st: 'الحالة', rec: 'تم استلام مسألتك وحفظها لدينا', rev: 'راجع المكتب مسألتك وعدّل بياناتها', at: 'بتاريخ', heirs: 'الورثة ونصيب كل وارث', heir: 'الوارث', cnt: 'العدد', sh: 'النصيب', pc: 'النسبة', amt: 'المبلغ', school: 'المذهب / النظام', net: 'صافي التركة', wa: 'تواصل مع المكتب على واتساب بهذا الرقم', note: 'هذه نتيجة استرشادية محفوظة بتاريخ الحساب، وليست حكمًا أو رأيًا قانونيًا نهائيًا.', mad: { egypt: 'القانون المصري', hanafi: 'المذهب الحنفي', maliki: 'المذهب المالكي', shafii: 'المذهب الشافعي', hanbali: 'المذهب الحنبلي', saudi: 'نظام الأحوال الشخصية السعودي' } },
    en: { h: 'Follow your problem by reference number', p: 'Enter the number shown after your calculation (for example MR-2611-ABC234) to see its status and result.', ph: 'Reference number', go: 'Follow', busy: 'Searching...', nf: 'No problem found with this number. Check it and try again.', bad: 'Enter the reference number as shown.', slow: 'Too many attempts. Please wait a little and try again.', err: 'Could not connect now. Try again shortly.',
      st: 'Status', rec: 'Your problem was received and saved', rev: 'The office reviewed your problem and edited its data', at: 'on', heirs: 'Heirs and each heir\'s share', heir: 'Heir', cnt: 'Count', sh: 'Share', pc: 'Percent', amt: 'Amount', school: 'School / system', net: 'Net estate', wa: 'Contact the office on WhatsApp with this number', note: 'This is an indicative result saved on the calculation date. It is not a final legal opinion.', mad: { egypt: 'Egyptian law', hanafi: 'Hanafi school', maliki: 'Maliki school', shafii: 'Shafi\'i school', hanbali: 'Hanbali school', saudi: 'Saudi Personal Status Law' } },
    fr: { h: 'Suivez votre dossier avec le numéro de référence', p: 'Saisissez le numéro affiché après votre calcul (par exemple MR-2611-ABC234) pour voir son état et son résultat.', ph: 'Numéro de référence', go: 'Suivre', busy: 'Recherche...', nf: 'Aucun dossier avec ce numéro. Vérifiez-le et réessayez.', bad: 'Saisissez le numéro tel qu\'affiché.', slow: 'Trop de tentatives. Patientez un peu puis réessayez.', err: 'Connexion impossible pour le moment. Réessayez bientôt.',
      st: 'État', rec: 'Votre dossier a été reçu et enregistré', rev: 'Le cabinet a examiné votre dossier et modifié ses données', at: 'le', heirs: 'Héritiers et part de chacun', heir: 'Héritier', cnt: 'Nombre', sh: 'Part', pc: 'Pourcentage', amt: 'Montant', school: 'École / système', net: 'Succession nette', wa: 'Contactez le cabinet sur WhatsApp avec ce numéro', note: 'Résultat indicatif enregistré à la date du calcul, et non un avis juridique définitif.', mad: { egypt: 'Droit égyptien', hanafi: 'École hanafite', maliki: 'École malikite', shafii: 'École chaféite', hanbali: 'École hanbalite', saudi: 'Loi saoudienne sur le statut personnel' } }
  };
  function lang() { var l = ''; try { l = localStorage.getItem('siteLang') || ''; } catch (e) {} if (!l) l = document.documentElement.lang || 'ar'; return TX[l] ? l : 'ar'; }
  function t(k) { return TX[lang()][k]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var last = null;
  host.innerHTML = '<div id="rtBox" style="background:#fff;border:2px solid #b59461;border-radius:14px;padding:18px 20px;margin:18px 0;text-align:start"></div>';
  var box = document.getElementById('rtBox');
  function shell() {
    box.innerHTML = '<h3 style="margin:0 0 6px;color:#9c7e4d;font-family:Cairo,sans-serif">🔎 ' + esc(t('h')) + '</h3><p style="margin:0 0 12px;color:#555;font-size:.95rem">' + esc(t('p')) + '</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><input id="rtIn" type="text" dir="ltr" autocomplete="off" maxlength="24" placeholder="' + esc(t('ph')) + '" style="flex:1;min-width:200px;padding:12px 14px;border:1px solid #cdbf9f;border-radius:10px;font-size:1rem;letter-spacing:1px">' +
      '<button id="rtGo" type="button" style="padding:12px 28px;border:0;border-radius:10px;background:#b59461;color:#fff;font-weight:700;font-family:Cairo,sans-serif;font-size:1rem;cursor:pointer">' + esc(t('go')) + '</button></div><div id="rtOut" style="margin-top:14px"></div>';
    document.getElementById('rtGo').onclick = go;
    document.getElementById('rtIn').onkeydown = function (e) { if (e.key === 'Enter') go(); };
    if (last) draw(last);
  }
  function fmt(n) { return (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function needEngine(cb) {
    if (window.InheritanceEngine) return cb();
    var s = document.createElement('script'); s.src = '/calc-engine.js'; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  function nameOf(id) { var E = window.InheritanceEngine, X = window.HQCalcT, L = lang(); if (L === 'en' && X && X.EN[id]) return X.EN[id]; if (L === 'fr' && X && X.FR[id]) return X.FR[id]; return E.nm(id); }
  function draw(j) {
    var out = document.getElementById('rtOut'); if (!out) return;
    var E = window.InheritanceEngine, madh = (j.opts && j.opts.madhab) || 'egypt', res, est = j.estate || {};
    try { res = E.solve(j.inp, { barred: (j.opts && j.opts.barred) || [], madhab: madh }); } catch (e) { res = null; }
    var d = j.created ? new Date(j.created).toISOString().slice(0, 10) : '';
    var net = Math.max(0, (+est.gross || 0) - (+est.funeral || 0) - (+est.debts || 0));
    var h = '<div style="background:#fff9e6;border:1px solid #e3dccb;border-radius:10px;padding:12px 14px;line-height:2">' +
      '<div><b>' + esc(t('st')) + ':</b> ' + (j.status === 'reviewed' ? '🟡 ' + esc(t('rev')) : '🟢 ' + esc(t('rec'))) + (d ? ' (' + esc(t('at')) + ' ' + esc(d) + ')' : '') + '</div>' +
      '<div><b>' + esc(t('school')) + ':</b> ' + esc(t('mad')[madh] || t('mad').egypt) + '</div>' + (net ? '<div><b>' + esc(t('net')) + ':</b> ' + fmt(net) + '</div>' : '') +
      '<div dir="ltr" style="font-weight:700;color:#9c7e4d">' + esc(j.ref) + '</div></div>';
    if (res) {
      h += '<h4 style="margin:14px 0 6px;color:#9c7e4d">' + esc(t('heirs')) + '</h4><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f4efe3"><th style="padding:8px;border:1px solid #e3dccb">' + esc(t('heir')) + '</th><th style="padding:8px;border:1px solid #e3dccb">' + esc(t('cnt')) + '</th><th style="padding:8px;border:1px solid #e3dccb">' + esc(t('sh')) + '</th><th style="padding:8px;border:1px solid #e3dccb">' + esc(t('pc')) + '</th>' + (net ? '<th style="padding:8px;border:1px solid #e3dccb">' + esc(t('amt')) + '</th>' : '') + '</tr></thead><tbody>' +
        res.rows.map(function (r) { var v = E.F.val(r.frac); return '<tr><td style="padding:8px;border:1px solid #e3dccb">' + esc(nameOf(r.id)) + '</td><td style="padding:8px;border:1px solid #e3dccb;text-align:center">' + r.count + '</td><td dir="ltr" style="padding:8px;border:1px solid #e3dccb;text-align:center">' + esc(E.F.txt(r.frac)) + '</td><td dir="ltr" style="padding:8px;border:1px solid #e3dccb;text-align:center">' + (Math.round(v * 10000) / 100) + '%</td>' + (net ? '<td style="padding:8px;border:1px solid #e3dccb;text-align:center">' + fmt(v * net) + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>';
    }
    h += '<p style="font-size:.85rem;color:#777;margin:10px 0">' + esc(t('note')) + '</p><a target="_blank" rel="noopener" href="https://wa.me/201554797398?text=' + encodeURIComponent(j.ref) + '" style="display:inline-block;padding:10px 22px;border-radius:10px;background:#25d366;color:#fff;text-decoration:none;font-weight:700">' + esc(t('wa')) + '</a>';
    out.innerHTML = h;
  }
  function go() {
    var v = document.getElementById('rtIn').value.trim(), out = document.getElementById('rtOut');
    if (!v) { out.innerHTML = '<div style="color:#c0392b">' + esc(t('bad')) + '</div>'; return; }
    out.innerHTML = '<div style="color:#666">' + esc(t('busy')) + '</div>';
    fetch('/api/student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ref_status', ref: v }) })
      .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (x) {
        if (x.s === 404) { out.innerHTML = '<div style="color:#c0392b">' + esc(t('nf')) + '</div>'; return; }
        if (x.s === 429) { out.innerHTML = '<div style="color:#c0392b">' + esc(t('slow')) + '</div>'; return; }
        if (x.s === 400) { out.innerHTML = '<div style="color:#c0392b">' + esc(t('bad')) + '</div>'; return; }
        if (!x.j || !x.j.inp) { out.innerHTML = '<div style="color:#c0392b">' + esc(t('err')) + '</div>'; return; }
        needEngine(function () { last = x.j; draw(x.j); });
      }).catch(function () { out.innerHTML = '<div style="color:#c0392b">' + esc(t('err')) + '</div>'; });
  }
  shell();
  var q = (location.search.match(/[?&]ref=([A-Za-z0-9-]+)/) || [])[1];
  if (q) { document.getElementById('rtIn').value = q; go(); }
  var _sl = window.setLang; window.setLang = function () { var r = _sl && _sl.apply(this, arguments); try { var v = document.getElementById('rtIn') ? document.getElementById('rtIn').value : ''; shell(); document.getElementById('rtIn').value = v; } catch (e) {} return r; };
})();
