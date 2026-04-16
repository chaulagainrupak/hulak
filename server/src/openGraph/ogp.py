import os
import asyncio
from playwright.async_api import async_playwright
from jinja2 import Template

# ─── Setup folders ───────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# ─── Theme definitions (mirrored 1:1 from TSX OCCASION_THEMES) ───────────────
THEMES = {
    "Just because": {
        "bg": "#FFFDF7",
        "border": "rgba(0,0,0,0.08)",
        "toColor": "#1a1608",   "toFont": "'Playfair Display', Georgia, serif",
        "fromColor": "#6b5e3a", "fromFont": "'EB Garamond', Georgia, serif",
        "labelColor": "#9c8a60",
        "tagColor": "#4a4520",  "tagBorder": "rgba(102,96,48,0.35)",
        "tagBg": "rgba(255,248,210,0.85)",
        "postmarkColor": "#6b7280",
        "bgIconColor": "#c8b87a",
        "bgIcon": "fa-feather-pointed",
        "layout": "flex-end",
        "stampAlign": "flex-start",
        "rightAccent": None,
        "decos": [
            {"cls": "fa-regular fa-star",         "top": "12%",  "right": "36%", "rot": -12, "sz": 3.8, "op": 0.18},
            {"cls": "fa-solid fa-feather-pointed", "bottom": "20%","right": "40%","rot":  20, "sz": 4.2, "op": 0.15},
            {"cls": "fa-regular fa-star",         "top": "52%",  "right": "28%", "rot":   5, "sz": 3.0, "op": 0.13},
            {"cls": "fa-regular fa-circle",       "top": "22%",  "right": "22%", "rot":   0, "sz": 2.5, "op": 0.10},
        ],
    },
    "Love letter": {
        "bg": "#FFF5F5",
        "border": "rgba(220,60,60,0.15)",
        "toColor": "#5a0a0a",   "toFont": "'Playfair Display', Georgia, serif",
        "fromColor": "#c0392b", "fromFont": "'Crimson Pro', Georgia, serif",
        "labelColor": "#e07070",
        "tagColor": "#7a0a0a",  "tagBorder": "rgba(192,57,43,0.4)",
        "tagBg": "rgba(255,220,220,0.85)",
        "postmarkColor": "#F45D52",
        "bgIconColor": "#f4a0a0",
        "bgIcon": "fa-heart",
        "layout": "center",
        "stampAlign": "flex-end",
        "rightAccent": "rgba(244,93,82,0.35)",
        "decos": [
            {"cls": "fa-solid fa-heart",   "top": "10%",    "right": "38%", "rot":  -8, "sz": 4.8, "op": 0.20},
            {"cls": "fa-regular fa-heart", "top": "48%",    "right": "44%", "rot":  15, "sz": 3.6, "op": 0.16},
            {"cls": "fa-solid fa-heart",   "bottom": "14%", "right": "34%", "rot":   5, "sz": 3.3, "op": 0.14},
            {"cls": "fa-regular fa-heart", "top": "28%",    "right": "20%", "rot": -15, "sz": 3.0, "op": 0.12},
        ],
    },
    "Confession": {
        "bg": "#F8F5FF",
        "border": "rgba(100,80,200,0.2)",
        "toColor": "#1a0f40",   "toFont": "'Libre Baskerville', Georgia, serif",
        "fromColor": "#534AB7", "fromFont": "'Spectral', Georgia, serif",
        "labelColor": "#8878cc",
        "tagColor": "#2d1f70",  "tagBorder": "rgba(82,56,170,0.4)",
        "tagBg": "rgba(220,210,255,0.85)",
        "postmarkColor": "#666CA3",
        "bgIconColor": "#9080e0",
        "bgIcon": "fa-lock",
        "layout": "flex-end",
        "stampAlign": "flex-start",
        "rightAccent": None,
        "decos": [
            {"cls": "fa-solid fa-lock", "top": "10%",    "right": "38%", "rot":  -5, "sz": 3.9, "op": 0.16},
            {"cls": "fa-solid fa-moon", "top": "45%",    "right": "42%", "rot":  12, "sz": 3.9, "op": 0.14},
            {"cls": "fa-solid fa-key",  "bottom": "18%", "right": "36%", "rot":  30, "sz": 4.2, "op": 0.14},
            {"cls": "fa-solid fa-eye",  "top": "24%",    "right": "22%", "rot":   0, "sz": 3.3, "op": 0.12},
        ],
    },
    "Surprise": {
        "bg": "#FFFBF0",
        "border": "rgba(210,140,0,0.22)",
        "toColor": "#2a1800",   "toFont": "'Playfair Display', Georgia, serif",
        "fromColor": "#92400e", "fromFont": "'EB Garamond', Georgia, serif",
        "labelColor": "#c07820",
        "tagColor": "#3d1f00",  "tagBorder": "rgba(180,100,0,0.35)",
        "tagBg": "rgba(255,235,160,0.88)",
        "postmarkColor": "#d97706",
        "bgIconColor": "#f5c842",
        "bgIcon": "fa-star",
        "layout": "flex-start",
        "stampAlign": "center",
        "rightAccent": "rgba(217,119,6,0.25)",
        "decos": [
            {"cls": "fa-solid fa-star",   "top": "8%",     "right": "42%", "rot":  15, "sz": 4.5, "op": 0.18},
            {"cls": "fa-solid fa-bolt",   "top": "42%",    "right": "36%", "rot": -10, "sz": 3.9, "op": 0.15},
            {"cls": "fa-solid fa-gift",   "bottom": "14%", "right": "40%", "rot":  -5, "sz": 4.2, "op": 0.15},
            {"cls": "fa-regular fa-star", "top": "22%",    "right": "22%", "rot":  35, "sz": 3.0, "op": 0.12},
        ],
    },
    "Miss you": {
        "bg": "#F5F0FF",
        "border": "rgba(110,60,220,0.15)",
        "toColor": "#1e0845",   "toFont": "'Playfair Display', Georgia, serif",
        "fromColor": "#6d28d9", "fromFont": "'Crimson Pro', Georgia, serif",
        "labelColor": "#9d7de8",
        "tagColor": "#2e0f6a",  "tagBorder": "rgba(109,40,217,0.35)",
        "tagBg": "rgba(220,205,255,0.85)",
        "postmarkColor": "#7c3aed",
        "bgIconColor": "#b09af0",
        "bgIcon": "fa-paper-plane",
        "layout": "center",
        "stampAlign": "flex-start",
        "rightAccent": "rgba(124,58,237,0.22)",
        "decos": [
            {"cls": "fa-solid fa-paper-plane", "top": "10%",    "right": "40%", "rot": -15, "sz": 4.2, "op": 0.17},
            {"cls": "fa-solid fa-cloud",        "top": "46%",    "right": "44%", "rot":   5, "sz": 3.9, "op": 0.14},
            {"cls": "fa-solid fa-paper-plane", "bottom": "16%", "right": "36%", "rot":  20, "sz": 3.3, "op": 0.13},
            {"cls": "fa-regular fa-star",       "top": "26%",    "right": "20%", "rot":  -5, "sz": 3.0, "op": 0.11},
        ],
    },
    "Thank you": {
        "bg": "#F0FDF4",
        "border": "rgba(20,160,80,0.18)",
        "toColor": "#052e16",   "toFont": "'Libre Baskerville', Georgia, serif",
        "fromColor": "#065f46", "fromFont": "'EB Garamond', Georgia, serif",
        "labelColor": "#34a86a",
        "tagColor": "#022c16",  "tagBorder": "rgba(5,120,64,0.38)",
        "tagBg": "rgba(200,248,225,0.85)",
        "postmarkColor": "#059669",
        "bgIconColor": "#6ee7b7",
        "bgIcon": "fa-dove",
        "layout": "flex-end",
        "stampAlign": "flex-end",
        "rightAccent": "rgba(5,150,105,0.2)",
        "decos": [
            {"cls": "fa-solid fa-leaf",     "top": "10%",    "right": "40%", "rot": -15, "sz": 4.2, "op": 0.17},
            {"cls": "fa-solid fa-seedling", "top": "46%",    "right": "36%", "rot":  10, "sz": 3.9, "op": 0.15},
            {"cls": "fa-solid fa-dove",     "bottom": "16%", "right": "42%", "rot":  -5, "sz": 4.2, "op": 0.14},
            {"cls": "fa-solid fa-leaf",     "top": "24%",    "right": "22%", "rot":  25, "sz": 3.0, "op": 0.12},
        ],
    },
    "Happy birthday": {
        "bg": "#FFF0F8",
        "border": "rgba(220,40,140,0.18)",
        "toColor": "#3d0024",   "toFont": "'Playfair Display', Georgia, serif",
        "fromColor": "#9d174d", "fromFont": "'Crimson Pro', Georgia, serif",
        "labelColor": "#e060a8",
        "tagColor": "#3d0024",  "tagBorder": "rgba(180,20,100,0.38)",
        "tagBg": "rgba(255,210,238,0.88)",
        "postmarkColor": "#db2777",
        "bgIconColor": "#f9a8d4",
        "bgIcon": "fa-cake-candles",
        "layout": "flex-start",
        "stampAlign": "flex-start",
        "rightAccent": "rgba(219,39,119,0.3)",
        "decos": [
            {"cls": "fa-solid fa-star",                "top": "8%",     "right": "44%", "rot":  15, "sz": 4.5, "op": 0.19},
            {"cls": "fa-solid fa-champagne-glasses",   "top": "44%",    "right": "38%", "rot":  -8, "sz": 4.5, "op": 0.16},
            {"cls": "fa-solid fa-certificate",         "bottom": "14%", "right": "42%", "rot":   5, "sz": 4.2, "op": 0.15},
            {"cls": "fa-solid fa-wand-magic-sparkles", "top": "24%",    "right": "22%", "rot":  20, "sz": 3.6, "op": 0.14},
        ],
    },
    "Congratulations": {
        "bg": "#FEFCE8",
        "border": "rgba(180,130,0,0.22)",
        "toColor": "#1c1000",   "toFont": "'Libre Baskerville', Georgia, serif",
        "fromColor": "#78350f", "fromFont": "'EB Garamond', Georgia, serif",
        "labelColor": "#c08820",
        "tagColor": "#1c1000",  "tagBorder": "rgba(160,110,0,0.38)",
        "tagBg": "rgba(255,240,160,0.88)",
        "postmarkColor": "#ca8a04",
        "bgIconColor": "#fde68a",
        "bgIcon": "fa-trophy",
        "layout": "center",
        "stampAlign": "center",
        "rightAccent": "rgba(202,138,4,0.28)",
        "decos": [
            {"cls": "fa-solid fa-champagne-glasses",   "top": "10%",    "right": "42%", "rot":  -5, "sz": 4.8, "op": 0.18},
            {"cls": "fa-solid fa-medal",               "top": "46%",    "right": "36%", "rot":  10, "sz": 4.2, "op": 0.15},
            {"cls": "fa-solid fa-star",                "bottom": "14%", "right": "40%", "rot": -18, "sz": 3.9, "op": 0.14},
            {"cls": "fa-solid fa-wand-magic-sparkles", "top": "26%",    "right": "20%", "rot":  20, "sz": 3.6, "op": 0.13},
        ],
    },
    "Apology": {
        "bg": "#F8FAFC",
        "border": "rgba(80,100,130,0.15)",
        "toColor": "#0f172a",   "toFont": "'Libre Baskerville', Georgia, serif",
        "fromColor": "#334155", "fromFont": "'Crimson Pro', Georgia, serif",
        "labelColor": "#7a90aa",
        "tagColor": "#0f172a",  "tagBorder": "rgba(60,80,110,0.3)",
        "tagBg": "rgba(210,220,240,0.82)",
        "postmarkColor": "#475569",
        "bgIconColor": "#94a3b8",
        "bgIcon": "fa-dove",
        "layout": "flex-end",
        "stampAlign": "flex-start",
        "rightAccent": None,
        "decos": [
            {"cls": "fa-solid fa-dove",    "top": "10%",    "right": "40%", "rot":  -5, "sz": 4.2, "op": 0.15},
            {"cls": "fa-regular fa-circle","top": "48%",    "right": "42%", "rot":   0, "sz": 3.3, "op": 0.12},
            {"cls": "fa-solid fa-dove",    "bottom": "18%", "right": "38%", "rot":   8, "sz": 3.6, "op": 0.12},
            {"cls": "fa-regular fa-circle","top": "28%",    "right": "22%", "rot":   0, "sz": 2.5, "op": 0.09},
        ],
    },
    "Good luck": {
        "bg": "#F0FDFA",
        "border": "rgba(10,160,140,0.18)",
        "toColor": "#022c22",   "toFont": "'Playfair Display', Georgia, serif",
        "fromColor": "#134e4a", "fromFont": "'EB Garamond', Georgia, serif",
        "labelColor": "#2aa88a",
        "tagColor": "#022c22",  "tagBorder": "rgba(10,140,120,0.38)",
        "tagBg": "rgba(190,248,235,0.85)",
        "postmarkColor": "#0d9488",
        "bgIconColor": "#5eead4",
        "bgIcon": "fa-spa",
        "layout": "flex-start",
        "stampAlign": "flex-end",
        "rightAccent": "rgba(13,148,136,0.2)",
        "decos": [
            {"cls": "fa-solid fa-spa",    "top": "10%",    "right": "40%", "rot": -10, "sz": 4.2, "op": 0.17},
            {"cls": "fa-regular fa-star", "top": "46%",    "right": "36%", "rot":  15, "sz": 3.6, "op": 0.14},
            {"cls": "fa-solid fa-spa",    "bottom": "16%", "right": "44%", "rot":  20, "sz": 3.3, "op": 0.13},
            {"cls": "fa-solid fa-star",   "top": "26%",    "right": "20%", "rot":  -5, "sz": 3.0, "op": 0.12},
        ],
    },
}

