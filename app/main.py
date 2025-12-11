from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.core.config import settings
from app.api.routes import api_router
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Budget Book API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Budget Book API"}
