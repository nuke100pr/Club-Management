export default class NotificationServiceWorker {
    constructor() {
      this.worker = null;
      this.isRegistered = false;
      this.permissionStatus = 'default';
      
      // Check if Notification is available (for SSR compatibility)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        this.permissionStatus = Notification.permission;
      }
    }
  
    // Request notification permission
    async requestNotificationPermission() {
      if (typeof window === 'undefined' || !("Notification" in window)) {
        console.error("This browser does not support notifications");
        return false;
      }
      
      // Explicitly request permission - this will show the browser permission dialog
      console.log("Requesting notification permission...");
      try {
        const permission = await Notification.requestPermission();
        console.log("Permission request result:", permission);
        this.permissionStatus = permission;
        return permission === "granted";
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
      }
    }
  
    // Register the service worker
    async register() {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported in this browser or environment');
      }
      
      if (this.isRegistered) {
        return this.worker;
      }
  
      try {
        const registration = await navigator.serviceWorker.register('/notification-service-worker.js');
        this.worker = registration.active || registration.installing || registration.waiting;
        this.isRegistered = true;
        
        console.log('Notification service worker registered');
        
        // Wait for the service worker to be ready
        if (this.worker && this.worker.state !== 'activated') {
          await new Promise((resolve) => {
            if (!this.worker) {
              resolve();
              return;
            }
            
            this.worker.addEventListener('statechange', () => {
              if (this.worker && this.worker.state === 'activated') {
                resolve();
              }
            });
          });
        }
        
        // Set up message event listener
        navigator.serviceWorker.addEventListener('message', this.onMessage);
        
        // Wait for controller to be ready
        await this.waitForServiceWorkerController();
        
        // Update the permission status in the service worker
        this.updatePermissionStatus();
        
        // Start polling if permission is granted
        if (this.permissionStatus === 'granted') {
          this.startPolling();
        } else {
          console.warn("Notification permission not granted, notifications will not be shown");
        }
        
        return this.worker;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        throw error;
      }
    }
  
    // Wait for the service worker controller to be ready
    async waitForServiceWorkerController() {
      if (navigator.serviceWorker.controller) {
        return;
      }
      
      console.log("Waiting for service worker controller...");
      return new Promise((resolve) => {
        // This will fire when the service worker takes control
        const controllerChangeHandler = () => {
          console.log("Service worker controller is now ready");
          navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
          resolve();
        };
        
        navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
        
        // Set a timeout in case controllerchange doesn't fire
        setTimeout(() => {
          if (!navigator.serviceWorker.controller) {
            console.warn("Service worker controller not available after timeout");
            navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
            resolve();
          }
        }, 3000);
      });
    }
  
    // Update permission status in the service worker
    updatePermissionStatus() {
      if (!navigator.serviceWorker.controller) {
        console.warn("Cannot update permission status: no controller");
        return;
      }
      
      console.log("Updating permission status in service worker:", this.permissionStatus);
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_PERMISSION_STATUS',
        data: { permission: this.permissionStatus }
      });
    }
  
    // Start polling for notifications
    startPolling() {
      if (!this.isRegistered) {
        throw new Error('Service worker not registered');
      }
      
      if (!navigator.serviceWorker.controller) {
        console.warn("Cannot start polling: no controller");
        return;
      }
      
      // Only start polling if permission is granted
      if (this.permissionStatus === 'granted') {
        console.log("Starting notification polling");
        navigator.serviceWorker.controller.postMessage({
          type: 'START_POLLING'
        });
      } else {
        console.warn('Cannot start notification polling: permission not granted');
      }
    }
    
    // Request permission and start polling if granted
    async requestPermissionAndStartPolling() {
      console.log("Requesting notification permission...");
      const granted = await this.requestNotificationPermission();
      
      if (granted) {
        console.log("Permission granted, updating status and starting polling");
        this.updatePermissionStatus();
        this.startPolling();
      } else {
        console.warn('Notification permission denied by user');
      }
    }
  
    // Stop polling for notifications
    stopPolling() {
      if (!this.isRegistered) {
        return;
      }
      
      if (!navigator.serviceWorker.controller) {
        console.warn("Cannot stop polling: no controller");
        return;
      }
      
      console.log("Stopping notification polling");
      navigator.serviceWorker.controller.postMessage({
        type: 'STOP_POLLING'
      });
    }
  
    // Process messages from the service worker
    onMessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'NEW_NOTIFICATIONS':
          console.log("Received new notifications from service worker", data);
          // Custom event for new notifications
          const notificationEvent = new CustomEvent('newNotifications', {
            detail: data
          });
          window.dispatchEvent(notificationEvent);
          break;
        
        default:
          console.log('Unknown message from service worker:', type);
      }
    }
  
    // Clean up
    cleanup() {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', this.onMessage);
      }
      this.stopPolling();
    }
}