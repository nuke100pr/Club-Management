// public/notification-service-worker.js
const POLL_INTERVAL = 5000; // 5 seconds
let userId = null; // Will be set from the main application
let isPolling = false;
let pollTimer = null;

// Listen for messages from the main application
self.addEventListener("message", (event) => {
  const { type, data } = event.data;
  console.log("Service worker received message:", type, data);

  switch (type) {
    case "START_POLLING":
      // Use the userId passed from main application
      if (data && data.userId) {
        userId = data.userId;
        startPolling();
      } else {
        console.error(
          "Service worker: Cannot start polling - missing user ID in message"
        );
      }
      break;

    case "STOP_POLLING":
      stopPolling();
      break;

    case "REFRESH_USER_DATA":
      // Update the user ID when it changes
      if (data && data.userId) {
        console.log("Service worker: Updating user ID:", data.userId);
        userId = data.userId;
      } else {
        console.warn(
          "Service worker: Received REFRESH_USER_DATA without userId"
        );
      }
      break;

    default:
      console.log("Service worker: Unknown message type", type);
  }
});

// Start polling for notifications
function startPolling() {
  if (isPolling) return;

  if (!userId) {
    console.error(
      "Service worker: Cannot start polling - no user ID available"
    );
    return;
  }

  isPolling = true;
  console.log(
    "Service worker: Starting notification polling for user ID:",
    userId
  );

  // Immediately check for notifications
  checkAndTransferNotifications();

  // Set up interval for polling
  pollTimer = setInterval(() => {
    checkAndTransferNotifications();
  }, POLL_INTERVAL);
}

// Stop polling for notifications
function stopPolling() {
  if (!isPolling) return;

  isPolling = false;
  console.log("Service worker: Stopping notification polling");

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// Check and transfer notifications
async function checkAndTransferNotifications() {
  if (!userId) {
    console.error(
      "Service worker: Cannot check notifications - no user ID available"
    );
    return;
  }

  try {
    console.log("Checking for notifications for user:", userId);
    const response = await fetch(
      `http://localhost:5000/api/user-notifications/transfer/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    console.log("Transfer API response:", result);

    if (result.success && result.data.transferred > 0) {
      console.log(
        `Service worker: Transferred ${result.data.transferred} notifications:`,
        result.data.notifications
      );

      // Always notify the main application about new notifications
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "NEW_NOTIFICATIONS",
            data: {
              count: result.data.transferred,
              notifications: result.data.notifications,
            },
          });
        });
      });

      // Try to show notifications for each transferred notification
      result.data.notifications.forEach((notification) => {
        console.log("Attempting to show notification:", notification);
        showNotification(notification);
      });
    } else {
      console.log("No new notifications to transfer");
    }
  } catch (error) {
    console.error("Service worker: Error transferring notifications", error);
  }
}

// Function to show push notifications
async function showNotification(notification) {
  try {
    const title = notification.title || "New Notification";
    const options = {
      body: notification.message || notification.content || "",
      icon: notification.icon || "/notification-icon.png",
      data: notification,
      requireInteraction: true, // This makes the notification stay until user interacts with it
    };

    console.log(
      "Showing notification with title:",
      title,
      "and options:",
      options
    );

    await self.registration.showNotification(title, options);
    console.log("✅ Notification display command executed successfully");
  } catch (error) {
    console.error("❌ Error showing notification:", error);
  }
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);
  const notification = event.notification;
  const notificationData = notification.data;

  // Close the notification
  notification.close();

  // Open the app or specific page based on notification data
  if (notificationData && notificationData.url) {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        // Check if there's already a window open
        const client = clients.find((c) => c.visibilityState === "visible");
        if (client) {
          return client
            .navigate(notificationData.url)
            .then((client) => client.focus());
        }
        // Otherwise open a new window
        return self.clients.openWindow(notificationData.url);
      })
    );
  }
});

// Install event
self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service worker activated");

  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});
