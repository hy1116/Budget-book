from fastapi import FastAPI
from app.db.database import engine, Base
from app.core.config import settings
from app.api.routes import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Budget Book API")

app.include_router(api_router, prefix=settings.API_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Budget Book API"}
