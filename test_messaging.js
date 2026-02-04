// Test script to verify messaging functionality
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMessaging() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'devdock'
    });

    // Check if messages table exists and has data
    console.log('Checking messages table...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'messages'");
    if (tables.length === 0) {
      console.log('ERROR: Messages table does not exist!');
    } else {
      console.log('✓ Messages table exists');
      
      // Check if there are any messages
      const [messages] = await connection.execute("SELECT COUNT(*) as count FROM messages");
      console.log(`✓ Messages in table: ${messages[0].count}`);
      
      // Check a sample of messages if any exist
      if (messages[0].count > 0) {
        const [sampleMessages] = await connection.execute("SELECT * FROM messages LIMIT 5");
        console.log('Sample messages:');
        sampleMessages.forEach(msg => {
          console.log(`  ID: ${msg.id}, Sender: ${msg.sender_id}, Receiver: ${msg.receiver_id}, Message: "${msg.message}"`);
        });
      }
    }

    // Check if friends table exists and has data
    console.log('\nChecking friends table...');
    const [friendsTable] = await connection.execute("SHOW TABLES LIKE 'friends'");
    if (friendsTable.length === 0) {
      console.log('ERROR: Friends table does not exist!');
    } else {
      console.log('✓ Friends table exists');
      
      // Check if there are any friends
      const [friends] = await connection.execute("SELECT COUNT(*) as count FROM friends WHERE status = 'accepted'");
      console.log(`✓ Accepted friends: ${friends[0].count}`);
    }

    await connection.end();
    console.log('\n✓ Database test completed successfully');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testMessaging();