## AgriLink Database Schema (PostgreSQL)

### Schema Overview

The AgriLink PostgreSQL schema is designed to support the MVP features of user registration, expert following, communities, posts with images, likes, comments, and messaging.  
The schema is normalized (3NF-oriented), with clear separation of concerns and explicit join tables for many-to-many relationships (e.g., community memberships, follows, conversation participants).

Core tables:

- `users`
- `communities`
- `community_memberships`
- `posts`
- `post_images`
- `likes`
- `comments`
- `follows`
- `conversations`
- `conversation_participants`
- `messages`

---

## users

### Purpose
Stores all user accounts, both farmers and experts, with basic profile metadata.

### Columns

| Column       | Type                 | Constraints                                              |
|-------------|----------------------|----------------------------------------------------------|
| id          | UUID                 | PK, `DEFAULT gen_random_uuid()`                         |
| email       | VARCHAR(255)         | NOT NULL, UNIQUE                                        |
| password_hash | VARCHAR(255)       | NOT NULL                                                |
| name        | VARCHAR(255)         | NOT NULL                                                |
| bio         | TEXT                 | NULLABLE                                                |
| location    | VARCHAR(255)         | NULLABLE                                                |
| role        | VARCHAR(50)          | NOT NULL, CHECK (`role` IN ('farmer','expert'))        |
| avatar_url  | TEXT                 | NULLABLE                                                |
| is_expert   | BOOLEAN              | NOT NULL DEFAULT FALSE                                  |
| created_at  | TIMESTAMPTZ          | NOT NULL DEFAULT NOW()                                  |
| updated_at  | TIMESTAMPTZ          | NOT NULL DEFAULT NOW()                                  |

### Primary Key
- `PRIMARY KEY (id)`

### Indexes & Constraints
- `UNIQUE (email)`
- Optional: `CREATE INDEX idx_users_is_expert ON users(is_expert);` (for expert listing)

### Relationships
- One `user` → many `posts`, `comments`, `likes`, `follows` (as follower), `follows` (as expert), `community_memberships`, `conversation_participants`, `messages`.

---

## communities

### Purpose
Represents agricultural communities (e.g., crops, regions, topics) that users can join.

### Columns

| Column      | Type        | Constraints                         |
|------------|-------------|-------------------------------------|
| id         | UUID        | PK, `DEFAULT gen_random_uuid()`    |
| name       | VARCHAR(255)| NOT NULL, UNIQUE                    |
| description| TEXT        | NULLABLE                            |
| is_private | BOOLEAN     | NOT NULL DEFAULT FALSE              |
| created_by | UUID        | NOT NULL FK → `users(id)`           |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW()              |

### Primary Key
- `PRIMARY KEY (id)`

### Foreign Keys
- `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT`

### Indexes & Constraints
- `UNIQUE (name)`
- Optional: `CREATE INDEX idx_communities_is_private ON communities(is_private);`

### Relationships
- One `community` → many `community_memberships`, `posts`, and `conversation_participants` (for community conversations).

---

## community_memberships

### Purpose
Join table tracking which users belong to which communities (many-to-many).

### Columns

| Column       | Type        | Constraints                          |
|-------------|-------------|--------------------------------------|
| user_id     | UUID        | NOT NULL FK → `users(id)`           |
| community_id| UUID        | NOT NULL FK → `communities(id)`     |
| joined_at   | TIMESTAMPTZ | NOT NULL DEFAULT NOW()               |
| role        | VARCHAR(50) | NULLABLE (e.g., 'member','admin')    |

### Primary Key
- `PRIMARY KEY (user_id, community_id)`

