"use client";
import { useState, useEffect, useRef } from "react";
import { AppBar, Box, Button, IconButton, Tab, Tabs, Typography, useMediaQuery, useTheme } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import EVENTS from "../../components/club_admin/EVENTS";
import POSTS from "../../components/club_admin/POSTS";
import PROJECTS from "../../components/club_admin/PROJECTS";
import OPPORTUNITIES from "../../components/club_admin/OPPORTUNITIES";
import CALENDAR from "../../components/club_admin/CALENDAR";
import RESOURCES from "../../components/club_admin/RESOURCES";
import BLOGS from "../../components/club_admin/BLOGS";
import FORUMS from "../../components/club_admin/FORUMS";
import TEAMS from "../../components/club_admin/TEAMS";
import STATISTICS from "../../components/club_admin/STATISTICS";


const SECTIONS = [
  { label: "Events", component: <EVENTS /> },
  { label: "Posts", component: <POSTS /> },
  { label: "Projects", component: <PROJECTS /> },
  { label: "Opportunities", component: <OPPORTUNITIES /> },
  { label: "Calendar", component: <CALENDAR /> },
  { label: "Resources", component: <RESOURCES /> },
  { label: "Blogs", component: <BLOGS /> },
  { label: "Forums", component: <FORUMS /> },
  { label: "Team", component: <TEAMS /> },
  { label: "Statistics", component: <STATISTICS /> }
];

const ClubBoard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box sx={{ width: "100vw" }}>
      {/* Image Section */}
      <Box sx={{ width: "100%", height: "30vh", bgcolor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h5">Image</Typography>
      </Box>

      {/* Info Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h6">Name</Typography>
          <Typography variant="body1" color="textSecondary">Description</Typography>
        </Box>
        <Box>
          <IconButton color="warning">
            <NotificationsActiveIcon />
          </IconButton>
          <Button variant="contained" color="primary">Follow</Button>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <AppBar position="sticky" color="default" sx={{ top: 0, zIndex: 100 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
        >
          {SECTIONS.map((section, index) => (
            <Tab key={index} label={section.label} />
          ))}
        </Tabs>
      </AppBar>

      {/* Active Tab Content */}
      <Box sx={{ minHeight: "100vh", p: 3, bgcolor: "#f5f5f5" }}>
        <Typography variant="h4" gutterBottom>{SECTIONS[tabIndex].label}</Typography>
        {SECTIONS[tabIndex].component}
      </Box>
    </Box>
  );
};

export default ClubBoard;
