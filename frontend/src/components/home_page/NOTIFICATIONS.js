"use client";
import React, { useState, useEffect } from "react";
import {
  SwipeableDrawer,
  IconButton,
  Typography,
  Box,
  Badge,
  Paper,
  CircularProgress,
  Alert,
  Slide,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchUserData, getAuthToken } from "@/utils/auth";

const NotificationCard = ({ notification, onDelete }) => {
  const [slideOut, setSlideOut] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  
  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleSwipe = (e) => {
    const touchDelta = e.touches ? e.touches[0].clientX - e.target.offsetLeft : 0;
    const cardWidth = e.target.offsetWidth;
    const progress = Math.max(0, Math.min(100, (1 - touchDelta / cardWidth) * 100));
    setSwipeProgress(progress);
    
    // Delete when swiped more than 65% of the width
    if (progress > 65) {
      setSlideOut(true);
      setTimeout(() => onDelete(notification._id), 300);
    }
  };

  const handleTouchEnd = () => {
    if (swipeProgress < 65) {
      setSwipeProgress(0);
    }
  };

  return (
    <Slide direction="right" in={!slideOut} mountOnEnter unmountOnExit timeout={300}>
      <Paper 
        elevation={2}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 2,
          borderRadius: 2,
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            boxShadow: 3,
          }
        }}
        onTouchMove={handleSwipe}
        onTouchEnd={handleTouchEnd}
      >
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "100%",
            backgroundColor: "error.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: 2,
            zIndex: 1,
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Swipe to delete
        </Box>
        
        <Box
          sx={{
            position: "relative",
            backgroundColor: "background.paper",
            p: 2,
            zIndex: 2,
            transform: `translateX(-${swipeProgress}%)`,
            transition: swipeProgress > 65 ? "transform 0.3s" : "transform 0.1s",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {notification.notification_id.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {notification.notification_id.description}
          </Typography>
          
          <Box display="flex" justifyContent="flex-end">
            <Typography variant="caption" color="text.secondary">
              {formatTime(notification.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
};

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await getAuthToken();
        setAuthToken(token);
        if (!token) return;

        const userData = await fetchUserData();
        setUserId(userData.userId);
        if (userData.userId) {
          await fetchNotifications(userData.userId);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const fetchNotifications = async (userId) => {
    if (!authToken) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/baat/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
    if (!open && userId) {
      fetchNotifications(userId);
    }
  };

  const deleteNotification = async (id) => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`http://localhost:5000/baat/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      setNotifications(notifications.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setError("Failed to delete notification. Please try again.");
    }
  };

  const refreshNotifications = () => {
    if (userId) {
      fetchNotifications(userId);
    }
  };

  return (
    <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      <IconButton
        onClick={toggleDrawer}
        sx={{ 
          backgroundColor: "primary.main", 
          color: "white",
          boxShadow: 3,
          "&:hover": {
            backgroundColor: "primary.dark",
          }
        }}
        size="large"
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            borderTopLeftRadius: { xs: 16, sm: 0 },
            borderBottomLeftRadius: { xs: 16, sm: 0 },
            p: 0,
          }
        }}
      >
        <Box sx={{ p: 2, backgroundColor: "primary.main", color: "white" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Notifications</Typography>
            <Box>
              <IconButton color="inherit" onClick={refreshNotifications}>
                <NotificationsIcon />
              </IconButton>
              <IconButton color="inherit" onClick={toggleDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : notifications.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              height="50vh"
              p={4}
              textAlign="center"
            >
              <NotificationsIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No notifications</Typography>
              <Typography variant="body2" color="text.disabled">
                You don't have any notifications at the moment
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Swipe left to delete notifications
              </Typography>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onDelete={deleteNotification}
                />
              ))}
            </Box>
          )}
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default Notifications;
