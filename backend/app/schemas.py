from pydantic import BaseModel, ConfigDict
import uuid
from datetime import date, datetime
from typing import List, Optional

class TagResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str

    model_config = ConfigDict(from_attributes=True)

class ProjectImageResponse(BaseModel):
    id: uuid.UUID
    url: str
    alt: Optional[str]
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class ProjectVideoResponse(BaseModel):
    id: uuid.UUID
    youtube_url: str
    label: str
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class ProjectResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    summary: str
    thumbnail_url: str
    github_url: Optional[str]
    live_url: Optional[str]
    status: str
    is_published: bool
    featured: bool
    order_index: Optional[int]
    gradient_from: Optional[str] = None
    gradient_to: Optional[str] = None
    aside_quote: Optional[str]
    body: str
    date_started: Optional[date]
    date_updated: date
    tags: List[TagResponse]
    gallery_images: List[ProjectImageResponse]
    videos: List[ProjectVideoResponse]

    model_config = ConfigDict(from_attributes=True)

class BlogPostResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    teaser: str
    cover_image_url: Optional[str]
    read_time: Optional[int]
    is_published: bool
    featured: bool
    order_index: Optional[int]
    body: str
    date_published: Optional[date]
    tags: List[TagResponse]

    model_config = ConfigDict(from_attributes=True)

class FieldNoteResponse(BaseModel):
    id: uuid.UUID
    photo_url: str
    caption: Optional[str]
    location: Optional[str]
    date_taken: Optional[date]
    is_published: bool
    order_index: Optional[int]
    tags: List[TagResponse]

    model_config = ConfigDict(from_attributes=True)

class SiteSettingsResponse(BaseModel):
    name: str
    title: str
    github_url: str
    linkedin_url: str
    email: str
    footer_tagline: str
    copyright_text: str

    model_config = ConfigDict(from_attributes=True)

class HomeContentResponse(BaseModel):
    hero_line_1: str
    hero_line_2: str
    hero_line_3: Optional[str]
    hero_headline: Optional[str] = None
    hero_subheadline: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_logo_urls: Optional[List[str]] = None
    featured_projects: List[ProjectResponse]
    featured_posts: List[BlogPostResponse]

    model_config = ConfigDict(from_attributes=True)

class AboutContentResponse(BaseModel):
    headline: str
    portrait_url: str
    tags: List[str]
    body: str
    closing_line: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class ActivityLogResponse(BaseModel):
    id: uuid.UUID
    timestamp: datetime
    action: str
    content_type: str
    content_id: Optional[uuid.UUID]
    content_title: Optional[str]
    admin_email: str
    details: Optional[dict]

    model_config = ConfigDict(from_attributes=True)

class StatsResponse(BaseModel):
    total_projects: int
    published_posts: int
    ai_tasks_run: int
    recent_activity: List[ActivityLogResponse]

class ProjectCreate(BaseModel):
    title: str
    slug: str
    summary: str
    thumbnail_url: str
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    status: str
    is_published: bool = False
    featured: bool = False
    order_index: Optional[int] = None
    gradient_from: Optional[str] = None
    gradient_to: Optional[str] = None
    aside_quote: Optional[str] = None
    body: str
    date_started: Optional[date] = None
    tags: List[uuid.UUID] = []

class ProjectUpdate(ProjectCreate):
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: Optional[str] = None
    gradient_from: Optional[str] = None
    gradient_to: Optional[str] = None
    body: Optional[str] = None

class ProjectVideoCreate(BaseModel):
    youtube_url: str
    label: str
    order_index: int = 0

class ProjectVideoUpdate(ProjectVideoCreate):
    youtube_url: Optional[str] = None
    label: Optional[str] = None
    order_index: Optional[int] = None

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    teaser: str
    cover_image_url: Optional[str] = None
    read_time: Optional[int] = None
    is_published: bool = False
    featured: bool = False
    order_index: Optional[int] = None
    body: str
    date_published: Optional[date] = None
    tags: List[uuid.UUID] = []

class BlogPostUpdate(BlogPostCreate):
    title: Optional[str] = None
    slug: Optional[str] = None
    teaser: Optional[str] = None
    body: Optional[str] = None

class FieldNoteCreate(BaseModel):
    photo_url: str
    caption: Optional[str] = None
    location: Optional[str] = None
    date_taken: Optional[date] = None
    is_published: bool = False
    order_index: Optional[int] = None
    tags: List[uuid.UUID] = []

class FieldNoteUpdate(FieldNoteCreate):
    photo_url: Optional[str] = None

class TagCreate(BaseModel):
    name: str
    type: str

class SiteSettingsUpdate(BaseModel):
    name: str
    title: str
    github_url: str
    linkedin_url: str
    email: str
    footer_tagline: str
    copyright_text: str

class HomeContentUpdate(BaseModel):
    hero_line_1: Optional[str] = None
    hero_line_2: Optional[str] = None
    hero_line_3: Optional[str] = None
    hero_headline: Optional[str] = None
    hero_subheadline: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_logo_urls: Optional[List[str]] = None
    work_preview_project_ids: Optional[List[uuid.UUID]] = None
    writing_preview_post_ids: Optional[List[uuid.UUID]] = None

class AboutContentUpdate(BaseModel):
    headline: Optional[str] = None
    portrait_url: Optional[str] = None
    tags: Optional[List[str]] = None
    body: Optional[str] = None
    closing_line: Optional[str] = None
