"""Erasing a user account and everything that references it."""

from extensions import db
from models import (
    Comment,
    Community,
    CommunityMembership,
    Follow,
    Like,
    MarketPrice,
    Message,
    PasswordResetToken,
    Post,
    Report,
)


def hard_delete_user(user):
    """Remove a user and everything that references them.

    The schema has no ON DELETE CASCADE, so a bare `session.delete(user)`
    fails with an IntegrityError for any user with posts/comments/likes/
    follows/messages/reports/price reports. Posts and communities are deleted
    one-by-one via the ORM (not bulk .delete()) so their own
    cascade="all, delete-orphan" relationships (images/likes/comments,
    memberships) fire correctly. Used by both the admin console and the
    user's own "Delete my account"; the caller commits.
    """
    Like.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    Comment.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    for post in Post.query.filter_by(author_id=user.id).all():
        db.session.delete(post)
    Follow.query.filter((Follow.follower_id == user.id) | (Follow.followed_id == user.id)).delete(
        synchronize_session=False
    )
    Message.query.filter((Message.sender_id == user.id) | (Message.receiver_id == user.id)).delete(
        synchronize_session=False
    )
    CommunityMembership.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    PasswordResetToken.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    # Reports they filed go; reports they *resolved* as a moderator stay, unattributed.
    Report.query.filter_by(reporter_id=user.id).delete(synchronize_session=False)
    Report.query.filter_by(resolved_by=user.id).update(
        {Report.resolved_by: None}, synchronize_session=False
    )
    MarketPrice.query.filter_by(posted_by=user.id).delete(synchronize_session=False)
    for community in Community.query.filter_by(created_by=user.id).all():
        db.session.delete(community)
    db.session.delete(user)
