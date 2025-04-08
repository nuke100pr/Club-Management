"use client";
import React, { useEffect } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { fetchUserData } from '@/utils/auth';

const UserDataPage = () => {
  const [loading, setLoading] = React.useState(true);
  const [userData, setUserData] = React.useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const data = await fetchUserData();
        setUserData(data);
        console.log('User data:', data); // Logging data to console
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Data
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : userData ? (
        <div>
          <Typography variant="body1">
            User ID: {userData.userId}
          </Typography>
          <Typography variant="body1">
            Is Super Admin: {userData.isSuperAdmin ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body1">
            Data: {JSON.stringify(userData.userData)}
          </Typography>
        </div>
      ) : (
        <Typography variant="body1" color="error">
          Failed to load user data or no user logged in.
        </Typography>
      )}
    </Container>
  );
};

export default UserDataPage;