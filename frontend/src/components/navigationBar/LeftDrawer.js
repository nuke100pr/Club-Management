// LeftDrawer.jsx
"use client";
import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Event as EventIcon,
  Work as WorkIcon,
  BusinessCenter as BusinessCenterIcon,
  CalendarToday as CalendarTodayIcon,
  LibraryBooks as LibraryBooksIcon,
  Description as DescriptionIcon,
  Forum as ForumIcon,
  Groups as GroupsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ManageAccounts as ManageAccountsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Sidebar navigation items
const sidebarItems = [
  { label: "Events", path: "/events", icon: <EventIcon /> },
  { label: "Projects", path: "/projects", icon: <WorkIcon /> },
  {
    label: "Opportunities",
    path: "/opportunities",
    icon: <BusinessCenterIcon />,
  },
  { label: "Calendar", path: "/calendar", icon: <CalendarTodayIcon /> },
  { label: "Resources", path: "/resources", icon: <LibraryBooksIcon /> },
  { label: "Blogs", path: "/blogs", icon: <DescriptionIcon /> },
  { label: "Forums", path: "/forums", icon: <ForumIcon /> },
  { label: "Clubs", path: "/clubs", icon: <GroupsIcon /> },
  {
    label: "Admin Panel",
    path: "/admin_panel",
    icon: <AdminPanelSettingsIcon />,
  },
  { label: "Manage", path: "/test3", icon: <ManageAccountsIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const LeftDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    // Remove the auth_token cookie
    Cookies.remove("auth_token");
    // Redirect to login page
    router.push("/login");
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
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
          justifyContent: "space-between",
          pt: 4,
        }}
      >
        {/* Brand/Logo Area */}
        <Box sx={{ px: 3, mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Dashboard
          </Typography>
        </Box>

        <List
          sx={{
            width: "100%",
            padding: 2,
            overflow: "auto",
            "& .MuiListItemButton-root": {
              borderRadius: 2,
              mb: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateX(5px)",
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.common.black,
                  0.15
                )}`,
              },
            },
            "& .MuiListItemIcon-root": {
              color: theme.palette.common.white,
              minWidth: 40,
            },
            "& .MuiListItemText-primary": {
              color: theme.palette.common.white,
              fontWeight: 500,
            },
          }}
        >
          {sidebarItems.map(({ label, path, icon }) => (
            <Link key={label} href={path} passHref legacyBehavior>
              <ListItemButton
                component="a"
                onClick={onClose}
                sx={{
                  background:
                    "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </Link>
          ))}
        </List>

        {/* Logout Button */}
        <List sx={{ padding: 2, mb: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              background: "linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)",
              borderRadius: 2,
              "&:hover": {
                background: "linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: theme.palette.common.white }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{ color: theme.palette.common.white }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default LeftDrawer;
