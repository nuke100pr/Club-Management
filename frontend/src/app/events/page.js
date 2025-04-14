"use client";
import React, { useState, useContext, useEffect } from 'react';
import { fetchUserData } from "@/utils/auth";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Button,
  Container,
  IconButton,
  VisibilityOutlined,
  Snackbar,
  Alert,
  Dialog,
  Fab,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AccessTime,
  CalendarToday,
  LocationOn,
  People,
  Visibility,
  BookmarkBorder,
  CheckCircle,
  Edit,
  Delete,
  Add,
  Close,
  Favorite,
  FavoriteBorder,
  Star,
  StarOutline,
  OpenInNew,
  CheckCircleOutline,
} from '@mui/icons-material';
import EventsSearchBar from "../../components/events/EventsSearchBar";
import EventForm from "../../components/events/EventForm";
import UniversalShareMenu from "../../components/shared/UniversalShareMenu";

import { Share } from '@mui/icons-material';
const API_URL2 = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads`;
// Styled components based on the design system
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  backgroundColor: 'white',
  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
  },
  borderTop: `3px solid ${theme.palette.primary.main}`,
}));

// Enhanced EventChip with color based on event type
const EventChip = styled(Chip)(({ theme, eventtype }) => {
  const typeColors = {
    'Session': '#4CAF50',
    'Competition': '#FF5722',
    'Workshop': '#9C27B0',
    'Meeting': '#2196F3',
    'Masterclass': '#9C27B0',
    'Seminar': '#03A9F4',
    'Summit': '#1976D2'
  };
  
  const color = typeColors[eventtype] || theme.palette.primary.main;
  
  return {
    backgroundColor: `${color}15`,
    color: color,
    height: 28,
    fontSize: '0.75rem',
    borderRadius: 14,
    fontWeight: 500,
    padding: '0 12px'
  };
});

const DurationChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(95, 150, 230, 0.15)',
  color: theme.palette.primary.main,
  height: 28,
  fontSize: '0.75rem',
  borderRadius: 14,
  fontWeight: 500,
  padding: '0 12px'
}));

const FollowingChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(95, 150, 230, 0.1)',
  color: theme.palette.primary.main,
  height: 28,
  fontSize: '0.75rem',
  borderRadius: 14,
  fontWeight: 500,
  marginLeft: 12
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, #8E54E9)`,
  color: 'white',
  fontWeight: 500,
  borderRadius: 20,
  padding: '8px 24px',
  boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, #7c46d4)`,
    boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const RegistrationsChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(95, 150, 230, 0.1)',
  color: theme.palette.text.secondary,
  borderRadius: 16,
  padding: '4px 12px',
  fontSize: '0.85rem'
}));

const ImageOverlayIcons = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  display: 'flex',
  gap: 8,
  zIndex: 2,
}));

const filters = [
  "My Clubs",
  "My Boards",
  "Week",
  "Month",
  "Year",
  "My Registered Events",
];

