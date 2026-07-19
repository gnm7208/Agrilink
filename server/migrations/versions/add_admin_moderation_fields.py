"""add admin moderation fields (user status, community is_active, message read_at, admin action log)

Revision ID: add_admin_mod
Revises: add_email_ver
Create Date: 2026-07-11

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_admin_mod'
down_revision = 'add_email_ver'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'users',
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
    )
    op.add_column(
        'communities',
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column('messages', sa.Column('read_at', sa.DateTime(), nullable=True))

    op.create_table(
        'admin_action_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('target_type', sa.String(length=20), nullable=False),
        sa.Column('target_id', sa.Integer(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('admin_action_logs')
    op.drop_column('messages', 'read_at')
    op.drop_column('communities', 'is_active')
    op.drop_column('users', 'status')
