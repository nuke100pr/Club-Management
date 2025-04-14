import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  OutlinedInput,
  IconButton,
  Box,
  Chip,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ForumEditDialog = ({ open, onClose, onEditForum, forumId, userId }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(true);
  const [forumData, setForumData] = useState({
    title: "",
    description: "",
    public_or_private: "public",
    tags: [],
    user_id: userId,
    board_id: null,
    club_id: null,
  });

  useEffect(() => {
    // Fetch forum data when dialog opens and forumId is available
    if (open && forumId) {
      fetchForumData();
    }
  }, [open, forumId]);

  const fetchForumData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/forums2/forums/${forumId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch forum data");
      }
      const data = await response.json();

      // Initialize form with existing data
      setForumData({
        title: data.title || "",
        description: data.description || "",
        public_or_private: data.public_or_private || "public",
        tags: data.tags || [],
        user_id: userId,
        board_id: data.board_id || null,
        club_id: data.club_id || null,
      });

      // Set image preview if available
      if (data.image && data.image.filename) {
        setImagePreview(`http://localhost:5000/uploads/${data.image.filename}`);
      }
    } catch (error) {
      console.error("Error fetching forum data:", error);
      setSnackbarMessage("Error loading forum data");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();

    if (newTag.trim() !== "") {
      setForumData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (index) => {
    const updatedTags = [...forumData.tags];
    updatedTags.splice(index, 1);
    setForumData((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (e.g., limit to 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        setSnackbarMessage("File is too large. Maximum size is 5MB.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      // Store the file separately
      setImageFile(file);

      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleForumDataChange = (e) => {
    const { name, value } = e.target;
    setForumData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!forumData.title || !forumData.description) {
      setSnackbarMessage("Please fill in all required fields");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      // Create FormData
      const formData = new FormData();

      // Append text fields
      formData.append("title", forumData.title);
      formData.append("description", forumData.description);
      formData.append("public_or_private", forumData.public_or_private);
      formData.append("user_id", forumData.user_id);

      // Append board_id or club_id if they exist
      if (forumData.board_id) {
        formData.append("board_id", forumData.board_id);
      }
      if (forumData.club_id) {
        formData.append("club_id", forumData.club_id);
      }

      // Append tags
      forumData.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      // Append image if exists
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(
        `http://localhost:5000/forums2/forums/${forumId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update forum");
      }

      const responseData = await response.json();

      // Call the parent component's onEditForum with the updated forum data
      onEditForum(responseData);

      // Success handling
      setSnackbarMessage("Forum updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Close dialog
      onClose();
    } catch (error) {
      // Error handling
      setSnackbarMessage(`Error updating forum: ${error.message}`);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Discussion</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Title */}
              <TextField
                autoFocus
                margin="dense"
                name="title"
                label="Title"
                type="text"
                fullWidth
                variant="outlined"
                value={forumData.title}
                onChange={handleForumDataChange}
                sx={{ mb: 2, mt: 1 }}
                required
              />

              {/* Description */}
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={forumData.description}
                onChange={handleForumDataChange}
                sx={{ mb: 2 }}
                required
              />

              {/* Image Upload */}
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>

                {imagePreview && (
                  <Box sx={{ textAlign: "center", mt: 1, mb: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  </Box>
                )}
              </Grid>

              {/* Tags */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <OutlinedInput
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                  placeholder="Add Tags"
                  endAdornment={
                    <IconButton onClick={handleAddTag}>
                      <AddIcon />
                    </IconButton>
                  }
                />
                <Box sx={{ mt: 1 }}>
                  {forumData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(index)}
                      sx={{ mr: 1, mt: 1 }}
                    />
                  ))}
                </Box>
              </FormControl>

              {/* Privacy Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>Privacy</FormLabel>
                <RadioGroup
                  name="public_or_private"
                  value={forumData.public_or_private}
                  onChange={handleForumDataChange}
                  row
                >
                  <FormControlLabel
                    value="public"
                    control={<Radio />}
                    label="Public"
                  />
                  <FormControlLabel
                    value="private"
                    control={<Radio />}
                    label="Private"
                  />
                </RadioGroup>
              </FormControl>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForumEditDialog;
