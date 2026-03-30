import { handleLeaderboard } from "./leaderboard";

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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return jsonResponse({}, 204);
    }

    const url = new URL(request.url);
    if (url.pathname === "/snake-leaderboard") {
      return handleLeaderboard(request, env);
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
