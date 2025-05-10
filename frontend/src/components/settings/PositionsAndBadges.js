"use client";
import { useTheme } from "@mui/material";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Paper,
  Grid,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import { useState, useEffect } from "react";
import { getAuthToken } from "@/utils/auth";

export default function PositionsAndBadges({ userPors, userBadges, isLoading }) {
  const theme = useTheme();
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  if (!authToken) {
    return;
  }

  // Format date string to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
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
                          label={`Board: ${por?.board_id?.name}`} 
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
    </>
  );
}
