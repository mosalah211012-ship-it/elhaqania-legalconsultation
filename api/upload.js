const { handleUpload } = require('@vercel/blob/client');
const L = require('./_lib');

// Admin-only file upload (images, PDFs, documents) straight to Vercel Blob.
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return L.send(res, 405, { error: 'method' });
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const out = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const cp = String(clientPayload || '');
        if (cp.startsWith('S:')) {
          const u = await L.supaUser({ headers: { authorization: 'Bearer ' + cp.slice(2) } });
          if (!u || !/^pay-/.test(String(pathname))) throw new Error('auth');
          return { maximumSizeInBytes: 6 * 1024 * 1024, addRandomSuffix: true, allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] };
        }
        if (!L.verify(cp)) throw new Error('auth');
        return {
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
          allowedContentTypes: ['image/*', 'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip', 'text/plain']
        };
      },
      onUploadCompleted: async () => {}
    });
    L.send(res, 200, out);
  } catch (e) {
    L.send(res, 400, { error: String(e.message || 'upload_error').slice(0, 120) });
  }
};
