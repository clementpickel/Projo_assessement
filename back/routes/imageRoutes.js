/**
 * @swagger
 * components:
 *   schemas:
 *     WordRequest:
 *       type: object
 *       required:
 *         - word
 *       properties:
 *         word:
 *           type: string
 *           example: cat
 */

const express = require('express');
const router = express.Router();
const https = require('https');
const { URL } = require('url');

/**
 * @swagger
 * /api/image:
 *   post:
 *     summary: Generate an image from a word
 *     description: Proxies a request to the external Word-to-Image service and returns a raw image.
 *     tags:
 *       - Image
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WordRequest'
 *     responses:
 *       200:
 *         description: Raw image returned
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       502:
 *         description: Upstream error
 */
router.post('/image', (req, res) => {
  // Validate environment variables
  const TARGET_URL = process.env.PROJO_API_URL;
  if (!TARGET_URL) {
    return res.status(500).json({ 
      error: 'Server configuration error: PROJO_API_URL not set.' 
    });
  }

  const apiKey = process.env.PROJO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Server configuration error: PROJO_API_KEY not set.' 
    });
  }

  // Validate word parameter
  const word = (req.body && req.body.word) || req.query.word;
  if (!word) {
    return res.status(400).json({ 
      error: 'Missing "word" in request body or query string.' 
    });
  }

  // Parse target URL and add word as query parameter
  const targetUrl = new URL('/word-to-image', TARGET_URL);
  targetUrl.searchParams.set('word', word);
  
  const requestOptions = {
    method: 'GET',
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    headers: {
      'x-api-key': apiKey,
    },
  };

  // Make request to external API
  const upstreamReq = https.request(requestOptions, upstreamRes => {
    // Forward status code
    res.statusCode = upstreamRes.statusCode;

    // Forward content type
    const contentType = upstreamRes.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Forward content length if available
    if (upstreamRes.headers['content-length']) {
      res.setHeader('Content-Length', upstreamRes.headers['content-length']);
    }

    // Pipe the response directly to the client
    upstreamRes.pipe(res);
  });

  // Handle request errors
  upstreamReq.on('error', err => {
    console.error('Upstream request error:', err);
    if (!res.headersSent) {
      res.status(502).json({ 
        error: 'Upstream request failed', 
        detail: err.message 
      });
    }
  });

  upstreamReq.end();
});

module.exports = router;