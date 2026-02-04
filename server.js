const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const repoRoutes = require('./routes/repo');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notifications');
const collaborationRoutes = require('./routes/collaboration');
const aiRoutes = require('./routes/ai');
const friendRoutes = require('./routes/friends');
const pullRequestRoutes = require('./routes/pullRequests');
const issueRoutes = require('./routes/issues');
const liveEditorRoutes = require('./routes/liveEditor');
const collaborativeFilesRoutes = require('./routes/collaborativeFiles');
const editorRoutes = require('./routes/editor');
const Message = require('./models/Message');
const Friend = require('./models/Friend');
const User = require('./models/User');

// Google OAuth Strategy Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('=== GOOGLE STRATEGY CALLED ===');
    console.log('Profile ID:', profile.id);
    console.log('Profile displayName:', profile.displayName);
    console.log('Profile name:', profile.name);
    console.log('Profile emails:', profile.emails);
    
    // Extract user information
    const googleId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    
    // Extract username - try multiple sources and handle duplicates
    let username = profile.displayName;
    if (!username && profile.name) {
      username = profile.name.givenName + ' ' + profile.name.familyName;
    }
    if (!username) {
      username = email ? email.split('@')[0] : 'user_' + googleId.substring(0, 8);
    }
    
    // Ensure username is unique by appending number if needed
    const baseUsername = username;
    let usernameAttempt = username;
    let counter = 1;
    
    // Check if username exists and generate unique one
    while (true) {
      const existingUser = await new Promise((resolve, reject) => {
        const query = 'SELECT id FROM users WHERE username = ?';
        require('./config/db').query(query, [usernameAttempt], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      if (existingUser.length === 0) {
        username = usernameAttempt;
        break;
      }
      
      // Username exists, try with counter
      usernameAttempt = baseUsername + counter;
      counter++;
      
      // Prevent infinite loop
      if (counter > 100) {
        username = 'user_' + Date.now();
        break;
      }
    }
    
    console.log('Extracted user data:', { googleId, username, email });
    
    // Validate required fields
    if (!googleId) {
      return done(new Error('Google ID is missing from profile'), null);
    }
    if (!email) {
      return done(new Error('Email is missing from Google profile'), null);
    }
    
    // Find user by Google ID
    let user = await new Promise((resolve, reject) => {
      User.findByGoogleId(googleId, (err, result) => {
        if (err) {
          console.error('Error finding user by Google ID:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    
    console.log('Existing user lookup result:', user);
    
    if (!user) {
      // Create new user if not found
      console.log('Creating new user with data:', { googleId, username, email });
      
      user = await new Promise((resolve, reject) => {
        User.create({
          googleId: googleId,
          username: username,
          email: email
        }, (err, result) => {
          if (err) {
            console.error('Error creating user:', err);
            reject(err);
          } else {
            console.log('User created successfully:', result);
            resolve(result);
          }
        });
      });
    }
    
    console.log('Final user object:', user);
    return done(null, user);
  } catch (error) {
    console.error('Google Strategy Error:', error);
    console.error('Error stack:', error.stack);
    return done(error, null);
  }
}
));

// GitHub OAuth Strategy Configuration
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Find user by GitHub ID
    let user = await new Promise((resolve, reject) => {
      User.findByGithubId(profile.id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    if (!user) {
      // Create new user if not found
      user = await new Promise((resolve, reject) => {
        User.create({
          githubId: profile.id,
          username: profile.username || profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : null
        }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await new Promise((resolve, reject) => {
      User.findById(id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = socketIo(server, {
  cors: {
    origin: '*',  // Allow all origins for public access
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours, set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: '*', // Allow all origins for public access
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Store active file editors
const activeEditors = new Map(); // fileId -> Set of user sockets
const fileContents = new Map(); // fileId -> current content
const fileOperations = new Map(); // fileId -> array of operations
const userCursors = new Map(); // fileId -> Map of userId -> cursor position

// Enhanced Operational Transformation functions
function transformOperation(op, againstOp) {
  // Handle insert operations
  if (againstOp.type === 'insert') {
    if (op.position <= againstOp.position) {
      // Operation comes before or at the same position as the insert
      return { ...op, position: op.position + againstOp.text.length };
    } else {
      // Operation comes after the insert
      return { ...op, position: op.position + againstOp.text.length };
    }
  } 
  // Handle delete operations
  else if (againstOp.type === 'delete') {
    if (op.position <= againstOp.position) {
      // Operation comes before or at the same position as the delete
      return op;
    } else if (op.position <= againstOp.position + againstOp.length) {
      // Operation is within the deleted range
      return { ...op, position: againstOp.position };
    } else {
      // Operation comes after the delete
      return { ...op, position: op.position - againstOp.length };
    }
  }
  return op;
}

function applyOperation(text, operation) {
  if (operation.type === 'insert') {
    return text.slice(0, operation.position) + operation.text + text.slice(operation.position);
  } else if (operation.type === 'delete') {
    return text.slice(0, operation.position) + text.slice(operation.position + operation.length);
  }
  return text;
}

// Enhanced Socket.IO connection handling with better collaboration features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a file room for collaboration
  socket.on('join-file', (data) => {
  const { fileId, userId, username } = data;

  // ✅ SET USER ID HERE (VERY IMPORTANT)
  socket.userId = userId;

  socket.join(fileId);
  console.log(`User ${userId} joined file ${fileId}`);

    
    // Track active editors
    if (!activeEditors.has(fileId)) {
      activeEditors.set(fileId, new Set());
      fileOperations.set(fileId, []);
      userCursors.set(fileId, new Map());
    }
    activeEditors.get(fileId).add({ socketId: socket.id, userId, username });
    
    // Notify others in the room about the new user
    socket.to(fileId).emit('user-joined', { userId, username });
    
    // Send current file content and operations to the new user
    if (fileContents.has(fileId)) {
      socket.emit('file-content', {
        content: fileContents.get(fileId),
        operations: fileOperations.get(fileId)
      });
    }
    
    // Send list of active editors and cursors
    const editors = Array.from(activeEditors.get(fileId));
    const cursors = Object.fromEntries(userCursors.get(fileId));
    io.to(fileId).emit('active-editors', { editors, cursors });
  });
  
  // Friend-related socket events
  socket.on('join-friend-room', (data) => {
    const { userId } = data;
    socket.userId = userId; // Set the user ID on the socket for proper identification
    socket.join(`friend_${userId}`);
    console.log(`User ${socket.id} joined friend room for user ${userId}`);
  });
  
  socket.on('send-message', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      socket.emit('message-error', { error: 'Authentication required' });
      return;
    }
    
    const { senderId, receiverId, message, timestamp } = data;
    
    // Verify that the senderId matches the socket's userId to prevent impersonation
    if (senderId !== socket.userId) {
      console.error('Unauthorized message attempt: socket.userId != senderId', {
        socketUserId: socket.userId,
        senderId: senderId
      });
      socket.emit('message-error', { error: 'Unauthorized: sender ID mismatch' });
      return;
    }
    
    // Check if users are friends before allowing the message
    Friend.areFriends(senderId, receiverId, (err, areFriends) => {
      if (err) {
        console.error('Error checking friendship status:', err);
        socket.emit('message-error', { error: 'Database error while checking friendship' });
        return;
      }
      
      if (areFriends) {
        // Save message to database
        Message.create(senderId, receiverId, message, (err, result) => {
          if (err) {
            console.error('Error saving message to database:', err);
            socket.emit('message-error', { error: 'Failed to save message' });
            return;
          }
          
          // Broadcast message to receiver's friend room
          io.to(`friend_${receiverId}`).emit('receive-message', {
            senderId,
            receiverId,
            message,
            timestamp: timestamp || new Date().toISOString()
          });
        });
      } else {
        // Optionally send an error back to sender
        socket.emit('message-error', { error: 'Users are not friends' });
      }
    });
  });
  
  // WebRTC signaling events
  socket.on('call-user', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      socket.emit('call-error', { error: 'Authentication required' });
      return;
    }
    
    const { targetUserId, callerName } = data;
    socket.to(`friend_${targetUserId}`).emit('incoming-call', {
      callerId: socket.userId,
      callerName: callerName
    });
  });
  
  socket.on('call-rejected', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { callerId } = data;
    socket.to(`friend_${callerId}`).emit('call-rejected', {
      callerId: socket.userId
    });
  });
  
  socket.on('call-cancelled', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { callerId } = data;
    socket.to(`friend_${callerId}`).emit('call-cancelled', {
      callerId: socket.userId
    });
  });
  
  socket.on('call-ended', (data) => {
    const { targetId, endedBy } = data;
    socket.to(`friend_${targetId}`).emit('call-ended', {
      endedBy: endedBy
    });
  });
  
  socket.on('webrtc-offer', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { targetId, offer } = data;
    socket.to(`friend_${targetId}`).emit('webrtc-offer', {
      offer,
      from: socket.userId
    });
  });
  
  socket.on('webrtc-answer', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { targetId, answer } = data;
    socket.to(`friend_${targetId}`).emit('webrtc-answer', {
      answer,
      from: socket.userId
    });
  });
  
  socket.on('webrtc-ice-candidate', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { targetId, candidate } = data;
    socket.to(`friend_${targetId}`).emit('webrtc-ice-candidate', {
      candidate,
      from: socket.userId
    });
  });
  
  socket.on('get-chat-history', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      socket.emit('chat-history-error', { error: 'Authentication required' });
      return;
    }
    
    const { userId, otherUserId } = data;
    
    // Verify that the userId matches the socket's userId to prevent unauthorized access
    if (userId !== socket.userId) {
      console.error('Unauthorized chat history access attempt: socket.userId != userId', {
        socketUserId: socket.userId,
        userId: userId
      });
      socket.emit('chat-history-error', { error: 'Unauthorized: user ID mismatch' });
      return;
    }
    
    // Check if users are friends before allowing to get chat history
    Friend.areFriends(userId, otherUserId, (err, areFriends) => {
      if (err) {
        console.error('Error checking friendship status for chat history:', err);
        socket.emit('chat-history-error', { error: 'Database error while checking friendship' });
        return;
      }
      
      if (areFriends) {
        // Get chat history from database
        Message.getConversation(userId, otherUserId, (err, messages) => {
          if (err) {
            console.error('Error getting chat history:', err);
            socket.emit('chat-history-error', { error: 'Failed to get chat history' });
            return;
          }
          
          socket.emit('chat-history', { messages, otherUserId });
          
          // Mark messages as read if they were sent by the other user
          if (messages && messages.length > 0) {
            Message.markAsRead(otherUserId, userId, (err, result) => {
              if (err) {
                console.error('Error marking messages as read:', err);
              }
            });
          }
        });
      } else {
        socket.emit('chat-history-error', { error: 'Users are not friends' });
      }
    });
  });
  
  socket.on('update-user-status', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { userId, online } = data;
    
    // Verify that the userId matches the socket's userId to prevent impersonation
    if (userId !== socket.userId) {
      console.error('Unauthorized status update attempt: socket.userId != userId', {
        socketUserId: socket.userId,
        userId: userId
      });
      return;
    }
    
    // Broadcast user status to all friend rooms the user belongs to
    Friend.getFriends(userId, (err, friends) => {
      if (err) {
        console.error('Error getting friends for status update:', err);
        return;
      }
      
      friends.forEach(friend => {
        const friendId = friend.follower_id === userId ? friend.following_id : friend.follower_id;
        io.to(`friend_${friendId}`).emit('user-status-change', {
          userId,
          online
        });
      });
    });
  });
  
  // Handle text changes with improved operational transformation
  socket.on('text-change', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { fileId, operation, userId, username } = data;
    
    // Verify that the userId matches the socket's userId to prevent unauthorized editing
    if (userId !== socket.userId) {
      console.error('Unauthorized text change attempt: socket.userId != userId', {
        socketUserId: socket.userId,
        userId: userId
      });
      return;
    }
    
    // Store the operation
    if (!fileOperations.has(fileId)) {
      fileOperations.set(fileId, []);
    }
    
    const operations = fileOperations.get(fileId);
    operations.push({ ...operation, userId, timestamp: Date.now() });
    
    // Transform the operation against previous operations
    let transformedOp = { ...operation };
    for (let i = operations.length - 2; i >= 0; i--) {
      if (operations[i].userId !== userId) {
        transformedOp = transformOperation(transformedOp, operations[i]);
      }
    }
    
    // Apply the transformed operation to the current content
    let currentContent = fileContents.get(fileId) || '';
    currentContent = applyOperation(currentContent, transformedOp);
    fileContents.set(fileId, currentContent);
    
    // Broadcast the operation to others in the room
    socket.to(fileId).emit('text-change', {
      fileId,
      operation: transformedOp,
      userId,
      username
    });
    
    // Update active editors list
    if (activeEditors.has(fileId)) {
      const editors = Array.from(activeEditors.get(fileId));
      const cursors = Object.fromEntries(userCursors.get(fileId));
      io.to(fileId).emit('active-editors', { editors, cursors });
    }
  });
  
  // Handle cursor position updates
  socket.on('cursor-move', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { fileId, userId, username, position } = data;
    
    // Verify that the userId matches the socket's userId to prevent unauthorized cursor updates
    if (userId !== socket.userId) {
      console.error('Unauthorized cursor move attempt: socket.userId != userId', {
        socketUserId: socket.userId,
        userId: userId
      });
      return;
    }
    
    // Store cursor position
    if (userCursors.has(fileId)) {
      userCursors.get(fileId).set(userId, { position, username });
    }
    
    socket.to(fileId).emit('cursor-move', data);
  });
  
  // Handle user leaving
  socket.on('leave-file', (data) => {
    // Check if user ID is set
    if (!socket.userId) {
      console.error('User ID not set for socket:', socket.id);
      return;
    }
    
    const { fileId, userId } = data;
    
    // Verify that the userId matches the socket's userId to prevent unauthorized leaving
    if (userId !== socket.userId) {
      console.error('Unauthorized leave-file attempt: socket.userId != userId', {
        socketUserId: socket.userId,
        userId: userId
      });
      return;
    }
    
    socket.leave(fileId);
    
    // Remove user from active editors
    if (activeEditors.has(fileId)) {
      const editors = activeEditors.get(fileId);
      for (const editor of editors) {
        if (editor.userId === userId) {
          editors.delete(editor);
          break;
        }
      }
      
      // Remove user's cursor
      if (userCursors.has(fileId)) {
        userCursors.get(fileId).delete(userId);
      }
      
      // Notify others
      socket.to(fileId).emit('user-left', { userId });
      
      // Update active editors list
      const updatedEditors = Array.from(editors);
      const cursors = Object.fromEntries(userCursors.get(fileId) || new Map());
      io.to(fileId).emit('active-editors', { editors: updatedEditors, cursors });
      
      // Clean up if no more editors
      if (editors.size === 0) {
        activeEditors.delete(fileId);
        fileContents.delete(fileId);
        fileOperations.delete(fileId);
        userCursors.delete(fileId);
      }
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Update user status to offline if userId is known
    if (socket.userId) {
      Friend.getFriends(socket.userId, (err, friends) => {
        if (err) {
          console.error('Error getting friends for status update on disconnect:', err);
        } else {
          friends.forEach(friend => {
            const friendId = friend.follower_id === socket.userId ? friend.following_id : friend.follower_id;
            io.to(`friend_${friendId}`).emit('user-status-change', {
              userId: socket.userId,
              online: false
            });
          });
        }
      });
    }
    
    // Remove user from all active editing sessions
    for (const [fileId, editors] of activeEditors.entries()) {
      let userFound = false;
      for (const editor of editors) {
        if (editor.socketId === socket.id) {
          editors.delete(editor);
          userFound = true;
          
          // Remove user's cursor
          if (userCursors.has(fileId)) {
            userCursors.get(fileId).delete(editor.userId);
          }
          
          // Notify others
          socket.to(fileId).emit('user-left', { userId: editor.userId });
          break;
        }
      }
      
      if (userFound) {
        // Update active editors list
        const updatedEditors = Array.from(editors);
        const cursors = Object.fromEntries(userCursors.get(fileId) || new Map());
        io.to(fileId).emit('active-editors', { editors: updatedEditors, cursors });
        
        // Clean up if no more editors
        if (editors.size === 0) {
          activeEditors.delete(fileId);
          fileContents.delete(fileId);
          fileOperations.delete(fileId);
          userCursors.delete(fileId);
        }
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/repos', pullRequestRoutes);
app.use('/api/repos', issueRoutes);
app.use('/api/live-editor', liveEditorRoutes);
app.use('/api/collaborative-files', collaborativeFilesRoutes);
app.use('/api/editor', editorRoutes);

// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  (req, res, next) => {
    console.log('=== GOOGLE OAUTH CALLBACK STARTED ===');
    console.log('Query params:', req.query);
    console.log('Session ID:', req.sessionID);
    
    passport.authenticate('google', async (err, user, info) => {
      console.log('=== PASSPORT AUTHENTICATE CALLBACK ===');
      console.log('Error:', err);
      console.log('User object:', user);
      console.log('Info:', info);
      
      if (err) {
        console.error('Google OAuth Error:', err);
        console.error('Error stack:', err.stack);
        return res.redirect('/login?error=oauth_error&details=' + encodeURIComponent(err.message));
      }
      
      if (!user) {
        console.error('No user returned from Google OAuth');
        console.error('Info object:', info);
        return res.redirect('/login?error=no_user');
      }
      
      console.log('Attempting to log in user:', user);
      
      req.logIn(user, (err) => {
        if (err) {
          console.error('Error logging in user:', err);
          console.error('Login error stack:', err.stack);
          return next(err);
        }
        
        console.log('User logged in successfully');
        
        // Successful authentication, generate JWT
        try {
          const jwt = require('jsonwebtoken');
          const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
          );
          
          console.log('JWT token generated successfully');
          console.log('Redirecting to frontend with token');
          
          // Send token to frontend
          res.redirect(`http://localhost:3000/auth/success?token=${token}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`);
        } catch (jwtError) {
          console.error('JWT generation error:', jwtError);
          return next(jwtError);
        }
      });
    })(req, res, next);
  }
);

// GitHub OAuth Routes
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  (req, res, next) => {
    console.log('GitHub OAuth callback received');
    console.log('Query params:', req.query);
    passport.authenticate('github', (err, user, info) => {
      if (err) {
        console.error('GitHub OAuth Error:', err);
        return res.redirect('/login?error=oauth_error');
      }
      if (!user) {
        console.error('No user returned from GitHub OAuth');
        return res.redirect('/login?error=no_user');
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error('Error logging in user:', err);
          return next(err);
        }
        // Successful authentication, generate JWT
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        // Send token to frontend
        res.redirect(`http://localhost:3000/auth/success?token=${token}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`);
      });
    })(req, res, next);
  }
);

// Logout route
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid'); // Default session cookie name
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Expose io to other modules
app.set('io', io);

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});