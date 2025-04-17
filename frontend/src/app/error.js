// app/error.js (or app/error.jsx or app/error.tsx)
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="p-8 rounded-lg shadow-lg bg-white max-w-md w-full">
        <div className="mb-6 text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">Something went wrong!</h1>
        </div>
        
        <p className="mb-6 text-gray-600">
          We couldn't fetch the data you requested. This might be due to a network issue or our server is experiencing problems.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full"
          >
            Try again
          </button>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-center w-full"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}