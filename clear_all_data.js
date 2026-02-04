const mysql = require('mysql2');
require('dotenv').config();

// Create database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log('Connecting to database...');

db.connect(async (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  
  console.log('Connected to database successfully');
  
  try {
    // Disable foreign key checks temporarily
    console.log('Disabling foreign key checks...');
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear all tables in proper order to avoid foreign key constraints
    const tablesToClear = [
      'messages',
      'friends',
      'notifications',
      'collaborators',
      'pull_requests',
      'issues',
      'commits',
      'files',
      'repositories',
      'users'
    ];
    
    console.log('Clearing tables in order...');
    
    for (const table of tablesToClear) {
      try {
        console.log(`Clearing table: ${table}`);
        await executeQuery(`DELETE FROM ${table}`);
        console.log(`✓ Cleared ${table}`);
      } catch (error) {
        console.error(`Error clearing ${table}:`, error.message);
      }
    }
    
    // Reset auto-increment counters
    console.log('Resetting auto-increment counters...');
    for (const table of tablesToClear) {
      try {
        await executeQuery(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`✓ Reset auto-increment for ${table}`);
      } catch (error) {
        console.error(`Error resetting auto-increment for ${table}:`, error.message);
      }
    }
    
    // Re-enable foreign key checks
    console.log('Re-enabling foreign key checks...');
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ Database cleanup completed successfully!');
    console.log('All users, repositories, and related data have been cleared.');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1'); // Re-enable FK checks even on error
  } finally {
    db.end();
    console.log('Database connection closed');
    process.exit(0);
  }
});

// Helper function to execute queries and return promises
function executeQuery(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}