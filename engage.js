/* الحقانية: عداد الزوار + اللايكات والتعليقات والتقييمات */
(function () {
  'use strict';
  var path = location.pathname.replace(/\/index$/, '/').replace(/\.html$/, '') || '/';
  function lang() { try { if (typeof currentLang !== 'undefined' && currentLang) return currentLang; } catch (e) {} try { return localStorage.getItem('siteLang') || 'ar'; } catch (e) { return 'ar'; } }
  var T = {
    ar: { like: 'أعجبني', comments: 'التعليقات', addc: 'اكتب تعليقك', name: 'الاسم', text: 'تعليقك', send: 'إرسال', thanksc: 'شكرًا، تم نشر تعليقك', thanksp: 'شكرًا، تعليقك هيظهر بعد المراجعة', none: 'كن أول من يعلّق', rate: 'قيّم', rtext: 'رأيك', target: 'التقييم عن', site: 'الموقع', office: 'المكتب', article: 'مقال', rthanks: 'شكرًا لتقييمك، هيظهر بعد المراجعة', rthanksa: 'شكرًا لتقييمك', visitors: 'زوار الموقع', rateus: 'قيّم الموقع', reply: 'رد المكتب', noreviews: 'لسه مفيش تقييمات، كن أول من يقيّم', err: 'حصل خطأ، حاول تاني', nolinks: 'من فضلك بدون روابط', short: 'اكتب اسمك ورأيك', slow: 'محاولات كتير، حاول بعد شوية', avg: 'متوسط التقييم', of: 'من', artrev: 'تقييمات المقال' },
    en: { like: 'Like', comments: 'Comments', addc: 'Add a comment', name: 'Name', text: 'Your comment', send: 'Send', thanksc: 'Thanks, your comment is live', thanksp: 'Thanks, your comment will appear after review', none: 'Be the first to comment', rate: 'Rate', rtext: 'Your opinion', target: 'Review about', site: 'Website', office: 'Office', article: 'Article', rthanks: 'Thanks, your review will appear after review', rthanksa: 'Thanks for your review', visitors: 'Visitors', rateus: 'Rate the site', reply: 'Office reply', noreviews: 'No reviews yet', err: 'Something went wrong', nolinks: 'Please no links', short: 'Enter your name and opinion', slow: 'Too many attempts, try later', avg: 'Average', of: 'of', artrev: 'Article reviews' }
  };
  function t(k) { var l = T[lang()] || T.ar; return l[k] || T.ar[k] || k; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var vid; try { vid = localStorage.getItem('hq_vid'); if (!vid) { vid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40); localStorage.setItem('hq_vid', vid); } } catch (e) { vid = 'anon' + Math.random().toString(36).slice(2, 12); }
  function post(url, body) { body.vid = vid; return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().then(function (j) { j._ok = r.ok; return j; }); }); }
  function errMsg(j) { return j && j.error === 'no_links' ? t('nolinks') : j && j.error === 'too_short' ? t('short') : j && j.error === 'slow_down' ? t('slow') : t('err'); }

  var css = document.createElement('style');
  css.textContent = '.hq-box{max-width:820px;margin:28px auto;padding:20px;background:#fff;border:1px solid #e3e8ef;border-radius:14px;font-family:Cairo,Tahoma,sans-serif;color:#1b2733;direction:rtl;text-align:right}' +
    '.hq-box h3{margin:0 0 12px;color:#0f2a47}.hq-like{border:2px solid #0f2a47;background:#fff;color:#0f2a47;border-radius:24px;padding:8px 18px;font:inherit;font-weight:700;cursor:pointer}.hq-like.on{background:#0f2a47;color:#e8c872}' +
    '.hq-box input,.hq-box textarea,.hq-box select{width:100%;padding:10px;margin:5px 0 10px;border:1px solid #cbd5e0;border-radius:8px;font:inherit;box-sizing:border-box}.hq-box textarea{min-height:90px}' +
    '.hq-send{background:#0f2a47;color:#fff;border:0;border-radius:8px;padding:10px 22px;font:inherit;font-weight:700;cursor:pointer}.hq-item{border-top:1px solid #eef1f5;padding:11px 0}.hq-item small{color:#6b7a8c}' +
    '.hq-reply{background:#f5f0dc;border-radius:8px;padding:7px 10px;margin-top:6px;font-size:.9rem}.hq-msg{margin:6px 0;font-weight:600;color:#14663f}.hq-star{color:#e0a800;letter-spacing:2px}' +
    '.hq-foot{text-align:center;padding:10px;font-family:Cairo,Tahoma,sans-serif;font-size:.9rem;color:#6b7a8c}.hq-foot a{color:#0f2a47;font-weight:700}';
  document.head.appendChild(css);

  // ---- visitor counter ----
  var noc = false; try { noc = localStorage.getItem('hq_noc') === '1'; } catch (e) {}
  if (!noc) { try { post('/api/hit', { path: path }); } catch (e) {} }
  function showCounter() {
    fetch('/api/hit').then(function (r) { return r.json(); }).then(function (j) {
      var n = (j.views || 0).toLocaleString('en-US');
      var el = document.getElementById('visitorCounter');
      if (el) el.textContent = n;
      var f = document.createElement('div'); f.className = 'hq-foot';
      f.innerHTML = '👁 ' + esc(t('visitors')) + ': <b>' + n + '</b> &nbsp;|&nbsp; <a href="/reviews">⭐ ' + esc(t('rateus')) + '</a>';
      document.body.appendChild(f);
    }).catch(function () {});
  }
  function stars(n) { n = Math.max(1, Math.min(5, n | 0)); return '★'.repeat(n) + '☆'.repeat(5 - n); }
  function when(c) { return (c || '').slice(0, 10); }

  // ---- article page: likes, comments, reviews ----
  function articlePage() {
    var id = new URLSearchParams(location.search).get('id');
    var host = document.getElementById('articleContainer');
    if (!id || !host) return;
    var box = document.createElement('div'); box.className = 'hq-box'; box.id = 'hqEngage';
    host.parentNode.insertBefore(box, host.nextSibling);
    function load() {
      fetch('/api/interact?article_id=' + encodeURIComponent(id) + '&vid=' + encodeURIComponent(vid)).then(function (r) { return r.json(); }).then(function (d) {
        var h = '<button class="hq-like ' + (d.liked ? 'on' : '') + '" id="hqLike">❤ ' + esc(t('like')) + ' (' + (d.likes || 0) + ')</button>';
        h += '<h3 style="margin-top:22px">💬 ' + esc(t('comments')) + ' (' + d.comments.length + ')</h3>';
        h += d.comments.length ? d.comments.map(function (c) { return '<div class="hq-item"><b>' + esc(c.name) + '</b> <small>' + esc(when(c.created)) + '</small><div>' + esc(c.text) + '</div>' + (c.reply ? '<div class="hq-reply">' + esc(t('reply')) + ': ' + esc(c.reply) + '</div>' : '') + '</div>'; }).join('') : '<p><small>' + esc(t('none')) + '</small></p>';
        h += '<h3 style="margin-top:18px">' + esc(t('addc')) + '</h3><input id="hqCn" maxlength="60" placeholder="' + esc(t('name')) + '"><textarea id="hqCt" maxlength="1000" placeholder="' + esc(t('text')) + '"></textarea><button class="hq-send" id="hqCs">' + esc(t('send')) + '</button><div class="hq-msg" id="hqCm"></div>';
        h += '<h3 style="margin-top:26px">⭐ ' + esc(t('artrev')) + (d.reviews.length ? ' (' + d.reviews.length + ')' : '') + '</h3>';
        h += d.reviews.map(function (c) { return '<div class="hq-item"><b>' + esc(c.name) + '</b> <span class="hq-star">' + stars(c.rating) + '</span> <small>' + esc(when(c.created)) + '</small><div>' + esc(c.text) + '</div></div>'; }).join('');
        h += '<select id="hqRr"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select><input id="hqRn" maxlength="60" placeholder="' + esc(t('name')) + '"><textarea id="hqRt" maxlength="1500" placeholder="' + esc(t('rtext')) + '"></textarea><button class="hq-send" id="hqRs">' + esc(t('rate')) + '</button><div class="hq-msg" id="hqRm"></div>';
        box.innerHTML = h;
        document.getElementById('hqLike').onclick = function () { post('/api/interact', { action: 'like', article_id: id }).then(function (j) { if (j._ok) load(); }); };
        document.getElementById('hqCs').onclick = function () {
          post('/api/interact', { action: 'comment', article_id: id, name: document.getElementById('hqCn').value, text: document.getElementById('hqCt').value }).then(function (j) {
            var m = document.getElementById('hqCm'); if (j._ok) { m.textContent = j.status === 'pending' ? t('thanksp') : t('thanksc'); if (j.status !== 'pending') setTimeout(load, 700); } else { m.style.color = '#b03a2e'; m.textContent = errMsg(j); }
          });
        };
        document.getElementById('hqRs').onclick = function () {
          post('/api/interact', { action: 'review', target: 'article', article_id: id, rating: document.getElementById('hqRr').value, name: document.getElementById('hqRn').value, text: document.getElementById('hqRt').value }).then(function (j) {
            var m = document.getElementById('hqRm'); if (j._ok) { m.textContent = j.status === 'pending' ? t('rthanks') : t('rthanksa'); } else { m.style.color = '#b03a2e'; m.textContent = errMsg(j); }
          });
        };
      }).catch(function () {});
    }
    var tries = 0; (function wait() { if (host.querySelector('.article-body') || tries++ > 40) load(); else setTimeout(wait, 300); })();
  }

  // ---- reviews page ----
  function reviewsPage() {
    var host = document.getElementById('reviewsApp'); if (!host) return;
    host.className = 'hq-box';
    function load() {
      fetch('/api/content?type=reviews').then(function (r) { return r.json(); }).then(function (list) {
        var avg = list.length ? (list.reduce(function (a, c) { return a + (c.rating || 0); }, 0) / list.length) : 0;
        var tg = { site: t('site'), office: t('office'), article: t('article') };
        var h = '<h3>' + (list.length ? esc(t('avg')) + ': <span class="hq-star">' + stars(Math.round(avg)) + '</span> ' + avg.toFixed(1) + ' (' + list.length + ')' : '') + '</h3>';
        h += '<label>' + esc(t('target')) + '</label><select id="hqTg"><option value="site">' + esc(t('site')) + '</option><option value="office">' + esc(t('office')) + '</option></select>';
        h += '<select id="hqRr"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select><input id="hqRn" maxlength="60" placeholder="' + esc(t('name')) + '"><textarea id="hqRt" maxlength="1500" placeholder="' + esc(t('rtext')) + '"></textarea><button class="hq-send" id="hqRs">' + esc(t('rate')) + '</button><div class="hq-msg" id="hqRm"></div><div style="margin-top:14px">';
        h += list.length ? list.map(function (c) { return '<div class="hq-item"><b>' + esc(c.name) + '</b> <span class="hq-star">' + stars(c.rating) + '</span> <small>' + esc(tg[c.target] || '') + ' · ' + esc(when(c.created)) + '</small><div>' + esc(c.text) + '</div>' + (c.reply ? '<div class="hq-reply">' + esc(t('reply')) + ': ' + esc(c.reply) + '</div>' : '') + '</div>'; }).join('') : '<p><small>' + esc(t('noreviews')) + '</small></p>';
        host.innerHTML = h + '</div>';
        document.getElementById('hqRs').onclick = function () {
          post('/api/interact', { action: 'review', target: document.getElementById('hqTg').value, rating: document.getElementById('hqRr').value, name: document.getElementById('hqRn').value, text: document.getElementById('hqRt').value }).then(function (j) {
            var m = document.getElementById('hqRm'); if (j._ok) { m.textContent = j.status === 'pending' ? t('rthanks') : t('rthanksa'); } else { m.style.color = '#b03a2e'; m.textContent = errMsg(j); }
          });
        };
      }).catch(function () {});
    }
    load();
  }

  function init() { showCounter(); if (path.indexOf('/article-detail') === 0) articlePage(); reviewsPage(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
