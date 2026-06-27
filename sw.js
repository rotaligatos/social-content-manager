// Social Content Manager — Service Worker v2
// Network-first for HTML, cache-first for assets only

const CACHE = 'scm-v2';
const NEVER_CACHE = [
  'index.html',
  'social-content-manager.html',
  '/',
  '/social-content-manager/',
  'api.anthropic.com',
  'graph.facebook.com',
  'supabase.co',
  'generativelanguage.googleapis.com',
  'ideogram.ai'
];

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches on activate
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // Never cache these — always go to network
  if (NEVER_CACHE.some(nc => url.includes(nc))) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first only for fonts and static CDN assets
  if (url.includes('fonts.googleapis.com') || 
      url.includes('fonts.gstatic.com') ||
      url.includes('cdnjs.cloudflare.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Everything else — network first
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
