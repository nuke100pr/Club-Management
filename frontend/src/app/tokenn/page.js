"use client";
import { useState, useContext, useEffect } from "react";
import { fetchUserData } from "@/utils/auth";
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
  Paper,
  TextField,
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
import { colors } from "../../color";

const filters = [
  "My Clubs",
  "My Boards",
  "Week",
  "Month",
  "Year",
  "My Registered Events",
];
const eventTypes = ["Session", "Competition", "Workshop", "Meeting"];
const typeColors = {
  Session: "#4CAF50",
  Competition: "#FF5722",
  Workshop: "#9C27B0",
  Meeting: "#2196F3",
};

export default function EVENTS() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const selectedClubId = null;
  const selectedBoardId = null;
  const [userData, setUserData] = useState(null);
  const [user_id, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithEventPermission, setUserClubsWithEventPermission] =
    useState([]);

  // useEffect(() => {
  //   async function loadUserData() {
  //     const result = await fetchUserData();

  //     if (result) {
  //       console.log(result);
  //       setUserData(result.userData);
  //       setUserId(result.userId);
  //       setIsSuperAdmin(result.isSuperAdmin);

  //       // Extract clubs with events permission
  //       if (result.userData?.clubs) {
  //         const clubsWithEventPermission = Object.keys(
  //           result.userData.clubs
  //         ).filter((clubId) => result.userData.clubs[clubId].events === true);
  //         setUserClubsWithEventPermission(clubsWithEventPermission);
  //       }
  //     }
  //   }
  //   loadUserData();
  // }, []);


