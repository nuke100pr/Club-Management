// context/UserContext.js
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchUserData } from "../utils/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        const authData = await fetchUserData();
        setIsSuperAdmin(authData.isSuperAdmin);
        
        // Check if we have cached data
        const cachedUserData = sessionStorage.getItem('userData');
        if (cachedUserData) {
          setUserData(JSON.parse(cachedUserData));
          setLoading(false);
          return;
        }

        if (authData.userId) {
          const response = await fetch(`http://localhost:5000/users/users/${authData.userId}/details`);
          if (!response.ok) throw new Error('Failed to fetch user details');
          
          const data = await response.json();
          setUserData(data);
          // Cache the data
          sessionStorage.setItem('userData', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  // Function to update user data (can be called after profile updates)
  const updateUserData = (newData) => {
    setUserData(newData);
    sessionStorage.setItem('userData', JSON.stringify(newData));
  };

  return (
    <UserContext.Provider value={{ userData, loading, error, isSuperAdmin, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);