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
} from "@mui/material";
import {
  Close as CloseIcon,
} from "@mui/icons-material";

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

// Sample notifications data
const sampleNotifications = [
  {
    id: 1,
    title: "New Event Posted",
    description: "A new networking event has been added to the calendar",
    time: "10 minutes ago",
    isRead: false,
    avatar: "E"
  },
  {
    id: 2,
    title: "Project Update",
    description: "Your team has completed milestone 2 of the project",
    time: "1 hour ago",
    isRead: false,
    avatar: "P"
  },
  {
    id: 3,
    title: "New Job Opportunity",
    description: "A new job matching your profile has been posted",
    time: "3 hours ago",
    isRead: true,
    avatar: "J"
  },
  {
    id: 4,
    title: "Forum Reply",
    description: "Someone replied to your question about React hooks",
    time: "Yesterday",
    isRead: true,
    avatar: "F"
  },
  {
    id: 5,
    title: "System Update",
    description: "The platform will be under maintenance this weekend",
    time: "2 days ago",
    isRead: true,
    avatar: "S"
  }
];

const NotificationsDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(sampleNotifications);

  // Use useEffect to mark notifications as read when drawer opens
  useEffect(() => {
    if (open) {
      const updatedNotifications = notifications.map(notif => ({
        ...notif,
        isRead: true
      }));
      setNotifications(updatedNotifications);
    }
  }, [open]); // Only run when 'open' changes

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
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                isRead={notification.isRead}
                disablePadding
              >
                <Box sx={{ display: 'flex', width: '100%' }}>
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
                    {notification.avatar}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {notification.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {notification.time}
                    </Typography>
                  </Box>
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
        {notifications.length > 0 && (
          <Box sx={{ p: 2 }}>
            <ListItemButton
              onClick={() => setNotifications([])}
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