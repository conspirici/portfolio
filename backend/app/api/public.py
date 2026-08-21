from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models import (
    Project, BlogPost, FieldNote, SiteSettings, HomeContent, AboutContent
)
from app.schemas import (
    ProjectResponse, BlogPostResponse, FieldNoteResponse, 
    SiteSettingsResponse, HomeContentResponse, AboutContentResponse
)

router = APIRouter(tags=["public"])

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project)
        .where(Project.is_published == True)
        .order_by(Project.order_index.nullslast(), Project.date_updated.desc())
        .options(selectinload(Project.tags), selectinload(Project.gallery_images), selectinload(Project.videos))
    )
    return result.scalars().all()

@router.get("/projects/{slug}", response_model=ProjectResponse)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project)
        .where(Project.slug == slug)
        .options(selectinload(Project.tags), selectinload(Project.gallery_images), selectinload(Project.videos))
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/posts", response_model=List[BlogPostResponse])
async def get_posts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.is_published == True)
        .order_by(BlogPost.order_index.nullslast(), BlogPost.date_published.desc())
        .options(selectinload(BlogPost.tags))
    )
    return result.scalars().all()

@router.get("/posts/{slug}", response_model=BlogPostResponse)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.slug == slug)
        .options(selectinload(BlogPost.tags))
    )
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.get("/field-notes", response_model=List[FieldNoteResponse])
async def get_field_notes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(FieldNote)
        .where(FieldNote.is_published == True)
        .order_by(FieldNote.order_index.nullslast(), FieldNote.date_taken.desc())
        .options(selectinload(FieldNote.tags))
    )
    return result.scalars().all()

@router.get("/site-settings", response_model=SiteSettingsResponse)
async def get_site_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    settings = result.scalars().first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not configured")
    return settings

@router.get("/home-content", response_model=HomeContentResponse)
async def get_home_content(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HomeContent)
        .where(HomeContent.id == 1)
        .options(
            selectinload(HomeContent.featured_projects).selectinload(Project.tags),
            selectinload(HomeContent.featured_projects).selectinload(Project.gallery_images),
            selectinload(HomeContent.featured_projects).selectinload(Project.videos),
            selectinload(HomeContent.featured_posts).selectinload(BlogPost.tags)
        )
    )
    home = result.scalars().first()
    if not home:
        raise HTTPException(status_code=404, detail="Home content not configured")
    return home

@router.get("/about-content", response_model=AboutContentResponse)
async def get_about_content(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AboutContent).where(AboutContent.id == 1))
    about = result.scalars().first()
    if not about:
        raise HTTPException(status_code=404, detail="About content not configured")
    return about
