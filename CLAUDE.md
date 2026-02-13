# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgriLink is a mobile-first agricultural super app that connects farmers with agricultural experts through posts, communities, and messaging. The project consists of:
- **Backend**: Flask REST API with PostgreSQL database
- **Frontend**: React + Vite with TailwindCSS

## Development Commands

### Backend (Flask)

```bash
# Navigate to server directory
cd server

# Install dependencies (use virtual environment)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Database setup
flask db upgrade  # Apply migrations
python seed_roles.py  # Seed initial roles (user, admin)

# Run development server
python app.py
# Or with environment variables:
FLASK_DEBUG=true FLASK_PORT=5000 python app.py

# Database migrations
flask db migrate -m "migration message"  # Create new migration
flask db upgrade  # Apply migrations
flask db downgrade  # Rollback migration

# Run tests
python -m pytest  # When tests are added
python test_models.py  # Run model tests
```

### Frontend (React)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run development server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

### Backend Architecture

**Application Factory Pattern**: The Flask app uses the factory pattern (`create_app()`) in `server/app.py` for better testability and configuration management.

**Key Components**:
- `app.py`: Application factory, blueprint registration, error handlers, health check
- `extensions.py`: Shared Flask extension instances (db, migrate, cors, limiter)
- `config.py`: Configuration class reading from environment variables
- `models.py`: SQLAlchemy models with relationships and serialization methods
- `routes/`: Blueprints for different API domains (auth, users, posts, communities, messages)
- `rbac.py`: Decorators for authorization (`@login_required`, `@admin_required`)

**Authentication**: Session-based auth using Flask sessions. User is loaded into `g.current_user` via `@app.before_request` middleware in app.py. All authenticated routes should use decorators from `rbac.py`.

**Database Models**:
- Core entities: User, Role, Community, Post, Comment, Like, Follow, Message
- Many-to-many relationships: CommunityMembership, Follow, Like
- `User.set_role_by_name()` assigns roles by name (e.g., "user", "admin")
- `User.is_admin()` checks if user has admin role
- All models have `to_dict()` methods for JSON serialization

**RBAC System**:
- `roles` table is the source of truth
- `users.role_id` references `roles.id` (canonical)
- `users.role` string column kept for backward compatibility
- Default roles: "user" (id=1), "admin" (id=2)
- Future: "expert" role planned

**API Structure**:
- All routes under `/api/` prefix
- Blueprints: `/api/auth`, `/api/users`, `/api/posts`, `/api/communities`, `/api/messages`
- CORS configured for frontend origins via `FRONTEND_ORIGINS` env var
- Rate limiting enabled via Flask-Limiter (in-memory storage by default)
- See `server/dbschema/API_Documentation.md` for complete endpoint specifications

**Error Handling**: Structured JSON error responses with consistent format via global error handlers in app.py (400, 401, 403, 404, 500).

### Frontend Architecture

**Technology Stack**:
- React 19.2.0 with React Router DOM 7.13.0 for routing
- Vite 7.2.4 as build tool
- TailwindCSS 4.1.18 for styling
- Framer Motion for animations
- Lucide React for icons

**Directory Structure**:
- `src/pages/`: Page components (Home, Login, Register, Profile, PostDetails, Messages, Communities, etc.)
- `src/components/`: Reusable components (PostCard, ExpertCard, SideNav, BottomNav, ChatBubble, etc.)
- `src/components/ui/`: UI primitives (Button, Card, Avatar, Input)
- `src/data/`: Static data/mock data
- `src/App.jsx`: Main app component with routing

**State Management**: Currently no global state management (Redux Toolkit mentioned in roadmap but not yet implemented). Component-local state and props are used.

**Mobile-First Design**: The app is designed mobile-first with responsive layouts. Uses both SideNav (desktop) and BottomNav (mobile) navigation patterns.

## Environment Configuration

### Backend Environment Variables (.env)

Required variables (see `server/.env.example`):
```bash
DATABASE_URL=postgresql://localhost/agrilink
SECRET_KEY=your-super-secret-key-change-in-production
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=false
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Security Note**: Never commit `.env` files. Always use `.env.example` as template.

### Database Setup

PostgreSQL is required. Default connection: `postgresql://localhost/agrilink`

Create database:
```bash
createdb agrilink
# Or with custom user:
createdb -U postgres agrilink
```

See `server/dbschema/Database_schema.md` for complete schema documentation.

## Git Workflow

**Main Branch**: `main` (use for PRs)
**Current Branch**: `festus` (feature branch)

The project has dev and feature branches. Follow standard Git flow:
1. Create feature branches from main
2. Merge dev changes into feature branches as needed
3. Create PRs to main when ready

## Key Development Notes

### Backend

**Session-Based Auth**: The app uses Flask sessions (secure cookies) instead of JWT. The session stores `user_id` which is loaded into `g.current_user` on each request.

**RBAC Decorators**: Always use `@login_required` for authenticated endpoints and `@admin_required` for admin-only endpoints. Import from `rbac.py`.

**Model Serialization**: All models have `to_dict()` methods. Use these for JSON responses. Some accept parameters like `include_email=True` or `include_relations=True`.

**Database Changes**: Always create migrations for schema changes:
```bash
flask db migrate -m "description"
flask db upgrade
```

**Image Uploads**: Image upload endpoints planned but not fully implemented. Posts support `image_url` field but upload handling is minimal.

**Query Optimization**: Use eager loading (`.joinedload()`) for relationships to avoid N+1 queries, especially in list endpoints with pagination.

### Frontend

**Component Conventions**: Components use functional components with hooks. Framer Motion is used for page transitions and animations.

**Routing**: React Router v7 is used. Routes defined in `App.jsx`. Use `<Link>` for navigation.

**API Integration**: No centralized API client yet. Fetch calls are made directly in components. Backend runs on `http://localhost:5000` by default.

**Styling**: TailwindCSS utility classes. Custom components in `components/ui/` follow a consistent design system.

## Project Roadmap

The project follows a sprint-based development approach:
- **Sprint 0**: Project setup (completed)
- **Sprint 1**: Core auth & profiles (in progress)
- **Sprint 2**: Content consumption & engagement
- **Sprint 3**: Creation, communities & messaging

See `ROADMAP.md` for detailed sprint goals and deliverables.

## Testing Strategy

**Backend**: Minitests (Python unittest) planned. `test_models.py` exists for model tests.

**Frontend**: Jest mentioned in roadmap but not yet configured.

**Definition of Done**: Tests required for all new features (per roadmap).

## Common Pitfalls

1. **Role Assignment**: Use `User.set_role_by_name("user")` for new users, not direct assignment to avoid role_id/role desync.

2. **Authentication Check**: Always check `g.current_user` is not None before accessing user properties. Use decorators from `rbac.py`.

3. **CORS Issues**: Ensure `FRONTEND_ORIGINS` includes your frontend URL. In production, never use `*`.

4. **Database Sessions**: Flask-SQLAlchemy manages sessions automatically. Use `db.session.commit()` after changes, `db.session.rollback()` on errors.

5. **Migration Conflicts**: If migrations conflict, resolve by creating a merge migration or rebasing.

6. **Image URLs**: Currently images are referenced by URL. Actual upload/storage implementation is minimal and needs enhancement.

7. **Message Model**: Messages support both direct (user-to-user) and community messaging. One of `receiver_id` or `community_id` should be set, not both.
