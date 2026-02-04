const db = require('./config/db');

// Add indexes for better performance
const createIndexes = [
  'CREATE INDEX idx_likes_user_id ON likes(user_id);',
  'CREATE INDEX idx_likes_repo_id ON likes(repo_id);',
  'CREATE INDEX idx_dislikes_user_id ON dislikes(user_id);',
  'CREATE INDEX idx_dislikes_repo_id ON dislikes(repo_id);',
  'CREATE INDEX idx_shares_user_id ON shares(user_id);',
  'CREATE INDEX idx_shares_repo_id ON shares(repo_id);',
  'CREATE INDEX idx_reposts_user_id ON reposts(user_id);',
  'CREATE INDEX idx_reposts_repo_id ON reposts(repo_id);',
  'CREATE INDEX idx_repository_views_user_id ON repository_views(user_id);',
  'CREATE INDEX idx_repository_views_repo_id ON repository_views(repo_id);',
  'CREATE INDEX idx_repository_views_viewed_at ON repository_views(viewed_at);'
];

let index = 0;
function createNextIndex() {
  if (index < createIndexes.length) {
    db.query(createIndexes[index], (err, result) => {
      if (err) {
        // If it's a duplicate key error, it means the index already exists
        if (err.code === 'ER_DUP_KEY' || err.code === 'ER_DUP_INDEX') {
          console.log(`Index ${index + 1} already exists`);
        } else {
          console.log(`Error creating index ${index + 1}:`, err.message);
        }
      } else {
        console.log(`Index ${index + 1} created successfully`);
      }
      index++; 
      createNextIndex();
    });
  } else {
    console.log('All indexes have been checked/created');
    db.end();
  }
}

createNextIndex();