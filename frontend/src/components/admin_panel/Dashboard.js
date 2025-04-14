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
import { motion } from "framer-motion";

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const darkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/stats");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setStatsData(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStats = () => {
    if (!statsData) return [];

    return [
      {
        id: 1,
        title: "Total Boards",
        value: statsData.totalBoards.toString(),
        icon: <GroupsIcon fontSize="large" />,
        color: theme.palette.primary.main,
        darkColor: theme.palette.primary.light
      },
      {
        id: 2,
        title: "Active Clubs",
        value: statsData.totalClubs.toString(),
        icon: <EventIcon fontSize="large" />,
        color: theme.palette.success.main,
        darkColor: theme.palette.success.light
      },
      {
        id: 3,
        title: "Total Events",
        value: statsData.totalEvents.toString(),
        icon: <EventNoteIcon fontSize="large" />,
        color: "#8E54E9",
        darkColor: "#B794F6"
      },
      {
        id: 4,
        title: "Upcoming Events",
        value: statsData.upcomingEvents.toString(),
        icon: <NotificationsActiveIcon fontSize="large" />,
        color: theme.palette.warning.main,
        darkColor: theme.palette.warning.light
      },
      {
        id: 5,
        title: "Active Users",
        value: statsData.activeUsers.toString(),
        icon: <TrendingUpIcon fontSize="large" />,
        color: "#4776E6",
        darkColor: "#90CAF9",
        change: `+${statsData.usersRegisteredThisMonth} this month`,
      },
      {
        id: 6,
        title: "Banned Users",
        value: statsData.bannedUsers.toString(),
        icon: <BlockIcon fontSize="large" />,
        color: theme.palette.error.main,
        darkColor: theme.palette.error.light
      },
    ];
  };

  const GradientText = ({ children, variant }) => (
    <Typography
      variant={variant || "h5"}
      sx={{
        fontWeight: 600,
        background: 'linear-gradient(45deg, #4776E6, #8E54E9)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "50vh",
          bgcolor: darkMode ? 'background.default' : '#f8faff'
        }}
      >
        <CircularProgress sx={{ color: "#4776E6" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "50vh",
          p: 4,
          bgcolor: darkMode ? 'background.default' : '#f8faff'
        }}
      >
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{
            mt: 2,
            background: 'linear-gradient(45deg, #4776E6, #8E54E9)',
            boxShadow: '0 4px 10px rgba(71, 118, 230, 0.25)',
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: isMobile ? 2 : 4, 
        minHeight: "100vh",
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        bgcolor: darkMode ? 'background.default' : '#f8faff'
      }}
    >
      <GradientText variant={isMobile ? "h5" : "h4"}>Dashboard Overview</GradientText>

      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
        {getStats().map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.id}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: "16px", 
                  borderTop: `4px solid ${darkMode ? stat.darkColor : stat.color}`,
                  boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(95, 150, 230, 0.1)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  bgcolor: darkMode ? 'grey.800' : 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      borderRadius: "12px",
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      background: darkMode 
                        ? `linear-gradient(45deg, ${stat.darkColor}, ${stat.darkColor}cc)`
                        : `linear-gradient(45deg, ${stat.color}, ${stat.color}cc)`,
                      boxShadow: darkMode 
                        ? `0 4px 10px ${stat.darkColor}40`
                        : `0 4px 10px ${stat.color}40`,
                    }}
                  >
                    {React.cloneElement(stat.icon, {
                      sx: { color: darkMode ? 'common.white' : 'common.white' }
                    })}
                  </Box>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        mb: 0.5,
                        color: darkMode ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1,
                        color: darkMode ? 'common.white' : 'text.primary'
                      }}
                    >
                      {stat.value}
                    </Typography>
                    {stat.change && (
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{ 
                          mt: 1,
                          backgroundColor: darkMode 
                            ? `${stat.darkColor}20` 
                            : `${stat.color}15`,
                          color: darkMode ? stat.darkColor : stat.color,
                          fontSize: '0.65rem',
                          height: '22px',
                          fontWeight: 500
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;