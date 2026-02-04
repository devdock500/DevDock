// Test API response for repository permissions
const http = require('http');

// Test function to check API response
function testRepoApi(repoId, token, description) {
  console.log(`\n=== Testing ${description} ===`);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/repos/${repoId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Repository data:`);
        console.log(`  ID: ${response.repository?.id}`);
        console.log(`  Name: ${response.repository?.name}`);
        console.log(`  Owner User ID: ${response.repository?.user_id}`);
        console.log(`  Current User Role: ${response.repository?.currentUserRole}`);
        console.log(`  Is Owner: ${response.repository?.isOwner}`);
        console.log(`  Collaborator Role: ${response.repository?.collaboratorRole}`);
        
        // Test permission logic
        const repo = response.repository;
        if (repo) {
          const isOwner = repo.isOwner;
          const isCollaborator = repo.currentUserRole === 'collaborator';
          const isInvitee = isCollaborator && (repo.collaboratorRole === 'editor' || repo.collaboratorRole === 'admin');
          const canAddContent = isOwner || isInvitee;
          
          console.log(`\n  Calculated Permissions:`);
          console.log(`    isOwner: ${isOwner}`);
          console.log(`    isCollaborator: ${isCollaborator}`);
          console.log(`    isInvitee: ${isInvitee}`);
          console.log(`    canAddContent: ${canAddContent}`);
          console.log(`    Add More Button: ${canAddContent ? 'VISIBLE' : 'HIDDEN'}`);
        }
      } catch (e) {
        console.log('Error parsing response:', e);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.end();
}

// Run tests
console.log('Testing repository API responses...\n');

// Note: These are placeholder tokens - in real scenario, you'd use actual JWT tokens
testRepoApi(5, 'dummy_token_1', 'Repo 5 with editor collaborator');
testRepoApi(6, 'dummy_token_2', 'Repo 6 with editor collaborator');