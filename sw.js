// ============================================================
// sw.js — service worker（PWA 离线壳）
// 仅缓存本地静态壳，便于「添加到主屏」后离线打开关系图。
// 不缓存任何会话数据、不缓存 API 响应、不触网。
// 边界：缓存失败不影响在线使用；卸载或更新版本号即清旧缓存。
// ============================================================

const CACHE = 'lingtai-ifm-matrix-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './src/app.js',
  './src/view.js',
  './src/print.js',
  './src/i18n.js',
  './src/ifmNodes.js',
  './src/schema.js',
  './src/aiAdapter.js',
  './src/lingtaiFlow.js',
  './assets/icon.svg',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // 只接管同源 GET；放过 API（跨域 / POST）等一切其它请求
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).catch(() => caches.match('./index.html')))
  );
});
