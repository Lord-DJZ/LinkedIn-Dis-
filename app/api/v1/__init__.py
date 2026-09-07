from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.candidates import router as candidates_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.recruiters import router as recruiters_router
from app.api.v1.search import router as search_router
from app.api.v1.admin import router as admin_router
from app.api.v1.organization import router as organization_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(candidates_router)
api_router.include_router(resumes_router)
api_router.include_router(recruiters_router)
api_router.include_router(search_router)
api_router.include_router(organization_router)
api_router.include_router(admin_router)

