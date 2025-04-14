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
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";

const SearchAndFilter = ({ onSearchChange, onFilterChange }) => {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  
  // Track if any filters are active
  const filterActive = selectedClub !== null || selectedBoard !== null || status !== null;
  
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

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleResetFilters = () => {
    setSelectedClub(null);
    setSelectedBoard(null);
    setStatus(null);
    onFilterChange({ club: null, board: null, status: null });
  };

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    onSearchChange(newSearch);
  };

  const applyFilters = () => {
    onFilterChange({
      club: selectedClub,
      board: selectedBoard,
      status: status,
    });
    handleFilterToggle();
  };
  
  const activeFiltersCount = [selectedClub, selectedBoard, status].filter(Boolean).length;

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
              placeholder="Search blogs..."
              value={search}
              onChange={handleSearchChange}
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
              onClick={handleFilterToggle}
              startIcon={<TuneIcon />}
              variant={filterActive ? "contained" : "outlined"}
              size="medium"
              sx={{ 
                ml: 2,
                borderRadius: '8px', 
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                height: 40,
                ...(filterActive 
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
              {filterActive && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: filterActive ? 'rgba(255, 255, 255, 0.8)' : '#4776E6',
                    color: filterActive ? '#4776E6' : 'white',
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

      {/* Filter Dialog */}
      <Dialog 
        open={filterOpen} 
        onClose={handleFilterToggle}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(95, 150, 230, 0.15)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
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
              onClick={handleFilterToggle} 
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
          
          <DialogContent sx={{ p: 0 }}>
            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 500, 
                  color: '#2A3B4F',
                  mb: 1
                }}
              >
                My Clubs
              </Typography>
              <RadioGroup
                value={selectedClub || ""}
                onChange={(e) => setSelectedClub(e.target.value || null)}
              >
                {["club123", "club789"].map((club) => (
                  <FormControlLabel
                    key={club}
                    value={club}
                    control={
                      <Radio 
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
                          color: selectedClub === club ? '#2A3B4F' : '#607080',
                          fontWeight: selectedClub === club ? 500 : 400
                        }}
                      >
                        {club === "club123" ? "Club 123" : "Club 789"}
                      </Typography>
                    }
                    sx={{ 
                      mb: 1,
                      py: 0.5,
                      px: 1,
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      bgcolor: selectedClub === club ? 'rgba(95, 150, 230, 0.08)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(95, 150, 230, 0.05)'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Divider sx={{ mb: 3, borderColor: 'rgba(95, 150, 230, 0.2)' }} />

            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 500, 
                  color: '#2A3B4F',
                  mb: 1
                }}
              >
                My Boards
              </Typography>
              <RadioGroup
                value={selectedBoard || ""}
                onChange={(e) => setSelectedBoard(e.target.value || null)}
              >
                {["board456", "board012"].map((board) => (
                  <FormControlLabel
                    key={board}
                    value={board}
                    control={
                      <Radio 
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
                          color: selectedBoard === board ? '#2A3B4F' : '#607080',
                          fontWeight: selectedBoard === board ? 500 : 400
                        }}
                      >
                        {board === "board456" ? "Board 456" : "Board 012"}
                      </Typography>
                    }
                    sx={{ 
                      mb: 1,
                      py: 0.5,
                      px: 1,
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      bgcolor: selectedBoard === board ? 'rgba(95, 150, 230, 0.08)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(95, 150, 230, 0.05)'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Divider sx={{ mb: 3, borderColor: 'rgba(95, 150, 230, 0.2)' }} />

            <FormControl component="fieldset" fullWidth>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 500, 
                  color: '#2A3B4F',
                  mb: 1
                }}
              >
                Status
              </Typography>
              <RadioGroup
                value={status || ""}
                onChange={(e) => setStatus(e.target.value || null)}
              >
                {["Running", "Completed", "Standby"].map((statusOption) => (
                  <FormControlLabel
                    key={statusOption}
                    value={statusOption}
                    control={
                      <Radio 
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
                          color: status === statusOption ? '#2A3B4F' : '#607080',
                          fontWeight: status === statusOption ? 500 : 400
                        }}
                      >
                        {statusOption}
                      </Typography>
                    }
                    sx={{ 
                      mb: 1,
                      py: 0.5,
                      px: 1,
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      bgcolor: status === statusOption ? 'rgba(95, 150, 230, 0.08)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(95, 150, 230, 0.05)'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="text" 
                onClick={handleResetFilters}
                disabled={!filterActive}
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
                onClick={applyFilters}
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
          </DialogContent>
        </Box>
      </Dialog>

      {/* Active filters display */}
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
          {selectedClub && (
            <Chip
              label={`Club: ${selectedClub === "club123" ? "Club 123" : "Club 789"}`}
              size="small"
              onDelete={() => {
                setSelectedClub(null);
                onFilterChange({
                  club: null,
                  board: selectedBoard,
                  status: status,
                });
              }}
              sx={{
                bgcolor: 'rgba(71, 118, 230, 0.1)',
                color: '#4776E6',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: '#4776E6',
                  '&:hover': {
                    color: '#3a5fc0',
                  }
                }
              }}
            />
          )}
          {selectedBoard && (
            <Chip
              label={`Board: ${selectedBoard === "board456" ? "Board 456" : "Board 012"}`}
              size="small"
              onDelete={() => {
                setSelectedBoard(null);
                onFilterChange({
                  club: selectedClub,
                  board: null,
                  status: status,
                });
              }}
              sx={{
                bgcolor: 'rgba(71, 118, 230, 0.1)',
                color: '#4776E6',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: '#4776E6',
                  '&:hover': {
                    color: '#3a5fc0',
                  }
                }
              }}
            />
          )}
          {status && (
            <Chip
              label={`Status: ${status}`}
              size="small"
              onDelete={() => {
                setStatus(null);
                onFilterChange({
                  club: selectedClub,
                  board: selectedBoard,
                  status: null,
                });
              }}
              sx={{
                bgcolor: 'rgba(71, 118, 230, 0.1)',
                color: '#4776E6',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: '#4776E6',
                  '&:hover': {
                    color: '#3a5fc0',
                  }
                }
              }}
            />
          )}
          {filterActive && (
            <Chip
              label="Clear all"
              size="small"
              onClick={() => {
                handleResetFilters();
              }}
              sx={{
                borderColor: '#4776E6',
                color: '#4776E6',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'rgba(71, 118, 230, 0.08)',
                  borderColor: '#3a5fc0',
                }
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