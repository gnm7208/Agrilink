from datetime import datetime

from extensions import db


class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    @classmethod
    def get_by_name(cls, name: str) -> "Role | None":
        return cls.query.filter_by(name=name).first()

    def __repr__(self) -> str:
        return f"<Role {self.name}>"

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    # NOTE: Kept for backward compatibility with existing code/rows.
    # New code should prefer Role via role_id/role_obj.
    role = db.Column(db.String(20), nullable=False)  # farmer | expert | admin
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=True)
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    profile_image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    role_obj = db.relationship("Role", backref="users")

    def set_role_by_name(self, role_name: str) -> None:
        """
        Assign a Role by name.

        Used during registration to default new users to the 'user' role,
        without hard-coding role IDs.
        """
        role = Role.get_by_name(role_name)
        if role is None:
            raise ValueError(f"Role '{role_name}' does not exist")
        self.role_obj = role
        self.role_id = role.id
        # Keep legacy column in sync for existing code paths.
        self.role = role_name

    posts = db.relationship("Post", backref="author", lazy=True)
    sent_messages = db.relationship("Message", foreign_keys="Message.sender_id", backref="sender")
    received_messages = db.relationship("Message", foreign_keys="Message.receiver_id", backref="receiver")

    def is_admin(self) -> bool:
        """Return True if the user's assigned role is 'admin'."""
        if self.role_obj is not None:
            return self.role_obj.name == "admin"
        # Fallback for legacy rows/code paths prior to role_id backfill.
        return self.role == "admin"

    def __repr__(self):
        return f"<User {self.username}>"

class Community(db.Model):
    __tablename__ = "communities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship("CommunityMembership", backref="community", cascade="all, delete-orphan")
    posts = db.relationship("Post", backref="community", lazy=True)

    def __repr__(self):
        return f"<Community {self.name}>"

class CommunityMembership(db.Model):
    __tablename__ = "community_memberships"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    community_id = db.Column(db.Integer, db.ForeignKey("communities.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="community_memberships")

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    community_id = db.Column(db.Integer, db.ForeignKey("communities.id"))
    title = db.Column(db.String(255))
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    images = db.relationship("PostImage", backref="post", cascade="all, delete-orphan")
    likes = db.relationship("Like", backref="post", cascade="all, delete-orphan")
    comments = db.relationship("Comment", backref="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Post {self.id}>"

class PostImage(db.Model):
    __tablename__ = "post_images"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Like(db.Model):
    __tablename__ = "likes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="likes")

    __table_args__ = (
        db.UniqueConstraint("user_id", "post_id", name="unique_user_post_like"),
    )

class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="comments")


class Follow(db.Model):
    __tablename__ = "follows"

    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    follower = db.relationship("User", foreign_keys=[follower_id])
    followed = db.relationship("User", foreign_keys=[followed_id])

    __table_args__ = (
        db.UniqueConstraint("follower_id", "followed_id", name="unique_follow"),
    )

class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    community_id = db.Column(db.Integer, db.ForeignKey("communities.id"))
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    community = db.relationship("Community", backref="messages")
