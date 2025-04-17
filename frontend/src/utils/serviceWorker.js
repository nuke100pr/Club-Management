// utils/serviceWorker.js
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/ban-checker-sw.js')
          .then(function(registration) {
            console.log('Ban Checker Service Worker registered with scope:', registration.scope);
          })
          .catch(function(error) {
            console.error('Ban Checker Service Worker registration failed:', error);
          });
        
        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.type === 'USER_BANNED') {

            // Delete auth token
            localStorage.removeItem('auth_token');
            
            // Redirect to login page
            window.location.href = '/login';
            
            // Optionally show a message
            alert(event.data.payload.message);
          }
        });
      });
    }
  }