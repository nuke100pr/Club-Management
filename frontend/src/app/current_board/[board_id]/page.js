"use client";
import { useState, useEffect } from "react";
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
  Paper,
  Grid,
  Card
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EVENTS from "../../../components/board_admin/EVENTS";
import POSTS from "../../../components/board_admin/POSTS";
import PROJECTS from "../../../components/board_admin/PROJECTS";
import OPPORTUNITIES from "../../../components/board_admin/OPPORTUNITIES";
import CALENDAR from "../../../components/board_admin/CALENDAR";
import RESOURCES from "../../../components/board_admin/RESOURCES";
import BLOGS from "../../../components/board_admin/BLOGS";
import FORUMS from "../../../components/board_admin/FORUMS";
import TEAMS from "../../../components/board_admin/TEAMS";
import STATISTICS from "../../../components/board_admin/STATISTICS";
import { fetchUserData } from "@/utils/auth";

const SECTIONS = [
  { label: "Events", component: (props) => <EVENTS {...props} /> },
  { label: "Posts", component: (props) => <POSTS {...props} /> },
  { label: "Projects", component: (props) => <PROJECTS {...props} /> },
  { label: "Opportunities", component: (props) => <OPPORTUNITIES {...props} /> },
  { label: "Calendar", component: (props) => <CALENDAR {...props} /> },
  { label: "Resources", component: (props) => <RESOURCES {...props} /> },
  { label: "Blogs", component: (props) => <BLOGS {...props} /> },
  { label: "Forums", component: (props) => <FORUMS {...props} /> },
  { label: "Team", component: (props) => <TEAMS {...props} /> },
  { label: "Statistics", component: (props) => <STATISTICS {...props} /> },
  { label: "Clubs", component: null }
];

