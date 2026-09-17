"""
Database configuration.

Uses SQLite by default (zero-config, file-based -- perfect for free hosting
and local development). To use PostgreSQL instead (recommended for a real
production deployment, since most free hosts wipe local files on redeploy),
just set the DATABASE_URL environment variable, e.g.:

    DATABASE_URL=postgresql://user:password@host:5432/dbname
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civicmart.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
