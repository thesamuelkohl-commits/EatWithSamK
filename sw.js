/* Minimal service worker — exists mainly so Chrome/Android will treat this
   site as an installable app (one of the PWA installability requirements).
   Also caches the app shell so it opens instantly (and works offline) once
   installed. Bump CACHE_NAME any time the core shell files change so old
   caches get cleaned up automatically. */

const CACHE_NAME = "eatwithsamk-shell-v1";
const SHELL_ASSETS = [
  "index.html",
  "css/style.css",
  "js/data.js",
  "js/common.js",
  "images/logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
