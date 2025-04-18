"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  RadioGroup,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  LinearProgress,
  Box,
  Divider,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Collapse,
  AppBar,
  Toolbar,
  Badge,
  CssBaseline,
  ThemeProvider,
  createTheme,
  alpha,
  styled,
  InputAdornment,
  Stack,
  Chip,
} from "@mui/material";
import {
  Send,
  AttachFile,
  Mic,
  PictureAsPdf,
  Description,
  PollOutlined,
  Close,
  DownloadOutlined,
  ReplyOutlined,
  MoreVert,
  ExpandMore,
  ExpandLess,
  Image,
  VideoFile,
  AudioFile,
  People,
  ChevronRight,
  InsertEmoticon,
  Gif,
  Code,
  Add,
} from "@mui/icons-material";
import { initSocket, getSocket, disconnectSocket } from "../../../utils/socket";
import { useParams } from "next/navigation";

const API_URL = "http://localhost:5000/uploads";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6d28d9",
    },
    secondary: {
      main: "#10b981",
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          padding: "8px 16px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          backgroundColor: "#6d28d9",
          color: "white",
          fontWeight: 600,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
        },
      },
    },
  },
});

const PremiumAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
}));

const MessageInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "24px",
    backgroundColor: theme.palette.background.paper,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "1px",
    },
  },
}));

const MessageBubble = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: "18px",
  maxWidth: "75%",
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  wordBreak: "break-word",
  "&.user": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
}));

const PollOption = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: "12px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1),
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
}));

