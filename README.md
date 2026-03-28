# smathur777.github.io

Spotify setup for `currently playing`:

Fast live setup with Cloudflare Workers:

1. In your Spotify app, add redirect URI `http://127.0.0.1:8888/callback`.
2. Re-authorize Spotify with these scopes:
   `user-read-currently-playing user-read-recently-played`
3. In Cloudflare, create a Worker from `cloudflare-worker/`.
4. In the Worker, set secrets:
   `SPOTIFY_CLIENT_ID`
   `SPOTIFY_CLIENT_SECRET`
   `SPOTIFY_REFRESH_TOKEN`
5. Deploy the Worker and copy its public URL, for example:
   `https://sameer-currently-playing.your-subdomain.workers.dev/current-track`
6. Paste that URL into `currently-playing/config.js` as `window.CURRENTLY_PLAYING_API_URL`.
7. Push the site so the page polls the Worker every 15 seconds.

GitHub Actions fallback:

1. Create a Spotify app and enable the `user-read-currently-playing` scope.
2. Add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` as GitHub repository secrets.
3. Run the `Update Currently Playing` GitHub Actions workflow once manually or wait for the 5-minute schedule.
my website or whatever
