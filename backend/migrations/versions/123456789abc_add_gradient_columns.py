"""add gradient columns

Revision ID: 123456789abc
Revises: b5ae2c000c2d
Create Date: 2024-05-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '123456789abc'
down_revision: Union[str, None] = 'b5ae2c000c2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('gradient_from', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('gradient_to', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('projects', 'gradient_to')
    op.drop_column('projects', 'gradient_from')
