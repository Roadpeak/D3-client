const useWebPush = (isAuthenticated) => {
    const [pushPermission, setPushPermission] = useState('default');
    const [isPushSubscribed, setIsPushSubscribed] = useState(false);
    const [showPushPrompt, setShowPushPrompt] = useState(false);

    const VAPID_PUBLIC_KEY = 'BKejhBqZqa4GnoAc7nFnQXtCTTbQBpMXjABBS_cMyk4RRpRkgOB6_52y2VQxObMi9XBvRyim7seUpvUm1HaoFms';
    const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.discoun3ree.com/api/v1';

    // Helper to get auth token
    const getAuthToken = () => {
        // Try cookie first (same as notificationService)
        const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        // Fallback to localStorage
        const localStorageToken = localStorage.getItem('token');

        return cookieToken || localStorageToken || '';
    };

    useEffect(() => {
        if ('Notification' in window) {
            setPushPermission(Notification.permission);
            checkPushSubscription();
        }
    }, [isAuthenticated]);

    // Register service worker
    useEffect(() => {
        if ('serviceWorker' in navigator && isAuthenticated) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => {
                    console.log('✅ Service Worker registered:', reg);
                })
                .catch(err => {
                    console.error('❌ Service Worker registration failed:', err);
                });
        }
    }, [isAuthenticated]);

    const checkPushSubscription = async () => {
        try {
            if (!isAuthenticated) return;

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsPushSubscribed(!!subscription);

            console.log('📊 Push subscription status:', !!subscription);

            // Show prompt if not subscribed and permission not denied
            if (!subscription && Notification.permission !== 'denied') {
                // Show prompt after 3 seconds to not be intrusive
                setTimeout(() => {
                    setShowPushPrompt(true);
                }, 3000);
            }
        } catch (error) {
            console.error('Error checking push subscription:', error);
        }
    };

    const enablePushNotifications = async () => {
        try {
            console.log('🔔 Starting push notification subscription...');

            // Request permission
            const result = await Notification.requestPermission();
            setPushPermission(result);
            console.log('📋 Notification permission:', result);

            if (result !== 'granted') {
                alert('Please allow notifications to stay updated');
                return false;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;
            console.log('✅ Service Worker ready');

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('✅ Push subscription created:', subscription);

            // Get auth token
            const token = getAuthToken();

            if (!token) {
                console.error('❌ No auth token found');
                alert('Authentication error. Please log in again.');
                return false;
            }

            console.log('✅ Auth token found');

            // Send subscription to backend
            const response = await fetch(`${API_BASE}/notifications/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(subscription)
            });

            console.log('📡 Backend response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Backend response:', result);

                setIsPushSubscribed(true);
                setShowPushPrompt(false);
                console.log('🎉 Push notifications enabled successfully!');

                // Show success message to user
                alert('Push notifications enabled! You\'ll now receive instant updates.');

                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Failed to save subscription:', response.status, errorData);
                alert('Failed to enable push notifications. Please try again.');
                return false;
            }
        } catch (error) {
            console.error('❌ Error enabling push notifications:', error);
            alert('Error enabling push notifications: ' + error.message);
            return false;
        }
    };

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    return {
        pushPermission,
        isPushSubscribed,
        showPushPrompt,
        setShowPushPrompt,
        enablePushNotifications
    };
};
