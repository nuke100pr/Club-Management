"use client";
import { useState } from "react";
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
} from "@mui/material";
import ThemeToggle from "../../components/ThemeToggle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function SettingsPage() {
  const theme = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Jane Doe",
    email: "jane.doe@example.com",
    department: "Product Development",
    status: "Available",
    photoUrl: "/api/placeholder/150/150",
  });

  const [dialogs, setDialogs] = useState({
    delete: false,
    reset: false,
    profile: false,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newStatus, setNewStatus] = useState(userProfile.status);

  const toggleDialog = (key, value) =>
    setDialogs((prev) => ({ ...prev, [key]: value }));

  const handleResetPassword = () => {
    if (newPassword && newPassword === confirmPassword) {
      console.log("Password reset requested");
      toggleDialog("reset", false);
      setNewPassword("");
      setConfirmPassword("");
    } else console.error("Passwords don't match or are empty");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) alert(`File "${file.name}" selected.`);
  };

  const handleUpdateProfile = () => {
    setUserProfile((prev) => ({ ...prev, status: newStatus }));
    toggleDialog("profile", false);
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
                  src={userProfile.photoUrl}
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
                  onClick={() => {
                    setNewStatus(userProfile.status);
                    toggleDialog("profile", true);
                  }}
                >
                  Edit
                </Button>
              </Box>
            </Grid>
          </Grid>
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
        onClose={() => {
          toggleDialog("reset", false);
          setNewPassword("");
          setConfirmPassword("");
        }}
        title="Reset Password"
        onAction={handleResetPassword}
        actionText="Reset"
        disableAction={!newPassword || newPassword !== confirmPassword}
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
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Confirm New Password"
          type="password"
          fullWidth
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword !== newPassword && confirmPassword !== ""}
          helperText={
            confirmPassword !== newPassword && confirmPassword !== ""
              ? "Passwords don't match"
              : ""
          }
        />
      </DialogTemplate>

      {/* Profile Update Dialog */}
      <DialogTemplate
        open={dialogs.profile}
        onClose={() => toggleDialog("profile", false)}
        title="Update Profile"
        onAction={handleUpdateProfile}
        actionText="Update"
      >
        <DialogContentText sx={{ mb: 2 }}>
          Edit your status to let others know your availability.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Status"
          fullWidth
          variant="outlined"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogTemplate>
    </Container>
  );
}
