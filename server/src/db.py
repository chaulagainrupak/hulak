import sqlite3
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = "/data/hulak.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS stamps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT UNIQUE NOT NULL,
            image_url TEXT NOT NULL,
            category TEXT,
            description TEXT,
            author TEXT,
            author_source_link TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_stamps_category
        ON stamps(category)
    """
    )

    cursor.execute(
        """
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
            stamp_id INTEGER,
            notify_receiver INTEGER DEFAULT 0,
            join_mailing_list INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (stamp_id)
            REFERENCES stamps(id)
            ON DELETE SET NULL
        )
    """
    )

    conn.commit()
    conn.close()


init_db()


def insert_stamp(
    label,
    image_url,
    category=None,
    description=None,
    author=None,
    author_source_link=None,
):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO stamps (
                label,
                image_url,
                category,
                description,
                author,
                author_source_link
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (label, image_url, category, description, author, author_source_link),
        )

        conn.commit()

    except sqlite3.IntegrityError:
        pass

    conn.close()


def ask(prompt, required=True, default=None):
    while True:
        val = input(f"{prompt}" + (f" [{default}]" if default else "") + ": ").strip()

        if not val and default is not None:
            return default

        if val:
            return val

        if not required:
            return None

        print("❌ This field is required.")


def interactive_insert_stamps():
    while True:
        print("\n🧷 Add New Stamp")
        print("-" * 30)

        label = ask("Label (unique)")
        image_url = ask("Image URL")
        category = ask("Category (optional)", required=False)
        description = ask("Description (optional)", required=False)
        author = ask("Author (optional)", required=False)
        author_source_link = ask("Author source link (optional)", required=False)

        print("\n📦 Preview:")
        print(f"Label: {label}")
        print(f"Image: {image_url}")
        print(f"Category: {category}")
        print(f"Author: {author}")

        confirm = input("\nSave this stamp? (y/n): ").strip().lower()
        if confirm == "y":
            insert_stamp(
                label,
                image_url,
                category,
                description,
                author,
                author_source_link,
            )
            print("✅ Saved!")

        cont = input("\nAdd another? (y/n): ").strip().lower()
        if cont != "y":
            break


def get_stamps_dict_by_id():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM stamps
        WHERE is_active = 1
        ORDER BY id
    """
    )

    rows = cursor.fetchall()
    conn.close()

    result = {}

    for row in rows:
        r = dict(row)

        result[str(r["id"])] = {
            "id": r["id"],
            "label": r["label"],
            "image_url": r["image_url"],
            "category": r["category"],
            "description": r["description"],
            "author": r["author"],
            "author_source_link": r["author_source_link"],
        }

    return result


def get_stamps_json_dict():
    return json.dumps(get_stamps_dict_by_id(), ensure_ascii=False, indent=2)


def get_stamps_json_list():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM stamps
        WHERE is_active = 1
        ORDER BY id
    """
    )

    rows = cursor.fetchall()
    conn.close()

    result = []

    for r in rows:
        r = dict(r)

        result.append(
            {
                "id": r["id"],
                "label": r["label"],
                "image_url": r["image_url"],
                "category": r["category"],
                "description": r["description"],
                "author": r["author"],
                "author_source_link": r["author_source_link"],
            }
        )

    return json.dumps(result, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    cmd = input("Run stamp inserter? (y/n): ").strip().lower()

    if cmd == "y":
        interactive_insert_stamps()
    else:
        print("Exiting...")