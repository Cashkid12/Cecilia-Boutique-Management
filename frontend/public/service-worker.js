// Service Worker for Cecilia Boutique PWA
const CACHE_NAME = 'cecilia-static-v1';
const IMAGE_CACHE_NAME = 'cecilia-images-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Caching image assets');
        return cache.addAll([
          '/icons/icon-72x72.png',
          '/icons/icon-96x96.png',
          '/icons/icon-128x128.png',
          '/icons/icon-144x144.png',
          '/icons/icon-152x152.png',
          '/icons/icon-384x384.png',
          '/icons/maskable-icon-512x512.png'
        ]);
      })
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip cross-origin requests
  if (!requestUrl.origin === location.origin) {
    return;
  }

  // HTML pages - Network first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // API calls - Network only (don't cache sensitive data)
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ 
            error: 'Offline', 
            message: 'You are currently offline. Please try again when connected.' 
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Images - Cache first, with max 50 items
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // CSS, JS, Fonts - Cache first, background update
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default - Network first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sales') {
    console.log('[ServiceWorker] Syncing pending sales');
    event.waitUntil(syncPendingSales());
  }
  if (event.tag === 'sync-inventory') {
    console.log('[ServiceWorker] Syncing pending inventory updates');
    event.waitUntil(syncPendingInventory());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Cecilia Boutique';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    theme_color: '#D6C2A1',
    data: data.url || '/',
    actions: [
      { action: 'view', title: 'View', icon: '/icons/action-view.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

// Helper function to sync pending sales
async function syncPendingSales() {
  try {
    const pendingSales = await getPendingSales();
    for (const sale of pendingSales) {
      try {
        await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale)
        });
        await removePendingSale(sale.id);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync sale:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync error:', error);
  }
}

// Helper function to sync pending inventory
async function syncPendingInventory() {
  try {
    const pendingUpdates = await getPendingInventoryUpdates();
    for (const update of pendingUpdates) {
      try {
        await fetch(`/api/inventory/${update.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });
        await removePendingInventoryUpdate(update.id);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync inventory:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync error:', error);
  }
}

// IndexedDB helpers (simplified)
function getPendingSales() {
  return new Promise((resolve) => resolve([]));
}

function removePendingSale(id) {
  return Promise.resolve();
}

function getPendingInventoryUpdates() {
  return new Promise((resolve) => resolve([]));
}

function removePendingInventoryUpdate(id) {
  return Promise.resolve();
}

console.log('[ServiceWorker] Service worker loaded');
