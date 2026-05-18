import os
import time
import queue
import threading
from datetime import date

import resend

from .db import get_connection

resend.api_key = os.getenv("RESEND_API_KEY")

FROM_EMAIL = "Hulak - MailMan <mailman@hulak.app>"
BASE_URL = "https://hulak.app"
API_BASE_URL = "https://api.hulak.app"

DAILY_LIMIT = 100
MONTHLY_LIMIT = 3000

_email_queue: queue.Queue = queue.Queue()
_lock = threading.Lock()


def _bootstrap_db() -> None:
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS email_send_log (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            day      TEXT NOT NULL,
            month    TEXT NOT NULL,
            sent_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS email_dead_letter (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            to_email   TEXT NOT NULL,
            subject    TEXT NOT NULL,
            html       TEXT NOT NULL,
            reason     TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            retried_at TEXT,
            retry_ok   INTEGER NOT NULL DEFAULT 0
        );
    """)
    conn.commit()
    conn.close()


_bootstrap_db()


def _counts() -> tuple[int, int]:
    today = date.today().isoformat()
    month = today[:7]
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM email_send_log WHERE day = ?", (today,))
    sent_today = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM email_send_log WHERE month = ?", (month,))
    sent_month = cur.fetchone()[0]
    conn.close()
    return sent_today, sent_month


def _can_send() -> tuple[bool, str | None]:
    sent_today, sent_month = _counts()
    if sent_today >= DAILY_LIMIT:
        return False, f"Daily limit reached ({DAILY_LIMIT}/day)"
    if sent_month >= MONTHLY_LIMIT:
        return False, f"Monthly limit reached ({MONTHLY_LIMIT}/month)"
    return True, None


def _record_sent() -> None:
    today = date.today().isoformat()
    conn = get_connection()
    conn.execute(
        "INSERT INTO email_send_log (day, month) VALUES (?, ?)",
        (today, today[:7]),
    )
    conn.commit()
    conn.close()


def _save_dead_letter(to: str, subject: str, html: str, reason: str) -> None:
    conn = get_connection()
    conn.execute(
        "INSERT INTO email_dead_letter (to_email, subject, html, reason) VALUES (?, ?, ?, ?)",
        (to, subject, html, reason),
    )
    conn.commit()
    conn.close()


def retry_dead_letters() -> dict:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, to_email, subject, html FROM email_dead_letter WHERE retry_ok = 0"
    ).fetchall()
    conn.close()

    attempted = sent = failed = 0

    for row in rows:
        attempted += 1
        with _lock:
            allowed, reason = _can_send()

        if not allowed:
            break

        try:
            resend.Emails.send({
                "from": FROM_EMAIL,
                "to": row["to_email"],
                "subject": row["subject"],
                "html": row["html"],
            })
            with _lock:
                _record_sent()

            conn = get_connection()
            conn.execute(
                "UPDATE email_dead_letter SET retry_ok = 1, retried_at = datetime('now') WHERE id = ?",
                (row["id"],),
            )
            conn.commit()
            conn.close()
            sent += 1
            time.sleep(0.25)

        except Exception as exc:
            print(f"[email_handler] dead-letter retry failed id={row['id']}: {exc}")
            failed += 1

    return {"attempted": attempted, "sent": sent, "failed": failed}


def _worker() -> None:
    while True:
        job = _email_queue.get()
        try:
            with _lock:
                allowed, reason = _can_send()

            if not allowed:
                _save_dead_letter(job["to"], job["subject"], job["html"], reason)
                continue

            resend.Emails.send({
                "from": FROM_EMAIL,
                "to": job["to"],
                "subject": job["subject"],
                "html": job["html"],
            })

            with _lock:
                _record_sent()

            time.sleep(0.25)

        except Exception as exc:
            _save_dead_letter(job["to"], job["subject"], job["html"], str(exc))

        finally:
            _email_queue.task_done()


threading.Thread(target=_worker, daemon=True).start()


def send_email(to: str, subject: str, html: str) -> None:
    _email_queue.put({"to": to, "subject": subject, "html": html})


def build_letter_email_html(
    sender: str,
    receiver: str,
    slug: str,
    ogp_image_url: str,
) -> str:
    link = f"{BASE_URL}/open/{slug}"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f2ede3;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2ede3;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdf7;border:1px solid #e2d9c5;border-radius:4px;overflow:hidden;">

          <tr>
            <td style="padding:36px 40px 28px;border-bottom:1px solid #ede5d0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-family:'Palatino Linotype',Palatino,Georgia,serif;font-size:22px;color:#2c2c2a;font-weight:bold;margin-bottom:6px;">
                      Someone wrote you a letter.
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a8957e;letter-spacing:0.08em;text-transform:uppercase;">
                      Hulak &nbsp;&middot;&nbsp; Private Letters
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <div style="font-family:'Palatino Linotype',Palatino,Georgia,serif;font-size:20px;color:#c8693a;opacity:0.6;letter-spacing:0.02em;">
                      &#2361;&#2369;&#2354;&#2366;&#2325;
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 40px;background:#faf6ee;border-bottom:1px solid #ede5d0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="45%">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#b5a48e;margin-bottom:5px;">From</div>
                    <div style="font-size:18px;color:#2c2c2a;font-weight:bold;">{sender}</div>
                  </td>
                  <td width="10%" align="center" style="color:#d4c8b4;font-size:20px;">&#8594;</td>
                  <td width="45%">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#b5a48e;margin-bottom:5px;">To</div>
                    <div style="font-size:18px;color:#2c2c2a;font-weight:bold;">{receiver}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="font-size:17px;line-height:1.9;color:#3a342a;margin:0 0 20px;">
                In a world of quick replies and vanishing stories,
                someone slowed down and wrote you a <em>letter</em>.
              </p>
              <p style="font-size:17px;line-height:1.9;color:#3a342a;margin:0 0 28px;">
                Not a message. Not a notification.<br/>
                A letter &mdash; chosen carefully, meant only for you.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                <tr>
                  <td style="border-left:3px solid #c8693a;background:#fdf5ee;padding:16px 20px;border-radius:0 3px 3px 0;">
                    <p style="font-size:15px;line-height:1.75;color:#5a4030;font-style:italic;margin:0;">
                      &ldquo;This letter is sealed and waiting &mdash; only you can open it.&rdquo;
                    </p>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td style="background:#2c2c2a;border-radius:3px;">
                    <a href="{link}" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#fffdf7;text-decoration:none;letter-spacing:0.03em;">
                      Open Your Letter &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#b0a088;margin:0;">
                Or copy this link:
                <a href="{link}" style="color:#c8693a;text-decoration:none;">{link}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border:1px solid #e2d9c5;border-radius:4px;overflow:hidden;line-height:0;">
                    <img src="{ogp_image_url}" width="520" style="width:100%;display:block;border-radius:3px;" alt="Letter preview" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#b5a48e;letter-spacing:0.05em;text-transform:uppercase;">
                    Letter preview
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px dashed #e2d9c5;"></td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60%" valign="middle">
                    <div style="font-family:'Palatino Linotype',Palatino,Georgia,serif;font-size:16px;color:#2c2c2a;margin-bottom:6px;font-weight:bold;">
                      Have something to say?
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9a8878;line-height:1.6;">
                      Write a letter of your own.<br/>Someone out there is waiting to hear from you.
                    </div>
                  </td>
                  <td width="40%" align="right" valign="middle">
                    <a href="{BASE_URL}" style="display:inline-block;padding:11px 20px;border:1.5px solid #c8693a;border-radius:3px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#c8693a;text-decoration:none;font-weight:bold;letter-spacing:0.02em;">
                      Write a Letter &#9998;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 40px;border-top:1px solid #ede5d0;background:#faf6ee;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family:'Palatino Linotype',Palatino,Georgia,serif;font-size:14px;color:#c8693a;">&#2361;&#2369;&#2354;&#2366;&#2325;</span>
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#b5a48e;margin-left:6px;">Hulak</span>
                  </td>
                  <td align="right">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#c5b9a8;">
                      Sent via mailman@hulak.app &nbsp;&middot;&nbsp; Do not reply
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""