DEFAULT_OCCASION = "Just because"

# ─── HTML Template ────────────────────────────────────────────────────────────
# Rendered at exactly 1200×630. Font Awesome loaded from CDN.
# All sizes are expressed as % of card width (1160px after padding).
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=EB+Garamond:ital,wght@0,600;1,600&family=Spectral:wght@600&family=Crimson+Pro:ital,wght@1,600&family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width: 1200px; height: 630px;
  display: flex; align-items: center; justify-content: center;
  background: #e5e7eb;
  overflow: hidden;
}
.outline {
  width: 1200px; height: 630px;
  padding: 20px;
  background: repeating-linear-gradient(
    135deg,
    #F45D52 0px, #F45D52 10px,
    #FEE4C2 10px, #FEE4C2 20px,
    #666CA3 20px, #666CA3 30px
  );
  border-radius: 14px;
}
.card {
  width: 100%; height: 100%;
  background: {{ bg }};
  border: 2px solid {{ border }};
  border-radius: 9px;
  position: relative;
  overflow: hidden;
  display: flex;
}
/* watermark */
.bg-icon {
  position: absolute;
  right: -2%; bottom: -8%;
  font-size: 232px;
  color: {{ bgIconColor }};
  opacity: 0.18;
  line-height: 1;
  z-index: 0;
  pointer-events: none;
}
/* right accent stripe */
.right-accent {
  position: absolute;
  top: 10%; right: 0;
  width: {{ accentWidth }}px; height: 80%;
  border-radius: 2px 0 0 2px;
  background: {{ rightAccent }};
  z-index: 4;
}
/* scattered deco icons */
{% for d in decos %}
.deco-{{ loop.index }} {
  position: absolute;
  {% if d.top is defined %}top: {{ d.top }};{% endif %}
  {% if d.bottom is defined %}bottom: {{ d.bottom }};{% endif %}
  {% if d.right is defined %}right: {{ d.right }};{% endif %}
  {% if d.left is defined %}left: {{ d.left }};{% endif %}
  font-size: {{ (1160 * d.sz / 100) | round(1) }}px;
  color: {{ bgIconColor }};
  opacity: {{ d.op }};
  transform: rotate({{ d.rot }}deg);
  line-height: 1;
  z-index: 2;
  pointer-events: none;
}
{% endfor %}
/* layout */
.content {
  position: relative;
  z-index: 3;
  display: flex;
  width: 100%; height: 100%;
  padding: 46px;
  gap: 29px;
}
.address {
  flex: 1;
  min-width: 0;
  border-right: 1px solid {{ border }};
  padding-right: 29px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: {{ layout }};
}
.micro {
  display: flex;
  align-items: center;
  gap: 7px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.16em;
  font-family: 'Spectral', Georgia, serif;
  font-size: 22px;
  color: {{ labelColor }};
  margin-bottom: 4px;
  white-space: nowrap;
}
.micro.muted { opacity: 0.75; }
.receiver {
  font-family: {{ toFont }};
  color: {{ toColor }};
  font-weight: 700;
  font-size: 93px;
  line-height: 1;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}
