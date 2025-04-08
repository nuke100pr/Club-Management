"use client";
import { useState } from "react";
import { Container, Typography, FormGroup, FormControlLabel, Switch, Button, Card, CardContent } from "@mui/material";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [generalSettings, setGeneralSettings] = useState({
    darkMode: false,
    autoUpdate: true,
  });

  const handleNotificationChange = (event) => {
    setNotifications({ ...notifications, [event.target.name]: event.target.checked });
  };

  const handleGeneralChange = (event) => {
    setGeneralSettings({ ...generalSettings, [event.target.name]: event.target.checked });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Notifications</Typography>
          <FormGroup>
            <FormControlLabel control={<Switch checked={notifications.email} onChange={handleNotificationChange} name="email" />} label="Email Notifications" />
            <FormControlLabel control={<Switch checked={notifications.sms} onChange={handleNotificationChange} name="sms" />} label="SMS Notifications" />
            <FormControlLabel control={<Switch checked={notifications.push} onChange={handleNotificationChange} name="push" />} label="Push Notifications" />
          </FormGroup>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">General Settings</Typography>
          <FormGroup>
            <FormControlLabel control={<Switch checked={generalSettings.darkMode} onChange={handleGeneralChange} name="darkMode" />} label="Dark Mode" />
            <FormControlLabel control={<Switch checked={generalSettings.autoUpdate} onChange={handleGeneralChange} name="autoUpdate" />} label="Auto Update" />
          </FormGroup>
        </CardContent>
      </Card>

      <Button variant="contained" color="primary">Save Changes</Button>
    </Container>
  );
}
