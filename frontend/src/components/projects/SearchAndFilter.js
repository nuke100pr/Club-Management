"use client";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  InputAdornment,
  styled
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

// Styled components for custom appearance
const SearchAppBar = styled(AppBar)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.appBar,
  marginBottom: theme.spacing(4),
  backgroundColor: 'transparent',
  boxShadow: 'none',
  elevation: 0
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    height: '40px',
    borderRadius: '24px',
    backgroundColor: '#f5f5f5',
    transition: 'background-color 0.3s',
    paddingLeft: theme.spacing(1),
    '&:hover': {
      backgroundColor: '#eeeeee',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.95rem',
  },
  '& .MuiInput-underline:before': {
    borderBottom: 'none',
  },
  '& .MuiInput-underline:after': {
    borderBottom: 'none',
  },
  maxWidth: 600,
}));

const SearchAndFilter = ({ onSearchChange, onFilterChange }) => {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [status, setStatus] = useState(null);

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

  return (
    <>
      <SearchAppBar>
        <Toolbar>
          <SearchTextField
            fullWidth
            variant="standard"
            placeholder="Search blogs..."
            value={search}
            onChange={handleSearchChange}
            disableUnderline
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ opacity: 0.6 }} />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInputBase-input::placeholder': {
                opacity: 0.7,
              },
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleFilterToggle}>
            <FilterListIcon />
          </IconButton>
        </Toolbar>
      </SearchAppBar>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={handleFilterToggle}>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <Typography variant="subtitle1">My Clubs</Typography>
            <RadioGroup
              value={selectedClub || ""}
              onChange={(e) => setSelectedClub(e.target.value || null)}
            >
              <FormControlLabel
                value="club123"
                control={<Radio />}
                label="Club 123"
              />
              <FormControlLabel
                value="club789"
                control={<Radio />}
                label="Club 789"
              />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <Typography variant="subtitle1">My Boards</Typography>
            <RadioGroup
              value={selectedBoard || ""}
              onChange={(e) => setSelectedBoard(e.target.value || null)}
            >
              <FormControlLabel
                value="board456"
                control={<Radio />}
                label="Board 456"
              />
              <FormControlLabel
                value="board012"
                control={<Radio />}
                label="Board 012"
              />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Status</Typography>
            <RadioGroup
              value={status || ""}
              onChange={(e) => setStatus(e.target.value || null)}
            >
              <FormControlLabel
                value="Running"
                control={<Radio />}
                label="Running"
              />
              <FormControlLabel
                value="Completed"
                control={<Radio />}
                label="Completed"
              />
              <FormControlLabel
                value="Standby"
                control={<Radio />}
                label="Standby"
              />
            </RadioGroup>
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button onClick={handleResetFilters}>Reset Filters</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchAndFilter;