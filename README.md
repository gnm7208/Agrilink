# AgriLink

AgriLink is a mobile-first agricultural super app that connects farmers with agricultural experts through posts, communities, and messaging. Built with modern web technologies, it provides a seamless platform for knowledge sharing, expert consultation, and community building in the agricultural sector.

## Live Application

- **Frontend:** https://agrilink-sigma.vercel.app
- **Backend API:** https://agrilink-11rw.onrender.com

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features

- **Post Feed:** Create, browse, and engage with agricultural posts and articles
- **User Authentication:** Secure JWT-based authentication with email verification
- **Role-Based Access:** User and Admin roles with specific permissions
- **Agricultural News:** Integrated NewsAPI feed for agriculture-related articles
- **Image Upload:** Cloudinary integration for post images and profile photos
- **Communities:** Create and join topic-based agricultural communities
- **Messaging:** Direct user-to-user and community messaging
- **Responsive Design:** Mobile-first UI with adaptive navigation (SideNav + BottomNav)

### User Features

- **Home Feed:** Merged feed of user posts and agriculture news, sorted by date
- **Post Interactions:** Like, comment, save, and share posts
- **User Profiles:** Customizable profiles with bio, location, and profile image
- **Follow System:** Follow agricultural experts and other users
- **Community Membership:** Join communities and participate in discussions
- **Direct Messaging:** Private conversations with other users
- **Email Verification:** Secure account verification via email

### Admin Features

- **User Management:** View and manage all platform users
- **Role Assignment:** Assign and update user roles
- **Community Moderation:** Delete communities when necessary
- **Platform Oversight:** Full access to all platform resources

## Tech Stack

### Frontend

- **Framework:** React 19 with Vite 7
- **Routing:** React Router v7
- **Styling:** TailwindCSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State Management:** React Context API
- **HTTP Client:** Fetch API with centralized config
- **Build Tool:** Vite

### Backend

- **Framework:** Flask (Python)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Authentication:** JWT (PyJWT) + Session fallback
- **File Upload:** Cloudinary integration
- **Migrations:** Flask-Migrate (Alembic)
- **CORS:** Flask-CORS for cross-origin requests
- **Rate Limiting:** Flask-Limiter
- **Security:** Bleach for HTML sanitization, Bcrypt for password hashing
- **Production Server:** Gunicorn

### Infrastructure

- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** Render PostgreSQL
- **File Storage:** Cloudinary
- **CI/CD:** GitHub Actions
- **Version Control:** Git/GitHub

## Architecture

```
+-------------------+    +-------------------+    +-------------------+
|   React Client    |----|   Flask API       |----|   PostgreSQL      |
|   (Vercel)        |    |   (Render)        |    |   (Render)        |
+-------------------+    +-------------------+    +-------------------+
         |                        |                        |
         |                        |                        |
         +------------------------+------------------------+
                                  |
                     +-------------------+
                     |   Cloudinary      |
                     | (Image Storage)   |
                     +-------------------+
                                  |
                     +-------------------+
                     |   NewsAPI         |
                     | (Ag News Feed)    |
                     +-------------------+
```

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Git

### Backend Setup

1. **Clone the repository**

```bash
git clone https://github.com/Ndet0/Agrilink.git
cd Agrilink
```

2. **Create virtual environment**

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Environment Configuration**

Create a `.env` file in the `server/` directory:

```bash
DATABASE_URL=postgresql://username:password@localhost/agrilink
SECRET_KEY=your-secret-key-here-min-32-chars
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=true
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEWSAPI_KEY=your-newsapi-key
```

5. **Database Setup**

```bash
createdb agrilink
flask db upgrade
python seed_roles.py
```

6. **Run Backend Server**

```bash
python app.py
# Server runs on http://localhost:5000
```

### Frontend Setup

1. **Install dependencies**

```bash
cd client
npm install
```

2. **Environment Configuration (Optional)**

Create a `.env` file in the `client/` directory:

```bash
VITE_API_URL=http://localhost:5000/api
```

3. **Run Development Server**

