require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const app = express();

// Capture raw request body (needed for HMAC signature verification) and
// also parse JSON bodies for all routes so req.body is defined.
app.use(express.json({ verify: (req, res, buf) => (req.rawBody = buf) }));

// Signature verification middleware for Calendly webhooks. It expects the
// signing key to be in the CALENDLY_SIGNING_KEY environment variable.
function verifyCalendlySignature(req, res, next) {
  const signingKey = process.env.CALENDLY_SIGNING_KEY;
  const signatureHeader = req.get('Calendly-Webhook-Signature');

  // If no signing key is configured, skip verification but warn.
  if (!signingKey) {
    console.warn('CALENDLY_SIGNING_KEY not set; skipping signature verification.');
    return next();
  }

  if (!signatureHeader) return res.status(401).send('Missing signature');

  // Use the raw bytes captured by the json middleware. If missing, reject.
  const raw = req.rawBody;
  if (!raw) return res.status(400).send('Missing raw body for signature verification');

  const expected = 'v1=' + crypto.createHmac('sha256', signingKey).update(raw).digest('hex');

  // Use timingSafeEqual where possible to mitigate timing attacks
  try {
    const sigBuf = Buffer.from(signatureHeader);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.error('Signature mismatch', { received: signatureHeader, expected });
      return res.status(401).send('Invalid signature');
    }
  } catch (err) {
    // Fallback to simple comparison if timingSafeEqual throws for some reason
    if (signatureHeader !== expected) {
      console.error('Signature mismatch', { received: signatureHeader, expected });
      return res.status(401).send('Invalid signature');
    }
  }

  return next();
}

// Import your Calendly route file
const calendlyRoutes = require('./routes/calendly');

// Mount it under a base path
app.use('/api/calendly', calendlyRoutes);

// Single webhook endpoint (keep only this one). Attach signature verification
// middleware to protect this endpoint. Calendly should be configured to POST
// to <PUBLIC_URL>/webhook (ngrok or real domain).
app.post('/webhook', verifyCalendlySignature, (req, res) => {
  const { event, payload } = req.body || {};
  console.log('Calendly webhook received:', event);
  console.log('Payload:', payload);

  // Example: handle event type
  if (event === 'invitee.created') {
    console.log('A new invitee booked an event!');
    // You can save payload data in DB or send email etc.
  }

  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
