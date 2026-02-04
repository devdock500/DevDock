const mysql = require('mysql2');
require('dotenv').config();

// Create connection to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Check if email column allows NULL values
const checkColumnQuery = `
  SELECT IS_NULLABLE 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = ? 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'email'
`;

db.query(checkColumnQuery, [process.env.DB_NAME], (err, results) => {
  if (err) {
    console.error('Error checking if email column allows NULL:', err);
    db.end();
    return;
  }

  if (results.length > 0 && results[0].IS_NULLABLE === 'YES') {
    console.log('Email column already allows NULL values');
    db.end();
  } else {
    // Update the email column to allow NULL values
    const alterTableQuery = `
      ALTER TABLE users 
      MODIFY COLUMN email VARCHAR(100) NULL
    `;

    db.query(alterTableQuery, (err, result) => {
      if (err) {
        console.error('Error updating email column to allow NULL:', err);
      } else {
        console.log('Email column updated to allow NULL values successfully');
      }
      db.end();
    });
  }
});