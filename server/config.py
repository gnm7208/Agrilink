import os
import secrets
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class with security validations."""

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://localhost/agrilink"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Session and Security Configuration
    SECRET_KEY = os.getenv("SECRET_KEY")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "true").lower() == "true"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours in seconds

    # CORS Configuration - never use wildcard in production
    FRONTEND_ORIGINS = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    )

    # Rate Limiting Configuration
    RATELIMIT_STORAGE_URL = os.getenv("REDIS_URL", "memory://")

    @classmethod
    def validate(cls):
        """Validate required configuration at startup."""
        if not cls.SECRET_KEY:
            # Generate a random key for development only
            if os.getenv("FLASK_ENV") == "development" or os.getenv("FLASK_DEBUG") == "true":
                cls.SECRET_KEY = secrets.token_hex(32)
                print("WARNING: Using auto-generated SECRET_KEY for development. Set SECRET_KEY env var for production!")
            else:
                raise ValueError(
                    "SECRET_KEY environment variable is required in production. "
                    "Generate one with: python -c 'import secrets; print(secrets.token_hex(32))'"
                )

        # Validate SECRET_KEY strength
        if cls.SECRET_KEY in ["dev-secret", "secret", "changeme", "password"]:
            raise ValueError(
                "SECRET_KEY is too weak. Generate a secure key with: "
                "python -c 'import secrets; print(secrets.token_hex(32))'"
            )

        if len(cls.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")

        # Validate CORS origins in production
        if os.getenv("FLASK_ENV") == "production" and cls.FRONTEND_ORIGINS == "*":
            raise ValueError("FRONTEND_ORIGINS cannot be '*' in production")


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False
    SESSION_COOKIE_SECURE = False  # Allow HTTP in development


class ProductionConfig(Config):
    """Production configuration with enhanced security."""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True  # Require HTTPS
    SESSION_COOKIE_SAMESITE = "Strict"


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret-key-for-testing-only"
    WTF_CSRF_ENABLED = False  # Disable CSRF for testing


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}


def get_config(env=None):
    """Get configuration class based on environment."""
    if env is None:
        env = os.getenv("FLASK_ENV", "development")
    return config_by_name.get(env, DevelopmentConfig)