const CurrentBoard = () => {
  const params = useParams();
  const router = useRouter();
  const boardId = params.board_id;
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [board, setBoard] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userBoardsWithPermission, setUserBoardsWithPermission] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract boards with admin permission
        if (result.userData?.boards) {
          const boardsWithPermission = Object.keys(result.userData.boards).filter(
            (boardId) => result.userData.boards[boardId].admin === true
          );
          setUserBoardsWithPermission(boardsWithPermission);
        }
      }
    }
    loadUserData();
  }, []);

  const hasPermission = () => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if user has admin permission for this board
    const hasBoardPermission = boardId && userBoardsWithPermission.includes(boardId);

    return hasBoardPermission;
  };

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        setLoading(true);
        
        const boardUrl = userId 
          ? `http://localhost:5000/boards/${boardId}?user_id=${userId}`
          : `http://localhost:5000/boards/${boardId}`;
        
        const boardResponse = await fetch(boardUrl);
        if (!boardResponse.ok) throw new Error('Failed to fetch board details');
        const boardData = await boardResponse.json();
        setBoard(boardData);
        
        const clubsUrl = userId 
          ? `http://localhost:5000/clubs/clubs/board/${boardId}?user_id=${userId}`
          : `http://localhost:5000/clubs/clubs/board/${boardId}`;
        
        const clubsResponse = await fetch(clubsUrl);
        if (!clubsResponse.ok) throw new Error('Failed to fetch clubs');
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching board details:', error);
        setError('Failed to load board details. Please try again later.');
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardDetails();
    }
  }, [boardId, userId]);

  const handleFollowBoard = async () => {
    try {
      if (!userId) return;
      
      if (board.isFollowing) {
        const response = await fetch(
          `http://localhost:5000/boards/${boardId}/unfollow/${userId}`,
          { method: "DELETE" }
        );
        
        if (!response.ok) throw new Error('Failed to unfollow board');
        setBoard(prev => ({ ...prev, isFollowing: false }));
      } else {
        const response = await fetch(
          `http://localhost:5000/boards/${boardId}/follow/${userId}`,
          { method: "POST" }
        );
        
        if (!response.ok) throw new Error('Failed to follow board');
        setBoard(prev => ({ ...prev, isFollowing: true }));
      }
    } catch (error) {
      console.error("Error updating board follow status:", error);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      const response = await fetch(`http://localhost:5000/boards/${boardId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete board');
      router.push('/clubs');
    } catch (error) {
      console.error('Error deleting board:', error);
      setError('Failed to delete board. Please try again later.');
    }
  };

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleFollowClub = async (clubId, e) => {
    e.stopPropagation(); // Prevent event bubbling to the card click
    try {
      if (!userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/follow/club/${clubId}`,
        { method: "POST" }
      );
      
      if (!response.ok) throw new Error('Failed to follow club');
      
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club._id === clubId 
            ? { ...club, isFollowing: true } 
            : club
        )
      );
    } catch (error) {
      console.error('Error following club:', error);
      throw error;
    }
  };

  const handleUnfollowClub = async (clubId, e) => {
    e.stopPropagation(); // Prevent event bubbling to the card click
    try {
      if (!userId) return;
      
      const response = await fetch(
        `http://localhost:5000/clubs/users/${userId}/unfollow/club/${clubId}`,
        { method: "DELETE" }
      );
      
      if (!response.ok) throw new Error('Failed to unfollow club');
      
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club._id === clubId 
            ? { ...club, isFollowing: false } 
            : club
        )
      );
    } catch (error) {
      console.error('Error unfollowing club:', error);
      throw error;
    }
  };

  const handleClubClick = (clubId) => {
    router.push(`/current_club/${clubId}`);
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

  if (!board) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Board not found</Alert>
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

  const renderTabContent = () => {
    if (tabIndex === SECTIONS.length - 1) { // Clubs tab
      return (
        <Box sx={{ mt: 3 }}>
          {clubs.length === 0 ? (
            <Alert severity="info">
              No clubs found in this board. Clubs may be added by administrators.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {clubs.map(club => (
                <Grid item xs={12} sm={6} md={4} key={club._id}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => handleClubClick(club._id)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                        {club.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="h6" noWrap>
                        {club.name}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        height: "4.5em"
                      }}
                    >
                      {club.description || "No description available."}
                    </Typography>
                    
                    {userId && (
                      <Button 
                        variant={club.isFollowing ? "contained" : "outlined"}
                        fullWidth
                        color="primary" 
                        onClick={(e) => club.isFollowing ? handleUnfollowClub(club._id, e) : handleFollowClub(club._id, e)}
                        sx={{ 
                          borderRadius: 2, 
                          textTransform: "none",
                          mt: 'auto',
                          borderColor: "#1976d2",
                          color: club.isFollowing ? "#fff" : "#1976d2",
                          backgroundColor: club.isFollowing ? "#1976d2" : "transparent",
                          "&:hover": {
                            backgroundColor: club.isFollowing ? "#1565c0" : "transparent",
                            borderColor: "#1976d2",
                            opacity: 0.8,
                          }
                        }}
                      >
                        {club.isFollowing ? "Unfollow Club" : "Follow Club"}
                      </Button>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      );
    }
    
    const Component = SECTIONS[tabIndex].component;
    return (
      <Component 
        boardId={boardId}
        userId={userId}
        isSuperAdmin={isSuperAdmin}
        hasPermission={hasPermission()}
        userData={userData}
      />
    );
  };

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
          {board.name.charAt(0).toUpperCase()}
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
          <Typography variant="h4" gutterBottom>{board.name}</Typography>
          <Typography variant="body1" color="textSecondary">
            {board.description || "No description available"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          
          {userId && (
            <Button 
              variant={board.isFollowing ? "contained" : "outlined"} 
              color="primary"
              onClick={handleFollowBoard}
              sx={{ borderRadius: 20 }}
            >
              {board.isFollowing ? "Following" : "Follow Board"}
            </Button>
          )}
          
          {hasPermission() && (
            <>
              <IconButton 
                onClick={() => router.push(`/boards/${boardId}/edit`)} 
                color="primary"
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={handleDeleteBoard} color="error">
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
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default CurrentBoard;