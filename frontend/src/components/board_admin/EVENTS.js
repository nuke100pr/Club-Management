"use client";
import { useState, useEffect } from "react";
import { fetchUserData } from "@/utils/auth";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  Chip,
  IconButton,
  Fab,
  Snackbar,
  Alert,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import EventsSearchBar from "../../components/events/EventsSearchBar";
import EventForm from "../../components/events/EventForm";

// Design system constants
const COLORS = {
  primary: {
    main: "#4776E6",
    light: "#6a98ff",
    dark: "#3a5fc0",
    gradient: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
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
  common: {
    white: "#ffffff",
  },
  status: {
    success: "#388e3c",
    error: "#d32f2f",
  },
  action: {
    hover: "rgba(71, 118, 230, 0.08)",
  },
  borders: {
    light: "rgba(0, 0, 0, 0.12)",
  },
  shadows: {
    card: "0 4px 12px rgba(95, 150, 230, 0.1)",
    hover: "0 12px 20px rgba(95, 150, 230, 0.2)",
    button: "0 4px 10px rgba(71, 118, 230, 0.3)",
  },
};

const EVENT_TYPES = ["Session", "Competition", "Workshop", "Meeting"];
const TYPE_COLORS = {
  Session: "#4CAF50",
  Competition: "#FF5722",
  Workshop: "#9C27B0",
  Meeting: "#2196F3",
};

const FILTERS = [
  "My Clubs",
  "My Boards",
  "Week",
  "Month",
  "Year",
  "My Registered Events",
];

export default function EVENTS() {
  const router = useRouter();
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

  // Load user data on component mount
  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();
      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with events permission
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

  // Fetch events when user_id is available
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const url = user_id
          ? `http://localhost:5000/events?userId=${user_id}`
          : "http://localhost:5000/events";

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Failed to fetch events");

        // Fetch registration counts for each event
        const eventsWithCounts = await Promise.all(
          (result.data || []).map(async (event) => {
            const rsvpResponse = await fetch(
              `http://localhost:5000/events/${event._id}/rsvp`
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

    if (user_id) fetchEvents();
  }, [user_id]);

  // Check if user has permission to edit/delete an event
  const hasEventPermission = (event) => {
    if (isSuperAdmin) return true;
    
    const hasClubPermission =
      event.club_id &&
      userData?.clubs?.[event.club_id._id || event.club_id]?.events;

    const hasBoardPermission =
      event.board_id &&
      userData?.boards?.[event.board_id._id || event.board_id]?.events;

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
        `http://localhost:5000/events/${event._id}/rsvp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_id: event._id, user_id }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setEvents(
        events.map((e) =>
          e._id === event._id
            ? { ...e, registered: true, registeredCount: e.registeredCount + 1 }
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
      setRegistrationsDialog({
        open: true,
        eventId,
        loading: true,
        registrations: [],
      });

      const response = await fetch(`http://localhost:5000/events/${eventId}/rsvp`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      setRegistrationsDialog((prev) => ({
        ...prev,
        registrations: result.data || [],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      setRegistrationsDialog((prev) => ({ ...prev, loading: false }));
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

  const handleDelete = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
      const response = await fetch(`http://localhost:5000/events/${event._id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const eventDetails = result.data;

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

  const handleFormSubmit = async (formData) => {
    try {
      const url = isEditing
        ? `http://localhost:5000/events/${currentEvent._id}`
        : "http://localhost:5000/events";
      const method = isEditing ? "PUT" : "POST";

      const multipartFormData = new FormData();
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'timestamp') {
          multipartFormData.append(key, new Date(value).toISOString());
        } else if (key === 'image' && value instanceof File) {
          multipartFormData.append(key, value);
        } else if (value !== null && value !== undefined) {
          multipartFormData.append(key, value);
        }
      });

      if (isEditing && currentEvent) {
        multipartFormData.append("_id", currentEvent._id);
      }

      const response = await fetch(url, { method, body: multipartFormData });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const updatedEvent = await response.json();

      // Update events list with new/updated event
      if (isEditing) {
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
        setEvents([
          {
            ...updatedEvent.data,
            registered: false,
            isClubFollowed: false,
            isBoardFollowed: false,
            registeredCount: 0,
          },
          ...events,
        ]);
      }

      setOpenDialog(false);
      setEditFormData(null);
      setIsEditing(false);
      setNotification({
        open: true,
        message: isEditing ? "Event updated successfully" : "Event created successfully",
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

  // Filter events based on search and selected filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery
      ? event.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const hasActiveFilters = Object.values(selectedFilters).some(Boolean);
    if (!hasActiveFilters) return matchesSearch;

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
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: COLORS.primary.main }} />
        <Typography variant="h6" sx={{ mt: 2, color: COLORS.text.secondary }}>
          Loading events...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Error loading events: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: COLORS.background.default, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, position: "relative" }}>
        {/* Search Bar */}
        <EventsSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          filters={FILTERS}
          clearFilters={() => setSelectedFilters({})}
        />

        {/* Events Grid */}
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: COLORS.shadows.card,
                  backgroundColor: COLORS.background.paper,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: COLORS.shadows.hover,
                  },
                  position: "relative",
                  overflow: "visible",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: TYPE_COLORS[event.event_type_id] || TYPE_COLORS.Session,
                    borderRadius: "16px 16px 0 0",
                  },
                }}
                onClick={(e) => {
                  if (e.target.closest('button, a, [role="button"]')) return;
                  router.push(`/current_event/${event._id}`);
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Event Image */}
                  {event.image && (
                    <Box
                      component="img"
                      sx={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        mb: 2,
                        borderRadius: "8px",
                      }}
                      src={event.image.path || event.image}
                      alt={event.name}
                    />
                  )}

                  {/* Registration Count */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={`${event.registeredCount} registrations`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(71, 118, 230, 0.1)",
                        color: COLORS.primary.main,
                        height: "22px",
                        fontSize: "0.65rem",
                      }}
                    />
                    {(isSuperAdmin || hasEventPermission(event)) && (
                      <Button
                        size="small"
                        onClick={() => handleViewRegistrations(event._id)}
                        sx={{
                          color: COLORS.primary.main,
                          fontSize: "0.75rem",
                          p: 0,
                          minWidth: "auto",
                          "&:hover": {
                            background: "transparent",
                            color: COLORS.primary.dark,
                          },
                        }}
                      >
                        View
                      </Button>
                    )}
                  </Box>

                  {/* Event Title & Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {/* Status Icons */}
                    {(event.isClubFollowed || event.isBoardFollowed || event.registered) && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {event.isClubFollowed && (
                          <Tooltip title="You follow this club">
                            <GroupsIcon sx={{ color: COLORS.primary.main, fontSize: "1rem" }} />
                          </Tooltip>
                        )}
                        {event.isBoardFollowed && (
                          <Tooltip title="You follow this board">
                            <WorkspacesIcon sx={{ color: COLORS.secondary, fontSize: "1rem" }} />
                          </Tooltip>
                        )}
                        {event.registered && (
                          <Tooltip title="You're registered for this event">
                            <FavoriteIcon sx={{ color: COLORS.status.error, fontSize: "1rem" }} />
                          </Tooltip>
                        )}
                      </Box>
                    )}
                    
                    {/* Event Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        flexGrow: 1,
                        color: COLORS.text.primary,
                        fontWeight: 600,
                        fontSize: "1rem",
                      }}
                    >
                      {event.name}
                    </Typography>
                    
                    {/* Edit/Delete Buttons */}
                    {(isSuperAdmin || hasEventPermission(event)) && (
                      <Box>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(event);
                          }}
                          sx={{
                            color: COLORS.primary.main,
                            p: 0.5,
                            "&:hover": {
                              backgroundColor: COLORS.action.hover,
                            },
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event._id);
                          }}
                          sx={{
                            color: COLORS.status.error,
                            p: 0.5,
                            "&:hover": {
                              backgroundColor: "rgba(211, 47, 47, 0.08)",
                            },
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Club Info */}
                  {event.club_id && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Avatar
                        src={event.club_id.image?.path || event.club_id.image}
                        sx={{ width: 20, height: 20 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: COLORS.text.secondary, fontSize: "0.7rem" }}
                      >
                        {event.club_id.name}
                      </Typography>
                      {event.isClubFollowed && (
                        <Chip
                          label="Following"
                          size="small"
                          sx={{
                            height: "18px",
                            fontSize: "0.6rem",
                            bgcolor: "rgba(71, 118, 230, 0.1)",
                            color: COLORS.primary.main,
                            border: "none",
                          }}
                        />
                      )}
                    </Box>
                  )}

                  {/* Board Info */}
                  {event.board_id && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <WorkspacesIcon
                        sx={{ color: COLORS.text.secondary, fontSize: "0.9rem" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: COLORS.text.secondary, fontSize: "0.7rem" }}
                      >
                        {event.board_id.name}
                      </Typography>
                      {event.isBoardFollowed && (
                        <Chip
                          label="Following"
                          size="small"
                          sx={{
                            height: "18px",
                            fontSize: "0.6rem",
                            bgcolor: "rgba(142, 84, 233, 0.1)",
                            color: COLORS.secondary,
                            border: "none",
                          }}
                        />
                      )}
                    </Box>
                  )}

                  {/* Event Type */}
                  <Chip
                    label={event.event_type_id || "Session"}
                    size="small"
                    sx={{
                      backgroundColor: TYPE_COLORS[event.event_type_id] || TYPE_COLORS.Session,
                      color: "#fff",
                      height: "22px",
                      fontSize: "0.65rem",
                      mt: 0.5,
                      mb: 1.5,
                    }}
                  />

                  <Divider sx={{ my: 1.5, borderColor: "rgba(0, 0, 0, 0.06)" }} />

                  {/* Event Details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.text.secondary,
                        fontSize: "0.75rem",
                        mb: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      <strong>Description:</strong> {event.description}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: COLORS.text.secondary, fontSize: "0.75rem", mb: 0.5 }}
                    >
                      <strong>Date:</strong> {new Date(event.timestamp).toLocaleDateString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: COLORS.text.secondary, fontSize: "0.75rem", mb: 0.5 }}
                    >
                      <strong>Time:</strong>{" "}
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: COLORS.text.secondary, fontSize: "0.75rem", mb: 0.5 }}
                    >
                      <strong>Venue:</strong> {event.venue}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: COLORS.text.secondary, fontSize: "0.75rem" }}
                    >
                      <strong>Duration:</strong> {event.duration} minutes
                    </Typography>
                  </Box>

                  {/* Register Button */}
                  <Button
                    variant={event.registered ? "contained" : "outlined"}
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      !event.registered && handleRegister(event);
                    }}
                    disabled={event.registered}
                    sx={{
                      borderRadius: "8px",
                      py: 1,
                      fontWeight: 500,
                      textTransform: "none",
                      transition: "all 0.2s ease",
                      background: event.registered
                        ? COLORS.status.success
                        : "transparent",
                      color: event.registered
                        ? "#fff"
                        : COLORS.primary.main,
                      border: event.registered
                        ? "none"
                        : `1px solid ${COLORS.primary.main}`,
                      boxShadow: event.registered ? COLORS.shadows.button : "none",
                      "&:hover": {
                        background: event.registered
                          ? COLORS.status.success
                          : COLORS.action.hover,
                        transform: "translateY(-2px)",
                        boxShadow: event.registered
                          ? COLORS.shadows.hover
                          : "none",
                      },
                    }}
                  >
                    {event.registered ? "Registered" : "Register"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Add New Event FAB Button */}
        {(isSuperAdmin || userClubsWithEventPermission.length > 0) && (
          <Fab
            aria-label="add event"
            onClick={handleAddNew}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              boxShadow: COLORS.shadows.hover,
              background: COLORS.primary.gradient,
              color: "#fff",
              "&:hover": {
                background: COLORS.primary.gradient,
                transform: "translateY(-4px) scale(1.05)",
                boxShadow: "0 8px 16px rgba(71, 118, 230, 0.4)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Event Form Dialog */}
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
          eventTypes={EVENT_TYPES}
        />

        {/* Registrations Dialog */}
        <Dialog
          open={registrationsDialog.open}
          onClose={() => setRegistrationsDialog((prev) => ({ ...prev, open: false }))}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: COLORS.shadows.card,
            },
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              bgcolor: COLORS.background.default,
              fontWeight: 600,
              color: COLORS.text.primary,
              padding: "16px 24px",
            }}
          >
            Registered Users
            <IconButton
              onClick={() => setRegistrationsDialog((prev) => ({ ...prev, open: false }))}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: COLORS.text.secondary,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: "16px 24px" }}>
            {registrationsDialog.loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: COLORS.primary.main }} />
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
                      primary={rsvp.user_id?.name}
                      secondary={rsvp.user_id?.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
            severity={notification.severity}
            sx={{
              width: "100%",
              borderRadius: "8px",
              boxShadow: COLORS.shadows.card,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              textAlign: "center",
            }}
          >
            <img
              src="/images/empty-events.svg"
              alt="No events found"
              style={{ width: "200px", height: "200px", marginBottom: "24px" }}
            />
            <Typography
              variant="h6"
              sx={{ color: COLORS.text.primary, mb: 1 }}
            >
              No events found
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: COLORS.text.secondary, maxWidth: "400px" }}
            >
              {searchQuery
                ? "Try adjusting your search or filters"
                : "There are currently no events scheduled. Check back later!"}
            </Typography>
            {(isSuperAdmin || userClubsWithEventPermission.length > 0) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{
                  mt: 3,
                  borderRadius: "8px",
                  background: COLORS.primary.gradient,
                  boxShadow: COLORS.shadows.button,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: COLORS.shadows.hover,
                  },
                }}
              >
                Create New Event
              </Button>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );

  function handleAddNew() {
    setCurrentEvent(null);
    setEditFormData(null);
    setIsEditing(false);
    setOpenDialog(true);
  }
}