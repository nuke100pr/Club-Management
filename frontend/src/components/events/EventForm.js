"use client";
import { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  Box,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getAuthToken } from "@/utils/auth";

const EventForm = ({
  event,
  onSubmit,
  onCancel,
  clubs = [],
  boards = [],
  isSuperAdmin = false,
  isBoardAdmin = false,
  eventTypes = ["Session", "Competition", "Workshop", "Meeting"],
  boardId = null,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    timestamp: "",
    duration: "",
    description: "",
    event_type_id: eventTypes[0] || "Session",
    club_id: "",
    board_id: boardId || "",
  });
  const [authToken, setAuthToken] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        venue: event.venue || "",
        timestamp: event.timestamp ? new Date(event.timestamp).toISOString().slice(0, 16) : "",
        duration: event.duration || "",
        description: event.description || "",
        event_type_id: event.event_type_id || eventTypes[0] || "Session",
        club_id: event.club_id?._id || event.club_id || "",
        board_id: event.board_id?._id || event.board_id || boardId || "",
      });

      // Set image preview if the event has an image
      if (event.image && event.image.filename) {
        setImagePreview(`http://localhost:5000/uploads/${event.image.filename}`);
      } else {
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [event, eventTypes, boardId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      venue: "",
      timestamp: "",
      duration: "",
      description: "",
      event_type_id: eventTypes[0] || "Session",
      club_id: "",
      board_id: boardId || "",
    });
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    onCancel && onCancel();
  };

  const handleSubmit = () => {
    if (!authToken) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const eventData = {
        ...formData,
        timestamp: formData.timestamp
          ? new Date(formData.timestamp).toISOString()
          : new Date().toISOString(),
        club_id: formData.club_id || null,
        board_id: formData.board_id || boardId || null,
        image: imageFile,
      };

      onSubmit(eventData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      setIsSubmitting(false);
    } catch (error) {
      setError("Error submitting form: " + error.message);
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name && formData.venue && formData.timestamp;
  };

  return (
    <>
      {error && (
        <Box sx={{ 
          color: theme.palette.error.main, 
          mt: 2, 
          mb: 2 
        }}>
          {error}
        </Box>
      )}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <TextField
            name="name"
            label="Event Name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="timestamp"
            label="Event Date and Time"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.timestamp}
            onChange={handleInputChange}
            required
            InputProps={{
              inputProps: {
                step: 300,
              },
            }}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="venue"
            label="Venue"
            fullWidth
            value={formData.venue}
            onChange={handleInputChange}
            required
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="duration"
            label="Duration (e.g., 2 hours)"
            fullWidth
            value={formData.duration}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="event-type-label">Event Type</InputLabel>
            <Select
              labelId="event-type-label"
              name="event_type_id"
              value={formData.event_type_id}
              label="Event Type"
              onChange={handleInputChange}
              sx={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {isSuperAdmin && (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="club-label">Club</InputLabel>
                <Select
                  labelId="club-label"
                  name="club_id"
                  value={formData.club_id}
                  label="Club"
                  onChange={handleInputChange}
                  sx={{
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {clubs.map((clubId) => (
                    <MenuItem key={clubId} value={clubId}>
                      {clubId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {!boardId && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="board-label">Board</InputLabel>
                  <Select
                    labelId="board-label"
                    name="board_id"
                    value={formData.board_id}
                    label="Board"
                    onChange={handleInputChange}
                    sx={{
                      backgroundColor: theme.palette.background.default,
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {boards.map((boardId) => (
                      <MenuItem key={boardId} value={boardId}>
                        {boardId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </>
        )}
        
        <Grid item xs={12}>
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mt: 1,
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>
          <FormHelperText>
            Upload an image for the event (optional)
          </FormHelperText>

          {imagePreview && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
            </Box>
          )}
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button 
          onClick={resetForm}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isFormValid() || isSubmitting}
          sx={{
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            '&:hover': {
              background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
            '&.Mui-disabled': {
              background: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled
            }
          }}
        >
          {isSubmitting ? "Submitting..." : event ? "Update Event" : "Create Event"}
        </Button>
      </Box>
    </>
  );
};

export default EventForm;
