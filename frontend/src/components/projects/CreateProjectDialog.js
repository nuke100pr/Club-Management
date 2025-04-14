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

  // Effect to populate form when editing
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
            image: null, // Reset image as it needs to be re-uploaded if changed
          });

          // Set image preview if there's an existing image
          if (projectData.imageUrl) {
            setImagePreview(projectData.imageUrl);
          }
        }
      }
    };

    if (open && projectToEdit) {
      loadProjectDetails();
    } else if (open) {
      // Reset form when opening for new project
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
      // Create FormData to handle file upload
      const formData = new FormData();

      // Append project details
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

      // Append image if exists
      if (newProject.image) {
        formData.append("image", newProject.image);
      }

      // Determine if this is a create or update operation
      let result;
      if (projectToEdit) {
        result = await updateProject(projectToEdit._id, formData);
      } else {
        result = await createProject(formData);
      }

      if (result) {
        // Reset form
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

        // Close dialog and call onSubmit
        onSubmit(result);
        onClose();
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("Failed to submit project: " + error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
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
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
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
                  style={{ maxWidth: "300px", maxHeight: "300px" }}
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
                endAdornment={
                  <IconButton onClick={handleAddTag}>
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
                    sx={{ mr: 1, mt: 1 }}
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
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Typography variant="subtitle1">Status</Typography>
              <RadioGroup
                name="status"
                value={newProject.status}
                onChange={handleChange}
                row
              >
                <FormControlLabel
                  value="Running"
                  control={<Radio />}
                  label="Running"
                />
                <FormControlLabel
                  value="Completed"
                  control={<Radio />}
                  label="Completed"
                />
                <FormControlLabel
                  value="Inactive"
                  control={<Radio />}
                  label="Inactive"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {projectToEdit ? "Update Project" : "Add Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectDialog;
