"""add market_prices table

Revision ID: add_market_prices
Revises: add_reports
Create Date: 2026-07-11

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_market_prices'
down_revision = 'add_reports'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'market_prices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop', sa.String(length=60), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=40), nullable=False),
        sa.Column('location', sa.String(length=100), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('posted_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['posted_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('market_prices')
