import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Add as AddIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

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
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      board: "",
      image: null,
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
      image: null,
    });
    setImagePreview(club.image);
    setOpenDialog(true);
  };

  const createClub = async (clubData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", clubData.name);
      formDataObj.append("description", clubData.description);
      formDataObj.append("board_id", clubData.board_id);
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
      formDataObj.append("board_id", clubData.board_id);
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
        prev.map((club) => (club.id === clubId ? updatedClub : club))
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

      setClubs((prev) => prev.filter((club) => club.id !== clubId));
      return true;
    } catch (error) {
      console.error("Error deleting club:", error);
      alert("Failed to delete club. Please try again.");
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.board) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const clubData = {
        name: formData.name,
        description: formData.description,
        board_id: formData.board,
        image: formData.image,
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
        image: null,
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
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#6a1b9a" }} />
      </Box>
    );
  }

  if (error && clubs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2, backgroundColor: "#6a1b9a" }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: isMobile ? 1 : 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 4,
          gap: isMobile ? 2 : 0
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: "bold", color: "#6a1b9a" }}>
          Club Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          disabled={loading}
          sx={{
            backgroundColor: "#6a1b9a",
            "&:hover": { backgroundColor: "#4a148c" },
          }}
          fullWidth={isMobile}
        >
          Add New Club
        </Button>
      </Box>

      {clubs.length === 0 ? (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No clubs found
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
        <Grid container spacing={isMobile ? 1 : 3}>
          {clubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={club.image}
                      sx={{ bgcolor: "#6a1b9a", mr: 2, width: 56, height: 56 }}
                    >
                      <SchoolIcon />
                    </Avatar>
                    <Typography
                      gutterBottom
                      variant={isMobile ? "h6" : "h5"}
                      component="h2"
                      sx={{ color: "#6a1b9a" }}
                    >
                      {club.name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {club.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Board:</Typography>
                    <Chip
                      label={getBoardName(club.board_id)}
                      size="small"
                      sx={{ backgroundColor: "#e1bee7" }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Chip
                      icon={<GroupIcon />}
                      label={`${club.members || 0} Members`}
                      variant="outlined"
                      size="small"
                      sx={{ borderColor: "#6a1b9a" }}
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <Button
                      startIcon={<EditIcon />}
                      size="small"
                      sx={{ color: "#6a1b9a", mr: 1 }}
                      onClick={() => handleOpenEditDialog(club)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      size="small"
                      sx={{ color: "#d32f2f" }}
                      onClick={() => handleDeleteClub(club._id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => !loading && setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle>{isEditing ? "Edit Club" : "Add New Club"}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              name="name"
              label="Club Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={isMobile ? 2 : 3}
              variant="outlined"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              margin="dense"
              name="board"
              label="Parent Board"
              fullWidth
              variant="outlined"
              value={formData.board}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{ mb: 3 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select a board</option>
              {boards.map((board) => (
                <option key={board._id} value={board._id}>
                  {board.name}
                </option>
              ))}
            </TextField>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Club Image
              </Typography>
              <input
                accept="image/*"
                id="club-image"
                type="file"
                style={{ display: "none" }}
                onChange={handleImageChange}
                disabled={loading}
              />
              <label htmlFor="club-image">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={loading}
                  sx={{ borderColor: "#6a1b9a", color: "#6a1b9a" }}
                  fullWidth={isMobile}
                >
                  Upload Image
                </Button>
              </label>
            </Box>

            {imagePreview && (
              <Box sx={{ mt: 2, mb: 2, textAlign: "center" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: "#6a1b9a" }}
            disabled={loading}
          >
            Cancel
          </Button>
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
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : isEditing ? (
              "Update"
            ) : (
              "Add"
            )}{" "}
            Club
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClubManagement;