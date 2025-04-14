"use client";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Container,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";

const OnboardingPage = () => {
  const [clubs, setClubs] = useState([]);
  const [boards, setBoards] = useState([]);
  const [userId, setUserId] = useState(null);
  const [followedItems, setFollowedItems] = useState({ clubs: [], boards: [] });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const router = useRouter();
  const theme = useTheme();
  
  // Use media queries for responsive design
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));

  const REQUIRED_FOLLOWS = 5;

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserId(result.userId);
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch clubs with follow status
        const clubsUrl = `http://localhost:5000/clubs/clubs?user_id=${userId}`;
        const clubsResponse = await fetch(clubsUrl);
        if (!clubsResponse.ok) throw new Error('Failed to fetch clubs');
        const clubsData = await clubsResponse.json();
        
        // Fetch boards with follow status
        const boardsUrl = `http://localhost:5000/boards?user_id=${userId}`;
        const boardsResponse = await fetch(boardsUrl);
        if (!boardsResponse.ok) throw new Error('Failed to fetch boards');
        const boardsData = await boardsResponse.json();
        
        setClubs(clubsData);
        setBoards(boardsData);

        console.log(clubsData);
        console.log(boardsData);
        
        // Initialize followed items
        const followedClubs = clubsData.filter(club => club.isFollowing).map(club => club._id);
        const followedBoards = boardsData.filter(board => board.isFollowing).map(board => board._id);
        
        setFollowedItems({
          clubs: followedClubs,
          boards: followedBoards
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: "Failed to load clubs and boards. Please refresh the page.",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFollowClub = async (clubId) => {
    try {
      if (!userId) return;
      
      const isFollowed = followedItems.clubs.includes(clubId);
      const url = `http://localhost:5000/clubs/users/${userId}/${isFollowed ? 'unfollow' : 'follow'}/club/${clubId}`;
      const method = isFollowed ? "DELETE" : "POST";
      
      const response = await fetch(url, { method });
      
      if (!response.ok) throw new Error(`Failed to ${isFollowed ? 'unfollow' : 'follow'} club`);
      
      setFollowedItems(prev => {
        const updatedClubs = isFollowed
          ? prev.clubs.filter(id => id !== clubId)
          : [...prev.clubs, clubId];
          
        return {
          ...prev,
          clubs: updatedClubs
        };
      });
      
      setSnackbar({
        open: true,
        message: `Successfully ${isFollowed ? 'unfollowed' : 'followed'} club`,
        severity: "success"
      });
      
    } catch (error) {
      console.error('Error following/unfollowing club:', error);
      setSnackbar({
        open: true,
        message: "Failed to update follow status. Please try again.",
        severity: "error"
      });
    }
  };

  const handleFollowBoard = async (boardId) => {
    try {
      if (!userId) return;
      
      const isFollowed = followedItems.boards.includes(boardId);
      const url = `http://localhost:5000/clubs/users/${userId}/${isFollowed ? 'unfollow' : 'follow'}/board/${boardId}`;
      const method = isFollowed ? "DELETE" : "POST";
      
      const response = await fetch(url, { method });
      
      if (!response.ok) throw new Error(`Failed to ${isFollowed ? 'unfollow' : 'follow'} board`);
      
      setFollowedItems(prev => {
        const updatedBoards = isFollowed
          ? prev.boards.filter(id => id !== boardId)
          : [...prev.boards, boardId];
          
        return {
          ...prev,
          boards: updatedBoards
        };
      });
      
      setSnackbar({
        open: true,
        message: `Successfully ${isFollowed ? 'unfollowed' : 'followed'} board`,
        severity: "success"
      });
      
    } catch (error) {
      console.error('Error following/unfollowing board:', error);
      setSnackbar({
        open: true,
        message: "Failed to update follow status. Please try again.",
        severity: "error"
      });
    }
  };

  const totalFollowedCount = followedItems.clubs.length + followedItems.boards.length;
  const progressPercentage = (totalFollowedCount / REQUIRED_FOLLOWS) * 100;
  const canProceed = totalFollowedCount >= REQUIRED_FOLLOWS;

  const handleProceedClick = () => {
    if (canProceed) {
      router.push('/home');
    } else {
      setSnackbar({
        open: true,
        message: `Please follow at least ${REQUIRED_FOLLOWS} clubs and boards to continue`,
        severity: "warning"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Determine grid size based on screen size to show ~4 cards per row on larger screens
  const getGridSize = () => {
    if (isXs) return 6; // 2 cards per row on mobile
    if (isSm) return 4; // 3 cards per row on tablet
    if (isMd) return 3; // 4 cards per row on desktop
    return 3; // 4 cards per row on larger screens
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" sx={{ mb: 3 }}>
          Loading clubs and boards...
        </Typography>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mb: 10 }}> {/* Add bottom margin for fixed button */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome to the Club Hub!
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 2 }}>
          Follow at least {REQUIRED_FOLLOWS} clubs and boards to get started
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(progressPercentage, 100)} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography align="center" sx={{ mt: 1 }}>
            {totalFollowedCount} / {REQUIRED_FOLLOWS} selected
          </Typography>
        </Box>
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>Boards</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {boards.map((board) => (
          <Grid item xs={6} sm={4} md={3} key={board._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardMedia
                component="img"
                sx={{ 
                  height: 140, 
                  width: '100%', 
                  objectFit: 'cover'
                }}
                image={board.image ? `http://localhost:5000/uploads/${board.image.filename}` : '/placeholder-board.jpg'}
                alt={board.name}
              />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {board.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '4.5em' // Fixed height for description
                  }}
                >
                  {board.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="medium" 
                  fullWidth
                  variant={followedItems.boards.includes(board._id) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => handleFollowBoard(board._id)}
                  sx={{ borderRadius: 28 }}
                >
                  {followedItems.boards.includes(board._id) ? "Following" : "Follow"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>Clubs</Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {clubs.map((club) => (
          <Grid item xs={6} sm={4} md={3} key={club._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardMedia
                component="img"
                sx={{ 
                  height: 140, 
                  width: '100%', 
                  objectFit: 'cover'
                }}
                image={club.image ? `http://localhost:5000/uploads/${club.image.filename}` : '/placeholder-club.jpg'}
                alt={club.name}
              />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {club.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '4.5em' // Fixed height for description
                  }}
                >
                  {club.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="medium" 
                  fullWidth
                  variant={followedItems.clubs.includes(club._id) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => handleFollowClub(club._id)}
                  sx={{ borderRadius: 28 }}
                >
                  {followedItems.clubs.includes(club._id) ? "Following" : "Follow"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'background.paper', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={!canProceed}
          onClick={handleProceedClick}
          sx={{ 
            py: 1.5, 
            borderRadius: 2,
            opacity: canProceed ? 1 : 0.7,
          }}
        >
          {canProceed ? "Continue to Home" : `Follow ${REQUIRED_FOLLOWS - totalFollowedCount} more to continue`}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OnboardingPage;