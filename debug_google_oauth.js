const User = require('./models/User');

// Test Google OAuth user creation flow
console.log('Testing Google OAuth user creation flow...');

// Simulate Google profile data
const testProfiles = [
  {
    id: 'google_test_user_1',
    displayName: 'Test User 1',
    emails: [{ value: 'test1@example.com' }]
  },
  {
    id: 'google_test_user_2', 
    displayName: 'Test User 2',
    emails: [{ value: 'test2@example.com' }]
  }
];

async function testUserCreation(profile) {
  console.log(`\n--- Testing profile: ${profile.displayName} ---`);
  
  try {
    // Step 1: Try to find existing user
    console.log('Step 1: Finding user by Google ID...');
    let user = await new Promise((resolve, reject) => {
      User.findByGoogleId(profile.id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    console.log('Find result:', user);
    
    if (!user) {
      // Step 2: Create new user
      console.log('Step 2: Creating new user...');
      user = await new Promise((resolve, reject) => {
        User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value
        }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log('Created user:', user);
    } else {
      console.log('User already exists');
    }
    
    return user;
  } catch (error) {
    console.error('Error in user creation flow:', error);
    throw error;
  }
}

async function runTests() {
  try {
    // Test first user
    const user1 = await testUserCreation(testProfiles[0]);
    console.log('\n✅ First user test passed');
    
    // Test second user (this should trigger the multi-user scenario)
    const user2 = await testUserCreation(testProfiles[1]);
    console.log('\n✅ Second user test passed');
    
    console.log('\n🎉 All tests passed! Multi-user Google OAuth should work.');
    
    // Cleanup
    console.log('\nCleaning up test users...');
    await new Promise((resolve, reject) => {
      User.delete(user1.id, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      User.delete(user2.id, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

runTests();