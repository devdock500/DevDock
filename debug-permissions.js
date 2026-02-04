// Debug script to test permission logic
console.log('=== DEBUG PERMISSION LOGIC ===');

// Simulate the permission calculation
function debugPermissions(repoData, userId) {
  console.log('\n--- Input Data ---');
  console.log('Repository:', repoData);
  console.log('Current User ID:', userId);
  
  // Simulate the logic from GitHubRepoView.js
  const isOwner = repoData.user_id === userId;
  const isCollaborator = repoData.currentUserRole === 'collaborator';
  const canManage = isOwner;
  const isInvitee = isCollaborator && (repoData.collaboratorRole === 'editor' || repoData.collaboratorRole === 'admin');
  const canAddContent = isOwner || isInvitee;
  
  console.log('\n--- Calculated Permissions ---');
  console.log('isOwner:', isOwner);
  console.log('isCollaborator:', isCollaborator);
  console.log('canManage:', canManage);
  console.log('isInvitee:', isInvitee);
  console.log('canAddContent:', canAddContent);
  
  console.log('\n--- Button Visibility ---');
  console.log('Public/Private Toggle:', canManage ? 'VISIBLE' : 'HIDDEN');
  console.log('Invite Button:', canManage ? 'VISIBLE' : 'HIDDEN');
  console.log('Add More Button:', canAddContent ? 'VISIBLE' : 'HIDDEN');
  
  return {
    isOwner,
    isCollaborator,
    canManage,
    isInvitee,
    canAddContent
  };
}

// Test with real database data
const testData = [
  {
    name: 'DevDock user viewing Bilal\'s repo (editor collaborator)',
    repo: {
      id: 5,
      name: 'Bilal',
      user_id: 2, // Bilal owns this repo
      currentUserRole: 'collaborator',
      collaboratorRole: 'editor',
      isOwner: false
    },
    userId: 1 // DevDock user
  },
  {
    name: 'Bilal user viewing his own repo',
    repo: {
      id: 5,
      name: 'Bilal',
      user_id: 2, // Bilal owns this repo
      currentUserRole: 'owner',
      collaboratorRole: null,
      isOwner: true
    },
    userId: 2 // Bilal user
  },
  {
    name: 'DevDock user viewing DevDock\'s repo (editor collaborator)',
    repo: {
      id: 6,
      name: 'Devdock',
      user_id: 1, // DevDock owns this repo
      currentUserRole: 'collaborator',
      collaboratorRole: 'editor',
      isOwner: false
    },
    userId: 2 // Bilal user
  }
];

testData.forEach((test, index) => {
  console.log(`\n\n=== TEST CASE ${index + 1}: ${test.name} ===`);
  debugPermissions(test.repo, test.userId);
});

console.log('\n=== END DEBUG ===');