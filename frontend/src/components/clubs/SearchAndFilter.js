"use client";
import React, { useState, useEffect } from "react";
import {
  Toolbar,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Drawer,
  Divider,
  IconButton,
  FormControl,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";

const SearchAndFilter = ({
  onSearchChange,
  onBoardFilterChange,
  availableBoards,
  filterType,
  onFilterTypeChange,
}) => {
  const [search, setSearch] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [filterActive, setFilterActive] = useState(false);

  // Handle scroll event to make the search bar sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleBoardChange = (value) => {
    setSelectedBoard(value);
    onBoardFilterChange(value);
    setFilterActive(value || filterType !== "all");
  };

  const handleFilterTypeChangeInternal = (e) => {
    const value = e.target.value;
    onFilterTypeChange(value);
    setFilterActive(value !== "all" || selectedBoard);
  };

  const handleFilterApply = () => {
    setFilterActive(selectedBoard || filterType !== "all");
    toggleFilterDrawer();
  };

  const handleFilterReset = () => {
    setSelectedBoard(null);
    onBoardFilterChange(null);
    onFilterTypeChange("all");
    setSearch("");
    onSearchChange("");
    setFilterActive(false);
  };

  const activeFiltersCount =
    (selectedBoard ? 1 : 0) + (filterType !== "all" ? 1 : 0);

  return (
    <>
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
            top: isSticky ? 64 : "auto",
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
              placeholder="Search clubs..."
              value={search}
              onChange={handleSearchChange}
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
              onClick={toggleFilterDrawer}
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
                      background:
                        "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                      boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                        background:
                          "linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)",
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
              {filterActive && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: filterActive
                      ? "rgba(255, 255, 255, 0.8)"
                      : "#4776E6",
                    color: filterActive ? "#4776E6" : "white",
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

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: "-4px 0 20px rgba(95, 150, 230, 0.15)",
            backgroundColor: "#f8faff",
          },
        }}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
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
              onClick={toggleFilterDrawer}
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

          {/* Filter Type */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: "#2A3B4F",
              mb: 2,
            }}
          >
            Show
          </Typography>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <RadioGroup
              value={filterType}
              onChange={handleFilterTypeChangeInternal}
              name="filter-type"
            >
              {["all", "myClubs", "myBoards"].map((type) => (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={
                    <Radio
                      sx={{
                        color: "#607080",
                        "&.Mui-checked": {
                          color: "#4776E6",
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
                        color: filterType === type ? "#2A3B4F" : "#607080",
                        fontWeight: filterType === type ? 500 : 400,
                        textTransform: "capitalize",
                      }}
                    >
                      {type === "all"
                        ? "All Clubs"
                        : type === "myClubs"
                        ? "My Followed Clubs"
                        : "My Followed Boards"}
                    </Typography>
                  }
                  sx={{
                    mb: 1.5,
                    py: 0.5,
                    px: 1,
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    bgcolor:
                      filterType === type
                        ? "rgba(95, 150, 230, 0.08)"
                        : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(95, 150, 230, 0.05)",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Divider sx={{ mb: 3, borderColor: "rgba(95, 150, 230, 0.2)" }} />

          {/* Board Filter */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: "#2A3B4F",
              mb: 2,
            }}
          >
            Board
          </Typography>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <RadioGroup
              value={selectedBoard || ""}
              onChange={(e) => handleBoardChange(e.target.value)}
              name="board-filter"
            >
              <FormControlLabel
                value=""
                control={
                  <Radio
                    sx={{
                      color: "#607080",
                      "&.Mui-checked": {
                        color: "#4776E6",
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
                      color: !selectedBoard ? "#2A3B4F" : "#607080",
                      fontWeight: !selectedBoard ? 500 : 400,
                    }}
                  >
                    All Boards
                  </Typography>
                }
                sx={{
                  mb: 1.5,
                  py: 0.5,
                  px: 1,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  bgcolor: !selectedBoard
                    ? "rgba(95, 150, 230, 0.08)"
                    : "transparent",
                  "&:hover": {
                    bgcolor: "rgba(95, 150, 230, 0.05)",
                  },
                }}
              />
              {Object.entries(availableBoards).map(([id, name]) => (
                <FormControlLabel
                  key={id}
                  value={id}
                  control={
                    <Radio
                      sx={{
                        color: "#607080",
                        "&.Mui-checked": {
                          color: "#4776E6",
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
                        color: selectedBoard === id ? "#2A3B4F" : "#607080",
                        fontWeight: selectedBoard === id ? 500 : 400,
                      }}
                    >
                      {name}
                    </Typography>
                  }
                  sx={{
                    mb: 1.5,
                    py: 0.5,
                    px: 1,
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    bgcolor:
                      selectedBoard === id
                        ? "rgba(95, 150, 230, 0.08)"
                        : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(95, 150, 230, 0.05)",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="text"
              onClick={handleFilterReset}
              disabled={!filterActive}
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
              onClick={handleFilterApply}
              sx={{
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)",
                borderRadius: "8px",
                px: 3,
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  boxShadow: "0 6px 15px rgba(71, 118, 230, 0.4)",
                  background:
                    "linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Active Filters Display */}
      {filterActive && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.8,
            mt: -3,
            mb: 2,
            px: 1,
          }}
        >
          {filterType !== "all" && (
            <Chip
              label={`Show: ${
                filterType === "myClubs"
                  ? "My Followed Clubs"
                  : "My Followed Boards"
              }`}
              size="small"
              onDelete={() => {
                onFilterTypeChange("all");
                if (!selectedBoard) setFilterActive(false);
              }}
              sx={{
                bgcolor: "rgba(71, 118, 230, 0.1)",
                color: "#4776E6",
                fontWeight: 500,
                "& .MuiChip-deleteIcon": {
                  color: "#4776E6",
                  "&:hover": {
                    color: "#3a5fc0",
                  },
                },
              }}
            />
          )}
          {selectedBoard && (
            <Chip
              label={`Board: ${availableBoards[selectedBoard]}`}
              size="small"
              onDelete={() => {
                setSelectedBoard(null);
                onBoardFilterChange(null);
                if (filterType === "all") setFilterActive(false);
              }}
              sx={{
                bgcolor: "rgba(71, 118, 230, 0.1)",
                color: "#4776E6",
                fontWeight: 500,
                "& .MuiChip-deleteIcon": {
                  color: "#4776E6",
                  "&:hover": {
                    color: "#3a5fc0",
                  },
                },
              }}
            />
          )}
          {(selectedBoard || filterType !== "all") && (
            <Chip
              label="Clear all"
              size="small"
              onClick={handleFilterReset}
              sx={{
                borderColor: "#4776E6",
                color: "#4776E6",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "rgba(71, 118, 230, 0.08)",
                  borderColor: "#3a5fc0",
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
