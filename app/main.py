from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from app.core.database import engine
from app.core.config import settings
from app.api.routes import api_router

app = FastAPI(title="Budget Book API")

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
