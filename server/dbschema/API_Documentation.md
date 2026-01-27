## AgriLink Backend API Documentation

### API Overview

The AgriLink REST API powers the Agricultural Super App, enabling farmers and experts to:

- Register, authenticate, and manage profiles  
- Publish and consume agricultural posts  
- Like and comment on content  
- Follow agricultural experts  
- Join communities and participate in community content  
- Exchange direct messages (user-to-user and community channels)

- **Base URL (example)**: `https://api.agrilink.example.com/api/v1`  
- **Authentication**: JWT (JSON Web Token) via `Authorization: Bearer <token>` header  
- **Content Type**: `application/json` unless otherwise specified  
- **Error Format** (typical):

```json
{
  "error": "Bad Request",
  "message": "Validation failed for field 'email'.",
  "code": "VALIDATION_ERROR"
}
```

---

## Authentication

### POST `/auth/register`

- **Description**: Register a new user.
- **Auth Required**: No

#### Request Body (JSON)

```json
{
  "name": "Jane Farmer",
  "email": "jane@example.com",
  "password": "StrongPassword123",
  "role": "farmer"
}
```

- `role`: `"farmer"` or `"expert"`.

#### Success Response (201 Created)

```json
{
  "user": {
    "id": "u_123",
    "name": "Jane Farmer",
    "email": "jane@example.com",
    "role": "farmer",
    "created_at": "2026-01-27T10:00:00Z"
  },
  "token": "<jwt-access-token>"
}
```

#### Common Errors

- `400 Bad Request` – Validation error (missing fields, weak password, invalid role).
- `409 Conflict` – Email already registered.

---

### POST `/auth/login`

- **Description**: Log in and receive a JWT.
- **Auth Required**: No

#### Request Body (JSON)

```json
{
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```

#### Success Response (200 OK)

```json
{
  "user": {
    "id": "u_123",
    "name": "Jane Farmer",
    "email": "jane@example.com",
    "role": "farmer"
  },
  "token": "<jwt-access-token>"
}
```

#### Common Errors

- `400 Bad Request` – Invalid payload.
- `401 Unauthorized` – Invalid credentials.

---

### POST `/auth/logout`

- **Description**: Log out the current session (e.g., token blacklist if implemented).
- **Auth Required**: Yes

#### Headers

- `Authorization: Bearer <token>`

#### Success Response (204 No Content)

No body.

#### Common Errors

- `401 Unauthorized` – Missing or invalid token.

---

### GET `/auth/me`

- **Description**: Get the currently authenticated user’s profile summary.
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "id": "u_123",
  "name": "Jane Farmer",
  "email": "jane@example.com",
  "role": "farmer"
}
```

#### Common Errors

- `401 Unauthorized` – Missing or invalid token.

---

## Users & Profiles

### GET `/users/{user_id}`

- **Description**: Get public profile information for a user.
- **Auth Required**: Optional (can be public depending on configuration).

#### Path Params

- `user_id` – ID of the user.

#### Success Response (200 OK)

```json
{
  "id": "u_123",
  "name": "Jane Farmer",
  "bio": "Smallholder maize farmer in Kenya.",
  "location": "Nakuru, Kenya",
  "role": "farmer",
  "avatar_url": "https://cdn.agrilink.example.com/avatars/u_123.png",
  "is_expert": false
}
```

#### Common Errors

- `404 Not Found` – User not found.

---

### GET `/profile`

- **Description**: Get the authenticated user’s profile (private fields allowed).
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "id": "u_123",
  "name": "Jane Farmer",
  "email": "jane@example.com",
  "bio": "Smallholder maize farmer in Kenya.",
  "location": "Nakuru, Kenya",
  "role": "farmer",
  "avatar_url": "https://cdn.agrilink.example.com/avatars/u_123.png"
}
```

---

### PUT `/profile`

- **Description**: Update the authenticated user’s profile.
- **Auth Required**: Yes  
- **Authorization**: User can update only their own profile.

#### Request Body (JSON)

