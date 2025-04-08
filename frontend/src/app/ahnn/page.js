"use client";
import { useContext, useEffect } from "react";
import { useRootContext } from "@/contexts/userContext";

function InfoDisplay() {
  const { userData, updateUserData } = useRootContext();
    
  useEffect(() => {
    if(userData) {
      console.log(userData);
    }
  }, [userData]);
  
  // Check if userData exists before rendering
  if (!userData) {
    return <div className="info-display">Loading user data...</div>;
  }
  
  // Render your info data properly
  return (
    <div className="info-display">
      <h1>User Information</h1>
      {userData.clubs && (
        <div>
          <h2>Clubs</h2>
          <pre>{JSON.stringify(userData.clubs, null, 2)}</pre>
        </div>
      )}
      {userData.boards && (
        <div>
          <h2>Boards</h2>
          <pre>{JSON.stringify(userData.boards, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default InfoDisplay;