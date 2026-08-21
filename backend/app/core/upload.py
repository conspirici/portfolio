import uuid
import aioboto3
from fastapi import UploadFile
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def upload_image_to_r2(file: UploadFile, folder: str = "uploads") -> str:
    """
    Uploads an image to Cloudflare R2 and returns its public URL.
    """
    if not settings.r2_account_id:
        raise ValueError("R2 Account ID is missing in configuration.")
        
    endpoint_url = f"https://{settings.r2_account_id}.r2.cloudflarestorage.com"
    
    session = aioboto3.Session()
    
    # Extract extension or default to jpg
    file_ext = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
    unique_filename = f"{folder}/{uuid.uuid4().hex}.{file_ext}"
    
    async with session.client('s3',
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto"
    ) as s3_client:
        await s3_client.upload_fileobj(
            file.file,
            settings.r2_bucket_name,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )
        
    public_url = settings.r2_public_url or f"https://pub-placeholder.r2.dev"
    return f"{public_url}/{unique_filename}"
