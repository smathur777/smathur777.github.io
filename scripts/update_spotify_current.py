import base64
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


OUTPUT_PATH = Path("currently-playing/current-track.json")
TOKEN_URL = "https://accounts.spotify.com/api/token"
CURRENTLY_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing"


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_payload(payload: dict) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def build_basic_auth(client_id: str, client_secret: str) -> str:
    token = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
    return f"Basic {token}"


def fetch_access_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    body = urllib.parse.urlencode(
        {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        TOKEN_URL,
        data=body,
        headers={
            "Authorization": build_basic_auth(client_id, client_secret),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(request) as response:
        payload = json.load(response)
    return payload["access_token"]


def fetch_current_track(access_token: str) -> dict:
    request = urllib.request.Request(
        CURRENTLY_PLAYING_URL,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        with urllib.request.urlopen(request) as response:
            if response.status == 204:
                return {"status": 204}
            return {"status": response.status, "data": json.load(response)}
    except urllib.error.HTTPError as error:
        if error.code == 204:
            return {"status": 204}
        raise


def extract_payload(api_payload: dict) -> dict:
    item = api_payload.get("item") or {}
    album = item.get("album") or {}
    artists = item.get("artists") or []
    images = album.get("images") or []
    return {
        "is_playing": bool(api_payload.get("is_playing")),
        "available": True,
        "message": "Currently playing on Spotify.",
        "updated_at": iso_now(),
        "track": {
            "name": item.get("name"),
            "artist": ", ".join(artist.get("name", "") for artist in artists if artist.get("name")),
            "album": album.get("name"),
            "image": images[0]["url"] if images else None,
            "url": (item.get("external_urls") or {}).get("spotify"),
        },
    }


def main() -> None:
    client_id = os.environ.get("SPOTIFY_CLIENT_ID")
    client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
    refresh_token = os.environ.get("SPOTIFY_REFRESH_TOKEN")

    if not client_id or not client_secret or not refresh_token:
        write_payload(
            {
                "is_playing": False,
                "available": False,
                "message": "Spotify secrets are not configured yet.",
                "updated_at": iso_now(),
                "track": None,
            }
        )
        return

    try:
        access_token = fetch_access_token(client_id, client_secret, refresh_token)
        current = fetch_current_track(access_token)
        if current["status"] == 204:
            write_payload(
                {
                    "is_playing": False,
                    "available": True,
                    "message": "Nothing is playing right now.",
                    "updated_at": iso_now(),
                    "track": None,
                }
            )
            return

        write_payload(extract_payload(current["data"]))
    except Exception as exc:  # noqa: BLE001
        write_payload(
            {
                "is_playing": False,
                "available": False,
                "message": f"Spotify update failed: {type(exc).__name__}",
                "updated_at": iso_now(),
                "track": None,
            }
        )
        raise


if __name__ == "__main__":
    main()
