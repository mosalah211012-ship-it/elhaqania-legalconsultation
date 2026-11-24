/* =========================================================
   دالة فيرسيل السحابية — تجلب أحدث فيديوهات قناة يوتيوب تلقائياً
   المسار داخل المشروع: api/videos.js
   ---------------------------------------------------------
   بعد إنشاء القناة: ضع معرّف القناة هنا (يبدأ بـ UC...)
   تجده في يوتيوب ستوديو > الإعدادات > القناة > معرّف القناة
   ========================================================= */
const CHANNEL_ID = "UC5nTJrYLObJhjMlw6hicCUA";

module.exports = async function handler(req, res) {
  // تخزين مؤقت على شبكة فيرسيل: 5 دقائق، مع تحديث خلفي حتى 10 دقائق
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!CHANNEL_ID) {
    return res.status(200).json({ videos: [], reason: 'channel_id_not_set', generated: new Date().toISOString() });
  }

  try {
    const feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + encodeURIComponent(CHANNEL_ID);
    const r = await fetch(feedUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HaqaniaSite/1.0)' } });
    if (!r.ok) throw new Error('feed status ' + r.status);
    const xml = await r.text();

    const videos = [];
    const entries = xml.split('<entry>').slice(1);
    for (const e of entries) {
      const id = (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
      const rawTitle = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
      const published = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
      if (id) videos.push({ id: id, title: decodeEntities(rawTitle), published: published });
    }
    return res.status(200).json({ videos: videos, generated: new Date().toISOString() });
  } catch (err) {
    // أي عطل في الجلب يرجع خطأً صريحاً، والصفحة تعرض حالة إعادة المحاولة لا صمتًا
    return res.status(200).json({ videos: [], error: 'feed_unavailable', generated: new Date().toISOString() });
  }
};

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}
