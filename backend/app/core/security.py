import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

import json

if settings.google_credentials_json:
    cred_dict = json.loads(settings.google_credentials_json)
    cred = credentials.Certificate(cred_dict)
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)
elif settings.google_application_credentials:
    cred = credentials.Certificate(settings.google_application_credentials)
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)
else:
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app()

security = HTTPBearer()

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        email = decoded_token.get("email")
        if not email or email != settings.admin_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized as admin",
            )
        return email
    except Exception as e:
        import structlog
        logger = structlog.get_logger()
        logger.error("token_verification_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
