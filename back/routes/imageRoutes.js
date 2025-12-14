// index.js
const express = require('express');
const router = express.Router();
const https = require('https');
const { URL } = require('url');

router.post('/image', (req, res) => {

    const TARGET_URL = process.env.PROJO_API_URL;
    if (!TARGET_URL) return res.status(401).json({ error: 'Missing x-api-key (set PROJO_API_KEY or send x-api-key header).' });
    const apiKey = process.env.PROJO_API_KEY ;
    if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key (set PROJO_API_KEY or send x-api-key header).' });

    const word = (req.body && req.body.word) || req.query.word;
    if (!word) return res.status(400).json({ error: 'Missing "word" in request body or query string.' });

    const outgoingBody = JSON.stringify({ word });

    const TARGET_ROUTE = new URL(TARGET_URL + '/word-to-image');
    const requestOptions = {
        method: 'GET',
        hostname: TARGET_ROUTE.hostname,
        path: TARGET_ROUTE.pathname,
        headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(outgoingBody),
        'x-api-key': apiKey,
    },
  };

  const upstreamReq = https.request(requestOptions, upstreamRes => {
    res.statusCode = upstreamRes.statusCode;

    const ct = upstreamRes.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', ct);

    if (upstreamRes.headers['content-length']) {
      res.setHeader('Content-Length', upstreamRes.headers['content-length']);
    }

    upstreamRes.pipe(res);
  });

  upstreamReq.on('error', err => {
    console.error('Upstream request error:', err);
    if (!res.headersSent) res.status(502).json({ error: 'Upstream request failed', detail: err.message });
  });

  upstreamReq.write(outgoingBody);
  upstreamReq.end();
});

module.exports = router;
