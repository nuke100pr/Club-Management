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
  styled,
  alpha,
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

// Styled components for the premium UI
const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 600,
}));

const PremiumCard = styled(Card)(({ theme }) => ({
  width: 350,
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(95, 150, 230, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(95, 150, 230, 0.2)',
  },
  borderTop: '4px solid #4776E6',
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
  color: 'white',
  fontWeight: 500,
  borderRadius: '8px',
  boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
  padding: '8px 16px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #3a5fc0 0%, #7b3dc1 100%)',
    boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  color: '#4776E6',
  borderColor: '#4776E6',
  borderRadius: '8px',
  padding: '8px 16px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#4776E6', 0.08),
    borderColor: '#3a5fc0',
    transform: 'translateY(-2px)',
  },
}));

const PremiumChip = styled(Chip)(({ theme }) => ({
  height: 22,
  fontSize: '0.65rem',
  backgroundColor: alpha('#4776E6', 0.1),
  color: '#4776E6',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

const PremiumTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(95, 150, 230, 0.1)',
    '&:hover': {
      boxShadow: '0 4px 15px rgba(95, 150, 230, 0.2)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 15px rgba(95, 150, 230, 0.2)',
      borderColor: '#4776E6',
    },
  },
}));

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(95, 150, 230, 0.2)',
  },
}));

// ForumMembersDialog component with premium styling
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/members`
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/users/`);
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
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums/${forumId}/members`, {
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
    <PremiumDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <GradientText variant="h5">Forum Members</GradientText>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#2A3B4F', fontWeight: 600 }}>
                Add New Members
              </Typography>

              <PremiumTextField
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
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#4776E6', 0.05),
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
                          primaryTypographyProps={{ color: '#2A3B4F' }}
                          secondaryTypographyProps={{ color: '#607080' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <PrimaryButton
                  onClick={handleAddMember}
                  disabled={selectedUsers.length === 0 || addingMember}
                  sx={{ minWidth: 100 }}
                >
                  {addingMember ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Add (${selectedUsers.length})`
                  )}
                </PrimaryButton>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 1, color: '#2A3B4F', fontWeight: 600 }}>
              Current Members ({members.length})
            </Typography>

            <PremiumTextField
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
                    <ListItem
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#4776E6', 0.05),
                        },
                      }}
                    >
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
                        primaryTypographyProps={{ color: '#2A3B4F' }}
                        secondaryTypographyProps={{ color: '#607080' }}
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
        <SecondaryButton onClick={onClose}>
          Close
        </SecondaryButton>
      </DialogActions>
    </PremiumDialog>
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
    "#2196F3", "#4CAF50", "#FF9800", "#9C27B0", 
    "#F44336", "#00BCD4", "#673AB7", "#3F51B5"
  ];

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <PremiumCard>
      <CardMedia
        component="img"
        height="160"
        image={
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${forum.image.filename}` ||
          "https://via.placeholder.com/350x160"
        }
        alt={forum.title}
        sx={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
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
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#2A3B4F', fontWeight: 600 }}>
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
                <LockIcon fontSize="small" color="error" />
              ) : (
                <PublicIcon fontSize="small" color="success" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {boardName && (
            <PremiumChip
              label={boardName}
              size="small"
              sx={{
                backgroundColor: alpha('#4CAF50', 0.1),
                color: '#4CAF50',
              }}
            />
          )}
          {clubName && (
            <PremiumChip
              label={clubName}
              size="small"
              sx={{
                backgroundColor: alpha('#FF5722', 0.1),
                color: '#FF5722',
              }}
            />
          )}

          {forum.tags &&
            forum.tags.map((tag, index) => (
              <PremiumChip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: alpha(getTagColor(index), 0.1),
                  color: getTagColor(index),
                }}
              />
            ))}
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: '#607080' }}>
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
          <PrimaryButton
            onClick={() => onViewForum(forum._id)}
            sx={{
              flexGrow: 1,
              py: 1,
            }}
          >
            VIEW DISCUSSION
          </PrimaryButton>

          <SecondaryButton
            onClick={() => onViewMembers(forum._id)}
            sx={{
              py: 1,
              minWidth: 'auto',
            }}
          >
            <PeopleIcon sx={{ mr: 0.5 }} fontSize="small" />
          </SecondaryButton>
        </Box>
      </Box>
    </PremiumCard>
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
    return (
      isSuperAdmin ||
      userClubsWithForumPermission.length > 0 ||
      userBoardsWithForumPermission.length > 0
    );
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/api/forums`
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
    setSelectedBoard(filters.board);
    setSelectedClub(filters.club);
    setPrivacyFilter(filters.privacy);
  };

  const handleDeleteForum = (forumId) => {
    setForums(forums.filter((forum) => forum._id !== forumId));
  };

  const handleCreateForum = async (newForum) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums2/forums`, {
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
    <Box sx={{ 
      backgroundColor: '#f8faff',
      minHeight: '100vh',
      p: 4,
    }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <GradientText variant="h4" sx={{ mb: 3 }}>
          Community Forums
        </GradientText>
        
        <SearchAndFilter
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          availableBoards={availableBoards}
          availableClubs={availableClubs}
        />

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filteredForums.map((forum) => (
            <Grid item key={forum._id} xs={12} sm={6} md={4} lg={3}>
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

        {canCreateForums() && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleCreateForumToggle}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #3a5fc0 0%, #7b3dc1 100%)',
              },
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