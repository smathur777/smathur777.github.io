# Cloudflare Worker Setup

This worker exposes a public `current-track` endpoint for the website, plus a global `snake-leaderboard` endpoint.

## 1. Recreate your Spotify refresh token

Use Spotify scopes:

`user-read-currently-playing user-read-recently-played`

You need the second scope so the worker can show the last played song when nothing is actively playing.

## 2. Create the Worker

From this folder:

```bash
npm create cloudflare@latest .
```

If you do not want to scaffold over this folder, you can also install Wrangler separately and deploy from here:

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

Use the existing `wrangler.toml` and `src/index.js` in this directory.

## 3. Create a KV namespace for Snake leaderboard

```bash
npx wrangler kv namespace create SNAKE_LEADERBOARD
```

Copy the namespace ID from the output and add it to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SNAKE_LEADERBOARD"
id = "<your-kv-namespace-id>"
```

## 4. Set Worker secrets

```bash
wrangler secret put SPOTIFY_CLIENT_ID
wrangler secret put SPOTIFY_CLIENT_SECRET
wrangler secret put SPOTIFY_REFRESH_TOKEN
```

## 5. Deploy

```bash
wrangler deploy
```

That will give you a URL like:

`https://sameer-currently-playing.<your-subdomain>.workers.dev/current-track`

The same worker will also expose:

`https://sameer-currently-playing.<your-subdomain>.workers.dev/snake-leaderboard`

## 6. Connect the website

Paste that URL into:

`currently-playing/config.js`

as:

```js
window.CURRENTLY_PLAYING_API_URL = "https://sameer-currently-playing.<your-subdomain>.workers.dev/current-track";
```

Then push the site repo again.

For Snake, also set:

`snake/config.js`

```js
window.SNAKE_LEADERBOARD_API_URL = "https://sameer-currently-playing.<your-subdomain>.workers.dev/snake-leaderboard";
```
