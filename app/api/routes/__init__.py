from fastapi import APIRouter
from app.api.routes import categories
from app.api.routes import login

api_router = APIRouter()

api_router.include_router(categories.router)
api_router.include_router(login.router)