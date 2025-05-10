"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Typography,
  Box,
} from "@mui/material";
import {
  Share,
  ContentCopy,
  Email,
  WhatsApp,
  LinkedIn,
  Twitter as XIcon,
  Facebook,
  Instagram,
  Close,
} from "@mui/icons-material";
import { getAuthToken } from "@/utils/auth";

const API_URL = "http://localhost:5000";
/**
 * Universal Share Menu Component - can be used for any content type
 *
 * @param {Object} props Component props
 * @param {HTMLElement} props.anchorEl The element to anchor the menu to
 * @param {boolean} props.open Whether the menu is open
 * @param {Function} props.onClose Function to close the menu
 * @param {string} props.id Content ID (event/post/project/opportunity ID)
 * @param {string} props.title Content title
 * @param {string} props.url Full URL to the content (optional, will construct from location if not provided)
 * @param {string} props.contentType Type of content: 'event', 'post', 'project', 'opportunity' (defaults to 'content')
 * @param {string} props.customShareText Optional custom text to use for sharing (overrides default by content type)
 */
const UniversalShareMenu = ({
  anchorEl,
  open,
  onClose,
  id,
  title = "Content",
  url,
  contentType = "content",
  customShareText,
}) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  // Determine content path segment based on content type
  const getPathSegment = () => {
    switch (contentType) {
      case "event":
        return "current_event";
      case "post":
        return "current_post";
      case "project":
        return "current_project";
      case "blog":
        return "current_blog";
      default:
        return contentType + "s"; // fallback to pluralizing
    }
  };

  // If URL is not provided, create a fallback URL
  const shareUrl = url || `${API_URL}/${getPathSegment()}/${id}`;

  // Generate appropriate share text based on content type
  const getShareText = (forPlatform = "default") => {
    if (customShareText) return customShareText;

    let shareText;
    switch (contentType) {
      case "event":
        shareText = `Check out this event: ${title}`;
        break;
      case "post":
        shareText = `Read this interesting post: ${title}`;
        break;
      case "project":
        shareText = `Take a look at this project: ${title}`;
        break;
      case "opportunity":
        shareText = `Check out this opportunity: ${title}`;
        break;
      default:
        shareText = `Check this out: ${title}`;
    }

    // Add platform-specific modifications if needed
    if (forPlatform === "email") {
      return `${shareText}\n\n${shareUrl}`;
    }

    return shareText;
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const copyToClipboard = async () => {
    if (!authToken) {
      return;
    }
    
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showNotification("Link copied to clipboard");
      } catch (err) {
        showNotification("Failed to copy link", "error");
      }
      onClose();
    } else {
      showNotification("Clipboard not supported in this environment", "error");
    }
  };

  const shareViaEmail = () => {
    if (!authToken) {
      return;
    }
    
    const subject = encodeURIComponent(`${getShareText()}`);
    const body = encodeURIComponent(getShareText("email"));
    window.open(`mailto:?subject=${subject}&body=${body}`);
    showNotification("Email client opened");
    onClose();
  };

  const shareViaWhatsApp = () => {
    if (!authToken) {
      return;
    }
    
    const text = encodeURIComponent(`${getShareText()} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`);
    onClose();
  };

  const shareViaLinkedIn = () => {
    if (!authToken) {
      return;
    }
    
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    onClose();
  };

  const shareViaX = () => {
    if (!authToken) {
      return;
    }
    
    const text = encodeURIComponent(getShareText());
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        shareUrl
      )}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    onClose();
  };

  const shareViaFacebook = () => {
    if (!authToken) {
      return;
    }
    
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    onClose();
  };

  const shareViaInstagram = () => {
    if (!authToken) {
      return;
    }
    
    // Instagram doesn't have a direct web sharing API, so copy the link
    // and show a message about sharing to Instagram
    copyToClipboard();
    showNotification("Link copied. Paste it in your Instagram story or post");
  };

  const useNativeShare = () => {
    if (!authToken) {
      return;
    }
    
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      if (navigator.share) {
        navigator
          .share({
            title: title,
            text: getShareText(),
            url: shareUrl,
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          })
          .then(() => showNotification("Shared successfully"))
          .catch(() => showNotification("Sharing canceled", "info"));
      } else {
        showNotification(
          "Native sharing not supported on this device",
          "warning"
        );
      }
    } else {
      showNotification("Sharing not supported in this environment", "warning");
    }
    onClose();
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{
          elevation: 6,
          sx: {
            borderRadius: 3,
            minWidth: 250,
            padding: 1,
            "& .MuiMenuItem-root": {
              borderRadius: 2,
              margin: "4px 0",
              transition: "background-color 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
              },
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Share this {contentType}
          </Typography>
        </Box>

        {typeof window !== "undefined" &&
          typeof navigator !== "undefined" &&
          navigator.share && (
            <MenuItem onClick={useNativeShare}>
              <ListItemIcon>
                <Share fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Share via device"
                secondary="Use your device's sharing"
              />
            </MenuItem>
          )}

        <MenuItem onClick={copyToClipboard}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Copy Link" />
        </MenuItem>

        <MenuItem onClick={shareViaEmail}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Email" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={shareViaWhatsApp}>
          <ListItemIcon>
            <WhatsApp fontSize="small" sx={{ color: "#25D366" }} />
          </ListItemIcon>
          <ListItemText primary="WhatsApp" />
        </MenuItem>

        <MenuItem onClick={shareViaLinkedIn}>
          <ListItemIcon>
            <LinkedIn fontSize="small" sx={{ color: "#0A66C2" }} />
          </ListItemIcon>
          <ListItemText primary="LinkedIn" />
        </MenuItem>

        <MenuItem onClick={shareViaX}>
          <ListItemIcon>
            <XIcon fontSize="small" sx={{ color: "#000000" }} />
          </ListItemIcon>
          <ListItemText primary="X" />
        </MenuItem>

        <MenuItem onClick={shareViaFacebook}>
          <ListItemIcon>
            <Facebook fontSize="small" sx={{ color: "#1877F2" }} />
          </ListItemIcon>
          <ListItemText primary="Facebook" />
        </MenuItem>

        <MenuItem onClick={shareViaInstagram}>
          <ListItemIcon>
            <Instagram fontSize="small" sx={{ color: "#E4405F" }} />
          </ListItemIcon>
          <ListItemText primary="Instagram" />
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
          action={
            <Close
              fontSize="small"
              onClick={closeSnackbar}
              sx={{ cursor: "pointer" }}
            />
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UniversalShareMenu;
