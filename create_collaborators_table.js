require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'devdock'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Successfully connected to the database.');
  
  // Create the collaborators table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS collaborators (
      id INT AUTO_INCREMENT PRIMARY KEY,
      repo_id INT NOT NULL,
      user_id INT NOT NULL,
      role ENUM('viewer', 'editor', 'admin') DEFAULT 'editor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_repo_user (repo_id, user_id),
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  
  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating collaborators table:', err);
      connection.end();
      return;
    }
    
    console.log('Collaborators table created successfully');
    connection.end();
  });
});