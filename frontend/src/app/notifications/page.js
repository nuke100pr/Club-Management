// pages/user-notifications.js
"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import NotificationServiceWorker from "../../utils/notificationServiceWorker";
import { getAuthToken } from "@/utils/auth";

export default function UserNotifications() {
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceWorker, setServiceWorker] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    // Initialize service worker
    const notificationSW = new NotificationServiceWorker();
    setServiceWorker(notificationSW);

    // Listen for new notifications
    const handleNewNotifications = (event) => {
      fetchUserNotifications();
    };

    window.addEventListener("newNotifications", handleNewNotifications);

    return () => {
      window.removeEventListener("newNotifications", handleNewNotifications);
      if (notificationSW) {
        notificationSW.cleanup();
        notificationSW.stopPolling();
      }
    };
  }, []);

  const startMonitoring = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setError(null);

    try {
      await serviceWorker.register();
      serviceWorker.setUserId(userId);
      serviceWorker.startPolling();
      fetchUserNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const stopMonitoring = () => {
    if (serviceWorker) {
      serviceWorker.stopPolling();
    }
  };

  const fetchUserNotifications = async () => {
    if (!userId || !authToken) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/user-notifications/user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch notifications");
      }

      setNotifications(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    if (!authToken) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user-notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark notification as read");
      }

      // Update notifications list
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteNotification = async (id) => {
    if (!authToken) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user-notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete notification");
      }

      // Update notifications list
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>User Notifications</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">User Notifications</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow"
          />
          <button
            onClick={startMonitoring}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Monitoring
          </button>
          <button
            onClick={stopMonitoring}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Stop Monitoring
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Notifications</h2>
        <button
            onClick={fetchUserNotifications}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Refresh
          </button>
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`border p-4 rounded shadow-sm ${
                notification.read ? "bg-gray-50" : "bg-white border-blue-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3
                  className={`font-bold ${
                    !notification.read ? "text-blue-600" : ""
                  }`}
                >
                  {notification.title}
                </h3>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
