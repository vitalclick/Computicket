// Service worker for Computicket web push.
// Receives a notification payload from FCM and renders it; on click,
// opens (or focuses) the deep-link path under the site's origin.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Computicket', body: event.data ? event.data.text() : '' };
  }
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || 'Computicket';
  const body = notification.body || data.body || '';
  const deepLink = data.deepLink || '/';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: data.tag || undefined,
      data: { deepLink },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.deepLink) || '/';
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const origin = self.location.origin;
      const url = new URL(target, origin).toString();
      for (const client of allClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
      return null;
    })(),
  );
});
