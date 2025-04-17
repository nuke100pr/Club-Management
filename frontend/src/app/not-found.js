"use client";

import { Box, Typography, Button, useTheme } from "@mui/material";
import { Home } from "@mui/icons-material";
import Link from "next/link";

export default function NotFound() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        background: isDarkMode
          ? "radial-gradient(circle at 10% 20%, rgb(21, 26, 40) 0%, rgb(10, 12, 24) 90.1%)"
          : "radial-gradient(circle at 10% 20%, rgb(248, 249, 252) 0%, rgb(230, 235, 248) 90.1%)",
        p: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          background: isDarkMode
            ? "rgba(33, 33, 33, 0.9)"
            : "rgba(243, 229, 245, 0.9)",
          borderLeft: "4px solid #9c27b0",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          borderRadius: 2,
          p: 4,
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: "linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Page Not Found
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<Home />}
          component={Link}
          href="/"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Return Home
        </Button>
      </Box>
    </Box>
  );
}