```json
{
  "name": "Jane F.",
  "bio": "Focusing on sustainable maize farming.",
  "location": "Nakuru, Kenya",
  "avatar_url": "https://cdn.agrilink.example.com/avatars/u_123.png"
}
```

#### Success Response (200 OK)

```json
{
  "id": "u_123",
  "name": "Jane F.",
  "bio": "Focusing on sustainable maize farming.",
  "location": "Nakuru, Kenya",
  "role": "farmer",
  "avatar_url": "https://cdn.agrilink.example.com/avatars/u_123.png"
}
```

#### Common Errors

- `400 Bad Request` – Validation error.
- `401 Unauthorized` – Missing/invalid token.

---

## Experts & Following

### GET `/experts`

- **Description**: List expert users, optionally searchable/filterable.
- **Auth Required**: Optional

#### Query Params (optional)

- `q` – Search term (e.g., “maize”, “soil”).
- `page`, `page_size` – Pagination.

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "u_200",
      "name": "Dr. Agro Expert",
      "bio": "Soil fertility specialist.",
      "location": "Nairobi, Kenya",
      "is_expert": true,
      "followers_count": 120
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 1
}
```

---

### POST `/experts/{expert_id}/follow`

- **Description**: Follow an expert.
- **Auth Required**: Yes  
- **Authorization**: Only non-experts and experts can follow; user cannot follow themselves.

#### Path Params

- `expert_id` – ID of the expert user.

#### Success Response (200 OK)

```json
{
  "expert_id": "u_200",
  "following": true
}
```

#### Common Errors

- `400 Bad Request` – Attempt to follow self or non-expert.
- `401 Unauthorized` – Missing/invalid token.
- `404 Not Found` – Expert not found.

---

### DELETE `/experts/{expert_id}/follow`

- **Description**: Unfollow an expert.
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "expert_id": "u_200",
  "following": false
}
```

---

### GET `/me/following`

- **Description**: List experts followed by the current user.
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "u_200",
      "name": "Dr. Agro Expert",
      "is_expert": true
    }
  ]
}
```

---

## Communities & Memberships

### GET `/communities`

- **Description**: List available communities.
- **Auth Required**: Optional

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "c_10",
      "name": "Maize Growers",
      "description": "Questions and tips about maize.",
      "members_count": 250,
      "is_member": true
    }
  ]
}
```

---

### POST `/communities/{community_id}/join`

- **Description**: Join a community.
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "community_id": "c_10",
  "is_member": true
}
```

#### Common Errors

- `400 Bad Request` – Already a member.
- `401 Unauthorized` – Missing/invalid token.
- `404 Not Found` – Community not found.

---

### POST `/communities/{community_id}/leave`

- **Description**: Leave a community.
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "community_id": "c_10",
  "is_member": false
}
```

---

### GET `/communities/{community_id}`

- **Description**: Get community details.
- **Auth Required**: Optional

#### Success Response (200 OK)

```json
{
  "id": "c_10",
  "name": "Maize Growers",
  "description": "Questions and tips about maize.",
  "members_count": 250,
  "is_member": true
}
```

---

### GET `/communities/{community_id}/posts`

- **Description**: Get posts in a specific community.
- **Auth Required**: Optional for viewing, Yes for member-only communities (config-dependent).  
- **Authorization**: If community is private, only members can view.

#### Query Params

- `page`, `page_size`

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "p_501",
      "author_id": "u_123",
      "community_id": "c_10",
      "title": "Maize planting tips",
      "content": "Plant at the onset of rains...",
      "image_url": null,
      "likes_count": 5,
      "comments_count": 3,
      "created_at": "2026-01-26T08:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 1
}
```

---

## Posts & Images

### GET `/posts`

- **Description**: Global feed of posts/blogs.
- **Auth Required**: Optional

#### Query Params

- `page`, `page_size`
- `community_id` (optional)
- `author_id` (optional)

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "p_500",
      "author_id": "u_123",
      "community_id": null,
      "title": "Soil testing 101",
      "content": "Always test soil before planting...",
      "image_url": "https://cdn.agrilink.example.com/posts/p_500.jpg",
      "likes_count": 10,
      "comments_count": 4,
      "created_at": "2026-01-25T08:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 1
}
```

