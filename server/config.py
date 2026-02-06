import os
import secrets
import requests

from dotenv import load_dotenv



load_dotenv()


class Config:
    """Base configuration class with security validations."""

   

   
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://localhost/agrilink"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    
    
    SECRET_KEY = os.getenv("SECRET_KEY")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "true").lower() == "true"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours

   
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours

   
    FRONTEND_ORIGINS = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    )

    
    
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
            if os.getenv("FLASK_ENV") in ["development", "testing"] or os.getenv("FLASK_DEBUG") == "true":
                cls.SECRET_KEY = secrets.token_hex(32)
                print("WARNING: Using auto-generated SECRET_KEY for development. Set SECRET_KEY in production!")
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
            raise ValueError("NEWSAPI_KEY is required in production")


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False
    SESSION_COOKIE_SECURE = False  


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True  
    SESSION_COOKIE_SECURE = True  
    SESSION_COOKIE_SAMESITE = "Strict"


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret-key-for-testing-only"
    WTF_CSRF_ENABLED = False  

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

