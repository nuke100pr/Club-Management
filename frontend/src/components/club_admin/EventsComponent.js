// pages/events.js
"use client";

import { useEffect, useState } from "react";
import { fetchUserData,hasPermission } from "@/utils/auth";
import EventForm from "../events/EventForm";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Fab,
  CircularProgress,
  Badge,
} from "@mui/material";
import {
  Edit,
  Delete,
  Event,
  AccessTime,
  LocationOn,
  Timer,
  People,
  Add,
  Favorite,
  Check,
  Close,
  Download,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const eventTypes = ["Session", "Competition", "Workshop", "Meeting"];
const typeColors = {
  Session: "#4CAF50",
  Competition: "#FF5722",
  Workshop: "#9C27B0",
  Meeting: "#2196F3",
};

export default function EventsPage({ clubId = null, searchQuery = "" }) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [user_id, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isBoardAdmin, setIsBoardAdmin] = useState(false);
  const [fullData, setFullData] = useState(null);
  const [userClubsWithEventPermission, setUserClubsWithEventPermission] =
    useState([]);
  const [userBoardsWithEventPermission, setUserBoardsWithEventPermission] =
    useState([]);
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
    eventName: "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [minimumLoadingTimeElapsed, setMinimumLoadingTimeElapsed] =
    useState(false);
  const router = useRouter();
  const [arrayPermissions, setArrayPermissions] = useState({});
  const [canCreateEvents, setCanCreateEvents] = useState(false);

  useEffect(() => {
    // Check permissions for all resources
    if (userData && events.length > 0) {
      events.forEach(async (element) => {
        const clubId = element.club_id?._id || element.club_id;
        const boardId = element.board_id?._id || element.board_id;

        // If you must use the async version of hasPermission
        const hasAccess = await hasPermission(
          "events",
          userData,
          boardId,
          clubId
        );

        setArrayPermissions((prev) => ({
          ...prev,
          [element._id]: hasAccess,
        }));
      });
    }
  }, [userData, events]);


useEffect(() => {
  async function checkEventCreationPermission() {
    if (isSuperAdmin) {
      setCanCreateEvents(true);
      return;
    }
    if (!userData) {
      setCanCreateEvents(false);
      return;
    }
    if (boardId) {
      const hasEventPermission = await hasPermission("events", userData, null, clubId);
      setCanCreateEvents(hasEventPermission);
      return;
    }
    setCanCreateEvents(false);
  }

  checkEventCreationPermission();
}, [isSuperAdmin, userData, clubId]);

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);
        setIsBoardAdmin(result.isBoardAdmin);
        setFullData(result);

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
            (clubId) => result.userData?.data?.boards[clubId].events === true
          );
          setUserBoardsWithEventPermission(boardsWithEventPermission);
        }
      }
    }
    loadUserData();
  }, []);

  // Set minimum loading time of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingTimeElapsed(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Build URL with query parameters
        let url = new URL("http://localhost:5000/events");

        // Add userId parameter if available
        if (user_id) {
          url.searchParams.append("userId", user_id);
        }

        if (clubId) {
          url.searchParams.append("board_id", clubId);
        }

        // Add search query if provided
        if (searchQuery) {
          url.searchParams.append("search", searchQuery);
        }

        const response = await fetch(url.toString());
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
              console.log(rsvpResult);
              console.log(user_id);
              return {
                ...event,
                registeredCount: rsvpResult.data?.length || 0,
                registered:
                  rsvpResult.data?.some(
                    (reg) => reg?.user_id?._id === user_id
                  ) || false,
              };
            } catch (error) {
              console.error(
                `Error fetching RSVP for event ${event._id}:`,
                error
              );
              return { ...event, registeredCount: 0, registered: false };
            }
          })
        );

        setEvents(eventsWithCounts);
        console.log(eventsWithCounts);

        // We don't immediately set loading to false here
        // Instead, we check if minimum loading time has elapsed in a separate effect
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setError(error.message);
        setNotification({
          open: true,
          message: "Failed to load events: " + error.message,
          severity: "error",
        });
      }
    };

    fetchEvents();
  }, [user_id, isEditing, clubId, searchQuery]);

  // Effect to control the loading state based on data fetching and minimum time
  useEffect(() => {
    // Check if data fetching has completed (whether events exist or not)
    if (minimumLoadingTimeElapsed && events !== undefined) {
      setLoading(false);
    } else if (error && minimumLoadingTimeElapsed) {
      setLoading(false);
    }
  }, [events, minimumLoadingTimeElapsed, error]);

  const hasEventPermission = (event) => {
    if (isSuperAdmin) return true;
    if (isBoardAdmin) return true;

    const hasClubPermission =
      event.club_id &&
      userData?.data?.clubs?.[event.club_id._id || event.club_id]?.events ===
        true;

    const hasBoardPermission =
      event.board_id &&
      userData?.data?.boards?.[event.board_id._id || event.board_id]?.events ===
        true;

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
      const foundEvent = events.find((event) => event._id === eventId);
      const eventName = foundEvent ? foundEvent.name : "Event";

      setRegistrationsDialog({
        open: true,
        eventId,
        loading: true,
        registrations: [],
        eventName: eventName,
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
        eventName: eventName,
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

  const handleExportRegistrations = () => {
    try {
      const { registrations, eventName } = registrationsDialog;

      // Format data for Excel export
      const exportData = registrations.map((registration, index) => ({
        "S.No": index + 1,
        Name: registration.user_id?.name || "N/A",
        Email: registration.user_id?.email_id || "N/A",
        "Registration Date": new Date(
          registration.timestamp
        ).toLocaleDateString(),
        "Registration Time": new Date(
          registration.timestamp
        ).toLocaleTimeString(),
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

      // Set column widths
      const colWidths = [
        { wch: 5 }, // S.No
        { wch: 25 }, // Name
        { wch: 35 }, // Email
        { wch: 15 }, // Registration Date
      ];
      worksheet["!cols"] = colWidths;

      // Generate filename and export
      const filename = `${eventName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setNotification({
        open: true,
        message: "Registrations exported successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to export registrations:", error);
      setNotification({
        open: true,
        message: "Failed to export registrations",
        severity: "error",
      });
    }
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

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setCurrentEvent(null);
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
      multipartFormData.append("board_id", formData.board_id || clubId || "");

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
                  registeredCount: event.registeredCount,
                }
              : event
          )
        );
      } else {
        const newEvent = {
          ...updatedEvent.data,
          registered: false,
          registeredCount: 0,
        };
        setEvents([newEvent, ...events]);
      }

      setOpenDialog(false);
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

  const skeletonArray = Array(3).fill(0);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
          Error loading events
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            background: "linear-gradient(to right, #4776E6, #8E54E9)",
            color: "white",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(71, 118, 230, 0.2)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(71, 118, 230, 0.3)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.3s ease",
          }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", p: 4 }}>
      {searchQuery && !loading && (
        <Typography variant="h6" sx={{ mb: 3 }}>
          Search results for: "{searchQuery}"
        </Typography>
      )}

      {!loading && events.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No events found
          </Typography>
          {searchQuery && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Try changing your search criteria
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {(loading ? skeletonArray : events).map((event, idx) => (
          <Grid item xs={12} sm={6} md={4} key={loading ? idx : event._id}>
            <Card
              elevation={3}
              sx={{
                borderRadius: "16px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": !loading && {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
                },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={180}
                  sx={{
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 180,
                    backgroundImage: event.image
                      ? `url(http://localhost:5000/uploads/${event.image.filename})`
                      : "linear-gradient(135deg, #4776E6, #8E54E9)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    position: "relative",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      background: "linear-gradient(to right, #4776E6, #8E54E9)",
                      color: "white",
                      fontWeight: 600,
                      padding: "6px 16px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background:
                          "linear-gradient(to right, #3a5fc0, #7a42d8)",
                        boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => router.push(`/current_event/${event._id}`)}
                  >
                    View Event
                  </Button>
                  {event.event_type_id && (
                    <Chip
                      label={event.event_type_id}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        backgroundColor:
                          typeColors[event.event_type_id] ||
                          typeColors["Session"],
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {event.registered && (
                    <Tooltip title="You're registered">
                      <Favorite
                        fontSize="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          color: "#FF5252",
                          borderRadius: "50%",
                          padding: "4px",
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              )}

              <CardContent sx={{ p: 3 }}>
                {loading ? (
                  <>
                    <Skeleton variant="text" height={30} width="90%" />
                    <Skeleton variant="text" height={20} width="100%" />
                    <Skeleton variant="text" height={20} width="80%" />
                    <Box sx={{ mt: 2 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton
                          key={i}
                          variant="text"
                          height={20}
                          width={`${80 - i * 10}%`}
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={22}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={100}
                          height={22}
                        />
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {event.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {event.description}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Event
                          sx={{ fontSize: 18, color: "primary.main", mr: 1 }}
                        />
                        <Typography variant="body2">
                          {new Date(event.timestamp).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <AccessTime
                          sx={{ fontSize: 18, color: "primary.main", mr: 1 }}
                        />
                        <Typography variant="body2">
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <LocationOn
                          sx={{ fontSize: 18, color: "primary.main", mr: 1 }}
                        />
                        <Typography variant="body2">{event.venue}</Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Timer
                          sx={{ fontSize: 18, color: "primary.main", mr: 1 }}
                        />
                        <Typography variant="body2">
                          {event.duration} min
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          size="small"
                          label={event.event_type_id || "Session"}
                          color="secondary"
                        />
                        <Chip
                          size="small"
                          label={`${event.registeredCount} registrations`}
                          icon={<People />}
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>

              <CardActions
                sx={{ p: 3, pt: 0, justifyContent: "space-between" }}
              >
                {loading ? (
                  <Skeleton variant="rectangular" height={36} width={60} />
                ) : (
                  <Box>
                    {arrayPermissions[event._id] && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(event._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                )}

                {loading ? (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Skeleton variant="rectangular" height={36} width={130} />
                    <Skeleton variant="rectangular" height={36} width={90} />
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: "none", fontWeight: 500 }}
                      onClick={() => handleViewRegistrations(event._id)}
                    >
                      View Registrations
                    </Button>
                    <Button
                      variant={event.registered ? "contained" : "contained"}
                      size="small"
                      disabled={event.registered}
                      onClick={() => !event.registered && handleRegister(event)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        background: event.registered
                          ? "#4CAF50"
                          : "linear-gradient(to right, #4776E6, #8E54E9)",
                        boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                        "&:hover": !event.registered && {
                          background:
                            "linear-gradient(to right, #3a5fc0, #7a42d8)",
                          boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                          transform: "translateY(-2px)",
                        },
                        ...(event.registered && {
                          "&:hover": {
                            backgroundColor: "#4CAF50",
                          },
                        }),
                      }}
                      startIcon={event.registered ? <Check /> : null}
                    >
                      {event.registered ? "Registered" : "Register"}
                    </Button>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Event Button */}
      {canCreateEvents && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddNew}
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            background: "linear-gradient(to right, #4776E6, #8E54E9)",
            color: "white",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 8px 20px rgba(71, 118, 230, 0.3)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Registrations Dialog */}
      <Dialog
        open={registrationsDialog.open}
        onClose={() =>
          setRegistrationsDialog({ ...registrationsDialog, open: false })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Event Registrations</Typography>
          <Box>
            {registrationsDialog.registrations.length > 0 && (
              <Tooltip title="Export as Excel">
                <IconButton
                  onClick={handleExportRegistrations}
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              onClick={() =>
                setRegistrationsDialog({ ...registrationsDialog, open: false })
              }
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {registrationsDialog.loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : registrationsDialog.registrations.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No registrations yet
              </Typography>
            </Box>
          ) : (
            <List>
              {registrationsDialog.registrations.map((registration) => (
                <ListItem key={registration._id}>
                  <ListItemAvatar>
                    <Avatar src={registration.user_id?.profile_pic} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={registration.user_id?.name || "Unknown User"}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {registration.user_id?.email_id}
                        </Typography>
                        <br />
                        {new Date(registration.timestamp).toLocaleString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Event" : "Create New Event"}
        </DialogTitle>
        <DialogContent>
          <EventForm
            event={currentEvent}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenDialog(false)}
            clubs={userClubsWithEventPermission}
            boards={userBoardsWithEventPermission}
            isSuperAdmin={isSuperAdmin}
            isBoardAdmin={isBoardAdmin}
            eventTypes={eventTypes}
            clubId={clubId}
          />
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
