"use client";
import { useState, useEffect } from "react";
import { fetchUserData } from "@/utils/auth";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";

export default function SuperAdminManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData);

        const response = await fetch("http://localhost:5000/users/users");
        const data = await response.json();
        setUsers(data);

        const admins = data.filter((user) => user.userRole === "super_admin");
        setSuperAdmins(admins);

        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load user data",
          severity: "error",
        });
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenDialog = () => {
    setFormData({ userId: "" });
    setOpenDialog(true);
    setSearchQuery("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSearchQuery("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestBody = {
        userId: formData.userId,
      };

      const response = await fetch(
        "http://localhost:5000/users/assign-super-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to assign super admin role"
        );
      }

      const updatedUser = await response.json();

      setUsers((prev) =>
        prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );

      setSuperAdmins((prev) => [...prev, updatedUser]);

      setSnackbar({
        open: true,
        message: "Successfully assigned super admin role",
        severity: "success",
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error assigning super admin role:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to assign super admin role",
        severity: "error",
      });
    }
  };

  const handleDeleteSuperAdmin = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/users/remove-admin/${selectedUser._id}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to remove super admin role"
        );
      }

      const updatedUser = await response.json();

      setUsers((prev) =>
        prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );

      setSuperAdmins((prev) =>
        prev.filter((user) => user._id !== selectedUser._id)
      );

      setSnackbar({
        open: true,
        message: "Successfully removed super admin role",
        severity: "success",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error removing super admin role:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to remove super admin role",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    // Prevent dropdown from closing when pressing keys in search field
    e.stopPropagation();
  };

  // Handle select open/close state
  const handleSelectOpen = () => {
    setSelectOpen(true);
  };

  const handleSelectClose = () => {
    setSelectOpen(false);
  };

  const eligibleUsers = users.filter((user) => user.userRole !== "super_admin");
  const filteredUsers = eligibleUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Custom gradient text component
  const GradientText = ({ children, variant }) => (
    <Typography
      variant={variant || "h5"}
      sx={{
        fontWeight: 600,
        background: "linear-gradient(45deg, #4776E6, #8E54E9)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        mb: 2,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      }}
    >
      {children}
    </Typography>
  );

  // Text colors based on theme
  const textColors = {
    primary: isDarkMode ? "#f0f4ff" : "#2A3B4F",
    secondary: isDarkMode ? "#c5d1ff" : "#607080",
    highlight: isDarkMode ? "#a2d2ff" : "#4776E6",
    accent: "#8E54E9",
  };

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? "#121212" : "#f5f6fa",
        minHeight: "100vh",
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        pt: 2,
      }}
    >
      <Container maxWidth="lg" sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <AdminPanelSettingsIcon
              sx={{
                fontSize: isMobile ? 40 : 48,
                mr: 2,
                color: "#8E54E9",
              }}
            />
            <GradientText variant={isMobile ? "h5" : "h4"}>
              Super Admin Management
            </GradientText>
          </Box>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              my={6}
              sx={{ minHeight: "50vh" }}
            >
              <CircularProgress sx={{ color: "#4776E6" }} />
            </Box>
          ) : (
            <>
              {currentUser?.isSuperAdmin && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenDialog}
                  sx={{
                    mb: 4,
                    background: "linear-gradient(45deg, #4776E6, #8E54E9)",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 500,
                    padding: "10px 24px",
                    boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #3a5fc0, #7b46c7)",
                      boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  fullWidth={isMobile}
                >
                  Add New Super Admin
                </Button>
              )}

              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
                  "&:hover": {
                    boxShadow: "0 8px 16px rgba(95, 150, 230, 0.15)",
                  },
                  transition: "all 0.3s ease",
                  backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    background: "linear-gradient(45deg, #4776E6, #8E54E9)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Super Admin Users
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: textColors.highlight }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: textColors.highlight }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: textColors.highlight }}>
                          Department
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: textColors.highlight }}>
                          Date Added
                        </TableCell>
                        {currentUser?.isSuperAdmin && (
                          <TableCell sx={{ fontWeight: 600, color: textColors.highlight }}>
                            Actions
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {superAdmins.length > 0 ? (
                        superAdmins.map((user) => (
                          <TableRow
                            key={user._id}
                            sx={{
                              "&:hover": {
                                backgroundColor: isDarkMode 
                                  ? "rgba(142, 84, 233, 0.1)"
                                  : "rgba(71, 118, 230, 0.05)",
                              },
                              transition: "background-color 0.2s",
                            }}
                          >
                            <TableCell sx={{ color: textColors.primary, fontWeight: 500 }}>
                              {user.name}
                            </TableCell>
                            <TableCell sx={{ color: textColors.secondary }}>
                              {user.email_id}
                            </TableCell>
                            <TableCell sx={{ color: textColors.secondary }}>
                              {user.department || "N/A"}
                            </TableCell>
                            <TableCell sx={{ color: textColors.secondary }}>
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            {currentUser?.isSuperAdmin && (
                              <TableCell>
                                <IconButton
                                  sx={{
                                    color: isDarkMode ? "#ff6b6b" : "#d32f2f",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      backgroundColor: isDarkMode 
                                        ? "rgba(255, 107, 107, 0.1)"
                                        : "rgba(211, 47, 47, 0.1)",
                                      transform:
                                        user._id === currentUser.userId ||
                                        superAdmins.length <= 1
                                          ? "none"
                                          : "scale(1.1)",
                                    },
                                    opacity:
                                      user._id === currentUser.userId ||
                                      superAdmins.length <= 1
                                        ? 0.5
                                        : 1,
                                  }}
                                  onClick={() => handleOpenDeleteDialog(user)}
                                  disabled={
                                    user._id === currentUser.userId ||
                                    superAdmins.length <= 1
                                  }
                                  title={
                                    user._id === currentUser.userId
                                      ? "Cannot remove yourself"
                                      : superAdmins.length <= 1
                                      ? "Cannot remove the last super admin"
                                      : "Remove super admin"
                                  }
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
                            colSpan={currentUser?.isSuperAdmin ? 5 : 4}
                            align="center"
                            sx={{ py: 4 }}
                          >
                            <Typography
                              sx={{ color: textColors.secondary, fontStyle: "italic" }}
                            >
                              No super admin users found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Box>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
              maxWidth: "500px",
              width: "100%",
              backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(45deg, #4776E6, #8E54E9)",
              color: "white",
              fontWeight: 600,
              p: 2,
            }}
          >
            Assign Super Admin Role
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ pt: 3 }}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ color: isDarkMode ? "#c5d1ff" : "#607080" }}>Select User</InputLabel>
                <Select
                  name="userId"
                  value={formData.userId}
                  onChange={handleFormChange}
                  required
                  open={selectOpen}
                  onOpen={handleSelectOpen}
                  onClose={handleSelectClose}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
                        "& .MuiMenuItem-root": {
                          color: textColors.primary,
                          "&:hover": {
                            backgroundColor: isDarkMode 
                              ? "rgba(142, 84, 233, 0.1)" 
                              : "rgba(71, 118, 230, 0.1)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: isDarkMode 
                              ? "rgba(142, 84, 233, 0.2)" 
                              : "rgba(71, 118, 230, 0.2)",
                            "&:hover": {
                              backgroundColor: isDarkMode 
                                ? "rgba(142, 84, 233, 0.3)" 
                                : "rgba(71, 118, 230, 0.3)",
                            },
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    borderRadius: "8px",
                    color: textColors.primary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDarkMode 
                        ? "rgba(142, 84, 233, 0.3)" 
                        : "rgba(71, 118, 230, 0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDarkMode 
                        ? "rgba(142, 84, 233, 0.6)" 
                        : "rgba(71, 118, 230, 0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDarkMode ? "#8E54E9" : "#4776E6",
                    },
                    boxShadow: isDarkMode 
                      ? "0 2px 8px rgba(142, 84, 233, 0.15)" 
                      : "0 2px 8px rgba(95, 150, 230, 0.1)",
                    "&:hover": {
                      boxShadow: isDarkMode 
                        ? "0 4px 15px rgba(142, 84, 233, 0.25)" 
                        : "0 4px 15px rgba(95, 150, 230, 0.2)",
                    },
                    transition: "all 0.3s ease",
                    "& .MuiSelect-icon": {
                      color: isDarkMode ? "#c5d1ff" : "#4776E6",
                    },
                  }}
                >
                  {/* Use a custom rendered element for the search bar */}
                  <Box
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
                      p: 1,
                      borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                    }}
                    onClick={(e) => {
                      // This is critical - prevent the click from closing the dropdown
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <TextField
                      autoFocus
                      placeholder="Search users..."
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                          borderRadius: 1.5,
                          "& fieldset": {
                            borderColor: isDarkMode ? "rgba(142, 84, 233, 0.3)" : "rgba(71, 118, 230, 0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: isDarkMode ? "rgba(142, 84, 233, 0.6)" : "rgba(71, 118, 230, 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: isDarkMode ? "#8E54E9" : "#4776E6",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: textColors.primary,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon 
                              sx={{ 
                                color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" 
                              }} 
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  {/* User options */}
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email_id})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      {searchQuery ? "No matching users found" : "No eligible users available"}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </DialogContent>
            <Divider sx={{ backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : undefined }} />
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              <Button
                onClick={handleCloseDialog}
                sx={{
                  color: isDarkMode ? "#a2d2ff" : "#4776E6",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: isDarkMode 
                      ? "rgba(162, 210, 255, 0.08)" 
                      : "rgba(71, 118, 230, 0.08)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: "linear-gradient(45deg, #4776E6, #8E54E9)",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    background: "linear-gradient(45deg, #3a5fc0, #7b46c7)",
                    boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                  },
                  "&.Mui-disabled": {
                    background: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                    color: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                  },
                  boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                  transition: "all 0.3s ease",
                }}
                disabled={!formData.userId}
              >
                Assign Super Admin Role
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
              overflow: "hidden",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
              maxWidth: "500px",
              width: "100%",
              backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(45deg, #d32f2f, #f44336)",
              color: "white",
              fontWeight: 600,
              p: 2,
            }}
          >
            Remove Super Admin Role
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography sx={{ color: textColors.primary, mb: 2 }}>
              Are you sure you want to remove <b>{selectedUser?.name}</b>'s
              super admin privileges?
            </Typography>
            {selectedUser?._id === currentUser?.userId && (
              <Typography
                sx={{
                  color: isDarkMode ? "#ff6b6b" : "#d32f2f",
                  mt: 2,
                  p: 2,
                  backgroundColor: isDarkMode 
                    ? "rgba(255, 107, 107, 0.1)" 
                    : "rgba(211, 47, 47, 0.1)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DeleteIcon sx={{ mr: 1 }} /> You cannot remove your own super
                admin privileges!
              </Typography>
            )}
            {superAdmins.length <= 1 && (
              <Typography
                sx={{
                  color: isDarkMode ? "#ff6b6b" : "#d32f2f",
                  mt: 2,
                  p: 2,
                  backgroundColor: isDarkMode 
                    ? "rgba(255, 107, 107, 0.1)" 
                    : "rgba(211, 47, 47, 0.1)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DeleteIcon sx={{ mr: 1 }} /> Cannot remove the last super admin
                user!
              </Typography>
            )}
          </DialogContent>
          <Divider sx={{ backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : undefined }} />
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              onClick={handleCloseDeleteDialog}
              sx={{
                color: isDarkMode ? "#c5d1ff" : "#2A3B4F",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: isDarkMode 
                    ? "rgba(197, 209, 255, 0.08)" 
                    : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSuperAdmin}
              variant="contained"
              sx={{
                backgroundColor: isDarkMode ? "#ff6b6b" : "#d32f2f",
                color: "white",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: isDarkMode ? "#ff5252" : "#b71c1c",
                  boxShadow: "0 6px 15px rgba(211, 47, 47, 0.4)",
                },
                "&.Mui-disabled": {
                  background: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                  color: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                },
                boxShadow: "0 4px 10px rgba(211, 47, 47, 0.3)",
                transition: "all 0.3s ease",
              }}
              disabled={
                selectedUser?._id === currentUser?.userId ||
                superAdmins.length <= 1
              }
            >
              Remove Super Admin
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              borderRadius: "8px",
            }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}