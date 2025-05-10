"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuthToken } from "@/utils/auth";

const XYZPage = () => {
  const router = useRouter();
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  if (!authToken) {
    return;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Only IIT Ropar (@iitrpr.ac.in) IDs are Allowed
        </h1>
        <p className="text-gray-600 mt-2">Please use your institutional email to proceed.</p>
        
        {/* Centered Button */}
        <div className="mt-6 w-full flex justify-center">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Go to Login <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default XYZPage;
