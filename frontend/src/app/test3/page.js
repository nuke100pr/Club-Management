"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/utils/auth";
import {
  Box,
  Typography,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Grid,
  ListItemText,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

const PORManagement = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [managedOrganization, setManagedOrganization] = useState(null);
  const [organizationType, setOrganizationType] = useState(null);

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // POR state
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [privilegeTypes, setPrivilegeTypes] = useState([]);
  const [newPosition, setNewPosition] = useState({
    user_id: "",
    privilegeTypeId: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // PrivilegeType state
  const [openPrivilegeDialog, setOpenPrivilegeDialog] = useState(false);
  const [privilegeSearchTerm, setPrivilegeSearchTerm] = useState("");
  const [filteredPrivilegeTypes, setFilteredPrivilegeTypes] = useState([]);
  const [newPrivilegeType, setNewPrivilegeType] = useState({
    position: "",
    description: "",
    posts: false,
    events: false,
    projects: false,
    resources: false,
    opportunities: false,
    blogs: false,
    forums: false,
  });

  // Organization edit state
  const [openOrgDialog, setOpenOrgDialog] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    description: "",
    established_year: "",
    image: null,
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      website: "",
    },
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Fetch user data and determine organization
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData.userData);

        if (userData.isClubAdmin) {
          setOrganizationType("club");
          const clubRes = await fetch(
            `http://localhost:5000/clubs/clubs/${userData?.club_id}`
          );
          const clubData = await clubRes.json();
          setManagedOrganization(clubData);
        } else if (userData.isBoardAdmin) {
          setOrganizationType("board");
          const boardRes = await fetch(
            `http://localhost:5000/boards/${userData?.board_id}`
          );
          const boardData = await boardRes.json();
          setManagedOrganization(boardData);
        } else {
          router.push("/unauthorized");
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setSnackbar({
          open: true,
          message: "Failed to load user data",
          severity: "error",
        });
      }
    };

    loadUserData();
  }, [router]);

  // Fetch all necessary data
  useEffect(() => {
    if (!organizationType || !managedOrganization) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [usersRes, privilegeTypesRes, positionsRes] = await Promise.all([
          fetch("http://localhost:5000/users/users"),
          fetch("http://localhost:5000/por2/privilege-types"),
          fetch(`http://localhost:5000/por2/por`),
        ]);

        if (!usersRes.ok || !privilegeTypesRes.ok || !positionsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const usersData = await usersRes.json();
        const privilegeTypesData = await privilegeTypesRes.json();
        let positionsData = await positionsRes.json();

        if (organizationType === "board") {
          positionsData = positionsData.filter(
            (position) => position?.board_id?._id === managedOrganization._id
          );
        } else if (organizationType === "club") {
          positionsData = positionsData.filter(
            (position) => position?.club_id?._id === managedOrganization._id
          );
        }

        setUsers(usersData);
        setPrivilegeTypes(privilegeTypesData);
        setFilteredPrivilegeTypes(privilegeTypesData);

        const formattedPositions = positionsData.map((position) => {
          const user =
            usersData.find((u) => u._id === position.user_id?._id) || {};
          const privilege =
            privilegeTypesData.find(
              (p) => p._id === position.privilegeTypeId?._id
            ) || {};

          return {
            ...position,
            user: user.name || "Unknown User",
            email: user.email_id || "N/A",
            position: privilege.position || "Unknown Position",
            status:
              position.end_date && new Date(position.end_date) < new Date()
                ? "Completed"
                : "Active",
          };
        });

        setPositions(formattedPositions);
        setFilteredPositions(formattedPositions);
      } catch (err) {
        console.error("Error fetching data:", err);
        setSnackbar({
          open: true,
          message: "Failed to load data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [organizationType, managedOrganization]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Organization edit handlers
  const handleOpenOrgDialog = () => {
    setNewOrgData({
      name: managedOrganization.name,
      description: managedOrganization.description,
      established_year: managedOrganization.established_year || "",
      image: null,
      social_media: {
        facebook: managedOrganization.social_media?.facebook || "",
        instagram: managedOrganization.social_media?.instagram || "",
        twitter: managedOrganization.social_media?.twitter || "",
        linkedin: managedOrganization.social_media?.linkedin || "",
        youtube: managedOrganization.social_media?.youtube || "",
        website: managedOrganization.social_media?.website || "",
      },
    });
    setImagePreview(managedOrganization.image);
    setOpenOrgDialog(true);
  };

  const handleOrgInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrgData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrgSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setNewOrgData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value,
      },
    }));
  };

  const handleOrgFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewOrgData((prev) => ({
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

  const handleOrgSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newOrgData.name);
      formData.append("description", newOrgData.description);
      formData.append("established_year", newOrgData.established_year);
      
      if (newOrgData.image) {
        formData.append("image", newOrgData.image);
      }
      
      Object.keys(newOrgData.social_media).forEach(key => {
        if (newOrgData.social_media[key]) {
          formData.append(`social_media[${key}]`, newOrgData.social_media[key]);
        }
      });

      const endpoint = organizationType === "club" 
        ? `http://localhost:5000/clubs/clubs/${managedOrganization._id}`
        : `http://localhost:5000/boards/${managedOrganization._id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }

      const updatedOrg = await response.json();
      setManagedOrganization(updatedOrg);
      
      setSnackbar({
        open: true,
        message: "Organization updated successfully",
        severity: "success",
      });
      setOpenOrgDialog(false);
    } catch (error) {
      console.error("Error updating organization:", error);
      setSnackbar({
        open: true,
        message: "Failed to update organization",
        severity: "error",
      });
    }
  };

  // POR search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPositions(positions);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = positions.filter(
      (position) =>
        position.user?.toLowerCase().includes(term) ||
        position.email?.toLowerCase().includes(term) ||
        position.position?.toLowerCase().includes(term) ||
        position.status?.toLowerCase().includes(term)
    );

    setFilteredPositions(filtered);
  };

  // Privilege search functionality
  const handlePrivilegeSearch = () => {
    if (!privilegeSearchTerm.trim()) {
      setFilteredPrivilegeTypes(privilegeTypes);
      return;
    }

    const term = privilegeSearchTerm.toLowerCase();
    const filtered = privilegeTypes.filter(
      (privilege) =>
        privilege.position?.toLowerCase().includes(term) ||
        privilege.description?.toLowerCase().includes(term)
    );

    setFilteredPrivilegeTypes(filtered);
  };

  // POR form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPosition((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PrivilegeType form input change handler
  const handlePrivilegeInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewPrivilegeType((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle POR form submission
  const handleSubmit = async () => {
    try {
      const porData = {
        ...newPosition,
        [`${organizationType}_id`]: managedOrganization._id,
      };

      const url = isEdit
        ? `http://localhost:5000/por2/por/${selectedPosition._id}`
        : "http://localhost:5000/por2/por";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(porData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save position");
      }

      const updatedPosition = await response.json();

      if (isEdit) {
        setPositions((prev) =>
          prev.map((pos) =>
            pos._id === updatedPosition._id
              ? {
                  ...pos,
                  ...updatedPosition,
                  user:
                    users.find((u) => u._id === updatedPosition.user_id)
                      ?.name || "Unknown User",
                  email:
                    users.find((u) => u._id === updatedPosition.user_id)
                      ?.email_id || "N/A",
                  position:
                    privilegeTypes.find(
                      (p) => p._id === updatedPosition.privilegeTypeId
                    )?.position || "Unknown Position",
                  status:
                    updatedPosition.end_date &&
                    new Date(updatedPosition.end_date) < new Date()
                      ? "Completed"
                      : "Active",
                }
              : pos
          )
        );
      } else {
        setPositions((prev) => [
          ...prev,
          {
            ...updatedPosition,
            user:
              users.find((u) => u._id === updatedPosition.user_id)?.name ||
              "Unknown User",
            email:
              users.find((u) => u._id === updatedPosition.user_id)?.email_id ||
              "N/A",
            position:
              privilegeTypes.find(
                (p) => p._id === updatedPosition.privilegeTypeId
              )?.position || "Unknown Position",
            status:
              updatedPosition.end_date &&
              new Date(updatedPosition.end_date) < new Date()
                ? "Completed"
                : "Active",
          },
        ]);
      }

      setSnackbar({
        open: true,
        message: `Position ${isEdit ? "updated" : "created"} successfully`,
        severity: "success",
      });
      handleCloseDialog();
    } catch (err) {
      console.error("Error submitting POR data:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to save position",
        severity: "error",
      });
    }
  };

  // Handle PrivilegeType form submission
  const handlePrivilegeSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/por2/privilege-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrivilegeType),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save privilege type");
      }

      const newPrivilege = await response.json();
      setPrivilegeTypes((prev) => [...prev, newPrivilege]);

      setSnackbar({
        open: true,
        message: "Privilege type created successfully",
        severity: "success",
      });
      handleClosePrivilegeDialog();
    } catch (err) {
      console.error("Error submitting privilege data:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to save privilege type",
        severity: "error",
      });
    }
  };

  // POR menu handlers
  const handleMenuClick = (event, position) => {
    setAnchorEl(event.currentTarget);
    setSelectedPosition(position);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open POR edit dialog
  const handleEdit = () => {
    setIsEdit(true);
    setNewPosition({
      user_id: selectedPosition.user_id?._id || "",
      privilegeTypeId: selectedPosition.privilegeTypeId?._id || "",
      start_date: selectedPosition.start_date
        ? formatDate(selectedPosition.start_date)
        : "",
      end_date: selectedPosition.end_date
        ? formatDate(selectedPosition.end_date)
        : "",
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  // Delete POR
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/por2/por/${selectedPosition._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete position");
      }

      setPositions((prev) =>
        prev.filter((pos) => pos._id !== selectedPosition._id)
      );

      setSnackbar({
        open: true,
        message: "Position deleted successfully",
        severity: "success",
      });
      handleMenuClose();
    } catch (err) {
      console.error("Error deleting POR:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete position",
        severity: "error",
      });
    }
  };

  // Open POR dialog
  const handleOpenDialog = () => {
    setIsEdit(false);
    setNewPosition({
      user_id: "",
      privilegeTypeId: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setOpenDialog(true);
  };

  // Close POR dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEdit(false);
  };

  // Open PrivilegeType dialog
  const handleOpenPrivilegeDialog = () => {
    setNewPrivilegeType({
      position: "",
      description: "",
      posts: false,
      events: false,
      projects: false,
      resources: false,
      opportunities: false,
      blogs: false,
      forums: false,
    });
    setOpenPrivilegeDialog(true);
  };

  // Close PrivilegeType dialog
  const handleClosePrivilegeDialog = () => {
    setOpenPrivilegeDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!currentUser || !managedOrganization) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Organization Details Card */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {managedOrganization.image && (
              <CardMedia
                component="img"
                sx={{ 
                  width: { xs: '100%', md: 300 }, 
                  height: { xs: 200, md: 'auto' },
                  objectFit: 'cover'
                }}
                image={`http://localhost:5000/uploads/${managedOrganization.image.filename}`}
                alt={`${managedOrganization.name} image`}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {managedOrganization.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={handleOpenOrgDialog}
                    sx={{ ml: 2 }}
                  >
                    Edit Details
                  </Button>
                </Box>
                
                <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                  <DescriptionIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {managedOrganization.description}
                </Typography>
                
                {managedOrganization.established_year && (
                  <Typography variant="body1" paragraph>
                    <CalendarIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Established: {managedOrganization.established_year}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Social Media Links
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {managedOrganization.social_media?.facebook && (
                    <Link href={managedOrganization.social_media.facebook} target="_blank" rel="noopener">
                      <Button variant="outlined" startIcon={<FacebookIcon />}>
                        Facebook
                      </Button>
                    </Link>
                  )}
                  {managedOrganization.social_media?.instagram && (
                    <Link href={managedOrganization.social_media.instagram} target="_blank" rel="noopener">
                      <Button variant="outlined" startIcon={<InstagramIcon />}>
                        Instagram
                      </Button>
                    </Link>
                  )}
                  {managedOrganization.social_media?.twitter && (
                    <Link href={managedOrganization.social_media.twitter} target="_blank" rel="noopener">
                      <Button variant="outlined" startIcon={<TwitterIcon />}>
                        Twitter
                      </Button>
                    </Link>
                  )}
                  {managedOrganization.social_media?.linkedin && (
                    <Link href={managedOrganization.social_media.linkedin} target="_blank" rel="noopener">
                      <Button variant="outlined" startIcon={<LinkedInIcon />}>
                        LinkedIn
                      </Button>
                    </Link>
                  )}
                  {managedOrganization.social_media?.youtube && (
                    <Link href={managedOrganization.social_media.youtube} target="_blank" rel="noopener">
                      <Button variant="outlined" startIcon={<YouTubeIcon />}>
                        YouTube
                      </Button>
                    </Link>
                  )}
                  {managedOrganization.social_media?.website && (
                    <Link href={managedOrganization.social_media.website} target="_blank" rel="noopener">
                      <Button variant="outlined" startIcon={<LanguageIcon />}>
                        Website
                      </Button>
                    </Link>
                  )}
                </Box>
              </CardContent>
            </Box>
          </Box>
        </Card>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ mb: 3 }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Positions"
            sx={{ fontWeight: "bold" }}
          />
          <Tab
            icon={<VpnKeyIcon />}
            iconPosition="start"
            label="Privilege Types"
            sx={{ fontWeight: "bold" }}
          />
        </Tabs>

        {/* Positions Tab */}
        {tabValue === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5">
                {organizationType === "club" ? "Club" : "Board"} Positions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                }}
              >
                Add New Position
              </Button>
            </Box>

            {/* Search Bar */}
            <Box sx={{ display: "flex", mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                  minWidth: "100px",
                }}
              >
                Search
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f3e5f5" }}>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPositions.length > 0 ? (
                      filteredPositions.map((position) => (
                        <TableRow key={position._id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ bgcolor: "#6a1b9a", mr: 2 }}>
                                {position.user?.charAt(0) || "U"}
                              </Avatar>
                              {position.user || "Unknown User"}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                "&:hover": {
                                  textDecoration: "underline",
                                  color: "#6a1b9a",
                                },
                              }}
                              onClick={() =>
                                (window.location.href = `mailto:${position.email}`)
                              }
                            >
                              <EmailIcon
                                sx={{ mr: 1, color: "#6a1b9a" }}
                                fontSize="small"
                              />
                              {position.email}
                            </Box>
                          </TableCell>
                          <TableCell>{position.position}</TableCell>
                          <TableCell>
                            {formatDate(position.start_date)} to{" "}
                            {formatDate(position.end_date)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={position.status}
                              size="small"
                              sx={{
                                backgroundColor:
                                  position.status === "Active"
                                    ? "#c8e6c9"
                                    : "#ffcdd2",
                                color:
                                  position.status === "Active"
                                    ? "#2e7d32"
                                    : "#c62828",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(e) => handleMenuClick(e, position)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No positions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Add/Edit Position Dialog */}
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>
                {isEdit ? "Edit Position" : "Add New Position"}
              </DialogTitle>
              <DialogContent>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>User</InputLabel>
                  <Select
                    name="user_id"
                    value={newPosition.user_id}
                    label="User"
                    onChange={handleInputChange}
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar sx={{ mr: 2, width: 24, height: 24 }}>
                            {user.name?.charAt(0) || "U"}
                          </Avatar>
                          {user.name} ({user.email_id})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Position</InputLabel>
                  <Select
                    name="privilegeTypeId"
                    value={newPosition.privilegeTypeId}
                    label="Position"
                    onChange={handleInputChange}
                  >
                    {privilegeTypes.map((privilege) => (
                      <MenuItem key={privilege._id} value={privilege._id}>
                        {privilege.position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      name="start_date"
                      value={newPosition.start_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      name="end_date"
                      value={newPosition.end_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    backgroundColor: "#6a1b9a",
                    "&:hover": { backgroundColor: "#4a148c" },
                  }}
                >
                  {isEdit ? "Update" : "Create"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Position Context Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}

        {/* Privilege Types Tab */}
        {tabValue === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5">Privilege Types</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenPrivilegeDialog}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                }}
              >
                New Privilege Type
              </Button>
            </Box>

            {/* Search Bar */}
            <Box sx={{ display: "flex", mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search privilege types..."
                value={privilegeSearchTerm}
                onChange={(e) => setPrivilegeSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={handlePrivilegeSearch}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": { backgroundColor: "#4a148c" },
                  minWidth: "100px",
                }}
              >
                Search
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f3e5f5" }}>
                    <TableRow>
                      <TableCell>Position Title</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Permissions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPrivilegeTypes.length > 0 ? (
                      filteredPrivilegeTypes.map((privilege) => (
                        <TableRow key={privilege._id}>
                          <TableCell>
                            <Typography fontWeight="medium">
                              {privilege.position}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {privilege.description || "No description"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {privilege.posts && (
                                <Chip label="Posts" size="small" />
                              )}
                              {privilege.events && (
                                <Chip label="Events" size="small" />
                              )}
                              {privilege.projects && (
                                <Chip label="Projects" size="small" />
                              )}
                              {privilege.resources && (
                                <Chip label="Resources" size="small" />
                              )}
                              {privilege.opportunities && (
                                <Chip label="Opportunities" size="small" />
                              )}
                              {privilege.blogs && (
                                <Chip label="Blogs" size="small" />
                              )}
                              {privilege.forums && (
                                <Chip label="Forums" size="small" />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No privilege types found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Add Privilege Dialog */}
            <Dialog
              open={openPrivilegeDialog}
              onClose={handleClosePrivilegeDialog}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>New Privilege Type</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  name="position"
                  label="Position Title"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newPrivilegeType.position}
                  onChange={handlePrivilegeInputChange}
                  required
                />

                <TextField
                  margin="dense"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newPrivilegeType.description}
                  onChange={handlePrivilegeInputChange}
                  multiline
                  rows={3}
                />

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Permissions
                </Typography>

                <Grid container spacing={2}>
                  {[
                    { name: "posts", label: "Posts" },
                    { name: "events", label: "Events" },
                    { name: "projects", label: "Projects" },
                    { name: "resources", label: "Resources" },
                    { name: "opportunities", label: "Opportunities" },
                    { name: "blogs", label: "Blogs" },
                    { name: "forums", label: "Forums" },
                  ].map((perm) => (
                    <Grid item xs={6} key={perm.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newPrivilegeType[perm.name]}
                            onChange={handlePrivilegeInputChange}
                            name={perm.name}
                          />
                        }
                        label={perm.label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClosePrivilegeDialog}>Cancel</Button>
                <Button
                  onClick={handlePrivilegeSubmit}
                  variant="contained"
                  sx={{
                    backgroundColor: "#6a1b9a",
                    "&:hover": { backgroundColor: "#4a148c" },
                  }}
                >
                  Create
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Organization Edit Dialog */}
        <Dialog
          open={openOrgDialog}
          onClose={() => setOpenOrgDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Edit {organizationType === "club" ? "Club" : "Board"} Details
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={newOrgData.name}
                onChange={handleOrgInputChange}
                variant="outlined"
                required
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newOrgData.description}
                onChange={handleOrgInputChange}
                variant="outlined"
                required
                multiline
                rows={4}
              />
              
              <TextField
                fullWidth
                label="Established Year"
                name="established_year"
                value={newOrgData.established_year}
                onChange={handleOrgInputChange}
                variant="outlined"
                placeholder="e.g. 2023"
              />
              
              {/* Social Media Links Section */}
              <Typography variant="subtitle1" fontWeight={500}>
                Social Media Links
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    name="facebook"
                    value={newOrgData.social_media.facebook}
                    onChange={handleOrgSocialMediaChange}
                    variant="outlined"
                    placeholder="Facebook profile URL"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    name="instagram"
                    value={newOrgData.social_media.instagram}
                    onChange={handleOrgSocialMediaChange}
                    variant="outlined"
                    placeholder="Instagram profile URL"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    name="twitter"
                    value={newOrgData.social_media.twitter}
                    onChange={handleOrgSocialMediaChange}
                    variant="outlined"
                    placeholder="Twitter profile URL"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    name="linkedin"
                    value={newOrgData.social_media.linkedin}
                    onChange={handleOrgSocialMediaChange}
                    variant="outlined"
                    placeholder="LinkedIn profile URL"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="YouTube"
                    name="youtube"
                    value={newOrgData.social_media.youtube}
                    onChange={handleOrgSocialMediaChange}
                    variant="outlined"
                    placeholder="YouTube channel URL"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={newOrgData.social_media.website}
                    onChange={handleOrgSocialMediaChange}
                    variant="outlined"
                    placeholder="Official website URL"
                  />
                </Grid>
              </Grid>
              
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {organizationType === "club" ? "Club" : "Board"} Image
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    variant="outlined"
                    component="label"
                  >
                    Upload New Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOrgFileChange}
                      hidden
                    />
                  </Button>
                  {newOrgData.image instanceof File && (
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      {newOrgData.image.name}
                    </Typography>
                  )}
                </Box>
                {!newOrgData.image && imagePreview && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography variant="caption">Current Image:</Typography>
                    <img
                      src={imagePreview}
                      alt="Current"
                      style={{ maxWidth: "100%", maxHeight: "200px", marginTop: "8px" }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOrgDialog(false)}>Cancel</Button>
            <Button
              onClick={handleOrgSubmit}
              variant="contained"
              color="primary"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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
    </Container>
  );
};

export default PORManagement;