from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new candidate or recruiter account."""
    return AuthService.register(db, req)


@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate and obtain a JWT access token."""
    return AuthService.login(db, req)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    profile_id = None
    if current_user.candidate_profile:
        profile_id = current_user.candidate_profile.id
    elif current_user.recruiter_profile:
        profile_id = current_user.recruiter_profile.id

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        profile_id=profile_id
    )


class SwitchRoleRequest(BaseModel):
    role: Optional[str] = None
    target_role: Optional[str] = None


class SwitchRoleResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str
    profile_id: Optional[str] = None


@router.post("/switch-role", response_model=SwitchRoleResponse)
def switch_role(
    req: SwitchRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows user to switch active perspective between candidate and recruiter."""
    new_role = req.role or req.target_role
    if new_role not in ["candidate", "recruiter"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'candidate' or 'recruiter'.")
    current_user.role = new_role
    db.commit()
    db.refresh(current_user)

    token = create_access_token(str(current_user.id), role=new_role)
    profile_id = current_user.candidate_profile.id if current_user.candidate_profile else None
    return SwitchRoleResponse(
        access_token=token,
        token_type="bearer",
        role=new_role,
        email=current_user.email,
        profile_id=profile_id
    )
