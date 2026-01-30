# AgriLink Database Schema

## Overview

This document describes the PostgreSQL schema for the AgriLink backend (MVP).
The schema is designed to support user registration, expert following, communities, posts with images, likes, comments, and direct messaging.

**Key Notes:**
- INTEGER primary keys are the source of truth (UUID migration planned for future)
- Roles are managed via the `roles` table with `users.role_id` as the canonical RBAC model
- Legacy `users.role` string column is kept temporarily for backward compatibility
- Messaging is direct-message based (no conversations table for MVP)

---

## Core Tables

### users

Stores all user accounts (farmers and experts).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| username | VARCHAR(80) | NOT NULL, UNIQUE | Display name |
| email | VARCHAR(120) | NOT NULL, UNIQUE | User email |
| password_hash | VARCHAR(255) | NOT NULL | Werkzeug hash |
| role | VARCHAR(20) | NOT NULL | Legacy: farmer \| expert \| admin |
| role_id | INTEGER | FK → roles.id | Canonical RBAC reference |
| bio | TEXT | NULLABLE | User biography |
| location | VARCHAR(100) | NULLABLE | Geographic location |
| profile_image_url | VARCHAR(255) | NULLABLE | Avatar URL |
| created_at | DATETIME | DEFAULT now() | Creation timestamp |
| updated_at | DATETIME | ON UPDATE | Last update timestamp |

**Relationships:**
- One `role` → many `users` (via role_id)
- One `user` → many `posts`, `comments`, `likes`, `follows` (as follower), `community_memberships`, `messages` (as sender/receiver)

### roles

Defines system roles for RBAC.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Role name (user, admin) |

**Note:** The `expert` role is planned for future use. Currently, all non-admin users are assigned the `user` role.

### communities

Represents agricultural communities users can join.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| name | VARCHAR(120) | NOT NULL, UNIQUE | Community name |
| description | TEXT | NULLABLE | Community description |
| image_url | VARCHAR(255) | NULLABLE | Community image |
| created_by | INTEGER | FK → users.id | Creator user ID |
| created_at | DATETIME | DEFAULT now() | Creation timestamp |

### community_memberships

