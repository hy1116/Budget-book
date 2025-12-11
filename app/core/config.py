from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    # 프로젝트 기본 정보
    PROJECT_NAME: str = "Budget Book API"
    VERSION: str = "1.0.0"
    API_STR: str = "/api"

    # 데이터베이스 설정
    DATABASE_URL: str

    class Config:
        env_file = Path(__file__).parent.parent / ".env"
        case_sensitive = True

# 설정 인스턴스 생성
settings = Settings()