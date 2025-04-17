"use client";
import { useState } from 'react';
import { 
  AppBar, 
  Box, 
  IconButton, 
  Slide, 
  Paper, 
  Fab,
  Zoom
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Settings as SettingsIcon, 
  Notifications as NotificationsIcon, 
  Person as PersonIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

// Styled components
const TransparentAppBar = styled(AppBar)(({ theme }) => ({
  top: 'auto',
  bottom: 16, // Margin from bottom
  left: 16,
  right: 16,
  width: 'auto',
  backgroundColor: alpha(theme.palette.background.paper, 0.7), // Slightly transparent
  backdropFilter: 'blur(10px)',
  borderRadius: 16, // Rounded edges
  boxShadow: theme.shadows[3],
  zIndex: 2500, // High z-index to ensure it appears over everything
}));

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box sx={{ pb: 7, height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Main content */}
      <Box sx={{ p: 3 }}>
        <h1>Main Content</h1>
        <p>Your page content goes here</p>
      </Box>
      
      {/* Fixed toggle button */}
      <Box sx={{ position: 'fixed', bottom: 8, right: 'calc(50% - 28px)', zIndex: 2600 }}>
        <Zoom in={true}>
          <Fab 
            color="primary" 
            size="small" 
            onClick={toggleNavbar}
            sx={{ boxShadow: 3 }}
          >
            {isOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </Fab>
        </Zoom>
      </Box>
      
      {/* Collapsible Navigation Bar */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <TransparentAppBar position="fixed" elevation={0}>
          <Paper 
            elevation={0} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              py: 1, 
              backgroundColor: 'transparent' 
            }}
          >
            <IconButton color="primary" aria-label="home">
              <HomeIcon />
            </IconButton>
            <IconButton color="primary" aria-label="notifications">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="primary" aria-label="settings">
              <SettingsIcon />
            </IconButton>
            <IconButton color="primary" aria-label="profile">
              <PersonIcon />
            </IconButton>
          </Paper>
        </TransparentAppBar>
      </Slide>
    </Box>
  );
}