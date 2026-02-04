# DevDock Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL database server
- npm (comes with Node.js) or yarn

## Step-by-Step Setup

### 1. Database Setup

1. Create a MySQL database named `devdock`:
   ```sql
   CREATE DATABASE devdock;
   ```

2. Execute the schema file to create tables:
   ```bash
   mysql -u your_username -p devdock < database/schema.sql
   ```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your database credentials:
   ```
   # Server Configuration
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret

   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_NAME=devdock
   ```

### 3. Backend Setup

1. Install backend dependencies:
   ```bash
   npm install
   ```

### 4. Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Return to the root directory:
   ```bash
   cd ..
   ```

### 5. Running the Application

#### Development Mode

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd client
   npm start
   ```

#### Production Mode

1. Build the frontend application:
   ```bash
   npm run build-client
   ```

2. Start the backend server (it will serve the built frontend):
   ```bash
   npm start
   ```

### 6. Access the Application

Open your browser and navigate to:
- Development: http://localhost:3000
- Production: http://localhost:5000

## Folder Structure

```
devdock/
├── client/              # React frontend
│   ├── public/          # Static assets
│   └── src/             # React components and logic
├── config/              # Database configuration
├── database/            # Database schema
├── middleware/          # Express middleware
├── models/              # Database models
├── routes/              # API routes
├── uploads/             # Uploaded files (created at runtime)
├── .env                 # Environment variables
├── .env.example         # Example environment file
├── server.js            # Entry point
└── package.json         # Backend dependencies
```

## Key Features Implemented

1. **User Authentication**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Registration and login functionality

2. **Repository Management**
   - Create public/private repositories
   - View repository details
   - Delete repositories

3. **File Management**
   - Upload files to repositories
   - View repository files
   - File type support (.env, .html, .txt, .js, .css, .mp4, .mp3, .png, .jpg, etc.)

4. **Version Control**
   - Commit history tracking
   - View commit details

5. **Social Features**
   - Star repositories
   - View starred repositories

6. **User Profile**
   - Update profile information
   - Change password
   - Delete account

7. **UI Features**
   - Dark/light theme toggle
   - Responsive design
   - Intuitive navigation

## API Endpoints

All API endpoints are prefixed with `/api`:

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Users**: `/api/users/profile`, `/api/users/password`, `/api/users/account`
- **Repositories**: `/api/repos`, `/api/repos/public`, `/api/repos/:id`, etc.

## File Storage

Files are stored locally in the `uploads/` directory. This directory is created automatically when you upload your first file.

## Security Considerations

1. Passwords are hashed using bcrypt
2. JWT tokens are used for authentication
3. CORS is enabled for development
4. File upload size is limited to 50MB
5. SQL injection prevention through parameterized queries

## Customization

You can customize the application by:

1. Modifying the React components in `client/src/components/`
2. Updating the CSS styles in the respective component CSS files
3. Adding new API endpoints in the `routes/` directory
4. Extending database models in the `models/` directory

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your database credentials in `.env`
   - Ensure MySQL server is running
   - Verify the database `devdock` exists

2. **Port Already in Use**
   - Change the PORT in `.env` to an available port

3. **Frontend Not Loading**
   - Ensure both backend and frontend servers are running
   - Check the browser console for errors

### Getting Help

If you encounter issues not covered in this guide:
1. Check the browser console and terminal for error messages
2. Verify all installation steps were completed
3. Ensure environment variables are correctly set