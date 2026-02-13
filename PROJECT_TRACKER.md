# AGRILINK PROJECT TRACKER

| Entry | Date | Morning Log | Evening Log |
|-------|------|-------------|-------------|
| 1 | Monday 27/01/2026 | 1. Got the general idea of the AgriLink application — a mobile-first agricultural super app connecting farmers with experts. 2. Discussed core features: posts, communities, messaging, expert profiles. 3. Introduced group members and assigned initial roles. 4. Created the project repository and added ROADMAP.md outlining sprint goals. | 1. Initial commit pushed with project scaffold (Flask backend + React frontend). 2. Database models created (User, Role, Post, Comment, Like, Community, CommunityMembership, Follow, Message). 3. Flask application factory pattern set up with extensions (db, migrate, cors, limiter). 4. Initial configuration file added for server. 5. Database schema documentation drafted. |
| 2 | Tuesday 28/01/2026 | 1. Started building API routes for all domains. 2. Set up Alembic migrations for database schema management. 3. Began implementing session-based authentication (register, login, logout). 4. Frontend initial commit — React + Vite + TailwindCSS scaffold. | 1. Auth routes completed — registration, login, logout, session handling with `g.current_user`. 2. RBAC system implemented — `@login_required` and `@admin_required` decorators. 3. User management endpoints added (list, get, update, delete, follow/unfollow). 4. Posts routes completed (CRUD, like/unlike, comments). 5. Community management endpoints added (create, join, leave, members, posts). 6. Message sending and retrieval endpoints added. 7. `to_dict()` serialization methods added to all models. |
| 3 | Wednesday 29/01/2026 | 1. Code review of all backend routes and models. 2. Tested API endpoints manually with Postman. 3. Discussed frontend page structure and routing plan. | 1. Backend API stabilized — all core CRUD routes functional. 2. Identified need for pagination across list endpoints. 3. Frontend routing planned for Home, Login, Register, Profile, Communities, Messages pages. |
| 4 | Thursday 30/01/2026 | 1. Continued frontend page development — Login and Register pages. 2. Set up React Router v7 for client-side routing. 3. Designed mobile-first navigation components (SideNav for desktop, BottomNav for mobile). | 1. Login and Register pages implemented with form validation. 2. Navigation components (SideNav, BottomNav) built with responsive breakpoints. 3. UI component library started (Button, Card, Avatar, Input). 4. Framer Motion added for page transitions and animations. |
| 5 | Friday 31/01/2026 | 1. Built out Home page with post feed layout. 2. Created PostCard, ExpertCard, and CommunityCard reusable components. 3. Designed Profile page with user stats display. | 1. Home page feed layout completed with PostCard components. 2. Profile page implemented with edit functionality. 3. Communities page designed with two-tab interface (Experts + Communities). 4. All pages responsive and mobile-first. Code to be reviewed over the weekend. |
| 6 | Monday 03/02/2026 | 1. Reviewed weekend code and resolved several bugs. 2. Connected frontend to real API endpoints — replaced mock data. 3. Started integrating authentication flow with backend sessions. | 1. Fixed multiple frontend bugs related to state management and API responses. 2. Real API endpoints connected for auth (login, register, logout). 3. ProtectedRoute component created to guard authenticated pages. 4. API base URL configuration set up for development environment. |
| 7 | Tuesday 04/02/2026 | 1. Continued Home page updates — integrated post feed with backend API. 2. Implemented pagination for post listings. 3. Backend changes to support better query filtering and eager loading. | 1. Home page now fetches posts from backend API with pagination. 2. News aggregation from NewsAPI integrated — agricultural news displayed alongside user posts. 3. Backend query optimization with `joinedload()` to avoid N+1 queries. 4. Work in progress — more integration needed. |
| 8 | Wednesday 05/02/2026 | 1. Merged remote tracking branches and resolved conflicts. 2. Code review of feature branches. 3. Continued frontend-backend integration for remaining pages. | 1. Merge conflicts resolved between dev and feature branches. 2. Pull request reviewed and merged into dev. 3. Communities page connected to backend API. 4. Follow/unfollow functionality wired to API endpoints. |
| 9 | Thursday 06/02/2026 | 1. Added background images and UI polish. 2. Fixed several frontend bugs. 3. Created API test suite for backend validation. 4. Implemented Password Reset flow (backend). | 1. Background images and visual improvements applied to auth pages. 2. API test suite created — testing auth, posts, communities, and messages endpoints. 3. Password Reset flow completed — request token, verify token, reset password endpoints. 4. Server config module updated. 5. Content sanitization with bleach added to prevent XSS in posts/comments. 6. Rate limiting applied to sensitive endpoints (login: 5/min, register: 3/min). |
| 10 | Friday 07/02/2026 | 1. Bug fixes and cleanup from previous day's work. 2. Reviewed password reset implementation. 3. Planned email verification system. | 1. Password reset flow tested and verified. 2. Frontend pages for ForgotPassword and ResetPassword implemented. 3. Prepared email verification token model (PasswordResetToken) with 1-hour expiry. 4. Input validation strengthened — password complexity requirements (12+ chars). |
| 11 | Saturday 08/02/2026 | 1. Implemented Email Verification system — backend tokens with expiry. 2. Set up CI/CD pipeline with GitHub Actions. 3. Fixed remaining bugs in messaging system. | 1. Email verification endpoints completed — verify-email, resend-verification with rate limiting (5/hour). 2. VerifyEmail frontend page implemented. 3. CI/CD workflow configured — linting, testing stages for both backend and frontend. 4. GitHub Actions workflow file added to repository. 5. Several messaging bugs fixed. |
| 12 | Sunday 09/02/2026 | 1. Added `requests` to requirements.txt for config and post routes (NewsAPI). 2. Full Backend-Frontend Integration push — connecting all remaining pages to API. 3. Resolved frontend CI workflow issues. | 1. Backend-Frontend integration completed for core flows. 2. Community page redesigned and connected to API — join/leave, member lists, community posts. 3. More mock/seed data added for testing and demo purposes. 4. Frontend lint errors resolved for CI pipeline. 5. CI workflow passing for both backend and frontend. 6. Pull requests merged to dev branch. |
| 13 | Monday 10/02/2026 | 1. Reviewed all integrated features end-to-end. 2. Manual regression testing — auth flow, post creation, social features, messaging. 3. Identified remaining API integration gaps. | 1. End-to-end testing completed for core user flows. 2. Documented remaining issues and feature gaps. 3. Planned image upload implementation with Cloudinary. 4. Reviewed Cloudinary API docs and integration approach. |
| 14 | Tuesday 11/02/2026 | 1. API integration work — connecting remaining frontend components to backend. 2. Implemented image upload endpoints with Cloudinary. 3. Added CreatePost page with image upload support. | 1. API integration push completed — all major pages connected. 2. Image upload route (`/api/uploads/images`) created with Cloudinary integration. 3. File validation implemented — size limits, format checks (JPEG/PNG/GIF/WebP). 4. CreatePost page allows image attachment to posts. 5. Upload rate limiting added (10/min). |
| 15 | Wednesday 12/02/2026 | 1. Fixed merge conflicts from multiple feature branches. 2. Merged origin/main into working branches. 3. Updated CI workflow configuration. | 1. All merge conflicts resolved cleanly. 2. CI workflow updated and passing. 3. Codebase unified on main branch. 4. Prepared for deployment configuration. |
| 16 | Thursday 13/02/2026 | 1. Fixed remaining lint errors in frontend and backend. 2. Configured deployment — Render (backend) + Vercel (frontend). 3. Added `render.yaml` with build and start commands. | 1. All lint errors resolved — CI pipeline green. 2. Render deployment configured — gunicorn with 2 workers, PostgreSQL database. 3. Vercel deployment configured for React frontend. 4. Environment variables set for production (DATABASE_URL, SECRET_KEY, FRONTEND_ORIGINS). 5. Application ready for production deployment. |

