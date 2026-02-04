const db = require('./config/db');

// Check if the required tables exist
const tables = ['likes', 'dislikes', 'shares', 'reposts', 'repository_views'];

function checkNextTable(index = 0) {
  if (index < tables.length) {
    const tableName = tables[index];
    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
      if (err) {
        console.log(`Error checking table ${tableName}:`, err.message);
      } else if (result.length > 0) {
        console.log(`✓ Table ${tableName} exists`);
      } else {
        console.log(`✗ Table ${tableName} does not exist`);
      }
      
      // Continue with next table
      checkNextTable(index + 1);
    });
  } else {
    console.log('\nDatabase verification complete.');
    db.end();
  }
}

checkNextTable();