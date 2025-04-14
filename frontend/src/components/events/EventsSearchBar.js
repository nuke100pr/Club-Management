import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Drawer,
  Divider,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";

const EventsSearchBar = ({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  filters,
  clearFilters
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Handle scroll event to make the search bar sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Make sticky after scrolling past a certain threshold (e.g., 100px)
      setIsSticky(scrollPosition > 100);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <>
      <Box 
        sx={{ 
          mb: isSticky ? 16 : 4, // Add margin bottom when sticky to prevent content jump
          position: 'relative',
          zIndex: 1100,
        }}
      >
        <Paper 
          elevation={isSticky ? 4 : 0} 
          sx={{ 
            borderRadius: '16px',
            background: 'white',
            boxShadow: isSticky 
              ? '0 6px 16px rgba(95, 150, 230, 0.2)' 
              : '0 4px 12px rgba(95, 150, 230, 0.1)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(95, 150, 230, 0.15)',
            },
            position: isSticky ? 'fixed' : 'relative',
            top: isSticky ? 0 : 'auto',
            left: isSticky ? 0 : 'auto',
            right: isSticky ? 0 : 'auto',
            width: isSticky ? 'calc(100% - 32px)' : '100%',
            maxWidth: isSticky ? '1200px' : '100%', 
            margin: isSticky ? '16px auto' : 0,
            transform: isSticky ? 'translateY(0)' : 'none',
            animation: isSticky ? 'slideDown 0.3s ease' : 'none',
            '@keyframes slideDown': {
              from: { transform: 'translateY(-100%)' },
              to: { transform: 'translateY(0)' }
            }
          }}
        >
          <Toolbar sx={{ py: 0.5, px: 2 }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#4776E6', opacity: 0.8 }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { 
                  fontSize: '0.95rem',
                  color: '#2A3B4F',
                  '&::placeholder': {
                    color: '#607080',
                    opacity: 0.7
                  }
                }
              }}
              sx={{ 
                maxWidth: '100%',
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(248, 250, 255, 0.8)',
                  borderRadius: '12px',
                  pl: 1,
                  height: 48,
                  transition: 'all 0.3s ease',
                  '&:hover, &:focus-within': {
                    backgroundColor: 'rgba(248, 250, 255, 1)',
                    boxShadow: '0 2px 8px rgba(95, 150, 230, 0.1)'
                  }
                }
              }}
            />
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Button
              onClick={toggleFilterDrawer}
              startIcon={<TuneIcon />}
              variant={activeFiltersCount > 0 ? "contained" : "outlined"}
              size="medium"
              sx={{ 
                ml: 2,
                borderRadius: '8px', 
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                height: 40,
                ...(activeFiltersCount > 0 
                  ? {
                      background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                      boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
                        background: 'linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)',
                      }
                    } 
                  : {
                      borderColor: '#4776E6',
                      color: '#4776E6',
                      '&:hover': {
                        borderColor: '#3a5fc0',
                        color: '#3a5fc0',
                        backgroundColor: 'rgba(71, 118, 230, 0.05)'
                      }
                    })
              }}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: activeFiltersCount > 0 ? 'rgba(255, 255, 255, 0.8)' : '#4776E6',
                    color: activeFiltersCount > 0 ? '#4776E6' : 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {activeFiltersCount}
                </Box>
              )}
            </Button>
          </Toolbar>
        </Paper>
      </Box>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: '-4px 0 20px rgba(95, 150, 230, 0.15)',
            backgroundColor: '#f8faff'
          }
        }}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Filters
            </Typography>
            <IconButton 
              onClick={toggleFilterDrawer} 
              size="small"
              sx={{ 
                borderRadius: '8px',
                backgroundColor: 'rgba(95, 150, 230, 0.1)',
                color: '#4776E6',
                '&:hover': {
                  backgroundColor: 'rgba(95, 150, 230, 0.2)',
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3, borderColor: 'rgba(95, 150, 230, 0.2)' }} />
          
          <FormControl component="fieldset" fullWidth>
            <FormGroup>
              {filters.map((filter) => (
                <FormControlLabel
                  key={filter}
                  control={
                    <Checkbox
                      checked={selectedFilters[filter] || false}
                      onChange={onFilterChange}
                      name={filter}
                      sx={{ 
                        color: '#607080',
                        '&.Mui-checked': {
                          color: '#4776E6',
                        },
                        '& .MuiSvgIcon-root': { 
                          fontSize: 22
                        } 
                      }}
                    />
                  }
                  label={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedFilters[filter] ? '#2A3B4F' : '#607080',
                        fontWeight: selectedFilters[filter] ? 500 : 400
                      }}
                    >
                      {filter}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1.5,
                    py: 0.5,
                    px: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    bgcolor: selectedFilters[filter] ? 'rgba(95, 150, 230, 0.08)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(95, 150, 230, 0.05)'
                    }
                  }}
                />
              ))}
            </FormGroup>
          </FormControl>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="text" 
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                color: '#607080',
                '&:hover': {
                  color: '#2A3B4F',
                  backgroundColor: 'rgba(95, 150, 230, 0.05)'
                },
                '&.Mui-disabled': {
                  color: 'rgba(96, 112, 128, 0.4)'
                }
              }}
            >
              Clear All
            </Button>
            <Button 
              variant="contained" 
              onClick={toggleFilterDrawer}
              sx={{ 
                background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
                borderRadius: '8px',
                px: 3,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(71, 118, 230, 0.4)',
                  background: 'linear-gradient(90deg, #3a5fc0 0%, #7b46c7 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default EventsSearchBar;