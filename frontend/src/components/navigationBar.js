"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AppBar,
  Box,
  IconButton,
  Paper,
  Fab,
  Badge,
  useTheme,
} from "@mui/material";
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import LeftDrawer from "./navigationBar/LeftDrawer";
import NotificationsDrawer from "./navigationBar/NotificationsDrawer";

// Custom hardware-accelerated animated AppBar
const AnimatedAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "isVisible",
})(({ theme, isVisible }) => ({
  top: "auto",
  bottom: 16, // Fixed bottom position
  left: 16,
  right: 16,
  width: "auto",
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: "blur(20px)",
  borderRadius: 20,
  boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.2)}`,
  position: "fixed",
  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
  transform: isVisible ? "translate3d(0, 0, 0)" : "translate3d(0, 120%, 0)", // Use transform for movement
  opacity: isVisible ? 1 : 0,
  transition:
    "transform 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)", // Unified timing and easing
  willChange: "transform, opacity",
  zIndex: 1100,
  // Force hardware acceleration
  WebkitBackfaceVisibility: "hidden",
  WebkitPerspective: 1000,
}));

// Premium styled IconButton (unchanged)
const PremiumIconButton = styled(IconButton)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.12),
  borderRadius: 14,
  padding: 12,
  transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  WebkitBackfaceVisibility: "hidden",
  WebkitPerspective: 1000,
  WebkitTransform: "translateZ(0)",
  transform: "translate3d(0, 0, 0)",
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.25),
    transform: "translate3d(0, -3px, 0)",
    boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

// Animated toggle button (unchanged)
const AnimatedFab = styled(Fab)(({ theme }) => ({
  boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.25)}`,
  background: "linear-gradient(to right, #4776E6, #8E54E9)",
  transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  WebkitBackfaceVisibility: "hidden",
  WebkitPerspective: 1000,
  WebkitTransform: "translateZ(0)",
  transform: "translate3d(0, 0, 0)",
  "&:hover": {
    background: "linear-gradient(to right, #4776E6, #8E54E9)",
    boxShadow: `0 10px 25px ${alpha(theme.palette.common.black, 0.35)}`,
    transform: "translate3d(0, -2px, 0)",
  },
}));

// Pages where the navigation bar should be hidden
const hiddenOnPages = ["/login", "/register", "/signup"];

// Sample notifications data
const sampleNotifications = [
  { id: 1, isRead: false },
  { id: 2, isRead: false },
  { id: 3, isRead: true },
  { id: 4, isRead: true },
  { id: 5, isRead: true },
];

const CollapsibleNavBar = () => {
  // Initialize all hooks first
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false); // Start with false
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);

  // Count unread notifications
  const unreadCount = sampleNotifications.filter(
    (notif) => !notif.isRead
  ).length;

  // Check if the navigation bar should be rendered based on current route and auth token
  useEffect(() => {
    if (pathname) {
      const hasAuthToken = !!Cookies.get("auth_token");
      const shouldHide = hiddenOnPages.some((page) => pathname === page);
      setShouldRender(hasAuthToken && !shouldHide);
    }
  }, [pathname]);

  // Toggle navbar with debouncing
  const toggleNavbar = useCallback(() => {
    if (isAnimating) return; // Prevent toggling during animation

    setIsAnimating(true);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(() => {
      setIsOpen((prev) => !prev);
      animationRef.current = null;

      // Reset animation state after the transition duration
      setTimeout(() => {
        setIsAnimating(false);
      }, 400); // Match the transition duration
    });
  }, [isAnimating]);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const toggleNotificationsDrawer = useCallback(() => {
    setNotificationsDrawerOpen((prev) => !prev);
  }, []);

  const navigateToHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  const navigateToSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  // Instead of early return, render conditionally
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* Fixed toggle button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
        }}
      >
        <AnimatedFab
          color="primary"
          size="small"
          onClick={toggleNavbar}
          disabled={isAnimating} // Disable during animation
        >
          {isOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </AnimatedFab>
      </Box>

      {/* Custom animated navbar */}
      <AnimatedAppBar elevation={0} isVisible={isOpen}>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-around",
            py: 1.5,
            backgroundColor: "transparent",
          }}
        >
          <PremiumIconButton
            color="primary"
            aria-label="home"
            onClick={navigateToHome}
          >
            <HomeIcon />
          </PremiumIconButton>
          <PremiumIconButton
            color="primary"
            aria-label="menu"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </PremiumIconButton>
          <PremiumIconButton
            color="primary"
            aria-label="notifications"
            onClick={toggleNotificationsDrawer}
          >
            <NotificationsIcon />
          </PremiumIconButton>
          <PremiumIconButton
            color="primary"
            aria-label="settings"
            onClick={navigateToSettings}
          >
            <SettingsIcon />
          </PremiumIconButton>
        </Paper>
      </AnimatedAppBar>

      {/* Left Drawer (Sidebar) */}
      <LeftDrawer open={drawerOpen} onClose={toggleDrawer} />

      {/* Right Drawer (Notifications) */}
      <NotificationsDrawer
        open={notificationsDrawerOpen}
        onClose={toggleNotificationsDrawer}
      />
    </>
  );
};

export default CollapsibleNavBar;
