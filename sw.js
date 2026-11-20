/* Caderneta de Florescimento — funciona sem internet depois da primeira abertura.
   v2.4: o app em ambiente de TESTE registra este arquivo como "sw.js?teste=1". Nesse caso o cache
   offline tem outro prefixo e só os caches desse prefixo são limpos: a Caderneta de teste e a de
   uso real podem ficar no mesmo site sem uma apagar o cache (o uso sem internet) da outra. */
const TESTE = new URL(self.location.href).searchParams.has("teste");
const PREFIXO = TESTE ? "cadteste-" : "caderneta-";
const VERSAO = PREFIXO + "4d5327bbe3";   /* carimbo dos arquivos do app: ferramentas/carimbar_sw.py */
const APP = ["./", "index.html", TESTE ? "manifest-teste.webmanifest" : "manifest.webmanifest", "icone.svg", "icone-180.png", "icone-192.png", "icone-512.png", "icone-mascara-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(APP)));
});
self.addEventListener("message", e => { if (e.data === "pular-espera") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIXO) && k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(PREFIXO + "fontes").then(c => c.match(r).then(m => m || fetch(r).then(resp => { c.put(r, resp.clone()); return resp; }).catch(() => m))));
    return;
  }
  if (u.origin !== self.location.origin) return;
  if (r.mode === "navigate") {
    e.respondWith(caches.match("index.html").then(m => m || fetch(r)));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r)));
});
