import logging
import sys

def setup_logger(name: str = __name__) -> logging.Logger:
    """
    디버깅용 로거 설정

    사용법:
        from app.core.logger import setup_logger

        logger = setup_logger(__name__)
        logger.debug("디버그 메시지")
        logger.info("정보 메시지")
        logger.warning("경고 메시지")
        logger.error("에러 메시지")
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # 이미 핸들러가 있으면 추가하지 않음 (중복 방지)
    if not logger.handlers:
        # 콘솔 핸들러 설정
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG)

        # 포맷 설정 (시간, 레벨, 파일명, 함수명, 메시지)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
