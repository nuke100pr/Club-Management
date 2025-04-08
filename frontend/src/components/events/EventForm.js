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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const EventForm = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  title = "Add New Event",
  submitButtonText = "Create Event",
  eventTypes = ["Session", "Competition", "Workshop", "Meeting"],
  club_id = null, // Add club_id as a prop with default null
  board_id = null, // Add board_id as a prop with default null
}) => {
  // Ensure all form fields have default values
  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    timestamp: "",
    duration: "",
    description: "",
    event_type_id: eventTypes[0] || "Session",
    club_id: club_id || "", // Use prop value or empty string
    board_id: board_id || "", // Use prop value or empty string
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Add useEffect to update form data when initialData or props change
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        venue: initialData.venue || "",
        timestamp: initialData.timestamp || "",
        duration: initialData.duration || "",
        description: initialData.description || "",
        event_type_id: initialData.event_type_id || eventTypes[0] || "Session",
        club_id: initialData.club_id || club_id || "",
        board_id: initialData.board_id || board_id || "",
      });

      // Reset image-related states
      setImageFile(null);
      setImagePreview(null);
    }
  }, [initialData, eventTypes, club_id, board_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file for upload
      setImageFile(file);

      // Create preview
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
      club_id: club_id || "",
      board_id: board_id || "",
    });
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    const eventData = {
      ...formData,
      timestamp: formData.timestamp
        ? new Date(formData.timestamp).toISOString()
        : new Date().toISOString(),
      club_id: formData.club_id || null,
      board_id: formData.board_id || null,
      image: imageFile, // Include image file in submission
    };

    onSubmit(eventData);
  };

  const isFormValid = () => {
    // Validate required fields
    return formData.name && formData.venue && formData.timestamp;
  };

  return (
    <Dialog open={open} onClose={resetForm} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && <Box sx={{ color: "error.main", mt: 2, mb: 2 }}>{error}</Box>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Event Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
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
                  step: 300, // 5 min
                },
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="duration"
              label="Duration (e.g., 2 hours)"
              fullWidth
              value={formData.duration}
              onChange={handleInputChange}
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
              >
                {eventTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1 }}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={resetForm}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm;