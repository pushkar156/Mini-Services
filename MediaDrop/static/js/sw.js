/**
 * MediaDrop - Service Worker
 * Handles offline caching of static assets to make the app installable and fast.
 * Bypasses all dynamic API requests.
 *
 * Cache strategy is deliberately split. The page shell and its scripts use network-first,
 * because a cache-first shell pins a browser to whatever build it first saw: an earlier
 * version of this worker served stale HTML/JS indefinitely, so visitors kept running a
 * pre-carousel frontend long after the fix shipped. Images and fonts stay cache-first
 * since they are immutable in practice.
 *
 * Bump CACHE_NAME on every release that changes the shell.
 */

const CACHE_NAME = 'mediadrop-v3';
const ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/script.js',
  '/static/js/vendor/jszip.min.js',
  '/static/images/logo.png',
  '/static/images/icon-192.png',
  '/static/images/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll rejects the whole batch if any single request fails, which would leave the
      // old worker in place. Cache each asset independently instead.
      return Promise.all(
        ASSETS.map((asset) => cache.add(asset).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * True for the page shell and the code that renders it - anything whose staleness would
 * hide a deployed fix from the user.
 */
function isShellRequest(request, url) {
  if (request.mode === 'navigate') return true;
  if (url.origin !== self.location.origin) return false;
  return url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname === '/';
}

/** Serve from network, fall back to cache when offline. Refreshes the cache on success. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

/** Serve from cache, populating it on first miss. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (e) => {
  const request = e.request;

  // Exclude API requests from caching
  if (request.url.includes('/api/')) {
    return;
  }

  // Handle standard GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch (err) {
    return;
  }

  if (isShellRequest(request, url)) {
    e.respondWith(networkFirst(request));
  } else {
    e.respondWith(cacheFirst(request));
  }
});
