# smathur777.github.io

Cloudflare Worker setup for the global Snake leaderboard:

1. In Cloudflare, create a Worker from `cloudflare-worker/`.
2. Create a KV namespace:
   `npx wrangler kv namespace create SNAKE_LEADERBOARD`
3. Add the namespace ID to `cloudflare-worker/wrangler.toml`.
4. Deploy the Worker and copy its public leaderboard URL:
   `https://sameer-snake-leaderboard.your-subdomain.workers.dev/snake-leaderboard`
5. Paste that URL into `snake/config.js` as `window.SNAKE_LEADERBOARD_API_URL`.
6. Push the site again.
