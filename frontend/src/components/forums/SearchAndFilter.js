"use client";
import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  AppBar,
  Toolbar,
  useTheme
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

const SearchAndFilter = ({ 
  onSearchChange, 
  onFilterChange,
  availableBoards,
  availableClubs
}) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [privacyFilter, setPrivacyFilter] = useState(null);

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleResetFilters = () => {
    setSelectedBoard(null);
    setSelectedClub(null);
    setPrivacyFilter(null);
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
      privacy: privacyFilter
    });
    handleFilterToggle();
  };

  return (
    <>
      <AppBar 
        position="sticky"
        color="default" 
        elevation={0} 
        sx={{ 
          mb: 4, 
          bgcolor: 'transparent', 
          boxShadow: 'none',
          top: 0,
          zIndex: theme.zIndex.appBar
        }}
      >
        <Toolbar>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search forums..."
            value={search}
            onChange={handleSearch}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ opacity: 0.6 }} />
                </InputAdornment>
              ),
              style: {
                height: '40px',
                fontSize: '0.95rem',
                paddingLeft: '4px',
              }
            }}
            sx={{ 
              maxWidth: 600,
              '& .MuiInputBase-root': {
                borderRadius: '24px',
                backgroundColor: '#f5f5f5',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#eeeeee',
                  transition: 'background-color 0.3s'
                }
              },
              '& .MuiInputBase-input::placeholder': {
                opacity: 0.7
              }
            }}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton onClick={handleFilterToggle}>
            <FilterListIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Dialog open={filterOpen} onClose={handleFilterToggle}>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Board</Typography>
            <RadioGroup
              value={selectedBoard || ""}
              onChange={(e) => setSelectedBoard(e.target.value)}
            >
              <FormControlLabel
                value=""
                control={<Radio />}
                label="All Boards"
              />
              {Object.entries(availableBoards || {}).map(([id, name]) => (
                <FormControlLabel
                  key={id}
                  value={id}
                  control={<Radio />}
                  label={name}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Club</Typography>
            <RadioGroup
              value={selectedClub || ""}
              onChange={(e) => setSelectedClub(e.target.value)}
            >
              <FormControlLabel
                value=""
                control={<Radio />}
                label="All Clubs"
              />
              {Object.entries(availableClubs || {}).map(([id, name]) => (
                <FormControlLabel
                  key={id}
                  value={id}
                  control={<Radio />}
                  label={name}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Privacy</Typography>
            <RadioGroup
              value={privacyFilter || ""}
              onChange={(e) => setPrivacyFilter(e.target.value)}
            >
              <FormControlLabel value="" control={<Radio />} label="All" />
              <FormControlLabel
                value="public"
                control={<Radio />}
                label="Public Only"
              />
              <FormControlLabel
                value="private"
                control={<Radio />}
                label="Private Only"
              />
            </RadioGroup>
          </FormControl>

          <Button
            onClick={handleResetFilters}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Reset Filters
          </Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Apply
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchAndFilter;