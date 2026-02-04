const User = require('./models/User');

// Test creating a Google OAuth user
const googleUserData = {
  googleId: 'test_google_id_12345',
  username: 'Test User',
  email: 'testuser@example.com'
};

console.log('Testing Google user creation...');
User.create(googleUserData, (err, result) => {
  if (err) {
    console.error('Error creating Google user:', err);
  } else {
    console.log('Google user created successfully:', result);
    
    // Now try to find the user by Google ID
    User.findByGoogleId('test_google_id_12345', (err, foundUser) => {
      if (err) {
        console.error('Error finding Google user:', err);
      } else {
        console.log('Found Google user:', foundUser);
        
        // Clean up - delete the test user
        User.delete(foundUser.id, (err, result) => {
          if (err) {
            console.error('Error deleting test user:', err);
          } else {
            console.log('Test user cleaned up successfully');
          }
        });
      }
    });
  }
});