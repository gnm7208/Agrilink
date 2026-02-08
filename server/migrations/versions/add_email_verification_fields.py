"""add email verification fields to users

Revision ID: add_email_ver
Revises: 56c7f3c212fa
Create Date: 2026-02-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_email_ver'
down_revision = '56c7f3c212fa'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('users', sa.Column('email_verification_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('email_verification_expires', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_users_email_verification_token'), 'users', ['email_verification_token'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_users_email_verification_token'), table_name='users')
    op.drop_column('users', 'email_verification_expires')
    op.drop_column('users', 'email_verification_token')
    op.drop_column('users', 'email_verified')
