"use client";
import { useState, useEffect } from "react";
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
import GroupsIcon from "@mui/icons-material/Groups";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckIcon from "@mui/icons-material/Check";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonOffIcon from "@mui/icons-material/PersonOff";

import EventForm from "../../components/events/EventForm";
import { useRouter } from "next/navigation";

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

export default function EVENTS({ boardId }) {
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
  const [userClubsWithEventPermission, setUserClubsWithEventPermission] =
    useState([]);
  const [userBoardsWithEventPermission, setUserBoardsWithEventPermission] =
    useState([]);

  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.data?.clubs) {
          const clubsWithEventPermission = Object.keys(
            result.userData.data?.clubs
          ).filter(
            (clubId) => result.userData.data?.clubs[clubId].events === true
          );
          setUserClubsWithEventPermission(clubsWithEventPermission);
        }

        if (result.userData?.data?.boards) {
          const boardsWithEventPermission = Object.keys(
            result.userData?.data?.boards
          ).filter(
            (boardId) => result.userData?.data?.boards[boardId].events === true
          );
          setUserBoardsWithEventPermission(boardsWithEventPermission);
        }
      }
    }
    loadUserData();
  }, []);

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

        let url = user_id
          ? `http://localhost:5000/events?userId=${user_id}`
          : `http://localhost:5000/events`;

        if (boardId) {
          url += (url.includes("?") ? "&" : "?") + `boardId=${boardId}`;
        }

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (!result.success)
          throw new Error(result.message || "Failed to fetch events");

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
              console.error(
                `Error fetching RSVP for event ${event._id}:`,
                error
              );
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
  }, [user_id, boardId, isEditing]);

  const canCreateEvents = () => {
    if (boardId) {
      if (userBoardsWithEventPermission.includes(boardId)) {
        return true;
      }
    }
    return isSuperAdmin;
  };

  const hasEventPermission = (event) => {
    if (isSuperAdmin) return true;

    const hasClubPermission =
      event.club_id &&
      userData?.clubs?.[event.club_id._id || event.club_id]?.events === true;

    const hasBoardPermission =
      event.board_id &&
      userData?.boards?.[event.board_id._id || event.board_id]?.events === true;

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
      setRegistrationsDialog({
        open: true,
        eventId,
        loading: true,
        registrations: [],
      });

      const response = await fetch(
        `http://localhost:5000/events/${eventId}/rsvp`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      setRegistrationsDialog({
        open: true,
        eventId,
        registrations: result.data || [],
        loading: false,
      });
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
    if (boardId) {
      const eventBoardId = event.board_id?._id || event.board_id;
      if (eventBoardId !== boardId) return false;
    }

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
      sx={{
        backgroundColor: '#FFFFFF',
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(to bottom, rgba(248, 249, 250, 0.8), rgba(255,255,255,1))",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          position: "relative",
          minHeight: "80vh",
          backgroundColor: "transparent",
        }}
      >
        {boardId && (
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              mb: 4,
              fontWeight: 700,
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                borderRadius: 8,
                backgroundColor: '#2E3B55',
              },
            }}
          >
            Board Events
          </Typography>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 3,
                position: "sticky",
                top: 80,
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderRadius: 12,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                },
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                label="Search Events"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box
                      component="span"
                      sx={{ mr: 1, color: '#868E96' }}
                    >
                      <SearchIcon fontSize="small" />
                    </Box>
                  ),
                  sx: {
                    borderRadius: 8,
                    backgroundColor: '#F8F9FA',
                    "&:hover": {
                      backgroundColor: '#F8F9FA',
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: '#DEE2E6',
                    },
                  },
                }}
              />

              {!boardId && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: '#212529',
                    }}
                  >
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
                        sx={{
                          mr: 1,
                          mb: 1,
                          borderRadius: 8,
                          fontWeight: 500,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      />
                    </Box>
                  ))}
                  {Object.values(selectedFilters).some(Boolean) && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={clearFilters}
                      sx={{
                        mt: 2,
                        color: '#1971C2',
                        fontWeight: 500,
                        "&:hover": {
                          backgroundColor: "rgba(25, 113, 194, 0.08)",
                        },
                      }}
                      startIcon={<ClearIcon fontSize="small" />}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} sm={9}>
            <Grid container spacing={3}>
              {filteredEvents.length === 0 ? (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 6,
                      textAlign: "center",
                      borderRadius: 12,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {isLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography variant="h6" color='#868E96'>
                          Loading events...
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <EventBusyIcon
                          sx={{
                            fontSize: 60,
                            color: '#DEE2E6',
                            mb: 2,
                          }}
                        />
                        <Typography variant="h6" color='#868E96'>
                          No events found
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ) : (
                filteredEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event._id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 12,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                        backgroundColor: '#F8F9FA',
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        overflow: "hidden",
                        position: "relative",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                        },
                      }}
                      onClick={(e) => {
                        if (e.target.closest('button, a, [role="button"]')) return;
                        router.push(`/current_event/${event._id}`);
                      }}
                    >
                      {event.image && (
                        <Box
                          sx={{
                            position: "relative",
                            height: 180,
                            width: "100%",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component="img"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.5s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                            src={`http://localhost:5000/uploads/${event.image.filename}`}
                            alt={event.name}
                          />
                          {(event.isClubFollowed ||
                            event.isBoardFollowed ||
                            event.registered) && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                display: "flex",
                                gap: 0.5,
                                backgroundColor: "rgba(255,255,255,0.9)",
                                borderRadius: "20px",
                                padding: "4px 8px",
                                backdropFilter: "blur(4px)",
                              }}
                            >
                              {event.isClubFollowed && (
                                <Tooltip title="You follow this club">
                                  <GroupsIcon
                                    color="primary"
                                    fontSize="small"
                                  />
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
                                  <FavoriteIcon
                                    color="error"
                                    fontSize="small"
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}

                      <CardContent sx={{ p: 3 }}>
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
                            sx={{
                              borderRadius: 8,
                              backgroundColor: "rgba(25, 113, 194, 0.1)",
                            }}
                            icon={<PeopleAltIcon fontSize="small" />}
                          />
                          {(isSuperAdmin || hasEventPermission(event)) && (
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => handleViewRegistrations(event._id)}
                              sx={{
                                color: '#2E3B55',
                                fontWeight: 500,
                                "&:hover": {
                                  backgroundColor: "rgba(46, 59, 85, 0.08)",
                                },
                              }}
                              endIcon={<VisibilityIcon fontSize="small" />}
                            >
                              View
                            </Button>
                          )}
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            color='#212529'
                            sx={{
                              flexGrow: 1,
                              fontWeight: 600,
                              fontSize: "1.25rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {event.name}
                          </Typography>
                          {(isSuperAdmin || hasEventPermission(event)) && (
                            <Box>
                              <IconButton
                                onClick={() => handleEdit(event)}
                                sx={{
                                  color: '#2E3B55',
                                  "&:hover": {
                                    backgroundColor: "rgba(46, 59, 85, 0.08)",
                                  },
                                }}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(event._id)}
                                sx={{
                                  color: '#E03131',
                                  "&:hover": {
                                    backgroundColor: "rgba(224, 49, 49, 0.08)",
                                  },
                                }}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>

                        {event.club_id && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1.5,
                            }}
                          >
                            <Avatar
                              src={
                                event.club_id.image?.path || event.club_id.image
                              }
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography
                              variant="body2"
                              color='#868E96'
                              sx={{ fontWeight: 500 }}
                            >
                              {event.club_id.name}
                            </Typography>
                            {event.isClubFollowed && (
                              <Chip
                                label="Following"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  borderRadius: 6,
                                  backgroundColor: "rgba(46, 59, 85, 0.1)",
                                  fontSize: "0.7rem",
                                }}
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
                              mb: 1.5,
                            }}
                          >
                            <WorkspacesIcon color="action" fontSize="small" />
                            <Typography
                              variant="body2"
                              color='#868E96'
                              sx={{ fontWeight: 500 }}
                            >
                              {event.board_id.name}
                            </Typography>
                            {event.isBoardFollowed && (
                              <Chip
                                label="Following"
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  borderRadius: 6,
                                  backgroundColor: "rgba(184, 160, 136, 0.1)",
                                  fontSize: "0.7rem",
                                }}
                              />
                            )}
                          </Box>
                        )}

                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                          <Chip
                            label={event.event_type_id || "Session"}
                            size="small"
                            sx={{
                              backgroundColor:
                                typeColors[event.event_type_id] ||
                                typeColors["Session"],
                              color: '#FFFFFF',
                              fontWeight: 500,
                              borderRadius: 8,
                            }}
                          />

                          <Chip
                            icon={<AccessTimeIcon fontSize="small" />}
                            label={`${event.duration} min`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 8,
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>

                        <Divider
                          sx={{ my: 2, borderColor: '#DEE2E6' }}
                        />

                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="body2"
                            color='#868E96'
                            sx={{
                              mb: 1.5,
                              display: "-webkit-box",
                              overflow: "hidden",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                              lineHeight: 1.5,
                            }}
                          >
                            {event.description}
                          </Typography>

                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <CalendarTodayIcon
                                  fontSize="small"
                                  sx={{ color: '#868E96', mr: 1 }}
                                />
                                <Typography
                                  variant="body2"
                                  color='#868E96'
                                  sx={{ fontWeight: 500 }}
                                >
                                  {new Date(event.timestamp).toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" }
                                  )}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <AccessTimeIcon
                                  fontSize="small"
                                  sx={{ color: '#868E96', mr: 1 }}
                                />
                                <Typography
                                  variant="body2"
                                  color='#868E96'
                                  sx={{ fontWeight: 500 }}
                                >
                                  {new Date(event.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <LocationOnIcon
                                  fontSize="small"
                                  sx={{ color: '#868E96', mr: 1 }}
                                />
                                <Typography
                                  variant="body2"
                                  color='#868E96'
                                  sx={{ fontWeight: 500 }}
                                >
                                  {event.venue}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        <Button
                          variant={event.registered ? "contained" : "outlined"}
                          fullWidth
                          onClick={() =>
                            !event.registered && handleRegister(event)
                          }
                          disabled={event.registered}
                          size="large"
                          sx={{
                            backgroundColor: event.registered
                              ? '#087F5B'
                              : "transparent",
                            color: event.registered
                              ? '#FFFFFF'
                              : '#2E3B55',
                            borderColor: event.registered
                              ? '#087F5B'
                              : '#2E3B55',
                            borderRadius: 8,
                            fontWeight: 500,
                            textTransform: "none",
                            py: 1,
                            "&:hover": {
                              backgroundColor: event.registered
                                ? '#087F5B'
                                : "rgba(46, 59, 85, 0.08)",
                              boxShadow: event.registered
                                ? "0 4px 10px rgba(8, 127, 91, 0.3)"
                                : "none",
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                          startIcon={
                            event.registered ? (
                              <CheckIcon />
                            ) : (
                              <EventAvailableIcon />
                            )
                          }
                        >
                          {event.registered ? "Registered" : "Register"}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>

        {canCreateEvents() && (
          <Tooltip title="Add new event">
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleAddNew}
              sx={{
                position: "fixed",
                bottom: 32,
                right: 32,
                boxShadow: "0 8px 16px rgba(46, 59, 85, 0.3)",
                backgroundColor: '#2E3B55',
                color: '#FFFFFF',
                "&:hover": {
                  backgroundColor: '#1A2438',
                  transform: "scale(1.1)",
                  boxShadow: "0 12px 20px rgba(46, 59, 85, 0.4)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
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
          club_id={null}
          board_id={boardId || null}
        />

        <Dialog
          open={registrationsDialog.open}
          onClose={() =>
            setRegistrationsDialog((prev) => ({ ...prev, open: false }))
          }
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 12,
              boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            },
          }}
        >
          <DialogTitle
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid #DEE2E6`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Registered Users
              </Typography>
              <IconButton
                onClick={() =>
                  setRegistrationsDialog((prev) => ({ ...prev, open: false }))
                }
                sx={{
                  color: '#868E96',
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ px: 2, py: 3 }}>
            {registrationsDialog.loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : registrationsDialog.registrations.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 4,
                }}
              >
                <PersonOffIcon
                  sx={{ fontSize: 48, color: '#DEE2E6', mb: 2 }}
                />
                <Typography
                  variant="body1"
                  color='#868E96'
                  align="center"
                >
                  No registrations yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ pt: 0 }}>
                {registrationsDialog.registrations.map((rsvp) => (
                  <ListItem
                    key={rsvp._id}
                    sx={{
                      px: 2,
                      borderRadius: 8,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: '#F1F3F5',
                      },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={rsvp.user_id?.profile_picture}
                        alt={rsvp.user_id?.name}
                        sx={{
                          width: 40,
                          height: 40,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {rsvp.user_id?.name || "Unknown User"}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color='#868E96'>
                          Registered on{" "}
                          {new Date(rsvp.timestamp).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      }
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
          sx={{
            "& .MuiAlert-filledSuccess": {
              boxShadow: "0 4px 12px rgba(8, 127, 91, 0.5)",
            },
            "& .MuiAlert-filledError": {
              boxShadow: "0 4px 12px rgba(224, 49, 49, 0.5)",
            },
            "& .MuiAlert-filledInfo": {
              boxShadow: "0 4px 12px rgba(25, 113, 194, 0.5)",
            },
            "& .MuiAlert-filledWarning": {
              boxShadow: "0 4px 12px rgba(245, 159, 0, 0.5)",
            },
          }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{
              width: "100%",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}