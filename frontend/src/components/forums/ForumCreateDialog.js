// components/forums/ForumCreateDialog.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Input,
  CircularProgress,
} from "@mui/material";

const ForumCreateDialog = ({
  open,
  onClose,
  onCreateForum,
  userId,
  boardId,
  clubId,
  disableBoardSelection,
  forum,
}) => {
  const isEditMode = !!forum;

  // Initialize form data either from provided forum or with defaults
  const [formData, setFormData] = useState({
    title: forum?.title || "",
    description: forum?.description || "",
    public_or_private: forum?.public_or_private || "public",
    boardId: forum?.boardId || boardId || "",
    clubId: forum?.clubId || clubId || "",
    tags: forum?.tags || [],
    user_id: userId,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    forum?.image ? `http://localhost:5000/uploads/${forum.image.filename}` : ""
  );
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState("");

  useEffect(() => {
    if (formData) {
      console.log(formData);
    }
  }, [formData]);

  // Modify your useEffect to only run when necessary
  useEffect(() => {
    if (!open) return;

    setFormData((prev) => {
      if (!forum) {
        return {
          title: "",
          description: "",
          public_or_private: "public",
          boardId: boardId || "",
          clubId: clubId || "",
          tags: [],
          user_id: userId,
        };
      } else {
        return {
          title: forum.title || "",
          description: forum.description || "",
          public_or_private: forum.public_or_private || "public",
          boardId: forum.boardId || boardId || "",
          clubId: forum.clubId || clubId || "",
          tags: forum.tags || [],
          user_id: userId,
        };
      }
    });

    setImage(null);
    setImagePreview(
      forum?.image
        ? `http://localhost:5000/uploads/${forum.image.filename}`
        : ""
    );
  }, [open]); // only reset when `open` changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTagInputChange = (e) => {
    setCurrentTag(e.target.value);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();

      // Append all form data
      Object.keys(formData).forEach((key) => {
        if (key === "tags") {
          // Handle tags array specially
          formData.tags.forEach((tag, index) => {
            formDataObj.append(`tags[${index}]`, tag);
          });
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      if(boardId)
      {
        formDataObj.append("board_id",boardId);
      }

      if(clubId)
        {
          formDataObj.append("clubId",clubId);
        }

      // Append image if a new one is selected
      if (image) {
        formDataObj.append("image", image);
      }

      let response;

      if (isEditMode) {
        // Update existing forum

        formDataObj.forEach((value, key) => {
          console.log(`${key}:`, value);
        });
        response = await fetch(
          `http://localhost:5000/forums2/forums/${forum._id}`,
          {
            method: "PUT",
            body: formDataObj,
          }
        );
      } else {
        // Create new forum
        response = await fetch("http://localhost:5000/forums2/forums", {
          method: "POST",
          body: formDataObj,
        });
      }

      if (!response.ok) {
        throw new Error(
          isEditMode ? "Failed to update forum" : "Failed to create forum"
        );
      }

      const result = await response.json();

      // Close dialog and pass result back
      onClose(result);
    } catch (error) {
      console.error(
        isEditMode ? "Error updating forum:" : "Error creating forum:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {isEditMode ? "Edit Forum" : "Create New Forum"}
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          name="title"
          label="Forum Title"
          type="text"
          fullWidth
          value={formData.title}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>Visibility</InputLabel>
          <Select
            name="public_or_private"
            value={formData.public_or_private}
            onChange={handleChange}
            disabled={loading}
          >
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <InputLabel>Forum Image</InputLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            fullWidth
          />
          {imagePreview && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxHeight: "200px", maxWidth: "100%" }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              label="Add Tags"
              value={currentTag}
              onChange={handleTagInputChange}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              disabled={loading}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleAddTag}
              disabled={!currentTag.trim() || loading}
            >
              Add
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                disabled={loading}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !formData.title || !formData.description}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isEditMode ? (
            "Update Forum"
          ) : (
            "Create Forum"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForumCreateDialog;
