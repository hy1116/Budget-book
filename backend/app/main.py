from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from sqlmodel import SQLModel
from app.core.database import engine
from app.core.config import settings
from app.api.routes import api_router

# Import all models to register them with SQLModel
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}" if route.tags else route.name

app = FastAPI(
    title="Budget Book API",
    generate_unique_id_function=custom_generate_unique_id
)

# CORS middleware must be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Create tables after app initialization
SQLModel.metadata.create_all(engine)

print([route.path for route in api_router.routes])

@app.get("/")
def read_root():
    return {"message": "Welcome to Budget Book API"}
