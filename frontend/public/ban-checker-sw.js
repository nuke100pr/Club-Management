// public/ban-checker-sw.js
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Ban Checker Service Worker installed');
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    console.log('Ban Checker Service Worker activated');
  });
  
  self.addEventListener('fetch', (event) => {
    // Only intercept API requests
    if (!event.request.url.includes('/api/')) {
      return;
    }
  
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          // Check if user is banned after each API request
          try {
            const cache = await caches.open('auth-cache');
            const authData = await cache.match('auth-data');
            
            if (authData) {
              const userData = await authData.json();
              checkIfBanned(userData.userId);
            }
          } catch (error) {
            console.error('Error checking ban status:', error);
          }
          
          return response;
        })
    );
  });
  
  async function checkIfBanned(userId) {
    try {
      const response = await fetch(`http://localhost:5000/users/users/${userId}/details`);
      const userData = await response.json();
      
      if (userData.status === "banned") {
        // Clear auth token from localStorage
        clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'USER_BANNED',
              payload: {
                message: 'Your account has been banned.'
              }
            });
          });
        });
      }
    } catch (error) {
      console.error('Error fetching user ban status:', error);
    }
  }