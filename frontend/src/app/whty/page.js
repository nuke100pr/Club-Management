// pages/index.js
"use client";
import { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper,
  CircularProgress
} from '@mui/material';
import Head from 'next/head';

export default function Home() {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate a random string to use as QR code content
  const generateRandomString = (length = 15) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleGenerateQR = async () => {
    setLoading(true);
    
    try {
      // Generate random content for the QR code
      const randomContent = generateRandomString();
      
      // Use the QR code API to generate a QR code with the random content
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(randomContent)}&size=200x200`;
      
      setQrCode(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Random QR Code Generator</title>
        <meta name="description" content="Generate random QR codes with a click" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxWidth="sm">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Random QR Code Generator
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerateQR}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? 'Generating...' : 'Generate QR'}
          </Button>
          
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              minHeight: 250,
              justifyContent: 'center'
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : qrCode ? (
              <Box>
                <img 
                  src={qrCode} 
                  alt="Generated QR Code" 
                  style={{ maxWidth: '100%' }} 
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  QR code contains a random string
                </Typography>
              </Box>
            ) : (
              <Typography color="textSecondary">
                Click the button above to generate a QR code
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
}