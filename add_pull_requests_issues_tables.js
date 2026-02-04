const mysql = require('mysql2');
require('dotenv').config();

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'devdock'
});

// SQL statements to create pull requests and issues tables
const createPullRequestsTable = `
CREATE TABLE IF NOT EXISTS pull_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repo_id INT NOT NULL,
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source_branch VARCHAR(100) NOT NULL DEFAULT 'main',
  target_branch VARCHAR(100) NOT NULL DEFAULT 'main',
  status ENUM('open', 'closed', 'merged') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  merged_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
)`;

const createIssuesTable = `
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repo_id INT NOT NULL,
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  state ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
)`;

// Additional indexes for better performance
const createPullRequestsIndexes = `
CREATE INDEX idx_pull_requests_repo_id ON pull_requests(repo_id);
CREATE INDEX idx_pull_requests_author_id ON pull_requests(author_id);
CREATE INDEX idx_pull_requests_status ON pull_requests(status);
CREATE INDEX idx_pull_requests_created_at ON pull_requests(created_at);
`;

const createIssuesIndexes = `
CREATE INDEX idx_issues_repo_id ON issues(repo_id);
CREATE INDEX idx_issues_author_id ON issues(author_id);
CREATE INDEX idx_issues_state ON issues(state);
CREATE INDEX idx_issues_created_at ON issues(created_at);
`;

// Connect to the database and run the SQL statements
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  
  console.log('Connected to database, creating tables...');
  
  // Create pull requests table
  db.query(createPullRequestsTable, (err, result) => {
    if (err) {
      console.error('Error creating pull_requests table:', err);
      return;
    }
    console.log('Pull requests table created successfully');
    
    // Create indexes for pull requests
    db.query(createPullRequestsIndexes, (err, result) => {
      if (err) {
        console.error('Error creating pull_requests indexes:', err);
        return;
      }
      console.log('Pull requests indexes created successfully');
      
      // Create issues table
      db.query(createIssuesTable, (err, result) => {
        if (err) {
          console.error('Error creating issues table:', err);
          return;
        }
        console.log('Issues table created successfully');
        
        // Create indexes for issues
        db.query(createIssuesIndexes, (err, result) => {
          if (err) {
            console.error('Error creating issues indexes:', err);
            return;
          }
          console.log('Issues indexes created successfully');
          
          console.log('All tables and indexes created successfully!');
          db.end();
        });
      });
    });
  });
});