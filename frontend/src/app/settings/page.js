"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Card,
  CardContent,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useTheme,
  Avatar,
  Grid,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import ThemeToggle from "../../components/themeToggle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchUserData } from "../../utils/auth"; // Assuming this is the correct path

export default function SettingsPage() {
  const theme = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    email: "loading@example.com",
    department: "Loading...",
    status: "Loading...",
    photoUrl: "/api/placeholder/150/150",
  });
  const [userBadges, setUserBadges] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [boardId, setBoardId] = useState("");
  const [clubId, setClubId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userPors, setUserPors] = useState([]);

  // Status-specific state to fix flickering
  const [statusInputValue, setStatusInputValue] = useState("");

  // Separate state for dialog input values
  const [dialogInputs, setDialogInputs] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [dialogs, setDialogs] = useState({
    delete: false,
    reset: false,
    profile: false,
    removePhoto: false,
  });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await fetchUserData();
        if (userData) {
          setUserId(userData.userId);
          setUserRole(userData.userRole || "member");
          setBoardId(userData.boardId || "");
          setClubId(userData.clubId);
          
          console.log(userData);
          
          // Set initial user profile with basic data
          setUserProfile(prev => ({
            ...prev,
            name: userData.userData?.name || "User",
            email: userData.userData?.email || "user@example.com",
            department: userData.userRole === "board_admin" ? "Board Administration" : 
                       userData.userRole === "club_admin" ? "Club Management" : "Member",
            status: "Available",
          }));
          
          // Fetch more detailed user information
          if (userData.userId) {
            fetchUserDetails(userData.userId);
            fetchUserPors(userData.userId);
          }
          
          // Fetch badges with the real userId
          fetchUserBadges(userData.userId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      console.log("Fetching detailed user information for:", userId);
      const response = await fetch(
        `http://localhost:5000/users/users/${userId}/details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include any auth headers if needed
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }

      const detailedUserData = await response.json();
      console.log("Detailed user data:", detailedUserData);
      
      // Update user profile with the detailed information
      setUserProfile(prev => ({
        ...prev,
        name: detailedUserData.name || prev.name,
        email: detailedUserData.email_id || prev.email,
        status: detailedUserData.status || prev.status,
        photoUrl: detailedUserData.profile_image.filename || prev.photoUrl,
        // Add any additional fields from the detailed API response
      }));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchUserPors = async (userId) => {
    try {
      console.log("Fetching PORs for user:", userId);
      const response = await fetch(
        `http://localhost:5000/por2/por/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include any auth headers if needed
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user PORs: ${response.status}`);
      }

      const data = await response.json();
      console.log("User PORs data:", data);
      setUserPors(data);
    } catch (error) {
      console.error("Error fetching user PORs:", error);
    }
  };

  const fetchUserBadges = async (userId) => {
    try {
      console.log("Fetching badges for user:", userId);
      const response = await fetch(
        `http://localhost:5000/badges/users/${userId}/badges/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include any auth headers that Postman is using
            // 'Authorization': 'Bearer your-token-here',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch badges: ${response.status}`);
      }

      const data = await response.json();
      console.log("Badges data:", data);
      setUserBadges(data);
    } catch (error) {
      console.error("Error fetching user badges:", error);
    }
  };

  const toggleDialog = (key, value) => {
    setDialogs((prev) => ({ ...prev, [key]: value }));
    
    // Initialize dialog input values when opening
    if (value && key === "profile") {
      // Set the status input value when opening the dialog
      setStatusInputValue(userProfile.status);
    } else if (value && key === "reset") {
      setDialogInputs(prev => ({
        ...prev,
        newPassword: "",
        confirmPassword: ""
      }));
    }
  };

  const handleDialogInputChange = (field, value) => {
    setDialogInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetPassword = () => {
    const { newPassword, confirmPassword } = dialogInputs;
    if (newPassword && newPassword === confirmPassword) {
      console.log("Password reset requested");
      toggleDialog("reset", false);
    } else console.error("Passwords don't match or are empty");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      uploadProfilePhoto(file);
    }
  };

  const uploadProfilePhoto = async (file) => {
    if (!userId || !file) return;

    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      setIsLoading(true);
      
      // Check if user already has a photo to determine whether to use POST or PUT
      let method = userProfile.photoUrl && userProfile.photoUrl !== "/api/placeholder/150/150" ? "PUT" : "POST";
      let url = `http://localhost:5000/euser/users/${userId}/profile-photo`;
      
      const response = await fetch(url, {
        method: method,
        body: formData,
        // Add any necessary headers for authentication
      });

      if (!response.ok) {
        throw new Error(`Failed to ${method === "POST" ? "upload" : "update"} profile photo`);
      }

      const data = await response.json();
      
      // Update the user profile with the new photo URL
      setUserProfile(prev => ({
        ...prev,
        photoUrl: data.photoUrl
      }));

      showNotification(`Profile photo ${method === "POST" ? "uploaded" : "updated"} successfully`, "success");
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      showNotification("Failed to upload profile photo", "error");
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  const handleRemovePhoto = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/euser/users/${userId}/profile-photo`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Add any necessary headers for authentication
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove profile photo");
      }

      // Reset the photo URL to placeholder
      setUserProfile(prev => ({
        ...prev,
        photoUrl: "/api/placeholder/150/150"
      }));

      showNotification("Profile photo removed successfully", "success");
    } catch (error) {
      console.error("Error removing profile photo:", error);
      showNotification("Failed to remove profile photo", "error");
    } finally {
      setIsLoading(false);
      toggleDialog("removePhoto", false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!userId || !statusInputValue) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/euser/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add any necessary headers for authentication
        },
        body: JSON.stringify({ status: statusInputValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update the status in the user profile
      setUserProfile(prev => ({
        ...prev,
        status: statusInputValue
      }));

      showNotification("Status updated successfully", "success");
      toggleDialog("profile", false);
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Failed to update status", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  };

  const DialogTemplate = ({
    open,
    onClose,
    title,
    children,
    onAction,
    actionText,
    actionColor = "primary",
    disableAction = false,
  }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onAction} color={actionColor} disabled={disableAction}>
          {actionText}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Format date string to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Dark Mode
          </Typography>
          <ThemeToggle />
        </Box>
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 4, boxShadow: theme.shadows[3], borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={`http://localhost:5000/uploads/${userProfile.photoUrl}`}
                  sx={{ width: 100, height: 100 }}
                />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </label>
              </Box>
              {userProfile.photoUrl && userProfile.photoUrl !== "/api/placeholder/150/150" && (
                <Button
                  startIcon={<DeleteIcon />}
                  color="error"
                  size="small"
                  onClick={() => toggleDialog("removePhoto", true)}
                  sx={{ mt: 1 }}
                >
                  Remove Photo
                </Button>
              )}
            </Grid>
            <Grid item xs>
              <Typography variant="h5">{userProfile.name}</Typography>
              <Typography color="text.secondary">
                {userProfile.email}
              </Typography>
              <Typography color="text.secondary">
                Department: {userProfile.department}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Status: {userProfile.status}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => toggleDialog("profile", true)}
                >
                  Edit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Positions of Responsibility Card */}
      <Card sx={{ mb: 4, boxShadow: theme.shadows[3], borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            p: 2, 
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: 'white'
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            My Positions of Responsibility
          </Typography>
          <Typography variant="body2">
            Current roles and responsibilities
          </Typography>
        </Box>
        
        <CardContent>
          {isLoading ? (
            <Typography color="text.secondary">Loading positions...</Typography>
          ) : userPors.length > 0 ? (
            <Box sx={{ mt: 1 }}>
              {userPors.map((por) => (
                <Paper 
                  key={por._id} 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark' 
                      ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
                      : `linear-gradient(145deg, #ffffff 0%, ${theme.palette.grey[50]} 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Typography variant="h6" fontWeight="bold">
                        {por.privilegeTypeId.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {por.privilegeTypeId.description !== 'n' ? por.privilegeTypeId.description : 'No description available'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Term: {formatDate(por.start_date)} - {formatDate(por.end_date)}
                        </Typography>
                        <Chip 
                          label={`Board: ${por.board_id.name}`} 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.secondary.light,
                            color: theme.palette.secondary.contrastText
                          }} 
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>No positions of responsibility yet</Typography>
              <Typography variant="body2" color="text.secondary">
                Your roles and responsibilities will appear here when assigned.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Badges Card */}
      <Card sx={{ mb: 4, boxShadow: theme.shadows[3], borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            p: 2, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white'
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            My Achievements & Badges
          </Typography>
          <Typography variant="body2">
            Showcase of your recognitions and accomplishments
          </Typography>
        </Box>
        
        <CardContent>
          {isLoading ? (
            <Typography color="text.secondary">Loading badges...</Typography>
          ) : userBadges.length > 0 ? (
            <Box sx={{ mt: 1 }}>
              {userBadges.map((badge) => (
                <Paper 
                  key={badge._id} 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark' 
                      ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
                      : `linear-gradient(145deg, #ffffff 0%, ${theme.palette.grey[50]} 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          fontSize: '1.8rem',
                          background: theme.palette.mode === 'dark' 
                            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {badge.badge_type_id.emoji}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" fontWeight="bold">
                        {badge.badge_type_id.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {badge.badge_type_id.description}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Awarded on: {formatDate(badge.given_on)}
                        </Typography>
                        {badge.club_id && (
                          <Chip 
                            label={`Club: ${badge.club_id}`} 
                            size="small" 
                            sx={{ 
                              bgcolor: theme.palette.primary.light,
                              color: theme.palette.primary.contrastText
                            }} 
                          />
                        )}
                        {badge.board_id && (
                          <Chip 
                            label={`Board: ${badge.board_id}`} 
                            size="small" 
                            sx={{ 
                              bgcolor: theme.palette.secondary.light,
                              color: theme.palette.secondary.contrastText
                            }} 
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>No badges yet</Typography>
              <Typography variant="body2" color="text.secondary">
                Badges will appear here when you receive recognition for your contributions.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card sx={{ mb: 4, boxShadow: theme.shadows[3], borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={muteNotifications}
                  onChange={(e) => setMuteNotifications(e.target.checked)}
                />
              }
              label="Mute All Notifications"
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card sx={{ mb: 4, boxShadow: theme.shadows[3], borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => toggleDialog("reset", true)}
              sx={{ mr: 2 }}
            >
              Reset Password
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => toggleDialog("delete", true)}
            >
              Delete My Account
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DialogTemplate
        open={dialogs.delete}
        onClose={() => toggleDialog("delete", false)}
        title="Delete Account"
        onAction={() => {
          console.log("Account deletion requested");
          toggleDialog("delete", false);
        }}
        actionText="Delete"
        actionColor="error"
      >
        <DialogContentText>
          Are you sure you want to delete your account? This action cannot be
          undone and all your data will be permanently removed.
        </DialogContentText>
      </DialogTemplate>

      {/* Reset Password Dialog */}
      <DialogTemplate
        open={dialogs.reset}
        onClose={() => toggleDialog("reset", false)}
        title="Reset Password"
        onAction={handleResetPassword}
        actionText="Reset"
        disableAction={!dialogInputs.newPassword || dialogInputs.newPassword !== dialogInputs.confirmPassword}
      >
        <DialogContentText sx={{ mb: 2 }}>
          Enter your new password below.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="New Password"
          type="password"
          fullWidth
          variant="outlined"
          value={dialogInputs.newPassword}
          onChange={(e) => handleDialogInputChange("newPassword", e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Confirm New Password"
          type="password"
          fullWidth
          variant="outlined"
          value={dialogInputs.confirmPassword}
          onChange={(e) => handleDialogInputChange("confirmPassword", e.target.value)}
          error={dialogInputs.confirmPassword !== dialogInputs.newPassword && dialogInputs.confirmPassword !== ""}
          helperText={
            dialogInputs.confirmPassword !== dialogInputs.newPassword && dialogInputs.confirmPassword !== ""
              ? "Passwords don't match"
              : ""
          }
        />
      </DialogTemplate>

      {/* Profile Update Dialog - Modified to fix flickering */}
      <Dialog 
        open={dialogs.profile} 
        onClose={() => toggleDialog("profile", false)}
      >
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Edit your status to let others know your availability.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Status"
            fullWidth
            variant="outlined"
            value={statusInputValue}
            onChange={(e) => setStatusInputValue(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleDialog("profile", false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Photo Confirmation Dialog */}
      <DialogTemplate
        open={dialogs.removePhoto}
        onClose={() => toggleDialog("removePhoto", false)}
        title="Remove Profile Photo"
        onAction={handleRemovePhoto}
        actionText="Remove"
        actionColor="error"
      >
        <DialogContentText>
          Are you sure you want to remove your profile photo? This action cannot be undone.
        </DialogContentText>
      </DialogTemplate>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}