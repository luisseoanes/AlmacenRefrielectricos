from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os

# Default to local file, but allow override via environment variable for Railway Volumes
# Railway Volume Mount Path usually needs to be absolute
VOLUME_PATH = os.getenv("RAILWAY_VOLUME_MOUNT_PATH", ".")
DB_NAME = "refrielectricos.db"

# Construct the full path. If on Railway, it might be /app/data/refrielectricos.db
DB_URL_PATH = os.path.join(VOLUME_PATH, DB_NAME)

# Ensure the directory exists if it's not current directory
if VOLUME_PATH != "." and not os.path.exists(VOLUME_PATH):
    try:
        os.makedirs(VOLUME_PATH, exist_ok=True)
    except Exception as e:
        print(f"Warning: Could not create volume directory {VOLUME_PATH}: {e}")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_URL_PATH}"

print(f"Using Database at: {SQLALCHEMY_DATABASE_URL}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
