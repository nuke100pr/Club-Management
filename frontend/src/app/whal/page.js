"use client";
import { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Drawer,
  useMediaQuery,
  Fab,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import LeftSidebar from "../../components/finalpage/LeftSidebar";
import RightSidebar from "../../components/finalpage/RightSidebar";
import PostFeed from "../../components/finalpage/PostFeed";
import Notifications from "../../components/finalpage/Notifications";
import { useTheme } from "@mui/material/styles";

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const theme = useTheme(); // Get theme from parent context
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Style to hide scrollbars while maintaining functionality
  const hideScrollbarStyle = {
    scrollbarWidth: "none", // Firefox
    "&::-webkit-scrollbar": {
      // Chrome, Safari, newer Edge
      display: "none",
    },
    "-ms-overflow-style": "none", // IE and older Edge
    overflowY: "auto", // Keep scrolling functionality
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Mobile header with burger buttons */}
      {isMobile && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            borderBottom: "1px solid",
            borderColor: theme.palette.divider,
            boxShadow: 1,
          }}
        >
          <IconButton
            edge="start"
            color="white"
            aria-label="menu"
            onClick={() => setLeftOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            edge="end"
            color="blue"
            aria-label="menu"
            onClick={() => setRightOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          py: 3,
          px: { xs: 1, sm: 2 },
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 1128,
            mx: "auto",
          }}
        >
          <Grid container spacing={2}>
            {/* Left Sidebar */}
            {!isMobile && (
              <Grid item xs={12} md={3} lg={2.5}>
                <Box
                  sx={{
                    position: "sticky",
                    top: 16,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 1,
                    boxShadow: 1,
                    overflow: "hidden",
                    mb: 2,
                  }}
                >
                  <LeftSidebar />
                </Box>
              </Grid>
            )}

            {/* Main Feed */}
            <Grid item xs={12} md={isMobile ? 12 : 6} lg={isMobile ? 12 : 6}>
              <Box
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <PostFeed />
              </Box>
            </Grid>

            {/* Right Sidebar */}
            {!isMobile && (
              <Grid item md={3} lg={3.5}>
                <Box
                  sx={{
                    position: "sticky",
                    top: 16,
                    height: "fit-content", // This is important
                    maxHeight: "calc(100vh - 32px)",
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 1,
                    boxShadow: 1,
                    overflow: "hidden",
                    mb: 2,
                  }}
                >
                  <RightSidebar />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Floating Notifications Button */}
      <Fab
        color="primary"
        aria-label="notifications"
        onClick={() => setNotificationsOpen(true)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
        }}
      >
        <Badge badgeContent={3} color="error">
          <NotificationsIcon />
        </Badge>
      </Fab>

      {/* Mobile Drawers */}
      <Drawer
        anchor="left"
        open={leftOpen}
        onClose={() => setLeftOpen(false)}
        PaperProps={{
          sx: {
            ...hideScrollbarStyle,
            width: 280,
            marginTop: isMobile ? 5 : 0,
            height: isMobile ? "calc(100% - 48px)" : "100%",
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <LeftSidebar />
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={rightOpen}
        onClose={() => setRightOpen(false)}
        PaperProps={{
          sx: {
            ...hideScrollbarStyle,
            width: 280,
            marginTop: isMobile ? 5 : 0,
            height: isMobile ? "calc(100% - 48px)" : "100%",
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <RightSidebar />
        </Box>
      </Drawer>

      {/* Notifications Drawer - now coming from bottom on mobile */}
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        PaperProps={{
          sx: {
            ...hideScrollbarStyle,
            width: isMobile ? "100%" : 350,
            height: isMobile ? "80%" : "100%",
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: theme.palette.background.paper,
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid",
            borderColor: theme.palette.divider,
          }}
        >
          <Box sx={{ fontWeight: "bold" }}>Notifications</Box>
          <IconButton
            size="small"
            onClick={() => setNotificationsOpen(false)}
            aria-label="close notifications"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Notifications />
      </Drawer>
    </Box>
  );
}
