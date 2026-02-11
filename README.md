# Agrilink

An Agricultural Super App that revolutionizes the agricultural sector through centralization of information and networking of agricultural experts, farmers, and communities.

## 🌾 Problem Statement

Agriculture faces numerous challenges that impact farmers' livelihoods and sustainability:

- **Limited Access to Information**: Farmers lack up-to-date agricultural knowledge on crop selection, pest management, and farming practices
- **Fragmented Supply Chain**: Market inefficiencies, suboptimal pricing, and limited market access
- **Limited Financial Access**: Difficulties in obtaining credit, managing cash flow, and mitigating risks
- **Low Technology Adoption**: Digital literacy gaps and infrastructure limitations hinder technology adoption
- **Data Privacy Concerns**: Hesitation to share sensitive agricultural data

## 💡 Solution

Agrilink is a centralized platform that connects farmers, agricultural experts, and communities to share knowledge, collaborate, and access vital agricultural information.

## ✨ Features

### User Management
- User registration and authentication (JWT-based)
- Email verification for new accounts
- Role-based access control (Farmer, Expert, Admin)
- Profile management with bio, location, and avatar
- Password reset functionality

### Social Networking
- Follow agricultural experts and other users
- View followers and following lists
- User discovery and expert listings

### Communities
- Join agricultural communities/groups
- Community-specific posts and discussions
- Community messaging channels
- Member management

### Content Management
- Create and publish agricultural blogs/posts
- Rich text content with image support (via Cloudinary)
- View posts from followed experts and communities
- Post filtering by author or community

### Engagement
- Like posts
- Comment on posts
- Real-time engagement metrics (likes count, comments count)

### Messaging
- Direct messaging between users
- Community channel messaging
- Inbox management

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 3.1.2 (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0.46
- **Migrations**: Alembic 1.18.1
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: Cloudinary
- **Security**: Bleach (HTML sanitization), Werkzeug password hashing
- **Rate Limiting**: Flask-Limiter
- **Testing**: Pytest 8.0.0

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.13.0
- **Styling**: Tailwind CSS 4.1.18
- **Animations**: Framer Motion 12.29.2
- **Icons**: Lucide React 0.563.0
- **Build Tool**: Vite 7.2.4

## 📁 Project Structure

```
Agrilink/
├── .github/
│   └── workflows/
│       └── ci.yml         # CI/CD pipeline configuration
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── assets/        # Images and static files
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # Base UI components
│   │   │   ├── ProtectedRoute.jsx  # Route protection
│   │   │   └── ...        # Other components
│   │   ├── config/        # API configuration
│   │   ├── context/       # React context providers
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useAuth.js # Authentication hook
│   │   ├── pages/         # Page components
│   │   │   ├── VerifyEmail.jsx  # Email verification
│   │   │   └── ...        # Other pages
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── server/                # Flask backend
│   ├── routes/           # API route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── users.py      # User management
│   │   ├── posts.py      # Post CRUD operations
│   │   ├── communities.py # Community management
│   │   ├── messages.py   # Messaging system
│   │   └── uploads.py    # Image upload handling
│   ├── services/         # Business logic services
│   │   └── email_service.py  # Email sending service
│   ├── utils/            # Utility functions
│   │   ├── validators.py # Input validation
│   │   └── email_verification.py  # Email verification tokens
│   ├── migrations/       # Database migrations
│   │   └── versions/     # Migration scripts
│   ├── tests/           # Backend tests
│   │   ├── test_auth.py
│   │   ├── test_email_verification.py
│   │   └── ...          # Other test files
│   ├── dbschema/        # Database documentation
│   ├── models.py        # SQLAlchemy models
│   ├── app.py           # Flask application
│   ├── config.py        # Configuration
│   ├── extensions.py    # Flask extensions
│   ├── rbac.py          # Role-based access control
│   └── requirements.txt
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Cloudinary account (for image uploads)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

5. Configure environment variables:
```env
# Security
SECRET_KEY=your-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/agrilink

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Verification
EMAIL_FROM=noreply@agrilink.example.com
FRONTEND_URL=http://localhost:5173

# CORS
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000
```

6. Initialize the database:
```bash
flask db upgrade
python seed_roles.py  # Seed default roles
```

7. Run the development server:
```bash
flask run
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure the API endpoint:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing

### Backend Tests
```bash
cd server
pytest
pytest --cov  # With coverage report
```

### Frontend Tests
```bash
cd client
npm test
```

## 📚 API Documentation

Comprehensive API documentation is available in [server/dbschema/API_Documentation.md](server/dbschema/API_Documentation.md)

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email

#### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/profile` - Update own profile
- `POST /api/users/{id}/follow` - Follow user
- `DELETE /api/users/{id}/follow` - Unfollow user

#### Posts
- `GET /api/posts` - List posts (paginated)
- `POST /api/posts` - Create post
- `POST /api/posts/{id}/like` - Like post
- `POST /api/posts/{id}/comments` - Add comment

#### Communities
- `GET /api/communities` - List communities
- `POST /api/communities/{id}/join` - Join community
- `POST /api/communities/{id}/leave` - Leave community

#### Messages
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Start conversation
- `POST /api/conversations/{id}/messages` - Send message

## 🗄️ Database Schema

Database schema documentation is available in [server/dbschema/Database_schema.md](server/dbschema/Database_schema.md)

### Core Tables
- `users` - User accounts and profiles
- `roles` - RBAC role definitions
- `posts` - Agricultural blogs/posts
- `post_images` - Post image attachments
- `communities` - Agricultural communities
- `community_memberships` - User-community relationships
- `follows` - User following relationships
- `likes` - Post likes
- `comments` - Post comments
- `messages` - Direct and community messages

## 🔒 Security Features

- JWT-based authentication
- Email verification for new accounts
- Password hashing with Werkzeug
- HTML sanitization with Bleach
- Rate limiting on API endpoints
- CORS configuration
- SQL injection prevention via SQLAlchemy ORM
- Secure password reset tokens with expiration
- Protected routes with authentication context

## 📱 Mobile Responsiveness

The application is designed with mobile-first principles using Tailwind CSS, ensuring optimal experience across all device sizes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Festus Ndeto** - *Initial work* - [GitHub](https://github.com/Ndet0)

## 🙏 Acknowledgments

- Agricultural experts who provided domain knowledge
- Open source community for the amazing tools and libraries
- All contributors who have helped shape this project

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.

## 🔐 Security

For security concerns, please refer to [SECURITY_FIXES.md](SECURITY_FIXES.md).

---

**Built with ❤️ for the agricultural community**
