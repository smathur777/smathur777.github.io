const LEADERBOARD_KEY = "snake_leaderboard";
const LEADERBOARD_LIMIT = 25;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "cache-control": "no-store",
    },
  });
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 16);
}

function normalizeEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .filter(
      (entry) =>
        typeof entry?.name === "string" &&
        entry.name.trim() &&
        Number.isFinite(entry?.score) &&
        entry.score > 0,
    )
    .map((entry) => ({
      name: normalizeName(entry.name),
      score: Math.floor(entry.score),
      time: typeof entry.time === "string" ? entry.time : new Date().toISOString(),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.time).getTime() - new Date(a.time).getTime(),
    )
    .slice(0, LEADERBOARD_LIMIT);
}

async function readLeaderboard(env) {
  const raw = await env.SNAKE_LEADERBOARD.get(LEADERBOARD_KEY, "json");
  return normalizeEntries(raw || []);
}

async function writeLeaderboard(env, entries) {
  const normalized = normalizeEntries(entries);
  await env.SNAKE_LEADERBOARD.put(LEADERBOARD_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function handleLeaderboard(request, env) {
  if (!env.SNAKE_LEADERBOARD) {
    return jsonResponse({ error: "KV binding missing." }, 500);
  }

  if (request.method === "OPTIONS") {
    return jsonResponse({}, 204);
  }

  if (request.method === "GET") {
    const entries = await readLeaderboard(env);
    return jsonResponse({ entries });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON." }, 400);
  }

  const name = normalizeName(typeof payload?.name === "string" ? payload.name : "");
  const score = Number(payload?.score);

  if (!name) {
    return jsonResponse({ error: "Name is required." }, 400);
  }
  if (!Number.isFinite(score) || score <= 0) {
    return jsonResponse({ error: "Score must be a positive number." }, 400);
  }

  const entries = await readLeaderboard(env);
  entries.push({
    name,
    score: Math.floor(score),
    time: new Date().toISOString(),
  });
  const updated = await writeLeaderboard(env, entries);
  return jsonResponse({ entries: updated });
}
