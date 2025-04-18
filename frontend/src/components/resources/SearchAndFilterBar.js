import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Drawer,
  Divider,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import { useTheme } from "@mui/material/styles";

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
    setFilterActive(selectedKeywords.length > 0);
    toggleFilterDrawer();
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
    );
  };

  return (
    <>
      <Box sx={{ mb: isSticky ? 16 : 4, position: 'relative', zIndex: 1100 }}>
        <Paper 
          elevation={isSticky ? 4 : 0} 
          sx={{ 
            borderRadius: '16px',
            background: theme.palette.background.paper,
            boxShadow: isSticky ? theme.shadows[4] : theme.shadows[1],
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[3],
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
          <Box sx={{ py: 0.5, px: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search resources..."
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
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: '12px',
                  pl: 1,
                  height: 48,
                  transition: 'all 0.3s ease',
                  '&:hover, &:focus-within': {
                    backgroundColor: theme.palette.action.selected,
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
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      }
                    } 
                  : {
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        color: theme.palette.primary.dark,
                        backgroundColor: theme.palette.action.hover
                      }
                    })
              }}
            >
              Filters
              {selectedKeywords.length > 0 && (
                <Box
                  sx={{
                    ml: 1,
                    bgcolor: filterActive ? theme.palette.background.paper : theme.palette.primary.main,
                    color: filterActive ? theme.palette.primary.main : theme.palette.primary.contrastText,
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
                  {selectedKeywords.length}
                </Box>
              )}
            </Button>
          </Box>
          
          {filterActive && selectedKeywords.length > 0 && (
            <Box sx={{ px: 2, pb: 2, pt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedKeywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  size="small"
                  onDelete={() => {
                    setSelectedKeywords(prev => prev.filter(k => k !== keyword));
                    if (selectedKeywords.length === 1) setFilterActive(false);
                  }}
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.dark,
                    borderRadius: '8px',
                    '& .MuiChip-deleteIcon': {
                      color: theme.palette.primary.dark,
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              ))}
              <Chip
                label="Clear all"
                size="small"
                onClick={handleFilterReset}
                sx={{
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                  borderRadius: '8px',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              />
            </Box>
          )}
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
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
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
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              fontWeight: 500, 
              color: theme.palette.text.primary 
            }}
          >
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
                        color: selectedKeywords.includes(keyword) ? theme.palette.text.primary : theme.palette.text.secondary,
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
                    bgcolor: selectedKeywords.includes(keyword) ? theme.palette.action.selected : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
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
              disabled={selectedKeywords.length === 0}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.action.hover
                },
                '&.Mui-disabled': {
                  color: theme.palette.text.disabled
                }
              }}
            >
              Reset
            </Button>
            <Button 
              variant="contained" 
              onClick={handleFilterApply}
              sx={{ 
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: theme.shadows[2],
                borderRadius: '8px',
                px: 3,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
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

export default SearchAndFilterBar;