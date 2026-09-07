from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    role: str = Field(default="candidate", pattern="^(candidate|recruiter|admin)$")
    full_name: Optional[str] = Field(None, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)  # For recruiters


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    profile_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool
    profile_id: Optional[str] = None

    class Config:
        from_attributes = True
