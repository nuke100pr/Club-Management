// components/Navbar.js
"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAuthToken } from "@/utils/auth";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  
  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [authToken]);
  
  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl">
              Your Logo
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                Home
              </Link>
              <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                About
              </Link>
              <Link href="/services" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                Services
              </Link>
              <Link href="/contact" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                Contact
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