Join table for user-community membership (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| user_id | INTEGER | FK → users.id, NOT NULL | Member user ID |
| community_id | INTEGER | FK → communities.id, NOT NULL | Community ID |
| created_at | DATETIME | DEFAULT now() | Join timestamp |

**Primary Key:** Composite (user_id, community_id) could be used but single pk is fine for MVP.

### posts

Stores posts authored by users, optionally within a community.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| author_id | INTEGER | FK → users.id, NOT NULL | Author user ID |
| community_id | INTEGER | FK → communities.id, NULLABLE | Optional community reference |
| title | VARCHAR(255) | NULLABLE | Post title |
| content | TEXT | NOT NULL | Post content |
| created_at | DATETIME | DEFAULT now() | Creation timestamp |
| updated_at | DATETIME | ON UPDATE | Last update timestamp |

### post_images

Stores images attached to posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| post_id | INTEGER | FK → posts.id, NOT NULL | Parent post |
| image_url | VARCHAR(255) | NOT NULL | Image URL |
| created_at | DATETIME | DEFAULT now() | Creation timestamp |

### likes

Tracks user likes on posts (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| user_id | INTEGER | FK → users.id, NOT NULL | Liking user |
| post_id | INTEGER | FK → posts.id, NOT NULL | Liked post |
| created_at | DATETIME | DEFAULT now() | Like timestamp |

**Constraint:** Unique (user_id, post_id) - each user can like a post only once.

### comments

Stores comments on posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| user_id | INTEGER | FK → users.id, NOT NULL | Comment author |
| post_id | INTEGER | FK → posts.id, NOT NULL | Parent post |
| content | TEXT | NOT NULL | Comment text |
| created_at | DATETIME | DEFAULT now() | Creation timestamp |

### follows

Represents follower → expert/user relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| follower_id | INTEGER | FK → users.id, NOT NULL | Following user |
| followed_id | INTEGER | FK → users.id, NOT NULL | Followed user |
| created_at | DATETIME | DEFAULT now() | Follow timestamp |

**Constraint:** Unique (follower_id, followed_id) - prevent duplicate follows.

### messages

Stores direct messages between users or in community channels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Primary key |
| sender_id | INTEGER | FK → users.id, NOT NULL | Message sender |
| receiver_id | INTEGER | FK → users.id, NULLABLE | Direct recipient (user-to-user) |
| community_id | INTEGER | FK → communities.id, NULLABLE | Community channel |
| content | TEXT | NOT NULL | Message content |
| created_at | DATETIME | DEFAULT now() | Creation timestamp |

**Notes:**
- For direct messages: receiver_id is set, community_id is NULL
- For community messages: community_id is set, receiver_id is NULL
- No conversations table for MVP - direct message based

---

## Role-Based Access Control (RBAC)

### Architecture
- `roles` table is the source of truth for role definitions
- `users.role_id` is the canonical reference for role assignment
- `users.role` (string) is kept for backward compatibility with legacy code
- The `is_admin()` method checks `role_obj.name == "admin"` first, falls back to legacy string

### Default Roles
| ID | Name | Description |
|----|------|-------------|
| 1 | user | Default role for all new users |
| 2 | admin | Administrator with elevated privileges |

### Role Assignment
New users are assigned the 'user' role via `User.set_role_by_name("user")`.

---

## Indexes

Key indexes for performance:
- `idx_users_email` on users(email)
- `idx_users_role_id` on users(role_id)
- `idx_posts_author_id` on posts(author_id)
- `idx_posts_community_id` on posts(community_id)
- `idx_posts_created_at` on posts(created_at DESC)
- `idx_messages_sender_id` on messages(sender_id)
- `idx_messages_receiver_id` on messages(receiver_id)
- `idx_messages_community_id` on messages(community_id)
- `idx_community_memberships_user_id` on community_memberships(user_id)
- `idx_community_memberships_community_id` on community_memberships(community_id)

---

## Future Migrations (Planned)

1. **UUID Primary Keys**: Replace INTEGER PKs with UUIDs for better security and distribution
2. **Expert Role**: Add 'expert' role to roles table and filter users by it
3. **Conversations Table**: For richer messaging (read receipts, typing indicators, etc.)
4. **PostgreSQL Full-Text Search**: Add tsvector columns for search functionality

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (admin, paginated)
- `GET /api/users/experts` - List experts (paginated)
- `GET /api/users/inbox` - Get user inbox (paginated)
- `GET /api/users/<id>` - Get user by ID
- `PATCH /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user (admin)
- `POST /api/users/<id>/follow` - Follow user
- `DELETE /api/users/<id>/follow` - Unfollow user
- `GET /api/users/<id>/followers` - Get followers
- `GET /api/users/<id>/following` - Get following

### Posts
- `GET /api/posts` - List posts (paginated)
- `POST /api/posts` - Create post
- `GET /api/posts/<id>` - Get post
- `PATCH /api/posts/<id>` - Update post
- `DELETE /api/posts/<id>` - Delete post
- `POST /api/posts/<id>/images` - Add image to post
- `POST /api/posts/<id>/comments` - Add comment
- `DELETE /api/posts/comments/<id>` - Delete comment
- `POST /api/posts/<id>/like` - Like post
- `DELETE /api/posts/<id>/like` - Unlike post

### Communities
- `GET /api/communities` - List communities (paginated)
- `POST /api/communities` - Create community
- `POST /api/communities/<id>/join` - Join community
- `DELETE /api/communities/<id>/leave` - Leave community
- `GET /api/communities/<id>/members` - List members (paginated)
- `GET /api/communities/<id>/posts` - List community posts (paginated)
- `DELETE /api/communities/<id>` - Delete community (admin)

### Messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/<id>` - Delete message
- `GET /api/messages/user/<id>` - Get conversation with user (paginated)
- `GET /api/messages/community/<id>` - Get community messages (paginated)

