from fastapi import APIRouter, Request
from ..db import get_connection
from ..utils import generateSlug
import json
import re

from ..openGraph import generateOpenGraphImage
from ..utils import validate_turnstile

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

TURNSTILE_SECRET = os.getenv("TURNSTILE_TOKEN")

letterRouter = APIRouter()


def slug_exists(slug: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT 1 FROM letters WHERE slug = ?", (slug,))

    exists = cursor.fetchone() is not None
    conn.close()

    return exists


def get_unique_slug():
    while True:
        slug = generateSlug()

        if not slug_exists(slug):
            return slug


def is_valid_slug(slug: str):
    return re.match(r"^[a-z0-9-]{3,50}$", slug)


def get_slug_for_content(content_json):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT slug FROM letters WHERE content = ?", (json.dumps(content_json),)
    )

    row = cursor.fetchone()
    conn.close()

    return row["slug"] if row else None


@letterRouter.get("/letter/{slug}")
def get_letter(slug: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM letters WHERE slug = ?", (slug,))

    letter = cursor.fetchone()
    conn.close()

    if not letter:
        return {"error": "This is not a valid letter, please try again"}

    return {"letter": dict(letter)}


@letterRouter.post("/letter")
async def create_letter(request: Request):

    data = await request.json()

    token = data.get("turnstileToken")
    custom_slug = data.get("slug")
    content = data.get("content")

    if not validate_turnstile(token, TURNSTILE_SECRET, None):
        return {"error": "Captcha verification failed"}

    existing_slug = get_slug_for_content(content)

    if existing_slug:
        return {"slug": existing_slug, "message": "Letter already exists"}

    if custom_slug:
        custom_slug = custom_slug.strip().lower()

        if not is_valid_slug(custom_slug):
            return {"error": "Invalid slug format"}

        if slug_exists(custom_slug):
            return {"error": "Slug already taken"}

        slug = custom_slug

    else:
        slug = get_unique_slug()

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO letters (
            slug,
            content,
            sender_name,
            sender_email,
            receiver_name,
            receiver_email,
            occasion,
            custom_occasion_label,
            stamp_url,
            stamp_label,
            notify_receiver,
            join_mailing_list
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            slug,
            json.dumps(content),
            data.get("sender_name"),
            data.get("sender_email"),
            data.get("receiver_name"),
            data.get("receiver_email"),
            data.get("occasion"),
            data.get("custom_occasion_label", ""),
            data.get("stamp_url"),
            data.get("stamp_label"),
            int(data.get("notify_receiver", 0)),
            int(data.get("join_mailing_list", 0)),
        ),
    )

    conn.commit()
    conn.close()

    await generateOpenGraphImage(
        slug, data.get("sender_name"), data.get("receiver_name"), data.get("occasion")
    )

    return {"slug": slug, "message": "Letter saved successfully"}