### Foreign Keys
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE`

### Indexes & Constraints
- Composite PK already covers uniqueness and lookup by `(user_id, community_id)`.
- Optional: index on `community_id` alone for membership queries.

### Relationships
- Many `users` ↔ many `communities` via `community_memberships`.

---

## posts

### Purpose
Stores all posts (blogs/content) authored by users, optionally associated with a community.

### Columns

| Column       | Type        | Constraints                                  |
|-------------|-------------|----------------------------------------------|
| id          | UUID        | PK, `DEFAULT gen_random_uuid()`             |
| author_id   | UUID        | NOT NULL FK → `users(id)`                   |
| community_id| UUID        | NULLABLE FK → `communities(id)`             |
| title       | VARCHAR(255)| NOT NULL                                     |
| content     | TEXT        | NOT NULL                                     |
| created_at  | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                       |
| updated_at  | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                       |

### Primary Key
- `PRIMARY KEY (id)`

### Foreign Keys
- `FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE`
- `FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL`

### Indexes & Constraints
- `CREATE INDEX idx_posts_author_id ON posts(author_id);`
- `CREATE INDEX idx_posts_community_id_created_at ON posts(community_id, created_at DESC);`
- `CREATE INDEX idx_posts_created_at ON posts(created_at DESC);` (for global feed)

### Relationships
- One `user` → many `posts`.
- One `community` → many `posts`.
- One `post` → many `post_images`, `likes`, `comments`.

---

## post_images

### Purpose
Stores image metadata for posts, allowing 0..N images per post while keeping `posts` lightweight.

### Columns

| Column      | Type        | Constraints                          |
|------------|-------------|--------------------------------------|
| id         | UUID        | PK, `DEFAULT gen_random_uuid()`     |
| post_id    | UUID        | NOT NULL FK → `posts(id)`           |
| url        | TEXT        | NOT NULL                             |
| position   | INT         | NOT NULL DEFAULT 0                   |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW()               |

### Primary Key
- `PRIMARY KEY (id)`

### Foreign Keys
- `FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE`

### Indexes & Constraints
- `CREATE INDEX idx_post_images_post_id_position ON post_images(post_id, position);`

### Relationships
- One `post` → many `post_images`.

---

## likes

### Purpose
Tracks which users have liked which posts (many-to-many: users ↔ posts).

### Columns

| Column      | Type        | Constraints                          |
|------------|-------------|--------------------------------------|
| user_id    | UUID        | NOT NULL FK → `users(id)`           |
| post_id    | UUID        | NOT NULL FK → `posts(id)`           |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW()               |

### Primary Key
- `PRIMARY KEY (user_id, post_id)` (each user can like a post at most once)

### Foreign Keys
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE`

### Indexes & Constraints
- Composite PK serves uniqueness.
- `CREATE INDEX idx_likes_post_id ON likes(post_id);` (for like count queries)

### Relationships
- Many `users` ↔ many `posts` via `likes`.

---

## comments

### Purpose
Stores comments that users leave on posts.

### Columns

| Column      | Type        | Constraints                          |
|------------|-------------|--------------------------------------|
| id         | UUID        | PK, `DEFAULT gen_random_uuid()`     |
| post_id    | UUID        | NOT NULL FK → `posts(id)`           |
| author_id  | UUID        | NOT NULL FK → `users(id)`           |
| content    | TEXT        | NOT NULL                             |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW()               |

### Primary Key
- `PRIMARY KEY (id)`

### Foreign Keys
- `FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE`
- `FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE`

### Indexes & Constraints
- `CREATE INDEX idx_comments_post_id_created_at ON comments(post_id, created_at ASC);`

### Relationships
- One `post` → many `comments`.
- One `user` → many `comments`.

---

## follows

### Purpose
Represents follower → expert relationships (users following expert users).

### Columns

| Column       | Type        | Constraints                          |
|-------------|-------------|--------------------------------------|
| follower_id | UUID        | NOT NULL FK → `users(id)`           |
| expert_id   | UUID        | NOT NULL FK → `users(id)`           |
| created_at  | TIMESTAMPTZ | NOT NULL DEFAULT NOW()               |

### Primary Key
- `PRIMARY KEY (follower_id, expert_id)`

### Foreign Keys
- `FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE`
- `FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE`

### Indexes & Constraints
- CHECK to prevent self-follow: `CHECK (follower_id <> expert_id)`
- Optional: CHECK ensuring `expert_id` user has `is_expert = TRUE` via application logic or trigger.
- `CREATE INDEX idx_follows_expert_id ON follows(expert_id);` (for followers of expert)

### Relationships
- Many `users` (followers) ↔ many `users` (experts) via `follows`.

---

## conversations

### Purpose
Logical grouping for messaging, representing either user-to-user threads or community channels.

### Columns

