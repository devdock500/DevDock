const mysql = require('mysql2');
require('dotenv').config();

// Create connection to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Check if password column allows NULL values
const checkColumnQuery = `
  SELECT IS_NULLABLE 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = ? 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'password'
`;

db.query(checkColumnQuery, [process.env.DB_NAME], (err, results) => {
  if (err) {
    console.error('Error checking if password column allows NULL:', err);
    db.end();
    return;
  }

  if (results.length > 0 && results[0].IS_NULLABLE === 'YES') {
    console.log('Password column already allows NULL values');
    db.end();
  } else {
    // Update the password column to allow NULL values
    const alterTableQuery = `
      ALTER TABLE users 
      MODIFY COLUMN password VARCHAR(255) NULL
    `;

    db.query(alterTableQuery, (err, result) => {
      if (err) {
        console.error('Error updating password column to allow NULL:', err);
      } else {
        console.log('Password column updated to allow NULL values successfully');
      }
      db.end();
    });
  }
});