---

## Sprint Progress Summary

### Sprint 0: Planning & Setup — COMPLETED
- Project scaffold (Flask + React + PostgreSQL)
- ROADMAP and documentation
- Team process and Git workflow established
- CI/CD pipeline configured

### Sprint 1: Core Auth & Profiles — COMPLETED
- User registration with email verification
- Session-based login/logout
- Password reset flow
- User profile CRUD (view, update, delete)
- RBAC system (login_required, admin_required)
- Profile image support

### Sprint 2: Content Consumption & Engagement — COMPLETED
- Post feed with pagination
- Like/unlike system
- Comments on posts
- Follow/unfollow users
- News aggregation (NewsAPI)
- Post detail view
- Expert listing

### Sprint 3: Creation, Communities & Messaging — IN PROGRESS
- Post creation with image upload — DONE
- Image upload to Cloudinary — DONE
- Communities CRUD — DONE
- Join/leave communities — DONE
- Direct messaging (user-to-user) — DONE
- Community channel messaging — DONE
- Conversation list — DONE
- Chat interface — DONE
- Read status tracking — PENDING
- Typing indicators — PENDING
- Rich media in messages — PENDING
- Comprehensive test coverage (Jest + unittest) — PENDING

---

## Challenges & Resolutions

| Challenge | Resolution |
|-----------|------------|
| PostgreSQL connection issues during setup | Resolved database config and connection string |
| Merge conflicts between feature branches | Careful rebasing and conflict resolution |
| N+1 query performance in list endpoints | Added `joinedload()` eager loading |
| CORS issues between frontend and backend | Configured `FRONTEND_ORIGINS` environment variable |
| CI pipeline lint failures | Fixed all ESLint and Python lint errors |
| Session auth across cross-origin requests | Configured secure cookie settings and CORS credentials |
| Email delivery for verification/reset | Token system implemented; production mail service pending |

---

## Team Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production-ready code | Active |
| `dev` | Integration branch | Active |
| `festus` | Feature development | Active |
| `nganga` | Feature development | Active |

---

## Deployment

| Service | Platform | Status |
|---------|----------|--------|
| Backend API | Render (gunicorn) | Configured |
| Frontend App | Vercel | Configured |
| Database | PostgreSQL (Render) | Configured |
| Image Storage | Cloudinary | Integrated |
| CI/CD | GitHub Actions | Active |
