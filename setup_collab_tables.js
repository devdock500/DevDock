const db = require('./config/db');

// Create collaborative_files table
const createCollabFilesTable = `
CREATE TABLE IF NOT EXISTS collaborative_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  extension VARCHAR(10),
  content LONGTEXT,
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
)`;

// Create file_collaborators table
const createFileCollaboratorsTable = `
CREATE TABLE IF NOT EXISTS file_collaborators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('editor', 'viewer') DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_file_user (file_id, user_id),
  FOREIGN KEY (file_id) REFERENCES collaborative_files(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

console.log('Creating collaborative files tables...');

db.query(createCollabFilesTable, (err, result) => {
  if (err) {
    console.error('Error creating collaborative_files table:', err);
    process.exit(1);
  } else {
    console.log('✓ collaborative_files table created successfully');
    
    db.query(createFileCollaboratorsTable, (err2, result2) => {
      if (err2) {
        console.error('Error creating file_collaborators table:', err2);
        process.exit(1);
      } else {
        console.log('✓ file_collaborators table created successfully');
        console.log('All tables created successfully!');
        process.exit(0);
      }
    });
  }
});