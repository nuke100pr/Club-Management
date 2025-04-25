"use client";
import React, { useState, useEffect,useMemo } from "react";
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
  alpha,
  useTheme,
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
import { fetchUserData,hasPermission } from "@/utils/auth";

// ForumMembersDialog component with theme support
const ForumMembersDialog = ({ open, onClose, forumId }) => {
  const theme = useTheme();
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [searchNewMember, setSearchNewMember] = useState("");
  const [searchExistingMember, setSearchExistingMember] = useState("");

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/members`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch forum members");
      }
      const data = await response.json();
      console.log(data);
      setMembers(data.data);
    } catch (error) {
      console.error("Error fetching forum members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/users/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setAllUsers(data.users || data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/members/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove forum member");
      }

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
      const currentDate = new Date().toISOString();

      const addPromises = selectedUsers.map((userId) =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/members`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              forum_id: forumId,
              joined_at: currentDate,
            }),
          }
        )
      );

      const responses = await Promise.all(addPromises);
      const allOk = responses.every((response) => response.ok);

      if (!allOk) {
        throw new Error("Failed to add some forum members");
      }

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

  const availableUsers = allUsers.filter(
    (user) =>
      !members.some(
        (member) =>
          member.user_id?._id === user._id || // Compare with nested user_id._id
          member._id === user._id
      )
  );

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchNewMember.toLowerCase()) || // Direct name check
      user.email_id?.toLowerCase().includes(searchNewMember.toLowerCase()) // email_id instead of email
  );

  const filteredMembers = members.filter((member) => {
    const searchTerm = searchExistingMember.toLowerCase();

    // Check member's user_id.name
    if (member.user_id?.name?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check member's user_id.email_id
    if (member.user_id?.email_id?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check member's own _id as fallback
    if (member._id?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    return searchTerm === "";
  });
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
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(90deg, #8E54E9 0%, #4776E6 100%)"
                : "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 600,
          }}
        >
          Forum Members
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
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
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "8px",
                    boxShadow: theme.shadows[1],
                    "&:hover": {
                      boxShadow: theme.shadows[3],
                    },
                    "&.Mui-focused": {
                      boxShadow: theme.shadows[3],
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
                sx={{ mb: 2 }}
              />

              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  border: `1px solid ${theme.palette.divider}`,
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
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.05
                            ),
                          },
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={selectedUsers.includes(user._id)}
                          tabIndex={-1}
                          disableRipple
                          color="primary"
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
                  onClick={handleAddMember}
                  disabled={selectedUsers.length === 0 || addingMember}
                  sx={{
                    minWidth: 100,
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(90deg, #8E54E9 0%, #4776E6 100%)"
                        : "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                    color: "white",
                    fontWeight: 500,
                    borderRadius: "8px",
                    boxShadow: theme.shadows[2],
                    padding: "8px 16px",
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        theme.palette.mode === "dark"
                          ? "linear-gradient(90deg, #7b3dc1 0%, #3a5fc0 100%)"
                          : "linear-gradient(90deg, #3a5fc0 0%, #7b3dc1 100%)",
                      boxShadow: theme.shadows[4],
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {addingMember ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Add (${selectedUsers.length})`
                  )}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
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
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "8px",
                  boxShadow: theme.shadows[1],
                  "&:hover": {
                    boxShadow: theme.shadows[3],
                  },
                  "&.Mui-focused": {
                    boxShadow: theme.shadows[3],
                    borderColor: theme.palette.primary.main,
                  },
                },
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
                  <React.Fragment key={member._id}>
                    <ListItem
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                        },
                      }}
                    >
                      <ListItemText
                        primary={member.user_id?.name || "Unknown User"}
                        secondary={
                          <>
                            {member.user_id?.email_id && (
                              <span>{member.user_id.email_id}</span>
                            )}
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
                          onClick={() => handleRemoveMember(member.user_id._id)}
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
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            borderRadius: "8px",
            padding: "8px 16px",
            textTransform: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              borderColor: theme.palette.primary.dark,
              transform: "translateY(-2px)",
            },
          }}
        >
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
  const theme = useTheme();
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}`,
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

  const tagColors = [
    "#2196F3",
    "#4CAF50",
    "#FF9800",
    "#9C27B0",
    "#F44336",
    "#00BCD4",
    "#673AB7",
    "#3F51B5",
  ];

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        boxShadow: theme.shadows[2],
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: theme.shadows[6],
        },
        borderTop: "4px solid",
        borderColor: theme.palette.primary.main,
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/Uploads/${forum.image.filename}` ||
          "https://via.placeholder.com/350x160"
        }
        alt={forum.title}
        sx={{ borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
      />
      <Box p={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            {forum.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {hasPermission[forum._id] && (
              <>
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
              </>
            )}
            <Tooltip
              title={
                forum.public_or_private === "private" ? "Private" : "Public"
              }
            >
              <IconButton size="small">
                {forum.public_or_private === "private" ? (
                  <LockIcon fontSize="small" color="error" />
                ) : (
                  <PublicIcon fontSize="small" color="success" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {boardName && (
            <Chip
              label={boardName}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.65rem",
                backgroundColor: alpha("#4CAF50", 0.1),
                color: "#4CAF50",
                "& .MuiChip-label": {
                  padding: "0 8px",
                },
              }}
            />
          )}
          {clubName && (
            <Chip
              label={clubName}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.65rem",
                backgroundColor: alpha("#FF5722", 0.1),
                color: "#FF5722",
                "& .MuiChip-label": {
                  padding: "0 8px",
                },
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
                  height: 22,
                  fontSize: "0.65rem",
                  backgroundColor: alpha(getTagColor(index), 0.1),
                  color: getTagColor(index),
                  "& .MuiChip-label": {
                    padding: "0 8px",
                  },
                }}
              />
            ))}
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            minHeight: "40px",
          }}
        >
          {truncateText(forum.description)}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${theme.palette.divider}`,
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
            onClick={() =>
              onViewForum(forum._id, forum.public_or_private === "private")
            }
            sx={{
              flexGrow: 1,
              py: 1,
              fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(90deg, #8E54E9 0%, #4776E6 100%)"
                  : "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              color: "white",
              fontWeight: 500,
              borderRadius: "8px",
              boxShadow: theme.shadows[2],
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(90deg, #7b3dc1 0%, #3a5fc0 100%)"
                    : "linear-gradient(90deg, #3a5fc0 0%, #7b3dc1 100%)",
                boxShadow: theme.shadows[4],
                transform: "translateY(-2px)",
              },
            }}
          >
            VIEW DISCUSSION
          </Button>

          {(hasPermission[forum._id] && (<Button
            onClick={() => onViewMembers(forum._id)}
            sx={{
              py: 1,
              minWidth: "auto",
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              borderRadius: "8px",
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderColor: theme.palette.primary.dark,
                transform: "translateY(-2px)",
              },
            }}
          >
            <PeopleIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
          </Button>))}
        </Box>
      </Box>
    </Card>
  );
};

const ForumList = ({ boards: propBoards = {}, clubs: propClubs = {} }) => {
  const theme = useTheme();
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
  const [arrayPermissions, setArrayPermissions] = useState({});
  const router = useRouter();

  const checkMembership = async (forumId, userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/membership/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to check membership");
      }
      return await response.json();
    } catch (error) {
      console.error("Error checking membership:", error);
      return { isMember: false };
    }
  };

  const sampleBoards = {
    "65f1a2b3c4d5e6f7890pqrst": "Arts & Culture",
    board2: "Technology & Innovation",
  };

  const sampleClubs = {
    "65f1a2b3c4d5e6f7890klmno": "Photography Club",
    club2: "Coding Club",
    club3: "Music Club",
  };

  useEffect(() => {
    async function loadUserData() {
      const result = await fetchUserData();

      if (result) {
        setUserData(result.userData);
        setUserId(result.userId);
        setIsSuperAdmin(result.isSuperAdmin);

        if (result.userData?.data?.clubs) {
          const clubsWithPermission = Object.keys(
            result.userData.data.clubs
          ).filter(
            (clubId) => result.userData.data.clubs[clubId].forums === true
          );
          setUserClubsWithForumPermission(clubsWithPermission);
        }

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

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/api/forums`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch forums");
        }
        const data = await response.json();
        console.log(data);
        setForums(data.data);
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    fetchForums();
  }, []);

  const handleViewForum = async (forumId, isPrivate) => {
    // Only check membership if userId exists
    if (userId) {
      const membershipStatus = await checkMembership(forumId, userId);

      if (membershipStatus?.data?.isMember) {
        // Member can access any forumc
        console.log("kvndkv");
        router.push(`/current_forum/${forumId}`);
      } else if (isPrivate) {
        // Private forum and not a member - show error message
        // You could use a state variable to display a modal/alert here
        alert("This is a private forum. You need to be a member to access it.");
      } else {
        // Public forum and not a member - redirect to a page with join option
        router.push(`/forum_join/${forumId}`);
      }
    } else {
      // Handle not logged in case
      alert("Please log in to view forums");
      // Optionally redirect to login
      // router.push('/login');
    }
  };

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newForum),
        }
      );

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

    const filteredForums = useMemo(() => {
      return forums?.filter(
        (forum) =>
          forum.title.toLowerCase().includes(search.toLowerCase()) &&
          (!selectedBoard || forum.board_id === selectedBoard) &&
          (!selectedClub || forum.club_id === selectedClub) &&
          (!privacyFilter || forum.public_or_private === privacyFilter)
      );
    }, [forums, search, selectedBoard, selectedClub, privacyFilter]);

    useEffect(() => {
      // Check permissions for all resources
      if (userData && filteredForums.length > 0) {
        filteredForums.forEach(async (element) => {
          const clubId = element.club_id?._id || element.club_id;
          const boardId = element.board_id?._id || element.board_id;
  
          // If you must use the async version of hasPermission
          const hasAccess = await hasPermission(
            "forums",
            userData,
            boardId,
            clubId
          );
  
          setArrayPermissions((prev) => ({
            ...prev,
            [element._id]: hasAccess,
          }));
        });
      }
    }, [userData, filteredForums]);

  const defaultContext = getDefaultClubOrBoardId();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1600, mx: "auto" }}>
        <SearchAndFilter
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          availableBoards={availableBoards}
          availableClubs={availableClubs}
        />

        <Grid
          container
          spacing={{ xs: 2, sm: 3, md: 4 }}
          sx={{ mt: { xs: 4, sm: 8, md: 12 } }}
        >
          {filteredForums.map((forum) => (
            <Grid item key={forum._id} xs={12} sm={6} md={4} lg={3} xl={3}>
              <ForumCard
                forum={forum}
                boardName={availableBoards[forum.board_id]}
                clubName={availableClubs[forum.club_id]}
                onViewForum={handleViewForum}
                onViewMembers={handleViewMembers}
                onDeleteForum={handleDeleteForum}
                hasPermission={arrayPermissions}
              />
            </Grid>
          ))}
        </Grid>

        {/* Keep the dialog components as they are */}
        {createForumOpen && (
          <ForumCreateDialog
            open={createForumOpen}
            onClose={handleCreateForumToggle}
            onCreateForum={handleCreateForum}
            userId={userId}
            board_id={selectedBoard}
            club_id={selectedClub}
          />
        )}

        {membersDialogOpen && (
          <ForumMembersDialog
            open={membersDialogOpen}
            onClose={handleCloseMembersDialog}
            forumId={selectedForumId}
          />
        )}
      </Box>
    </Box>
  );
};

export default ForumList;
