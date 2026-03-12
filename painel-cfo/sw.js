// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Service Worker (PWA + Cache)
// ═══════════════════════════════════════════════

const CACHE_NAME = 'cfo-dashboard-v2-v3'; // Bumped to clear broken config.js cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/views.css',
    // config.js intentionally excluded — contains credentials, must always be network-fresh
    '/js/app.js',
    '/js/auth.js',
    '/js/db.js',
    '/js/offline.js',
    '/js/state.js',
    '/js/charts.js',
    '/js/utils.js',
    '/js/views/overview.js',
    '/js/views/dre.js',
    '/js/views/annual.js',
    '/js/views/lancamentos.js',
    '/js/views/projecoes.js',
    '/js/views/relatorios.js',
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch — Network-first for API, Cache-first for static
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip Supabase API and CDN requests
    if (url.hostname.includes('supabase') ||
        url.hostname.includes('cdn') ||
        url.hostname.includes('unpkg') ||
        url.hostname.includes('cdnjs') ||
        url.hostname.includes('fonts')) {
        return;
    }

    // config.js must always come from network (contains build-time credentials)
    if (url.pathname === '/js/config.js') return;

    // Cache-first for static assets
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                const fetched = fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => cached);

                return cached || fetched;
            })
    );
});
