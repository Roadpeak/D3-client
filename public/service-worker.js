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
        url: '/',
        type: 'general'
    };

    // Parse the notification data from your backend
    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }

    // Determine notification actions based on type
    let actions = [];

    switch(data.type) {
        case 'booking_confirmed':
            actions = [
                { action: 'view-booking', title: 'View Details' },
                { action: 'add-calendar', title: 'Add to Calendar' }
            ];
            break;

        case 'booking_rescheduled':
            actions = [
                { action: 'view-booking', title: 'View Details' },
                { action: 'add-calendar', title: 'Add to Calendar' }
            ];
            break;

        case 'booking_cancelled':
            actions = [
                { action: 'view-booking', title: 'View Details' },
                { action: 'book-again', title: 'Book Again' }
            ];
            break;

        case 'new_message':
            actions = [
                { action: 'view-message', title: 'View Message' },
                { action: 'close', title: 'Close' }
            ];
            break;

        case 'new_review':
        case 'review_reply':
            actions = [
                { action: 'view-review', title: 'View Review' },
                { action: 'close', title: 'Close' }
            ];
            break;

        case 'new_follower':
            actions = [
                { action: 'view-profile', title: 'View Profile' },
                { action: 'close', title: 'Close' }
            ];
            break;

        default:
            actions = [
                { action: 'open', title: 'Open' },
                { action: 'close', title: 'Close' }
            ];
    }

    // Show the notification
    const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-96x96.png',
        vibrate: [200, 100, 200],
        tag: data.tag || data.type || 'general',
        requireInteraction: data.requireInteraction || false,
        data: {
            url: data.url || '/',
            type: data.type || 'general',
            bookingId: data.bookingId,
            offerId: data.offerId,
            serviceId: data.serviceId,
            storeId: data.storeId,
            messageId: data.messageId,
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: actions
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    console.log('Action:', event.action);
    console.log('Notification data:', event.notification.data);

    event.notification.close();

    // Handle action button clicks
    if (event.action === 'close') {
        return; // Just close the notification
    }

    const notificationData = event.notification.data;
    const notificationType = notificationData.type;
    let urlToOpen = '/';

    // Determine URL based on action and notification type
    switch(event.action) {
        case 'view-booking':
            if (notificationData.bookingId) {
                urlToOpen = `/booking-details/${notificationData.bookingId}`;
            } else {
                urlToOpen = '/profile/bookings';
            }
            break;

        case 'add-calendar':
            // For calendar action, still open booking details
            if (notificationData.bookingId) {
                urlToOpen = `/booking-details/${notificationData.bookingId}`;
            } else {
                urlToOpen = '/profile/bookings';
            }
            break;

        case 'book-again':
            // Route to the original offer or service booking page
            if (notificationData.offerId) {
                urlToOpen = `/booking/offer/${notificationData.offerId}`;
            } else if (notificationData.serviceId) {
                urlToOpen = `/booking/service/${notificationData.serviceId}`;
            } else {
                urlToOpen = '/hotdeals';
            }
            break;

        case 'view-message':
            if (notificationData.storeId) {
                urlToOpen = `/chat/Store/${notificationData.storeId}`;
            } else if (notificationData.messageId) {
                urlToOpen = `/chat?messageId=${notificationData.messageId}`;
            } else {
                urlToOpen = '/chat';
            }
            break;

        case 'view-review':
            if (notificationData.storeId) {
                urlToOpen = `/store/${notificationData.storeId}`;
            } else {
                urlToOpen = '/profile/bookings';
            }
            break;

        case 'view-profile':
            if (notificationData.storeId) {
                urlToOpen = `/store/${notificationData.storeId}`;
            } else {
                urlToOpen = '/profile/followed-stores';
            }
            break;

        default:
            // No action or 'open' action - use default routing based on type
            switch(notificationType) {
                case 'booking_confirmed':
                case 'booking_rescheduled':
                case 'booking_cancelled':
                    if (notificationData.bookingId) {
                        urlToOpen = `/booking-details/${notificationData.bookingId}`;
                    } else {
                        urlToOpen = '/profile/bookings';
                    }
                    break;

                case 'new_message':
                    if (notificationData.storeId) {
                        urlToOpen = `/chat/Store/${notificationData.storeId}`;
                    } else {
                        urlToOpen = '/chat';
                    }
                    break;

                case 'new_review':
                case 'review_reply':
                    if (notificationData.storeId) {
                        urlToOpen = `/store/${notificationData.storeId}`;
                    } else {
                        urlToOpen = '/profile/bookings';
                    }
                    break;

                case 'new_follower':
                    if (notificationData.storeId) {
                        urlToOpen = `/store/${notificationData.storeId}`;
                    } else {
                        urlToOpen = '/profile/followed-stores';
                    }
                    break;

                default:
                    // Use URL from notification data if provided
                    urlToOpen = notificationData.url || '/';
            }
    }

    console.log('Opening URL:', urlToOpen);

    // Open or focus the app
    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Try to find an existing window to reuse
            for (let client of clientList) {
                if ('focus' in client) {
                    // Navigate the client to the new URL and focus it
                    return client.focus().then(() => {
                        if ('navigate' in client) {
                            return client.navigate(urlToOpen);
                        }
                    });
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