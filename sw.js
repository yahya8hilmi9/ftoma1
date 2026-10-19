/* FATOUMA service worker: الموقع كيخدم حتى مع إنترنت ضعيف. بيانات Supabase ما كتتخزنش أبداً. */
const CACHE = 'fatouma-v1';
const SHELL = ['./', 'index.html', 'css/base.css', 'img/icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || /admin/.test(u.pathname)) return; // لا نلمس Supabase ولا الـ admin
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
