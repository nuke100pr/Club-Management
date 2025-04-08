import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  useMediaQuery,
  useTheme,
  CircularProgress
} from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  Groups as GroupsIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  NotificationsActive as NotificationsActiveIcon,
  Block as BlockIcon,
  EventNote as EventNoteIcon,
} from "@mui/icons-material";

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetch("http://localhost:5000/stats")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setStatsData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
        setLoading(false);
      });
  }, []);

  const getStats = () => {
    if (!statsData) return [];

    return [
      {
        id: 1,
        title: "Total Boards",
        value: statsData.totalBoards.toString(),
        icon: <GroupsIcon fontSize="large" />,
      },
      {
        id: 2,
        title: "Active Clubs",
        value: statsData.totalClubs.toString(),
        icon: <EventIcon fontSize="large" />,
      },
      {
        id: 3,
        title: "Total Events",
        value: statsData.totalEvents.toString(),
        icon: <EventNoteIcon fontSize="large" />,
        change: null,
      },
      {
        id: 4,
        title: "Upcoming Events",
        value: statsData.upcomingEvents.toString(),
        icon: <NotificationsActiveIcon fontSize="large" />,
        change: null,
      },
      {
        id: 5,
        title: "Active Users",
        value: statsData.activeUsers.toString(),
        icon: <TrendingUpIcon fontSize="large" />,
        change: `+${statsData.usersRegisteredThisMonth} this month`,
      },
      {
        id: 6,
        title: "Banned Users",
        value: statsData.bannedUsers.toString(),
        icon: <BlockIcon fontSize="large" />,
        change: null,
      },
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress sx={{ color: "#6a1b9a" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>

      <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 4 }}>
        {getStats().map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={stat.id}>
            <Paper
              elevation={2}
              sx={{ p: 2, borderRadius: 3, backgroundColor: "white" }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    backgroundColor: "#f3e5f5",
                    borderRadius: "50%",
                    width: 60,
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    color: "#6a1b9a",
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stat.title}
                  </Typography>
                  <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: "#6a1b9a" }}>
                    {stat.value}
                  </Typography>
                  {stat.change && (
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{ backgroundColor: "#e1bee7", color: "#4a148c" }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;