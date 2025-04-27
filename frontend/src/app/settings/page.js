"use client";
import { useState, useEffect } from "react";
import { Container, Typography, Box, useTheme, Paper } from "@mui/material";
import ThemeToggle from "../../components/themeToggle";
import { fetchUserData, getAuthToken } from "../../utils/auth"; // Assuming this is the correct path

// Import our new components
import UserProfileCard from "../../components/settings/UserProfileCard";
import PositionsAndBadges from "../../components/settings/PositionsAndBadges";
import AccountSettings from "../../components/settings/AccountSettings";

export default function SettingsPage() {
 
  const [authToken, setAuthToken] = useState(null);
  useEffect(() => {
     const ff = async () => {
        const nn = await getAuthToken();
        setAuthToken(nn);
     };
     ff();
  }, [])
  
  const theme = useTheme();
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    email: "loading@example.com",
    department: "Loading...",
    status: "Loading...",
    photoUrl: "/api/placeholder/150/150",
  });
  const [userBadges, setUserBadges] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [boardId, setBoardId] = useState("");
  const [clubId, setClubId] = useState(null);
  const [userPors, setUserPors] = useState([]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await fetchUserData();
        if (userData) {
          setUserId(userData.userId);
          setUserRole(userData.userRole || "member");
          setBoardId(userData.boardId || "");
          setClubId(userData.clubId);
          
          console.log(userData);
          
          // Set initial user profile with basic data
          setUserProfile(prev => ({
            ...prev,
            name: userData.userData?.name || "User",
            email: userData.userData?.email || "user@example.com",
            department: userData.userRole === "board_admin" ? "Board Administration" : 
                       userData.userRole === "club_admin" ? "Club Management" : "Member",
            status: "Available",
          }));
          
          // Fetch more detailed user information
          if (userData.userId) {
            fetchUserDetails(userData.userId);
            fetchUserPors(userData.userId);
          }
          
          // Fetch badges with the real userId
          fetchUserBadges(userData.userId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      console.log("Fetching detailed user information for:", userId);
      const response = await fetch(
        `http://localhost:5000/users/users/${userId}/details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include any auth headers if needed
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }

      const detailedUserData = await response.json();
      console.log("Detailed user data:", detailedUserData);
      
      // Update user profile with the detailed information
      setUserProfile(prev => ({
        ...prev,
        name: detailedUserData.name || prev.name,
        email: detailedUserData.email_id || prev.email,
        status: detailedUserData.status || prev.status,
        photoUrl: detailedUserData.profile_image?.filename || prev.photoUrl,
        // Add any additional fields from the detailed API response
      }));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchUserPors = async (userId) => {
    try {
      console.log("Fetching PORs for user:", userId);
      const response = await fetch(
        `http://localhost:5000/por2/por/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include any auth headers if needed
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user PORs: ${response.status}`);
      }

      const data = await response.json();
      console.log("User PORs data:", data);
      setUserPors(data);
    } catch (error) {
      console.error("Error fetching user PORs:", error);
    }
  };

  const fetchUserBadges = async (userId) => {
    try {
      console.log("Fetching badges for user:", userId);
      const response = await fetch(
        `http://localhost:5000/badges/users/${userId}/badges/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include any auth headers that Postman is using
            // 'Authorization': 'Bearer your-token-here',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch badges: ${response.status}`);
      }

      const data = await response.json();
      console.log("Badges data:", data);
      setUserBadges(data);
    } catch (error) {
      console.error("Error fetching user badges:", error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        transition: "background-color 0.3s ease"
      }}
    >
      <Container maxWidth="md">
        {/* Header section with title and theme toggle - restructured to give more space */}
        <Box sx={{ my: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" color="text.primary">Settings</Typography>
          </Box>
          
          {/* Separated theme toggle with more space */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" color="text.primary">Appearance</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }} color="text.secondary">
                Dark Mode
              </Typography>
              <ThemeToggle />
            </Box>
          </Paper>
        </Box>

        {/* User Profile Component */}
        <UserProfileCard 
          userProfile={userProfile}
          userId={userId}
          setUserProfile={setUserProfile}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* Positions and Badges Component */}
        <PositionsAndBadges 
          userPors={userPors}
          userBadges={userBadges}
          isLoading={isLoading}
        />

        {/* Account Settings Component */}
        <AccountSettings userId={userId} />
      </Container>
    </Box>
  );
}