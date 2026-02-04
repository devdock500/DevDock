const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'devdock'
});

async function clearDatabase() {
  try {
    console.log('Connecting to database...');
    const conn = await connection;
    
    console.log('Clearing database tables in correct order...');
    
    const queries = [
      'DELETE FROM notifications;',
      'DELETE FROM stars;',
      'DELETE FROM commits;',
      'DELETE FROM files;',
      'DELETE FROM collaborators;',
      'DELETE FROM friends;',
      'DELETE FROM repositories;',
      'DELETE FROM users;'
    ];
    
    for (const query of queries) {
      const [result] = await conn.execute(query);
      console.log(`${query.split(' ')[1]} table cleared. Affected rows: ${result.affectedRows}`);
    }
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    const conn = await connection;
    await conn.end();
  }
}

clearDatabase();