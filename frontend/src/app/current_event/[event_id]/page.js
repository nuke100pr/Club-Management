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
  Fab,
  AvatarGroup,
  alpha
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
  Workspaces as WorkspacesIcon,
  Share as ShareIcon,
  Event as EventIcon
} from "@mui/icons-material";
import EventForm from "@/components/events/EventForm";

// Custom styling constants that align with our design system
const COLORS = {
  primary: {
    main: "#4776E6",
    light: "#6a98ff",
    dark: "#3a5fc0",
  },
  secondary: "#8E54E9",
  background: {
    default: "#f8faff",
    paper: "#ffffff",
    sidebar: "rgba(245, 247, 250, 0.7)",
  },
  text: {
    primary: "#2A3B4F",
    secondary: "#607080",
  },
  gradient: "linear-gradient(45deg, #4776E6, #8E54E9)",
  gradientHover: "linear-gradient(45deg, #3a5fc0, #7b1fa2)",
};

const SHADOWS = {
  card: "0 4px 12px rgba(95, 150, 230, 0.1)",
  cardHover: "0 12px 20px rgba(95, 150, 230, 0.2)",
  button: "0 4px 10px rgba(71, 118, 230, 0.3)",
  buttonHover: "0 6px 15px rgba(71, 118, 230, 0.4)",
};

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
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // New state for event following status
  const [isClubFollowed, setIsClubFollowed] = useState(false);
  const [isBoardFollowed, setIsBoardFollowed] = useState(false);

  const [editFormData, setEditFormData] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
          const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`);
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
          const rsvpResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`);
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
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/events?userId=${userId}`
            : '${process.env.NEXT_PUBLIC_BACKEND_URL}/events';
            
          const eventsResponse = await fetch(url);
          if (!eventsResponse.ok) throw new Error('Failed to fetch events');
          const eventsResult = await eventsResponse.json();
          
          if (!eventsResult.success) throw new Error(eventsResult.message || 'Failed to fetch events');

          // Fetch registration counts and follow status for each event
          const eventsWithCounts = await Promise.all(
            (eventsResult.data || []).map(async (event) => {
              const rsvpResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${event._id}/rsvp`
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/${type}s/${id}/followers/${userId}`
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`, {
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
    setConfirmDialog({
      open: true,
      title: "Confirm Unregistration",
      message: "Are you sure you want to cancel your registration for this event?",
      onConfirm: async () => {
        try {
          if (!currentUser) return;
          
          // Find the RSVP ID for the current user
          const userRsvp = rsvps.find(r => r.user_id === userId || r.user_id._id === userId);
          if (!userRsvp) return;
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/rsvp/${userRsvp._id}`, {
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
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleDeleteRsvp = async (rsvpId) => {
    setConfirmDialog({
      open: true,
      title: "Confirm Removal",
      message: "Are you sure you want to remove this registration?",
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/rsvp/${rsvpId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to remove RSVP');
          const result = await response.json();
          
          if (!result.success) throw new Error(result.message || 'Failed to remove RSVP');
          
          // Refresh RSVPs
          const rsvpResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`);
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
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleDeleteEvent = async () => {
    setConfirmDialog({
      open: true,
      title: "Confirm Event Deletion",
      message: "Are you sure you want to delete this event? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`, {
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
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleEditEvent = async (eventDetails) => {
    try {
      if (!currentUser) {
        setNotification({
          open: true,
          message: "Please login to edit events",
          severity: "warning"
        });
        return;
      }
      
      const formData = {
        name: eventDetails.name,
        venue: eventDetails.venue,
        timestamp: new Date(eventDetails.timestamp).toISOString().slice(0, 16),
        duration: eventDetails.duration,
        description: eventDetails.description,
        event_type_id: eventDetails.event_type_id || "Session",
        club_id: eventDetails.club_id?._id,
        board_id: eventDetails.board_id?._id,
        image: eventDetails.image || null,
      };

      setEditFormData(formData);
      setOpenEditDialog(true);
      setIsEditing(true);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to load event details",
        severity: "error"
      });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`;
      const method = "PUT";

      const multipartFormData = new FormData();
      multipartFormData.append("name", formData.name);
      multipartFormData.append("venue", formData.venue);
      multipartFormData.append("timestamp", new Date(formData.timestamp).toISOString());
      multipartFormData.append("duration", formData.duration);
      multipartFormData.append("description", formData.description);
      multipartFormData.append("event_type_id", formData.event_type_id || "Session");
      multipartFormData.append("club_id", formData.club_id);
      multipartFormData.append("board_id", formData.board_id);

      if (formData.image instanceof File) {
        multipartFormData.append("image", formData.image);
      } else if (formData.image && typeof formData.image === "string") {
        multipartFormData.append("image", formData.image);
      }

      const response = await fetch(url, {
        method: method,
        body: multipartFormData,
      });

      if (!response.ok) throw new Error('Failed to update event');
      const result = await response.json();

      // Refresh event data
      const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`);
      const eventResult = await eventResponse.json();
      setCurrentEvent(eventResult.data);

      setOpenEditDialog(false);
      setNotification({
        open: true,
        message: "Event updated successfully",
        severity: "success"
      });
    } catch (error) {
      console.error('Error updating event:', error);
      setNotification({
        open: true,
        message: error.message || "Failed to update event",
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

  const handleCloseDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100vh',
          backgroundColor: COLORS.background.default
        }}
      >
        <CircularProgress 
          sx={{ 
            color: COLORS.primary.main,
            mb: 3
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: COLORS.text.secondary,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 500
          }}
        >
          Loading events...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          backgroundColor: COLORS.background.default,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <Alert 
          severity="error"
          sx={{
            width: '100%',
            maxWidth: 600,
            mb: 3,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
          }}
        >
          {error}
        </Alert>
        <Button 
          onClick={() => window.location.reload()}
          sx={{ 
            background: COLORS.gradient,
            color: 'white',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 500,
            borderRadius: '8px',
            px: 4,
            py: 1.5,
            boxShadow: SHADOWS.button,
            '&:hover': {
              background: COLORS.gradientHover,
              boxShadow: SHADOWS.buttonHover,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Single Event View
  if (eventId && currentEvent) {
    return (
      <Box sx={{ 
        backgroundColor: COLORS.background.default, 
        minHeight: '100vh'
      }}>
        {/* Hero Section with Background Image */}
        <Box sx={{ 
          position: 'relative',
          height: { xs: '300px', md: '400px' },
          overflow: 'hidden',
          mb: 4
        }}>
          <Box
            component="img"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.7)",
            }}
            src={currentEvent.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${currentEvent.image}` : "/event-placeholder.jpg"}
            alt={currentEvent.name}
          />
          
          {/* Overlay Content */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: { xs: 2, md: 4 }
          }}>
            {/* Back Button */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/events')}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white', 
                alignSelf: 'flex-start',
                borderRadius: '8px',
                fontWeight: 500,
                '&:hover': { 
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back to All Events
            </Button>
            
            {/* Event Title */}
            <Box sx={{ 
              px: { xs: 2, md: 6 },
              py: 3,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)'
            }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  color: 'white',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
                }}
              >
                {currentEvent.name}
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mt: 2
              }}>
                <Chip 
                  icon={<CalendarIcon style={{ color: 'white' }} />}
                  label={formatDate(currentEvent.timestamp)}
                  sx={{ 
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    borderRadius: '8px',
                    height: '28px',
                    '& .MuiChip-label': { fontWeight: 500 }
                  }}
                />
                <Chip 
                  icon={<TimeIcon style={{ color: 'white' }} />}
                  label={formatTime(currentEvent.timestamp)}
                  sx={{ 
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    borderRadius: '8px',
                    height: '28px',
                    '& .MuiChip-label': { fontWeight: 500 }
                  }}  
                />
                <Chip 
                  icon={<LocationIcon style={{ color: 'white' }} />}
                  label={currentEvent.venue}
                  sx={{ 
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    borderRadius: '8px',
                    height: '28px',
                    '& .MuiChip-label': { fontWeight: 500 }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
          <Grid container spacing={4}>
            {/* Left Content - Event Details */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  borderRadius: '16px',
                  boxShadow: SHADOWS.card,
                  transition: 'all 0.3s ease',
                  mb: 4,
                  backgroundColor: COLORS.background.paper,
                  borderTop: `4px solid ${COLORS.primary.main}`
                }}
              >
                <Typography 
                  variant="h5" 
                  component="h2"
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600, 
                    color: COLORS.text.primary,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    backgroundImage: COLORS.gradient,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  About This Event
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: COLORS.text.secondary,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    lineHeight: 1.7,
                    mb: 4
                  }}
                  dangerouslySetInnerHTML={{ __html: currentEvent.description }}
                />
                
                <Divider sx={{ my: 3, borderColor: alpha(COLORS.primary.main, 0.2) }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {isRegistered ? (
                    <Button
                      variant="outlined"
                      onClick={handleUnregisterFromEvent}
                      startIcon={<CloseIcon />}
                      sx={{
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        fontWeight: 500,
                        '&:hover': {
                          borderColor: '#b71c1c',
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Cancel Registration
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleRegisterForEvent}
                      startIcon={<EventIcon />}
                      sx={{
                        background: COLORS.gradient,
                        color: 'white',
                        borderRadius: '8px',
                        px: 4,
                        py: 1.25,
                        fontWeight: 500,
                        boxShadow: SHADOWS.button,
                        '&:hover': {
                          background: COLORS.gradientHover,
                          boxShadow: SHADOWS.buttonHover,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Register for Event
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    sx={{
                      borderColor: COLORS.primary.main,
                      color: COLORS.primary.main,
                      borderRadius: '8px',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: COLORS.primary.dark,
                        backgroundColor: alpha(COLORS.primary.main, 0.04),
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </Paper>
              
              {/* Registrations */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  borderRadius: '16px',
                  boxShadow: SHADOWS.card,
                  mb: 4,
                  backgroundColor: COLORS.background.paper,
                  borderTop: `4px solid ${COLORS.secondary}`
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600, 
                    color: COLORS.text.primary,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    backgroundImage: COLORS.gradient,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Registrations ({rsvps.length})
                </Typography>
                
                {rsvps.length > 0 ? (
                  <TableContainer sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <Table sx={{ 
                      '& .MuiTableCell-root': { 
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        borderBottom: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
                      },
                      '& .MuiTableCell-head': {
                        backgroundColor: alpha(COLORS.primary.main, 0.05),
                        color: COLORS.text.primary,
                        fontWeight: 600
                      }
                    }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Registration Date</TableCell>
                          {isAdmin && <TableCell width="100px" align="center">Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rsvps.map((rsvp) => (
                          <TableRow 
                            key={rsvp._id}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: alpha(COLORS.primary.main, 0.02) 
                              },
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                  src={rsvp.user_id?.profile_picture}
                                  sx={{ 
                                    width: 40, 
                                    height: 40,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  <PersonIcon />
                                </Avatar>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {rsvp.user_id?.name || 'Unknown User'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {formatDate(rsvp.timestamp)}
                            </TableCell>
                            {isAdmin && (
                              <TableCell align="center">
                              <IconButton
                              onClick={() => handleDeleteRsvp(rsvp._id)}
                              sx={{
                                color: '#d32f2f',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.08)'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
                backgroundColor: alpha(COLORS.primary.main, 0.03),
                borderRadius: '8px'
              }}>
                <GroupIcon sx={{ 
                  fontSize: 48, 
                  color: COLORS.text.secondary,
                  opacity: 0.5,
                  mb: 2 
                }} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: COLORS.text.secondary,
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}
                >
                  No registrations yet. Be the first to register!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Organizer Card */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: '16px',
              boxShadow: SHADOWS.card,
              mb: 4,
              backgroundColor: COLORS.background.paper,
              borderTop: `4px solid ${COLORS.primary.light}`
            }}
          >
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: COLORS.text.primary,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}
            >
              Event Organizer
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={currentEvent.club_id?.logo || currentEvent.board_id?.logo}
                sx={{ 
                  width: 60, 
                  height: 60,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <WorkspacesIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 500 }}>
                  {currentEvent.club_id?.name || currentEvent.board_id?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  {currentEvent.club_id ? 'Club' : 'Board'}
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant={isClubFollowed || isBoardFollowed ? "outlined" : "contained"}
              onClick={async () => {
                try {
                  const type = currentEvent.club_id ? 'club' : 'board';
                  const id = currentEvent.club_id?._id || currentEvent.board_id?._id;
                  
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/${type}s/${id}/follow`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        user_id: userId
                      })
                    }
                  );
                  
                  if (!response.ok) throw new Error('Failed to toggle follow status');
                  const result = await response.json();
                  
                  if (currentEvent.club_id) {
                    setIsClubFollowed(!isClubFollowed);
                  } else {
                    setIsBoardFollowed(!isBoardFollowed);
                  }
                  
                  setNotification({
                    open: true,
                    message: result.message || (result.data.isFollowing ? 'Followed successfully' : 'Unfollowed successfully'),
                    severity: 'success'
                  });
                } catch (error) {
                  console.error('Error toggling follow:', error);
                  setNotification({
                    open: true,
                    message: error.message || 'Failed to toggle follow status',
                    severity: 'error'
                  });
                }
              }}
              startIcon={<FavoriteIcon />}
              fullWidth
              sx={{
                borderRadius: '8px',
                fontWeight: 500,
                ...(isClubFollowed || isBoardFollowed 
                  ? {
                      borderColor: COLORS.primary.main,
                      color: COLORS.primary.main,
                      '&:hover': {
                        borderColor: COLORS.primary.dark,
                        backgroundColor: alpha(COLORS.primary.main, 0.04),
                      }
                    }
                  : {
                      background: COLORS.gradient,
                      color: 'white',
                      boxShadow: SHADOWS.button,
                      '&:hover': {
                        background: COLORS.gradientHover,
                        boxShadow: SHADOWS.buttonHover,
                        transform: 'translateY(-2px)'
                      }
                    }),
                transition: 'all 0.3s ease'
              }}
            >
              {isClubFollowed || isBoardFollowed ? 'Following' : 'Follow'}
            </Button>
          </Paper>
          
          {/* Event Details Card */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: '16px',
              boxShadow: SHADOWS.card,
              mb: 4,
              backgroundColor: COLORS.background.paper,
              borderTop: `4px solid ${COLORS.secondary}`
            }}
          >
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: COLORS.text.primary,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}
            >
              Event Details
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 0.5 }}>
                Date & Time
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {formatDate(currentEvent.timestamp)} • {formatTime(currentEvent.timestamp)}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 0.5 }}>
                Location
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {currentEvent.venue}
              </Typography>
            </Box>
            
            {currentEvent.capacity && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 0.5 }}>
                  Capacity
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {rsvps.length} / {currentEvent.capacity} registered
                </Typography>
              </Box>
            )}
            
            {currentEvent.tags?.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.text.secondary, mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentEvent.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        height: '22px',
                        fontSize: '0.65rem',
                        backgroundColor: alpha(COLORS.primary.main, 0.1),
                        color: COLORS.primary.dark,
                        '&:hover': {
                          backgroundColor: alpha(COLORS.primary.main, 0.2)
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
          
          {/* Admin Actions */}
          {isAdmin && currentEvent && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: SHADOWS.card,
                backgroundColor: COLORS.background.paper,
                borderTop: `4px solid #d32f2f`
              }}
            >
              <Typography 
                variant="h6" 
                component="h3"
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: COLORS.text.primary,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}
              >
                Admin Actions
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => handleEditEvent(currentEvent)}
                fullWidth
                sx={{
                  mb: 2,
                  borderColor: COLORS.primary.main,
                  color: COLORS.primary.main,
                  borderRadius: '8px',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: COLORS.primary.dark,
                    backgroundColor: alpha(COLORS.primary.main, 0.04),
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Edit Event
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteEvent}
                fullWidth
                sx={{
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  borderRadius: '8px',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#b71c1c',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Delete Event
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
    
    {/* Confirmation Dialog */}
    <Dialog
      open={confirmDialog.open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 2,
          maxWidth: '500px',
          width: '100%'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600, 
        color: COLORS.text.primary,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
      }}>
        {confirmDialog.title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: COLORS.text.secondary }}>
          {confirmDialog.message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleCloseDialog}
          sx={{
            color: COLORS.text.secondary,
            fontWeight: 500,
            borderRadius: '8px',
            px: 3,
            '&:hover': {
              backgroundColor: alpha(COLORS.text.secondary, 0.04)
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={confirmDialog.onConfirm}
          sx={{
            backgroundColor: '#d32f2f',
            color: 'white',
            fontWeight: 500,
            borderRadius: '8px',
            px: 3,
            '&:hover': {
              backgroundColor: '#b71c1c'
            }
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Notification Snackbar */}
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleCloseNotification}
        severity={notification.severity}
        sx={{
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
    
    {/* Edit Dialog */}
    <Dialog
      open={openEditDialog}
      onClose={() => setOpenEditDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: COLORS.background.paper
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600, 
        color: COLORS.text.primary,
        borderBottom: `1px solid ${alpha(COLORS.primary.main, 0.1)}`
      }}>
        Edit Event
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <EventForm
          initialData={editFormData}
          onSubmit={handleFormSubmit}
          onCancel={() => setOpenEditDialog(false)}
          eventTypes={["Session", "Competition", "Workshop", "Meeting"]}
          isEditing={true}
        />
      </DialogContent>
    </Dialog>
  </Box>
);
}

// All Events View
return (
<Box sx={{ 
  backgroundColor: COLORS.background.default, 
  minHeight: '100vh',
  p: 4
}}>
  <Box sx={{ 
    maxWidth: 1400, 
    mx: 'auto',
    mb: 6
  }}>
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 4
    }}>
      <Typography 
        variant="h4" 
        component="h1"
        sx={{ 
          fontWeight: 600,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundImage: COLORS.gradient,
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Upcoming Events
      </Typography>
      
      {isAdmin && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/events/create')}
          sx={{
            background: COLORS.gradient,
            color: 'white',
            borderRadius: '8px',
            px: 4,
            py: 1.25,
            fontWeight: 500,
            boxShadow: SHADOWS.button,
            '&:hover': {
              background: COLORS.gradientHover,
              boxShadow: SHADOWS.buttonHover,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Create Event
        </Button>
      )}
    </Box>
    
    <Grid container spacing={4}>
      {events.map((event) => (
        <Grid item xs={12} sm={6} lg={4} key={event._id}>
          <Card
            onClick={() => router.push(`/events/${event._id}`)}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              boxShadow: SHADOWS.card,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: SHADOWS.cardHover,
                transform: 'translateY(-8px)'
              },
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Event Image */}
            <CardMedia
              component="img"
              height="180"
              image={event.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${event.image}` : "/event-placeholder.jpg"}
              alt={event.name}
              sx={{
                objectFit: 'cover',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                }
              }}
            />
            
            {/* Event Date Badge */}
            <Box sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              borderRadius: '8px',
              p: 1,
              textAlign: 'center',
              minWidth: '50px'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1 }}>
                {new Date(event.timestamp).toLocaleString('default', { month: 'short' })}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {new Date(event.timestamp).getDate()}
              </Typography>
            </Box>
            
            {/* Registered Badge */}
            {event.registered && (
              <Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: COLORS.primary.main,
                color: 'white',
                borderRadius: '8px',
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <EventIcon sx={{ fontSize: '1rem' }} />
                Registered
              </Box>
            )}
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                component="h2"
                sx={{ 
                  mb: 1, 
                  fontWeight: 600,
                  color: COLORS.text.primary,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}
              >
                {event.name}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: COLORS.text.secondary,
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {event.description.replace(/<[^>]+>/g, '').substring(0, 100)}...
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimeIcon sx={{ fontSize: '1rem', color: COLORS.text.secondary }} />
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  {formatTime(event.timestamp)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationIcon sx={{ fontSize: '1rem', color: COLORS.text.secondary }} />
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  {event.venue}
                </Typography>
              </Box>
            </CardContent>
            
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${alpha(COLORS.primary.main, 0.1)}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon sx={{ fontSize: '1rem', color: COLORS.text.secondary }} />
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  {event.registeredCount} attending
                </Typography>
              </Box>
              
              <Chip
                label={event.club_id ? event.club_id.name : event.board_id.name}
                size="small"
                sx={{
                  height: '22px',
                  fontSize: '0.65rem',
                  backgroundColor: alpha(COLORS.primary.main, 0.1),
                  color: COLORS.primary.dark
                }}
              />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
    
    {events.length === 0 && !loading && (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        backgroundColor: alpha(COLORS.primary.main, 0.03),
        borderRadius: '16px'
      }}>
        <EventIcon sx={{ 
          fontSize: 64, 
          color: COLORS.text.secondary,
          opacity: 0.5,
          mb: 2 
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: COLORS.text.secondary,
            mb: 1,
            fontWeight: 500
          }}
        >
          No upcoming events
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: COLORS.text.secondary,
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: '500px',
            mb: 3
          }}
        >
          There are currently no scheduled events. Check back later or create one if you're an admin.
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/events/create')}
            sx={{
              background: COLORS.gradient,
              color: 'white',
              borderRadius: '8px',
              px: 4,
              py: 1.25,
              fontWeight: 500,
              boxShadow: SHADOWS.button,
              '&:hover': {
                background: COLORS.gradientHover,
                boxShadow: SHADOWS.buttonHover,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Create Event
          </Button>
        )}
      </Box>
    )}
  </Box>
  
  {/* Confirmation Dialog */}
  <Dialog
    open={confirmDialog.open}
    onClose={handleCloseDialog}
    PaperProps={{
      sx: {
        borderRadius: '16px',
        p: 2,
        maxWidth: '500px',
        width: '100%'
      }
    }}
  >
    <DialogTitle sx={{ 
      fontWeight: 600, 
      color: COLORS.text.primary,
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
    }}>
      {confirmDialog.title}
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ color: COLORS.text.secondary }}>
        {confirmDialog.message}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button
        onClick={handleCloseDialog}
        sx={{
          color: COLORS.text.secondary,
          fontWeight: 500,
          borderRadius: '8px',
          px: 3,
          '&:hover': {
            backgroundColor: alpha(COLORS.text.secondary, 0.04)
          }
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={confirmDialog.onConfirm}
        sx={{
          backgroundColor: '#d32f2f',
          color: 'white',
          fontWeight: 500,
          borderRadius: '8px',
          px: 3,
          '&:hover': {
            backgroundColor: '#b71c1c'
          }
        }}
      >
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
  
  {/* Notification Snackbar */}
  <Snackbar
    open={notification.open}
    autoHideDuration={6000}
    onClose={handleCloseNotification}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  >
    <Alert
      onClose={handleCloseNotification}
      severity={notification.severity}
      sx={{
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
      }}
    >
      {notification.message}
    </Alert>
  </Snackbar>
</Box>
);
};

export default EventsPage;

