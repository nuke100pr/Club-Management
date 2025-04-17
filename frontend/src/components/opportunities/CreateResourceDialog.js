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
  Typography,
  Paper,
  Slider,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Crop as CropIcon,
  Check as CheckIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "@mui/icons-material";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  const imgRef = useRef(null);
  
  // Image cropping states
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

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
    setIsCropping(false);
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

  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setImagePreview(reader.result);
        setImageFile(file);
        setIsCropping(true);
        
        // Reset crop settings
        setCrop(undefined);
        setZoom(1);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setOriginalImage(null);
    setIsCropping(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    // You can use specific aspect ratio or set it free
    // For example 16/9 or 1 for square
    const aspect = 16 / 9;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    
    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    if (rotation !== 0) {
      ctx.restore();
    }

    const base64Image = canvas.toDataURL('image/jpeg');
    setImagePreview(base64Image);
    
    // Convert base64 to file
    const res = await fetch(base64Image);
    const blob = await res.blob();
    const croppedFile = new File([blob], imageFile.name, { type: 'image/jpeg' });
    setImageFile(croppedFile);
    
    setIsCropping(false);
  };

  const handleCompleteCrop = () => {
    if (completedCrop) {
      getCroppedImg();
    } else {
      setIsCropping(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    if (!imagePreview && !initialData?.image) {
      // If cancel was pressed and no previous image exists, remove any uploaded image
      handleRemoveImage();
    } else if (initialData?.image && !imageFile) {
      // Restore original image if editing and cancel was pressed
      setImagePreview(initialData.image);
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

  const renderCroppingUI = () => {
    return (
      <Box sx={{ my: 3 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 2,
            position: 'relative'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#333' }}>
            Crop Image
          </Typography>
          
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: 'auto', 
            maxHeight: '400px', 
            display: 'flex',
            justifyContent: 'center', 
            mb: 2,
            bgcolor: '#000',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={16 / 9} // You can change or make this configurable
              style={{ maxHeight: '400px' }}
            >
              <img
                ref={imgRef}
                src={originalImage}
                style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '400px',
                  transition: 'transform 0.2s'
                }}
                onLoad={onImageLoad}
                alt="Upload preview"
              />
            </ReactCrop>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '45%' }}>
              <ZoomOutIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Tooltip title="Zoom">
                <Slider
                  value={zoom}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onChange={(_, value) => setZoom(value)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={value => `${Math.round(value * 100)}%`}
                />
              </Tooltip>
              <ZoomInIcon sx={{ color: 'primary.main', ml: 1 }} />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', width: '45%' }}>
              <CropIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Tooltip title="Rotation">
                <Slider
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(_, value) => setRotation(value)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={value => `${value}°`}
                />
              </Tooltip>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleCancelCrop}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCompleteCrop}
              startIcon={<CheckIcon />}
              disabled={!completedCrop?.width || !completedCrop?.height}
            >
              Apply Crop
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderImagePreview = () => {
    const previewImage = imagePreview || (initialData?.image && !imageFile ? initialData.image : null);
    
    if (!previewImage) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Paper elevation={3} sx={{ 
          p: 2, 
          borderRadius: 2,
          bgcolor: '#fafafa',
          position: 'relative',
          display: 'inline-block',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <Box sx={{ 
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)'
          }}>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "300px",
                maxHeight: "200px",
                objectFit: "contain",
                display: 'block',
              }}
            />
            
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              right: 0,
              display: 'flex',
              gap: 0.5
            }}>
              <IconButton
                onClick={() => {
                  setIsCropping(true);
                  setOriginalImage(previewImage);
                }}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,1)',
                  },
                  m: 0.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  fontSize: '0.8rem'
                }}
                size="small"
                title="Crop image"
              >
                <CropIcon fontSize="small" />
              </IconButton>
              
              <IconButton
                onClick={handleRemoveImage}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,1)',
                  },
                  m: 0.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  fontSize: '0.8rem'
                }}
                size="small"
                title="Remove image"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
            Image preview
          </Typography>
        </Paper>
      </Box>
    );
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
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: '#fdfdfd' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                Image Upload
              </Typography>
              
              {!isCropping ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
                        sx={{ boxShadow: 2 }}
                      >
                        Upload Image
                      </Button>
                    </label>
                    
                    {renderImagePreview()}
                  </Box>
                </>
              ) : (
                renderCroppingUI()
              )}
            </Paper>
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
          disabled={isSubmitting || isCropping}
        >
          {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateResourceDialog;