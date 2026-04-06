import random
from pathlib import Path
import json
import requests


BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / "noun.json") as f:
    nounList = json.load(f)

with open(BASE_DIR / "adj.json") as f:
    adjList = json.load(f)


def generateSlug():
    adj1 = random.choice(adjList)
    adj2 = random.choice(adjList)
    noun = random.choice(nounList)
    return f"{adj1}-{adj2}-{noun}"


def validate_turnstile(token, secret, remoteip=None):
    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

    data = {"secret": secret, "response": token}

    if remoteip:
        data["remoteip"] = remoteip

    try:
        response = requests.post(url, data=data, timeout=10)
        response.raise_for_status()
        return True
    except requests.RequestException as e:
        print(f"Turnstile validation error: {e}")
        return False
