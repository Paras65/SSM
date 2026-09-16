// Cache version — bump this string on every production deploy to invalidate old caches
const CACHE_VERSION = 'ssm-pwa-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// API cache TTL: 24 hours (in milliseconds)
const API_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// ── Install: pre-cache app shell ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: evict all caches from previous versions ────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function isFresh(response) {
  if (!response) return false;
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true; // treat entries without timestamp as fresh
  return Date.now() - Number(cachedAt) < API_CACHE_TTL_MS;
}

async function cacheApiResponse(request, response) {
  if (!response || response.status !== 200) return response;
  const cache = await caches.open(API_CACHE);
  // Clone response and inject a cache timestamp header
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', String(Date.now()));
  const stamped = new Response(await response.clone().arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
  cache.put(request, stamped);
  return response;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 1. API — Network-First with 24h stale cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => cacheApiResponse(request, response))
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached && isFresh(cached)) return cached;
          // Expired or missing — return a structured offline error
          return new Response(
            JSON.stringify({ offline: true, error: 'Network unavailable. Cached data may be outdated.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. App Shell & Static Assets — Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Offline + navigation request → serve cached app shell
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cached;
        });

      // Return cached immediately; revalidate in background
      return cached || networkFetch;
    })
  );
});
