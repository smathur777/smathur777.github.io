import { handleLeaderboard } from "./leaderboard";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const CURRENTLY_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "cache-control": "no-store",
    },
  });
}

function isoNow() {
  return new Date().toISOString();
}

async function getAccessToken(env) {
  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: env.SPOTIFY_REFRESH_TOKEN,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`spotify_token_${response.status}`);
  }

  const payload = await response.json();
  return payload.access_token;
}

function buildTrackPayload(item, isPlaying, message) {
  if (!item) {
    return {
      is_playing: isPlaying,
      available: true,
      message,
      updated_at: isoNow(),
      track: null,
    };
  }

  const album = item.album || {};
  const artists = Array.isArray(item.artists) ? item.artists : [];
  const images = Array.isArray(album.images) ? album.images : [];

  return {
    is_playing: isPlaying,
    available: true,
    message,
    updated_at: isoNow(),
    track: {
      name: item.name || null,
      artist: artists.map((artist) => artist.name).filter(Boolean).join(", "),
      album: album.name || null,
      image: images[0]?.url || null,
      url: item.external_urls?.spotify || null,
    },
  };
}

async function fetchCurrent(accessToken) {
  const response = await fetch(CURRENTLY_PLAYING_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`spotify_current_${response.status}`);
  }

  return response.json();
}

async function fetchRecent(accessToken) {
  const response = await fetch(RECENTLY_PLAYED_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`spotify_recent_${response.status}`);
  }

  const payload = await response.json();
  return payload.items?.[0]?.track || null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return jsonResponse({}, 204);
    }

    const url = new URL(request.url);
    if (url.pathname === "/snake-leaderboard") {
      return handleLeaderboard(request, env);
    }

    if (url.pathname !== "/" && url.pathname !== "/current-track") {
      return jsonResponse({ error: "Not found" }, 404);
    }

    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
      return jsonResponse({
        is_playing: false,
        available: false,
        message: "Worker secrets are not configured yet.",
        updated_at: isoNow(),
        track: null,
      });
    }

    try {
      const accessToken = await getAccessToken(env);
      const current = await fetchCurrent(accessToken);

      if (current?.item) {
        return jsonResponse(
          buildTrackPayload(current.item, Boolean(current.is_playing), "Currently playing on Spotify."),
        );
      }

      const recentTrack = await fetchRecent(accessToken);
      return jsonResponse(
        buildTrackPayload(recentTrack, false, recentTrack ? "Last played on Spotify." : "Nothing available right now."),
      );
    } catch (error) {
      return jsonResponse(
        {
          is_playing: false,
          available: false,
          message: "Worker could not reach Spotify.",
          updated_at: isoNow(),
          track: null,
        },
        500,
      );
    }
  },
};
