import React, { useState, useEffect } from "react";
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
  Select,
  Fade,
  InputLabel,
  FormControl,
  CircularProgress,
  useMediaQuery,
  useTheme,
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

const ClubManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [boards, setBoards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    board: "",
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const darkMode = theme.palette.mode === "dark";

  useEffect(() => {
    fetchBoards()
      .then(() => fetchClubs())
      .catch((err) => {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch("http://localhost:5000/boards/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBoards(data);
      return data;
    } catch (error) {
      console.error("Error fetching boards:", error);
      setError("Failed to fetch boards data");
      throw error;
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await fetch("http://localhost:5000/clubs/clubs/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClubs(data);
      return data;
    } catch (error) {
      console.error("Error fetching clubs:", error);
      setError("Failed to fetch clubs data");
      throw error;
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
      board: "",
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
      board: club.board_id.toString(),
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
      formDataObj.append("board_id", clubData.board);
      formDataObj.append("established_year", clubData.established_year);

      // Append social media links
      formDataObj.append(
        "social_media[instagram]",
        clubData.social_media.instagram
      );
      formDataObj.append(
        "social_media[twitter]",
        clubData.social_media.twitter
      );
      formDataObj.append(
        "social_media[whatsapp]",
        clubData.social_media.whatsapp
      );
      formDataObj.append(
        "social_media[facebook]",
        clubData.social_media.facebook
      );
      formDataObj.append(
        "social_media[linkedin]",
        clubData.social_media.linkedin
      );
      formDataObj.append(
        "social_media[youtube]",
        clubData.social_media.youtube
      );

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
      return newClub;
    } catch (error) {
      console.error("Error creating club:", error);
      alert("Failed to create club. Please try again.");
      throw error;
    }
  };

  const updateClub = async (clubId, clubData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", clubData.name);
      formDataObj.append("description", clubData.description);
      formDataObj.append("board_id", clubData.board);
      formDataObj.append("established_year", clubData.established_year);

      // Append social media links
      formDataObj.append(
        "social_media[instagram]",
        clubData.social_media.instagram
      );
      formDataObj.append(
        "social_media[twitter]",
        clubData.social_media.twitter
      );
      formDataObj.append(
        "social_media[whatsapp]",
        clubData.social_media.whatsapp
      );
      formDataObj.append(
        "social_media[facebook]",
        clubData.social_media.facebook
      );
      formDataObj.append(
        "social_media[linkedin]",
        clubData.social_media.linkedin
      );
      formDataObj.append(
        "social_media[youtube]",
        clubData.social_media.youtube
      );

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
      return updatedClub;
    } catch (error) {
      console.error("Error updating club:", error);
      alert("Failed to update club. Please try again.");
      throw error;
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
      return true;
    } catch (error) {
      console.error("Error deleting club:", error);
      alert("Failed to delete club. Please try again.");
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.board ||
      !formData.established_year
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const clubData = {
        name: formData.name,
        description: formData.description,
        board: formData.board,
        established_year: formData.established_year,
        image: formData.image,
        social_media: formData.social_media,
      };

      if (isEditing && selectedClub) {
        await updateClub(selectedClub._id, clubData);
      } else {
        await createClub(clubData);
      }

      setOpenDialog(false);
      setFormData({
        name: "",
        description: "",
        board: "",
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

  const getBoardName = (boardId) => {
    const board = boards.find((b) => b._id === boardId);
    return board ? board.name : "Unknown Board";
  };

  if (loading && clubs.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error && clubs.length === 0) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{
            mt: 2,
            background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.25)",
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4, md: 8 },
        minHeight: "100vh",
        bgcolor: darkMode ? "background.default" : "#f8faff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 4,
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: isMobile ? 2 : 0,
          }}
        >
          Club Management
        </Typography>
        <motion.div
          whileHover={{
            y: -2,
            boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            disabled={loading}
            sx={{
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              boxShadow: "0 4px 10px rgba(71, 118, 230, 0.25)",
              "&:hover": {
                boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
              },
            }}
          >
            Add New Club
          </Button>
        </motion.div>
      </Box>

      {clubs.length === 0 ? (
        <Box textAlign="center" my={8}>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            No clubs found
          </Typography>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{
                mt: 2,
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                boxShadow: "0 4px 10px rgba(71, 118, 230, 0.25)",
              }}
            >
              Add Your First Club
            </Button>
          </motion.div>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {clubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club._id}>
              <motion.div
                whileHover={{
                  y: -8,
                  boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
                }}
              >
                <Card
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease-in-out",
                    borderTop: "3px solid #4776E6",
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
                          background:
                            "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                          color: "white",
                        }}
                      >
                        {club.image ? (
                          <Fade in={true} timeout={1000}>
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
                          </Fade>
                        ) : (
                          <SchoolIcon />
                        )}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color={darkMode ? "white" : "text.primary"}
                        >
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {club.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Board:
                      </Typography>
                      <Chip
                        label={getBoardName(club.board_id)}
                        size="small"
                        sx={{
                          color: "#4776E6",
                          backgroundColor: darkMode
                            ? "rgba(144, 202, 249, 0.16)"
                            : "rgba(95, 150, 230, 0.1)",
                          borderRadius: "6px",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        height: "1px",
                        width: "100%",
                        bgcolor: "divider",
                        my: 2,
                      }}
                    />

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
                        sx={{
                          color: "#4776E6",
                          borderColor: "#4776E6",
                          borderRadius: "8px",
                        }}
                      />

                      <Box>
                        <IconButton
                          onClick={() => handleOpenEditDialog(club)}
                          disabled={loading}
                          sx={{ color: "#4776E6" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClub(club._id)}
                          disabled={loading}
                          sx={{ color: "#d32f2f" }}
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
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => handleOpenEditDialog(selectedClub)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteClub(selectedClub?._id)}
          sx={{ color: "#d32f2f" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} />
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
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 24px 38px rgba(0, 0, 0, 0.14)",
          },
        }}
      >
        <DialogTitle
          sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}
        >
          <Typography variant="h6" fontWeight={600}>
            {isEditing ? "Edit Club" : "Add New Club"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Club Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
              required
              placeholder="Enter club name"
              InputProps={{
                sx: { borderRadius: "8px" },
              }}
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
              rows={isMobile ? 3 : 4}
              placeholder="Enter club description"
              InputProps={{
                sx: { borderRadius: "8px" },
              }}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Parent Board *</InputLabel>
                <Select
                  name="board"
                  value={formData.board}
                  onChange={handleInputChange}
                  label="Parent Board *"
                  required
                  sx={{ borderRadius: "8px" }}
                >
                  {boards.map((board) => (
                    <MenuItem key={board._id} value={board._id}>
                      {board.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Established Year *"
                name="established_year"
                value={formData.established_year}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
                inputProps={{
                  min: 1900,
                  max: new Date().getFullYear(),
                }}
                placeholder="e.g. 2020"
                required
                InputProps={{
                  sx: { borderRadius: "8px" },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Club Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderRadius: "8px",
                    color: "#4776E6",
                    borderColor: "#4776E6",
                    "&:hover": {
                      backgroundColor: "rgba(95, 150, 230, 0.1)",
                      borderColor: "#4776E6",
                    },
                  }}
                >
                  {isEditing ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </Button>
                {formData.image && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 2 }}
                  >
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

            {/* Social Media Links */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1 }}>
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
                    placeholder="Instagram profile URL"
                    size="small"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
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
                    placeholder="Twitter profile URL"
                    size="small"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
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
                    placeholder="WhatsApp contact or group link"
                    size="small"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
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
                    placeholder="Facebook page URL"
                    size="small"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
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
                    placeholder="LinkedIn page URL"
                    size="small"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
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
                    placeholder="YouTube channel URL"
                    size="small"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ px: 3, py: 2, borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: "#4776E6",
              "&:hover": {
                backgroundColor: "rgba(95, 150, 230, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                boxShadow: "0 4px 10px rgba(71, 118, 230, 0.25)",
                borderRadius: "8px",
                "&:hover": {
                  boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEditing ? (
                "Update Club"
              ) : (
                "Create Club"
              )}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClubManagement;
