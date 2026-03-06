/**
 * DealMachine Scraper Proxy
 * Proxies requests to api.dealmachine.com so the Chrome extension can avoid CORS.
 * Deploy to DigitalOcean App Platform (or any Node host) and set that URL in the extension.
 */

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 8080;

const app = express();

// Allow extension (and app.dealmachine.com page) to call this proxy
app.use(cors({
  origin: true, // reflect request origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '2mb' }));

const DM_API = 'https://api.dealmachine.com';

/**
 * GET /api/lists?token=xxx
 * Proxies to DealMachine v2/update-list/ (and falls back to v2/lists/ if needed).
 */
app.get('/api/lists', async (req, res) => {
  const token = (req.query.token || '').trim();
  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }
  try {
    let url = `${DM_API}/v2/update-list/?token=${encodeURIComponent(token)}&limit=500`;
    let r = await fetch(url, { method: 'GET' });
    let data = await r.json().catch(() => ({}));
    if (!r.ok && r.status === 404) {
      url = `${DM_API}/v2/lists/?token=${encodeURIComponent(token)}&limit=500`;
      r = await fetch(url, { method: 'GET' });
      data = await r.json().catch(() => ({}));
    }
    if (!r.ok) {
      return res.status(r.status).json(data);
    }
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy request failed', message: e.message });
  }
});

/**
 * POST /api/leads
 * Body: { token, listId?, begin, limit, type? }
 * Proxies to DealMachine POST v2/leads/
 */
app.post('/api/leads', async (req, res) => {
  const { token, listId, begin = 0, limit = 100, type: reqType } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Missing token' });
  }
  try {
    const body = {
      token: token.trim(),
      type: (reqType === 'all' ? 'all' : 'list'),
      sort_by: 'created_at',
      limit: Number(limit) || 100,
      begin: Number(begin) || 0,
    };
    if (listId) body.list_id = listId;
    const r = await fetch(`${DM_API}/v2/leads/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json(data);
    }
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy request failed', message: e.message });
  }
});

app.get('/', (req, res) => {
  res.send('DealMachine proxy is running. Use the Chrome extension with this URL.');
});

app.get('/health', (req, res) => {
  res.send('ok');
});

app.listen(PORT, () => {
  console.log(`DealMachine proxy listening on port ${PORT}`);
});
