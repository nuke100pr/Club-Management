"use client";
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  AppBar, 
  Toolbar, 
  Container, 
  Grid, 
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReplayIcon from '@mui/icons-material/Replay';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import Head from 'next/head';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ResponsePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: '#f8f9fa',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  whiteSpace: 'pre-wrap',
  overflow: 'auto',
  maxHeight: '500px',
}));

const HistoryItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

export default function GeminiPage() {
  // The API key provided in your input
  const API_KEY = 'AIzaSyDMrvCZixMBXvnVOclG1ObhXOLzH0fon7U';
  
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);

  const fetchGeminiResponse = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
      
      const requestBody = {
        contents: [{
          parts: [{ text: query }]
        }]
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      setRawResponse(data);
      
      if (response.ok) {
        // Extract the response text
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text found';
        setResponse(responseText);
        
        // Add to history
        const newHistoryItem = {
          id: Date.now(),
          query,
          response: responseText,
          timestamp: new Date().toLocaleString()
        };
        
        setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      } else {
        setError(`Error: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      fetchGeminiResponse();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Failed to copy to clipboard');
        setSnackbarOpen(true);
      });
  };

  const loadHistoryItem = (item) => {
    setQuery(item.query);
    setResponse(item.response);
  };

  const clearHistory = () => {
    setHistory([]);
    setSnackbarMessage('History cleared');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const showRawJson = () => {
    if (rawResponse) {
      copyToClipboard(JSON.stringify(rawResponse, null, 2));
    }
  };

  return (
    <>
      <Head>
        <title>Gemini API Explorer</title>
        <meta name="description" content="Ask questions to Google's Gemini AI model" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <SmartToyIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Gemini API Explorer
            </Typography>
            <Chip 
              label={`API KEY: ${API_KEY.substring(0, 8)}...`} 
              color="secondary" 
              size="small" 
              onClick={() => copyToClipboard(API_KEY)}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Ask Gemini AI
                  </Typography>
                  
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Type your question here"
                    multiline
                    rows={3}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            color="primary" 
                            onClick={fetchGeminiResponse}
                            disabled={loading || !query.trim()}
                          >
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ReplayIcon />}
                      onClick={() => setQuery('Explain how AI works')}
                    >
                      Sample Query
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      onClick={fetchGeminiResponse}
                      disabled={loading || !query.trim()}
                    >
                      {loading ? 'Generating...' : 'Generate'}
                    </Button>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {response && (
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                          Response
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(response)}
                            title="Copy response"
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          {rawResponse && (
                            <IconButton 
                              size="small" 
                              onClick={showRawJson}
                              title="Copy raw JSON"
                              sx={{ ml: 1 }}
                            >
                              <ContentCopyIcon fontSize="small" color="secondary" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      <ResponsePaper elevation={0}>
                        {response}
                      </ResponsePaper>
                    </Box>
                  )}

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      API Request Format
                    </Typography>
                    <ResponsePaper elevation={0}>
{`curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}" \\
-H 'Content-Type: application/json' \\
-X POST \\
-d '{
  "contents": [{
    "parts":[{"text": "${query || 'Your query here'}"}]
  }]
}'`}
                    </ResponsePaper>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyToClipboard(
                        `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}" \\
-H 'Content-Type: application/json' \\
-X POST \\
-d '{
  "contents": [{
    "parts":[{"text": "${query || 'Your query here'}"}]
  }]
}'`
                      )}
                      sx={{ mt: 1 }}
                    >
                      Copy cURL Command
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Query History
                    </Typography>
                    
                    {history.length > 0 && (
                      <IconButton size="small" onClick={clearHistory} title="Clear history">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {history.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                      No queries yet. Start by asking Gemini a question.
                    </Typography>
                  ) : (
                    <Box sx={{ maxHeight: '650px', overflow: 'auto' }}>
                      {history.map((item) => (
                        <HistoryItem key={item.id} onClick={() => loadHistoryItem(item)}>
                          <Typography variant="subtitle2" noWrap>
                            {item.query}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {item.timestamp}
                          </Typography>
                        </HistoryItem>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Container>

        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[100] }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="textSecondary" align="center">
              This app uses Google's Gemini API. All requests are sent directly to Google's servers.
            </Typography>
          </Container>
        </Box>
      </Box>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" elevation={6}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}