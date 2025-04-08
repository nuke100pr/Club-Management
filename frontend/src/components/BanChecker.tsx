'use client';

import { useEffect } from 'react';
import { fetchUserData } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { cookies } from 'next/headers';

export default function BanChecker() {
  const router = useRouter();

  useEffect(() => {
    async function checkBanStatus() {
      try {
        // Get user ID from your auth utility
        const { userId } = await fetchUserData();
        
        if (!userId) return;
        
        // Check if user is banned
        const response = await fetch(`http://localhost:5000/users/users/${userId}/details`);
        const userData = await response.json();
        
        if (userData.status === "banned") {
          // Remove auth_token cookie
          document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          // Redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking ban status:', error);
      }
    }
    
    // Check immediately when component mounts
    checkBanStatus();
    
    // Optionally, set up a periodic check
    const intervalId = setInterval(checkBanStatus, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [router]);
  
  // This component doesn't render anything
  return null;
}