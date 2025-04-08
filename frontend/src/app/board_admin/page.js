"use client";
import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import noteContext from "../../contexts/noteContext";
import { 
  AppBar, 
  Box, 
  Button, 
  IconButton, 
  Tab, 
  Tabs, 
  Typography, 
  useMediaQuery, 
  useTheme,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Card,
  Paper
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EVENTS from "../../components/board_admin/EVENTS";
import POSTS from "../../components/board_admin/POSTS";
import PROJECTS from "../../components/board_admin/PROJECTS";
import OPPORTUNITIES from "../../components/board_admin/OPPORTUNITIES";
import CALENDAR from "../../components/board_admin/CALENDAR";
import RESOURCES from "../../components/board_admin/RESOURCES";
import BLOGS from "../../components/board_admin/BLOGS";
import FORUMS from "../../components/board_admin/FORUMS";
import TEAMS from "../../components/board_admin/TEAMS";
import STATISTICS from "../../components/board_admin/STATISTICS";


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
  const params = useParams();
  const router = useRouter();
  const clubId = params.club_id;
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const info = useContext(noteContext);
  const value2 = {
    user_id : "67e73a073127d9304be21670"
  };

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        
        const clubUrl = value2?.user_id 
          ? `http://localhost:5000/clubs/${clubId}?user_id=${value2.user_id}`
          : `http://localhost:5000/clubs/${clubId}`;
        
        const response = await fetch(clubUrl);
        if (!response.ok) throw new Error('Failed to fetch club details');
        const clubData = await response.json();
        setClub(clubData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching club details:', error);
        setError('Failed to load club details. Please try again later.');
        setLoading(false);
      }
    };

    if (clubId) {
      fetchClubDetails();
    }
  }, [clubId, value2?.user_id]);

  const handleFollowClub = async () => {
    try {
      if (!value2?.user_id) return;
      
      if (club.isFollowing) {
        // Unfollow club
        const response = await fetch(
          `http://localhost:5000/clubs/users/${value2.user_id}/unfollow/club/${clubId}`,
          { method: "DELETE" }
        );
        
        if (!response.ok) throw new Error('Failed to unfollow club');
        setClub(prev => ({ ...prev, isFollowing: false }));
      } else {
        // Follow club
        const response = await fetch(
          `http://localhost:5000/clubs/users/${value2.user_id}/follow/club/${clubId}`,
          { method: "POST" }
        );
        
        if (!response.ok) throw new Error('Failed to follow club');
        setClub(prev => ({ ...prev, isFollowing: true }));
      }
    } catch (error) {
      console.error("Error updating club follow status:", error);
    }
  };

  const handleDeleteClub = async () => {
    try {
      const response = await fetch(`http://localhost:5000/clubs/${clubId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete club');
      router.push('/clubs');
    } catch (error) {
      console.error('Error deleting club:', error);
      setError('Failed to delete club. Please try again later.');
    }
  };

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/clubs')}
          sx={{ mt: 2 }}
        >
          Back to Clubs
        </Button>
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Club not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/clubs')}
          sx={{ mt: 2 }}
        >
          Back to Clubs
        </Button>
      </Box>
    );
  }

  return (

      <Box sx={{ width: "100vw" }}>
        {/* Back Button */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/clubs')}
          sx={{ m: 2 }}
        >
          Back to Clubs
        </Button>

        {/* Image Section */}
        <Box sx={{ 
          width: "100%", 
          height: "30vh", 
          bgcolor: "#e0e0e0", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          position: "relative"
        }}>
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              fontSize: "3rem",
              bgcolor: theme.palette.primary.main
            }}
          >
            {club.name.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        {/* Info Section */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          p: 3, 
          flexWrap: "wrap",
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Box>
            <Typography variant="h4" gutterBottom>{club.name}</Typography>
            <Typography variant="body1" color="textSecondary">
              {club.description || "No description available"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

            
            {value2?.user_id && (
              <Button 
                variant={club.isFollowing ? "contained" : "outlined"} 
                color="primary"
                onClick={handleFollowClub}
                sx={{ borderRadius: 20 }}
              >
                {club.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            
            {value2?.user_role === "super_admin" && (
              <>
                <IconButton 
                  onClick={() => router.push(`/clubs/${clubId}/edit`)} 
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={handleDeleteClub} color="error">
                  <DeleteIcon />
                </IconButton>
              </>
            )}
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
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>{SECTIONS[tabIndex].label}</Typography>
            <Divider sx={{ my: 2 }} />
          </Paper>
          {SECTIONS[tabIndex].component}
        </Box>
      </Box>

  );
};

export default ClubBoard;