```bash
npm run dev
# Client runs on http://localhost:5173
```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register           # User registration
POST /api/auth/login              # User login
POST /api/auth/logout             # User logout
GET  /api/auth/me                 # Get current user
POST /api/auth/verify-email       # Verify email address
POST /api/auth/resend-verification # Resend verification email
POST /api/auth/request-password-reset # Request password reset
GET  /api/auth/verify-reset-token/:token # Verify reset token
POST /api/auth/reset-password     # Reset password
```

### User Endpoints

```
GET    /api/users                 # List users (admin only)
GET    /api/users/experts         # List expert users
GET    /api/users/:id             # Get user profile
PATCH  /api/users/:id             # Update user profile
DELETE /api/users/:id             # Delete user (admin only)
POST   /api/users/:id/follow      # Follow a user
DELETE /api/users/:id/follow      # Unfollow a user
GET    /api/users/:id/followers   # Get user's followers
GET    /api/users/:id/following   # Get user's following
```

### Post Endpoints

```
GET    /api/posts                 # List all posts
POST   /api/posts                 # Create a post
GET    /api/posts/:id             # Get a single post
PATCH  /api/posts/:id             # Update a post
DELETE /api/posts/:id             # Delete a post
POST   /api/posts/:id/like        # Like a post
DELETE /api/posts/:id/like        # Unlike a post
GET    /api/posts/:id/comments    # Get post comments
POST   /api/posts/:id/comments    # Add a comment
POST   /api/posts/:id/images      # Add image to post
GET    /api/posts/news             # Get agriculture news
GET    /api/posts/news/:id         # Get single news article
```

### Community Endpoints

```
GET    /api/communities           # List communities
POST   /api/communities           # Create a community
GET    /api/communities/:id       # Get community details
DELETE /api/communities/:id       # Delete community (admin)
POST   /api/communities/:id/join  # Join a community
POST   /api/communities/:id/leave # Leave a community
GET    /api/communities/:id/members # Get community members
GET    /api/communities/:id/posts   # Get community posts
```

### Message Endpoints

```
POST   /api/messages              # Send a message
GET    /api/messages/conversations # List conversations
GET    /api/messages/user/:id     # Messages with a user
GET    /api/messages/community/:id # Messages in a community
DELETE /api/messages/:id          # Delete a message
```

### Upload Endpoints

```
POST   /api/uploads/images        # Upload an image
```

## User Roles

### User (Default)

- Browse and search posts and news
- Create, edit, and delete own posts
- Like and comment on posts
- Follow other users
- Join and participate in communities
- Send and receive messages
- Upload images

### Admin

- All User permissions
- Manage all users (view, update roles, delete)
- Delete any community
- Full platform access

## Deployment

### Production Environment

- **Frontend:** Deployed on Vercel with automatic deployments from `main`
- **Backend:** Deployed on Render with Gunicorn WSGI server
- **Database:** Render PostgreSQL with automated backups
- **CDN:** Cloudinary for optimized image delivery

### Environment Variables (Production)

**Backend (Render):**

```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-production-secret-key
FRONTEND_ORIGINS=https://agrilink-sigma.vercel.app
NEWSAPI_KEY=your-newsapi-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (Vercel):**

```bash
VITE_API_URL=https://agrilink-11rw.onrender.com/api
```

## Contributing

### Team Members

**Backend Development:**

- Festus Ndeto - Backend Developer
- George Mukirai- Backend Developer

**Frontend Development:**

- Maina Ng'ang'a - Frontend Developer
- Prince Kibali- Frontend Developer

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to `main`

### Code Standards

- **Backend:** Follow PEP 8 conventions, use decorators from `rbac.py` for auth
- **Frontend:** Functional components with hooks, TailwindCSS utility classes
- **Testing:** Backend tests with pytest, frontend linting with ESLint
- **Git:** Feature branches, reviewed PRs, conventional commit messages

## License

MIT License - see LICENSE file for details.

Copyright (c) 2026 AgriLink Team

---

Built with care by the AgriLink Team
