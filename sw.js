/* Service worker · Calculadora SITI
   Estrategia: red primero para el HTML (siempre la versión más nueva cuando hay señal),
   caché como respaldo sin conexión. Sube VERSION al publicar cambios grandes. */
const VERSION = "siti-calc-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(resp => {
      const copia = resp.clone();
      caches.open(VERSION).then(c => c.put(e.request, copia)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(r => r || caches.match("./index.html")))
  );
});
