const axios = require('axios');

async function testGoogleAuth() {
  try {
    console.log('Testing Google OAuth endpoint...');
    
    // Test the Google OAuth initiation endpoint
    const response = await axios.get('http://localhost:5000/auth/google', {
      maxRedirects: 0, // Don't follow redirects to see if it redirects to Google
      validateStatus: (status) => status < 400 || status === 302
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 302) {
      console.log('Redirect location:', response.headers.location);
      console.log('✓ Google OAuth endpoint is properly redirecting to Google');
    } else {
      console.log('Response data:', response.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      console.log('✓ Google OAuth endpoint is properly redirecting to Google');
      console.log('Redirect location:', error.response.headers.location);
    } else {
      console.error('Error testing Google OAuth:', error.message);
    }
  }
}

testGoogleAuth();