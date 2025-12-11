"""
데이터베이스 연결 테스트 스크립트
"""
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import engine, SessionLocal
from sqlalchemy import text


def test_connection():
    """데이터베이스 연결 테스트"""
    try:
        # 연결 테스트
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ 데이터베이스 연결 성공!")
            print(f"테스트 쿼리 결과: {result.scalar()}")
            
        # 세션 테스트
        db = SessionLocal()
        try:
            result = db.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ PostgreSQL 버전: {version}")
        finally:
            db.close()
            
        return True
        
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패!")
        print(f"에러 내용: {str(e)}")
        return False


if __name__ == "__main__":
    test_connection()