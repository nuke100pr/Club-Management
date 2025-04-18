"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Event as CalendarIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const BoardClubManagement = ({ boardId }) => {
  const [clubs, setClubs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    established_year: "",
    image: null,
    social_media: {
      instagram: "",
      twitter: "",
      whatsapp: "",
      facebook: "",
      linkedin: "",
      youtube: "",
    },
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, [boardId]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/boards/${boardId}/clubs`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch clubs",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuOpen = (event, club) => {
    setAnchorEl(event.currentTarget);
    setSelectedClub(club);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      established_year: "",
      image: null,
      social_media: {
        instagram: "",
        twitter: "",
        whatsapp: "",
        facebook: "",
        linkedin: "",
        youtube: "",
      },
    });
    setImagePreview(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (club) => {
    setIsEditing(true);
    setSelectedClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      established_year: club.established_year || "",
      image: null,
      social_media: {
        instagram: club.social_media?.instagram || "",
        twitter: club.social_media?.twitter || "",
        whatsapp: club.social_media?.whatsapp || "",
        facebook: club.social_media?.facebook || "",
        linkedin: club.social_media?.linkedin || "",
        youtube: club.social_media?.youtube || "",
      },
    });
    setImagePreview(club.image);
    setOpenDialog(true);
    handleMenuClose();
  };

  const createClub = async (clubData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", clubData.name);
      formDataObj.append("description", clubData.description);
      formDataObj.append("board_id", boardId);
      formDataObj.append("established_year", clubData.established_year);

      // Append social media links
      Object.keys(clubData.social_media).forEach((key) => {
        formDataObj.append(`social_media[${key}]`, clubData.social_media[key]);
      });

      if (clubData.image) {
        formDataObj.append("image", clubData.image);
      }

      const response = await fetch("http://localhost:5000/clubs/clubs/", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newClub = await response.json();
      setClubs((prev) => [...prev, newClub]);
      setSnackbar({
        open: true,
        message: "Club created successfully",
        severity: "success",
      });
      return true;
    } catch (error) {
      console.error("Error creating club:", error);
      setSnackbar({
        open: true,
        message: "Failed to create club",
        severity: "error",
      });
      return false;
    }
  };

  const updateClub = async (clubId, clubData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", clubData.name);
      formDataObj.append("description", clubData.description);
      formDataObj.append("established_year", clubData.established_year);

      // Append social media links
      Object.keys(clubData.social_media).forEach((key) => {
        formDataObj.append(`social_media[${key}]`, clubData.social_media[key]);
      });

      if (clubData.image instanceof File) {
        formDataObj.append("image", clubData.image);
      }

      const response = await fetch(
        `http://localhost:5000/clubs/clubs/${clubId}`,
        {
          method: "PUT",
          body: formDataObj,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedClub = await response.json();
      setClubs((prev) =>
        prev.map((club) => (club._id === clubId ? updatedClub : club))
      );
      setSnackbar({
        open: true,
        message: "Club updated successfully",
        severity: "success",
      });
      return true;
    } catch (error) {
      console.error("Error updating club:", error);
      setSnackbar({
        open: true,
        message: "Failed to update club",
        severity: "error",
      });
      return false;
    }
  };

  const deleteClub = async (clubId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/clubs/clubs/${clubId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setClubs((prev) => prev.filter((club) => club._id !== clubId));
      setSnackbar({
        open: true,
        message: "Club deleted successfully",
        severity: "success",
      });
      return true;
    } catch (error) {
      console.error("Error deleting club:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete club",
        severity: "error",
      });
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.established_year) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      if (isEditing && selectedClub) {
        await updateClub(selectedClub._id, formData);
      } else {
        await createClub(formData);
      }

      setOpenDialog(false);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (window.confirm("Are you sure you want to delete this club?")) {
      try {
        setLoading(true);
        await deleteClub(clubId);
      } catch (error) {
        console.error("Delete error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading && clubs.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Manage Clubs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            backgroundColor: "#6a1b9a",
            "&:hover": { backgroundColor: "#4a148c" },
          }}
        >
          Add New Club
        </Button>
      </Box>

      {clubs.length === 0 ? (
        <Box textAlign="center" my={8}>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            No clubs found for this board
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              mt: 2,
              backgroundColor: "#6a1b9a",
              "&:hover": { backgroundColor: "#4a148c" },
            }}
          >
            Add Your First Club
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {clubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club._id}>
              <motion.div whileHover={{ y: -8 }}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: 3,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                          backgroundColor: "#f3e5f5",
                          color: "#6a1b9a",
                        }}
                      >
                        {club.image ? (
                          <CardMedia
                            component="img"
                            image={`http://localhost:5000/uploads/${club.image.filename}`}
                            alt={club.name}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <SchoolIcon />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {club.name}
                        </Typography>
                        {club.established_year && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <CalendarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption">
                              Est. {club.established_year}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <IconButton
                        sx={{ ml: "auto" }}
                        onClick={(e) => handleMenuOpen(e, club)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 3 }}>
                      {club.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        icon={<GroupIcon />}
                        label={`${club.members || 0} Members`}
                        variant="outlined"
                        size="small"
                      />
                      <Box>
                        <IconButton
                          onClick={() => handleOpenEditDialog(club)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClub(club._id)}
                          disabled={loading}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenEditDialog(selectedClub)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteClub(selectedClub?._id)}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{isEditing ? "Edit Club" : "Add New Club"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Club Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              variant="outlined"
              required
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              label="Established Year"
              name="established_year"
              value={formData.established_year}
              onChange={handleInputChange}
              variant="outlined"
              type="number"
              required
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Club Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button variant="outlined" component="label">
                  {isEditing ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </Button>
                {formData.image && (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {formData.image.name}
                  </Typography>
                )}
              </Box>
            </Box>

            {imagePreview && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CardMedia
                  component="img"
                  image={imagePreview}
                  alt="Preview"
                  sx={{ maxWidth: "100%", maxHeight: 160, borderRadius: "8px" }}
                />
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Social Media Links
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="instagram"
                  value={formData.social_media.instagram}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  name="twitter"
                  value={formData.social_media.twitter}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="WhatsApp"
                  name="whatsapp"
                  value={formData.social_media.whatsapp}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facebook"
                  name="facebook"
                  value={formData.social_media.facebook}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  name="linkedin"
                  value={formData.social_media.linkedin}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="YouTube"
                  name="youtube"
                  value={formData.social_media.youtube}
                  onChange={handleSocialMediaChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#6a1b9a",
              "&:hover": { backgroundColor: "#4a148c" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEditing ? (
              "Update Club"
            ) : (
              "Create Club"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BoardClubManagement;
