"use client";
import { useState, useEffect } from "react";
import {
  Typography,
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
  Snackbar,
  Alert,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAuthToken } from "@/utils/auth";

export default function UserProfileCard({ 
  userProfile, 
  userId, 
  setUserProfile, 
  isLoading, 
  setIsLoading 
}) {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusInputValue, setStatusInputValue] = useState("");
  const [dialogs, setDialogs] = useState({
    profile: false,
    removePhoto: false,
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  const toggleDialog = (key, value) => {
    setDialogs((prev) => ({ ...prev, [key]: value }));
    
    // Initialize dialog input values when opening
    if (value && key === "profile") {
      // Set the status input value when opening the dialog
      setStatusInputValue(userProfile.status);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      uploadProfilePhoto(file);
    }
  };

  const uploadProfilePhoto = async (file) => {
    if (!userId || !file || !authToken) return;

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
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
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
    if (!userId || !authToken) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/euser/users/${userId}/profile-photo`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`,
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
    if (!userId || !statusInputValue || !authToken) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/euser/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`,
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

  return (
    <>
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
    </>
  );
}