| Column      | Type        | Constraints                                            |
|------------|-------------|--------------------------------------------------------|
| id         | UUID        | PK, `DEFAULT gen_random_uuid()`                       |
| type       | VARCHAR(20) | NOT NULL, CHECK (`type` IN ('user','community'))      |
| community_id | UUID      | NULLABLE FK → `communities(id)` (for `type='community'`) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                                 |

### Primary Key
- `PRIMARY KEY (id)`

### Foreign Keys
- `FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE`

### Indexes & Constraints
- For `type='community'`, enforce `community_id IS NOT NULL` via CHECK or app logic.
- `CREATE INDEX idx_conversations_type ON conversations(type);`

### Relationships
- One `conversation` → many `conversation_participants` and `messages`.
- For community-type conversations, related `community` is referenced.

---

## conversation_participants

### Purpose
Join table connecting users to conversations, enabling both user-to-user and community conversations.

### Columns

| Column          | Type        | Constraints                          |
|----------------|-------------|--------------------------------------|
| conversation_id| UUID        | NOT NULL FK → `conversations(id)`   |
| user_id        | UUID        | NOT NULL FK → `users(id)`           |
| joined_at      | TIMESTAMPTZ | NOT NULL DEFAULT NOW()               |

### Primary Key
- `PRIMARY KEY (conversation_id, user_id)`

### Foreign Keys
- `FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

### Indexes & Constraints
- Composite PK enforces uniqueness.
- `CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);`

### Relationships
- Many `users` ↔ many `conversations` via `conversation_participants`.
- Permissions in messaging are enforced via membership in this table.

---

## messages

### Purpose
Stores individual messages exchanged in conversations (user-to-user or community channels).

### Columns

| Column          | Type        | Constraints                                   |
|----------------|-------------|-----------------------------------------------|
| id             | UUID        | PK, `DEFAULT gen_random_uuid()`              |
| conversation_id| UUID        | NOT NULL FK → `conversations(id)`            |
| sender_id      | UUID        | NOT NULL FK → `users(id)`                    |
| content        | TEXT        | NOT NULL                                      |
| created_at     | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                        |
| is_read        | BOOLEAN     | NOT NULL DEFAULT FALSE                        |

### Primary Key
- `PRIMARY KEY (id)`

### Foreign Keys
- `FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE`
- `FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE`

### Indexes & Constraints
- `CREATE INDEX idx_messages_conversation_created_at ON messages(conversation_id, created_at ASC);`
- Optional: CHECK or application logic ensures `sender_id` is a participant in the conversation.

### Relationships
- One `conversation` → many `messages`.
- One `user` → many sent `messages`.

---

## Key Relationships Summary

- **Users & Profiles**
  - `users` is the root entity for all user-related data.
- **Experts & Following**
  - Many-to-many between `users` (followers) and `users` (experts) via `follows`.
- **Communities**
  - Many-to-many between `users` and `communities` via `community_memberships`.
  - `posts` optionally belong to a `community`.
- **Posts & Images**
  - One-to-many from `posts` to `post_images`.
- **Likes & Comments**
  - Many-to-many between `users` and `posts` via `likes`.
  - One-to-many from `posts` to `comments`; each comment authored by a `user`.
- **Messaging**
  - `conversations` represent message threads (user or community).
  - Many-to-many between `users` and `conversations` via `conversation_participants`.
  - One-to-many from `conversations` to `messages`; each message authored by a `user`.

---

## Indexing & Constraints Notes

- Use UUIDs for primary keys to avoid coupling with sequence values and simplify client-generated IDs if needed.
- Time-ordered feeds (posts, comments, messages) rely on compound indexes `(foreign_id, created_at)` to support efficient pagination.
- Many-to-many tables (`community_memberships`, `likes`, `follows`, `conversation_participants`) use composite primary keys to:
  - Enforce uniqueness
  - Speed up existence checks (e.g., “already liked?”, “already member?”)
- Critical business rules enforced by constraints:
  - `follows`: prevent self-follow via `CHECK (follower_id <> expert_id)`.
  - Role and type columns limited via `CHECK` constraints to valid enum-like sets.
- Additional integrity rules (e.g., ensuring experts are `is_expert = TRUE`, ensuring `sender_id` is a participant in a conversation) should be enforced via application logic and/or triggers depending on team preference for the MVP.
