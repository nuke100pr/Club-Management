"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Typography,
  LinearProgress,
  useMediaQuery,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Link,
  Fade,
} from "@mui/material";
import PostFeed from "../../components/finalpage/PostFeed";
import { useTheme } from "@mui/material/styles";
import ErrorBoundary from "@/components/ErrorBoundary";
import SchoolIcon from "@mui/icons-material/School";
import LanguageIcon from "@mui/icons-material/Language";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PersonIcon from "@mui/icons-material/Person";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeProfiles, setActiveProfiles] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Determining dark mode from theme
  const isDarkMode = theme.palette.mode === "dark";

  // Campus resources links
  const campusResources = [
    {
      name: "IIT Ropar Home Page",
      icon: <SchoolIcon />,
      url: "https://www.iitrpr.ac.in",
    },
    {
      name: "LOC YouTube Channel",
      icon: <YouTubeIcon />,
      url: "https://youtube.com/loc_iitropar",
    },
    {
      name: "LOC Website",
      icon: <LanguageIcon />,
      url: "https://www.locrpr.com",
    },
  ];

  // Generate random letter for avatar
  const getRandomLetter = () => {
    const letters = "ABCDHLMNOPRSTU";
    return letters[Math.floor(Math.random() * letters.length)];
  };

  // Dynamic campus activity simulation with letter avatars
  useEffect(() => {
    // Create initial set of active profiles (20-30)
    const initialCount = Math.floor(Math.random() * 11) + 20; // Random number between 20-30
    const initialProfiles = Array.from({ length: initialCount }, (_, i) => {
      const letter = getRandomLetter();
      const colorHue = Math.floor(Math.random() * 360); // Random hue for avatar color

      return {
        id: i,
        letter,
        avatarColor: `hsl(${colorHue}, 70%, 60%)`,
        x: Math.random() * 70 + 15, // position between 15% and 85%
        y: Math.random() * 70 + 15, // position between 15% and 85%
      };
    });

    setActiveProfiles(initialProfiles);

    // Periodically update active profiles to simulate activity
    const interval = setInterval(() => {
      setActiveProfiles((prev) => {
        // Maintain count between 20-30
        const targetCount = Math.floor(Math.random() * 11) + 20;

        if (prev.length < targetCount) {
          // Add new profiles
          const newProfiles = Array.from(
            { length: targetCount - prev.length },
            () => {
              const letter = getRandomLetter();
              const colorHue = Math.floor(Math.random() * 360);

              return {
                id: Date.now() + Math.random(),
                letter,
                avatarColor: `hsl(${colorHue}, 70%, 60%)`,
                x: Math.random() * 70 + 15,
                y: Math.random() * 70 + 15,
                isNew: true,
              };
            }
          );
          return [...prev, ...newProfiles];
        } else if (prev.length > targetCount) {
          // Remove random profiles
          const numToRemove = prev.length - targetCount;
          const indexesToRemove = Array.from({ length: numToRemove }, () =>
            Math.floor(Math.random() * prev.length)
          );
          return prev.filter((_, index) => !indexesToRemove.includes(index));
        } else {
          // Just update positions slightly for movement effect
          return prev.map((profile) => ({
            ...profile,
            isNew: false,
            // Slightly adjust positions for subtle animation
            x: Math.max(15, Math.min(85, profile.x + (Math.random() * 6 - 3))),
            y: Math.max(15, Math.min(85, profile.y + (Math.random() * 6 - 3))),
          }));
        }
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if we're running on the client side
    if (typeof window !== "undefined") {
      const referrer = document.referrer || "";
      const currentPath = router.asPath || "";

      const fromAuthPage = currentPath.includes("/auth");

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
    gap: 3,
  };

  // Gradient text style
  const gradientTextStyle = {
    fontWeight: 800,
    letterSpacing: 1,
    background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
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
          {/* Logo at top for mobile */}
          <Box
            sx={{
              ...ultraPremiumGlassEffect,
              ...gradientBorder,
              p: 2,
              mb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="h5" sx={gradientTextStyle}>
              LIFE ON CAMPUS
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
      // Desktop/tablet layout with innovative sidebars
      return (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100vh",
            justifyContent: "center",
          }}
        >
          {/* Left sidebar with dynamic content */}
          <Box sx={sidebarStyle}>
            {/* Logo */}
            <Box>
              <Typography variant="h4" sx={gradientTextStyle}>
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
            </Box>

            {/* Featured Image with fade animation */}
            <Fade in={imageLoaded} timeout={1000}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 180,
                  borderRadius: 2,
                  overflow: "hidden",
                  ...gradientBorder,
                }}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/home/img1.jpg`}
                  alt="Campus Life"
                  layout="fill"
                  objectFit="cover"
                  onLoad={() => setImageLoaded(true)}
                />
              </Box>
            </Fade>

            {/* Campus Resources */}
            <Box sx={{ mt: "auto" }}>
              <Typography
                variant="overline"
                sx={{ opacity: 0.7, letterSpacing: 2 }}
              >
                QUICK LINKS
              </Typography>
              <List dense>
                {campusResources.map((resource, index) => (
                  <ListItem
                    key={index}
                    disableGutters
                    component={Link}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {resource.icon}
                    </ListItemIcon>
                    <ListItemText primary={resource.name} />
                  </ListItem>
                ))}
              </List>
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

          {/* Right sidebar with interactive features */}
          <Box sx={sidebarStyle}>
            {/* Campus Activity with Letter Avatars */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Campus Activity
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  height: 400,
                  p: 2,
                  ...gradientBorder,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "30%",
                    background: `linear-gradient(0deg, ${theme.palette.primary.main}33 0%, transparent 100%)`,
                    borderRadius: "0 0 8px 8px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      fontWeight: 700,
                      color:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(0,0,0,0.7)",
                    }}
                  >
                    {activeProfiles.length} Active Now
                  </Typography>
                </Box>

                {/* Dynamic letter avatars */}
                {activeProfiles.map((profile) => (
                  <Fade
                    key={profile.id}
                    in={true}
                    timeout={profile.isNew ? 800 : 400}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        position: "absolute",
                        top: `${profile.y}%`,
                        left: `${profile.x}%`,
                        backgroundColor: profile.avatarColor,
                        transform: "translate(-50%, -50%)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        transition: "all 0.5s ease",
                        border: profile.isNew ? "2px solid white" : "none",
                        animation: profile.isNew
                          ? "pulse 1.5s infinite"
                          : "none",
                        "@keyframes pulse": {
                          "0%": {
                            boxShadow: "0 0 0 0 rgba(255,255,255,0.7)",
                          },
                          "70%": {
                            boxShadow: "0 0 0 6px rgba(255,255,255,0)",
                          },
                          "100%": {
                            boxShadow: "0 0 0 0 rgba(255,255,255,0)",
                          },
                        },
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      {profile.letter}
                    </Avatar>
                  </Fade>
                ))}
              </Box>
            </Box>

            {/* Inspirational Quote */}
            <Box sx={{ mt: "auto" }}>
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
                variant="body2"
                sx={{ opacity: 0.7, fontStyle: "italic" }}
              >
                "Your campus journey is what you make of it. Connect, learn,
                grow."
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
