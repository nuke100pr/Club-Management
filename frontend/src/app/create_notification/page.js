// pages/create-notification.js
"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getAuthToken } from "@/utils/auth";

export default function CreateNotification() {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    userId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if(!authToken) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/notification-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(notification),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create notification');
      }

      setSuccess('Notification created successfully!');
      setNotification({
        title: '',
        message: '',
        userId: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Create Notification</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-6">Create Notification</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="userId" className="block text-gray-700 font-bold mb-2">
            User ID:
          </label>
          <input
            type="text"
            id="userId"
            name="userId"
            value={notification.userId}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={notification.title}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 font-bold mb-2">
            Message:
          </label>
          <textarea
            id="message"
            name="message"
            value={notification.message}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Creating...' : 'Create Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}
