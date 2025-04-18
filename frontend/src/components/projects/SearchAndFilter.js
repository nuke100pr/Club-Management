"use client";
import React, { useState, useEffect } from "react";
import {
  Toolbar,
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  InputAdornment,
  Divider,
  Paper,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";

const SearchAndFilter = ({ onSearchChange, onFilterChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const filterActive = status !== null;

  // Dynamic colors based on theme
  const paperBg = isDark ? theme.palette.background.paper : '#ffffff';
  const textPrimary = isDark ? theme.palette.text.primary : '#2A3B4F';
  const textSecondary = isDark ? theme.palette.text.secondary : '#607080';
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const chipBg = isDark ? '#5d8aff30' : '#4776E620';
  const chipColor = isDark ? '#78a6ff' : '#4776E6';
  const inputBg = isDark ? '#1a202c' : '#f8fafc';
  const borderColor = isDark ? '#2d3748' : '#e2e8f0';

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
    setStatus(null);
    onFilterChange({ status: null });
  };

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    onSearchChange(newSearch);
  };

  const applyFilters = () => {
    onFilterChange({ status });
    handleFilterToggle();
  };

  const activeFiltersCount = status ? 1 : 0;

  return (
    <>
      <Box sx={{ mb: isSticky ? 16 : 4, position: "relative", zIndex: 1100 }}>
        <Paper
          elevation={isSticky ? 4 : 0}
          sx={{
            borderRadius: "16px",
            background: paperBg,
            boxShadow: isSticky
              ? `0 6px 16px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(95, 150, 230, 0.2)'}`
              : `0 4px 12px ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(95, 150, 230, 0.1)'}`,
            "&:hover": {
              boxShadow: `0 6px 16px ${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(95, 150, 230, 0.15)'}`,
            },
            position: isSticky ? "fixed" : "relative",
            top: isSticky ? 0 : "auto",
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
              placeholder="Search projects..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: primaryColor, opacity: 0.8 }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: {
                  fontSize: "0.95rem",
                  color: textPrimary,
                  "&::placeholder": {
                    color: textSecondary,
                    opacity: 0.7,
                  },
                },
              }}
              sx={{
                maxWidth: "100%",
                "& .MuiInputBase-root": {
                  backgroundColor: inputBg,
                  borderRadius: "12px",
                  pl: 1,
                  height: 48,
                  transition: "all 0.3s ease",
                  border: `1px solid ${borderColor}`,
                  "&:hover, &:focus-within": {
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    boxShadow: `0 2px 8px ${isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(95, 150, 230, 0.1)'}`,
                    borderColor: primaryColor,
                  },
                },
              }}
            />

            <Box sx={{ flexGrow: 1 }} />

            <Button
              onClick={handleFilterToggle}
              startIcon={<TuneIcon />}
              variant={filterActive ? "contained" : "outlined"}
              size="medium"
              sx={{
                ml: 2,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                px: 2,
                height: 40,
                ...(filterActive
                  ? {
                      background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      boxShadow: `0 4px 10px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(71, 118, 230, 0.3)'}`,
                      "&:hover": {
                        boxShadow: `0 6px 15px ${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(71, 118, 230, 0.4)'}`,
                        background: `linear-gradient(90deg, ${isDark ? '#3a5fc0' : '#3a5fc0'} 0%, ${isDark ? '#7b46c7' : '#7b46c7'} 100%)`,
                      },
                    }
                  : {
                      borderColor: primaryColor,
                      color: primaryColor,
                      "&:hover": {
                        borderColor: isDark ? '#5d8aff' : '#3a5fc0',
                        color: isDark ? '#5d8aff' : '#3a5fc0',
                        backgroundColor: isDark ? '#1e293b' : 'rgba(71, 118, 230, 0.05)',
                      },
                    }),
              }}
            >
              Filters
              {filterActive && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                    color: isDark ? '#ffffff' : primaryColor,
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
                  {activeFiltersCount}
                </Box>
              )}
            </Button>
          </Toolbar>
        </Paper>
      </Box>

      <Dialog
        open={filterOpen}
        onClose={handleFilterToggle}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: "100%",
            maxWidth: 400,
            boxShadow: `0 8px 32px ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(95, 150, 230, 0.15)'}`,
            overflow: "hidden",
            backgroundColor: paperBg,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Filter by Status
            </Typography>
            <IconButton
              onClick={handleFilterToggle}
              size="small"
              sx={{
                borderRadius: "8px",
                backgroundColor: isDark ? 'rgba(95, 150, 230, 0.1)' : 'rgba(95, 150, 230, 0.1)',
                color: primaryColor,
                "&:hover": {
                  backgroundColor: isDark ? 'rgba(95, 150, 230, 0.2)' : 'rgba(95, 150, 230, 0.2)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3, borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(95, 150, 230, 0.2)' }} />

          <DialogContent sx={{ p: 0 }}>
            <FormControl component="fieldset" fullWidth>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  color: textPrimary,
                  mb: 1,
                }}
              >
                Project Status
              </Typography>
              <RadioGroup
                value={status || ""}
                onChange={(e) => setStatus(e.target.value || null)}
              >
                {["Running", "Completed", "Inactive"].map((statusOption) => (
                  <FormControlLabel
                    key={statusOption}
                    value={statusOption}
                    control={
                      <Radio
                        sx={{
                          color: textSecondary,
                          "&.Mui-checked": {
                            color: primaryColor,
                          },
                          "& .MuiSvgIcon-root": {
                            fontSize: 22,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          color: status === statusOption ? textPrimary : textSecondary,
                          fontWeight: status === statusOption ? 500 : 400,
                        }}
                      >
                        {statusOption}
                      </Typography>
                    }
                    sx={{
                      mb: 1,
                      py: 0.5,
                      px: 1,
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      bgcolor: status === statusOption
                        ? isDark ? 'rgba(95, 150, 230, 0.2)' : 'rgba(95, 150, 230, 0.08)'
                        : "transparent",
                      "&:hover": {
                        bgcolor: isDark ? 'rgba(95, 150, 230, 0.1)' : 'rgba(95, 150, 230, 0.05)',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="text"
                onClick={handleResetFilters}
                disabled={!filterActive}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  color: textSecondary,
                  "&:hover": {
                    color: textPrimary,
                    backgroundColor: isDark ? 'rgba(95, 150, 230, 0.1)' : 'rgba(95, 150, 230, 0.05)',
                  },
                  "&.Mui-disabled": {
                    color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(96, 112, 128, 0.4)',
                  },
                }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={applyFilters}
                sx={{
                  background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  boxShadow: `0 4px 10px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(71, 118, 230, 0.3)'}`,
                  borderRadius: "8px",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    boxShadow: `0 6px 15px ${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(71, 118, 230, 0.4)'}`,
                    background: `linear-gradient(90deg, ${isDark ? '#3a5fc0' : '#3a5fc0'} 0%, ${isDark ? '#7b46c7' : '#7b46c7'} 100%)`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Apply Filter
              </Button>
            </Box>
          </DialogContent>
        </Box>
      </Dialog>

      {filterActive && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mt: -3, mb: 2, px: 1 }}>
          {status && (
            <Chip
              label={`Status: ${status}`}
              size="small"
              onDelete={() => {
                setStatus(null);
                onFilterChange({ status: null });
              }}
              sx={{
                bgcolor: chipBg,
                color: chipColor,
                fontWeight: 500,
                "& .MuiChip-deleteIcon": {
                  color: chipColor,
                  "&:hover": {
                    color: isDark ? '#5d8aff' : '#3a5fc0',
                  },
                },
              }}
            />
          )}
          {filterActive && (
            <Chip
              label="Clear all"
              size="small"
              onClick={handleResetFilters}
              sx={{
                borderColor: primaryColor,
                color: primaryColor,
                fontWeight: 500,
                "&:hover": {
                  bgcolor: isDark ? 'rgba(95, 150, 230, 0.1)' : 'rgba(71, 118, 230, 0.08)',
                  borderColor: isDark ? '#5d8aff' : '#3a5fc0',
                },
              }}
              variant="outlined"
            />
          )}
        </Box>
      )}
    </>
  );
};

export default SearchAndFilter;