.sender {
  font-family: {{ fromFont }};
  color: {{ fromColor }};
  font-weight: 600;
  font-style: italic;
  font-size: 51px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 16px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1.5px solid {{ tagBorder }};
  background: {{ tagBg }};
  color: {{ tagColor }};
  font-family: 'Spectral', Georgia, serif;
  font-weight: 600;
  font-size: 21px;
  letter-spacing: 0.10em;
  padding: 8px 17px;
  white-space: nowrap;
  width: fit-content;
}
/* stamp */
.stamp-col {
  flex-shrink: 0;
  width: 116px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: {{ stampAlign }};
}
.stamp {
  position: relative;
  width: 116px; height: 157px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 2px solid {{ tagBorder }};
  background: {{ tagBg }};
}
.stamp-inner {
  position: absolute;
  inset: 3px;
  border-radius: 4px;
  border: 1px dashed {{ tagColor }};
  opacity: 0.38;
  pointer-events: none;
}
.stamp-icon {
  color: {{ tagColor }};
  font-size: 49px;
  opacity: 0.7;
}
.stamp-label {
  color: {{ tagColor }};
  font-family: 'Spectral', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.50;
  margin-top: 6px;
  text-align: center;
}
/* postmark */
.postmark {
  position: absolute;
  top: 50%; left: 68%;
  transform: translate(-50%, -50%);
  z-index: 3;
  color: {{ postmarkColor }};
  opacity: 0.15;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.postmark-ring {
  width: 81px; height: 81px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 3px solid currentColor;
}
.postmark-text {
  font-family: 'Spectral', Georgia, serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  line-height: 1.3;
  text-align: center;
  font-size: 15px;
}
</style>
</head>
<body>
<div class="outline">
  <div class="card">

    <!-- watermark -->
    <div class="bg-icon"><i class="fa-solid {{ bgIcon }}"></i></div>

    <!-- right accent (only if defined) -->
    {% if rightAccent %}
    <div class="right-accent"></div>
    {% endif %}

    <!-- scattered deco icons -->
    {% for d in decos %}
    <div class="deco-{{ loop.index }}"><i class="{{ d.cls }}"></i></div>
    {% endfor %}

    <!-- main content -->
    <div class="content">

      <!-- address column -->
      <div class="address">

        <!-- TO -->
        <div style="margin-bottom:6px">
          <div class="micro">
            <i class="fa-solid fa-envelope" style="font-size:18px"></i>to
          </div>
          <div class="receiver">{{ receiver }}</div>
        </div>

        <!-- FROM -->
        <div style="margin-bottom:16px">
          <div class="micro muted">
            <i class="fa-solid fa-pen-nib" style="font-size:18px"></i>from
          </div>
          <div class="sender">{{ sender }}</div>
        </div>

        <!-- occasion pill -->
        <div class="pill">
          <i class="fa-solid {{ bgIcon }}" style="font-size:18px"></i>
          {{ occasion }}
        </div>

      </div>

      <!-- stamp column -->
      <div class="stamp-col">
        <div class="stamp">
          <div class="stamp-inner"></div>
          <i class="fa-solid {{ bgIcon }} stamp-icon"></i>
          <div class="stamp-label">{{ occasion.split(' ')[0] }}</div>
        </div>
      </div>

    </div>

    <!-- postmark -->
    <div class="postmark">
      <div class="postmark-ring">
        <div class="postmark-text">हुलाक<br>POST</div>
      </div>
    </div>

  </div>
</div>
</body>
</html>"""

_template = Template(HTML_TEMPLATE)


def build_html(sender: str, receiver: str, occasion: str) -> str:
    t = THEMES.get(occasion, THEMES[DEFAULT_OCCASION])

    # deco position dicts — Jinja needs keys without Python's .get() style
    decos_clean = []
    for d in t["decos"]:
        entry = {"cls": d["cls"], "rot": d["rot"], "sz": d["sz"], "op": d["op"]}
        if "top"    in d: entry["top"]    = d["top"]
        if "bottom" in d: entry["bottom"] = d["bottom"]
        if "right"  in d: entry["right"]  = d["right"]
        if "left"   in d: entry["left"]   = d["left"]
        decos_clean.append(entry)

    return _template.render(
        sender=sender or "John Doe",
        receiver=receiver or "Jane Doe",
        occasion=occasion,
        bg=t["bg"],
        border=t["border"],
        toColor=t["toColor"],
        toFont=t["toFont"],
        fromColor=t["fromColor"],
        fromFont=t["fromFont"],
        labelColor=t["labelColor"],
        tagColor=t["tagColor"],
        tagBorder=t["tagBorder"],
        tagBg=t["tagBg"],
        postmarkColor=t["postmarkColor"],
        bgIconColor=t["bgIconColor"],
        bgIcon=t["bgIcon"],
        layout=t["layout"],
        stampAlign=t["stampAlign"],
        rightAccent=t.get("rightAccent") or "",
        accentWidth=max(2, int(1160 * 0.004)),
        decos=decos_clean,
    )


# ─── Playwright helpers ───────────────────────────────────────────────────────
browser = None
playwright_instance = None


async def init_browser():
    global browser, playwright_instance
    if browser:
        return
    playwright_instance = await async_playwright().start()
    browser = await playwright_instance.chromium.launch(
        headless=True, args=["--no-sandbox"]
    )


async def generateOpenGraphImage(
    slug: str,
    sender: str,
    receiver: str,
    occasion: str,
) -> str:
    await init_browser()
    html = build_html(sender, receiver, occasion)
    output_path = os.path.join(IMAGES_DIR, f"{slug}.png")

    page = await browser.new_page()
    await page.set_viewport_size({"width": 1200, "height": 630})
    await page.set_content(html, wait_until="networkidle")
    # wait a tick for web fonts to render
    await page.wait_for_timeout(800)
    await page.screenshot(path=output_path, clip={"x": 0, "y": 0, "width": 1200, "height": 630})
    await page.close()
    print(f"Saved OGP → {output_path}")
    return output_path


# # ─── Example usage ────────────────────────────────────────────────────────────
# if __name__ == "__main__":
#     import sys

#     # python ogp_generator.py [slug] [sender] [receiver] [occasion]
#     slug     = sys.argv[1] if len(sys.argv) > 1 else "test"
#     sender   = sys.argv[2] if len(sys.argv) > 2 else "Alice"
#     receiver = sys.argv[3] if len(sys.argv) > 3 else "Bob"
#     occasion = sys.argv[4] if len(sys.argv) > 4 else "Love letter"

#     asyncio.run(generateOpenGraphImage(slug, sender, receiver, occasion))

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, JSONResponse

ogpRouter = APIRouter()

@ogpRouter.get("/ogp/{slug}")
async def return_ogp_image(slug: str, request: Request):
    output_path = os.path.join(IMAGES_DIR, f"{slug}.png")
    
    # If image already exists (cached), serve it directly
    if os.path.exists(output_path):
        return FileResponse(output_path, media_type="image/png")
    
    return JSONResponse({"error": "Image not found"}, status_code=404)