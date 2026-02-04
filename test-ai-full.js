const axios = require('axios');

async function testAIEndpoint() {
  try {
    console.log('Testing AI endpoint with different types...');
    
    // Test chat type
    console.log('\n1. Testing chat type:');
    const chatResponse = await axios.post('http://localhost:3002/api/ai/groq', {
      prompt: 'Hello, how are you?',
      type: 'chat'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Chat Response:', chatResponse.data.response.substring(0, 100) + '...');
    
    // Test suggest type
    console.log('\n2. Testing suggest type:');
    const suggestResponse = await axios.post('http://localhost:3002/api/ai/groq', {
      prompt: 'How can I improve this JavaScript code: let x = 5; console.log(x);',
      type: 'suggest'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Suggest Response:', suggestResponse.data.response.substring(0, 100) + '...');
    
    // Test explain type
    console.log('\n3. Testing explain type:');
    const explainResponse = await axios.post('http://localhost:3002/api/ai/groq', {
      prompt: 'Explain this code: for(let i = 0; i < 10; i++) { console.log(i); }',
      type: 'explain'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Explain Response:', explainResponse.data.response.substring(0, 100) + '...');
    
    // Test improve type
    console.log('\n4. Testing improve type:');
    const improveResponse = await axios.post('http://localhost:3002/api/ai/groq', {
      prompt: 'Improve this function: function sum(a, b) { return a + b; }',
      type: 'improve'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Improve Response:', improveResponse.data.response.substring(0, 100) + '...');
    
    console.log('\nAll AI endpoint tests successful!');
  } catch (error) {
    console.error('Error testing AI endpoint:', error.response?.data || error.message);
  }
}

testAIEndpoint();