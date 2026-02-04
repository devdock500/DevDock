const mysql = require('mysql2');
require('dotenv').config();

// Create connection to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Check if google_id column exists first
const checkColumnQuery = `
  SELECT COLUMN_NAME 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = ? 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'google_id'
`;

db.query(checkColumnQuery, [process.env.DB_NAME], (err, results) => {
  if (err) {
    console.error('Error checking if column exists:', err);
    db.end();
    return;
  }

  if (results.length > 0) {
    console.log('google_id column already exists in users table');
    db.end();
  } else {
    // Add google_id column to users table
    const alterTableQuery = `
      ALTER TABLE users 
      ADD COLUMN google_id VARCHAR(255) UNIQUE
    `;

    db.query(alterTableQuery, (err, result) => {
      if (err) {
        console.error('Error adding google_id column:', err);
      } else {
        console.log('google_id column added successfully to users table');
      }
      db.end();
    });
  }
});