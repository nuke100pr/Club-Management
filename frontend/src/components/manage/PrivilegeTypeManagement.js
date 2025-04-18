"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Grid,
  FormControlLabel,
  Checkbox,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";

const PrivilegeTypeManagement = ({
  privilegeTypes,
  loading,
  onAddPrivilegeType,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [privilegeSearchTerm, setPrivilegeSearchTerm] = useState("");
  const [filteredPrivilegeTypes, setFilteredPrivilegeTypes] = useState(privilegeTypes);
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

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewPrivilegeType((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenDialog = () => {
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = () => {
    onAddPrivilegeType(newPrivilegeType);
    handleCloseDialog();
  };

  return (
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
          onClick={handleOpenDialog}
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
        open={openDialog}
        onClose={handleCloseDialog}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
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
  );
};

export default PrivilegeTypeManagement;