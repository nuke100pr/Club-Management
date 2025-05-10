"use client";
import { useState, useEffect } from "react";
import { fetchUserData, getAuthToken } from "@/utils/auth";
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Chip,
  Avatar,
  alpha,
  ListSubheader,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";

export default function AdminManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [boards, setBoards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    role: "club_admin",
    club_id: "",
    board_id: "",
  });
  const [loading, setLoading] = useState({
    users: true,
    clubs: true,
    boards: true,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userSearchTerm, setUserSearchTerm] = useState("");
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
    const loadData = async () => {
      if (!authToken) return;
      
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData);

        const usersPromise = fetch("http://localhost:5000/users/users", {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        })
          .then((res) => res.json())
          .then((data) => {
            setUsers(data);
            setLoading((prev) => ({ ...prev, users: false }));
            return data;
          });

        const clubsPromise = fetch("http://localhost:5000/clubs/clubs", {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        })
          .then((res) => res.json())
          .then((data) => {
            setClubs(data);
            setLoading((prev) => ({ ...prev, clubs: false }));
            return data;
          });

        const boardsPromise = fetch("http://localhost:5000/boards", {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        })
          .then((res) => res.json())
          .then((data) => {
            setBoards(data);
            setLoading((prev) => ({ ...prev, boards: false }));
            return data;
          });

        const [usersData] = await Promise.all([
          usersPromise,
          clubsPromise,
          boardsPromise,
        ]);

        const admins = usersData.filter(
          (user) =>
            user.userRole === "club_admin" || user.userRole === "board_admin"
        );
        setFilteredUsers(admins);
      } catch (error) {
        console.error("Error loading data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load data",
          severity: "error",
        });
        setLoading({ users: false, clubs: false, boards: false });
      }
    };

    if (authToken) {
      loadData();
    }
  }, [authToken]);

  const handleOpenDialog = () => {
    setFormData({
      userId: "",
      role: "club_admin",
      club_id: "",
      board_id: "",
    });
    setUserSearchTerm("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSearchChange = (event) => {
    setUserSearchTerm(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) return;
    
    try {
      const endpoint =
        formData.role === "club_admin"
          ? "/users/assign-club-admin"
          : "/users/assign-board-admin";

      const requestBody = {
        userId: formData.userId,
        ...(formData.role === "club_admin"
          ? { club_id: formData.club_id }
          : { board_id: formData.board_id }),
      };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign admin role");
      }

      const updatedUser = await response.json();

      setUsers((prev) =>
        prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );

      setFilteredUsers((prev) => [...prev, updatedUser]);

      setSnackbar({
        open: true,
        message: `Successfully assigned ${formData.role.replace(
          "_",
          " "
        )} role`,
        severity: "success",
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error assigning admin role:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to assign admin role",
        severity: "error",
      });
    }
  };

  const handleDeleteAdmin = async () => {
    if (!authToken) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/users/remove-admin/${selectedUser._id}`,
        {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove admin role");
      }

      const updatedUser = await response.json();

      setUsers((prev) =>
        prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );

      setFilteredUsers((prev) =>
        prev.filter((user) => user._id !== selectedUser._id)
      );

      setSnackbar({
        open: true,
        message: "Successfully removed admin role",
        severity: "success",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error removing admin role:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to remove admin role",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const regularMembers = users.filter((user) => user.userRole === "member");

  const filteredRegularMembers = regularMembers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email_id.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const isLoading = loading.users || loading.clubs || loading.boards;

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role) => {
    return role === "club_admin" ? "#1976d2" : "#7b1fa2";
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 3 },
        backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#f5f6fa",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          p: isMobile ? 3 : 4,
          minHeight: "100vh",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
              transform: "translateY(-8px)",
            },
            mb: 4,
            position: "relative",
            overflow: "hidden",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AdminPanelSettingsIcon
                sx={{
                  fontSize: 40,
                  background:
                    "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                  p: 1,
                  borderRadius: "8px",
                }}
              />
              <Typography
                variant={isMobile ? "h5" : "h4"}
                component="h1"
                sx={{
                  fontWeight: 600,
                  background:
                    "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}
              >
                Admin Management
              </Typography>
            </Box>

            {currentUser?.isSuperAdmin && !isLoading && (
              <Button
                variant="contained"
                startIcon={<PersonAddAltIcon />}
                onClick={handleOpenDialog}
                sx={{
                  background:
                    "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                  fontWeight: 500,
                  borderRadius: "8px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                  textTransform: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #3a5fc0 0%, #7b46c9 100%)",
                    boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}
                fullWidth={isMobile}
              >
                Assign New Admin
              </Button>
            )}
          </Box>

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              my={4}
              sx={{
                minHeight: 300,
                alignItems: "center",
              }}
            >
              <CircularProgress
                sx={{
                  color: "#4776E6",
                }}
              />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: "8px",
                boxShadow: "none",
                border: "1px solid rgba(95, 150, 230, 0.1)",
                overflow: "auto",
                maxWidth: "100%",
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Admin</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      Assigned To
                    </TableCell>
                    {currentUser?.isSuperAdmin && (
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(95, 150, 230, 0.05)",
                          },
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: alpha(
                                  getRoleColor(user.userRole),
                                  0.8
                                ),
                                width: 36,
                                height: 36,
                              }}
                            >
                              {getInitials(user.name)}
                            </Avatar>
                            <Typography
                              sx={{ color: "#2A3B4F", fontWeight: 500 }}
                            >
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "#607080" }}>
                          {user.email_id}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              user.userRole === "club_admin"
                                ? "Club Admin"
                                : "Board Admin"
                            }
                            size="small"
                            icon={
                              user.userRole === "club_admin" ? (
                                <EventIcon />
                              ) : (
                                <DashboardIcon />
                              )
                            }
                            sx={{
                              backgroundColor: alpha(
                                getRoleColor(user.userRole),
                                0.1
                              ),
                              color: getRoleColor(user.userRole),
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "26px",
                              "& .MuiChip-icon": {
                                color: getRoleColor(user.userRole),
                                fontSize: "0.85rem",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#607080" }}>
                          {user.department || "N/A"}
                        </TableCell>
                        <TableCell sx={{ color: "#607080" }}>
                          <Typography noWrap>
                            {user.userRole === "club_admin"
                              ? clubs.find((c) => c._id === user.club_id)
                                  ?.name || "N/A"
                              : boards.find((b) => b._id === user.board_id)
                                  ?.name || "N/A"}
                          </Typography>
                        </TableCell>
                        {currentUser?.isSuperAdmin && (
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteDialog(user)}
                              disabled={user._id === currentUser.userId}
                              sx={{
                                color: "#d32f2f",
                                "&:hover": {
                                  backgroundColor: alpha("#d32f2f", 0.1),
                                },
                                "&.Mui-disabled": {
                                  color: alpha("#d32f2f", 0.3),
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={currentUser?.isSuperAdmin ? 6 : 5}
                        align="center"
                        sx={{ py: 4 }}
                      >
                        No admin users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              pt: 2,
              fontWeight: 600,
              color: "#2A3B4F",
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
          >
            Assign Admin Role
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ pb: 1 }}>
              <FormControl
                fullWidth
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(95, 150, 230, 0.1)",
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(95, 150, 230, 0.2)",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4776E6",
                  },
                }}
              >
                <InputLabel sx={{ color: "#607080" }}>User</InputLabel>
                <Select
                  name="userId"
                  value={formData.userId}
                  onChange={handleFormChange}
                  required
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        "& .MuiMenuItem-root": {
                          padding: "8px 16px",
                        },
                      },
                    },
                  }}
                >
                  <ListSubheader sx={{ backgroundColor: "white", padding: 0 }}>
                    <Box sx={{ p: 1, position: "sticky", top: 0, zIndex: 1 }}>
                      <TextField
                        autoFocus
                        placeholder="Search users..."
                        fullWidth
                        value={userSearchTerm}
                        onChange={handleUserSearchChange}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <SearchIcon sx={{ color: "gray", mr: 1 }} />
                          ),
                          sx: {
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(95, 150, 230, 0.1)",
                            "&:hover": {
                              boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                            },
                          },
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  </ListSubheader>
                  {filteredRegularMembers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email_id})
                    </MenuItem>
                  ))}
                  {filteredRegularMembers.length === 0 && (
                    <MenuItem disabled sx={{ fontStyle: "italic", color: "text.secondary" }}>
                      No users found
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(95, 150, 230, 0.1)",
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(95, 150, 230, 0.2)",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4776E6",
                  },
                }}
              >
                <InputLabel sx={{ color: "#607080" }}>Admin Type</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="club_admin">Club Admin</MenuItem>
                  <MenuItem value="board_admin">Board Admin</MenuItem>
                </Select>
              </FormControl>

              {formData.role === "club_admin" ? (
                <FormControl
                  fullWidth
                  margin="normal"
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(95, 150, 230, 0.1)",
                      transition: "box-shadow 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(95, 150, 230, 0.2)",
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4776E6",
                    },
                  }}
                >
                  <InputLabel sx={{ color: "#607080" }}>Club</InputLabel>
                  <Select
                    name="club_id"
                    value={formData.club_id}
                    onChange={handleFormChange}
                    required
                  >
                    {clubs.map((club) => (
                      <MenuItem key={club._id} value={club._id}>
                        {club.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl
                  fullWidth
                  margin="normal"
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(95, 150, 230, 0.1)",
                      transition: "box-shadow 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 15px rgba(95, 150, 230, 0.2)",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(95, 150, 230, 0.2)",
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4776E6",
                    },
                  }}
                >
                  <InputLabel sx={{ color: "#607080" }}>Board</InputLabel>
                  <Select
                    name="board_id"
                    value={formData.board_id}
                    onChange={handleFormChange}
                    required
                  >
                    {boards.map((board) => (
                      <MenuItem key={board._id} value={board._id}>
                        {board.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={handleCloseDialog}
                sx={{
                  color: "#4776E6",
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: 500,
                  boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                  textTransform: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #3a5fc0 0%, #7b46c9 100%)",
                    boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Assign Role
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)",
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              pt: 2,
              fontWeight: 600,
              color: "#2A3B4F",
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
          >
            Remove Admin Role
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#2A3B4F" }}>
              Are you sure you want to remove {selectedUser?.name}'s admin
              privileges?
            </Typography>
            {selectedUser?._id === currentUser?.userId && (
              <Typography
                color="error"
                mt={1}
                sx={{
                  p: 2,
                  borderRadius: "8px",
                  fontWeight: 500,
                }}
              >
                Warning: You are removing your own admin privileges!
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseDeleteDialog}
              sx={{
                color: "#4776E6",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAdmin}
              variant="contained"
              sx={{
                color: "white",
                borderRadius: "8px",
                fontWeight: 500,
                boxShadow: "0 4px 10px rgba(211, 47, 47, 0.3)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#9a0007",
                  boxShadow: "0 6px 15px rgba(211, 47, 47, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              boxShadow: "0 4px 12px rgba(95, 150, 230, 0.2)",
              borderRadius: "8px",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}