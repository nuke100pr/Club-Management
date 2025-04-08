"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Paper
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateClubForm from "../../../components/clubs/CreateClubForm";
import { fetchUserData } from "@/utils/auth";
import EVENTS from "../../../components/club_admin/EVENTS";
import POSTS from "../../../components/club_admin/POSTS";
import PROJECTS from "../../../components/club_admin/PROJECTS";
import OPPORTUNITIES from "../../../components/club_admin/OPPORTUNITIES";
import CALENDAR from "../../../components/club_admin/CALENDAR";
import RESOURCES from "../../../components/club_admin/RESOURCES";
import BLOGS from "../../../components/club_admin/BLOGS";
import FORUMS from "../../../components/club_admin/FORUMS";
import TEAMS from "../../../components/club_admin/TEAMS";
import STATISTICS from "../../../components/club_admin/STATISTICS";




const SECTIONS = (clubId) => [
  { label: "Events", component: <EVENTS clubId={clubId} /> },
  { label: "Posts", component: <POSTS clubId={clubId} /> },
  { label: "Projects", component: <PROJECTS clubId={clubId} /> },
  { label: "Opportunities", component: <OPPORTUNITIES clubId={clubId} /> },
  { label: "Calendar", component: <CALENDAR clubId={clubId} /> },
  { label: "Resources", component: <RESOURCES clubId={clubId} /> },
  { label: "Blogs", component: <BLOGS clubId={clubId} /> },
  { label: "Forums", component: <FORUMS clubId={clubId} /> },
  { label: "Team", component: <TEAMS clubId={clubId} /> },
  { label: "Statistics", component: <STATISTICS clubId={clubId} /> }
];

const CurrentClub = () => {
  const params = useParams();
  const router = useRouter();
  const clubId = params.club_id;
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [club, setClub] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [boards, setBoards] = useState({});
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithPermission, setUserClubsWithPermission] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with admin permission
        if (result.userData?.clubs) {
          const clubsWithPermission = Object.keys(result.userData.clubs).filter(
            (clubId) => result.userData.clubs[clubId].admin === true
          );
          setUserClubsWithPermission(clubsWithPermission);
        }
      }
    }
    loadUserData();
  }, []);

  const hasPermission = () => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if user has admin permission for this club
    const hasClubPermission = clubId && userClubsWithPermission.includes(clubId);

    return hasClubPermission;
  };

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        
        const clubUrl = userId
          ? `http://localhost:5000/clubs/clubs/${clubId}?user_id=${userId}`
          : `http://localhost:5000/clubs/clubs/${clubId}`;

        const clubResponse = await fetch(clubUrl);
        if (!clubResponse.ok) throw new Error('Failed to fetch club details');
        const clubData = await clubResponse.json();
        setClub(clubData);

        const boardsResponse = await fetch('http://localhost:5000/boards');
        if (!boardsResponse.ok) throw new Error('Failed to fetch boards');
        const boardsData = await boardsResponse.json();
        
        const boardsObject = boardsData.reduce((acc, board) => {
          acc[board._id] = board.name;
          return acc;
        }, {});
        setBoards(boardsObject);
        
        if (clubData.board_id && boardsObject[clubData.board_id]) {
          setBoardName(boardsObject[clubData.board_id]);
        } else {
          setBoardName("Unknown Board");
        }

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
  }, [clubId, userId]);

  const handleFollowClick = async () => {
    try {
      if (!userId) return;

      if (club.isFollowing) {
        const response = await fetch(
          `http://localhost:5000/clubs/users/${userId}/unfollow/club/${clubId}`,
          { method: "DELETE" }
        );
        
        if (!response.ok) throw new Error('Failed to unfollow club');
        setClub(prev => ({ ...prev, isFollowing: false }));
      } else {
        const response = await fetch(
          `http://localhost:5000/clubs/users/${userId}/follow/club/${clubId}`,
          { method: "POST" }
        );
        
        if (!response.ok) throw new Error('Failed to follow club');
        setClub(prev => ({ ...prev, isFollowing: true }));
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  const handleDeleteClub = async () => {
    try {
      const response = await fetch(`http://localhost:5000/clubs/clubs/${clubId}`, {
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

  const handleUpdateClub = (updatedClub) => {
    setClub(updatedClub);
    setEditDialogOpen(false);
    
    if (updatedClub.board_id && boards[updatedClub.board_id]) {
      setBoardName(boards[updatedClub.board_id]);
    }
  };

  const getTagColor = (boardId) => {
    return boardId === "b1" ? "#4CAF50" : "#FF5722";
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
            bgcolor: getTagColor(club.board_id)
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
            {boardName && (
              <Button 
                variant="contained" 
                disableElevation
                sx={{ 
                  borderRadius: 20, 
                  backgroundColor: getTagColor(club.board_id),
                  textTransform: "none",
                  mr: 2,
                  px: 2,
                  py: 0.5,
                  "&:hover": {
                    backgroundColor: getTagColor(club.board_id),
                  }
                }}
              >
                {boardName}
              </Button>
            )}
            {club.description || "No description available"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="warning">
            <NotificationsActiveIcon />
          </IconButton>
          
          {userId && (
            <Button 
              variant={club.isFollowing ? "contained" : "outlined"} 
              color="primary"
              onClick={handleFollowClick}
              sx={{ borderRadius: 20 }}
            >
              {club.isFollowing ? "Following" : "Follow"}
            </Button>
          )}
          
          {hasPermission() && (
            <>
              <IconButton 
                onClick={() => setEditDialogOpen(true)} 
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
          {SECTIONS(clubId).map((section, index) => (
            <Tab key={index} label={section.label} />
          ))}
        </Tabs>
      </AppBar>

      {/* Active Tab Content */}
      <Box sx={{ minHeight: "100vh", p: 3, bgcolor: "#f5f5f5" }}>
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>{SECTIONS(clubId)[tabIndex].label}</Typography>
          <Divider sx={{ my: 2 }} />
        </Paper>
        {SECTIONS(clubId)[tabIndex].component}
      </Box>

      {/* Edit Club Dialog */}
      {club && (
        <CreateClubForm
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          boards={boards}
          onSave={handleUpdateClub}
          initialData={club}
          isEditMode={true}
        />
      )}
    </Box>
  );
};

export default CurrentClub;