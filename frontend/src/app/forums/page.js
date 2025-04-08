"use client";
import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Tooltip,
  Fab,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  TextField,
  CircularProgress,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommentIcon from "@mui/icons-material/Comment";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SearchAndFilter from "../../components/forums/SearchAndFilter";
import ForumCreateDialog from "../../components/forums/ForumCreateDialog";
import Navbar from "../../components/Navbar";
import { fetchUserData } from "@/utils/auth";

// ForumMembersDialog component to show and manage forum members
const ForumMembersDialog = ({ open, onClose, forumId }) => {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [searchNewMember, setSearchNewMember] = useState("");
  const [searchExistingMember, setSearchExistingMember] = useState("");

  // Fetch forum members when dialog opens
  useEffect(() => {
    if (open && forumId) {
      fetchMembers();
      fetchAllUsers();
    }
  }, [open, forumId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/forums2/forums/${forumId}/members`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch forum members");
      }
      const data = await response.json();
      setMembers(data.members || data); // Handle both response formats
    } catch (error) {
      console.error("Error fetching forum members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/users/`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setAllUsers(data.users || data); // Handle both response formats
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/forums2/forums/${forumId}/members/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove forum member");
      }

      // Update the members list after successful removal
      setMembers(
        members.filter(
          (member) => member._id !== userId || member.user_id !== userId
        )
      );
      await fetchMembers();
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error removing forum member:", error);
    }
  };

  const handleAddMember = async () => {
    if (selectedUsers.length === 0) return;

    setAddingMember(true);
    try {
      // Create current date for joined_at field
      const currentDate = new Date().toISOString();

      // Add all selected users
      const addPromises = selectedUsers.map((userId) =>
        fetch(`http://localhost:5000/forums2/forums/${forumId}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            forum_id: forumId,
            joined_at: currentDate,
          }),
        })
      );

      const responses = await Promise.all(addPromises);
      const allOk = responses.every((response) => response.ok);

      if (!allOk) {
        throw new Error("Failed to add some forum members");
      }

      // Refresh members list
      await fetchMembers();
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error adding forum members:", error);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Filter out users who are already members
  const availableUsers = allUsers.filter(
    (user) =>
      !members.some(
        (member) => member.user_id === user._id || member._id === user._id
      )
  );

  // Filter available users based on search term
  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchNewMember.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchNewMember.toLowerCase())
  );

  const filteredMembers = members.filter((member) => {
    const searchTerm = searchExistingMember.toLowerCase();

    // Check name if it exists
    if (member.name && member.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check email if it exists
    if (member.email && member.email.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check user_id as fallback
    if (member.user_id && member.user_id.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // If no search term is provided, show all members
    return searchTerm === "";
  });

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Forum Members</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Add New Members
              </Typography>

              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search users..."
                value={searchNewMember}
                onChange={(e) => setSearchNewMember(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  border: "1px solid #eee",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {filteredAvailableUsers.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 1 }}
                  >
                    {searchNewMember
                      ? "No matching users found"
                      : "No users available to add"}
                  </Typography>
                ) : (
                  <List dense>
                    {filteredAvailableUsers.map((user) => (
                      <ListItem
                        key={user._id}
                        button="true"
                        onClick={() => handleUserSelect(user._id)}
                      >
                        <Checkbox
                          edge="start"
                          checked={selectedUsers.includes(user._id)}
                          tabIndex={-1}
                          disableRipple
                        />
                        <ListItemText
                          primary={user.name || user._id}
                          secondary={user.email}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disabled={selectedUsers.length === 0 || addingMember}
                  sx={{ minWidth: 100 }}
                >
                  {addingMember ? (
                    <CircularProgress size={24} />
                  ) : (
                    `Add (${selectedUsers.length})`
                  )}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              Current Members ({members.length})
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search members..."
              value={searchExistingMember}
              onChange={(e) => setSearchExistingMember(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {filteredMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No members found for this forum.
              </Typography>
            ) : (
              <List>
                {filteredMembers.map((member) => (
                  <React.Fragment key={member._id || member.user_id}>
                    <ListItem>
                      <ListItemText
                        primary={member.name || member.user_id}
                        secondary={
                          <>
                            {member.email && <span>{member.email}</span>}
                            {member.joined_at && (
                              <span style={{ display: "block" }}>
                                Joined: {formatDate(member.joined_at)}
                              </span>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ForumCard = ({
  forum,
  boardName,
  clubName,
  onViewForum,
  onViewMembers,
  onDeleteForum,
  hasPermission,
}) => {
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const handleEdit = (forumId) => {
    console.log(`Edit forum ${forumId}`);
  };

  const handleDelete = async (forumId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/forums2/forums/${forumId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete forum");
      }

      onDeleteForum(forumId);
    } catch (error) {
      console.error("Error deleting forum:", error);
    }
  };

  // Array of colors for tags
  const tagColors = [
    "#2196F3", // Blue
    "#4CAF50", // Green
    "#FF9800", // Orange
    "#9C27B0", // Purple
    "#F44336", // Red
    "#00BCD4", // Cyan
    "#673AB7", // Deep Purple
    "#3F51B5", // Indigo
    "#009688", // Teal
    "#CDDC39", // Lime
    "#607D8B", // Blue Grey
  ];

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <Card
      sx={{
        width: 350,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        borderRadius: 2,
        mb: 2,
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={
          `http://localhost:5000/uploads/${forum.image.filename}` ||
          "https://via.placeholder.com/350x140"
        }
        alt={forum.title}
      />
      <Box p={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {forum.title}
          </Typography>
          {hasPermission && (
            <Box>
              <IconButton
                onClick={() => handleEdit(forum._id)}
                color="primary"
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(forum._id)}
                color="error"
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <Tooltip
            title={forum.public_or_private === "private" ? "Private" : "Public"}
          >
            <IconButton size="small" sx={{ ml: 1 }}>
              {forum.public_or_private === "private" ? (
                <LockIcon fontSize="small" />
              ) : (
                <PublicIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {boardName && (
            <Chip
              label={boardName}
              size="small"
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
              }}
            />
          )}
          {clubName && (
            <Chip
              label={clubName}
              size="small"
              sx={{
                backgroundColor: "#FF5722",
                color: "white",
              }}
            />
          )}

          {forum.tags &&
            forum.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: getTagColor(index),
                  color: "white",
                }}
              />
            ))}
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {truncateText(forum.description)}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #eee",
            pt: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <VisibilityIcon
              fontSize="small"
              sx={{ mr: 0.5, color: "text.secondary" }}
            />
            <Typography variant="body2" color="text.secondary">
              {forum.number_of_views.trim()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CommentIcon
              fontSize="small"
              sx={{ mr: 0.5, color: "text.secondary" }}
            />
            <Typography variant="body2" color="text.secondary">
              {forum.number_of_replies.trim()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onViewForum(forum._id)}
            sx={{
              flexGrow: 1,
              borderRadius: 2,
              textTransform: "none",
              py: 1.5,
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                backgroundColor: "transparent",
                borderColor: "#1976d2",
                opacity: 0.8,
              },
            }}
          >
            VIEW DISCUSSION
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => onViewMembers(forum._id)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.5,
              borderColor: "#9c27b0",
              color: "#9c27b0",
              "&:hover": {
                backgroundColor: "transparent",
                borderColor: "#9c27b0",
                opacity: 0.8,
              },
            }}
          >
            <PeopleIcon sx={{ mr: 0.5 }} fontSize="small" />
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

