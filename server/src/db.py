import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "hulak.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS letters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE,
            content TEXT,
            sender_name TEXT,
            sender_email TEXT,
            receiver_name TEXT,
            receiver_email TEXT,
            occasion TEXT,
            custom_occasion_label TEXT,
            stamp_url TEXT,
            stamp_label TEXT,
            notify_receiver INTEGER DEFAULT 0,
            join_mailing_list INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()