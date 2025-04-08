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
        }
      }
    };

    if (open && projectToEdit) {
      loadProjectDetails();
    }
  }, [projectToEdit, open, fetchProjectDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Project Title"
            name="title"
            value={newProject.title}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Description"
            name="description"
            value={newProject.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Upload Project Image
              </Button>
            </label>
            {newProject.image && (
              <Typography variant="body2">{newProject.image.name}</Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Start Date"
              name="start_date"
              type="date"
              value={newProject.start_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="End Date"
              name="end_date"
              type="date"
              value={newProject.end_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Box>
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
        </Box>
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
