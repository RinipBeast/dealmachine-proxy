# DealMachine Scraper Proxy

This small server proxies requests to DealMachine's API so the Chrome extension can avoid CORS (the API blocks browser requests from `app.dealmachine.com` when credentials are used).

## Push this code to GitHub (one-time)

The code is already in a git repo with an initial commit. To put it on GitHub:

1. **Create a new repo on GitHub**
   - Go to [github.com/new](https://github.com/new).
   - Name it (e.g. `dealmachine-proxy`).
   - Leave it **empty** (no README, no .gitignore).
   - Create the repo.

2. **Push from your machine** (in a terminal):

   ```bash
   cd "/Users/rinip/Desktop/Dealmachine Scrapper/dealmachine-scraper/proxy-server"
   git remote add origin https://github.com/YOUR_USERNAME/dealmachine-proxy.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username (and `dealmachine-proxy` if you used a different repo name).

3. **In DigitalOcean** – when you connect a repository, choose this repo and set the **source directory** to the root (or leave blank). The app should detect `package.json` and use `npm start` to run the proxy.

## Deploy to DigitalOcean App Platform

1. **Create a new App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps) → Create App.

2. **Connect your repo or use "Create from GitHub"**
   - If you only have this folder, create a new GitHub repo, push the `proxy-server` contents (e.g. `server.js`, `package.json`), then connect that repo to the App.

3. **Configure the service**
   - **Source**: the repo and directory that contains `server.js` and `package.json`.
   - **Run Command**: `npm start` (or `node server.js`).
   - **HTTP Port**: set to `8080` (or leave default; the server reads `process.env.PORT`).

4. **Deploy**
   - After deploy, copy the app URL (e.g. `https://your-app-xxxxx.ondigitalocean.app`).

5. **Use in the extension**
   - Open the DM Scraper panel on DealMachine → paste the URL in **Proxy URL** (no trailing slash) → click **Save**.
   - Then click **Start Scraping**; lists and leads will load via the proxy.

## Run locally (optional)

```bash
cd proxy-server
npm install
npm start
```

Then in the extension set Proxy URL to `http://localhost:8080` (Chrome may require the extension to have access to localhost; you can add `http://localhost/*` to host_permissions if needed).

## Endpoints

- `GET /api/lists?token=xxx` — fetches lists from DealMachine (proxies `v2/update-list/`).
- `POST /api/leads` — body `{ token, listId?, begin, limit }` — fetches one page of leads (proxies `v2/leads/`).
- `GET /health` — returns `ok` for liveness checks.