// Fix for useEffect setting userData
useEffect(() => {
  async function loadUserData() {
    const result = await fetchUserData();

    if (result) {
      console.log("User data loaded:", result);
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


  useEffect(() => {
    if (userData) {
      console.log(userData);
    }
  }, [userData]);

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
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Fixed: Use a default approach to fetch events even if user_id is not yet available
        const url = user_id 
          ? `http://localhost:5000/events?userId=${user_id}`
          : `http://localhost:5000/events`;
        
        console.log("Fetching events from:", url);
        const response = await fetch(url);
        
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
  
        const result = await response.json();
        if (!result.success)
          throw new Error(result.message || "Failed to fetch events");
  
        console.log("Events fetched successfully:", result.data?.length || 0, "events");
        
        // Fetch registration counts for each event
        const eventsWithCounts = await Promise.all(
          (result.data || []).map(async (event) => {
            try {
              const rsvpResponse = await fetch(
                `http://localhost:5000/events/${event._id}/rsvp`
              );
              if (!rsvpResponse.ok) return { ...event, registeredCount: 0 };
  
              const rsvpResult = await rsvpResponse.json();
              return {
                ...event,
                registeredCount: rsvpResult.data?.length || 0,
              };
            } catch (error) {
              console.error(`Error fetching RSVP for event ${event._id}:`, error);
              return { ...event, registeredCount: 0 };
            }
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
          message: "Failed to load events: " + error.message,
          severity: "error",
        });
      }
    };
  
    fetchEvents();
  }, [user_id]); // Keep the dependency on user_id


  const hasEventPermission = (event) => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;
  
    // Fixed: Handle data structure properly
    // Check club permissions
    const hasClubPermission =
      event.club_id &&
      userData?.clubs?.[event.club_id._id || event.club_id]?.events === true;
  
    // Check board permissions
    const hasBoardPermission =
      event.board_id &&
      userData?.boards?.[event.board_id._id || event.board_id]?.events === true;
  
    return hasClubPermission || hasBoardPermission;
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
        `http://localhost:5000/events/${eventId}/rsvp`
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

  const clearFilters = () => {
    setSelectedFilters({});
  };

  const handleDelete = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/events/${eventId}`, {
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
      const response = await fetch(`http://localhost:5000/events/${event._id}`);
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
        ? `http://localhost:5000/events/${currentEvent._id}`
        : "http://localhost:5000/events";
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
    <Box
      sx={{ backgroundColor: colors.background.default, minHeight: "100vh" }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 2,
          position: "relative",
          minHeight: "80vh",
          backgroundColor: colors.background.default,
        }}
      >
        {/* Removed the original EventsSearchBar component */}
        
        {/* The event cards grid in the revised grid layout */}
        <Grid container spacing={2}>
          {/* Left Panel - Search Bar (Fixed, Non-Scrollable) */}
          <Grid item xs={12} sm={3}>
            <Paper sx={{ 
              p: 2, 
              position: "sticky", 
              top: 80, // Ensures it stays below any navbar
              maxHeight: "90vh", 
              overflow: "auto", 
              boxShadow: 3, // Moderate elevation
              borderRadius: 2,
            }}>
              <TextField 
                fullWidth 
                variant="outlined" 
                label="Search Events" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              
              {/* Retain the filter functionality from the original component */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Filters
                </Typography>
                {filters.map((filter) => (
                  <Box key={filter} sx={{ mt: 1 }}>
                    <Chip
                      label={filter}
                      clickable
                      color={selectedFilters[filter] ? "primary" : "default"}
                      onClick={() =>
                        handleFilterChange({
                          target: {
                            name: filter,
                            checked: !selectedFilters[filter],
                          },
                        })
                      }
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                ))}
                {Object.values(selectedFilters).some(Boolean) && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={clearFilters}
                    sx={{ mt: 1 }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Right panel for event cards */}
          <Grid item xs={12} sm={9}>
            <Grid container spacing={2}>
              {filteredEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <Card
                    elevation={1}
                    sx={{
                      height: "100%",
                      borderRadius: "12px",
                      boxShadow: colors.shadows.card,
                      backgroundColor: colors.background.paper,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: colors.shadows.hover,
                      },
                    }}
                  >
                    <CardContent>
                      {event.image && (
                        <Box
                          component="img"
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            mb: 2,
                            borderRadius: 1,
                          }}
                          src={event.image.path || event.image}
                          alt={event.name}
                        />
                      )}

                      {/* Registration count and view button */}
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
                          color="info"
                          variant="outlined"
                        />
                        {(isSuperAdmin || hasEventPermission(event)) && (
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleViewRegistrations(event._id)}
                            sx={{ color: colors.primary.main }}
                          >
                            View
                          </Button>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        {(event.isClubFollowed ||
                          event.isBoardFollowed ||
                          event.registered) && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {event.isClubFollowed && (
                              <Tooltip title="You follow this club">
                                <GroupsIcon color="primary" fontSize="small" />
                              </Tooltip>
                            )}
                            {event.isBoardFollowed && (
                              <Tooltip title="You follow this board">
                                <WorkspacesIcon
                                  color="secondary"
                                  fontSize="small"
                                />
                              </Tooltip>
                            )}
                            {event.registered && (
                              <Tooltip title="You're registered for this event">
                                <FavoriteIcon color="error" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                        <Typography
                          variant="h6"
                          color={colors.text.primary}
                          sx={{ flexGrow: 1 }}
                        >
                          {event.name}
                        </Typography>
                        {(isSuperAdmin || hasEventPermission(event)) && (
                          <Box>
                            <IconButton
                              onClick={() => handleEdit(event)}
                              sx={{
                                color: colors.primary.main,
                                "&:hover": { backgroundColor: colors.action.hover },
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(event._id)}
                              sx={{
                                color: colors.status.error,
                                "&:hover": {
                                  backgroundColor: "rgba(244, 67, 54, 0.08)",
                                },
                              }}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {/* Club and Board info */}
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
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {event.club_id.name}
                          </Typography>
                          {event.isClubFollowed && (
                            <Chip
                              label="Following"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      )}

                      {event.board_id && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <WorkspacesIcon color="action" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            {event.board_id.name}
                          </Typography>
                          {event.isBoardFollowed && (
                            <Chip
                              label="Following"
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      )}

                      <Chip
                        label={event.event_type_id || "Session"}
                        size="small"
                        sx={{
                          backgroundColor:
                            typeColors[event.event_type_id] ||
                            typeColors["Session"],
                          color: colors.common.white,
                          mt: 0.5,
                          mb: 1,
                        }}
                      />

                      <Divider sx={{ my: 1, borderColor: colors.borders.light }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color={colors.text.secondary}>
                          <strong>Description:</strong> {event.description}
                        </Typography>
                        <Typography variant="body2" color={colors.text.secondary}>
                          <strong>Date:</strong>{" "}
                          {new Date(event.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color={colors.text.secondary}>
                          <strong>Time:</strong>{" "}
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        <Typography variant="body2" color={colors.text.secondary}>
                          <strong>Venue:</strong> {event.venue}
                        </Typography>
                        <Typography variant="body2" color={colors.text.secondary}>
                          <strong>Duration:</strong> {event.duration} minutes
                        </Typography>
                      </Box>

                      <Button
                        variant={event.registered ? "contained" : "outlined"}
                        fullWidth
                        onClick={() => !event.registered && handleRegister(event)}
                        disabled={event.registered}
                        sx={{
                          backgroundColor: event.registered
                            ? colors.status.success
                            : "transparent",
                          color: event.registered
                            ? colors.common.white
                            : colors.primary.main,
                          borderColor: colors.primary.main,
                          "&:hover": {
                            backgroundColor: event.registered
                              ? colors.status.success
                              : colors.action.hover,
                            boxShadow: "none",
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
          </Grid>
        </Grid>

        {(isSuperAdmin || userClubsWithEventPermission.length > 0) && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleAddNew}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              boxShadow: colors.shadows.hover,
              backgroundColor: colors.primary.main,
              color: colors.common.white,
              "&:hover": {
                backgroundColor: colors.primary.dark,
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <AddIcon />
          </Fab>
        )}

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
          eventTypes={eventTypes}
          club_id={selectedClubId} // Pass the actual club_id from your state
          board_id={selectedBoardId} // Pass the actual board_id from your state
        />

        {/* Registrations Dialog */}
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
              <CloseIcon />
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