from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 프로젝트 기본 정보
    PROJECT_NAME: str = "Budget Book API"
    VERSION: str = "1.0.0"
    API_STR: str = "/api/v1"

    # 보안 설정
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # 데이터베이스 설정
    DATABASE_URL: str

    class Config:
        env_file = ".env"
        case_sensitive = True

# 설정 인스턴스 생성
settings = Settings()