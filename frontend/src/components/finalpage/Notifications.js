// components/finalpage/Notifications.jsx
"use client";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Badge, 
  IconButton, 
  useTheme, 
  Avatar, 
  Divider 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const notificationData = [
  {
    id: 1,
    title: 'Project Invitation',
    message: 'Sarah invited you to collaborate on "AI Research Project"',
    time: '2 hours ago',
    read: false,
    avatar: '👩‍💼'
  },
  {
    id: 2,
    title: 'Event Reminder',
    message: 'The "Tech Conference" starts tomorrow at 9:00 AM',
    time: '5 hours ago',
    read: false,
    avatar: '📅'
  },
  {
    id: 3,
    title: 'New Connection',
    message: 'Michael accepted your connection request',
    time: '1 day ago',
    read: true,
    avatar: '👨‍💻'
  },
  {
    id: 4,
    title: 'Resource Shared',
    message: 'Emma shared a new resource: "Machine Learning Fundamentals"',
    time: '2 days ago',
    read: true,
    avatar: '📚'
  }
];

export default function Notifications() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(notificationData);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Count unread notifications
    setUnreadCount(notifications.filter(notification => !notification.read).length);
  }, [notifications]);
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  return (
    <Box sx={{ 
      p: 2,
      display: 'flex',
      flexDirection: 'column', 
      gap: 2,
      height: '100%', // This ensures it takes full height
      overflow: 'auto',
      bgcolor: theme.palette.background.paper,
      borderRadius: 1,
      boxShadow: theme.shadows[1]
    }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
        pb: 1,
        mb: 1
      }}>
      </Box>
      
      {/* Notification Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Box 
              key={notification.id} 
              sx={{ 
                p: 2, 
                bgcolor: notification.read ? 'transparent' : theme.palette.action.hover, 
                borderRadius: 1,
                cursor: 'pointer',
                borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: theme.palette.action.selected
                },
                transition: 'all 0.2s ease',
                mb: 2
              }}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40 }}>
                  {notification.avatar}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={notification.read ? 'normal' : 'bold'}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                    {notification.time}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: 'text.secondary'
          }}>
            <Typography>No notifications</Typography>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="button" 
          color="primary" 
          sx={{ 
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          View All Notifications
        </Typography>
      </Box>
    </Box>
  );
}