"use client";

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  TextField,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Link as LinkIcon,
  Image as ImageIcon,
  VideoLibrary,
  Delete,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatQuote,
  Code,
  FormatColorText,
  Close,
} from '@mui/icons-material';
import {getAuthToken } from "@/utils/auth";

export default function PostEditor({ boardId, clubId, onPostCreated, onClose, postToEdit }) {
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(postToEdit?.files || []);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [preview, setPreview] = useState([]);
  const [textColor, setTextColor] = useState('#000000');
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ordered-list',
        },
      }),
      ListItem,
      CodeBlock,
      Blockquote,
      TextStyle,
      Color,
    ],
    content: postToEdit?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        spellcheck: 'false',
      },
    },
  });

  // Add global CSS for proper bullet point display
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .ProseMirror ul { 
        list-style-type: disc !important;
        padding-left: 1.5em !important;
      }
      .ProseMirror ol { 
        list-style-type: decimal !important;
        padding-left: 1.5em !important;
      }
      .ProseMirror li p {
        margin: 0;
      }
      .bullet-list {
        padding-left: 1em;
        list-style-type: disc !important;
      }
      .ordered-list {
        padding-left: 1em;
        list-style-type: decimal !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!files.length && !existingFiles.length) {
      setPreview([]);
      return;
    }

    // Create preview for new files
    const newFilePreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      isNew: true
    }));

    // Create preview for existing files
    const existingFilePreviews = existingFiles.map(file => ({
      url: `http://localhost:5000/uploads/${file.filename}`,
      type: file.fileType.startsWith('image/') ? 'image' : 'video',
      name: file.originalName,
      isExisting: true,
      id: file._id
    }));

    setPreview([...existingFilePreviews, ...newFilePreviews]);

    // Clean up
    return () => {
      newFilePreviews.forEach(obj => URL.revokeObjectURL(obj.url));
    };
  }, [files, existingFiles]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validation checks
    if (selectedFiles.length + files.length + existingFiles.length > 10) {
      showAlert('Maximum 10 files allowed', 'error');
      return;
    }

    const invalidFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (isImage && file.size > 20 * 1024 * 1024) { 
        showAlert(`Image "${file.name}" exceeds 20MB limit`, 'error');
        return true;
      }
      if (isVideo && file.size > 50 * 1024 * 1024) {
        showAlert(`Video "${file.name}" exceeds 50MB limit`, 'error');
        return true;
      }
      if (!isImage && !isVideo) {
        showAlert(`File "${file.name}" is not an image or video`, 'error');
        return true;
      }
      return false;
    });

    if (invalidFiles.length) return;

    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    const fileToRemove = preview[index];
    
    if (fileToRemove.isNew) {
      // Remove from new files
      setFiles(files.filter((_, i) => i !== index - existingFiles.length));
    } else {
      // Mark existing file for deletion
      setExistingFiles(existingFiles.filter(file => file._id !== fileToRemove.id));
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleSubmit = async () => {
    if (!authToken) {
      return;
    }

    if (!title.trim()) {
      showAlert('Please enter a title', 'error');
      return;
    }

    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>') {
      showAlert('Please enter some content', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', editor.getHTML());
      formData.append('user_id', "67d824cfe5cfbbf1ee400416");
      
      if (boardId) {
        formData.append('board_id', boardId);
      }
      
      if (clubId) {
        formData.append('club_id', clubId);
      }
      
      files.forEach(file => {
        formData.append('files', file);
      });

      // Add files to delete
      existingFiles.forEach(file => {
        formData.append('filesToDelete', file._id);
      });
      
      const endpoint = postToEdit 
        ? `http://localhost:5000/api/posts/${postToEdit._id}`
        : 'http://localhost:5000/api/posts';
      
      const method = postToEdit ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
     
      if (response.ok) {
        const result = await response.json();
        // Reset form
        setTitle('');
        setFiles([]);
        setExistingFiles([]);
        editor.commands.clearContent();
        showAlert(postToEdit ? 'Post updated successfully!' : 'Post created successfully!', 'success');
        
        // Notify parent component about the new/updated post
        if (onPostCreated) {
          onPostCreated(postToEdit ? result.updatedPost : result.post);
        }
        
        // Close the editor if in dialog mode
        if (onClose) {
          onClose();
        }
      } else {
        const errorData = await response.json();
        showAlert(errorData.message || (postToEdit ? 'Failed to update post' : 'Failed to create post'), 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(postToEdit ? 'An error occurred while updating the post' : 'An error occurred while creating the post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextAlign = (_, newAlignment) => {
    if (newAlignment !== null) {
      editor.chain().focus().setTextAlign(newAlignment).run();
    }
  };

  const handleHeadingChange = (event) => {
    const level = event.target.value;
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setTextColor(color);
    editor.chain().focus().setColor(color).run();
  };

  if (!editor) {
    return null;
  }

  // If used as a dialog
  if (onClose) {
    return (
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{postToEdit ? 'Edit Post' : 'Create New Post'}</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 2 }}>
            <TextField
              label="Post Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 3 }}>
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                {/* Text Formatting */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Tooltip title="Bold">
                    <IconButton 
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      color={editor.isActive('bold') ? 'primary' : 'default'}
                      size="small"
                    >
                      <FormatBold />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Italic">
                    <IconButton 
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      color={editor.isActive('italic') ? 'primary' : 'default'}
                      size="small"
                    >
                      <FormatItalic />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Underline">
                    <IconButton 
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      color={editor.isActive('underline') ? 'primary' : 'default'}
                      size="small"
                    >
                      <FormatUnderlined />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Add Link">
                    <IconButton 
                      onClick={() => {
                        const url = window.prompt('URL');
                        if (url) {
                          editor.chain().focus().setLink({ href: url }).run();
                        }
                      }}
                      color={editor.isActive('link') ? 'primary' : 'default'}
                      size="small"
                    >
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Text Color */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Text Color">
                      <IconButton size="small">
                        <FormatColorText />
                      </IconButton>
                    </Tooltip>
                    <input 
                      type="color" 
                      value={textColor}
                      onChange={handleColorChange}
                      style={{ width: '24px', height: '24px', border: 'none' }}
                    />
                  </Box>
                </Box>

                {/* Paragraph Formatting */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="heading-select-label">Heading</InputLabel>
                    <Select
                      labelId="heading-select-label"
                      id="heading-select"
                      value={
                        editor.isActive('heading', { level: 1 }) ? 1 :
                        editor.isActive('heading', { level: 2 }) ? 2 :
                        editor.isActive('heading', { level: 3 }) ? 3 : 0
                      }
                      label="Heading"
                      onChange={handleHeadingChange}
                    >
                      <MenuItem value={0}>Normal</MenuItem>
                      <MenuItem value={1}>Heading 1</MenuItem>
                      <MenuItem value={2}>Heading 2</MenuItem>
                      <MenuItem value={3}>Heading 3</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Text Alignment */}
                  <ToggleButtonGroup
                    value={
                      editor.isActive({ textAlign: 'left' }) ? 'left' :
                      editor.isActive({ textAlign: 'center' }) ? 'center' :
                      editor.isActive({ textAlign: 'right' }) ? 'right' :
                      editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left'
                    }
                    exclusive
                    onChange={handleTextAlign}
                    size="small"
                  >
                    <ToggleButton value="left">
                      <Tooltip title="Align Left">
                        <FormatAlignLeft />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="center">
                      <Tooltip title="Align Center">
                        <FormatAlignCenter />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="right">
                      <Tooltip title="Align Right">
                        <FormatAlignRight />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="justify">
                      <Tooltip title="Justify">
                        <FormatAlignJustify />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* List and Block Formatting */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Tooltip title="Bullet List">
                    <IconButton 
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      color={editor.isActive('bulletList') ? 'primary' : 'default'}
                      size="small"
                    >
                      <FormatListBulleted />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Numbered List">
                    <IconButton 
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      color={editor.isActive('orderedList') ? 'primary' : 'default'}
                      size="small"
                    >
                      <FormatListNumbered />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Blockquote">
                    <IconButton 
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      color={editor.isActive('blockquote') ? 'primary' : 'default'}
                      size="small"
                    >
                      <FormatQuote />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Code Block">
                    <IconButton 
                      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                      color={editor.isActive('codeBlock') ? 'primary' : 'default'}
                      size="small"
                    >
                      <Code />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <EditorContent editor={editor} />
              </Box>
            </Box>

            {/* File Upload Section */}
            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*, video/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span" startIcon={<ImageIcon />}>
                  Upload Images/Videos
                </Button>
              </label>
            </Box>

            {/* File Preview Section */}
            {preview.length > 0 && (
              <ImageList sx={{ mb: 3 }} cols={3} rowHeight={164}>
                {preview.map((file, index) => (
                  <ImageListItem key={file.url || file.id}>
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        loading="lazy"
                      />
                    ) : (
                      <video controls style={{ width: '100%', height: '100%' }}>
                        <source src={file.url} type={file.type} />
                      </video>
                    )}
                    <IconButton
                      sx={{ position: 'absolute', top: 0, right: 0, color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                      onClick={() => removeFile(index)}
                    >
                      <Delete />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? (postToEdit ? 'Updating...' : 'Submitting...') : (postToEdit ? 'Update' : 'Submit')}
          </Button>
        </DialogActions>

        {/* Alert Snackbar */}
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Dialog>
    );
  }

  // Original standalone version
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {postToEdit ? 'Edit Post' : 'Create a New Post'}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <TextField
          label="Post Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 3 }}>
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'grey.300' }}>
            {/* Text Formatting */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Tooltip title="Bold">
                <IconButton 
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  color={editor.isActive('bold') ? 'primary' : 'default'}
                  size="small"
                >
                  <FormatBold />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Italic">
                <IconButton 
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  color={editor.isActive('italic') ? 'primary' : 'default'}
                  size="small"
                >
                  <FormatItalic />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Underline">
                <IconButton 
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  color={editor.isActive('underline') ? 'primary' : 'default'}
                  size="small"
                >
                  <FormatUnderlined />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Add Link">
                <IconButton 
                  onClick={() => {
                    const url = window.prompt('URL');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  color={editor.isActive('link') ? 'primary' : 'default'}
                  size="small"
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>

              {/* Text Color */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Text Color">
                  <IconButton size="small">
                    <FormatColorText />
                  </IconButton>
                </Tooltip>
                <input 
                  type="color" 
                  value={textColor}
                  onChange={handleColorChange}
                  style={{ width: '24px', height: '24px', border: 'none' }}
                />
              </Box>
            </Box>

            {/* Paragraph Formatting */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="heading-select-label">Heading</InputLabel>
                <Select
                  labelId="heading-select-label"
                  id="heading-select"
                  value={
                    editor.isActive('heading', { level: 1 }) ? 1 :
                    editor.isActive('heading', { level: 2 }) ? 2 :
                    editor.isActive('heading', { level: 3 }) ? 3 : 0
                  }
                  label="Heading"
                  onChange={handleHeadingChange}
                >
                  <MenuItem value={0}>Normal</MenuItem>
                  <MenuItem value={1}>Heading 1</MenuItem>
                  <MenuItem value={2}>Heading 2</MenuItem>
                  <MenuItem value={3}>Heading 3</MenuItem>
                </Select>
              </FormControl>

              {/* Text Alignment */}
              <ToggleButtonGroup
                value={
                  editor.isActive({ textAlign: 'left' }) ? 'left' :
                  editor.isActive({ textAlign: 'center' }) ? 'center' :
                  editor.isActive({ textAlign: 'right' }) ? 'right' :
                  editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left'
                }
                exclusive
                onChange={handleTextAlign}
                size="small"
              >
                <ToggleButton value="left">
                  <Tooltip title="Align Left">
                    <FormatAlignLeft />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="center">
                  <Tooltip title="Align Center">
                    <FormatAlignCenter />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="right">
                  <Tooltip title="Align Right">
                    <FormatAlignRight />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="justify">
                  <Tooltip title="Justify">
                    <FormatAlignJustify />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* List and Block Formatting */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Tooltip title="Bullet List">
                <IconButton 
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  color={editor.isActive('bulletList') ? 'primary' : 'default'}
                  size="small"
                >
                  <FormatListBulleted />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Numbered List">
                <IconButton 
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  color={editor.isActive('orderedList') ? 'primary' : 'default'}
                  size="small"
                >
                  <FormatListNumbered />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Blockquote">
                <IconButton 
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  color={editor.isActive('blockquote') ? 'primary' : 'default'}
                  size="small"
                >
                  <FormatQuote />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Code Block">
                <IconButton 
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  color={editor.isActive('codeBlock') ? 'primary' : 'default'}
                  size="small"
                >
                  <Code />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Box sx={{ p: 2 }}>
            <EditorContent editor={editor} />
          </Box>
        </Box>

        {/* File Upload Section */}
        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*, video/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span" startIcon={<ImageIcon />}>
              Upload Images/Videos
            </Button>
          </label>
        </Box>

        {/* File Preview Section */}
        {preview.length > 0 && (
          <ImageList sx={{ mb: 3 }} cols={3} rowHeight={164}>
            {preview.map((file, index) => (
              <ImageListItem key={file.url || file.id}>
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    loading="lazy"
                  />
                ) : (
                  <video controls style={{ width: '100%', height: '100%' }}>
                    <source src={file.url} type={file.type} />
                  </video>
                )}
                <IconButton
                  sx={{ position: 'absolute', top: 0, right: 0, color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                  onClick={() => removeFile(index)}
                >
                  <Delete />
                </IconButton>
              </ImageListItem>
            ))}
          </ImageList>
        )}

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? (postToEdit ? 'Updating...' : 'Submitting...') : (postToEdit ? 'Update' : 'Submit')}
          </Button>
        </Box>
      </Paper>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
