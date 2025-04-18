"use client";
import React, { useState, useEffect } from "react";
import {
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
  TextField,
  InputAdornment,
  Drawer,
  Paper,
  FormGroup,
  useTheme
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Tune as TuneIcon
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
  const theme = useTheme();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const handleFilterApply = () => {
    setFilterActive(selectedKeywords.length > 0 || categoryFilter !== "all");
    toggleFilterDrawer();
  };

  const handleFilterReset = () => {
    setSelectedKeywords([]);
    setCategoryFilter("all");
    setFilterActive(false);
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

  const activeFiltersCount = (selectedKeywords.length > 0 ? 1 : 0) + 
                            (categoryFilter !== "all" ? 1 : 0);

  return (
    <>
      <Box sx={{ 
        mb: isSticky ? 16 : 4,
        position: 'relative',
        zIndex: 1100,
      }}>
        <Paper 
          elevation={isSticky ? 4 : 0} 
          sx={{ 
            borderRadius: '16px',
            background: theme.palette.background.paper,
            boxShadow: isSticky ? theme.shadows[4] : theme.shadows[1],
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[4],
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
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main, opacity: 0.8 }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { 
                  fontSize: '0.95rem',
                  color: theme.palette.text.primary,
                  '&::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 0.7
                  }
                }
              }}
              sx={{ 
                maxWidth: '100%',
                '& .MuiInputBase-root': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '12px',
                  pl: 1,
                  height: 48,
                  transition: 'all 0.3s ease',
                  '&:hover, &:focus-within': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    boxShadow: theme.shadows[1]
                  }
                }
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
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        color: theme.palette.primary.dark,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(71, 118, 230, 0.1)' : 'rgba(71, 118, 230, 0.05)'
                      }
                    })
              }}
            >
              Filters
              {filterActive && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: filterActive ? 'rgba(255, 255, 255, 0.8)' : theme.palette.primary.main,
                    color: filterActive ? theme.palette.primary.main : 'white',
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
            boxShadow: theme.shadows[4],
            backgroundColor: theme.palette.background.paper,
            width: 320
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
              onClick={toggleFilterDrawer} 
              size="small"
              sx={{ 
                borderRadius: '8px',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(95, 150, 230, 0.1)',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(95, 150, 230, 0.2)',
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
            Category
          </Typography>
          
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <RadioGroup
              value={categoryFilter}
              onChange={handleCategoryChange}
              name="category-filter"
            >
              {["all", "my clubs", "my boards"].map((category) => (
                <FormControlLabel
                  key={category}
                  value={category}
                  control={
                    <Radio 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                        '& .MuiSvgIcon-root': { fontSize: 22 } 
                      }}
                    />
                  }
                  label={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: categoryFilter === category ? theme.palette.text.primary : theme.palette.text.secondary,
                        fontWeight: categoryFilter === category ? 500 : 400,
                        textTransform: 'capitalize'
                      }}
                    >
                      {category}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1.5,
                    py: 0.5,
                    px: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    bgcolor: categoryFilter === category ? 
                      (theme.palette.mode === 'dark' ? 'rgba(71, 118, 230, 0.2)' : 'rgba(71, 118, 230, 0.08)') : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(95, 150, 230, 0.05)'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
            Keywords
          </Typography>
          
          <FormControl component="fieldset" fullWidth>
            <FormGroup>
              {allKeywords.map((keyword) => (
                <FormControlLabel
                  key={keyword}
                  control={
                    <Checkbox
                      checked={selectedKeywords.includes(keyword)}
                      onChange={() => handleKeywordToggle(keyword)}
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                        '& .MuiSvgIcon-root': { fontSize: 22 } 
                      }}
                    />
                  }
                  label={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedKeywords.includes(keyword) ? 
                          theme.palette.text.primary : theme.palette.text.secondary,
                        fontWeight: selectedKeywords.includes(keyword) ? 500 : 400
                      }}
                    >
                      {keyword}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1.5,
                    py: 0.5,
                    px: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    bgcolor: selectedKeywords.includes(keyword) ? 
                      (theme.palette.mode === 'dark' ? 'rgba(71, 118, 230, 0.2)' : 'rgba(71, 118, 230, 0.08)') : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(95, 150, 230, 0.05)'
                    }
                  }}
                />
              ))}
            </FormGroup>
          </FormControl>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="text" 
              onClick={handleFilterReset}
              disabled={!filterActive}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(95, 150, 230, 0.05)'
                },
                '&.Mui-disabled': {
                  color: theme.palette.text.disabled
                }
              }}
            >
              Clear All
            </Button>
            <Button 
              variant="contained" 
              onClick={handleFilterApply}
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

      {filterActive && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mt: -3, mb: 2, px: 1 }}>
          {categoryFilter !== "all" && (
            <Chip
              label={`Category: ${categoryFilter}`}
              size="small"
              onDelete={() => {
                setCategoryFilter("all");
                if (selectedKeywords.length === 0) {
                  setFilterActive(false);
                }
              }}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(71, 118, 230, 0.2)' : 'rgba(71, 118, 230, 0.1)',
                color: theme.palette.primary.main,
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.primary.main,
                  '&:hover': {
                    color: theme.palette.primary.dark,
                  }
                }
              }}
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
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(71, 118, 230, 0.2)' : 'rgba(71, 118, 230, 0.1)',
                color: theme.palette.primary.main,
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.primary.main,
                  '&:hover': {
                    color: theme.palette.primary.dark,
                  }
                }
              }}
            />
          ))}
          {(selectedKeywords.length > 0 || categoryFilter !== "all") && (
            <Chip
              label="Clear all"
              size="small"
              onClick={handleFilterReset}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: 500,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(71, 118, 230, 0.15)' : 'rgba(71, 118, 230, 0.08)',
                  borderColor: theme.palette.primary.dark,
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