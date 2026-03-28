const FALLBACK_URL = "./current-track.json";
const POLL_INTERVAL_MS = 15000;
const apiUrl =
  window.CURRENTLY_PLAYING_API_URL && window.CURRENTLY_PLAYING_API_URL.trim()
    ? window.CURRENTLY_PLAYING_API_URL.trim()
    : FALLBACK_URL;

async function fetchCurrentTrack() {
  const response = await fetch(apiUrl, { cache: "no-store" });
  return response.json();
}

async function loadCurrentTrack() {
  const statusNode = document.getElementById("status");
  const trackNode = document.getElementById("track");
  const artistNode = document.getElementById("artist");
  const albumNode = document.getElementById("album");
  const updatedNode = document.getElementById("updated");
  const openLinkNode = document.getElementById("open-link");
  const artNode = document.getElementById("art");

  try {
    const data = await fetchCurrentTrack();

    trackNode.textContent = "";
    artistNode.textContent = "";
    albumNode.textContent = "";
    updatedNode.textContent = "";
    openLinkNode.textContent = "";
    artNode.hidden = true;

    if (!data.available) {
      statusNode.textContent = data.message || "Spotify data is unavailable right now.";
      return;
    }

    if (!data.track) {
      statusNode.textContent = data.message || "Nothing is playing right now.";
      if (data.updated_at) {
        updatedNode.textContent = `last checked: ${new Date(data.updated_at).toLocaleString()}`;
      }
      return;
    }

    statusNode.textContent = data.is_playing ? "playing now" : "last played";
    trackNode.textContent = `track: ${data.track.name}`;
    artistNode.textContent = `artist: ${data.track.artist}`;
    albumNode.textContent = `album: ${data.track.album}`;
    updatedNode.textContent = `updated: ${new Date(data.updated_at).toLocaleString()}`;

    if (data.track.url) {
      const link = document.createElement("a");
      link.href = data.track.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "open in spotify";
      openLinkNode.replaceChildren(link);
    }

    if (data.track.image) {
      artNode.src = data.track.image;
      artNode.hidden = false;
    }
  } catch (error) {
    statusNode.textContent = "Could not load Spotify status.";
  }
}

loadCurrentTrack();
setInterval(loadCurrentTrack, POLL_INTERVAL_MS);
