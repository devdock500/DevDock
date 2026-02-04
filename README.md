# DevDock

A full-stack web application for code repository management, similar to GitHub or GitLab.

## Features

- User authentication with JWT
- Create and manage repositories (public/private)
- File upload and management
- Commit history tracking
- Star repositories
- Dark/light theme toggle
- Responsive design

## Technology Stack

### Backend
- Node.js
- Express.js
- MySQL database
- JWT for authentication
- Bcrypt for password hashing

### Frontend
- React.js
- React Router
- CSS Modules

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd devdock
   ```

2. Install backend dependencies:
   ```
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd client
   npm install
   cd ..
   ```

4. Set up the database:
   - Create a MySQL database named `devdock`
   - Execute the SQL schema from `database/schema.sql` to create tables

5. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret in `.env`

## Running the Application

1. Start the backend server:
   ```
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete account

### Repositories
- `POST /api/repos` - Create a new repository
- `GET /api/repos` - Get user repositories
- `GET /api/repos/public` - Get public repositories
- `GET /api/repos/:id` - Get repository by ID
- `PUT /api/repos/:id` - Update repository
- `DELETE /api/repos/:id` - Delete repository
- `POST /api/repos/:id/upload` - Upload file to repository
- `GET /api/repos/:id/files` - Get repository files
- `GET /api/repos/:id/commits` - Get repository commit history
- `POST /api/repos/:id/star` - Star a repository
- `DELETE /api/repos/:id/star` - Unstar a repository
- `GET /api/repos/:id/starred` - Check if repository is starred
- `GET /api/repos/starred` - Get starred repositories

## Database Schema

The database schema is defined in `database/schema.sql` and includes tables for:
- Users
- Repositories
- Files
- Commits
- Stars
- Notifications

## File Storage

Files are stored locally in the `uploads/` directory.

## License

This project is licensed under the MIT License.