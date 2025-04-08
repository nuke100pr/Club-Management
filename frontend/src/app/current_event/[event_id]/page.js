"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Snackbar,
  Tooltip,
  Fab
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Workspaces as WorkspacesIcon
} from "@mui/icons-material";

const EventsPage = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.event_id;
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // New state for event following status
  const [isClubFollowed, setIsClubFollowed] = useState(false);
  const [isBoardFollowed, setIsBoardFollowed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data for permissions
        const userData = await fetchUserData();
        if (userData) {
          setCurrentUser(userData.userData);
          setUserId(userData.userId);
          setIsAdmin(
            userData.userRole === "super_admin" || 
            userData.userRole === "board_admin" || 
            userData.userRole === "club_admin"
          );
        }

        if (eventId) {
          // Fetch single event details
          const eventResponse = await fetch(`http://localhost:5000/events/${eventId}`);
          if (!eventResponse.ok) throw new Error('Failed to fetch event');
          const eventResult = await eventResponse.json();
          
          if (!eventResult.success) throw new Error(eventResult.message || 'Failed to fetch event');
          setCurrentEvent(eventResult.data);

          // Check if user follows the club or board associated with the event
          if (userData && eventResult.data) {
            if (eventResult.data.club_id) {
              const clubFollowStatus = await checkFollowStatus(
                eventResult.data.club_id._id || eventResult.data.club_id,
                'club'
              );
              setIsClubFollowed(clubFollowStatus);
            }
            if (eventResult.data.board_id) {
              const boardFollowStatus = await checkFollowStatus(
                eventResult.data.board_id._id || eventResult.data.board_id,
                'board'
              );
              setIsBoardFollowed(boardFollowStatus);
            }
          }

          // Fetch RSVPs for this event
          const rsvpResponse = await fetch(`http://localhost:5000/events/${eventId}/rsvp`);
          if (!rsvpResponse.ok) throw new Error('Failed to fetch RSVPs');
          const rsvpResult = await rsvpResponse.json();
          
          setRsvps(Array.isArray(rsvpResult.data) ? rsvpResult.data : []);

          // Check if current user is registered
          if (userData && Array.isArray(rsvpResult.data)) {
            setIsRegistered(rsvpResult.data.some(r => r.user_id === userData.userId));
          }
        } else {
          // Fetch all events with RSVP counts
          const url = userId 
            ? `http://localhost:5000/events?userId=${userId}`
            : 'http://localhost:5000/events';
            
          const eventsResponse = await fetch(url);
          if (!eventsResponse.ok) throw new Error('Failed to fetch events');
          const eventsResult = await eventsResponse.json();
          
          if (!eventsResult.success) throw new Error(eventsResult.message || 'Failed to fetch events');

          // Fetch registration counts and follow status for each event
          const eventsWithCounts = await Promise.all(
            (eventsResult.data || []).map(async (event) => {
              const rsvpResponse = await fetch(
                `http://localhost:5000/events/${event._id}/rsvp`
              );
              
              // Check if user follows the club or board
              let clubFollowed = false;
              let boardFollowed = false;
              
              if (userData) {
                if (event.club_id) {
                  clubFollowed = await checkFollowStatus(
                    event.club_id._id || event.club_id,
                    'club'
                  );
                }
                if (event.board_id) {
                  boardFollowed = await checkFollowStatus(
                    event.board_id._id || event.board_id,
                    'board'
                  );
                }
              }
              
              // Check if user is registered
              let registered = false;
              if (rsvpResponse.ok) {
                const rsvpResult = await rsvpResponse.json();
                registered = Array.isArray(rsvpResult.data) && 
                  rsvpResult.data.some(r => r.user_id === userData?.userId);
              }
              
              return {
                ...event,
                registeredCount: rsvpResponse.ok ? (rsvpResult.data?.length || 0) : 0,
                isClubFollowed: clubFollowed,
                isBoardFollowed: boardFollowed,
                registered
              };
            })
          );

          setEvents(eventsWithCounts);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
        setNotification({
          open: true,
          message: "Failed to load data",
          severity: "error"
        });
      }
    };

    // Helper function to check follow status
    const checkFollowStatus = async (id, type) => {
      try {
        if (!userId) return false;
        
        const response = await fetch(
          `http://localhost:5000/${type}s/${id}/followers/${userId}`
        );
        if (!response.ok) return false;
        
        const result = await response.json();
        return result.data?.isFollowing || false;
      } catch (error) {
        console.error(`Error checking ${type} follow status:`, error);
        return false;
      }
    };

    fetchData();
  }, [eventId, userId]);

  const handleRegisterForEvent = async () => {
    try {
      if (!currentUser) {
        setNotification({
          open: true,
          message: "Please login to register for events",
          severity: "warning"
        });
        return;
      }
      
      const response = await fetch(`http://localhost:5000/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      });
      
      if (!response.ok) throw new Error('Failed to register for event');
      const result = await response.json();
      
      if (!result.success) throw new Error(result.message || 'Registration failed');
      
      // Update state to reflect registration
      setIsRegistered(true);
      
      // Update RSVPs list
      const updatedRsvps = [...rsvps, {
        _id: result.data._id,
        user_id: userId,
        timestamp: new Date().toISOString(),
        user_id: {
          _id: userId,
          name: currentUser.name,
          profile_picture: currentUser.profile_picture
        }
      }];
      setRsvps(updatedRsvps);
      
      // If viewing all events, update the specific event's registration status
      if (!eventId) {
        setEvents(events.map(event => 
          event._id === eventId 
            ? { 
                ...event, 
                registered: true,
                registeredCount: event.registeredCount + 1 
              } 
            : event
        ));
      }
      
      setNotification({
        open: true,
        message: "Registration successful",
        severity: "success"
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to register for event",
        severity: "error"
      });
    }
  };

  const handleUnregisterFromEvent = async () => {
    try {
      if (!currentUser) return;
      
      // Find the RSVP ID for the current user
      const userRsvp = rsvps.find(r => r.user_id === userId || r.user_id._id === userId);
      if (!userRsvp) return;
      
      const response = await fetch(`http://localhost:5000/events/rsvp/${userRsvp._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to unregister from event');
      const result = await response.json();
      
      if (!result.success) throw new Error(result.message || 'Unregistration failed');
      
      // Update state to reflect unregistration
      setIsRegistered(false);
      
      // Update RSVPs list
      const updatedRsvps = rsvps.filter(r => 
        r.user_id !== userId && r.user_id._id !== userId
      );
      setRsvps(updatedRsvps);
      
      // If viewing all events, update the specific event's registration status
      if (!eventId) {
        setEvents(events.map(event => 
          event._id === eventId 
            ? { 
                ...event, 
                registered: false,
                registeredCount: Math.max(0, event.registeredCount - 1)
              } 
            : event
        ));
      }
      
      setNotification({
        open: true,
        message: "Unregistered from event",
        severity: "success"
      });
    } catch (error) {
      console.error('Error unregistering from event:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to unregister from event",
        severity: "error"
      });
    }
  };

  const handleDeleteRsvp = async (rsvpId) => {
    try {
      const response = await fetch(`http://localhost:5000/events/rsvp/${rsvpId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to remove RSVP');
      const result = await response.json();
      
      if (!result.success) throw new Error(result.message || 'Failed to remove RSVP');
      
      // Refresh RSVPs
      const rsvpResponse = await fetch(`http://localhost:5000/events/${eventId}/rsvp`);
      if (rsvpResponse.ok) {
        const rsvpResult = await rsvpResponse.json();
        setRsvps(Array.isArray(rsvpResult.data) ? rsvpResult.data : []);
        setIsRegistered(false);
      }
      
      setNotification({
        open: true,
        message: "Registration removed",
        severity: "success"
      });
    } catch (error) {
      console.error('Error removing RSVP:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to remove registration",
        severity: "error"
      });
    }
  };

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete event');
      const result = await response.json();
      
      if (!result.success) throw new Error(result.message || 'Failed to delete event');
      
      router.push('/events');
      setNotification({
        open: true,
        message: "Event deleted successfully",
        severity: "success"
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to delete event",
        severity: "error"
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  // Single Event View
  if (eventId && currentEvent) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/events')}
          sx={{ mb: 3 }}
        >
          Back to All Events
        </Button>

        <Card sx={{ mb: 4 }}>
          {currentEvent.image && (
            <CardMedia
              component="img"
              height="300"
              image={currentEvent.image}
              alt={currentEvent.name}
            />
          )}
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {(isClubFollowed || isBoardFollowed || isRegistered) && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {isClubFollowed && (
                    <Tooltip title="You follow this club">
                      <GroupIcon color="primary" fontSize="small" />
                    </Tooltip>
                  )}
                  {isBoardFollowed && (
                    <Tooltip title="You follow this board">
                      <WorkspacesIcon color="secondary" fontSize="small" />
                    </Tooltip>
                  )}
                  {isRegistered && (
                    <Tooltip title="You're registered for this event">
                      <FavoriteIcon color="error" fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
              )}
              <Typography variant="h4" gutterBottom sx={{ flexGrow: 1 }}>
                {currentEvent.name}
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon color="primary" />
                  <Typography>{formatDate(currentEvent.timestamp)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon color="primary" />
                  <Typography>
                    {formatTime(currentEvent.timestamp)} ({currentEvent.duration} minutes)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="primary" />
                  <Typography>{currentEvent.venue}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Event Type</Typography>
                <Chip label={currentEvent.event_type_id} color="primary" />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" paragraph>
              {currentEvent.description}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Box>
                <Button
                  variant={isRegistered ? "contained" : "outlined"}
                  startIcon={<GroupIcon />}
                  onClick={isRegistered ? handleUnregisterFromEvent : handleRegisterForEvent}
                  sx={{
                    backgroundColor: isRegistered ? "success.main" : "transparent",
                    color: isRegistered ? "common.white" : "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: isRegistered ? "success.dark" : "action.hover",
                    },
                  }}
                >
                  {isRegistered ? 'Registered' : 'Register Now'}
                </Button>
              </Box>

              {isAdmin && (
                <Box>
                  <IconButton
                    onClick={() => router.push(`/events/${eventId}/edit`)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleDeleteEvent}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom>
          Registrations ({rsvps.length})
        </Typography>
        
        {rsvps.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Registration Date</TableCell>
                  {isAdmin && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {rsvps.map((rsvp) => (
                  <TableRow key={rsvp._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={rsvp.user_id?.profile_picture}>
                          <PersonIcon />
                        </Avatar>
                        <Typography>{rsvp.user_id?.name || 'Unknown User'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatDate(rsvp.timestamp)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteRsvp(rsvp._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No registrations yet
          </Typography>
        )}

        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // All Events View
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">All Events</Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/events/create')}
          >
            Create Event
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {event.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={event.image}
                  alt={event.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {(event.isClubFollowed || event.isBoardFollowed || event.registered) && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {event.isClubFollowed && (
                        <Tooltip title="You follow this club">
                          <GroupIcon color="primary" fontSize="small" />
                        </Tooltip>
                      )}
                      {event.isBoardFollowed && (
                        <Tooltip title="You follow this board">
                          <WorkspacesIcon color="secondary" fontSize="small" />
                        </Tooltip>
                      )}
                      {event.registered && (
                        <Tooltip title="You're registered for this event">
                          <FavoriteIcon color="error" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                  <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                    {event.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.description.substring(0, 100)}...
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon fontSize="small" />
                  <Typography variant="body2">
                    {formatDate(event.timestamp)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon fontSize="small" />
                  <Typography variant="body2">{event.venue}</Typography>
                </Box>
              </CardContent>
              <CardContent>
                <Button
                  fullWidth
                  variant={event.registered ? "contained" : "outlined"}
                  startIcon={<GroupIcon />}
                  onClick={() => router.push(`/events/${event._id}`)}
                  sx={{
                    backgroundColor: event.registered ? "success.main" : "transparent",
                    color: event.registered ? "common.white" : "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: event.registered ? "success.dark" : "action.hover",
                    },
                  }}
                >
                  {event.registeredCount || 0} Registered
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventsPage;