const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.query('DESCRIBE users', (err, results) => {
  if (err) {
    console.error('Error:', err);
    db.end();
    return;
  }
  
  console.log('Users table columns:');
  results.forEach(row => {
    console.log(`${row.Field}: ${row.Type} ${row.Null} ${row.Key} ${row.Default} ${row.Extra}`);
  });
  
  db.end();
});