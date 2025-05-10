"use client";
import { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { getAuthToken } from "@/utils/auth";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  return (
    <Paper
      sx={{
        p: 3,
        position: "sticky",
        top: 80,
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
        },
        backgroundColor: "#FFFFFF",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          color: "#1A2A56",
          fontWeight: 600,
        }}
      >
        Search
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#A7B3CA" }} />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => setSearchTerm("")}
                size="small"
              >
                <ClearIcon sx={{ color: "#A7B3CA" }} />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: {
            height: "48px",
            borderRadius: "8px",
            backgroundColor: "#F7F9FC",
            "&:hover": {
              backgroundColor: "#F7F9FC",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E8ECF2",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#0F52BA",
              borderWidth: "2px",
            },
          },
        }}
        sx={{
          mb: 2,
          "& .MuiInputLabel-root": {
            color: "#A7B3CA",
          },
        }}
      />
      {searchTerm && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setSearchTerm("")}
            sx={{
              color: "#0F52BA",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#E6F0FF",
              },
              textTransform: "none",
            }}
            startIcon={<ClearIcon fontSize="small" />}
          >
            Clear Search
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SearchBar;