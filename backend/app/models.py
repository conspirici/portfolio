import uuid
from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Table,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base

# Association Tables
project_tags = Table(
    "project_tags",
    Base.metadata,
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

blog_post_tags = Table(
    "blog_post_tags",
    Base.metadata,
    Column("post_id", UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

field_note_tags = Table(
    "field_note_tags",
    Base.metadata,
    Column("field_note_id", UUID(as_uuid=True), ForeignKey("field_notes.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

home_featured_projects = Table(
    "home_featured_projects",
    Base.metadata,
    Column("home_id", Integer, ForeignKey("home_content.id"), primary_key=True),
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id"), primary_key=True),
    Column("order_index", Integer, nullable=False)
)

home_featured_posts = Table(
    "home_featured_posts",
    Base.metadata,
    Column("home_id", Integer, ForeignKey("home_content.id"), primary_key=True),
    Column("post_id", UUID(as_uuid=True), ForeignKey("blog_posts.id"), primary_key=True),
    Column("order_index", Integer, nullable=False)
)

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False) # 'tech', 'category', 'topic'

class ProjectImage(Base):
    __tablename__ = "project_images"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    url: Mapped[str] = mapped_column(String, nullable=False)
    alt: Mapped[Optional[str]] = mapped_column(String)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

class ProjectVideo(Base):
    __tablename__ = "project_videos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    youtube_url: Mapped[str] = mapped_column(String, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    thumbnail_url: Mapped[str] = mapped_column(String, nullable=False)
    github_url: Mapped[Optional[str]] = mapped_column(String)
    live_url: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, nullable=False) # 'proof-of-concept','in-progress','completed','production'
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[Optional[int]] = mapped_column(Integer)
    aside_quote: Mapped[Optional[str]] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    date_started: Mapped[Optional[date]] = mapped_column(Date)
    date_updated: Mapped[date] = mapped_column(Date, server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    tags: Mapped[List[Tag]] = relationship(secondary=project_tags, lazy="selectin")
    gallery_images: Mapped[List[ProjectImage]] = relationship(cascade="all, delete", lazy="selectin")
    videos: Mapped[List[ProjectVideo]] = relationship(cascade="all, delete", lazy="selectin")

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    teaser: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image_url: Mapped[Optional[str]] = mapped_column(String)
    read_time: Mapped[Optional[int]] = mapped_column(Integer)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[Optional[int]] = mapped_column(Integer)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    date_published: Mapped[Optional[date]] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    tags: Mapped[List[Tag]] = relationship(secondary=blog_post_tags, lazy="selectin")

class FieldNote(Base):
    __tablename__ = "field_notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_url: Mapped[str] = mapped_column(String, nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(Text)
    location: Mapped[Optional[str]] = mapped_column(String)
    date_taken: Mapped[Optional[date]] = mapped_column(Date)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    tags: Mapped[List[Tag]] = relationship(secondary=field_note_tags, lazy="selectin")

class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    name: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    github_url: Mapped[str] = mapped_column(String, nullable=False)
    linkedin_url: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    footer_tagline: Mapped[str] = mapped_column(String, nullable=False)
    copyright_text: Mapped[str] = mapped_column(String, nullable=False)

class HomeContent(Base):
    __tablename__ = "home_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    hero_line_1: Mapped[str] = mapped_column(String, nullable=False)
    hero_line_2: Mapped[str] = mapped_column(String, nullable=False)
    hero_line_3: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    hero_headline: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hero_subheadline: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hero_image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hero_logo_urls: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    featured_projects: Mapped[list["Project"]] = relationship("Project", secondary=home_featured_projects, lazy="selectin")
    featured_posts: Mapped[list["BlogPost"]] = relationship("BlogPost", secondary=home_featured_posts, lazy="selectin")

class AboutContent(Base):
    __tablename__ = "about_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    headline: Mapped[Optional[str]] = mapped_column(String, default="Hi! I'm a...")
    portrait_url: Mapped[str] = mapped_column(String, nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    closing_line: Mapped[Optional[str]] = mapped_column(String)

class ActivityLog(Base):
    __tablename__ = "activity_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    action: Mapped[str] = mapped_column(String, nullable=False)
    content_type: Mapped[str] = mapped_column(String, nullable=False)
    content_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    content_title: Mapped[Optional[str]] = mapped_column(String)
    admin_email: Mapped[str] = mapped_column(String, nullable=False)
    details: Mapped[Optional[dict]] = mapped_column(JSONB)
