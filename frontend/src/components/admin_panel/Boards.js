import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    Button, 
    TextField, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const Boards = () => {
    const [boards, setBoards] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [newBoard, setNewBoard] = useState({
        name: '',
        description: '',
        established_year: '',
        image: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const response = await fetch('http://localhost:5000/boards/');
                if (!response.ok) throw new Error('Failed to fetch boards');
                const data = await response.json();
                setBoards(data);
            } catch (error) {
                console.error('Error fetching boards:', error);
            }
        };

        fetchBoards();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBoard(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setNewBoard(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('name', newBoard.name);
            formData.append('description', newBoard.description);
            formData.append('established_year', newBoard.established_year);
            if (newBoard.image) {
                formData.append('image', newBoard.image);
            }

            const response = await fetch('http://localhost:5000/boards/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to create board');

            const data = await response.json();
            setBoards([...boards, data]);
            setOpenDialog(false);
            setNewBoard({
                name: '',
                description: '',
                established_year: '',
                image: null
            });
        } catch (error) {
            console.error('Error creating board:', error);
        }
    };

    const handleMenuClick = (event, board) => {
        setAnchorEl(event.currentTarget);
        setSelectedBoard(board);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = async () => {
        try {
            const formData = new FormData();
            formData.append('name', newBoard.name);
            formData.append('description', newBoard.description);
            formData.append('established_year', newBoard.established_year);
            
            if (newBoard.image) {
                formData.append('image', newBoard.image);
            }
            
            const response = await fetch(`http://localhost:5000/boards/${selectedBoard._id}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update board');

            const boardsResponse = await fetch('http://localhost:5000/boards/');
            if (!boardsResponse.ok) throw new Error('Failed to fetch updated boards');
            const data = await boardsResponse.json();
            setBoards(data);
            
            setOpenDialog(false);
            setIsEditing(false);
            setNewBoard({
                name: '',
                description: '',
                established_year: '',
                image: null
            });
        } catch (error) {
            console.error('Error editing board:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/boards/${selectedBoard._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete board');
            
            setBoards(boards.filter(board => board._id !== selectedBoard._id));
            
            handleMenuClose();
        } catch (error) {
            console.error('Error deleting board:', error);
        }
    };

    const openAddDialog = () => {
        setIsEditing(false);
        setNewBoard({
            name: '',
            description: '',
            established_year: '',
            image: null
        });
        setOpenDialog(true);
    };

    const openEditDialog = (board) => {
        setIsEditing(true);
        setNewBoard({
            name: board.name,
            description: board.description,
            established_year: board.established_year || '',
            image: null
        });
        setSelectedBoard(board);
        setOpenDialog(true);
        handleMenuClose();
    };

    return (
        <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                mb: 3,
                gap: isMobile ? 2 : 0
            }}>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold', color: '#6a1b9a' }}>
                    Boards Management
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{ 
                        backgroundColor: '#6a1b9a',
                        '&:hover': { backgroundColor: '#4a148c' }
                    }}
                    fullWidth={isMobile}
                >
                    Add New Board
                </Button>
            </Box>

            <Grid container spacing={isMobile ? 1 : 3}>
                {boards.map((board) => (
                    <Grid item xs={12} sm={6} md={4} key={board._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography 
                                        gutterBottom 
                                        variant={isMobile ? "h6" : "h5"} 
                                        component="h2" 
                                        sx={{ color: '#6a1b9a', flexGrow: 1 }}
                                    >
                                        {board.name}
                                    </Typography>
                                    <IconButton onClick={(e) => handleMenuClick(e, board)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {board.description}
                                </Typography>
                                {board.established_year && (
                                    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                        Established: {board.established_year}
                                    </Typography>
                                )}
                                {board.image && (
                                    <Box 
                                        component="img" 
                                        src={board.image} 
                                        alt={board.name} 
                                        sx={{ 
                                            width: '100%', 
                                            height: 200, 
                                            objectFit: 'cover', 
                                            borderRadius: 2,
                                            mb: 2 
                                        }} 
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Add/Edit Board Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                fullWidth 
                maxWidth="sm"
                fullScreen={isMobile}
            >
                <DialogTitle>
                    {isEditing ? 'Edit Board' : 'Add New Board'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Board Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newBoard.name}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={isMobile ? 2 : 4}
                        value={newBoard.description}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="established_year"
                        label="Established Year"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newBoard.established_year}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="board-image-upload"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="board-image-upload">
                            <Button 
                                variant="outlined" 
                                component="span"
                                sx={{ 
                                    color: '#6a1b9a', 
                                    borderColor: '#6a1b9a',
                                    '&:hover': { 
                                        backgroundColor: '#f3e5f5',
                                        borderColor: '#4a148c' 
                                    }
                                }}
                                fullWidth={isMobile}
                            >
                                {isEditing ? 'Change Board Image' : 'Upload Board Image'}
                            </Button>
                        </label>
                        {newBoard.image && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {newBoard.image.name}
                            </Typography>
                        )}
                        {isEditing && !newBoard.image && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                Leave empty to keep current image
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6a1b9a' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={isEditing ? handleEdit : handleSubmit} 
                        variant="contained"
                        sx={{ 
                            backgroundColor: '#6a1b9a',
                            '&:hover': { backgroundColor: '#4a148c' }
                        }}
                    >
                        {isEditing ? 'Update Board' : 'Add Board'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => openEditDialog(selectedBoard)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default Boards;