export default function EventsPage() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [user_id, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithEventPermission, setUserClubsWithEventPermission] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [shareMenu, setShareMenu] = useState({
    open: false,
    anchorEl: null,
    id: null,
    title: "",
    contentType: "event"
  });
  const router = useRouter();

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [registrationsDialog, setRegistrationsDialog] = useState({
    open: false,
    eventId: null,
    registrations: [],
    loading: false,
  });

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.clubs) {
          const clubsWithEventPermission = Object.keys(
            result.userData.clubs
          ).filter((clubId) => result.userData.clubs[clubId].events === true);
          setUserClubsWithEventPermission(clubsWithEventPermission);
        }
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const url = user_id
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/events?userId=${user_id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/events`;

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (!result.success)
          throw new Error(result.message || "Failed to fetch events");

        const eventsWithCounts = await Promise.all(
          (result.data || []).map(async (event) => {
            const rsvpResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${event._id}/rsvp`
            );
            if (!rsvpResponse.ok) return { ...event, registeredCount: 0 };

            const rsvpResult = await rsvpResponse.json();
            return {
              ...event,
              registeredCount: rsvpResult.data?.length || 0,
            };
          })
        );

        setEvents(eventsWithCounts);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setError(error.message);
        setIsLoading(false);
        setNotification({
          open: true,
          message: "Failed to load events",
          severity: "error",
        });
      }
    };

    fetchEvents();
  }, [user_id]);

  const hasEventPermission = (event) => {
    if (isSuperAdmin) return true;

    const hasClubPermission =
      event.club_id &&
      userData?.data?.clubs?.[event.club_id._id || event.club_id]?.events;

    const hasBoardPermission =
      event.board_id &&
      userData?.data?.boards?.[event.board_id._id || event.board_id]?.events;

    return hasClubPermission || hasBoardPermission;
  };

  const handleRegister = async (event) => {
    if (!user_id) {
      setNotification({
        open: true,
        message: "Please login to register for events",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${event._id}/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_id: event._id,
            user_id: user_id,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      setEvents(
        events.map((e) =>
          e._id === event._id
            ? {
                ...e,
                registered: true,
                registeredCount: e.registeredCount + 1,
              }
            : e
        )
      );

      setNotification({
        open: true,
        message: "Registration successful",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to register for event:", error);
      setNotification({
        open: true,
        message: "Failed to complete registration",
        severity: "error",
      });
    }
  };

  const handleViewRegistrations = async (eventId) => {
    try {
      setRegistrationsDialog((prev) => ({
        ...prev,
        open: true,
        eventId,
        loading: true,
        registrations: [],
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      setRegistrationsDialog((prev) => ({
        ...prev,
        registrations: result.data || [],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      setRegistrationsDialog((prev) => ({
        ...prev,
        loading: false,
      }));
      setNotification({
        open: true,
        message: "Failed to load registrations",
        severity: "error",
      });
    }
  };

  const handleFilterChange = (event) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };
  const handleShareClick = (event, eventId) => {
    event.stopPropagation();
    // Find the current event to get its title
    const currentEvent = events.find(e => e._id === eventId);
    setShareMenu({
      open: true,
      anchorEl: event.currentTarget,
      id: eventId,
      title: currentEvent.name,
      contentType: "event"
    });
  };
  
  const clearFilters = () => {
    setSelectedFilters({});
  };

  const handleDelete = async (eventId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      setEvents(events.filter((event) => event._id !== eventId));
      setNotification({
        open: true,
        message: "Event deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete event:", error);
      setNotification({
        open: true,
        message: "Failed to delete event",
        severity: "error",
      });
    }
  };

  const handleEdit = async (event) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${event._id}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const sample = await response.json();
      const eventDetails = sample.data;

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

      setCurrentEvent(event);
      setEditFormData(formData);
      setIsEditing(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      setNotification({
        open: true,
        message: "Failed to fetch event details",
        severity: "error",
      });
    }
  };

  const handleAddNew = () => {
    setCurrentEvent(null);
    setEditFormData(null);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${currentEvent._id}`
        : "${process.env.NEXT_PUBLIC_BACKEND_URL}/events";
      const method = isEditing ? "PUT" : "POST";

      const multipartFormData = new FormData();
      multipartFormData.append("name", formData.name);
      multipartFormData.append("venue", formData.venue);
      multipartFormData.append(
        "timestamp",
        new Date(formData.timestamp).toISOString()
      );
      multipartFormData.append("duration", formData.duration);
      multipartFormData.append("description", formData.description);
      multipartFormData.append(
        "event_type_id",
        formData.event_type_id || "Session"
      );
      multipartFormData.append("club_id", formData.club_id);
      multipartFormData.append("board_id", formData.board_id);

      if (formData.image instanceof File) {
        multipartFormData.append("image", formData.image);
      } else if (formData.image && typeof formData.image === "string") {
        multipartFormData.append("image", formData.image);
      }

      if (isEditing && currentEvent) {
        multipartFormData.append("_id", currentEvent._id);
      }

      const response = await fetch(url, {
        method: method,
        body: multipartFormData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const updatedEvent = await response.json();

      if (isEditing && currentEvent) {
        setEvents(
          events.map((event) =>
            event._id === currentEvent._id
              ? {
                  ...event,
                  ...updatedEvent.data,
                  registered: event.registered,
                  isClubFollowed: event.isClubFollowed,
                  isBoardFollowed: event.isBoardFollowed,
                  registeredCount: event.registeredCount,
                }
              : event
          )
        );
      } else {
        const newEvent = {
          ...updatedEvent.data,
          registered: false,
          isClubFollowed: false,
          isBoardFollowed: false,
          registeredCount: 0,
        };
        setEvents([newEvent, ...events]);
      }

      setOpenDialog(false);
      setEditFormData(null);
      setIsEditing(false);
      setNotification({
        open: true,
        message: isEditing
          ? "Event updated successfully"
          : "Event created successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to submit event:", error);
      setNotification({
        open: true,
        message: "Failed to save event",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery
      ? event.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const hasActiveFilters = Object.values(selectedFilters).some(Boolean);

    if (!hasActiveFilters) {
      return matchesSearch;
    }

    const matchesRegisteredFilter = selectedFilters["My Registered Events"]
      ? event.registered
      : true;
    const matchesClubFilter = selectedFilters["My Clubs"]
      ? event.isClubFollowed
      : true;
    const matchesBoardFilter = selectedFilters["My Boards"]
      ? event.isBoardFollowed
      : true;

    return (
      matchesSearch &&
      matchesRegisteredFilter &&
      (!selectedFilters["My Clubs"] || matchesClubFilter) &&
      (!selectedFilters["My Boards"] || matchesBoardFilter)
    );
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="h6">Loading events...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Error loading events: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      padding: 4, 
      backgroundColor: '#f8faff',
      minHeight: '100vh'
    }}>
      <Container maxWidth="xl">
        
        <EventsSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          filters={filters}
          clearFilters={clearFilters}
        />
        
        <Grid container spacing={4}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
              <StyledCard
                onMouseEnter={() => setHoveredCard(event._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Box sx={{ position: 'relative' }}>
                  {event.image && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={`${API_URL2}/${event?.image?.filename}`}
                      alt={event.name}
                    />
                  )}
                  <ImageOverlayIcons>
                    {event.isClubFollowed || event.isBoardFollowed ? (
                      <IconButton 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'white', 
                          '&:hover': { backgroundColor: 'white' } 
                        }}
                      >
                        <Star style={{ color: '#ffb400' }} />
                      </IconButton>
                    ) : (
                      <IconButton 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'white', 
                          '&:hover': { backgroundColor: 'white' } 
                        }}
                      >
                        <StarOutline color="action" />
                      </IconButton>
                    )}
                    {event.registered && (
                      <IconButton 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'white', 
                          '&:hover': { backgroundColor: 'white' } 
                        }}
                      >
                        <CheckCircle style={{ color: '#4CAF50' }} />
                      </IconButton>
                    )}
                  </ImageOverlayIcons>
                  
                  {(isSuperAdmin || hasEventPermission(event)) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(event);
                        }}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <Edit fontSize="small" sx={{ color: '#4776E6' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event._id);
                        }}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <Delete fontSize="small" sx={{ color: '#f44336' }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
    {event.name}
  </Typography>
  <Box sx={{ display: 'flex' }}>
    <IconButton 
      size="small" 
      onClick={(e) => handleShareClick(e, event._id)}
      sx={{
        color: 'primary.main',
        mr: 1,
        '&:hover': {
          backgroundColor: 'rgba(95, 150, 230, 0.1)'
        }
      }}
    >
      <Share fontSize="small" />
    </IconButton>
    <IconButton 
    size="small" 
    onClick={(e) => {
      e.stopPropagation();
      router.push(`/current_event/${event._id}`);
    }}
    sx={{
      color: 'primary.main',
      '&:hover': {
        backgroundColor: 'rgba(95, 150, 230, 0.1)'
      }
    }}
  >
    <OpenInNew fontSize="small" />
  </IconButton>
  </Box>
</Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {event.club_id ? (
                        <Avatar
                          src={event.club_id.image?.path || event.club_id.image}
                          alt={event.club_id.name}
                          sx={{ width: 28, height: 28, mr: 1.5 }}
                        />
                      ) : event.board_id ? (
                        <Avatar
                          alt={event.board_id.name}
                          sx={{ width: 28, height: 28, mr: 1.5, bgcolor: '#e0e0e0' }}
                        >
                          {event?.board_id?.name?.charAt(0)}
                        </Avatar>
                      ) : (
                        <Avatar
                          sx={{ width: 28, height: 28, mr: 1.5, bgcolor: '#e0e0e0' }}
                        >
                          H
                        </Avatar>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {event.club_id?.name || event.board_id?.name || "Host"}
                      </Typography>
                    </Box>
                    <FollowingChip 
                      label={event.isClubFollowed || event.isBoardFollowed ? "Following" : "Follow"}
                      size="small"
                      variant={event.isClubFollowed || event.isBoardFollowed ? "filled" : "outlined"}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <EventChip 
                      label={event.event_type_id || "Event"} 
                      size="small"
                      eventtype={event.event_type_id || "Event"}
                    />
                    <DurationChip 
                      icon={<AccessTime style={{ fontSize: 16 }} />}
                      label={`${event.duration} mins`}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
  {event.description && (
    <>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          fontSize: '0.85rem', 
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: '3',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxHeight: '4rem'  // approximately 3 lines
        }}
      >
        {event.description}
      </Typography>
      
      {event.description.length > 120 && (
        <Button 
          variant="text" 
          size="small" 
          sx={{ 
            mt: 0.5, 
            p: 0, 
            textTransform: 'none', 
            fontSize: '0.8rem',
            color: 'primary.main'
          }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/current_event/${event._id}`);
          }}
        >
          Read more
        </Button>
      )}
    </>
  )}
</Box>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                        <CalendarToday color="primary" sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime color="primary" sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn color="primary" sx={{ fontSize: 16, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.venue}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <RegistrationsChip>
                        <People color="primary" sx={{ fontSize: 20, mr: 1 }} />
                        <Typography variant="body2">
                          {event.registeredCount} Registered
                        </Typography>
                      </RegistrationsChip>
                      {(isSuperAdmin || hasEventPermission(event)) && (
                        <Tooltip title="View registrations">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRegistrations(event._id);
                            }}
                          >
                            <Visibility color="action" sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <RegisterButton 
                        variant="contained" 
                        fullWidth
                        disabled={event.registered}
                        onClick={(e) => {
                          e.stopPropagation();
                          !event.registered && handleRegister(event);
                        }}
                        startIcon={event.registered ? <CheckCircleOutline sx={{ fontSize: 16 }} /> : null}
                      >
                        {event.registered ? "Registered" : "Register Now"}
                      </RegisterButton>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddNew}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
            background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <Add />
        </Fab>

        <EventForm
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setEditFormData(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={
            editFormData || {
              name: "",
              venue: "",
              timestamp: "",
              duration: "",
              description: "",
              event_type_id: "Session",
              club_id: "",
              board_id: "",
              image: null,
            }
          }
          title={isEditing ? "Edit Event" : "Add New Event"}
          submitButtonText={isEditing ? "Update Event" : "Create Event"}
          eventTypes={["Session", "Competition", "Workshop", "Meeting", "Masterclass", "Seminar", "Summit"]}
        />

        <Dialog
          open={registrationsDialog.open}
          onClose={() =>
            setRegistrationsDialog((prev) => ({ ...prev, open: false }))
          }
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Registered Users
            <IconButton
              onClick={() =>
                setRegistrationsDialog((prev) => ({ ...prev, open: false }))
              }
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {registrationsDialog.loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : registrationsDialog.registrations.length === 0 ? (
              <Typography
                variant="body1"
                color="textSecondary"
                align="center"
                py={2}
              >
                No registrations yet
              </Typography>
            ) : (
              <List>
                {registrationsDialog.registrations.map((rsvp) => (
                  <ListItem key={rsvp._id}>
                    <ListItemAvatar>
                      <Avatar
                        src={rsvp.user_id?.profile_picture}
                        alt={rsvp.user_id?.name}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={rsvp.user_id?.name || "Unknown User"}
                      secondary={`Registered on ${new Date(
                        rsvp.timestamp
                      ).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
        </Dialog>
        <UniversalShareMenu
  anchorEl={shareMenu.anchorEl}
  open={shareMenu.open}
  onClose={() => setShareMenu({ open: false, anchorEl: null, id: null, title: "", contentType: "event" })}
  id={shareMenu.id}
  title={shareMenu.title}
  contentType={shareMenu.contentType}
  // Optional: You can pass custom share text if needed
  // customShareText={`Check out this amazing event: ${shareMenu.title}`}
/>
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
      </Container>
    </Box>
  );
}