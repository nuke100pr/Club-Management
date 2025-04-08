"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Engineering as DepartmentIcon,
  HowToReg as RegisteredIcon,
  AdminPanelSettings as AdminIcon,
  Block as BannedIcon,
  CheckCircle as ActiveIcon,
  Group as ClubIcon,
  ThumbUp as LikeIcon
} from "@mui/icons-material";
import { fetchUserData } from "@/utils/auth";

const UserProfile = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.user_id;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  const [userLikes, setUserLikes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the profile user data
        const userResponse = await fetch(`http://localhost:5000/users/users/${userId}/details`);
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's clubs if available
        try {
          const clubsResponse = await fetch(`http://localhost:5000/users/users/club/${userId}`);
          if (clubsResponse.ok) {
            const clubsData = await clubsResponse.json();
            setUserClubs(clubsData);
          }
        } catch (e) {
          console.log("Couldn't fetch user clubs", e);
        }

        // Fetch user's likes if available
        try {
          const likesResponse = await fetch(`http://localhost:5000/users/users/${userId}/like`);
          if (likesResponse.ok) {
            const likesData = await likesResponse.json();
            setUserLikes(likesData);
          }
        } catch (e) {
          console.log("Couldn't fetch user likes", e);
        }

        // Fetch current logged-in user data
        const currentUserData = await fetchUserData();
        if (currentUserData) {
          setCurrentUser(currentUserData.userData);
          setIsCurrentUser(currentUserData.userId === userId);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleEditProfile = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleFollowClub = async (clubId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/users/users/${userId}/follow/${clubId}`,
        { method: "POST" }
      );
      if (response.ok) {
        // Refresh user data after follow
        const userResponse = await fetch(`http://localhost:5000/users/users/${userId}/details`);
        if (userResponse.ok) {
          setUser(await userResponse.json());
        }
      }
    } catch (error) {
      console.error("Error following club:", error);
    }
  };

  const getStatusIcon = () => {
    if (user.status === "active") {
      return <ActiveIcon color="success" />;
    } else {
      return <BannedIcon color="error" />;
    }
  };

  const getUserRoleLabel = () => {
    switch(user.userRole) {
      case "super_admin":
        return "Super Admin";
      case "board_admin":
        return "Board Admin";
      case "club_admin":
        return "Club Admin";
      default:
        return "Member";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
          onClick={() => router.push('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">User not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{ 
                width: 150, 
                height: 150,
                fontSize: '3rem',
                bgcolor: 'primary.main'
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AdminIcon color="primary" />
                  <Typography variant="subtitle1">
                    {getUserRoleLabel()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getStatusIcon()}
                  <Typography variant="subtitle1" color="text.secondary">
                    {user.status === "active" ? "Active" : "Banned"}
                  </Typography>
                </Box>
              </Box>
              {isCurrentUser && (
                <IconButton onClick={handleEditProfile} color="primary">
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography variant="body1">
                    {user.email_id}
                  </Typography>
                </Box>
              </Grid>

              {user.department && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DepartmentIcon color="action" />
                    <Typography variant="body1">
                      {user.department}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {user.registered_at && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RegisteredIcon color="action" />
                    <Typography variant="body1">
                      Joined: {new Date(user.registered_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* User Clubs Section */}
      {userClubs.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Associated Clubs</Typography>
          <List>
            {userClubs.map(club => (
              <ListItem key={club._id}>
                <ListItemIcon>
                  <ClubIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={club.name} 
                  secondary={club.description || "No description available"} 
                />
                {isCurrentUser && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleFollowClub(club._id)}
                  >
                    Follow
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* User Likes Section */}
      {userLikes.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Liked Posts</Typography>
          <List>
            {userLikes.map(like => (
              <ListItem key={like._id}>
                <ListItemIcon>
                  <LikeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={like.post_id?.title || "Untitled Post"} 
                  secondary={`Liked on ${new Date(like.timestamp).toLocaleDateString()}`} 
                />
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => router.push(`/posts/${like.post_id?._id}`)}
                >
                  View Post
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* User Details Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Account Details</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">User ID:</Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {user._id}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Account Status:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon()}
              <Typography variant="body1" color={user.status === "active" ? "success.main" : "error.main"}>
                {user.status === "active" ? "Active Account" : "Banned Account"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">User Role:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminIcon color="primary" />
              <Typography variant="body1">
                {getUserRoleLabel()}
              </Typography>
            </Box>
          </Grid>

          {user.department && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Department:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DepartmentIcon color="action" />
                <Typography variant="body1">
                  {user.department}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserProfile;