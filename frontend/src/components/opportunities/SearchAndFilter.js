"use client";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Typography,
  Button,
  RadioGroup,
  Radio,
  FormControl,
  InputBase,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";

const SearchAndFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter, 
  selectedKeywords, 
  setSelectedKeywords, 
  filterActive, 
  setFilterActive,
  allKeywords 
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const handleFilterToggle = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterApply = () => {
    setFilterActive(selectedKeywords.length > 0 || categoryFilter !== "all");
    handleFilterClose();
  };

  const handleFilterReset = () => {
    setSelectedKeywords([]);
    setCategoryFilter("all");
    setFilterActive(false);
    handleFilterClose();
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  return (
    <AppBar 
      position="sticky" 
      color="transparent" 
      elevation={0} 
      sx={{ 
        boxShadow: 'none', 
        bgcolor: 'transparent',
        mb: 4,
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ p: 0 }}>
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 600,
            height: 40,
            borderRadius: 24,
            bgcolor: '#f5f5f5',
            '&:hover': {
              bgcolor: '#eeeeee',
              transition: 'background-color 0.3s'
            },
            pl: 1,
          }}
        >
          <SearchIcon sx={{ opacity: 0.6, mx: 1 }} />
          <InputBase
            placeholder="Search opportunities..."
            sx={{
              flex: 1,
              fontSize: '0.95rem',
              "& .MuiInputBase-input": {
                p: 1,
              },
              "&::placeholder": {
                opacity: 0.7,
              },
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disableUnderline
          />
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={handleFilterToggle}
          color={filterActive ? "primary" : "default"}
        >
          <FilterListIcon />
        </IconButton>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          PaperProps={{
            sx: {
              width: 280,
              maxHeight: 400,
              p: 2,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Filters
            </Typography>
            <IconButton size="small" onClick={handleFilterClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Category Filter */}
          <Typography variant="subtitle2" gutterBottom>
            Category
          </Typography>
          <FormControl component="fieldset" sx={{ mb: 2, ml: 1 }}>
            <RadioGroup
              value={categoryFilter}
              onChange={handleCategoryChange}
              name="category-filter"
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label="All"
              />
              <FormControlLabel
                value="my clubs"
                control={<Radio size="small" />}
                label="My Clubs"
              />
              <FormControlLabel
                value="my boards"
                control={<Radio size="small" />}
                label="My Boards"
              />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Keywords
          </Typography>
          <Box sx={{ mb: 2, display: "flex", flexDirection: "column" }}>
            {allKeywords.map((keyword) => (
              <FormControlLabel
                key={keyword}
                control={
                  <Checkbox
                    checked={selectedKeywords.includes(keyword)}
                    onChange={() => handleKeywordToggle(keyword)}
                    size="small"
                  />
                }
                label={keyword}
              />
            ))}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleFilterReset}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleFilterApply}
            >
              Apply Filters
            </Button>
          </Box>
        </Menu>
      </Toolbar>

      {/* Active filters display */}
      {filterActive && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            pt: 0,
            pb: 1.5,
            px: 3,
          }}
        >
          {categoryFilter !== "all" && (
            <Chip
              label={`Category: ${categoryFilter}`}
              size="small"
              onDelete={() => setCategoryFilter("all")}
            />
          )}
          {selectedKeywords.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              size="small"
              onDelete={() => {
                setSelectedKeywords((prev) =>
                  prev.filter((k) => k !== keyword)
                );
                if (
                  selectedKeywords.length === 1 &&
                  categoryFilter === "all"
                ) {
                  setFilterActive(false);
                }
              }}
            />
          ))}
          {(selectedKeywords.length > 0 || categoryFilter !== "all") && (
            <Chip
              label="Clear all"
              size="small"
              color="primary"
              variant="outlined"
              onClick={handleFilterReset}
            />
          )}
        </Box>
      )}
    </AppBar>
  );
};

export default SearchAndFilter;