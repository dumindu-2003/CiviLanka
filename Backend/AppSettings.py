"""Web.config equivalent: connection string + app settings (read from environment / .env)."""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:  # python-dotenv is optional
    pass

DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_NAME = os.getenv("DB_NAME", "civil_registration_db")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

_auth = f"UID={DB_USER};PWD={DB_PASSWORD};" if DB_USER else "Trusted_Connection=yes;"

# MARS_Connection=yes  ==  MultipleActiveResultSets=true in the C# connection string
CONNECTION_STRING = (
    f"DRIVER={{{DB_DRIVER}}};SERVER={DB_SERVER};DATABASE={DB_NAME};{_auth}"
    "TrustServerCertificate=yes;MARS_Connection=yes;"
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]

# ---- profile photo upload -------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "Uploads")          # images are saved here (the folder is created automatically)
MAX_PHOTO_BYTES = 2 * 1024 * 1024                        # 2 MB - same limit as the SQL check constraint
