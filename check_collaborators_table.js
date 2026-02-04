const db = require('./config/db');

// Check if collaborators table exists
db.query("SHOW TABLES LIKE 'collaborators'", (err, results) => {
  if (err) {
    console.error('Error checking table:', err);
    return;
  }
  
  if (results.length > 0) {
    console.log('Collaborators table exists');
    
    // Check table structure
    db.query("DESCRIBE collaborators", (err, results) => {
      if (err) {
        console.error('Error describing table:', err);
        return;
      }
      
      console.log('Collaborators table structure:');
      console.table(results);
    });
  } else {
    console.log('Collaborators table does not exist');
  }
});

// Check if there are any records in the collaborators table
db.query("SELECT COUNT(*) as count FROM collaborators", (err, results) => {
  if (err) {
    console.error('Error counting records:', err);
    return;
  }
  
  console.log('Number of records in collaborators table:', results[0].count);
});