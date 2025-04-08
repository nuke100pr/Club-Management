import React, { useState } from "react";
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
  Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ForumCreateDialog = ({ 
  open, 
  onClose,
  onCreateForum,
  userId,
  board_id,
  club_id
}) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [newForum, setNewForum] = useState({
    title: "",
    description: "",
    public_or_private: "public",
    tags: [],
    user_id: userId,
    board_id: board_id || null,
    club_id: club_id || null
  });

  const handleAddTag = (e) => {
    e.preventDefault(); 
  
    if (newTag.trim() !== "") {
      setNewForum(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag(""); 
    }
  };
  
  const handleRemoveTag = (index) => {
    const updatedTags = [...newForum.tags];
    updatedTags.splice(index, 1);
    setNewForum(prev => ({
      ...prev,
      tags: updatedTags
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

  const handleNewForumChange = (e) => {
    const { name, value } = e.target;
    setNewForum((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!newForum.title || !newForum.description) {
      setSnackbarMessage("Please fill in all required fields");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      // Create FormData
      const formData = new FormData();
      
      // Append text fields
      formData.append("title", newForum.title);
      formData.append("description", newForum.description);
      formData.append("public_or_private", newForum.public_or_private);
      formData.append("user_id", newForum.user_id);
      
      // Append board_id or club_id if they exist
      if (newForum.board_id) {
        formData.append("board_id", newForum.board_id);
      }
      if (newForum.club_id) {
        formData.append("club_id", newForum.club_id);
      }
      
      // Append tags
      newForum.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      // Append image if exists
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch('http://localhost:5000/forums2/forums', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create forum');
      }

      const responseData = await response.json();
      
      // Call the parent component's onCreateForum with the new forum data
      onCreateForum(responseData);
      
      // Success handling
      setSnackbarMessage("Forum created successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      
      // Reset form
      setNewForum({
        title: "",
        description: "",
        public_or_private: "public",
        tags: [],
        user_id: userId,
        board_id: board_id || null,
        club_id: club_id || null
      });
      setImageFile(null);
      setImagePreview(null);
      
      // Close dialog
      onClose();
    } catch (error) {
      // Error handling
      setSnackbarMessage(`Error creating forum: ${error.message}`);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Discussion</DialogTitle>
        <DialogContent>
          {/* Title */}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newForum.title}
            onChange={handleNewForumChange}
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
            value={newForum.description}
            onChange={handleNewForumChange}
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
              Upload Image
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
              {newForum.tags.map((tag, index) => (
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
              value={newForum.public_or_private}
              onChange={handleNewForumChange}
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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForumCreateDialog;