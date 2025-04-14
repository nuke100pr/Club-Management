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
  Paper,
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
import ForumCreateDialog from "../../components/forums/ForumCreateDialog";
import { fetchUserData } from "@/utils/auth";

const ForumMembersDialog = ({ open, onClose, forumId }) => {
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
        `http://localhost:5000/forums2/forums/${forumId}/members`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch forum members");
      }
      const data = await response.json();
      setMembers(data.members || data);
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
      setAllUsers(data.users || data);
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
        (member) => member.user_id === user._id || member._id === user._id
      )
  );

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchNewMember.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchNewMember.toLowerCase())
  );

  const filteredMembers = members.filter((member) => {
    const searchTerm = searchExistingMember.toLowerCase();

    if (member.name && member.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    if (member.email && member.email.toLowerCase().includes(searchTerm)) {
      return true;
    }

    if (member.user_id && member.user_id.toLowerCase().includes(searchTerm)) {
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 12px 24px rgba(95, 150, 230, 0.15)",
          overflow: "hidden"
        }
      }}
    >
      <DialogTitle sx={{ 
        background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)", 
        color: "white",
        fontWeight: 600,
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif"
      }}>
        Forum Members
      </DialogTitle>
      <DialogContent sx={{ p: 3, bgcolor: "#f8faff" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress sx={{ color: "#4776E6" }} />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif"
                }}
              >
                Add New Members
              </Typography>

              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users..."
                value={searchNewMember}
                onChange={(e) => setSearchNewMember(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#607080" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "white",
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
              />

              <Paper
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
                  bgcolor: "white",
                }}
              >
                {filteredAvailableUsers.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="#607080"
                    sx={{ p: 3, textAlign: "center" }}
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
                          borderRadius: 1,
                          transition: "background-color 0.3s ease",
                          "&:hover": {
                            bgcolor: "rgba(95, 150, 230, 0.05)",
                          },
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={selectedUsers.includes(user._id)}
                          tabIndex={-1}
                          disableRipple
                          sx={{
                            color: "#4776E6",
                            "&.Mui-checked": {
                              color: "#4776E6",
                            },
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography 
                              sx={{ 
                                fontWeight: 500, 
                                color: "#2A3B4F",
                                fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif"
                              }}
                            >
                              {user.name || user._id}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              sx={{ color: "#607080" }}
                            >
                              {user.email}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disabled={selectedUsers.length === 0 || addingMember}
                  sx={{
                    minWidth: 120,
                    py: 1,
                    px: 3,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                    boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                    fontWeight: 500,
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                    "&:hover": {
                      boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                      transform: "translateY(-1px)",
                      background: "linear-gradient(135deg, #3a5fc0 0%, #7b46cd 100%)",
                    },
                    "&:disabled": {
                      background: "linear-gradient(135deg, #a3b8e0 0%, #c5aee0 100%)",
                      boxShadow: "none",
                    },
                  }}
                >
                  {addingMember ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    `Add (${selectedUsers.length})`
                  )}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography 
              variant="h5" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif"
              }}
            >
              Current Members ({members.length})
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search members..."
              value={searchExistingMember}
              onChange={(e) => setSearchExistingMember(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#607080" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "white",
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
            />

            {filteredMembers.length === 0 ? (
              <Typography 
                variant="body2" 
                color="#607080"
                sx={{ p: 3, textAlign: "center" }}
              >
                No members found for this forum.
              </Typography>
            ) : (
              <Paper
                sx={{
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
                  bgcolor: "white",
                }}
              >
                <List>
                  {filteredMembers.map((member) => (
                    <React.Fragment key={member._id || member.user_id}>
                      <ListItem
                        sx={{
                          transition: "background-color 0.3s ease",
                          "&:hover": {
                            bgcolor: "rgba(95, 150, 230, 0.05)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography 
                              sx={{ 
                                fontWeight: 500, 
                                color: "#2A3B4F",
                                fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif"
                              }}
                            >
                              {member.name || member.user_id}
                            </Typography>
                          }
                          secondary={
                            <>
                              {member.email && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ color: "#607080", display: "block" }}
                                >
                                  {member.email}
                                </Typography>
                              )}
                              {member.joined_at && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: "#607080", 
                                    display: "block",
                                    fontSize: "0.75rem"
                                  }}
                                >
                                  Joined: {formatDate(member.joined_at)}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleRemoveMember(member.user_id)}
                            sx={{
                              color: "#d32f2f",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "rgba(211, 47, 47, 0.08)",
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f8faff" }}>
        <Button 
          onClick={onClose} 
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            color: "#4776E6",
            borderColor: "#4776E6",
            fontWeight: 500,
            textTransform: "none",
            transition: "all 0.3s ease",
            fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
            "&:hover": {
              borderColor: "#3a5fc0",
              backgroundColor: "rgba(71, 118, 230, 0.05)",
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

  // Modern tag colors
  const tagColors = [
    "#4776E6", // primary blue
    "#8E54E9", // secondary purple
    "#2D9CDB", // light blue
    "#9B51E0", // lavender
    "#F2994A", // orange
    "#6FCF97", // green
    "#EB5757", // red
    "#56CCF2", // cyan
    "#BB6BD9", // pink
    "#219653", // forest green
    "#607D8B", // blue-gray
  ];

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <Card
      sx={{
        width: 350,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(95, 150, 230, 0.1)",
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 20px rgba(95, 150, 230, 0.2)"
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
          zIndex: 1
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={
          `http://localhost:5000/uploads/${forum.image?.filename}` ||
          "https://via.placeholder.com/350x140"
        }
        alt={forum.title}
        sx={{
          objectFit: "cover",
        }}
      />
      <Box p={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: "#2A3B4F",
              fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif"
            }}
          >
            {forum.title}
          </Typography>
          <Box sx={{ display: "flex" }}>
            {hasPermission && (
              <>
                <IconButton
                  onClick={() => handleEdit(forum._id)}
                  sx={{
                    color: "#4776E6",
                    p: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(71, 118, 230, 0.1)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(forum._id)}
                  sx={{
                    color: "#d32f2f",
                    p: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
            <Tooltip
              title={forum.public_or_private === "private" ? "Private" : "Public"}
            >
              <IconButton size="small" sx={{ ml: 1, color: forum.public_or_private === "private" ? "#607080" : "#4776E6" }}>
                {forum.public_or_private === "private" ? (
                  <LockIcon fontSize="small" />
                ) : (
                  <PublicIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2 }}>
          {boardName && (
            <Chip
              label={boardName}
              size="small"
              sx={{
                backgroundColor: "rgba(71, 118, 230, 0.1)",
                color: "#4776E6",
                fontWeight: 500,
                fontSize: "0.65rem",
                height: "22px",
                borderRadius: "8px",
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          )}
          {clubName && (
            <Chip
              label={clubName}
              size="small"
              sx={{
                backgroundColor: "rgba(142, 84, 233, 0.1)",
                color: "#8E54E9",
                fontWeight: 500,
                fontSize: "0.65rem",
                height: "22px",
                borderRadius: "8px",
                "& .MuiChip-label": {
                  px: 1,
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
                  backgroundColor: `${getTagColor(index)}15`, // 15% opacity
                  color: getTagColor(index),
                  fontWeight: 500,
                  fontSize: "0.65rem",
                  height: "22px",
                  borderRadius: "8px",
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            ))}
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2,
            color: "#607080",
            fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
            lineHeight: 1.6
          }}
        >
          {truncateText(forum.description, 120)}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(95, 150, 230, 0.1)",
            pt: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <VisibilityIcon
              fontSize="small"
              sx={{ mr: 0.5, color: "#607080", fontSize: "1rem" }}
            />
            <Typography variant="body2" color="#607080">
              {forum.number_of_views?.trim() || "0"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CommentIcon
              fontSize="small"
              sx={{ mr: 0.5, color: "#607080", fontSize: "1rem" }}
            />
            <Typography variant="body2" color="#607080">
              {forum.number_of_replies?.trim() || "0"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => onViewForum(forum._id)}
            sx={{
              flexGrow: 1,
              borderRadius: 2,
              textTransform: "none",
              py: 1.5,
              fontWeight: 500,
              background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
              boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
              fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                transform: "translateY(-2px)",
                background: "linear-gradient(135deg, #3a5fc0 0%, #7b46cd 100%)",
              },
            }}
          >
            View Discussion
          </Button>

          <Button
            variant="outlined"
            onClick={() => onViewMembers(forum._id)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.5,
              minWidth: "50px",
              borderColor: "#8E54E9",
              color: "#8E54E9",
              fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
              fontWeight: 500,
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#7b46cd",
                backgroundColor: "rgba(142, 84, 233, 0.05)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <PeopleIcon sx={{ fontSize: "1.2rem" }} />
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

const ForumList = ({
  boards: propBoards = {},
  clubs: propClubs = {},
  boardId: propBoardId = null,
}) => {
  const [forums, setForums] = useState([]);
  const [search, setSearch] = useState("");
  const [createForumOpen, setCreateForumOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(propBoardId);
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

  const hasForumPermission = (forum) => {
    if (isSuperAdmin) return true;

    if (forum.club_id) {
      const clubId = forum.club_id._id || forum.club_id;
      if (userClubsWithForumPermission.includes(clubId)) {
        return true;
      }
    }

    if (forum.board_id) {
      const boardId = forum.board_id._id || forum.board_id;
      if (userBoardsWithForumPermission.includes(boardId)) {
        return true;
      }
    }

    return false;
  };

  const canCreateForums = () => {
    if (propBoardId) {
      if (userBoardsWithForumPermission.includes(propBoardId)) {
        return true;
      }
      return isSuperAdmin;
    }
    return false;
  };

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
          "http://localhost:5000/forums2/api/forums"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch forums");
        }
        const data = await response.json();
        setForums(data);
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    fetchForums();
  }, []);

  const handleViewForum = (forumId) => {
    router.push(`/current_forum/${forumId}`);
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
    if (!propBoardId) {
      setSelectedBoard(filters.board);
    }
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
      (propBoardId ? forum.board_id === propBoardId : true) &&
      (!selectedBoard || forum.board_id === selectedBoard) &&
      (!selectedClub || forum.club_id === selectedClub) &&
      (!privacyFilter || forum.public_or_private === privacyFilter)
  );

  const defaultContext = getDefaultClubOrBoardId();

  return (
    <div>
      <Box sx={{ position: "relative", minHeight: "100vh", pb: 8 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Paper
              sx={{
                p: 2,
                position: "sticky",
                top: 80,
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: 3,
                borderRadius: 2,
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                label="Search Forums"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Grid container spacing={3} sx={{ px: 2 }}>
              {filteredForums.length > 0 ? (
                filteredForums.map((forum) => (
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
                ))
              ) : (
                <Box sx={{ width: "100%", textAlign: "center", p: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No forums found
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>

        {canCreateForums() && (
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
            board_id={propBoardId || selectedBoard}
            club_id={selectedClub}
            disableBoardSelection={!!propBoardId}
          />
        )}

        <ForumMembersDialog
          open={membersDialogOpen}
          onClose={handleCloseMembersDialog}
          forumId={selectedForumId}
        />
      </Box>
    </div>
  );
};

export default ForumList;
