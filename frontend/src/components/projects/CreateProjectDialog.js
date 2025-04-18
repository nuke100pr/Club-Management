"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  OutlinedInput,
  IconButton,
  Chip,
  Grid,
  useTheme,
} from "@mui/material";
import { PhotoCamera, Add as AddIcon } from "@mui/icons-material";

const CreateProjectDialog = ({
  open,
  onClose,
  clubId,
  boardId,
  projectToEdit,
  onSubmit,
  fetchProjectDetails,
  createProject,
  updateProject,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Running",
    members: [],
    image: null,
    tags: [],
  });

  const [newTag, setNewTag] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  // Dynamic colors based on theme
  const dialogBg = isDark ? theme.palette.background.paper : '#ffffff';
  const textPrimary = isDark ? theme.palette.text.primary : '#2A3B4F';
  const textSecondary = isDark ? theme.palette.text.secondary : '#607080';
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const chipBg = isDark ? '#5d8aff30' : '#4776E620';
  const chipColor = isDark ? '#78a6ff' : '#4776E6';

  useEffect(() => {
    const loadProjectDetails = async () => {
      if (projectToEdit) {
        const projectData = await fetchProjectDetails(projectToEdit._id);

        if (projectData) {
          setNewProject({
            ...projectData,
            start_date: projectData.start_date
              ? projectData.start_date.split("T")[0]
              : "",
            end_date: projectData.end_date
              ? projectData.end_date.split("T")[0]
              : "",
            image: null,
          });

          if (projectData.imageUrl) {
            setImagePreview(projectData.imageUrl);
          }
        }
      }
    };

    if (open && projectToEdit) {
      loadProjectDetails();
    } else if (open) {
      setNewProject({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Running",
        members: [],
        image: null,
        tags: [],
      });
      setNewTag("");
      setImagePreview(null);
    }
  }, [projectToEdit, open, fetchProjectDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setNewProject({
        ...newProject,
        image: file,
      });
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    if (trimmedTag && !newProject.tags.includes(trimmedTag)) {
      setNewProject((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setNewProject((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newProject.title);
      formData.append("description", newProject.description);
      formData.append("start_date", newProject.start_date);
      formData.append("end_date", newProject.end_date);
      formData.append("status", newProject.status);
      formData.append("created_on", new Date().toISOString());

      newProject.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      formData.append("club_id", clubId);
      formData.append("board_id", boardId);

      if (newProject.image) {
        formData.append("image", newProject.image);
      }

      let result;
      if (projectToEdit) {
        result = await updateProject(projectToEdit._id, formData);
      } else {
        result = await createProject(formData);
      }

      if (result) {
        setNewProject({
          title: "",
          description: "",
          start_date: "",
          end_date: "",
          status: "Running",
          members: [],
          image: null,
          tags: [],
        });
        setNewTag("");
        setImagePreview(null);
        onSubmit(result);
        onClose();
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("Failed to submit project: " + error.message);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: dialogBg,
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle sx={{ color: textPrimary }}>
        {projectToEdit ? "Edit Project" : "Add New Project"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Title"
              name="title"
              value={newProject.title}
              onChange={handleChange}
              required
              sx={{
                '& .MuiInputLabel-root': { color: textSecondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: isDark ? '#2d3748' : '#e2e8f0' },
                  '&:hover fieldset': { borderColor: primaryColor },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newProject.description}
              onChange={handleChange}
              multiline
              rows={4}
              sx={{
                '& .MuiInputLabel-root': { color: textSecondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: isDark ? '#2d3748' : '#e2e8f0' },
                  '&:hover fieldset': { borderColor: primaryColor },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{
                backgroundColor: isDark ? '#2d3748' : '#f0f4f8',
                color: isDark ? '#ffffff' : primaryColor,
                '&:hover': {
                  backgroundColor: isDark ? '#3a4a5e' : '#e2e8f0',
                }
              }}
            >
              Upload Project Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={imagePreview}
                  alt="Project Preview"
                  style={{ maxWidth: "300px", maxHeight: "300px", borderRadius: '8px' }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <OutlinedInput
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                placeholder="Add Tags"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? '#2d3748' : '#e2e8f0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: primaryColor,
                  },
                  backgroundColor: isDark ? '#1a202c' : '#f8fafc',
                }}
                endAdornment={
                  <IconButton 
                    onClick={handleAddTag}
                    sx={{ color: primaryColor }}
                  >
                    <AddIcon />
                  </IconButton>
                }
              />
              <Box sx={{ mt: 1 }}>
                {newProject.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(index)}
                    sx={{ 
                      mr: 1, 
                      mt: 1,
                      backgroundColor: chipBg,
                      color: chipColor,
                      '& .MuiChip-deleteIcon': {
                        color: chipColor,
                        '&:hover': {
                          color: isDark ? '#5d8aff' : '#3a5fc0',
                        }
                      }
                    }}
                  />
                ))}
              </Box>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="date"
              value={newProject.start_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              sx={{
                '& .MuiInputLabel-root': { color: textSecondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: isDark ? '#2d3748' : '#e2e8f0' },
                  '&:hover fieldset': { borderColor: primaryColor },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              name="end_date"
              type="date"
              value={newProject.end_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              sx={{
                '& .MuiInputLabel-root': { color: textSecondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: isDark ? '#2d3748' : '#e2e8f0' },
                  '&:hover fieldset': { borderColor: primaryColor },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Typography variant="subtitle1" sx={{ color: textPrimary }}>
                Status
              </Typography>
              <RadioGroup
                name="status"
                value={newProject.status}
                onChange={handleChange}
                row
              >
                {["Running", "Completed", "Inactive"].map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={
                      <Radio 
                        sx={{ 
                          color: textSecondary,
                          '&.Mui-checked': {
                            color: primaryColor,
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: textPrimary }}>
                        {option}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{ color: textSecondary }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          sx={{
            backgroundColor: primaryColor,
            '&:hover': {
              backgroundColor: isDark ? '#3a5fc0' : '#3a5fc0',
            }
          }}
        >
          {projectToEdit ? "Update Project" : "Add Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectDialog;