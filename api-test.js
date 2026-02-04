// Simple test to check if API returns collaboratorRole
const http = require('http');

console.log('Testing API response structure...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/repos/5',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer fake-token-for-testing',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    try {
      const response = JSON.parse(data);
      console.log('\nResponse Body:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.repository) {
        console.log('\nRepository Fields:');
        console.log(Object.keys(response.repository));
        console.log('\nCollaborator Role:', response.repository.collaboratorRole);
        console.log('Current User Role:', response.repository.currentUserRole);
        console.log('Is Owner:', response.repository.isOwner);
      }
    } catch (e) {
      console.log('Error parsing JSON:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();