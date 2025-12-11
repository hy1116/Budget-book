from fastapi import APIRouter
from app.api.routes import categories

api_router = APIRouter()

api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
