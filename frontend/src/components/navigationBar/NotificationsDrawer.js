// NotificationsDrawer.jsx
"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItem,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Divider,
  Avatar,
  styled,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { fetchUserData } from "../../utils/auth";
import { getAuthToken } from "@/utils/auth";

// Notification Item component
const NotificationItem = styled(ListItem)(({ theme, isRead }) => ({
  borderRadius: 8,
  marginBottom: 8,
  padding: '12px 16px',
  backgroundColor: isRead ? 'transparent' : alpha(theme.palette.primary.light, 0.1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    transform: 'translateX(-4px)',
  }
}));

const NotificationsDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  // Fetch notifications when drawer opens
  useEffect(() => {
    const fetchNotifications = async () => {
      if (open) {
        try {
          if (!authToken) return;
          
          setLoading(true);
          
          // Fetch user data first
          const userData = await fetchUserData();
          const userId = userData.userId;
          
          // Fetch notifications for the user
          const response = await fetch(`http://localhost:5000/notifications/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch notifications');
          }
          
          const data = await response.json();
          setNotifications(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching notifications:', err);
          setError('Failed to load notifications');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [open, authToken]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      if (!authToken) return;
      
      const response = await fetch(`http://localhost:5000/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      if (!authToken) return;
      
      const response = await fetch(`http://localhost:5000/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Remove from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif._id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      if (!authToken) return;
      
      setLoading(true);
      
      // Delete each notification one by one
      const deletePromises = notifications.map(notification => 
        fetch(`http://localhost:5000/notifications/${notification._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        })
      );
      
      await Promise.all(deletePromises);
      
      // Clear local state
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get avatar letter from title or default
  const getAvatarLetter = (title) => {
    if (!title) return "N";
    return title.charAt(0).toUpperCase();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16, 
          background: `linear-gradient(145deg, ${alpha(
            theme.palette.background.paper,
            0.97
          )}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: "blur(20px)",
          boxShadow: `5px 0 30px ${alpha(theme.palette.common.black, 0.2)}`,
        },
      }}
      SlideProps={{
        style: { transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          pt: 2,
        }}
      >
        {/* Notifications Header */}
        <Box 
          sx={{ 
            px: 3, 
            py: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Notifications
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        {/* Notifications List */}
        <List sx={{ width: '100%', padding: 2, overflow: 'auto', flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Box>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification._id} 
                isRead={notification.isRead}
                disablePadding
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      background: notification.isRead ? 
                        'linear-gradient(135deg, #E0E0E0 0%, #BBBBBB 100%)' : 
                        'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)'
                    }}
                  >
                    {getAvatarLetter(notification.title)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {notification.message || notification.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </NotificationItem>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          )}
        </List>
        
        {/* Clear All Button */}
        {!loading && notifications.length > 0 && (
          <Box sx={{ p: 2 }}>
            <ListItemButton
              onClick={handleClearAll}
              sx={{
                background: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                "&:hover": {
                  background: alpha(theme.palette.primary.main, 0.2),
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <Typography variant="button" color="primary">
                Clear All Notifications
              </Typography>
            </ListItemButton>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationsDrawer;