const ForumList = ({ boards: propBoards = {}, clubs: propClubs = {} }) => {
  const [forums, setForums] = useState([]);
  const [search, setSearch] = useState("");
  const [createForumOpen, setCreateForumOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [privacyFilter, setPrivacyFilter] = useState(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedForumId, setSelectedForumId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userClubsWithForumPermission, setUserClubsWithForumPermission] =
    useState([]);
  const [userBoardsWithForumPermission, setUserBoardsWithForumPermission] =
    useState([]);
  const router = useRouter();

  const sampleBoards = {
    "65f1a2b3c4d5e6f7890pqrst": "Arts & Culture",
    board2: "Technology & Innovation",
  };

  const sampleClubs = {
    "65f1a2b3c4d5e6f7890klmno": "Photography Club",
    club2: "Coding Club",
    club3: "Music Club",
  };

  // Fetch user data on mount
  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        // Extract clubs with forums permission
        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) => result.userData.data.clubs[clubId].forums === true
          );
          setUserClubsWithForumPermission(clubsWithPermission);
        }

        // Extract boards with forums permission
        if (result.userData?.data?.boards) {
          const boardsWithPermission = Object.keys(
            result.userData.data.boards
          ).filter(
            (boardId) => result.userData.data.boards[boardId].forums === true
          );
          setUserBoardsWithForumPermission(boardsWithPermission);
        }
      }
    }
    loadUserData();
  }, []);

  // Check if user has permission to edit/delete a forum
  const hasForumPermission = (forum) => {
    // Superadmins have all permissions
    if (isSuperAdmin) return true;

    // Check if forum belongs to a club where user has permission
    if (forum.club_id) {
      const clubId = forum.club_id._id || forum.club_id;
      if (userClubsWithForumPermission.includes(clubId)) {
        return true;
      }
    }

    // Check if forum belongs to a board where user has permission
    if (forum.board_id) {
      const boardId = forum.board_id._id || forum.board_id;
      if (userBoardsWithForumPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  // Check if user can create forums
  const canCreateForums = () => {
    return (
      isSuperAdmin ||
      userClubsWithForumPermission.length > 0 ||
      userBoardsWithForumPermission.length > 0
    );
  };

  // Get the first club or board ID where user has permission
  const getDefaultClubOrBoardId = () => {
    if (userClubsWithForumPermission.length > 0) {
      return {
        type: "club",
        id: userClubsWithForumPermission[0],
      };
    }
    if (userBoardsWithForumPermission.length > 0) {
      return {
        type: "board",
        id: userBoardsWithForumPermission[0],
      };
    }
    return null;
  };

  // Fetch forums from API
  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/forums2/api/forums"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch forums");
        }
        const data = await response.json();
        console.log(data);
        setForums(data);
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    fetchForums();
  }, []);

  // Function to handle navigation to the forum page
  const handleViewForum = (forumId) => {
    router.push(`/current_forum/${forumId}`);
  };

  // Function to handle opening members dialog
  const handleViewMembers = (forumId) => {
    setSelectedForumId(forumId);
    setMembersDialogOpen(true);
  };

  const handleCloseMembersDialog = () => {
    setMembersDialogOpen(false);
  };

  const handleCreateForumToggle = () => {
    setCreateForumOpen(!createForumOpen);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleFilterChange = (filters) => {
    setSelectedBoard(filters.board);
    setSelectedClub(filters.club);
    setPrivacyFilter(filters.privacy);
  };

  const handleDeleteForum = (forumId) => {
    setForums(forums.filter((forum) => forum._id !== forumId));
  };

  const handleCreateForum = async (newForum) => {
    try {
      const response = await fetch("http://localhost:5000/forums2/forums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newForum),
      });

      if (!response.ok) {
        throw new Error("Failed to create forum");
      }

      const createdForum = await response.json();
      setForums([...forums, createdForum]);
      setCreateForumOpen(false);
    } catch (error) {
      console.error("Error creating forum:", error);
    }
  };

  const availableBoards = Object.keys(propBoards).length
    ? propBoards
    : sampleBoards;
  const availableClubs = Object.keys(propClubs).length
    ? propClubs
    : sampleClubs;

  const filteredForums = forums.filter(
    (forum) =>
      forum.title.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedBoard || forum.board_id === selectedBoard) &&
      (!selectedClub || forum.club_id === selectedClub) &&
      (!privacyFilter || forum.public_or_private === privacyFilter)
  );

  const defaultContext = getDefaultClubOrBoardId();

  return (
    <div>

      <>
        <Box sx={{ position: "relative", minHeight: "100vh", pb: 8 }}>
          <SearchAndFilter
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            availableBoards={availableBoards}
            availableClubs={availableClubs}
          />

          <Grid container spacing={3} sx={{ px: 2 }}>
            {filteredForums.map((forum) => (
              <Grid item key={forum._id}>
                <ForumCard
                  forum={forum}
                  boardName={availableBoards[forum.board_id]}
                  clubName={availableClubs[forum.club_id]}
                  onViewForum={handleViewForum}
                  onViewMembers={handleViewMembers}
                  onDeleteForum={handleDeleteForum}
                  hasPermission={hasForumPermission(forum)}
                />
              </Grid>
            ))}
          </Grid>

          {false && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleCreateForumToggle}
              sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
              }}
            >
              <AddIcon />
            </Fab>
          )}

          {createForumOpen && (
            <ForumCreateDialog
              open={createForumOpen}
              onClose={handleCreateForumToggle}
              onCreateForum={handleCreateForum}
              userId={userId}
              board_id={selectedBoard} // pass the selected board_id
              club_id={selectedClub} // pass the selected club_id
            />
          )}

          {/* Forum Members Dialog */}
          {membersDialogOpen && (
            <ForumMembersDialog
              open={membersDialogOpen}
              onClose={handleCloseMembersDialog}
              forumId={selectedForumId}
            />
          )}
        </Box>
      </>
    </div>
  );
};

export default ForumList;
