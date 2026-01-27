Table users {
  id int [pk, increment]
  username varchar [unique, not null]
  email varchar [unique, not null]
  password_hash varchar [not null]
  role varchar [not null, note: "farmer | expert | admin"]
  bio text
  location varchar
  profile_image_url varchar
  created_at timestamp
  updated_at timestamp
}

Table communities {
  id int [pk, increment]
  name varchar [not null]
  description text
  image_url varchar
  created_by int [not null]
  created_at timestamp
}

Table community_memberships {
  id int [pk, increment]
  user_id int [not null]
  community_id int [not null]
  created_at timestamp
}

Table posts {
  id int [pk, increment]
  author_id int [not null]
  community_id int
  title varchar
  content text [not null]
  created_at timestamp
  updated_at timestamp
}

Table post_images {
  id int [pk, increment]
  post_id int [not null]
  image_url varchar [not null]
  created_at timestamp
}

Table likes {
  id int [pk, increment]
  user_id int [not null]
  post_id int [not null]
  created_at timestamp
}

Table comments {
  id int [pk, increment]
  user_id int [not null]
  post_id int [not null]
  content text [not null]
  created_at timestamp
}

Table follows {
  id int [pk, increment]
  follower_id int [not null]
  followed_id int [not null]
  created_at timestamp
}

Table messages {
  id int [pk, increment]
  sender_id int [not null]
  receiver_id int
  community_id int
  content text [not null]
  created_at timestamp
}

Ref: communities.created_by > users.id
Ref: community_memberships.user_id > users.id
Ref: community_memberships.community_id > communities.id
Ref: posts.author_id > users.id
Ref: posts.community_id > communities.id
Ref: post_images.post_id > posts.id
Ref: likes.user_id > users.id
Ref: likes.post_id > posts.id
Ref: comments.user_id > users.id
Ref: comments.post_id > posts.id
Ref: follows.follower_id > users.id
Ref: follows.followed_id > users.id
Ref: messages.sender_id > users.id
Ref: messages.receiver_id > users.id
Ref: messages.community_id > communities.id
