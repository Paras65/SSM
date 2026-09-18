// Cache version — bump this string on every production deploy to invalidate old caches
const CACHE_VERSION = 'ssm-pwa-v4';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// API cache TTL: 24 hours (in milliseconds)
const API_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/favicon.svg'
];

// ── Install: pre-cache static assets (manifest, icons) ───────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
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
          return new Response(
            JSON.stringify({ offline: true, error: 'Network unavailable. Cached data may be outdated.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. Navigation / HTML Requests — NETWORK-FIRST
  // Critical fix: Never serve stale index.html via Stale-While-Revalidate.
  // When online, always fetch fresh index.html with up-to-date chunk hashes.
  const isHtmlRequest = request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) ||
    url.pathname === '/' ||
    url.pathname === '/index.html';

  if (isHtmlRequest) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cached = await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
          return new Response(
            '<!DOCTYPE html><html><body><h1>सरस्वती शिशु मंदिर</h1><p>इंटरनेट कनेक्शन अनुपलब्ध है। कृपया नेटवर्क जांचें।</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Hashed Static Assets (/assets/*) — Cache-First
  // Hashed Vite assets are content-addressed and immutable
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Other Static Assets (manifest, icons, images) — Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
