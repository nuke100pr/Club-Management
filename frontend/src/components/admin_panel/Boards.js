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
  Fade,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAuthToken } from "@/utils/auth";

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newBoard, setNewBoard] = useState({
    name: "",
    description: "",
    established_year: "",
    image: null,
    created_at: "",
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      website: "",
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      if (!authToken) return;
      
      try {
        const response = await fetch("http://localhost:5000/boards/", {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
        if (!response.ok) throw new Error("Failed to fetch boards");
        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };

    if (authToken) {
      fetchBoards();
    }
  }, [authToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBoard((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setNewBoard((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e) => {
    setNewBoard((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async () => {
    if (!authToken) return;
    
    try {
      const formData = new FormData();
      formData.append("name", newBoard.name);
      formData.append("description", newBoard.description);
      formData.append("established_year", newBoard.established_year);
      if (newBoard.image) {
        formData.append("image", newBoard.image);
      }

      Object.keys(newBoard.social_media).forEach((key) => {
        if (newBoard.social_media[key]) {
          formData.append(`social_media[${key}]`, newBoard.social_media[key]);
        }
      });

      const response = await fetch("http://localhost:5000/boards/", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create board");

      const data = await response.json();
      setBoards([...boards, data]);
      setOpenDialog(false);
      setNewBoard({
        name: "",
        description: "",
        established_year: "",
        image: null,
        created_at: "",
        social_media: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          youtube: "",
          website: "",
        },
      });
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleMenuClick = (event, board) => {
    setAnchorEl(event.currentTarget);
    setSelectedBoard(board);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = async () => {
    if (!authToken) return;
    
    try {
      const formData = new FormData();
      formData.append("name", newBoard.name);
      formData.append("description", newBoard.description);
      formData.append("established_year", newBoard.established_year);

      if (newBoard.image) {
        formData.append("image", newBoard.image);
      }

      Object.keys(newBoard.social_media).forEach((key) => {
        formData.append(`social_media[${key}]`, newBoard.social_media[key]);
      });

      const response = await fetch(
        `http://localhost:5000/boards/${selectedBoard._id}`,
        {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update board");

      const boardsResponse = await fetch("http://localhost:5000/boards/", {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      if (!boardsResponse.ok) throw new Error("Failed to fetch updated boards");
      const data = await boardsResponse.json();
      setBoards(data);

      setOpenDialog(false);
      setIsEditing(false);
      setNewBoard({
        name: "",
        description: "",
        established_year: "",
        image: null,
        created_at: "",
        social_media: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          youtube: "",
          website: "",
        },
      });
    } catch (error) {
      console.error("Error editing board:", error);
    }
  };

  const handleDelete = async () => {
    if (!authToken) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/boards/${selectedBoard._id}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete board");

      setBoards(boards.filter((board) => board._id !== selectedBoard._id));

      handleMenuClose();
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  const openAddDialog = () => {
    setIsEditing(false);
    setNewBoard({
      name: "",
      description: "",
      established_year: "",
      image: null,
      created_at: "",
      social_media: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: "",
        website: "",
      },
    });
    setOpenDialog(true);
  };

  const openEditDialog = (board) => {
    setIsEditing(true);
    setNewBoard({
      name: board.name,
      description: board.description,
      established_year: board.established_year || "",
      image: null,
      created_at: board.created_at || "",
      social_media: {
        facebook: board.social_media?.facebook || "",
        instagram: board.social_media?.instagram || "",
        twitter: board.social_media?.twitter || "",
        linkedin: board.social_media?.linkedin || "",
        youtube: board.social_media?.youtube || "",
        website: board.social_media?.website || "",
      },
    });
    setSelectedBoard(board);
    setOpenDialog(true);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4, md: 8 },
        bgcolor: theme.palette.mode === "dark" ? "#121212" : "#f8faff",
        minHeight: "100vh",
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
          Boards Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{
            background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
            boxShadow: "0 4px 10px rgba(71, 118, 230, 0.25)",
            "&:hover": {
              boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          Add New Board
        </Button>
      </Box>

      <Grid container spacing={3}>
        {boards.map((board) => (
          <Grid item xs={12} sm={6} md={4} key={board._id}>
            <Card
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
                },
                borderTop: "3px solid #4776E6",
                bgcolor: theme.palette.mode === "dark" ? "#141414" : "#ffffff",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    color={
                      theme.palette.mode === "dark" ? "#ffffff" : "#2A3B4F"
                    }
                    fontWeight={600}
                  >
                    {board.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, board)}
                  >
                    <MoreVertIcon
                      color={
                        theme.palette.mode === "dark" ? "inherit" : "action"
                      }
                    />
                  </IconButton>
                </Box>

                {board.image && (
                  <Fade in={true} timeout={1000}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={`http://localhost:5000/uploads/${board.image.filename}`}
                      alt={board.name}
                      sx={{ borderRadius: "8px", mb: 2, objectFit: "cover" }}
                    />
                  </Fade>
                )}

                <Typography
                  variant="body2"
                  color={theme.palette.mode === "dark" ? "#e0e0e0" : "#607080"}
                  sx={{ mb: 2 }}
                >
                  {board.description}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {board.established_year && (
                    <Chip
                      label={`Est. ${board.established_year}`}
                      size="small"
                      sx={{
                        color:
                          theme.palette.mode === "dark" ? "#90caf9" : "#4776E6",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(144, 202, 249, 0.16)"
                            : "rgba(71, 118, 230, 0.1)",
                        borderRadius: "6px",
                        height: "24px",
                        fontSize: "12px",
                      }}
                    />
                  )}

                  {board.created_at && (
                    <Chip
                      label={`Created: ${new Date(
                        board.created_at
                      ).toLocaleDateString()}`}
                      size="small"
                      sx={{
                        color:
                          theme.palette.mode === "dark" ? "#90caf9" : "#4776E6",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(144, 202, 249, 0.16)"
                            : "rgba(71, 118, 230, 0.1)",
                        borderRadius: "6px",
                        height: "24px",
                        fontSize: "12px",
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#ffffff",
          },
        }}
      >
        <MenuItem onClick={() => openEditDialog(selectedBoard)}>
          <ListItemIcon>
            <EditIcon
              fontSize="small"
              color={theme.palette.mode === "dark" ? "inherit" : "action"}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              color: theme.palette.mode === "dark" ? "#e0e0e0" : "inherit",
            }}
          >
            Edit
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon
              fontSize="small"
              sx={{
                color: theme.palette.mode === "dark" ? "#f44336" : "#d32f2f",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              color: theme.palette.mode === "dark" ? "#f44336" : "#d32f2f",
            }}
          >
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 24px 38px rgba(0, 0, 0, 0.14)",
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            color={theme.palette.mode === "dark" ? "#ffffff" : "#2A3B4F"}
          >
            {isEditing ? "Edit Board" : "Add New Board"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Board Name"
              name="name"
              value={newBoard.name}
              onChange={handleInputChange}
              variant="outlined"
              required
              placeholder="Enter board name"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newBoard.description}
              onChange={handleInputChange}
              variant="outlined"
              required
              multiline
              rows={isMobile ? 3 : 4}
              placeholder="Enter board description"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Established Year"
              name="established_year"
              value={newBoard.established_year}
              onChange={handleInputChange}
              variant="outlined"
              placeholder="e.g. 2023"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <Typography
              variant="subtitle1"
              color={theme.palette.mode === "dark" ? "#ffffff" : "#2A3B4F"}
              fontWeight={500}
              sx={{ mt: 1 }}
            >
              Social Media Links
            </Typography>

            <TextField
              fullWidth
              label="Facebook"
              name="facebook"
              value={newBoard.social_media.facebook}
              onChange={handleSocialMediaChange}
              variant="outlined"
              placeholder="Facebook profile URL"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Instagram"
              name="instagram"
              value={newBoard.social_media.instagram}
              onChange={handleSocialMediaChange}
              variant="outlined"
              placeholder="Instagram profile URL"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Twitter"
              name="twitter"
              value={newBoard.social_media.twitter}
              onChange={handleSocialMediaChange}
              variant="outlined"
              placeholder="Twitter profile URL"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="LinkedIn"
              name="linkedin"
              value={newBoard.social_media.linkedin}
              onChange={handleSocialMediaChange}
              variant="outlined"
              placeholder="LinkedIn profile URL"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="YouTube"
              name="youtube"
              value={newBoard.social_media.youtube}
              onChange={handleSocialMediaChange}
              variant="outlined"
              placeholder="YouTube channel URL"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Website"
              name="website"
              value={newBoard.social_media.website}
              onChange={handleSocialMediaChange}
              variant="outlined"
              placeholder="Official website URL"
              InputProps={{
                sx: {
                  borderRadius: "8px",
                  color: theme.palette.mode === "dark" ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "#424242"
                        : "rgba(0, 0, 0, 0.23)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color:
                    theme.palette.mode === "dark"
                      ? "#b0b0b0"
                      : "rgba(0, 0, 0, 0.6)",
                },
              }}
            />

            <Box>
              <Typography
                variant="body2"
                color={theme.palette.mode === "dark" ? "#e0e0e0" : "#607080"}
                sx={{ mb: 1 }}
              >
                Board Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderRadius: "8px",
                    color:
                      theme.palette.mode === "dark" ? "#90caf9" : "#4776E6",
                    borderColor:
                      theme.palette.mode === "dark" ? "#90caf9" : "#4776E6",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(144, 202, 249, 0.16)"
                          : "rgba(71, 118, 230, 0.1)",
                      borderColor:
                        theme.palette.mode === "dark" ? "#90caf9" : "#4776E6",
                    },
                  }}
                >
                  {isEditing ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                {newBoard.image && (
                  <Typography
                    variant="body2"
                    color={
                      theme.palette.mode === "dark" ? "#e0e0e0" : "#607080"
                    }
                    sx={{ ml: 2 }}
                  >
                    {newBoard.image.name}
                  </Typography>
                )}
              </Box>
              {isEditing && !newBoard.image && (
                <Typography
                  variant="caption"
                  color={theme.palette.mode === "dark" ? "#b0b0b0" : "#607080"}
                  sx={{ mt: 1, display: "block" }}
                >
                  Leave empty to keep current image
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ px: 3, py: 2, borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: theme.palette.mode === "dark" ? "#90caf9" : "#4776E6",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(144, 202, 249, 0.16)"
                    : "rgba(95, 150, 230, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={isEditing ? handleEdit : handleSubmit}
            sx={{
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              boxShadow: "0 4px 10px rgba(71, 118, 230, 0.25)",
              borderRadius: "8px",
              "&:hover": {
                boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            {isEditing ? "Update Board" : "Add Board"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Boards;