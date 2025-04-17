

"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Drawer,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Chip,
  InputAdornment,
  Toolbar,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";

const SearchAndFilter = ({
  onSearchChange,
  onFilterChange,
  availableBoards,
  availableClubs,
}) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleResetFilters = () => {
    setSelectedBoard("");
    setSelectedClub("");
    setPrivacyFilter("");
    onFilterChange({ board: "", club: "", privacy: "" });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleApplyFilters = () => {
    onFilterChange({
      board: selectedBoard,
      club: selectedClub,
      privacy: privacyFilter,
    });
    handleFilterToggle();
  };

  const handleDeleteFilter = (filterType) => {
    if (filterType === "board") {
      setSelectedBoard("");
      onFilterChange({ board: "", club: selectedClub, privacy: privacyFilter });
    } else if (filterType === "club") {
      setSelectedClub("");
      onFilterChange({ board: selectedBoard, club: "", privacy: privacyFilter });
    } else if (filterType === "privacy") {
      setPrivacyFilter("");
      onFilterChange({ board: selectedBoard, club: selectedClub, privacy: "" });
    }
  };

  const activeFilters = [];
  if (selectedBoard) {
    activeFilters.push({
      type: "board",
      label: `Board: ${availableBoards[selectedBoard]}`,
    });
  }
  if (selectedClub) {
    activeFilters.push({
      type: "club",
      label: `Club: ${availableClubs[selectedClub]}`,
    });
  }
  if (privacyFilter) {
    activeFilters.push({
      type: "privacy",
      label: `Privacy: ${privacyFilter.charAt(0).toUpperCase() + privacyFilter.slice(1)}`,
    });
  }
  const filterCount = activeFilters.length;

  return (
    <Box
      sx={{
        mb: isSticky ? 16 : 4,
        position: "relative",
        zIndex: 1100,
      }}
    >
      <Paper
        elevation={isSticky ? 4 : 0}
        sx={{
          borderRadius: "16px",
          background: "white",
          boxShadow: isSticky
            ? "0 6px 16px rgba(95, 150, 230, 0.2)"
            : "0 4px 12px rgba(95, 150, 230, 0.1)",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(95, 150, 230, 0.15)",
          },
          position: isSticky ? "fixed" : "relative",
          top: isSticky ? 16 : "auto",
          left: isSticky ? 0 : "auto",
          right: isSticky ? 0 : "auto",
          width: isSticky ? "calc(100% - 32px)" : "100%",
          maxWidth: isSticky ? "1200px" : "100%",
          margin: isSticky ? "16px auto" : 0,
          transform: isSticky ? "translateY(0)" : "none",
          animation: isSticky ? "slideDown 0.3s ease" : "none",
          "@keyframes slideDown": {
            from: { transform: "translateY(-100%)" },
            to: { transform: "translateY(0)" },
          },
        }}
            >
        <Toolbar sx={{ py: 0.5, px: 2 }}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search forums..."
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#4776E6", opacity: 0.8 }} />
                </InputAdornment>
              ),
              disableUnderline: true,
              sx: {
                fontSize: "0.95rem",
                color: "#2A3B4F",
                "&::placeholder": {
                  color: "#607080",
                  opacity: 0.7,
                },
              },
            }}
            sx={{
              maxWidth: "100%",
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(248, 250, 255, 0.8)",
                borderRadius: "12px",
                pl: 1,
                height: 48,
                transition: "all 0.3s ease",
                "&:hover, &:focus-within": {
                  backgroundColor: "rgba(248, 250, 255, 1)",
                  boxShadow: "0 2px 8px rgba(95, 150, 230, 0.1)",
                },
              },
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            onClick={handleFilterToggle}
            startIcon={<TuneIcon />}
            variant={filterCount > 0 ? "contained" : "outlined"}
            size="medium"
            sx={{
              ml: 2,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              px: 2,
              height: 40,
              ...(filterCount > 0
                ? {
                    background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                    boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                      background: "linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)",
                    },
                  }
                : {
                    borderColor: "#4776E6",
                    color: "#4776E6",
                    "&:hover": {
                      borderColor: "#3a5fc0",
                      color: "#3a5fc0",
                      backgroundColor: "rgba(71, 118, 230, 0.05)",
                    },
                  }),
            }}
          >
            Filters
            {filterCount > 0 && (
              <Box
                sx={{
                  ml: 1,
                  bgcolor: filterCount > 0 ? "rgba(255, 255, 255, 0.8)" : "#4776E6",
                  color: filterCount > 0 ? "#4776E6" : "white",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {filterCount}
              </Box>
            )}
          </Button>
        </Toolbar>
      </Paper>

      {activeFilters.length > 0 && (
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {activeFilters.map((filter) => (
            <Chip
              key={filter.type}
              label={filter.label}
              onDelete={() => handleDeleteFilter(filter.type)}
              deleteIcon={<CloseIcon />}
              sx={{
                bgcolor: "rgba(95, 150, 230, 0.08)",
                color: "#2A3B4F",
                "&:hover": {
                  bgcolor: "rgba(95, 150, 230, 0.12)",
                },
              }}
            />
          ))}
          <Chip
            label="Clear all"
            onClick={handleResetFilters}
            sx={{
              bgcolor: "rgba(95, 150, 230, 0.08)",
              color: "#2A3B4F",
              "&:hover": {
                bgcolor: "rgba(95, 150, 230, 0.12)",
              },
            }}
          />
        </Box>
      )}

      <Drawer
        anchor="right"
        open={filterOpen}
        onClose={handleFilterToggle}
        PaperProps={{
          sx: {
            width: 320,
            p: 3,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: "-4px 0 20px rgba(95, 150, 230, 0.15)",
            backgroundColor: "#f8faff",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Filters
          </Typography>
          <IconButton
            onClick={handleFilterToggle}
            size="small"
            sx={{
              borderRadius: "8px",
              backgroundColor: "rgba(95, 150, 230, 0.1)",
              color: "#4776E6",
              "&:hover": {
                backgroundColor: "rgba(95, 150, 230, 0.2)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3, borderColor: "rgba(95, 150, 230, 0.2)" }} />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: "#607080", "&.Mui-focused": { color: "#4776E6" } }}>
            Board
          </InputLabel>
          <Select
            value={selectedBoard}
            label="Board"
            onChange={(e) => setSelectedBoard(e.target.value)}
            sx={{
              "& .MuiSelect-select": { color: selectedBoard ? "#2A3B4F" : "#607080" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: selectedBoard ? "#4776E6" : "rgba(95, 150, 230, 0.2)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4776E6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4776E6",
              },
            }}
          >
            <MenuItem value="">All Boards</MenuItem>
            {Object.entries(availableBoards || {}).map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: "#607080", "&.Mui-focused": { color: "#4776E6" } }}>
            Club
          </InputLabel>
          <Select
            value={selectedClub}
            label="Club"
            onChange={(e) => setSelectedClub(e.target.value)}
            sx={{
              "& .MuiSelect-select": { color: selectedClub ? "#2A3B4F" : "#607080" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: selectedClub ? "#4776E6" : "rgba(95, 150, 230, 0.2)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4776E6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4776E6",
              },
            }}
          >
            <MenuItem value="">All Clubs</MenuItem>
            {Object.entries(availableClubs || {}).map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: "#607080", "&.Mui-focused": { color: "#4776E6" } }}>
            Privacy
          </InputLabel>
          <Select
            value={privacyFilter}
            label="Privacy"
            onChange={(e) => setPrivacyFilter(e.target.value)}
            sx={{
              "& .MuiSelect-select": { color: privacyFilter ? "#2A3B4F" : "#607080" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: privacyFilter ? "#4776E6" : "rgba(95, 150, 230, 0.2)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4776E6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4776E6",
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="public">Public Only</MenuItem>
            <MenuItem value="private">Private Only</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="text"
            onClick={handleResetFilters}
            disabled={filterCount === 0}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              color: "#607080",
              "&:hover": {
                color: "#2A3B4F",
                backgroundColor: "rgba(95, 150, 230, 0.05)",
              },
              "&.Mui-disabled": {
                color: "rgba(96, 112, 128, 0.4)",
              },
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
              borderRadius: "8px",
              px: 3,
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                background: "linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SearchAndFilter;