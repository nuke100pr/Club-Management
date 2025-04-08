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
  ColorLens,
} from "@mui/icons-material";

// Tiptap imports
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
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
      <IconButton 
        onClick={() => editor.chain().focus().toggleBold().run()}
        color={editor.isActive('bold') ? 'primary' : 'default'}
      >
        <FormatBold />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        color={editor.isActive('italic') ? 'primary' : 'default'}
      >
        <FormatItalic />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        color={editor.isActive('underline') ? 'primary' : 'default'}
      >
        <FormatUnderlined />
      </IconButton>
      <IconButton onClick={setLink}>
        <LinkIcon />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        color={editor.isActive('codeBlock') ? 'primary' : 'default'}
      >
        <CodeOutlined />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        color={editor.isActive('bulletList') ? 'primary' : 'default'}
      >
        <FormatListBulleted />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        color={editor.isActive('orderedList') ? 'primary' : 'default'}
      >
        <FormatListNumbered />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        color={editor.isActive('blockquote') ? 'primary' : 'default'}
      >
        <FormatQuote />
      </IconButton>
    </Box>
  )
}

const BlogCreateForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  club_id = null,
  board_id = null
}) => {
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [blogImage, setBlogImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Tiptap editors
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
      TextStyle
    ],
    content: ""
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
      TextStyle
    ],
    content: ""
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
      TextStyle
    ],
    content: ""
  });

  // Reset or populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setPublisher(initialData.publisher || "");
      setTags(initialData.tags || []);
      
      // Update Tiptap editors
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
      // Reset all fields
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

    // Reset Tiptap editors
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

  // Tag handlers
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

  // Image upload handler
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

  // Submit handler
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
      board_id
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {initialData ? "Edit Blog Post" : "Create Blog Post"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Blog Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                startIcon={<ImageIcon />}
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
                      <AddIcon />
                    </IconButton>
                  }
                />
                <Box sx={{ mt: 1 }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(index)}
                      sx={{ mr: 1, mt: 1 }}
                    />
                  ))}
                </Box>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Introduction</Typography>
              {introductionEditor && (
                <>
                  <MenuBar editor={introductionEditor} />
                  <Box 
                    sx={{ 
                      border: '1px solid rgba(0, 0, 0, 0.23)', 
                      borderRadius: 1, 
                      p: 1, 
                      minHeight: '100px' 
                    }}
                  >
                    <EditorContent editor={introductionEditor} />
                  </Box>
                </>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Main Content</Typography>
              {mainContentEditor && (
                <>
                  <MenuBar editor={mainContentEditor} />
                  <Box 
                    sx={{ 
                      border: '1px solid rgba(0, 0, 0, 0.23)', 
                      borderRadius: 1, 
                      p: 1, 
                      minHeight: '200px' 
                    }}
                  >
                    <EditorContent editor={mainContentEditor} />
                  </Box>
                </>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Conclusion</Typography>
              {conclusionEditor && (
                <>
                  <MenuBar editor={conclusionEditor} />
                  <Box 
                    sx={{ 
                      border: '1px solid rgba(0, 0, 0, 0.23)', 
                      borderRadius: 1, 
                      p: 1, 
                      minHeight: '100px' 
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {initialData ? "Update Blog" : "Create Blog Post"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlogCreateForm;