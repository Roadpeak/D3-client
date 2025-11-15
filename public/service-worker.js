// public/service-worker.js
// Place this file in your React app's public folder
// It will be served at https://yourdomain.com/service-worker.js

console.log('Service Worker loaded');

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Listen for push notifications from your backend
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    let data = {
        title: 'New Notification',
        body: 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/badge-96x96.png',
        url: '/'
    };

    // Parse the notification data from your backend
    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }

    // Show the notification
    const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-96x96.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: 'Open'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    // Handle action button clicks
    if (event.action === 'close') {
        return; // Just close the notification
    }

    // Open or focus the app
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // If a window is already open, focus it
            for (let client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle notification close (optional - for analytics)
self.addEventListener('notificationclose', (event) => {
    console.log('Notification was closed:', event);
    // You can track which notifications users close without clicking
});