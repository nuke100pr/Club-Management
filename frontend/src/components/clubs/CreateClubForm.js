"use client";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  MenuItem,
  CircularProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const CreateClubForm = ({ 
  open, 
  onClose, 
  onSave,
  initialData = null,
  isEditMode = false 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    board_id: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

  // Fetch boards when component mounts
  useEffect(() => {
    fetchBoards();
  }, []);

  // Fetch boards data from API
  const fetchBoards = async () => {
    setLoadingBoards(true);
    try {
      const response = await fetch('http://localhost:5000/boards/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setError('Failed to fetch boards data. Please try again.');
    } finally {
      setLoadingBoards(false);
    }
  };

  // Reset or populate form when dialog opens/changes
  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        // Populate form with existing club data for editing
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          board_id: initialData.board_id || "",
          image: null
        });

        // Set image preview if existing image URL is available
        setImagePreview(initialData.image || null);
      } else {
        // Reset form for new club creation
        setFormData({
          name: "",
          description: "",
          board_id: "",
          image: null
        });
        setImagePreview(null);
      }
    }

    // Reset error states when dialog opens
    setImageError(false);
    setError(null);
  }, [open, isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setImageError("Please upload a valid image type (JPEG, PNG, GIF)");
        return;
      }

      if (file.size > maxSize) {
        setImageError("Image size should be less than 5MB");
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setImageError(false);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Club name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.board_id) {
      setError("Please select a board");
      return false;
    }
    if (!isEditMode && !formData.image && !imagePreview) {
      setError("Please upload an image");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    // Create FormData for file upload
    const uploadFormData = new FormData();
    uploadFormData.append("name", formData.name);
    uploadFormData.append("description", formData.description);
    uploadFormData.append("board_id", formData.board_id);
    
    // Only append image if a new image is selected
    if (formData.image instanceof File) {
      uploadFormData.append("image", formData.image);
    }

    try {
      let response;
      if (isEditMode) {
        // Update existing club
        response = await fetch(`http://localhost:5000/clubs/clubs/${initialData._id}`, {
          method: 'PUT',
          body: uploadFormData
        });
      } else {
        // Create new club
        response = await fetch('http://localhost:5000/clubs/clubs/', {
          method: 'POST',
          body: uploadFormData
        });
      }

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      onSave(result);
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} club:`, error);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} club. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => !loading && onClose()}
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>{isEditMode ? 'Edit Club' : 'Create New Club'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            
            <TextField
              required
              label="Club Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />
            
            <TextField
              required
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              disabled={loading}
            />
            
            <TextField
              select
              label="Board"
              name="board_id"
              value={formData.board_id}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading || loadingBoards}
              helperText={loadingBoards ? "Loading boards..." : ""}
            >
              <MenuItem value="">
                <em>Select a board</em>
              </MenuItem>
              {boards.map((board) => (
                <MenuItem key={board._id} value={board._id}>
                  {board.name}
                </MenuItem>
              ))}
            </TextField>
            
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
                color={imageError ? "error" : "primary"}
                disabled={loading}
              >
                {isEditMode ? 'Update Club Image' : 'Upload Club Image'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </Button>
              
              {imageError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {typeof imageError === 'string' ? imageError : 'Please upload a valid image (JPEG, PNG, GIF) under 5MB'}
                </Typography>
              )}
              
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <img 
                    src={imagePreview} 
                    alt="Club preview" 
                    style={{ 
                      maxWidth: "100%", 
                      maxHeight: "200px", 
                      borderRadius: "8px"
                    }} 
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || loadingBoards}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isEditMode ? 'Update Club' : 'Create Club'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateClubForm;