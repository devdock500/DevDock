const mysql = require('mysql2');
require('dotenv').config();

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL server.');
  
  // Create database
  connection.query('CREATE DATABASE IF NOT EXISTS devdock;', (err, results) => {
    if (err) {
      console.error('Error creating database:', err);
      connection.end();
      return;
    }
    console.log('Database created or already exists.');
    
    // Use the database
    connection.changeUser({database : 'devdock'}, (err) => {
      if (err) {
        console.error('Error switching to devdock database:', err);
        connection.end();
        return;
      }
      
      // Read and execute schema
      const fs = require('fs');
      const schema = fs.readFileSync('./database/schema.sql', 'utf8');
      
      // Split the schema into individual statements
      const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
      
      // Execute each statement
      let i = 0;
      function executeNextStatement() {
        if (i >= statements.length) {
          console.log('All schema statements executed successfully.');
          connection.end();
          return;
        }
        
        const statement = statements[i].trim() + ';';
        if (statement.startsWith('--') || statement === ';') {
          i++;
          executeNextStatement();
          return;
        }
        
        connection.query(statement, (err, results) => {
          if (err) {
            console.error('Error executing statement:', err);
            connection.end();
            return;
          }
          console.log(`Statement ${i+1} executed successfully.`);
          i++;
          executeNextStatement();
        });
      }
      
      executeNextStatement();
    });
  });
});