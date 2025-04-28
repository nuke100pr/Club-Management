"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchUserData, hasPermission } from "@/utils/auth";
import EventForm from "../../../components/events/EventForm";
import * as XLSX from "xlsx";
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
  CheckCircleOutline,
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
  alpha,
  useTheme,
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
  Event as EventIcon,
} from "@mui/icons-material";

const EventsPage = () => {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const eventId = params.event_id;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithEventPermission, setUserClubsWithEventPermission] =
    useState([]);
  const [hasPermissionToEdit, setHasPermissionToEdit] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [arrayPermissions, setArrayPermissions] = useState({});
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
          setCurrentUser(userData);
          setUserId(userData.userId);
          setIsSuperAdmin(userData.isSuperAdmin);
          if (userData.userData?.clubs) {
            const clubsWithEventPermission = Object.keys(
              userData.userData.clubs
            ).filter(
              (clubId) => userData.userData.clubs[clubId].events === true
            );
            setUserClubsWithEventPermission(clubsWithEventPermission);
          }
        }

        if (eventId) {
          console.log(eventId);
          // Fetch single event details
          const eventResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`
          );

          if (!eventResponse.ok) throw new Error("Failed to fetch event");
          const eventResult = await eventResponse.json();
          if (!eventResult.success)
            throw new Error(eventResult.message || "Failed to fetch event");
          setCurrentEvent(eventResult.data);
          console.log(eventResult.data);

          // Fetch RSVPs for this event
          const rsvpResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`
          );
          if (!rsvpResponse.ok) throw new Error("Failed to fetch RSVPs");
          const rsvpResult = await rsvpResponse.json();

          setRsvps(Array.isArray(rsvpResult.data) ? rsvpResult.data : []);

          // Check if current user is registered
          if (userData && Array.isArray(rsvpResult.data)) {
            setIsRegistered(
              rsvpResult.data.some(
                (r) =>
                  r.user_id === userData.userId ||
                  (typeof r.user_id === "object" &&
                    r.user_id?._id === userData.userId)
              )
            );
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
        setNotification({
          open: true,
          message: "Failed to load data",
          severity: "error",
        });
      }
    };

    fetchData();
  }, [eventId, userId]);

  useEffect(() => {
    if (currentEvent && currentUser) {
      const lml = async () => {
        const hasPermission = await hasEventPermission(currentEvent);
        console.log(hasPermission);
        setHasPermissionToEdit(hasPermission);
        console.log(hasPermissionToEdit);
      };

      lml();
    }
  }, [currentEvent, currentUser]);

  const hasEventPermission = (currentEvent) => {
    if (isSuperAdmin) return true;
    if (!currentUser) return false;

    const clubId = currentEvent.club_id?._id || currentEvent.club_id;
    const boardId = currentEvent.board_id?._id || currentEvent.board_id;

    return hasPermission("events", currentUser, boardId, clubId);
  };

  const handleExportToExcel = () => {
    // Prepare data for Excel
    const excelData = rsvps.map((rsvp) => ({
      Name: rsvp.user_id?.name || "Unknown User",
      Email: rsvp.user_id?.email_id || "Unknown Email",
      "Registration Date": formatDate(rsvp.timestamp),
      'Registration Time': formatTime(rsvp.timestamp),
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    // Generate file and download
    XLSX.writeFile(wb, `${currentEvent.name}_registrations.xlsx`);
  };

  const handleRegisterForEvent = async () => {
    try {
      if (!userId) {
        setNotification({
          open: true,
          message: "Please login to register for events",
          severity: "warning",
        });
        return;
      }

      if (isRegistered) {
        return; // Already registered, do nothing
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_id: eventId,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to register for event");
      const result = await response.json();

      if (!result.success)
        throw new Error(result.message || "Registration failed");

      setIsRegistered(true);
      // Refresh RSVPs to get updated list
      const rsvpResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`
      );
      if (rsvpResponse.ok) {
        const rsvpResult = await rsvpResponse.json();
        setRsvps(Array.isArray(rsvpResult.data) ? rsvpResult.data : []);
      }

      setNotification({
        open: true,
        message: "Registration successful",
        severity: "success",
      });
    } catch (error) {
      console.error("Error registering for event:", error);
      setNotification({
        open: true,
        message: error.message || "Failed to register for event",
        severity: "error",
      });
    }
  };

  const handleDeleteRsvp = async (rsvpId) => {
    setConfirmDialog({
      open: true,
      title: "Confirm Unregistration",
      message: "Are you sure you want to remove this registration?",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp/${rsvpId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) throw new Error("Failed to delete RSVP");
          const result = await response.json();

          if (!result.success)
            throw new Error(result.message || "Failed to delete RSVP");

          // Refresh RSVPs list
          const rsvpResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}/rsvp`
          );
          if (rsvpResponse.ok) {
            const rsvpResult = await rsvpResponse.json();
            setRsvps(Array.isArray(rsvpResult.data) ? rsvpResult.data : []);
          }

          setNotification({
            open: true,
            message: "Registration removed successfully",
            severity: "success",
          });
        } catch (error) {
          console.error("Error deleting RSVP:", error);
          setNotification({
            open: true,
            message: error.message || "Failed to remove registration",
            severity: "error",
          });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleDelete = async () => {
    setConfirmDialog({
      open: true,
      title: "Confirm Event Deletion",
      message:
        "Are you sure you want to delete this event? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) throw new Error("Failed to delete event");
          const result = await response.json();

          if (!result.success)
            throw new Error(result.message || "Failed to delete event");

          router.push("/events");
          setNotification({
            open: true,
            message: "Event deleted successfully",
            severity: "success",
          });
        } catch (error) {
          console.error("Error deleting event:", error);
          setNotification({
            open: true,
            message: error.message || "Failed to delete event",
            severity: "error",
          });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`
      );
      if (!response.ok) throw new Error("Failed to fetch event");
      const result = await response.json();

      if (!result.success)
        throw new Error(result.message || "Failed to fetch event");
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

      setEditFormData(formData);
      setOpenEditDialog(true);
      setIsEditing(true);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setNotification({
        open: true,
        message: error.message || "Failed to load event details",
        severity: "error",
      });
    }
  };

  const handleClipboardFallback = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/events/${eventId}`)
      .then(() => {
        setNotification({
          open: true,
          message: "Event link copied to clipboard!",
          severity: "success",
        });
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        setNotification({
          open: true,
          message: "Failed to copy link. Please try again.",
          severity: "error",
        });
      });
  };

  const handleFormSubmit = async (formData) => {
    try {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`,
        {
          method: "PUT",
          body: multipartFormData,
        }
      );

      if (!response.ok) throw new Error("Failed to update event");
      const result = await response.json();

      // Refresh event data
      const eventResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`
      );

      const eventResult = await eventResponse.json();
      setCurrentEvent(eventResult.data);
      console.log(eventResult.data);

      setOpenEditDialog(false);
      setNotification({
        open: true,
        message: "Event updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating event:", error);
      setNotification({
        open: true,
        message: error.message || "Failed to update event",
        severity: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CircularProgress
          sx={{
            color: theme.palette.primary.main,
            mb: 3,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontWeight: 500,
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
          backgroundColor: theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Alert
          severity="error"
          sx={{
            width: "100%",
            maxWidth: 600,
            mb: 3,
            borderRadius: "12px",
            boxShadow: theme.shadows[4],
          }}
        >
          {error}
        </Alert>
        <Button
          onClick={() => window.location.reload()}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            fontFamily: theme.typography.fontFamily,
            fontWeight: 500,
            borderRadius: "8px",
            px: 4,
            py: 1.5,
            boxShadow: theme.shadows[2],
            "&:hover": {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              boxShadow: theme.shadows[4],
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
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
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        {/* Hero Section with Background Image */}
        <Box
          sx={{
            position: "relative",
            height: { xs: "300px", md: "400px" },
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Box
            component="img"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.7)",
            }}
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${currentEvent.image?.filename}`}
            alt={currentEvent.name}
          />

          {/* Overlay Content */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: { xs: 2, md: 4 },
            }}
          >
            {/* Back Button */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/events")}
              sx={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                color: "white",
                alignSelf: "flex-start",
                borderRadius: "8px",
                fontWeight: 500,
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.25)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Back to All Events
            </Button>

            {/* Admin Actions */}
            {hasPermissionToEdit && (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  display: "flex",
                  gap: 1,
                  zIndex: 2,
                }}
              >
                <Tooltip title="Edit Event">
                  <IconButton
                    onClick={handleEdit}
                    sx={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(10px)",
                      color: "white",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.25)",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Event">
                  <IconButton
                    onClick={handleDelete}
                    sx={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(10px)",
                      color: "white",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.25)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Event Title */}
            <Box
              sx={{
                px: { xs: 2, md: 6 },
                py: 3,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)",
              }}
            >
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: "white",
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 600,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                }}
              >
                {currentEvent.name}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Chip
                  icon={<CalendarIcon style={{ color: "white" }} />}
                  label={formatDate(currentEvent.timestamp)}
                  sx={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    borderRadius: "8px",
                    height: "28px",
                    "& .MuiChip-label": { fontWeight: 500 },
                  }}
                />
                <Chip
                  icon={<TimeIcon style={{ color: "white" }} />}
                  label={formatTime(currentEvent.timestamp)}
                  sx={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    borderRadius: "8px",
                    height: "28px",
                    "& .MuiChip-label": { fontWeight: 500 },
                  }}
                />
                <Chip
                  icon={<LocationIcon style={{ color: "white" }} />}
                  label={currentEvent.venue}
                  sx={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    borderRadius: "8px",
                    height: "28px",
                    "& .MuiChip-label": { fontWeight: 500 },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
          <Grid container spacing={4}>
            {/* Left Content - Event Details */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "16px",
                  boxShadow: theme.shadows[2],
                  transition: "all 0.3s ease",
                  mb: 4,
                  backgroundColor: theme.palette.background.paper,
                  borderTop: `4px solid ${theme.palette.primary.main}`,
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  About This Event
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontFamily: theme.typography.fontFamily,
                    lineHeight: 1.7,
                    mb: 4,
                  }}
                  dangerouslySetInnerHTML={{ __html: currentEvent.description }}
                />

                <Divider
                  sx={{
                    my: 3,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <Button
                    variant="contained"
                    disabled={isRegistered}
                    onClick={!isRegistered ? handleRegisterForEvent : undefined}
                    startIcon={<EventIcon />}
                    sx={{
                      background: isRegistered
                        ? theme.palette.success.main
                        : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: "white",
                      borderRadius: "8px",
                      px: 4,
                      py: 1.25,
                      fontWeight: 500,
                      boxShadow: theme.shadows[2],
                      "&:hover": !isRegistered
                        ? {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                            boxShadow: theme.shadows[4],
                            transform: "translateY(-2px)",
                          }
                        : {},
                      transition: "all 0.3s ease",
                      "&.Mui-disabled": {
                        background: theme.palette.success.main,
                        color: "white",
                      },
                    }}
                  >
                    {isRegistered ? "Registered" : "Register for Event"}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => {
                      const shareData = {
                        title: currentEvent.name,
                        text: `Check out this event: ${currentEvent.name}`,
                        url: `${window.location.origin}/events/${eventId}`,
                      };

                      if (navigator.share && navigator.canShare(shareData)) {
                        navigator
                          .share(shareData)
                          .then(() => console.log("Shared successfully"))
                          .catch((error) => {
                            console.log("Error sharing:", error);
                            handleClipboardFallback();
                          });
                      } else {
                        handleClipboardFallback();
                      }
                    }}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      borderRadius: "8px",
                      fontWeight: 500,
                      "&:hover": {
                        borderColor: theme.palette.primary.dark,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                      transition: "all 0.3s ease",
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
                  borderRadius: "16px",
                  boxShadow: theme.shadows[2],
                  mb: 4,
                  backgroundColor: theme.palette.background.paper,
                  borderTop: `4px solid ${theme.palette.secondary.main}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Registrations ({rsvps.length})
                </Typography>

                {rsvps.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleExportToExcel}
                    sx={{
                      mb: 2,
                      float: "right",
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 500,
                    }}
                  >
                    Export to Excel
                  </Button>
                )}

                {rsvps.length > 0 ? (
                  <TableContainer
                    sx={{ borderRadius: "8px", overflow: "hidden" }}
                  >
                    <Table
                      sx={{
                        "& .MuiTableCell-root": {
                          fontFamily: theme.typography.fontFamily,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                        },
                        "& .MuiTableCell-head": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                          color: theme.palette.text.primary,
                          fontWeight: 600,
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Registration Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rsvps.map((rsvp) => (
                          <TableRow
                            key={rsvp._id}
                            sx={{
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.02
                                ),
                              },
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  src={rsvp.user_id?.profile_picture}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    boxShadow: theme.shadows[1],
                                  }}
                                >
                                  <PersonIcon />
                                </Avatar>
                                <Box>
                                  <Typography
                                    sx={{ fontWeight: 600, fontSize: "1rem" }}
                                  >
                                    {rsvp.user_id?.name || "Unknown User"}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      fontWeight: 400,
                                      mt: 0.5,
                                    }}
                                  >
                                    {rsvp.user_id?.email_id || "Unknown Email"}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{formatDate(rsvp.timestamp)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      py: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      borderRadius: "8px",
                    }}
                  >
                    <GroupIcon
                      sx={{
                        fontSize: 48,
                        color: theme.palette.text.secondary,
                        opacity: 0.5,
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontStyle: "italic",
                        textAlign: "center",
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
                  borderRadius: "16px",
                  boxShadow: theme.shadows[2],
                  mb: 4,
                  backgroundColor: theme.palette.background.paper,
                  borderTop: `4px solid ${theme.palette.primary.light}`,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  Event Organizer
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (currentEvent?.club_id?.name) {
                      router.push(`/current_club/${currentEvent.club_id._id}`);
                    } else if (currentEvent?.board_id?.name) {
                      router.push(
                        `/current_board/${currentEvent.board_id._id}`
                      );
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    {(
                      currentEvent?.club_id?.name?.[0] ||
                      currentEvent?.board_id?.name?.[0]
                    )?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 500 }}>
                      {currentEvent.club_id?.name ||
                        currentEvent.board_id?.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {currentEvent.club_id?.name ? "Club" : "Board"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Event Details Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  boxShadow: theme.shadows[2],
                  mb: 4,
                  backgroundColor: theme.palette.background.paper,
                  borderTop: `4px solid ${theme.palette.secondary.main}`,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  Event Details
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
                  >
                    Date & Time
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {formatDate(currentEvent.timestamp)} •{" "}
                    {formatTime(currentEvent.timestamp)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
                  >
                    Location
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {currentEvent.venue}
                  </Typography>
                </Box>

                {currentEvent.capacity && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
                    >
                      Capacity
                    </Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {rsvps.length} / {currentEvent.capacity} registered
                    </Typography>
                  </Box>
                )}

                {currentEvent.tags?.length > 0 && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, mb: 1 }}
                    >
                      Tags
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {currentEvent.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            height: "22px",
                            fontSize: "0.65rem",
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                            color: theme.palette.primary.dark,
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.2
                              ),
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Edit Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${alpha(
                theme.palette.primary.main,
                0.1
              )}`,
            }}
          >
            Edit Event
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <EventForm
              initialData={editFormData}
              onSubmit={handleFormSubmit}
              onCancel={() => setOpenEditDialog(false)}
              eventTypes={[
                "Session",
                "Competition",
                "Workshop",
                "Meeting",
                "Masterclass",
                "Seminar",
                "Summit",
              ]}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              p: 2,
              maxWidth: "500px",
              width: "100%",
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {confirmDialog.title}
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary }}
            >
              {confirmDialog.message}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.text.secondary, 0.04),
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDialog.onConfirm}
              sx={{
                backgroundColor: theme.palette.error.main,
                color: "white",
                fontWeight: 500,
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  backgroundColor: theme.palette.error.dark,
                },
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
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{
              borderRadius: "8px",
              boxShadow: theme.shadows[4],
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
};

export default EventsPage;
