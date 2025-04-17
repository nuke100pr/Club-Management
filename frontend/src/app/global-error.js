"use client";

import { Box, Typography, Button, useTheme } from "@mui/material";
import { Refresh } from "@mui/icons-material";

export default function GlobalError({ error, reset }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <html>
      <body>
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
                ? "rgba(95, 33, 32, 0.9)"
                : "rgba(253, 237, 237, 0.9)",
              borderLeft: "4px solid #f44336",
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
                background: "linear-gradient(135deg, #f44336 0%, #ff5252 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Critical Application Error
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
              {error.message || "A critical error occurred in the application"}
            </Typography>

            <Button
              variant="contained"
              color="error"
              startIcon={<Refresh />}
              onClick={() => reset()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                background: "linear-gradient(135deg, #f44336 0%, #ff5252 100%)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Reload Application
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{ opacity: 0.7, maxWidth: "600px", mt: 2 }}
          >
            If the problem persists, please contact support.
          </Typography>
        </Box>
      </body>
    </html>
  );
}