---

### GET `/posts/{post_id}`

- **Description**: Retrieve a single post with aggregated counts.
- **Auth Required**: Optional

#### Success Response (200 OK)

```json
{
  "id": "p_500",
  "author_id": "u_123",
  "community_id": null,
  "title": "Soil testing 101",
  "content": "Always test soil before planting...",
  "image_url": "https://cdn.agrilink.example.com/posts/p_500.jpg",
  "likes_count": 10,
  "comments_count": 4,
  "created_at": "2026-01-25T08:00:00Z"
}
```

---

### POST `/posts`

- **Description**: Create a new post (optionally with image).
- **Auth Required**: Yes  
- **Authorization**: Authenticated users only.

> **Note**: For simplicity, this example assumes an `image_url` generated by a separate upload step or a multi-part handler on this endpoint.

#### Request Body (JSON)

```json
{
  "title": "Maize planting tips",
  "content": "Plant at the onset of rains...",
  "community_id": "c_10",
  "image_url": "https://cdn.agrilink.example.com/posts/p_501.jpg"
}
```

#### Success Response (201 Created)

```json
{
  "id": "p_501",
  "author_id": "u_123",
  "community_id": "c_10",
  "title": "Maize planting tips",
  "content": "Plant at the onset of rains...",
  "image_url": "https://cdn.agrilink.example.com/posts/p_501.jpg",
  "likes_count": 0,
  "comments_count": 0,
  "created_at": "2026-01-26T08:00:00Z"
}
```

#### Common Errors

- `400 Bad Request` – Missing title/content or invalid community.
- `401 Unauthorized` – Missing/invalid token.

---

### POST `/uploads/images`

- **Description**: Upload an image for use in posts.
- **Auth Required**: Yes  
- **Content Type**: `multipart/form-data`

#### Request (multipart/form-data)

- `file`: image file (JPEG/PNG, within size limits).

#### Success Response (201 Created)

```json
{
  "url": "https://cdn.agrilink.example.com/posts/p_501.jpg"
}
```

#### Common Errors

- `400 Bad Request` – Invalid file type/size.
- `401 Unauthorized` – Missing/invalid token.

---

## Likes & Comments

### POST `/posts/{post_id}/like`

- **Description**: Like a post.
- **Auth Required**: Yes  
- **Authorization**: User can like each post at most once.

#### Success Response (200 OK)

```json
{
  "post_id": "p_500",
  "liked": true,
  "likes_count": 11
}
```

#### Common Errors

- `400 Bad Request` – User already liked the post (if not idempotent).
- `401 Unauthorized` – Missing/invalid token.
- `404 Not Found` – Post not found.

---

### DELETE `/posts/{post_id}/like`

- **Description**: Remove like from a post.
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "post_id": "p_500",
  "liked": false,
  "likes_count": 10
}
```

---

### GET `/posts/{post_id}/comments`

- **Description**: List comments on a post.
- **Auth Required**: Optional

#### Query Params

- `page`, `page_size`

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "cm_100",
      "post_id": "p_500",
      "author_id": "u_123",
      "content": "Very useful advice!",
      "created_at": "2026-01-25T09:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 1
}
```

---

### POST `/posts/{post_id}/comments`

- **Description**: Add a comment to a post.
- **Auth Required**: Yes

#### Request Body (JSON)

```json
{
  "content": "Very useful advice!"
}
```

#### Success Response (201 Created)

```json
{
  "id": "cm_101",
  "post_id": "p_500",
  "author_id": "u_123",
  "content": "Very useful advice!",
  "created_at": "2026-01-25T10:00:00Z"
}
```

#### Common Errors

- `400 Bad Request` – Empty or too long content.
- `401 Unauthorized` – Missing/invalid token.
- `404 Not Found` – Post not found.

---

## Messaging

### Concepts

- **Conversation**: A thread between 2 users or a user and a community.
- **Message**: A single text message within a conversation.

---

### GET `/conversations`

