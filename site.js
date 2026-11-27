/* الحقانية: طبقة مشتركة لكل الصفحات: لغة حسب البلد، حجز الاستشارة، أزرار التواصل، التذييل، تعديلات الأدمن، الشهادات */
(function () {
  'use strict';
  // رجوع تسجيل الدخول (فيسبوك/جوجل): لو رجع لأي صفحة غير صفحة المواريث، حوّله لها مع بيانات الدخول
  try { var _h = location.hash || '', _q = location.search || '', _p = location.pathname.replace(/\.html$/, '');
    if (_p !== '/inheritance' && _p !== '/calculator' && (/access_token=|error_description=|error_code=/.test(_h) || /[?&](code|error_description)=/.test(_q)) && !/control-7f3k9/.test(_p)) location.replace('/inheritance' + _q + _h); } catch (e) {}
  var WA = '201554797398', TEL = '+201554797398', MAIL = 'legalelhaqania@gmail.com';
  var GA_ID = 'G-RZW8N3VJGM';
  var CFG = null;

  function lang() { try { if (typeof currentLang !== 'undefined' && currentLang) return currentLang; } catch (e) {} try { return localStorage.getItem('siteLang') || 'ar'; } catch (e) { return 'ar'; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function devId() {
    var d = ''; try { d = localStorage.getItem('hq_dev') || ''; } catch (e) {}
    if (!d) { var m = document.cookie.match(/(?:^|; )hq_dev=([^;]+)/); if (m) d = m[1]; }
    if (!d) d = (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
    try { localStorage.setItem('hq_dev', d); } catch (e) {}
    document.cookie = 'hq_dev=' + d + '; max-age=315360000; path=/; samesite=lax';
    return d;
  }
  window.HQDEV = devId();

  // ---------- Google Analytics (one real tag) ----------
  if (!window.__hqGA) {
    window.__hqGA = 1;
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = window.gtag || function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', GA_ID, { anonymize_ip: true });
  }

  // ---------- text ----------
  var TX = {
    ar: { book: 'حجز استشارة', title: 'حجز استشارة', normal: 'استشارة عادية', urgent: 'استشارة مستعجلة', urgentNote: 'تشمل الاستشارات يوم الجمعة والإجازات الرسمية. الرد خلال ساعة.',
      wa: 'واتساب', call: 'مكالمة', bookWa: 'احجز عبر واتساب', bookCall: 'احجز مكالمة', after: 'بعد الحجز، يصلك على واتساب تفاصيل الدفع وموعد الاستشارة.', close: 'إغلاق', cur: 'جنيه',
      callOnly: 'المكالمات الهاتفية متاحة للمصريين فقط.', phone: 'اتصال', email: 'البريد', addr: 'الإسكندرية، مصر', privacy: 'سياسة الخصوصية', terms: 'الشروط والأحكام', students: 'ركن الطالب',
      waMsgN: 'أريد حجز استشارة عادية', waMsgU: 'أريد حجز استشارة مستعجلة', byWa: 'عبر واتساب', byCall: 'مكالمة', admin: 'إدارة', certs: 'الشهادات', certsSub: 'اضغط على أي شهادة لتكبيرها', order: 'اطلب الخدمة', waOrder: 'أريد طلب خدمة: ' },
    en: { book: 'Book a consultation', title: 'Book a consultation', normal: 'Standard consultation', urgent: 'Urgent consultation', urgentNote: 'Also applies on Fridays and official holidays. Reply within one hour.',
      wa: 'WhatsApp', call: 'Call', bookWa: 'Book on WhatsApp', bookCall: 'Book a call', after: 'After booking, payment details and the appointment time reach you on WhatsApp.', close: 'Close', cur: 'USD',
      callOnly: 'Phone calls are available for clients in Egypt only.', phone: 'Call', email: 'Email', addr: 'Alexandria, Egypt', privacy: 'Privacy Policy', terms: 'Terms of Use', students: 'Students',
      waMsgN: 'I would like to book a standard consultation', waMsgU: 'I would like to book an urgent consultation', byWa: 'on WhatsApp', byCall: 'call', admin: 'Admin', certs: 'Certificates', certsSub: 'Tap any certificate to enlarge', order: 'Request service', waOrder: 'I would like to request a service: ' },
    fr: { book: 'Réserver une consultation', title: 'Réserver une consultation', normal: 'Consultation standard', urgent: 'Consultation urgente', urgentNote: 'S\'applique aussi les vendredis et jours fériés. Réponse sous une heure.',
      wa: 'WhatsApp', call: 'Appel', bookWa: 'Réserver sur WhatsApp', bookCall: 'Réserver un appel', after: 'Après la réservation, les détails de paiement et l\'heure du rendez-vous vous parviennent sur WhatsApp.', close: 'Fermer', cur: 'USD',
      callOnly: 'Les appels téléphoniques sont réservés aux clients en Égypte.', phone: 'Appeler', email: 'E-mail', addr: 'Alexandrie, Égypte', privacy: 'Politique de confidentialité', terms: 'Conditions d\'utilisation', students: 'Espace étudiants',
      waMsgN: 'Je souhaite réserver une consultation standard', waMsgU: 'Je souhaite réserver une consultation urgente', byWa: 'sur WhatsApp', byCall: 'appel', admin: 'Admin', certs: 'Certificats', certsSub: 'Touchez un certificat pour l\'agrandir', order: 'Demander le service', waOrder: 'Je souhaite demander un service : ' }
  };
  function t(k) { return (TX[lang()] || TX.ar)[k]; }
  function nf(n) { return Number(n).toLocaleString('en-US'); }

  var DEF_CERTS = [
    { image: '/assets/certs/cert-1.jpg', ar: 'حاصل على شهادة «مكافحة الفساد المتقدمة: الوقاية من الفساد» (مكتب الأمم المتحدة المعني بالمخدرات والجريمة)', en: 'Holds a certificate in "Advanced Anti-Corruption: Prevention of Corruption" (UN Office on Drugs and Crime)', fr: 'Titulaire d\'un certificat en « Lutte avancée contre la corruption : prévention de la corruption » (Office des Nations Unies contre la drogue et le crime)' },
    { image: '/assets/certs/cert-2.jpg', ar: 'حاصل على شهادة «مقدمة لمكافحة الفساد» (مكتب الأمم المتحدة المعني بالمخدرات والجريمة)', en: 'Holds a certificate in "Introduction to Anti-Corruption" (UN Office on Drugs and Crime)', fr: 'Titulaire d\'un certificat en « Introduction à la lutte contre la corruption » (ONUDC)' },
    { image: '/assets/certs/cert-3.jpg', ar: 'حاصل على شهادة «آلية استعراض تنفيذ اتفاقية الأمم المتحدة لمكافحة الجريمة المنظمة عبر الوطنية والبروتوكولات الملحقة بها» (مكتب الأمم المتحدة المعني بالمخدرات والجريمة)', en: 'Holds a certificate in "Review Mechanism of the UN Convention against Transnational Organized Crime and its Protocols" (UN Office on Drugs and Crime)', fr: 'Titulaire d\'un certificat en « Mécanisme d\'examen de l\'application de la Convention des Nations Unies contre la criminalité transnationale organisée et de ses protocoles » (ONUDC)' },
    { image: '/assets/certs/cert-4.jpg', ar: 'حاصل على شهادة «ما ندافع عنه: أساسيات حقوق الأطفال» (اليونيسف عبر منصة أجورا)', en: 'Holds a certificate in "What We Stand For: Child Rights Basics" (UNICEF through the Agora platform)', fr: 'Titulaire d\'un certificat en « Ce que nous défendons : les bases des droits de l\'enfant » (UNICEF via la plateforme Agora)' },
    { image: '/assets/certs/cert-5.jpg', ar: 'حاصل على شهادة «مقدمة لحقوق الإنسان» (منظمة العفو الدولية، أكاديمية حقوق الإنسان، ١٠ ساعات تعلّم ذاتي)', en: 'Holds a certificate in "Introduction to Human Rights" (Amnesty International Human Rights Academy, 10 hours, self-paced)', fr: 'Titulaire d\'un certificat en « Introduction aux droits humains » (Amnesty International, Académie des droits humains, 10 heures, apprentissage autonome)' }
  ];

  // ---------- styles ----------
  var css = document.createElement('style');
  css.textContent =
    '.hq-bk{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:100000;display:none;align-items:center;justify-content:center;padding:14px;font-family:Cairo,Tahoma,sans-serif}.hq-bk.on{display:flex}' +
    '.hq-bk .box{background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:92vh;overflow:auto;padding:22px;position:relative;color:#222;text-align:center}' +
    '.hq-bk h3{margin:0 0 14px;color:#9c7e4d;font-size:1.3rem}.hq-bk .x{position:absolute;top:10px;left:10px;border:0;background:#dc3545;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.1rem}' +
    'html[dir=ltr] .hq-bk .x{left:auto;right:10px}.hq-bk .tabs{display:flex;gap:8px;margin-bottom:14px}.hq-bk .tabs button{flex:1;border:2px solid #b59461;background:#fff;color:#7d6238;padding:10px;border-radius:12px;font:inherit;font-weight:700;cursor:pointer}' +
    '.hq-bk .tabs button.on{background:#b59461;color:#fff}.hq-bk .pr{display:flex;flex-direction:column;gap:10px;margin:8px 0}.hq-bk .opt{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid #e2d6bd;border-radius:12px;padding:12px 14px;background:#faf6ec}' +
    '.hq-bk .opt b{font-size:1.15rem;color:#111}.hq-bk .opt a{background:#25d366;color:#fff;text-decoration:none;border-radius:22px;padding:9px 16px;font-weight:700;font-size:.9rem;white-space:nowrap}.hq-bk .opt a.c{background:#111;color:#e8c872}' +
    '.hq-bk .note{font-size:.85rem;color:#666;margin:6px 0}.hq-bk .urg{background:#fff4e0;border:1px solid #f0c36b;border-radius:10px;padding:8px 10px;font-size:.88rem;color:#7a5200;margin:6px 0}' +
    '.hq-call{position:fixed;bottom:25px;width:60px;height:60px;border-radius:50%;background:#111;color:#e8c872;display:flex;align-items:center;justify-content:center;font-size:26px;z-index:9999;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,.35)}' +
    '.hq-addr{margin:10px 0 4px;font-size:.95rem;opacity:.9}.hq-flinks{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:8px 0;font-size:.9rem}.hq-flinks a{color:#e8c872;text-decoration:none}' +
    '.hq-adm{position:fixed;bottom:100px;right:14px;z-index:9998;background:#0f2a47;color:#e8c872;border-radius:20px;padding:8px 14px;font:700 .85rem Cairo,Tahoma,sans-serif;text-decoration:none;box-shadow:0 3px 10px rgba(0,0,0,.3)}' +
    '.hq-edit{position:fixed;bottom:150px;right:14px;z-index:9998;background:#c9a64a;color:#111;border:0;border-radius:20px;padding:8px 14px;font:700 .85rem Cairo,Tahoma,sans-serif;cursor:pointer}' +
    'body.hq-editing [data-ar]:hover,body.hq-editing img:hover{outline:2px dashed #c0392b;cursor:pointer}' +
    '.hq-certs{max-width:1100px;margin:30px auto;padding:0 16px;font-family:Cairo,Tahoma,sans-serif}.hq-certs h2{text-align:center;color:#9c7e4d;margin-bottom:6px}.hq-certs p.sub{text-align:center;color:#777;font-size:.9rem;margin:0 0 16px}' +
    '.hq-cgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.hq-cc{background:#fff;border:1px solid #e2d6bd;border-radius:14px;padding:12px;text-align:center}.hq-cc img{width:100%;height:170px;object-fit:cover;object-position:top;border-radius:8px;cursor:zoom-in;border:1px solid #eee}.hq-cc div{font-size:.88rem;margin-top:8px;line-height:1.6}' +
    '.hq-zoom{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:100001;display:none;align-items:center;justify-content:center;padding:14px}.hq-zoom.on{display:flex}.hq-zoom img{max-width:100%;max-height:100%;border-radius:6px;background:#fff}' +
    '.hq-ed{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100002;display:flex;align-items:center;justify-content:center;padding:14px}.hq-ed .b{background:#fff;border-radius:12px;padding:16px;max-width:600px;width:100%;max-height:90vh;overflow:auto;font-family:Cairo,Tahoma,sans-serif;direction:rtl}' +
    '.hq-ed textarea{width:100%;min-height:70px;margin:4px 0 10px;padding:8px;border:1px solid #ccc;border-radius:8px;font:inherit;user-select:text}.hq-ed button{border:0;border-radius:8px;padding:8px 16px;font:inherit;cursor:pointer;margin-inline-end:6px}';
  document.head.appendChild(css);

  // ---------- booking popup ----------
  var bk, mode = 'normal';
  function prices() { return (CFG && CFG.prices) || { eg: { wa: 300, call: 500, urgent_wa: 450, urgent_call: 750 }, foreign: { wa: 40, urgent: 60 }, urgent_promise_hours: 1 }; }
  function waLink(msg) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); }
  function renderBook() {
    var L = lang(), P = prices(), ar = L === 'ar', u = mode === 'urgent', h = '';
    h += '<button class="x" aria-label="' + esc(t('close')) + '">×</button><h3>' + esc(t('title')) + '</h3>';
    h += '<div class="tabs"><button data-m="normal" class="' + (u ? '' : 'on') + '">' + esc(t('normal')) + '</button><button data-m="urgent" class="' + (u ? 'on' : '') + '">' + esc(t('urgent')) + '</button></div>';
    if (u) h += '<div class="urg">' + esc(t('urgentNote').replace(/ساعة|one hour|une heure/, function (m) { var n = P.urgent_promise_hours || 1; return n === 1 ? m : (ar ? n + ' ساعات' : n + ' hours'); })) + '</div>';
    h += '<div class="pr">';
    if (ar) {
      var a = u ? P.eg.urgent_wa : P.eg.wa, c = u ? P.eg.urgent_call : P.eg.call;
      h += '<div class="opt"><span>' + t('wa') + '<br><b>' + nf(a) + ' ' + t('cur') + '</b></span><a target="_blank" rel="noopener" href="' + waLink(u ? t('waMsgU') + ' (واتساب)' : t('waMsgN') + ' (واتساب)') + '">' + t('bookWa') + '</a></div>';
      h += '<div class="opt"><span>' + t('call') + '<br><b>' + nf(c) + ' ' + t('cur') + '</b></span><a class="c" target="_blank" rel="noopener" href="' + waLink(u ? t('waMsgU') + ' (مكالمة)' : t('waMsgN') + ' (مكالمة)') + '">' + t('bookCall') + '</a></div>';
    } else {
      var f = u ? P.foreign.urgent : P.foreign.wa;
      h += '<div class="opt"><span>' + t('wa') + '<br><b>$' + nf(f) + '</b></span><a target="_blank" rel="noopener" href="' + waLink(u ? 'Hello, I am a foreign client and I would like to book an URGENT consultation (WhatsApp message). Please confirm availability and payment details. (Booked from the website, language: '+L.toUpperCase()+')' : 'Hello, I am a foreign client and I would like to book a STANDARD consultation (WhatsApp message). Please confirm availability and payment details. (Booked from the website, language: '+L.toUpperCase()+')') + '">' + t('bookWa') + '</a></div>';
      h += '<div class="note">' + esc(t('callOnly')) + '</div>';
    }
    h += '</div><div class="note">' + esc(t('after')) + '</div>';
    bk.querySelector('.box').innerHTML = h;
    bk.querySelector('.box').setAttribute('dir', ar ? 'rtl' : 'ltr');
    bk.querySelector('.x').onclick = closeBook;
    bk.querySelectorAll('.tabs button').forEach(function (b) { b.onclick = function () { mode = b.dataset.m; renderBook(); }; });
  }
  function openBook(m) {
    if (!bk) { bk = document.createElement('div'); bk.className = 'hq-bk'; bk.innerHTML = '<div class="box"></div>'; bk.addEventListener('click', function (e) { if (e.target === bk) closeBook(); }); document.body.appendChild(bk); }
    mode = m === 'urgent' ? 'urgent' : 'normal'; renderBook(); bk.classList.add('on');
  }
  function closeBook() { if (bk) bk.classList.remove('on'); }
  window.HQ = window.HQ || {}; window.HQ.book = openBook;
  // legacy hooks on old pages now open the single booking window
  window.openModal = function () { openBook('normal'); };
  window.closeModal = function () { closeBook(); };
  window.openPaymentModal = function () { openBook('urgent'); };
  window.closePaymentModal = closeBook;
  window.openServiceModal = function () {};
  window.closeServiceModal = function () {};

  // ---------- contact: call + WhatsApp side by side, footer ----------
  function addFloatCall() {
    var w = document.querySelector('.whatsapp-float');
    if (!w || document.querySelector('.hq-call')) return;
    var cs = getComputedStyle(w), a = document.createElement('a');
    a.className = 'hq-call'; a.href = 'tel:' + TEL; a.setAttribute('aria-label', 'Call'); a.innerHTML = '<i class="fas fa-phone-alt"></i>';
    var side = cs.left !== 'auto' && parseInt(cs.left, 10) < parseInt(cs.right || 9999, 10) ? 'left' : 'right';
    if (cs.right !== 'auto' && cs.left === 'auto') side = 'right';
    a.style[side] = (parseInt(cs[side], 10) + 70) + 'px';
    document.body.appendChild(a);
  }
  function fixFooter() {
    var f = document.querySelector('footer'); if (!f) return;
    var links = f.querySelector('.footer-links');
    if (links && !links.querySelector('.hq-mail')) {
      var mail = document.createElement('a'); mail.className = 'hq-mail'; mail.href = 'mailto:' + MAIL; mail.innerHTML = '<i class="fas fa-envelope"></i> ' + MAIL; links.appendChild(mail);
    }
    var old = f.querySelector('.hq-extra'); if (old) old.remove();
    var d = document.createElement('div'); d.className = 'hq-extra';
    d.innerHTML = '<div class="hq-addr"><i class="fas fa-location-dot"></i> ' + esc(t('addr')) + '</div><div class="hq-flinks"><a href="/privacy">' + esc(t('privacy')) + '</a><a href="/terms">' + esc(t('terms')) + '</a></div>';
    var prot = f.querySelector('.protection-notice');
    if (prot) f.insertBefore(d, prot); else f.appendChild(d);
    
  }
  function adminBtn() {
    var on = false; try { on = localStorage.getItem('hq_adm') === '1'; } catch (e) {}
    if (!on || document.querySelector('.hq-adm')) return;
    var a = document.createElement('a'); a.className = 'hq-adm'; a.href = '/control-7f3k9'; a.textContent = '⚙ ' + t('admin'); document.body.appendChild(a);
    if (sessionStorage.getItem('hq_t')) {
      var b = document.createElement('button'); b.className = 'hq-edit'; b.textContent = '✏️ تعديل النصوص والصور'; b.onclick = function () { document.body.classList.toggle('hq-editing'); b.textContent = document.body.classList.contains('hq-editing') ? '✔ إنهاء التعديل' : '✏️ تعديل النصوص والصور'; };
      document.body.appendChild(b); wireEditor();
    }
  }

  // ---------- admin overrides ----------
  function applyOverrides() {
    var ov = CFG && CFG.ov; if (!ov) return;
    var changed = false;
    document.querySelectorAll('[data-ar]').forEach(function (el) {
      var key = el.getAttribute('data-hqk') || el.getAttribute('data-ar'); el.setAttribute('data-hqk', key);
      var o = ov.t && ov.t[key];
      if (o) { if (o.ar) el.setAttribute('data-ar', o.ar); if (o.en) el.setAttribute('data-en', o.en); if (o.fr) el.setAttribute('data-fr', o.fr); changed = true; }
    });
    document.querySelectorAll('img').forEach(function (im) {
      var key = im.getAttribute('data-hqk') || im.getAttribute('src'); im.setAttribute('data-hqk', key);
      if (ov.i && ov.i[key]) im.src = ov.i[key];
    });
    if (changed && typeof window.setLang === 'function') { try { window.setLang(lang()); } catch (e) {} }
  }
  var edState = null;
  function wireEditor() {
    if (wireEditor.done) return; wireEditor.done = 1;
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('hq-editing')) return;
      if (e.target.closest('.hq-edit,.hq-adm,.hq-ed')) return;
      var img = e.target.closest('img'), el = e.target.closest('[data-ar]');
      if (!img && !el) return;
      e.preventDefault(); e.stopPropagation();
      if (img) return editImage(img);
      editText(el);
    }, true);
  }
  function adminApi(body) {
    return fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sessionStorage.getItem('hq_t') }, body: JSON.stringify(body) }).then(function (r) { if (!r.ok) throw new Error('http_' + r.status); return r.json(); });
  }
  function editText(el) {
    var key = el.getAttribute('data-hqk') || el.getAttribute('data-ar');
    var cur = (CFG.ov.t || {})[key] || { ar: el.getAttribute('data-ar'), en: el.getAttribute('data-en'), fr: el.getAttribute('data-fr') };
    var d = document.createElement('div'); d.className = 'hq-ed';
    d.innerHTML = '<div class="b"><b>تعديل النص</b><br>عربي<textarea id="e_ar"></textarea>English<textarea id="e_en" dir="ltr"></textarea>Français<textarea id="e_fr" dir="ltr"></textarea><button style="background:#1e8e5a;color:#fff" id="e_ok">حفظ</button><button id="e_no">إلغاء</button><button style="background:#c0392b;color:#fff" id="e_rs">رجوع للأصل</button></div>';
    document.body.appendChild(d);
    d.querySelector('#e_ar').value = cur.ar || ''; d.querySelector('#e_en').value = cur.en || ''; d.querySelector('#e_fr').value = cur.fr || '';
    d.querySelector('#e_no').onclick = function () { d.remove(); };
    function save(del) {
      var ov = JSON.parse(JSON.stringify(CFG.ov)); ov.t = ov.t || {}; ov.i = ov.i || {};
      if (del) delete ov.t[key]; else ov.t[key] = { ar: d.querySelector('#e_ar').value, en: d.querySelector('#e_en').value, fr: d.querySelector('#e_fr').value };
      adminApi({ action: 'site_set', ov: ov }).then(function () { CFG.ov = ov; d.remove(); location.reload(); }).catch(function () { alert('فشل الحفظ، سجل دخول الأدمن تاني'); });
    }
    d.querySelector('#e_ok').onclick = function () { save(false); };
    d.querySelector('#e_rs').onclick = function () { save(true); };
  }
  function editImage(img) {
    var key = img.getAttribute('data-hqk') || img.getAttribute('src');
    var url = prompt('رابط الصورة الجديدة (https). اتركه فاضي للرجوع للأصلية:', (CFG.ov.i || {})[key] || '');
    if (url === null) return;
    var ov = JSON.parse(JSON.stringify(CFG.ov)); ov.i = ov.i || {}; ov.t = ov.t || {};
    if (!url) delete ov.i[key]; else if (!/^https:\/\//.test(url)) return alert('لازم الرابط يبدأ بـ https');
    else ov.i[key] = url;
    adminApi({ action: 'site_set', ov: ov }).then(function () { location.reload(); }).catch(function () { alert('فشل الحفظ'); });
  }

  // ---------- certificates (about page) ----------
  var zoom;
  function renderCerts() {
    var box = document.getElementById('hqCerts'); if (!box) return;
    var list = (CFG && CFG.certs && CFG.certs.length) ? CFG.certs : DEF_CERTS, L = lang();
    box.className = 'hq-certs';
    box.innerHTML = '<h2>' + esc(t('certs')) + '</h2><p class="sub">' + esc(t('certsSub')) + '</p><div class="hq-cgrid">' + list.map(function (c, i) {
      var tx = c[L] || c.ar; return '<div class="hq-cc"><img src="' + esc(c.image) + '" alt="' + esc(tx) + '" loading="lazy" data-z="' + i + '"><div>' + esc(tx) + '</div></div>';
    }).join('') + '</div>';
    box.querySelectorAll('img').forEach(function (im) { im.onclick = function () {
      if (document.body.classList.contains('hq-editing')) return;
      if (!zoom) { zoom = document.createElement('div'); zoom.className = 'hq-zoom'; zoom.innerHTML = '<img alt="">'; zoom.onclick = function () { zoom.classList.remove('on'); }; document.body.appendChild(zoom); }
      zoom.querySelector('img').src = im.src; zoom.classList.add('on'); }; });
  }

  // ---------- language by country (first visit only) ----------
  function wrapSetLang() {
    if (typeof window.setLang !== 'function' || window.setLang.__hq) return;
    var orig = window.setLang;
    window.setLang = function (l) { orig.apply(this, arguments); try { localStorage.setItem('hq_lang_set', '1'); } catch (e) {} afterLang(); };
    window.setLang.__hq = 1;
  }
  function afterLang() { renderCerts(); fixFooter(); if (bk && bk.classList.contains('on')) renderBook(); var a = document.querySelector('.hq-adm'); if (a) a.textContent = '⚙ ' + t('admin'); }

  function init() {
    wrapSetLang(); addFloatCall(); fixFooter(); adminBtn(); renderCerts();
    // buttons that open the booking window
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hq-book]'); if (b) { e.preventDefault(); openBook(b.getAttribute('data-hq-book')); }
    });
    var dev = window.HQDEV;
    fetch('/api/site?dev=' + encodeURIComponent(dev)).then(function (r) { return r.json(); }).then(function (j) {
      CFG = j; window.HQCFG = j;
      var first = false; try { first = !localStorage.getItem('siteLang') && !localStorage.getItem('hq_lang_set'); } catch (e) {}
      if (first && j.lang && j.lang !== lang() && typeof window.setLang === 'function') { try { window.setLang(j.lang); } catch (e) {} }
      applyOverrides(); renderCerts();
      if (bk && bk.classList.contains('on')) renderBook();
    }).catch(function () {});
    // admin pages: mark this device as owner device
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); }); else setTimeout(init, 0);
})();
