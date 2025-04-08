"use client";
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Divider,
  ListItemIcon,
  Badge,
  Tooltip,
  alpha,
  Button,
  CircularProgress,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import { useRouter } from "next/navigation";
import { colors } from "../color"; // Import the colors from the color.js file
import { fetchUserData } from "../utils/auth"; // Import the fetchUserData function

const PremiumNavbar = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoadingUserData(true);
        // Get userId from auth.js
        const authData = await fetchUserData();
        setUserId(authData.userId);
        setIsSuperAdmin(authData.isSuperAdmin);
        
        // Fetch user details using the userId
        if (authData.userId) {
          const response = await fetch(`http://localhost:5000/users/users/${authData.userId}/details`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user details');
          }
          
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoadingUserData(false);
      }
    };

    getUserData();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    if (loadingUserData) {
      setLoading(true);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setLoading(false);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    // Delete auth_token cookie
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Logging out...");
    // Example: router.push('/login');
    handleClose();
  };

  const handleNavigation = (path) => {
    router.push(path);
    handleClose();
  };

  // Default placeholder for user image
  const userImage = "/api/placeholder/40/40";

  // Function to get user's initials for avatar fallback
  const getUserInitials = () => {
    if (!userData || !userData.name) return "U";
    const nameParts = userData.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: colors.background.paper,
        color: colors.text.primary,
        boxShadow: colors.shadows.card,
        backdropFilter: "blur(8px)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        top: 0,
        borderBottom: colors.borders.light,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
          {/* Logo/Brand */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                display: { xs: "none", sm: "block" },
              }}
            >
              PREMIUM
            </Typography>
            <Badge
              badgeContent="PRO"
              color="secondary"
              sx={{
                ml: 1,
                "& .MuiBadge-badge": {
                  fontSize: "0.6rem",
                  fontWeight: "bold",
                  height: 16,
                  bgcolor: colors.secondary.main,
                },
                display: { xs: "none", md: "block" }
              }}
            />
          </Box>

          {/* User Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={handleNotificationMenu}
                size="small"
                sx={{
                  mr: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: alpha(colors.primary.main, 0.08),
                  },
                }}
              >
                <Badge badgeContent={3} color="error" sx={{ "& .MuiBadge-badge": { bgcolor: colors.status.error } }}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications Menu */}
            <Menu
              id="notification-menu"
              anchorEl={notificationAnchorEl}
              open={notificationOpen}
              onClose={handleNotificationClose}
              MenuListProps={{
                "aria-labelledby": "notification-button",
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 320,
                  maxHeight: 400,
                  overflow: "auto",
                  mt: 1.5,
                  borderRadius: 2,
                  border: colors.borders.light,
                  boxShadow: colors.shadows.card,
                },
              }}
            >
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>
              <Divider sx={{ borderColor: alpha(colors.primary.main, 0.1) }} />
              <MenuItem sx={{ py: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Your subscription will renew in 5 days
                  </Typography>
                  <Typography variant="caption" color={colors.text.secondary}>
                    2 hours ago
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem sx={{ py: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    New premium feature available: Advanced Analytics
                  </Typography>
                  <Typography variant="caption" color={colors.text.secondary}>
                    Yesterday
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem sx={{ py: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Welcome to Premium! Explore all benefits
                  </Typography>
                  <Typography variant="caption" color={colors.text.secondary}>
                    3 days ago
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ borderColor: alpha(colors.primary.main, 0.1) }} />
              <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
                <Button
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "none",
                    color: colors.primary.main,
                  }}
                >
                  View all notifications
                </Button>
              </Box>
            </Menu>

            {/* User Info & Avatar */}
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", mr: 1 }}>
              <Box sx={{ textAlign: "right", mr: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, lineHeight: 1.2 }}
                >
                  {userData?.name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 0.5,
                  }}
                >
                  <StarIcon sx={{ fontSize: 12, color: colors.secondary.main }} />
                  {userData?.userRole === "super_admin" ? "Admin" : "Member"}
                </Typography>
              </Box>
            </Box>

            {/* User Avatar */}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{
                  p: 0,
                  background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main})`,
                  border: "2px solid",
                  borderColor: colors.background.paper,
                  boxShadow: colors.shadows.card,
                }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  src={userImage}
                  alt={userData?.name || "User"}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: alpha(colors.primary.main, 0.8),
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Enhanced Profile Menu */}
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "account-button",
                dense: true,
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 250,
                  mt: 1.5,
                  borderRadius: 2,
                  border: colors.borders.light,
                  boxShadow: colors.shadows.card,
                },
              }}
            >
              {loading || loadingUserData ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={40} sx={{ color: colors.primary.main }} />
                </Box>
              ) : (
                <>
                  <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar
                      src={userImage}
                      alt={userData?.name || "User"}
                      sx={{
                        width: 60,
                        height: 60,
                        mb: 1,
                        border: "2px solid",
                        borderColor: colors.primary.main,
                        bgcolor: alpha(colors.primary.main, 0.8),
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {userData?.name || "User"}
                    </Typography>
                    <Typography variant="caption" color={colors.text.secondary} sx={{ mb: 1 }}>
                      {userData?.email_id || "user@example.com"}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<StarIcon sx={{ color: colors.secondary.main }} />}
                      sx={{
                        fontSize: "0.75rem",
                        borderRadius: 4,
                        textTransform: "none",
                        px: 2,
                        background: `linear-gradient(45deg, ${alpha(colors.primary.main, 0.1)}, ${alpha(colors.secondary.main, 0.1)})`,
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        "&:hover": {
                          borderColor: colors.primary.dark,
                          background: `linear-gradient(45deg, ${alpha(colors.primary.main, 0.2)}, ${alpha(colors.secondary.main, 0.2)})`,
                        },
                      }}
                      onClick={() => handleNavigation("/subscription")}
                    >
                      {userData?.userRole === "super_admin" ? "Admin Account" : "Member Account"}
                    </Button>
                  </Box>
                  
                  <Divider sx={{ borderColor: alpha(colors.primary.main, 0.1) }} />
                  
                  <MenuItem onClick={() => handleNavigation("/profile")}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" sx={{ color: colors.primary.main }} />
                    </ListItemIcon>
                    My Profile
                  </MenuItem>
                  
                  {userData?.userRole === "super_admin" && (
                    <MenuItem onClick={() => handleNavigation("/admin/users")}>
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" sx={{ color: colors.primary.main }} />
                      </ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  
                  <Divider sx={{ borderColor: alpha(colors.primary.main, 0.1) }} />
                  
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color={colors.text.secondary}>
                      Member since: {userData ? new Date(userData.registered_at).toLocaleDateString() : "N/A"}
                    </Typography>
                    {userData?.department && (
                      <Typography variant="caption" color={colors.text.secondary} sx={{ display: "block" }}>
                        Department: {userData.department}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ display: "block", color: userData?.status === "active" ? colors.status.success : colors.status.error }}>
                      Status: {userData?.status || "N/A"}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ borderColor: alpha(colors.primary.main, 0.1) }} />
                  
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: colors.status.error }} />
                    </ListItemIcon>
                    <Typography color={colors.status.error}>Sign Out</Typography>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default PremiumNavbar;