- **Description**: List conversations for the authenticated user.
- **Auth Required**: Yes

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "conv_1",
      "type": "user", 
      "participants": [
        { "id": "u_123", "name": "Jane Farmer" },
        { "id": "u_200", "name": "Dr. Agro Expert" }
      ],
      "last_message": {
        "id": "msg_50",
        "sender_id": "u_200",
        "content": "How is your soil moisture?",
        "created_at": "2026-01-26T12:00:00Z",
        "read": true
      },
      "unread_count": 0
    }
  ]
}
```

---

### POST `/conversations`

- **Description**: Start a new conversation.
- **Auth Required**: Yes

#### Request Body (JSON)

```json
{
  "type": "user",
  "target_user_id": "u_200"
}
```

- For community conversations:

```json
{
  "type": "community",
  "community_id": "c_10"
}
```

#### Success Response (201 Created)

```json
{
  "id": "conv_2",
  "type": "user",
  "participants": [
    { "id": "u_123", "name": "Jane Farmer" },
    { "id": "u_200", "name": "Dr. Agro Expert" }
  ]
}
```

#### Authorization Rules

- For `type: "user"`: both users must exist.
- For `type: "community"`: requester must be a member of the community.

---

### GET `/conversations/{conversation_id}`

- **Description**: Get conversation details and metadata.
- **Auth Required**: Yes  
- **Authorization**: Only participants can view.

#### Success Response (200 OK)

```json
{
  "id": "conv_1",
  "type": "user",
  "participants": [
    { "id": "u_123", "name": "Jane Farmer" },
    { "id": "u_200", "name": "Dr. Agro Expert" }
  ]
}
```

#### Common Errors

- `403 Forbidden` – User is not a participant.
- `404 Not Found` – Conversation not found.

---

### GET `/conversations/{conversation_id}/messages`

- **Description**: List messages in a conversation.
- **Auth Required**: Yes  
- **Authorization**: Only participants can view.

#### Query Params

- `page`, `page_size`

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "msg_50",
      "conversation_id": "conv_1",
      "sender_id": "u_200",
      "content": "How is your soil moisture?",
      "created_at": "2026-01-26T12:00:00Z",
      "read": true
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

---

### POST `/conversations/{conversation_id}/messages`

- **Description**: Send a new message in a conversation.
- **Auth Required**: Yes  
- **Authorization**: Only participants can send.

#### Request Body (JSON)

```json
{
  "content": "Moisture is low, what do you recommend?"
}
```

#### Success Response (201 Created)

```json
{
  "id": "msg_51",
  "conversation_id": "conv_1",
  "sender_id": "u_123",
  "content": "Moisture is low, what do you recommend?",
  "created_at": "2026-01-26T12:05:00Z",
  "read": false
}
```

#### Common Errors

- `400 Bad Request` – Empty content.
- `401 Unauthorized` – Missing/invalid token.
- `403 Forbidden` – Not a conversation participant.
- `404 Not Found` – Conversation not found.

---

### POST `/conversations/{conversation_id}/read`

- **Description**: Mark messages as read for the authenticated user (MVP read status).
- **Auth Required**: Yes  
- **Authorization**: Participant only.

#### Success Response (200 OK)

```json
{
  "conversation_id": "conv_1",
  "unread_count": 0
}
```

---

## Authorization Summary

- **JWT** is required for:
  - `/auth/logout`, `/auth/me`
  - `/profile` (GET/PUT)
  - Any `POST`, `PUT`, `DELETE` on posts, likes, comments, follows
  - Joining/leaving communities
  - All messaging endpoints
- **Ownership rules**:
  - Users can update only their own profile.
  - Users can like/unlike posts only as themselves; uniqueness enforced per `(user_id, post_id)`.
  - Comments and messages are always attributed to the authenticated user.
- **Participation rules**:
  - Only community members can access private community feeds and community conversations.
  - Only conversation participants can view or send messages to that conversation.
- **Expert rules**:
  - Only users flagged as `is_expert` are considered experts in `/experts` and follow endpoints.
  - Users cannot follow themselves.
