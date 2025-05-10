// components/ForumMemberComponent.js
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Typography,
  TextField,
  CircularProgress,
  Box,
  Checkbox,
  Chip,
  InputAdornment,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SearchIcon from "@mui/icons-material/Search";
import { getAuthToken } from "@/utils/auth";

export default function ForumMemberComponent({ open, onClose, forum }) {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [searchNewMember, setSearchNewMember] = useState("");
  const [searchExistingMember, setSearchExistingMember] = useState("");
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  // Fetch all users and forum members when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !forum || !authToken) return;

      setLoading(true);
      try {
        // Fetch all users
        const usersResponse = await fetch("http://localhost:5000/users/users", {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        });
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();
        setAllUsers(usersData.users || usersData);

        // Fetch forum members
        const membersResponse = await fetch(
          `http://localhost:5000/forums2/forums/${forum._id}/members`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          }
        );
        if (!membersResponse.ok) throw new Error("Failed to fetch members");
        const membersData = await membersResponse.json();
        setMembers(membersData.members || membersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, forum, authToken]);

  const handleAddMember = async () => {
    if (selectedUsers.length === 0 || !authToken) return;

    setAddingMember(true);
    setError(null);
    const currentDate = new Date().toISOString();

    try {
      const addPromises = selectedUsers.map((userId) =>
        fetch(`http://localhost:5000/forums2/forums/${forum._id}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            user_id: userId,
            forum_id: forum._id,
            joined_at: currentDate,
          }),
        })
      );

      const responses = await Promise.all(addPromises);
      const allOk = responses.every((response) => response.ok);

      if (!allOk) {
        throw new Error("Failed to add some members");
      }

      // Refresh members list
      const updatedResponse = await fetch(
        `http://localhost:5000/forums2/forums/${forum._id}/members`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
      );
      if (!updatedResponse.ok) throw new Error("Failed to fetch updated members");
      const updatedData = await updatedResponse.json();
      setMembers(updatedData.members || updatedData);
      setSelectedUsers([]);
      setSearchNewMember("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!authToken) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/forums2/forums/${forum._id}/members/${userId}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      setMembers((prev) =>
        prev.filter((member) => member._id !== userId || member.user_id !== userId)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchNewMember.toLowerCase()) ||
      user.email_id?.toLowerCase().includes(searchNewMember.toLowerCase())
  );

  const filteredMembers = members.filter((member) => {
    const searchTerm = searchExistingMember.toLowerCase();
    const memberName = member.name || member.user_id?.name;
    const memberEmail = member.email_id || member.user_id?.email_id;

    return (
      memberName?.toLowerCase().includes(searchTerm) ||
      memberEmail?.toLowerCase().includes(searchTerm)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!forum) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Forum Members - {forum.title}
        <Typography variant="subtitle1" color="text.secondary">
          {members.length} member(s)
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Box sx={{ color: "error.main", mb: 2, textAlign: "center" }}>
            {error}
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Members
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search users to add..."
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
              mb: 2,
            }}
          >
            {filteredAvailableUsers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                {searchNewMember
                  ? "No matching users found"
                  : "No users available to add"}
              </Typography>
            ) : (
              <List dense>
                {filteredAvailableUsers.map((user) => (
                  <ListItem
                    key={user._id}
                    button
                    onClick={() => handleUserSelect(user._id)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedUsers.includes(user._id)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={user.name}
                      secondary={user.email_id}
                    />
                    <Chip
                      label={user.userRole}
                      size="small"
                      sx={{ ml: 1 }}
                      color={
                        user.userRole === "super_admin"
                          ? "error"
                          : user.userRole === "board_admin" ||
                            user.userRole === "club_admin"
                          ? "warning"
                          : "default"
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleAddMember}
              disabled={selectedUsers.length === 0 || addingMember}
            >
              {addingMember ? (
                <CircularProgress size={24} />
              ) : (
                `Add ${selectedUsers.length} Member(s)`
              )}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Current Members
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search current members..."
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

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredMembers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No members in this forum yet.
          </Typography>
        ) : (
          <List>
            {filteredMembers.map((member) => {
              const memberData = member.user_id || member;
              return (
                <React.Fragment key={member._id}>
                  <ListItem>
                    <ListItemText
                      primary={memberData.name}
                      secondary={
                        <>
                          {memberData.email_id && (
                            <span>{memberData.email_id}</span>
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
                        onClick={() => handleRemoveMember(memberData._id)}
                        disabled={loading}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading || addingMember}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
