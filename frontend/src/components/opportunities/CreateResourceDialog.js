"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";

const CreateResourceDialog = ({ 
  open, 
  handleClose, 
  onSuccess,
  initialData = null,
  boardId,
  clubId,
  creatorId
}) => {
  const [error, setError] = useState({
    external_link: false,
  });
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    expiry_date: "",
    external_link: "",
    status: "active",
    tags: [],
    created_at: new Date().toISOString().split("T")[0],
    updated_at: null,
    board_id: boardId || "",
    club_id: clubId || "",
    creator_id: creatorId || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        created_at: initialData.created_at || new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString().split("T")[0],
        board_id: boardId || initialData.board_id,
        club_id: clubId || initialData.club_id,
        creator_id: creatorId || initialData.creator_id,
      });
      
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        expiry_date: "",
        external_link: "",
        status: "active",
        tags: [],
        created_at: new Date().toISOString().split("T")[0],
        updated_at: null,
        board_id: boardId || "",
        club_id: clubId || "",
        creator_id: creatorId || "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setSubmitError(null);
  }, [initialData, open, boardId, clubId, creatorId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "external_link") {
      const urlPattern = /^https?:\/\/.+/;
      setError({
        ...error,
        external_link: !urlPattern.test(value),
      });
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      updated_at: new Date().toISOString().split("T")[0],
    }));
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput],
        updated_at: new Date().toISOString().split("T")[0],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      tags: newTags,
      updated_at: new Date().toISOString().split("T")[0],
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const urlPattern = /^https?:\/\/.+/;
    const isValidUrl = urlPattern.test(formData.external_link);

    if (!isValidUrl) {
      setError({
        ...error,
        external_link: true,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formDataToSend = new FormData();

    // Append all regular fields
    Object.keys(formData).forEach(key => {
      if (key === 'tags') {
        formData.tags.forEach(tag => {
          formDataToSend.append('tags[]', tag);
        });
      } else if (key !== 'image') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append image file if it exists
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    // If editing and image was removed
    if (initialData?.image && !imagePreview) {
      formDataToSend.append('removeImage', 'true');
    }

    try {
      let url = "http://localhost:5000/opportunities";
      let method = "POST";

      if (initialData) {
        url = `http://localhost:5000/opportunities/${initialData._id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(
          initialData
            ? "Failed to update opportunity"
            : "Failed to create opportunity"
        );
      }

      const result = await response.json();
      onSuccess(result);
      handleClose();
    } catch (err) {
      console.error("Error submitting opportunity:", err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {initialData ? "Edit Opportunity" : "Create New Opportunity"}
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {submitError && (
          <Box sx={{ color: "error.main", mb: 2 }}>
            <Typography color="error">{submitError}</Typography>
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleFormChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.start_date}
              onChange={handleFormChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="End Date"
              name="end_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.end_date}
              onChange={handleFormChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              name="expiry_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.expiry_date}
              onChange={handleFormChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="External Link"
              name="external_link"
              value={formData.external_link}
              onChange={handleFormChange}
              required
              type="url"
              error={error.external_link}
              helperText={
                error.external_link ? "Enter a valid URL (https://...)" : ""
              }
            />
          </Grid>
          <Grid item xs={12}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
              id="image-upload-input"
            />
            <label htmlFor="image-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload Image
              </Button>
            </label>
            {(imagePreview || (initialData?.image && !imageFile)) && (
              <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
                <img
                  src={imagePreview || initialData.image}
                  alt="Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    color: "red",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                fullWidth
                label="Add Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <Button variant="contained" onClick={handleAddTag}>
                Add
              </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(index)}
                  sx={{ mr: 1, mt: 1 }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateResourceDialog;