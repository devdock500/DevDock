const axios = require('axios');

async function testAIEndpoint() {
  try {
    console.log('Testing AI endpoint...');
    
    const response = await axios.post('http://localhost:3002/api/ai/groq', {
      prompt: 'Hello, how are you?',
      type: 'chat'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('AI Response:', response.data.response);
    console.log('Test successful!');
  } catch (error) {
    console.error('Error testing AI endpoint:', error.response?.data || error.message);
  }
}

testAIEndpoint();