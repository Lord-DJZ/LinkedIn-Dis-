from sqlalchemy.orm import Session
from app.models.user import User, RecruiterProfile, UserRole
from app.models.candidate import CandidateProfile
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.errors import DuplicateEntityException, UnauthorizedException


class AuthService:
    """Authentication service for registration, login, and token issuance."""

    @classmethod
    def register(cls, db: Session, req: UserRegisterRequest) -> TokenResponse:
        existing = db.query(User).filter(User.email == req.email.lower()).first()
        if existing:
            raise DuplicateEntityException("User", "email", req.email)

        user = User(
            email=req.email.lower(),
            hashed_password=hash_password(req.password),
            role=req.role,
            is_active=True
        )
        db.add(user)
        db.flush()

        profile_id = None
        if req.role == UserRole.CANDIDATE.value:
            cand = CandidateProfile(
                user_id=user.id,
                full_name=req.full_name or req.email.split("@")[0].capitalize(),
                headline="Professional Candidate",
                availability_status="available",
                profile_visibility="public",
                is_searchable=True,
                completeness_score=20
            )
            db.add(cand)
            db.flush()
            profile_id = cand.id

        elif req.role == UserRole.RECRUITER.value:
            rec = RecruiterProfile(
                user_id=user.id,
                full_name=req.full_name,
                company_name=req.company_name or "Hiring Company"
            )
            db.add(rec)
            db.flush()
            profile_id = rec.id

        db.commit()

        token = create_access_token(
            subject=user.id,
            role=user.role,
            additional_claims={"email": user.email, "profile_id": profile_id}
        )

        return TokenResponse(
            access_token=token,
            role=user.role,
            user_id=user.id,
            profile_id=profile_id
        )

    @classmethod
    def login(cls, db: Session, req: UserLoginRequest) -> TokenResponse:
        user = db.query(User).filter(User.email == req.email.lower()).first()
        if not user or not verify_password(req.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("Account is disabled.")

        profile_id = None
        if user.role == UserRole.CANDIDATE.value and user.candidate_profile:
            profile_id = user.candidate_profile.id
        elif user.role == UserRole.RECRUITER.value and user.recruiter_profile:
            profile_id = user.recruiter_profile.id

        token = create_access_token(
            subject=user.id,
            role=user.role,
            additional_claims={"email": user.email, "profile_id": profile_id}
        )

        return TokenResponse(
            access_token=token,
            role=user.role,
            user_id=user.id,
            profile_id=profile_id
        )
