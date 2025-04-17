"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  LinearProgress,
  useMediaQuery,
  Divider,
} from "@mui/material";
import PostFeed from "../../components/finalpage/PostFeed";
import { useTheme } from "@mui/material/styles";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Determining dark mode from theme
  const isDarkMode = theme.palette.mode === "dark";
  useEffect(() => {
    // Check if we're running on the client side
    if (typeof window !== 'undefined') {
      const referrer = document.referrer || '';
      const currentPath = router.asPath || '';
      
      const fromAuthPage = 
        currentPath.includes('/auth') 

      if (fromAuthPage) {
        setIsLoading(true);
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [router.asPath]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Extended for ultra-premium feeling
    return () => clearTimeout(timer);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (date) => {
    const options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return date.toLocaleTimeString(undefined, options);
  };

  // Style to hide scrollbars while maintaining functionality
  const hideScrollbarStyle = {
    scrollbarWidth: "none", // Firefox
    "&::-webkit-scrollbar": {
      // Chrome, Safari, newer Edge
      display: "none",
    },
    msOverflowStyle: "none", // IE and older Edge
    overflowY: "auto", // Keep scrolling functionality
  };

  const gradientBorder = {
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      padding: "2px", // Thicker premium border
      background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
    },
  };

  const ultraPremiumGlassEffect = {
    backdropFilter: "blur(20px)", // Ultra premium blur
    WebkitBackdropFilter: "blur(20px)",
    background: isDarkMode
      ? "rgba(18, 18, 28, 0.55)" // More transparent for higher-end feel
      : "rgba(255, 255, 255, 0.55)",
    boxShadow: isDarkMode
      ? "0 15px 50px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.25)" // Enhanced premium shadow
      : "0 15px 50px rgba(0, 0, 0, 0.18), 0 5px 15px rgba(0, 0, 0, 0.12)",
    borderRadius: 4, // More rounded corners
  };

  const sidebarStyle = {
    ...ultraPremiumGlassEffect,
    ...gradientBorder,
    width: { md: "220px", lg: "250px" },
    height: "calc(100vh - 32px)", // Almost full height with margin
    p: 3,
    m: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  // Handle responsive layout
  const layoutContent = () => {
    if (isSmallScreen) {
      // Mobile layout
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100vh",
            p: 2,
          }}
        >
          {/* Logo and time at top for mobile */}
          <Box
            sx={{
              ...ultraPremiumGlassEffect,
              ...gradientBorder,
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: 1,
                background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textFillColor: "transparent",
              }}
            >
              LIFE ON CAMPUS
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatTime(currentTime)}
            </Typography>
          </Box>

          {/* Centered post feed */}
          <Box
            sx={{
              ...ultraPremiumGlassEffect,
              ...gradientBorder,
              flexGrow: 1,
              width: "100%",
              overflowY: "auto",
              ...hideScrollbarStyle,
            }}
          >
            <ErrorBoundary>
            <PostFeed />
            </ErrorBoundary>
          </Box>
        </Box>
      );
    } else {
      // Desktop/tablet layout with sidebars
      return (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100vh",
            justifyContent: "center",
          }}
        >
          {/* Left sidebar with logo and branding */}
          <Box sx={{ ...sidebarStyle }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  background:
                    "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  mb: 2,
                }}
              >
                LIFE ON CAMPUS
              </Typography>
              <Divider
                sx={{
                  my: 2,
                  background:
                    "linear-gradient(90deg, rgba(71,118,230,0.5) 0%, rgba(142,84,233,0.5) 100%)",
                  height: "2px",
                  border: "none",
                }}
              />
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, opacity: 0.9, mb: 1 }}
              >
                Your premium campus experience
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Stay connected with everything happening around your campus
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="overline"
                sx={{ opacity: 0.7, letterSpacing: 2 }}
              >
                Version 1.0.0
              </Typography>
            </Box>
          </Box>

          {/* Centered post feed with proper height */}
          <Box
            sx={{
              width: "100%",
              maxWidth: { sm: "450px", md: "480px", lg: "520px" },
              height: "calc(100vh - 32px)",
              m: 2,
              ...ultraPremiumGlassEffect,
              ...gradientBorder,
              overflowY: "auto",
              ...hideScrollbarStyle,
            }}
          >
            <PostFeed />
          </Box>

          {/* Right sidebar with date/time */}
          <Box sx={{ ...sidebarStyle }}>
            <Box>
              <Typography
                variant="overline"
                sx={{ opacity: 0.7, letterSpacing: 2 }}
              >
                CURRENT TIME
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, letterSpacing: 0.5, mt: 1 }}
              >
                {formatTime(currentTime)}
              </Typography>
              <Divider
                sx={{
                  my: 2,
                  background:
                    "linear-gradient(90deg, rgba(142,84,233,0.5) 0%, rgba(71,118,230,0.5) 100%)",
                  height: "2px",
                  border: "none",
                }}
              />
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, opacity: 0.9 }}
              >
                {formatDate(currentTime)}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ opacity: 0.7, fontStyle: "italic" }}
              >
                "Make every moment on campus count"
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: isDarkMode
          ? "radial-gradient(circle at 10% 20%, rgb(21, 26, 40) 0%, rgb(10, 12, 24) 90.1%)"
          : "radial-gradient(circle at 10% 20%, rgb(248, 249, 252) 0%, rgb(230, 235, 248) 90.1%)",
        color: isDarkMode ? "#eaecef" : "inherit",
        transition: "all 0.4s ease",
        overflow: "hidden", // Prevent outer scrolling
      }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkMode
              ? "rgba(10, 12, 24, 0.98)"
              : "rgba(255, 255, 255, 0.98)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: 1.2,
              mb: 1,
              background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textFillColor: "transparent",
            }}
          >
            LIFE ON CAMPUS
          </Typography>

          <Box sx={{ width: "280px", position: "relative" }}>
            {/* Premium gradient border around progress bar */}
            <Box
              sx={{
                position: "absolute",
                top: -3,
                left: -3,
                right: -3,
                bottom: -3,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                opacity: 0.7,
                filter: "blur(4px)",
              }}
            />

            <LinearProgress
              sx={{
                height: 12,
                borderRadius: 6,
                position: "relative",
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
                "& .MuiLinearProgress-bar": {
                  background:
                    "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                },
              }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{ mt: 2, fontWeight: 500, letterSpacing: 0.5 }}
          >
            Preparing your ultra-premium experience
          </Typography>
        </Box>
      )}

      {/* Main layout with sidebars */}
      {layoutContent()}
    </Box>
  );
}
