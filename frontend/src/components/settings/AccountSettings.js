"use client";
import { useState } from "react";
import {
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
  Snackbar,
  Alert,
} from "@mui/material";

export default function AccountSettings({ userId }) {
  const theme = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [muteNotifications, setMuteNotifications] = useState(false);
  
  const [dialogs, setDialogs] = useState({
    delete: false,
    reset: false,
  });

  const [dialogInputs, setDialogInputs] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const toggleDialog = (key, value) => {
    setDialogs((prev) => ({ ...prev, [key]: value }));
    
    // Initialize dialog input values when opening
    if (value && key === "reset") {
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

  const handleResetPassword = async () => {
    const { newPassword, confirmPassword } = dialogInputs;
    if (newPassword && newPassword === confirmPassword) {
      try {
        // Here you would typically send a request to your backend
        console.log("Password reset requested");
        
        // Simulate a successful password reset
        showNotification("Password reset successfully", "success");
        toggleDialog("reset", false);
      } catch (error) {
        console.error("Error resetting password:", error);
        showNotification("Failed to reset password", "error");
      }
    } else {
      showNotification("Passwords don't match or are empty", "error");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Here you would typically send a request to your backend
      console.log("Account deletion requested");
      
      // Simulate a successful account deletion
      showNotification("Account deleted successfully", "success");
      toggleDialog("delete", false);
      
      // Redirect or perform additional actions after deletion
    } catch (error) {
      console.error("Error deleting account:", error);
      showNotification("Failed to delete account", "error");
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
        onAction={handleDeleteAccount}
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