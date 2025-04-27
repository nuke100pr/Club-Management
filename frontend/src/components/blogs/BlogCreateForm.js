
"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  OutlinedInput,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Image as ImageIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Link as LinkIcon,
  CodeOutlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
} from "@mui/icons-material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

const MenuBar = ({ editor }) => {
  const theme = useTheme();
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
      <IconButton 
        onClick={() => editor.chain().focus().toggleBold().run()}
        color={editor.isActive('bold') ? 'primary' : 'default'}
        sx={{ color: editor.isActive('bold') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <FormatBold />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        color={editor.isActive('italic') ? 'primary' : 'default'}
        sx={{ color: editor.isActive('italic') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <FormatItalic />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        color={editor.isActive('underline') ? 'primary' : 'default'}
        sx={{ color: editor.isActive('underline') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <FormatUnderlined />
      </IconButton>
      <IconButton 
        onClick={setLink}
        sx={{ color: editor.isActive('link') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <LinkIcon />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        color={editor.isActive('codeBlock') ? 'primary' : 'default'}
        sx={{ color: editor.isActive('codeBlock') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <CodeOutlined />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        color={editor.isActive('bulletList') ? 'primary' : 'default'}
        sx={{ color: editor.isActive('bulletList') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <FormatListBulleted />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        color={editor.isActive('orderedList') ? 'primary' : 'default'}
        sx={{ color: editor.isActive('orderedList') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <FormatListNumbered />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        color={editor.isActive('blockquote') ? 'primary' : 'default'}
        sx={{ color: editor.isActive('blockquote') ? theme.palette.primary.main : theme.palette.text.secondary }}
      >
        <FormatQuote />
      </IconButton>
    </Box>
  );
};

const BlogCreateForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  club_id = null,
  board_id = null,
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [blogImage, setBlogImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const introductionEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      ImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      Blockquote,
      Color,
      TextStyle,
    ],
    content: "",
  });

  const mainContentEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      ImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      Blockquote,
      Color,
      TextStyle,
    ],
    content: "",
  });

  const conclusionEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      ImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      Blockquote,
      Color,
      TextStyle,
    ],
    content: "",
  });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setPublisher(initialData.publisher || "");
      setTags(initialData.tags || []);
      if (introductionEditor) {
        introductionEditor.commands.setContent(initialData.introduction || "");
      }
      if (mainContentEditor) {
        mainContentEditor.commands.setContent(initialData.mainContent || "");
      }
      if (conclusionEditor) {
        conclusionEditor.commands.setContent(initialData.conclusion || "");
      }
      setImagePreview(initialData.image || null);
    } else {
      resetForm();
    }
  }, [initialData, open, introductionEditor, mainContentEditor, conclusionEditor]);

  const resetForm = () => {
    setTitle("");
    setPublisher("");
    setTags([]);
    setNewTag("");
    setBlogImage(null);
    setImagePreview(null);
    if (introductionEditor) {
      introductionEditor.commands.clearContent();
    }
    if (mainContentEditor) {
      mainContentEditor.commands.clearContent();
    }
    if (conclusionEditor) {
      conclusionEditor.commands.clearContent();
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImage(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      publisher,
      introduction: introductionEditor?.getHTML() || "",
      mainContent: mainContentEditor?.getHTML() || "",
      conclusion: conclusionEditor?.getHTML() || "",
      tags,
      blogImage,
      imagePreview,
      club_id,
      board_id,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>
        {initialData ? "Edit Blog Post" : "Create Blog Post"}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: theme.palette.background.paper }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Blog Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                required
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                startIcon={<ImageIcon />}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                Upload Blog Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Blog"
                    style={{ maxWidth: "300px", maxHeight: "300px" }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <OutlinedInput
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                  placeholder="Add Tags"
                  endAdornment={
                    <IconButton onClick={handleAddTag}>
                      <AddIcon sx={{ color: theme.palette.primary.main }} />
                    </IconButton>
                  }
                  sx={{
                    color: theme.palette.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                  }}
                />
                <Box sx={{ mt: 1 }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(index)}
                      sx={{
                        mr: 1,
                        mt: 1,
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                  ))}
                </Box>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary }}>
                Introduction
              </Typography>
              {introductionEditor && (
                <>
                  <MenuBar editor={introductionEditor} />
                  <Box 
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 1, 
                      p: 1, 
                      minHeight: '100px',
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <EditorContent editor={introductionEditor} />
                  </Box>
                </>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary }}>
                Main Content
              </Typography>
              {mainContentEditor && (
                <>
                  <MenuBar editor={mainContentEditor} />
                  <Box 
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 1, 
                      p: 1, 
                      minHeight: '200px',
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <EditorContent editor={mainContentEditor} />
                  </Box>
                </>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary }}>
                Conclusion
              </Typography>
              {conclusionEditor && (
                <>
                  <MenuBar editor={conclusionEditor} />
                  <Box 
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 1, 
                      p: 1, 
                      minHeight: '100px',
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <EditorContent editor={conclusionEditor} />
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ bgcolor: theme.palette.background.paper }}>
        <Button 
          onClick={onClose}
          sx={{ color: theme.palette.text.secondary }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          {initialData ? "Update Blog" : "Create Blog Post"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlogCreateForm;