# Cloudflare Worker Setup

This worker exposes a global `snake-leaderboard` endpoint for the website.

## 1. Create the Worker

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

## 2. Create a KV namespace for Snake leaderboard

```bash
npx wrangler kv namespace create SNAKE_LEADERBOARD
```

Copy the namespace ID from the output and add it to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SNAKE_LEADERBOARD"
id = "<your-kv-namespace-id>"
```

## 3. Deploy

```bash
wrangler deploy
```

That will give you a URL like:

`https://sameer-snake-leaderboard.<your-subdomain>.workers.dev/snake-leaderboard`

## 4. Connect the website

For Snake, also set:

`snake/config.js`

```js
window.SNAKE_LEADERBOARD_API_URL = "https://sameer-snake-leaderboard.<your-subdomain>.workers.dev/snake-leaderboard";
```

Then push the site repo again.
