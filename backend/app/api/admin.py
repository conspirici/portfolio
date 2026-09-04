import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_admin
from app.db.database import get_db
from app.models import Project, ProjectVideo, BlogPost, FieldNote, Tag, SiteSettings, HomeContent, AboutContent, ActivityLog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import UploadFile, File
from app.core.upload import upload_image_to_r2
from app import schemas

router = APIRouter(
    dependencies=[Depends(get_current_admin)],
    tags=["admin"]
)

@router.get("/stats", response_model=schemas.StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_projects = await db.scalar(select(func.count(Project.id)))
    published_posts = await db.scalar(select(func.count(BlogPost.id)).where(BlogPost.is_published == True))
    ai_tasks_run = await db.scalar(select(func.count(ActivityLog.id)).where(ActivityLog.action.like('AI%')))
    
    recent_activity_result = await db.execute(
        select(ActivityLog)
        .order_by(ActivityLog.timestamp.desc())
        .limit(5)
    )
    recent_activity = recent_activity_result.scalars().all()
    
    return {
        "total_projects": total_projects or 0,
        "published_posts": published_posts or 0,
        "ai_tasks_run": ai_tasks_run or 0,
        "recent_activity": recent_activity
    }

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    url = await upload_image_to_r2(file)
    return {"url": url}

# --- Projects ---
@router.get("/projects", response_model=List[schemas.ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Project).order_by(Project.date_updated.desc()))
    return res.scalars().unique().all()

@router.post("/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    db_project = Project(**project.model_dump(exclude={"tags"}))
    if project.tags:
        tags = await db.execute(select(Tag).where(Tag.id.in_(project.tags)))
        db_project.tags = list(tags.scalars().all())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.get("/projects/{id}", response_model=schemas.ProjectResponse)
async def get_project(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_project = await db.get(Project, id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.put("/projects/{id}", response_model=schemas.ProjectResponse)
async def update_project(id: uuid.UUID, project: schemas.ProjectUpdate, db: AsyncSession = Depends(get_db)):
    db_project = await db.get(Project, id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project.model_dump(exclude_unset=True, exclude={"tags"})
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    if project.tags is not None:
        tags = await db.execute(select(Tag).where(Tag.id.in_(project.tags)))
        db_project.tags = list(tags.scalars().all())
        
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.delete("/projects/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_project = await db.get(Project, id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(db_project)
    await db.commit()

@router.post("/projects/{id}/videos", response_model=schemas.ProjectVideoResponse, status_code=status.HTTP_201_CREATED)
async def add_project_video(id: uuid.UUID, video: schemas.ProjectVideoCreate, db: AsyncSession = Depends(get_db)):
    db_project = await db.get(Project, id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_video = ProjectVideo(**video.model_dump(), project_id=id)
    db.add(db_video)
    await db.commit()
    await db.refresh(db_video)
    return db_video

@router.put("/projects/{id}/videos/{video_id}", response_model=schemas.ProjectVideoResponse)
async def update_project_video(id: uuid.UUID, video_id: uuid.UUID, video: schemas.ProjectVideoUpdate, db: AsyncSession = Depends(get_db)):
    db_video = await db.get(ProjectVideo, video_id)
    if not db_video or db_video.project_id != id:
        raise HTTPException(status_code=404, detail="Video not found")
    update_data = video.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_video, key, value)
    await db.commit()
    await db.refresh(db_video)
    return db_video

@router.delete("/projects/{id}/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_video(id: uuid.UUID, video_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_video = await db.get(ProjectVideo, video_id)
    if not db_video or db_video.project_id != id:
        raise HTTPException(status_code=404, detail="Video not found")
    await db.delete(db_video)
    await db.commit()

# --- Posts ---
@router.get("/posts", response_model=List[schemas.BlogPostResponse])
async def list_posts(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(BlogPost).order_by(BlogPost.created_at.desc()))
    return res.scalars().unique().all()

@router.post("/posts", response_model=schemas.BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(post: schemas.BlogPostCreate, db: AsyncSession = Depends(get_db)):
    db_post = BlogPost(**post.model_dump(exclude={"tags"}))
    if post.tags:
        tags = await db.execute(select(Tag).where(Tag.id.in_(post.tags)))
        db_post.tags = list(tags.scalars().all())
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_post

@router.get("/posts/{id}", response_model=schemas.BlogPostResponse)
async def get_post(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_post = await db.get(BlogPost, id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@router.put("/posts/{id}", response_model=schemas.BlogPostResponse)
async def update_post(id: uuid.UUID, post: schemas.BlogPostUpdate, db: AsyncSession = Depends(get_db)):
    db_post = await db.get(BlogPost, id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post.model_dump(exclude_unset=True, exclude={"tags"})
    for key, value in update_data.items():
        setattr(db_post, key, value)
        
    if post.tags is not None:
        tags = await db.execute(select(Tag).where(Tag.id.in_(post.tags)))
        db_post.tags = list(tags.scalars().all())
        
    await db.commit()
    await db.refresh(db_post)
    return db_post

@router.delete("/posts/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_post = await db.get(BlogPost, id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(db_post)
    await db.commit()

# --- Field Notes ---
@router.get("/field-notes", response_model=List[schemas.FieldNoteResponse])
async def list_field_notes(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(FieldNote).order_by(FieldNote.created_at.desc()))
    return res.scalars().unique().all()

@router.post("/field-notes", response_model=schemas.FieldNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_field_note(note: schemas.FieldNoteCreate, db: AsyncSession = Depends(get_db)):
    db_note = FieldNote(**note.model_dump(exclude={"tags"}))
    if note.tags:
        tags = await db.execute(select(Tag).where(Tag.id.in_(note.tags)))
        db_note.tags = list(tags.scalars().all())
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note

@router.get("/field-notes/{id}", response_model=schemas.FieldNoteResponse)
async def get_field_note(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_note = await db.get(FieldNote, id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Field note not found")
    return db_note

@router.put("/field-notes/{id}", response_model=schemas.FieldNoteResponse)
async def update_field_note(id: uuid.UUID, note: schemas.FieldNoteUpdate, db: AsyncSession = Depends(get_db)):
    db_note = await db.get(FieldNote, id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Field note not found")
    
    update_data = note.model_dump(exclude_unset=True, exclude={"tags"})
    for key, value in update_data.items():
        setattr(db_note, key, value)
        
    if note.tags is not None:
        tags = await db.execute(select(Tag).where(Tag.id.in_(note.tags)))
        db_note.tags = list(tags.scalars().all())
        
    await db.commit()
    await db.refresh(db_note)
    return db_note

@router.delete("/field-notes/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field_note(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_note = await db.get(FieldNote, id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Field note not found")
    await db.delete(db_note)
    await db.commit()

# --- Tags ---
@router.get("/tags", response_model=List[schemas.TagResponse])
async def list_tags(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Tag))
    return res.scalars().unique().all()

@router.post("/tags", response_model=schemas.TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(tag: schemas.TagCreate, db: AsyncSession = Depends(get_db)):
    db_tag = Tag(**tag.model_dump())
    db.add(db_tag)
    await db.commit()
    await db.refresh(db_tag)
    return db_tag

@router.delete("/tags/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    db_tag = await db.get(Tag, id)
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await db.delete(db_tag)
    await db.commit()

# --- Settings and Home/About ---
@router.get("/site-settings", response_model=schemas.SiteSettingsResponse)
async def get_site_settings(db: AsyncSession = Depends(get_db)):
    db_settings = await db.get(SiteSettings, 1)
    if not db_settings:
        db_settings = SiteSettings(name="Default", title="Portfolio", github_url="", linkedin_url="", email="", footer_tagline="", copyright_text="")
        db.add(db_settings)
        await db.commit()
        await db.refresh(db_settings)
    return db_settings

@router.put("/site-settings", response_model=schemas.SiteSettingsResponse)
async def update_site_settings(settings: schemas.SiteSettingsUpdate, db: AsyncSession = Depends(get_db)):
    db_settings = await db.get(SiteSettings, 1)
    if not db_settings:
        db_settings = SiteSettings(name="Default", title="Portfolio", github_url="", linkedin_url="", email="", footer_tagline="", copyright_text="")
        db.add(db_settings)
    
    update_data = settings.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)
        
    await db.commit()
    await db.refresh(db_settings)
    return db_settings

@router.get("/home-content", response_model=schemas.HomeContentResponse)
async def get_home_content(db: AsyncSession = Depends(get_db)):
    db_content = await db.get(HomeContent, 1)
    if not db_content:
        db_content = HomeContent(hero_line_1="", hero_line_2="")
        db.add(db_content)
        await db.commit()
        await db.refresh(db_content)
    return db_content

@router.put("/home-content", response_model=schemas.HomeContentResponse)
async def update_home_content(content: schemas.HomeContentUpdate, db: AsyncSession = Depends(get_db)):
    db_content = await db.get(HomeContent, 1)
    if not db_content:
        db_content = HomeContent(hero_line_1="", hero_line_2="")
        db.add(db_content)
    
    update_data = content.model_dump(exclude_unset=True, exclude={"work_preview_project_ids", "writing_preview_post_ids"})
    for key, value in update_data.items():
        setattr(db_content, key, value)
        
    if content.work_preview_project_ids is not None:
        projects = await db.execute(select(Project).where(Project.id.in_(content.work_preview_project_ids)))
        db_content.featured_projects = list(projects.scalars().all())
        
    if content.writing_preview_post_ids is not None:
        posts = await db.execute(select(BlogPost).where(BlogPost.id.in_(content.writing_preview_post_ids)))
        db_content.featured_posts = list(posts.scalars().all())
        
    await db.commit()
    await db.refresh(db_content)
    return db_content

import urllib.request
import json
from fastapi import BackgroundTasks

def trigger_nextjs_revalidate(tag: str):
    try:
        url = f"{settings.frontend_url}/api/revalidate"
        data = json.dumps({"tag": tag}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=5) as response:
            pass
    except Exception as e:
        print(f"Failed to revalidate {tag}: {e}")

@router.get("/about-content", response_model=schemas.AboutContentResponse)
async def get_about_content(db: AsyncSession = Depends(get_db)):
    db_content = await db.get(AboutContent, 1)
    if not db_content:
        db_content = AboutContent(portrait_url="", tags=[], body="")
        db.add(db_content)
        await db.commit()
        await db.refresh(db_content)
    return db_content

@router.put("/about-content", response_model=schemas.AboutContentResponse)
async def update_about_content(content: schemas.AboutContentUpdate, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    db_content = await db.get(AboutContent, 1)
    if not db_content:
        db_content = AboutContent(portrait_url="", tags=[], body="")
        db.add(db_content)
    
    update_data = content.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_content, key, value)
        
    await db.commit()
    await db.refresh(db_content)
    
    background_tasks.add_task(trigger_nextjs_revalidate, "about-content")
    return db_content

