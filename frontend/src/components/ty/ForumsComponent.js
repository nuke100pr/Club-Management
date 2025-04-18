"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Skeleton,
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
import SearchIcon from "@mui/icons-material/Search";
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
      // Update this line to handle the response structure correctly
      setMembers(data.data || data.members || data);
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
        members.filter((member) => {
          const memberId = member.user_id?._id || member._id;
          return memberId !== userId;
        })
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

  const availableUsers = (Array.isArray(allUsers) ? allUsers : []).filter(
    (user) => {
      // Ensure user exists and has _id
      if (!user?._id) return false;

      return !(Array.isArray(members) ? members : []).some((member) => {
        // Safely get member's user ID from either structure
        const memberUserId = member?.user_id?._id || member?._id;
        // Compare only if both IDs exist
        return memberUserId && user._id && memberUserId === user._id;
      });
    }
  );

  const filteredAvailableUsers = (
    Array.isArray(availableUsers) ? availableUsers : []
  ).filter((user) => {
    // Return all if empty search
    if (!searchNewMember?.trim()) return true;

    const searchTerm = searchNewMember.toLowerCase().trim();

    // Safely check name and email
    const userName = user?.name?.toString().toLowerCase() || "";
    const userEmail = user?.email?.toString().toLowerCase() || "";

    return userName.includes(searchTerm) || userEmail.includes(searchTerm);
  });

  const filteredMembers = (Array.isArray(members) ? members : []).filter(
    (member) => {
      // Return all if empty search
      if (!searchExistingMember?.trim()) return true;

      const searchTerm = searchExistingMember.toLowerCase().trim();

      // Safely get name from either structure
      const memberName = (member?.name || member?.user_id?.name || "")
        .toString()
        .toLowerCase();

      // Safely get email from either structure
      const memberEmail = (member?.email || member?.user_id?.email || "")
        .toString()
        .toLowerCase();

      return (
        memberName.includes(searchTerm) || memberEmail.includes(searchTerm)
      );
    }
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMemberDisplayName = (member) => {
    return member.user_id?.name || member.name || "Unknown User";
  };

  const getMemberEmail = (member) => {
    return (
      member.user_id?.email_id || member.user_id?.email || member.email || ""
    );
  };

  const getMemberId = (member) => {
    return member.user_id?._id || member._id;
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
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
          color: "white",
          fontWeight: 600,
          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        }}
      >
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
                  background:
                    "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily:
                    "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
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
                                fontFamily:
                                  "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
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
                    background:
                      "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
                    boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                    fontWeight: 500,
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    fontFamily:
                      "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                    "&:hover": {
                      boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                      transform: "translateY(-1px)",
                      background:
                        "linear-gradient(135deg, #3a5fc0 0%, #7b46cd 100%)",
                    },
                    "&:disabled": {
                      background:
                        "linear-gradient(135deg, #a3b8e0 0%, #c5aee0 100%)",
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
                fontFamily:
                  "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
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
                    <React.Fragment key={getMemberId(member)}>
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
                                fontFamily:
                                  "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                              }}
                            >
                              {getMemberDisplayName(member)}
                            </Typography>
                          }
                          secondary={
                            <>
                              {getMemberEmail(member) && (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#607080", display: "block" }}
                                >
                                  {getMemberEmail(member)}
                                </Typography>
                              )}
                              {member.joined_at && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#607080",
                                    display: "block",
                                    fontSize: "0.75rem",
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
                            onClick={() =>
                              handleRemoveMember(getMemberId(member))
                            }
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

const ForumCardSkeleton = () => {
  return (
    <Card
      sx={{
        width: 350,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Skeleton variant="rectangular" height={140} animation="wave" />
      <Box p={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Skeleton variant="text" width="70%" height={32} animation="wave" />
          <Box sx={{ display: "flex" }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              animation="wave"
              sx={{ mr: 1 }}
            />
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              animation="wave"
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            animation="wave"
            sx={{ borderRadius: 4, mr: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={90}
            height={24}
            animation="wave"
            sx={{ borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" animation="wave" height={20} />
          <Skeleton variant="text" animation="wave" height={20} />
          <Skeleton variant="text" animation="wave" height={20} />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #eee",
            pt: 2,
            mb: 2,
          }}
        >
          <Skeleton variant="text" width={60} animation="wave" />
          <Skeleton variant="text" width={60} animation="wave" />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton
            variant="rectangular"
            height={48}
            animation="wave"
            sx={{ flexGrow: 1, borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={48}
            height={48}
            animation="wave"
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>
    </Card>
  );
};

const ForumCard = ({
  forum,
  boardName,
  clubName,
  onViewForum,
  onViewMembers,
  onDeleteForum,
  onEditForum,
  hasPermission,
}) => {
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const handleEdit = () => {
    onEditForum(forum);
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

  const tagColors = [
    "#2196F3",
    "#4CAF50",
    "#FF9800",
    "#9C27B0",
    "#F44336",
    "#00BCD4",
    "#673AB7",
    "#3F51B5",
    "#009688",
    "#CDDC39",
    "#607D8B",
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
              <IconButton onClick={handleEdit} color="primary" size="small">
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
            onClick={() =>
              onViewForum(forum._id, forum.public_or_private === "private")
            }
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

const ForumList = ({ boardId }) => {
  const [forums, setForums] = useState([]);
  const [search, setSearch] = useState("");
  const [createForumOpen, setCreateForumOpen] = useState(false);
  const [editForumData, setEditForumData] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(boardId);
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
  const [loading, setLoading] = useState(true);
  const [minLoadingEndTime, setMinLoadingEndTime] = useState(0);
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

  const minLoadingTimeRef = useRef(Date.now() + 500);

  useEffect(() => {
    const fetchForums = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5000/forums2/api/forums"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch forums");
        }
        const data = await response.json();

        const currentTime = Date.now();
        const timeRemaining = minLoadingTimeRef.current - currentTime;

        if (timeRemaining > 0) {
          setTimeout(() => {
            setForums(data.data);
            setLoading(false);
          }, timeRemaining);
        } else {
          setForums(data.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching forums:", error);

        const currentTime = Date.now();
        const timeRemaining = minLoadingTimeRef.current - currentTime;

        if (timeRemaining > 0) {
          setTimeout(() => setLoading(false), timeRemaining);
        } else {
          setLoading(false);
        }
      }
    };

    fetchForums();
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
    if (boardId) {
      if (userBoardsWithForumPermission.includes(boardId)) {
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
    setEditForumData(null);
    setCreateForumOpen(!createForumOpen);
  };

  const handleEditForum = (forum) => {
    setEditForumData(forum);
    setCreateForumOpen(true);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleFilterChange = (filters) => {
    if (!boardId) {
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
      if (editForumData) {
        const response = await fetch(
          `http://localhost:5000/forums2/forums/${editForumData._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newForum),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update forum");
        }

        const updatedForum = await response.json();
        setForums(
          forums.map((forum) =>
            forum._id === updatedForum._id ? updatedForum : forum
          )
        );
      } else {
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
      }
      setCreateForumOpen(false);
      setEditForumData(null);
    } catch (error) {
      console.error(
        editForumData ? "Error updating forum:" : "Error creating forum:",
        error
      );
    }
  };

  const handleDialogClose = (result) => {
    if (result) {
      if (editForumData) {
        setForums(
          forums.map((forum) => (forum._id === result._id ? result : forum))
        );
      } else {
        setForums([...forums, result]);
      }
    }

    setCreateForumOpen(false);
    setEditForumData(null);
  };

  const filteredForums = forums.filter(
    (forum) =>
      forum.title.toLowerCase().includes(search.toLowerCase()) &&
      (boardId ? forum.board_id === boardId : true) &&
      (!selectedBoard || forum.board_id === selectedBoard) &&
      (!selectedClub || forum.club_id === selectedClub) &&
      (!privacyFilter || forum.public_or_private === privacyFilter)
  );

  const defaultContext = getDefaultClubOrBoardId();

  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <Grid item key={`skeleton-${index}`}>
          <ForumCardSkeleton />
        </Grid>
      ));
  };

  return (
    <div>
      <Box sx={{ position: "relative", minHeight: "100vh", pb: 8 }}>
        <Grid container spacing={3} sx={{ p: 2 }}>
          {loading ? (
            renderSkeletons()
          ) : filteredForums.length > 0 ? (
            filteredForums.map((forum) => (
              <Grid item key={forum._id}>
                <ForumCard
                  forum={forum}
                  onViewForum={handleViewForum}
                  onViewMembers={handleViewMembers}
                  onDeleteForum={handleDeleteForum}
                  onEditForum={handleEditForum}
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

        {canCreateForums() && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleCreateForumToggle}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        <ForumCreateDialog
          open={createForumOpen}
          onClose={handleDialogClose}
          onCreate={handleCreateForum}
          editData={editForumData}
          defaultContext={defaultContext}
          boardId={boardId}
          userId={userId}
        />

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
