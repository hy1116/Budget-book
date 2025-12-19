from typing import Self
from pydantic import EmailStr, model_validator, computed_field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str
    FRONTEND_HOST: str

    # 프로젝트 기본 정보
    PROJECT_NAME: str
    VERSION: str
    API_V1_STR: str

    # 데이터베이스 설정
    DATABASE_URL: str

    # 보안 설정
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # SMTP 설정
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: EmailStr | None = None
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    EMAIL_TEST_USER: EmailStr
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    @model_validator(mode="after")
    def _set_default_emails_from(self) -> Self:
        if not self.EMAILS_FROM_NAME:
            self.EMAILS_FROM_NAME = self.PROJECT_NAME
        return self
    
    @computed_field  # type: ignore[prop-decorator]
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.EMAILS_FROM_EMAIL)
    
    # .env
    class Config:
        env_file = ".env"
        case_sensitive = True

# 설정 인스턴스 생성
settings = Settings()