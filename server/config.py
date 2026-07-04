import os
import secrets

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration class with security validations."""

    # Render gives postgres://, SQLAlchemy needs postgresql://
    _db_url = os.getenv("DATABASE_URL", "postgresql://localhost/agrilink")
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.getenv("SECRET_KEY")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "true").lower() == "true"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours

    FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://localhost:3000")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@agrilink.example.com")
    EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = int(
        os.getenv("EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS", "24")
    )
    # Optional SMTP (if not set, verification links are logged only)
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")

    RATELIMIT_STORAGE_URL = os.getenv("REDIS_URL", "memory://")

    # Cloudinary Configuration (optional)
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

    # Image upload constraints
    MAX_IMAGE_SIZE_MB = 5  # Maximum upload size in megabytes
    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

    # Optional third-party keys
    NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")

    @classmethod
    def validate(cls):
        """Validate required configuration at startup."""

        if not cls.SECRET_KEY:
            if (
                os.getenv("FLASK_ENV") in ["development", "testing"]
                or os.getenv("FLASK_DEBUG") == "true"
            ):
                cls.SECRET_KEY = secrets.token_hex(32)
                print(
                    "WARNING: Using auto-generated SECRET_KEY for development. Set SECRET_KEY in production!"
                )
            else:
                raise ValueError(
                    "SECRET_KEY environment variable is required in production. "
                    "Generate one with: python -c 'import secrets; print(secrets.token_hex(32))'"
                )

        if cls.SECRET_KEY in ["dev-secret", "secret", "changeme", "password"]:
            raise ValueError(
                "SECRET_KEY is too weak. Generate a secure key with: "
                "python -c 'import secrets; print(secrets.token_hex(32))'"
            )

        if len(cls.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")

        if os.getenv("FLASK_ENV") == "production" and cls.FRONTEND_ORIGINS == "*":
            raise ValueError("FRONTEND_ORIGINS cannot be '*' in production")

        if os.getenv("FLASK_ENV") == "production" and not cls.NEWSAPI_KEY:
            import logging

            logging.getLogger(__name__).warning(
                "NEWSAPI_KEY not set — news features will be unavailable"
            )


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "None"  # Required for cross-site cookies (Vercel → Render)


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret-key-for-testing-only"
    WTF_CSRF_ENABLED = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}


def get_config(env=None):

    if env is None:
        env = os.getenv("FLASK_ENV", "development")
    return config_by_name.get(env, DevelopmentConfig)
