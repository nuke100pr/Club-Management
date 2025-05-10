import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Button, Chip, FormControl, CircularProgress, Alert
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getAuthToken } from "@/utils/auth";

const CreateResourceDialog = ({ 
  open, 
  onClose, 
  existingResource = null,
  onCreateResource,
  onUpdateResource,
  board_id,
  club_id,
  defaultBoardId,
  defaultClubId,
  userId
}) => {
  const theme = useTheme();
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    resource_link: "",
    published_at: new Date().toISOString().split('T')[0],
    tags: [],
    club_id: club_id || defaultClubId || null,
    board_id: board_id || defaultBoardId || null,
    user_id: userId
  });
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if (existingResource) {
      setNewResource({
        ...existingResource,
        published_at: existingResource.published_at 
          ? new Date(existingResource.published_at).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        club_id: existingResource.club_id || club_id || defaultClubId || null,
        board_id: existingResource.board_id || board_id || defaultBoardId || null,
        user_id: userId
      });
    } else {
      setNewResource({
        title: "",
        description: "",
        resource_link: "",
        published_at: new Date().toISOString().split('T')[0],
        tags: [],
        club_id: club_id || defaultClubId || null,
        board_id: board_id || defaultBoardId || null,
        user_id: userId
      });
    }
  }, [existingResource, open, board_id, club_id, defaultBoardId, defaultClubId, userId]);

  const handleNewResourceChange = (field) => (event) => {
    setNewResource({ ...newResource, [field]: event.target.value });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newResource.tags.includes(newTag.trim())) {
      setNewResource({
        ...newResource,
        tags: [...newResource.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewResource({
      ...newResource,
      tags: newResource.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmitResource = async () => {
    if (!newResource.title || !newResource.description || !newResource.resource_link) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!authToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;
      const payload = {
        ...newResource,
        club_id: club_id || newResource.club_id,
        board_id: board_id || newResource.board_id
      };

      if (existingResource) {
        response = await fetch(`http://localhost:5000/resources/bpi/${existingResource.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:5000/resources/api/resource', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save resource');
      }

      const savedResource = await response.json();
      
      setNewResource({
        title: "",
        description: "",
        resource_link: "",
        published_at: new Date().toISOString().split('T')[0],
        tags: [],
        club_id: club_id || defaultClubId || null,
        board_id: board_id || defaultBoardId || null,
        user_id: userId
      });
      setNewTag("");
      
      onClose();
      
      if (existingResource) {
        onUpdateResource(savedResource.data);
      } else {
        onCreateResource(savedResource.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewResource({
      title: "",
      description: "",
      resource_link: "",
      published_at: new Date().toISOString().split('T')[0],
      tags: [],
      club_id: club_id || defaultClubId || null,
      board_id: board_id || defaultBoardId || null,
      user_id: userId
    });
    setNewTag("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{existingResource ? 'Edit Resource' : 'Create New Resource'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Title"
            value={newResource.title}
            onChange={handleNewResourceChange("title")}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={newResource.description}
            onChange={handleNewResourceChange("description")}
            fullWidth
            required
            multiline
            rows={4}
          />
          <TextField
            label="Resource Link"
            value={newResource.resource_link}
            onChange={handleNewResourceChange("resource_link")}
            fullWidth
            required
          />
          <TextField
            label="Published Date"
            type="date"
            value={newResource.published_at}
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            disabled
          />
          <FormControl fullWidth>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddTag}
                sx={{
                  background: theme.palette.primary.main,
                  '&:hover': {
                    background: theme.palette.primary.dark
                  }
                }}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              {newResource.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ 
                    mr: 1, 
                    mt: 1,
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.dark
                  }}
                />
              ))}
            </Box>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
          sx={{ color: theme.palette.text.secondary }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitResource} 
          variant="contained" 
          disabled={isLoading}
          sx={{
            background: theme.palette.primary.main,
            '&:hover': {
              background: theme.palette.primary.dark
            }
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : (existingResource ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateResourceDialog;
