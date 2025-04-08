import React, { useState } from "react";
import {
  AppBar, Toolbar, Box, IconButton, Menu, MenuItem, Checkbox, FormControlLabel,
  Typography, Divider, Button, InputAdornment, InputBase
} from "@mui/material";
import {
  Search as SearchIcon, FilterList as FilterListIcon, Close as CloseIcon
} from "@mui/icons-material";

const SearchAndFilterBar = ({
  searchTerm,
  setSearchTerm,
  allKeywords,
  selectedKeywords,
  setSelectedKeywords,
  filterActive,
  setFilterActive,
  handleFilterReset
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Filter handlers
  const handleFilterToggle = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  
  const handleFilterApply = () => {
    setFilterActive(selectedKeywords.length > 0);
    handleFilterClose();
  };
  
  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
    );
  };

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0} 
      sx={{ 
        bgcolor: 'transparent', 
        boxShadow: 'none', 
        mb: 4, 
        borderBottom: 'none' 
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        <InputBase
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            bgcolor: '#f5f5f5',
            borderRadius: '24px',
            pl: 1,
            height: '40px',
            fontSize: '0.95rem',
            maxWidth: 600,
            width: '100%',
            transition: 'background-color 0.3s',
            '&:hover': {
              bgcolor: '#eeeeee',
            },
          }}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ opacity: 0.6, ml: 1 }} />
            </InputAdornment>
          }
          inputProps={{ style: { paddingLeft: 8 } }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={handleFilterToggle}
          size="medium"
          sx={{
            color: filterActive ? 'primary.main' : 'text.secondary',
          }}
        >
          <FilterListIcon />
        </IconButton>
          
        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          PaperProps={{ sx: { width: 280, maxHeight: 400, p: 2 } }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">Filters</Typography>
            <IconButton size="small" onClick={handleFilterClose}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Keywords</Typography>
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
            <Button variant="outlined" size="small" onClick={handleFilterReset}>Reset</Button>
            <Button variant="contained" size="small" onClick={handleFilterApply}>Apply Filters</Button>
          </Box>
        </Menu>
      </Toolbar>

      {/* Active Filters */}
      <Box sx={{ px: { xs: 2, sm: 3 } }}>
        {filterActive && (
          <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selectedKeywords.map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                size="small"
                onDelete={() => {
                  setSelectedKeywords(prev => prev.filter(k => k !== keyword));
                  if (selectedKeywords.length === 1) setFilterActive(false);
                }}
              />
            ))}
            {selectedKeywords.length > 0 && (
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
      </Box>
    </AppBar>
  );
};

export default SearchAndFilterBar;