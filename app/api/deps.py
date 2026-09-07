from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_access_token
from app.core.errors import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole
from app.models.candidate import CandidateProfile

security_bearer = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token.")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Malformed token claims.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User no longer exists.")
    if not user.is_active:
        raise UnauthorizedException("User account is inactive.")

    return user


def require_candidate(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.CANDIDATE.value and current_user.role != UserRole.ADMIN.value:
        raise ForbiddenException("Only candidates may perform this action.")
    return current_user


def require_recruiter(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.RECRUITER.value and current_user.role != UserRole.ADMIN.value:
        raise ForbiddenException("Only recruiters may perform this action.")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN.value:
        raise ForbiddenException("Administrator privileges required.")
    return current_user


def get_current_candidate(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
) -> CandidateProfile:
    if not current_user.candidate_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found for this user."
        )
    return current_user.candidate_profile
