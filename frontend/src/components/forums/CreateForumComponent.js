// components/CreateForumComponent.js
import { useState, useEffect } from 'react';
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
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { getAuthToken } from "@/utils/auth";

export default function CreateForumComponent({ open, onClose, forum = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    public_or_private: 'public',
    tags: [],
    user_id: '1', // Replace with actual logged-in user ID in a real app
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTag, setCurrentTag] = useState('');
  const [authToken, setAuthToken] = useState(null);

  // If forum is provided, this is an edit operation
  const isEditMode = Boolean(forum);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if(formData)
    {
        console.log(formData);
    }
  }, []);
  
  useEffect(() => {
    if (forum) {
      setFormData({
        title: forum.title || '',
        description: forum.description || '',
        public_or_private: forum.public_or_private || 'public',
        tags: forum.tags || [],
        user_id: forum.user_id || '1',
      });
      
      if (forum.image) {
        setImagePreview(`http://localhost:5000/${forum.image}`);
      }
    } else {
      // Reset form when creating a new forum
      setFormData({
        title: '',
        description: '',
        public_or_private: 'public',
        tags: [],
        user_id: '1',
      });
      setImage(null);
      setImagePreview('');
    }
  }, [forum, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!authToken) {
      return;
    }

    try {
      const formDataObj = new FormData();
      
      // Explicitly append all form fields to ensure they're sent
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('public_or_private', formData.public_or_private);
      formDataObj.append('user_id', formData.user_id);

      // Handle tags correctly - use array notation for backend compatibility
      if (formData.tags.length > 0) {
        formData.tags.forEach((tag, index) => {
          formDataObj.append(`tags[${index}]`, tag);
        });
      } else {
        // Explicitly send empty tags array
        formDataObj.append('tags', JSON.stringify([]));
      }

      // Only append image if a new one is selected
      if (image) {
        formDataObj.append('image', image);
      } else if (isEditMode && forum.image) {
        // If editing and using existing image, indicate this to the server
        formDataObj.append('existing_image', forum.image);
      }

      // Log what's being sent (for debugging)
      console.log('Sending form data:', {
        title: formData.title,
        description: formData.description,
        public_or_private: formData.public_or_private,
        tags: formData.tags,
        image: image ? 'New image selected' : (isEditMode && forum.image ? 'Using existing image' : 'No image')
      });

      let response;
      if (isEditMode) {
        // Update existing forum
        response = await fetch(`http://localhost:5000/forums2/forums/${forum._id}`, {
          method: 'PUT',
          body: formDataObj,
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
      } else {
        // Create new forum
        response = await fetch('http://localhost:5000/forums2/forums', {
          method: 'POST',
          body: formDataObj,
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to save forum');
      }

      const result = await response.json();
      console.log('Success:', result);
      onClose(result); // Pass back the result
    } catch (err) {
      console.error('Error submitting forum:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? null : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Forum' : 'Create New Forum'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Box sx={{ color: 'error.main', mb: 2 }}>{error}</Box>
          )}
          
          <TextField
            margin="dense"
            name="title"
            label="Forum Title"
            fullWidth
            required
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
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
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Forum preview" 
                  style={{ maxHeight: '200px', maxWidth: '100%' }} 
                />
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Add Tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              disabled={loading}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={handleAddTag}
                    disabled={!currentTag.trim() || loading}
                  >
                    Add
                  </Button>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <FormHelperText>Press Enter or click Add to add a tag</FormHelperText>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
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
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || (!formData.title || !formData.description)}
          >
            {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update Forum' : 'Create Forum'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