export default function ChatApp() {
  const { forum_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [audio, setAudio] = useState(null);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollType, setPollType] = useState("single");
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [forumName, setForumName] = useState("Project Discussion");
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [membersList] = useState([
    { id: 1, name: "John Doe", avatar: "J", role: "Admin", online: true },
    { id: 2, name: "Jane Smith", avatar: "J", role: "Member", online: true },
    { id: 3, name: "Mike Johnson", avatar: "M", role: "Member", online: false },
    { id: 4, name: "Sara Wilson", avatar: "S", role: "Member", online: true },
  ]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize socket and fetch messages
  useEffect(() => {
    socketRef.current = initSocket();
    const socket = socketRef.current;

    // Join forum room
    socket.emit("joinForum", forum_id);

    // Set up event listeners
    socket.on("newMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("newReply", ({ parentId, reply }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === parentId) {
            return {
              ...msg,
              replies: [...(msg.replies || []), reply],
            };
          }
          return msg;
        })
      );
    });

    socket.on("updatePoll", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === updatedMessage._id) {
            return updatedMessage;
          }

          if (msg.replies) {
            const updatedReplies = msg.replies.map((reply) => {
              if (reply._id === updatedMessage._id) {
                return updatedMessage;
              }
              return reply;
            });

            return {
              ...msg,
              replies: updatedReplies,
            };
          }

          return msg;
        })
      );
    });

    socket.on("deleteMessage", ({ messageId }) => {
      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => msg._id !== messageId);

        if (filteredMessages.length === prev.length) {
          return prev.map((msg) => {
            if (msg.replies) {
              return {
                ...msg,
                replies: msg.replies.filter((reply) => reply._id !== messageId),
              };
            }
            return msg;
          });
        }

        return filteredMessages;
      });
    });

    // Fetch initial messages
    fetchMessages(forum_id);

    return () => {
      socket.off("newMessage");
      socket.off("newReply");
      socket.off("updatePoll");
      socket.off("deleteMessage");
      disconnectSocket();
      stopRecordingCleanup();
    };
  }, []);

  // Clean up recording resources
  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async (forumId, page = 1, limit = 1000) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${forumId}?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !file && !audio) return;
    setIsSending(true);

    const formData = new FormData();
    formData.append("forum_id", forum_id);
    formData.append("user_id", "67d824cfe5cfbbf1ee400416");
    formData.append("text", input);
    if (replyingTo) formData.append("parent_id", replyingTo);
    if (file) formData.append("file", file);
    if (audio) formData.append("audio", audio);

    try {
      let endpoint = replyingTo
        ? `http://localhost:5000/api/messages/${replyingTo}/replies`
        : "http://localhost:5000/api/messages";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send message");

      setInput("");
      setFile(null);
      setAudio(null);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const startAudioRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, {
          type: "audio/wav",
        });
        setAudio(audioFile);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Could not start recording. Please ensure microphone access is granted."
      );
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const toggleAudioRecording = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const handleVote = async (messageId, optionIndex, isReply = false) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${messageId}/poll`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "67d824cfe5cfbbf1ee400416",
            optionIndex,
            voteType: "single",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update poll vote");
    } catch (error) {
      console.error("Error updating poll vote:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "67d824cfe5cfbbf1ee400416",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to delete message");
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const renderFileContent = (fileData) => {
    if (!fileData) return null;
    const fileType = fileData.mimetype;
    let fileUrl;
    if (fileType.startsWith("audio")) {
      fileUrl = `${API_URL}/audio/${fileData.filename}`;
    } else {
      fileUrl = `${API_URL}/files/${fileData.filename}`;
    }

    const fileName = fileData.filename;

    let FileIcon = Description;
    let iconColor = "primary";

    if (fileType) {
      if (fileType.startsWith("image")) {
        FileIcon = Image;
        iconColor = "success";
      } else if (fileType.startsWith("video")) {
        FileIcon = VideoFile;
        iconColor = "info";
      } else if (fileType.startsWith("audio")) {
        FileIcon = AudioFile;
        iconColor = "secondary";
      } else if (fileType === "application/pdf") {
        FileIcon = PictureAsPdf;
        iconColor = "error";
      }
    }

    return (
      <Box sx={{ my: 1 }}>
        {fileType && fileType.startsWith("image") && fileUrl ? (
          <Box sx={{ position: "relative", width: "fit-content" }}>
            <Box
              component="img"
              src={fileUrl}
              alt={fileName}
              sx={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: 2,
                display: "block",
                boxShadow: 1,
              }}
            />
            <Tooltip title="Download">
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,1)",
                  },
                }}
                onClick={() => downloadFile(fileUrl, fileName)}
              >
                <DownloadOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : fileType && fileType.startsWith("video") && fileUrl ? (
          <Box sx={{ position: "relative", width: "fit-content" }}>
            <video
              controls
              src={fileUrl}
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "12px",
                boxShadow: 1,
              }}
            />
            <Tooltip title="Download">
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,1)",
                  },
                }}
                onClick={() => downloadFile(fileUrl, fileName)}
              >
                <DownloadOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : fileType && fileType.startsWith("audio") && fileUrl ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <audio controls style={{ flexGrow: 1 }}>
              <source src={fileUrl} type={fileType} />
              Your browser does not support the audio element.
            </audio>
          </Box>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FileIcon color={iconColor} fontSize="large" sx={{ mr: 2 }} />
              <Typography variant="body1" noWrap sx={{ maxWidth: "200px" }}>
                {fileName}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<DownloadOutlined />}
              variant="outlined"
              onClick={() => downloadFile(fileUrl, fileName)}
              sx={{ borderRadius: "20px" }}
            >
              Download
            </Button>
          </Paper>
        )}
      </Box>
    );
  };

  const renderFilePreview = (file) => {
    if (!file) return null;
    const fileURL = URL.createObjectURL(file);
    const fileType = file.type;
    const fileName = file.name;

    if (fileType.startsWith("image")) {
      return (
        <Box sx={{ my: 1 }}>
          <Box
            component="img"
            src={fileURL}
            alt={fileName}
            sx={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: 2,
              display: "block",
              boxShadow: 1,
            }}
          />
        </Box>
      );
    }

    let FileIcon = Description;
    let iconColor = "primary";

    if (fileType.startsWith("video")) {
      FileIcon = VideoFile;
      iconColor = "info";
    } else if (fileType.startsWith("audio")) {
      FileIcon = AudioFile;
      iconColor = "secondary";
    } else if (fileType === "application/pdf") {
      FileIcon = PictureAsPdf;
      iconColor = "error";
    }

    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          my: 1,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <FileIcon color={iconColor} fontSize="large" sx={{ mr: 2 }} />
          <Typography variant="body1" noWrap sx={{ flexGrow: 1 }}>
            {fileName}
          </Typography>
          <IconButton
            onClick={() => {
              setFile(null);
              setAudio(null);
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
        {fileType.startsWith("audio") && (
          <audio controls style={{ width: "100%", marginTop: "8px" }}>
            <source src={fileURL} type={fileType} />
            Your browser does not support the audio element.
          </audio>
        )}
        {isRecording && fileType.startsWith("audio") && (
          <Typography variant="caption" color="text.secondary">
            Recording: {Math.floor(recordingTime / 60)}:
            {String(recordingTime % 60).padStart(2, "0")}
          </Typography>
        )}
      </Paper>
    );
  };

  const renderPoll = (poll, messageId, isReply = false) => {
    if (!poll) return null;
    const { question, options, type, totalVotes = 0, userVotes = [] } = poll;

    return (
      <Paper variant="outlined" sx={{ p: 2, my: 1, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {question}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          {type === "single" ? "Single choice poll" : "Multiple choice poll"} •{" "}
          {totalVotes} votes
        </Typography>

        <FormControl component="fieldset" fullWidth>
          {type === "single" ? (
            <RadioGroup>
              {options.map((option, optIndex) => {
                const voteCount = option.votes || 0;
                const percentage =
                  totalVotes > 0
                    ? Math.round((voteCount / totalVotes) * 100)
                    : 0;
                const isSelected = userVotes.some(
                  (vote) =>
                    vote.userId === "67d824cfe5cfbbf1ee400416" &&
                    vote.optionIndex === optIndex
                );

                return (
                  <PollOption key={optIndex} sx={{ mb: 1 }}>
                    <FormControlLabel
                      control={<Radio checked={isSelected} color="primary" />}
                      label={option.text}
                      onChange={() => handleVote(messageId, optIndex, isReply)}
                      sx={{ width: "100%", m: 0 }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", mt: -1 }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "rgba(124, 124, 124, 0.1)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              backgroundColor: isSelected
                                ? "primary.main"
                                : "grey.500",
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {percentage}%
                      </Typography>
                    </Box>
                  </PollOption>
                );
              })}
            </RadioGroup>
          ) : (
            <FormGroup>
              {options.map((option, optIndex) => {
                const voteCount = option.votes || 0;
                const percentage =
                  totalVotes > 0
                    ? Math.round((voteCount / totalVotes) * 100)
                    : 0;
                const isSelected = userVotes.some(
                  (vote) =>
                    vote.userId === "67d824cfe5cfbbf1ee400416" &&
                    vote.optionIndex === optIndex
                );

                return (
                  <PollOption key={optIndex} sx={{ mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox checked={isSelected} color="primary" />
                      }
                      label={option.text}
                      onChange={() => handleVote(messageId, optIndex, isReply)}
                      sx={{ width: "100%", m: 0 }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", mt: -1 }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "rgba(124, 124, 124, 0.1)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              backgroundColor: isSelected
                                ? "primary.main"
                                : "grey.500",
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {percentage}%
                      </Typography>
                    </Box>
                  </PollOption>
                );
              })}
            </FormGroup>
          )}
        </FormControl>
      </Paper>
    );
  };

  const downloadFile = async (fileUrl, filename) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleFileChange = (event) => setFile(event.target.files[0]);
  const clearAttachment = () => {
    setFile(null);
    setAudio(null);
  };
  const cancelReply = () => setReplyingTo(null);

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => setPollOptions([...pollOptions, ""]);
  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const toggleReplies = (messageId) => {
    setExpandedReplies((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleMessageMenu = (event, index) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessageIndex(index);
  };

  const closeMessageMenu = () => {
    setMenuAnchorEl(null);
    setSelectedMessageIndex(null);
  };

  const handleReply = () => {
    if (selectedMessageIndex !== null) {
      setReplyingTo(messages[selectedMessageIndex]._id);
      closeMessageMenu();
      setTimeout(() => document.getElementById("message-input").focus(), 100);
    }
  };

  const handleDelete = () => {
    if (selectedMessageIndex !== null) {
      const messageId = messages[selectedMessageIndex]._id;
      deleteMessage(messageId);
      closeMessageMenu();
    }
  };

  const createPoll = async () => {
    if (
      !pollQuestion.trim() ||
      pollOptions.filter((opt) => opt.trim()).length < 2
    )
      return;
    setIsSending(true);

    const pollData = {
      forum_id: forum_id,
      user_id: "67d824cfe5cfbbf1ee400416",
      type: "poll",
      text: pollQuestion,
      poll: {
        question: pollQuestion,
        options: pollOptions.filter((opt) => opt.trim()),
        type: pollType,
      },
      parent_id: replyingTo || null,
    };

    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      });
      if (!response.ok) throw new Error("Failed to create poll");

      setPollDialogOpen(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollType("single");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error creating poll:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  const getReplyingToMessage = () => {
    if (replyingTo === null) return null;
    return (
      messages.find((msg) => msg._id === replyingTo) ||
      messages
        .flatMap((msg) => msg.replies || [])
        .find((reply) => reply._id === replyingTo)
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxWidth: "100vw",
          mx: "auto",
          width: "100%",
          bgcolor: "background.default",
        }}
      >
        {/* Forum header */}
        <PremiumAppBar position="static">
          <Toolbar sx={{ px: 2 }}>
            <Button
              onClick={() => setMemberDialogOpen(true)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                textTransform: "none",
                color: "text.primary",
                py: 1.5,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ flexGrow: 1, fontWeight: 600 }}
                >
                  {forumName}
                </Typography>
                <Badge
                  badgeContent={membersList.filter((m) => m.online).length}
                  color="success"
                  sx={{ ml: 1 }}
                >
                  <People />
                </Badge>
              </Box>
              <ChevronRight />
            </Button>
          </Toolbar>
        </PremiumAppBar>

        {/* Messages container */}
        <Box
          ref={messagesContainerRef}
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 2,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            bgcolor: "background.default",
          }}
        >
          <List sx={{ pb: 0 }}>
            {messages.map((msg, index) => (
              <Box key={msg._id || index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    position: "relative",
                    px: 0,
                    "&:hover .message-actions": { opacity: 1 },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 56 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {msg.username
                        ? msg.username[0]
                        : index % 2 === 0
                        ? "U"
                        : "A"}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <Typography variant="subtitle2" fontWeight="600">
                        {msg.username || "Unknown User"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {formatTimestamp(msg.created_at)}
                      </Typography>
                    </Box>

                    <MessageBubble className={msg.user_id === "67d824cfe5cfbbf1ee400416" ? "user" : ""}>
                      {msg.text}
                    </MessageBubble>

                    {msg.type === "poll"
                      ? renderPoll(msg.poll, msg._id)
                      : msg.file
                      ? renderFileContent(msg.file)
                      : msg.audio
                      ? renderFileContent({
                          filename: msg.audio.filename,
                          mimetype: msg.audio.mimetype,
                        })
                      : null}

                    {msg.replies && msg.replies.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          startIcon={
                            expandedReplies[msg._id] ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )
                          }
                          onClick={() => toggleReplies(msg._id)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          {msg.replies.length}{" "}
                          {msg.replies.length === 1 ? "reply" : "replies"}
                        </Button>

                        <Collapse in={expandedReplies[msg._id] || false}>
                          <List disablePadding>
                            {msg.replies.map((reply, replyIndex) => (
                              <ListItem
                                key={reply._id || `reply-${replyIndex}`}
                                alignItems="flex-start"
                                sx={{ pl: 2, mt: 1, px: 0 }}
                              >
                                <ListItemAvatar sx={{ minWidth: 48 }}>
                                  <Avatar sx={{ width: 36, height: 36 }}>
                                    {reply.username
                                      ? reply.username[0]
                                      : (index + replyIndex + 1) % 2 === 0
                                      ? "U"
                                      : "A"}
                                  </Avatar>
                                </ListItemAvatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mb: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight="600"
                                    >
                                      {reply.username || "Unknown User"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ ml: 1 }}
                                    >
                                      {formatTimestamp(reply.created_at)}
                                    </Typography>
                                  </Box>

                                  <MessageBubble
                                    className={reply.user_id === "67d824cfe5cfbbf1ee400416" ? "user" : ""}
                                  >
                                    {reply.text}
                                  </MessageBubble>

                                  {reply.type === "poll"
                                    ? renderPoll(reply.poll, reply._id, true)
                                    : reply.file
                                    ? renderFileContent(reply.file)
                                    : reply.audio
                                    ? renderFileContent({
                                        filename: reply.audio.filename,
                                        mimetype: reply.audio.mimetype,
                                      })
                                    : null}
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </Box>
                    )}
                  </Box>

                  {/* Message action buttons */}
                  <Box
                    className="message-actions"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      boxShadow: 1,
                      display: "flex",
                    }}
                  >
                    <Tooltip title="Reply">
                      <ActionButton
                        size="small"
                        onClick={() => {
                          setReplyingTo(msg._id);
                          document.getElementById("message-input").focus();
                        }}
                      >
                        <ReplyOutlined fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < messages.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ my: 1 }} />
                )}
              </Box>
            ))}
            <div ref={endOfMessagesRef} />
          </List>
        </Box>

        {/* Message input area */}
        <Box
          sx={{
            p: 2,
            backgroundColor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Replying to indicator */}
          {replyingTo !== null && getReplyingToMessage() && (
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "action.hover",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <ReplyOutlined
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body2" noWrap>
                  Replying to: {getReplyingToMessage().text}
                </Typography>
              </Box>
              <IconButton size="small" onClick={cancelReply}>
                <Close fontSize="small" />
              </IconButton>
            </Paper>
          )}

          {/* File/Audio Preview */}
          {(file || audio) && (
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, position: "relative", borderRadius: 2 }}
            >
              <IconButton
                size="small"
                sx={{ position: "absolute", top: 4, right: 4 }}
                onClick={clearAttachment}
              >
                <Close fontSize="small" />
              </IconButton>
              <Typography variant="subtitle2" gutterBottom>
                Attachment to send:
              </Typography>
              {file && renderFilePreview(file)}
              {audio && renderFilePreview(audio)}
            </Paper>
          )}

          <MessageInput
            id="message-input"
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isSending) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isSending}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction="row" spacing={0.5}>
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      style={{ display: "none" }}
                      id="file-upload"
                      onChange={handleFileChange}
                      disabled={isSending}
                      ref={fileInputRef}
                    />
                    <label htmlFor="file-upload">
                      <ActionButton component="span" disabled={isSending}>
                        <AttachFile />
                      </ActionButton>
                    </label>

                    <ActionButton
                      onClick={toggleAudioRecording}
                      disabled={isSending}
                      sx={{
                        color: isRecording ? "error.main" : "inherit",
                        "&:hover": {
                          backgroundColor: isRecording
                            ? alpha(theme.palette.error.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {isRecording ? (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor: "error.main",
                            animation: "pulse 1.5s infinite",
                          }}
                        />
                      ) : (
                        <Mic />
                      )}
                    </ActionButton>

                    <ActionButton
                      onClick={() => setPollDialogOpen(true)}
                      disabled={isSending}
                    >
                      <PollOutlined />
                    </ActionButton>

                    <ActionButton
                      onClick={sendMessage}
                      color="primary"
                      disabled={isSending}
                      sx={{
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      }}
                    >
                      {isSending ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <Send />
                      )}
                    </ActionButton>
                  </Stack>
                </InputAdornment>
              ),
            }}
            multiline
            maxRows={4}
          />
        </Box>

        {/* Poll Creation Dialog */}
        <Dialog
          open={pollDialogOpen}
          onClose={() => !isSending && setPollDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            {replyingTo !== null ? "Reply with a Poll" : "Create a Poll"}
          </DialogTitle>
          <DialogContent>
            {replyingTo !== null && getReplyingToMessage() && (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: "action.hover" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Replying to: {getReplyingToMessage().text}
                </Typography>
              </Paper>
            )}

            <TextField
              fullWidth
              label="Question"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              margin="normal"
              disabled={isSending}
              sx={{ mb: 2 }}
            />

            <FormControl component="fieldset" margin="normal" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                Poll Type
              </FormLabel>
              <RadioGroup
                row
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
                sx={{ gap: 2 }}
              >
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2, flexGrow: 1 }}
                >
                  <FormControlLabel
                    value="single"
                    control={<Radio disabled={isSending} color="primary" />}
                    label="Single Choice"
                    sx={{ width: "100%", m: 0 }}
                  />
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2, flexGrow: 1 }}
                >
                  <FormControlLabel
                    value="multi"
                    control={<Radio disabled={isSending} color="primary" />}
                    label="Multiple Choice"
                    sx={{ width: "100%", m: 0 }}
                  />
                </Paper>
              </RadioGroup>
            </FormControl>

            <Typography
              variant="subtitle1"
              sx={{ mt: 2, mb: 1, fontWeight: 500 }}
            >
              Options
            </Typography>

            {pollOptions.map((option, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                <TextField
                  fullWidth
                  value={option}
                  onChange={(e) =>
                    handlePollOptionChange(index, e.target.value)
                  }
                  disabled={isSending}
                  size="small"
                />
                {pollOptions.length > 2 && (
                  <IconButton
                    size="small"
                    onClick={() => removePollOption(index)}
                    disabled={isSending}
                    sx={{
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button
              variant="outlined"
              onClick={addPollOption}
              disabled={isSending}
              sx={{ mt: 2 }}
              startIcon={<Add />}
            >
              Add Option
            </Button>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setPollDialogOpen(false)}
              disabled={isSending}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={createPoll}
              color="primary"
              variant="contained"
              disabled={
                isSending ||
                !pollQuestion.trim() ||
                pollOptions.filter((opt) => opt.trim()).length < 2
              }
              sx={{ borderRadius: 2 }}
            >
              {isSending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Poll"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Members Dialog */}
        <Dialog
          open={memberDialogOpen}
          onClose={() => setMemberDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {forumName} Members
              </Typography>
              <Badge
                badgeContent={membersList.filter((m) => m.online).length}
                color="success"
              >
                <Typography variant="body2">Online</Typography>
              </Badge>
            </Box>
          </DialogTitle>
          <DialogContent>
            <List sx={{ width: "100%" }}>
              {membersList.map((member) => (
                <ListItem key={member.id} sx={{ px: 0, py: 1.5 }}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      variant="dot"
                      color={member.online ? "success" : "default"}
                    >
                      <Avatar>{member.avatar}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography>{member.name}</Typography>
                        {member.role === "Admin" && (
                          <Chip
                            label="Admin"
                            size="small"
                            sx={{
                              ml: 1,
                              bgcolor: "primary.light",
                              color: "primary.contrastText",
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color={
                          member.online ? "success.main" : "text.secondary"
                        }
                      >
                        {member.online ? "Online" : "Offline"}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setMemberDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}