// Service Worker for Offline Tasks PWA
// This will be enhanced by Workbox during build

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Note: In production, Workbox will inject the manifest here

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST || []);

// API routes - NetworkFirst with fallback to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new BackgroundSyncPlugin('task-sync', {
        maxRetentionTime: 24 * 60 // 24 hours
      })
    ],
    networkTimeoutSeconds: 10
  })
);

// Active Storage files - CacheFirst
registerRoute(
  ({ url }) => url.pathname.startsWith('/rails/active_storage/'),
  new CacheFirst({
    cacheName: 'files-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Static assets - StaleWhileRevalidate
registerRoute(
  ({ request }) => request.destination === 'script' || 
                   request.destination === 'style' ||
                   request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'static-assets'
  })
);

// Background sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'task-sync') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // This will be handled by the main app's sync logic
  // The service worker just triggers the sync
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_TASKS' });
  });
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

