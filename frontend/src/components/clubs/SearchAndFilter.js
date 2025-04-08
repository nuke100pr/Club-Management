"use client";
import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  InputBase,
  IconButton,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  Drawer,
  Divider,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import noteContext from "../../contexts/noteContext";

const SearchAndFilter = ({ 
  onSearchChange, 
  onBoardFilterChange, 
  availableBoards,
  filterType,
  onFilterTypeChange
}) => {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const info = null;
  const value2 = null;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleResetFilters = () => {
    setSelectedBoard(null);
    onBoardFilterChange(null);
    onFilterTypeChange("all");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleBoardChange = (e) => {
    const value = e.target.value;
    setSelectedBoard(value);
    onBoardFilterChange(value);
  };

  const handleFilterTypeChange = (e) => {
    onFilterTypeChange(e.target.value);
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          top: 0, 
          bgcolor: 'transparent', 
          boxShadow: 'none', 
          mb: 4, 
          zIndex: theme => theme.zIndex.appBar 
        }}
      >
        <Toolbar>
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: 600,
              width: '100%',
              height: 40,
              bgcolor: '#f5f5f5',
              borderRadius: 24,
              pl: 1,
              transition: 'background-color 0.3s',
              '&:hover': {
                bgcolor: '#eeeeee',
              }
            }}
          >
            <SearchIcon sx={{ opacity: 0.6, mr: 1 }} />
            <InputBase
              placeholder="Search clubs..."
              value={search}
              onChange={handleSearchChange}
              fullWidth
              sx={{ 
                fontSize: '0.95rem',
                '& ::placeholder': {
                  opacity: 0.7
                },
                disableUnderline: true
              }}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleSidebarToggle}>
            <FilterListIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        variant="temporary"
        sx={{
          '& .MuiDrawer-paper': { 
            width: 280,
            p: 2,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={handleSidebarToggle} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f8f8', mb: 3, borderRadius: 2 }}>
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>Show:</Typography>
            <RadioGroup
              value={filterType}
              onChange={handleFilterTypeChange}
            >
              <FormControlLabel value="all" control={<Radio />} label="All Clubs" />
              {value2?.user_id && (
                <>
                  <FormControlLabel value="myClubs" control={<Radio />} label="My Followed Clubs" />
                  <FormControlLabel value="myBoards" control={<Radio />} label="My Followed Boards" />
                </>
              )}
            </RadioGroup>
          </FormControl>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f8f8', mb: 3, borderRadius: 2 }}>
          <FormControl component="fieldset" fullWidth>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>Filter by Board</Typography>
            <Select
              value={selectedBoard || ""}
              onChange={handleBoardChange}
              displayEmpty
              fullWidth
              sx={{ mb: 0 }}
              size="small"
            >
              <MenuItem value="">All Boards</MenuItem>
              {Object.entries(availableBoards).map(([id, name]) => (
                <MenuItem key={id} value={id}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
        
        <Button 
          onClick={handleResetFilters} 
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
        >
          Reset Filters
        </Button>
      </Drawer>
    </>
  );
};

export default SearchAndFilter;