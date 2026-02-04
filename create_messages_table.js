const mysql = require('mysql2/promise');
require('dotenv').config();

async function createMessagesTable() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'devdock'
    });

    console.log('Creating messages table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_sender_receiver (sender_id, receiver_id),
        INDEX idx_receiver_sender (receiver_id, sender_id),
        INDEX idx_timestamp (timestamp)
      );
    `;
    
    await connection.execute(createTableQuery);
    console.log('Messages table created successfully!');
    
    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error creating messages table:', error);
  }
}

createMessagesTable();