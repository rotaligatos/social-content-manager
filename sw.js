// Social Content Manager — Service Worker
// Place this file at the root of the GitHub Pages repo (same level as social-content-manager.html)

const CACHE = 'scm-v1';
const PRECACHE = [
  './social-content-manager.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Always use network for API calls — never cache these
  const url = e.request.url;
  if (url.includes('api.anthropic.com') ||
      url.includes('graph.facebook.com') ||
      url.includes('supabase.co') ||
      url.includes('generativelanguage.googleapis.com') ||
      url.includes('ideogram.ai')) {
    return;
  }

  // Cache-first for app shell, network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
