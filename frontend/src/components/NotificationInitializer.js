"use client";

import { useEffect, useState } from "react";
import NotificationServiceWorker from "@/utils/notificationServiceWorker";
import { getAuthToken } from "@/utils/auth";

export default function NotificationInitializer() {
  const [notificationStatus, setNotificationStatus] = useState("pending");
  const [showBanner, setShowBanner] = useState(false);
  const [notificationWorker, setNotificationWorker] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  // Check if notifications are supported
  useEffect(function () {
    if (!("Notification" in window)) {
      setNotificationStatus("unsupported");
      return;
    }

    // Check current permission status
    const currentPermission = Notification.permission;
    setNotificationStatus(currentPermission);

    // If permission is already granted, initialize the service worker
    if (currentPermission === "granted") {
      initializeNotifications();
    } else if (currentPermission === "default") {
      // Show banner after a short delay to allow page to load first
      const timer = setTimeout(function () {
        setShowBanner(true);
      }, 2000);
      return function () {
        return clearTimeout(timer);
      };
    }
  }, []);

  // Initialize notification service worker
  async function initializeNotifications() {
    if (!authToken) {
      return;
    }
    
    try {
      const worker = new NotificationServiceWorker();
      await worker.register({
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      setNotificationWorker(worker);

      // Update status after registration
      setNotificationStatus(Notification.permission);

      // Hide banner if it was showing
      setShowBanner(false);
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  }

  // Request notification permission
  async function requestPermission() {
    if (!authToken) {
      return;
    }
    
    try {
      const worker = new NotificationServiceWorker();
      const granted = await worker.requestNotificationPermission({
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (granted) {
        await worker.register({
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
        setNotificationWorker(worker);
        setNotificationStatus("granted");
      } else {
        setNotificationStatus("denied");
      }

      // Hide banner in either case
      setShowBanner(false);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }

  // If the permission is denied, we'll need to show an info message
  const showDeniedInfo = notificationStatus === "denied";

  return (
    <>
      {/* Permission request banner */}
      {showBanner && (
        <div className="fixed bottom-16 left-0 right-0 bg-blue-500 text-white p-4 z-50 flex justify-between items-center">
          <p>Enable notifications to stay updated</p>
          <div className="flex gap-2">
            <button
              onClick={function () {
                return setShowBanner(false);
              }}
              className="px-3 py-1 bg-blue-600 rounded"
            >
              Later
            </button>
            <button
              onClick={requestPermission}
              className="px-3 py-1 bg-white text-blue-600 rounded"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Info message if notifications are denied */}
      {showDeniedInfo && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white p-2 rounded-md text-sm max-w-xs z-50 shadow-lg opacity-90">
          <p>
            Notifications are disabled. Please enable them in your browser
            settings for this site.
          </p>
          <button
            onClick={function () {
              return setNotificationStatus("pending");
            }}
            className="text-xs text-blue-300 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
