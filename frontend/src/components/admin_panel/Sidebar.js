import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  alpha,
  Tooltip
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Category as BoardsIcon,
  Groups as ClubsIcon,
  WorkOutline as PORIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon
} from "@mui/icons-material";

const Sidebar = ({ activeTab, setActiveTab, isMobile }) => {
  const theme = useTheme();
  // Initial state - open on desktop, closed on mobile
  const [open, setOpen] = useState(!isMobile);

  // Use theme colors instead of hardcoded values
  const primary = {
    main: theme.palette.primary.main,
    light: theme.palette.primary.light,
    dark: theme.palette.primary.dark
  };
  
  const secondary = theme.palette.secondary.main;
  
  // Use theme background and text colors for proper dark mode support
  const bgSidebar = theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.9)
    : "rgba(245, 247, 250, 0.7)";
    
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;

  // Update sidebar state when screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  // Toggle drawer for both mobile and desktop
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { name: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { name: "boards", label: "Boards", icon: <BoardsIcon /> },
    { name: "clubs", label: "Clubs", icon: <ClubsIcon /> },
    { name: "users", label: "Users", icon: <UsersIcon /> },
    { name: "por", label: "POR", icon: <PORIcon /> },
    { name: "admin_manage", label: "Admin Management", icon: <AdminIcon /> },
    { name: "super_admin_manage", label: "Super Admin Management", icon: <SuperAdminIcon /> },
  ];

  // Styled logo component with gradient text
  const Logo = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${primary.main} 0%, ${secondary} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2,
          boxShadow: theme.palette.mode === 'dark'
            ? `0 4px 10px ${alpha(primary.main, 0.5)}`
            : "0 4px 10px rgba(71, 118, 230, 0.3)",
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          sx={{ color: theme.palette.common.white }}
        >
          A
        </Typography>
      </Box>
      {open && (
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            background: `linear-gradient(135deg, ${primary.main} 0%, ${secondary} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Portal
        </Typography>
      )}
    </Box>
  );

  const drawer = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Logo />
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{
            color: primary.main,
            "&:hover": {
              backgroundColor: alpha(primary.main, 0.1),
            },
          }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ backgroundColor: alpha(primary.main, 0.2) }} />

      <List sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ display: "block", mb: 1 }}>
            <ListItemButton
              onClick={() => {
                setActiveTab(item.name);
                if (isMobile) setOpen(false);
              }}
              selected={activeTab === item.name}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
                borderRadius: 2,
                boxShadow: activeTab === item.name ? 
                  theme.palette.mode === 'dark'
                    ? `0 2px 8px ${alpha(primary.main, 0.25)}`
                    : "0 2px 8px rgba(95, 150, 230, 0.15)" 
                  : "none",
                backgroundColor: activeTab === item.name ? 
                  alpha(primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1) : "transparent",
                "&:hover": {
                  backgroundColor: activeTab === item.name ?
                    alpha(primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15) : 
                    alpha(primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                  transform: "translateY(-2px)",
                  boxShadow: theme.palette.mode === 'dark'
                    ? `0 4px 12px ${alpha(primary.main, 0.25)}`
                    : "0 4px 12px rgba(95, 150, 230, 0.15)",
                  transition: "all 0.3s ease",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: activeTab === item.name ? 
                    primary.main : 
                    textSecondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: activeTab === item.name ? 
                      primary.main : 
                      textPrimary,
                    "& .MuiTypography-root": { 
                      fontWeight: activeTab === item.name ? 600 : 400,
                      fontSize: "0.9rem",
                    }
                  }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  // Uncollapse button that shows when sidebar is collapsed on desktop only (not mobile)
  const uncollapseButton = !open && !isMobile && (
    <Tooltip title="Expand Sidebar" placement="right">
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          left: '64px', // Positioned just to the right of collapsed sidebar
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha(primary.main, 0.2)
            : alpha(primary.main, 0.1),
          color: primary.main,
          width: 28,
          height: 60,
          borderRadius: '0 8px 8px 0',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
              ? alpha(primary.main, 0.3)
              : alpha(primary.main, 0.2),
          },
          boxShadow: theme.palette.mode === 'dark'
            ? `2px 0 8px ${alpha(primary.main, 0.2)}`
            : '2px 0 8px rgba(95, 150, 230, 0.15)',
          zIndex: 1199, // Just below the drawer zIndex
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          width: { sm: open ? 280 : 72 },
          flexShrink: { sm: 0 },
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        {/* Mobile: temporary drawer that can be closed/opened */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280, // Full width on mobile when open
                boxSizing: 'border-box',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 12px 20px ${alpha(theme.palette.background.paper, 0.3)}`
                  : "0 12px 20px rgba(95, 150, 230, 0.2)",
                borderRight: `1px solid ${alpha(primary.main, 0.2)}`,
                backgroundColor: bgSidebar,
                zIndex: 1300, // Higher than tab bar
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          // Desktop: permanent drawer that can be collapsed/expanded
          <Drawer
            variant="permanent"
            open={true}
            sx={{
              '& .MuiDrawer-paper': {
                width: open ? 280 : 72,
                boxSizing: 'border-box',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 12px 20px ${alpha(theme.palette.background.paper, 0.3)}`
                  : "0 12px 20px rgba(95, 150, 230, 0.2)",
                borderRight: `1px solid ${alpha(primary.main, 0.2)}`,
                backgroundColor: bgSidebar,
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.easeInOut,
                  duration: theme.transitions.duration.standard,
                }),
                overflowX: 'hidden',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      
      {/* Show uncollapse button only on desktop when sidebar is collapsed */}
      {uncollapseButton}
      
      {/* Mobile hamburger menu button - fixed to top left corner */}
      {isMobile && !open && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1100,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: primary.main,
            '&:hover': {
              backgroundColor: alpha(primary.main, 0.1),
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
    </>
  );
};

export default Sidebar;