const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const CALENDLY_SIGNING_KEY = process.env.CALENDLY_SIGNING_KEY;

// Middleware to validate signature
function verifyCalendlySignature(req, res, next) {
  const signatureHeader = req.get('Calendly-Webhook-Signature');
  if (!signatureHeader) return res.status(401).send('Missing signature');

  const rawBody = JSON.stringify(req.body);
  const expectedSignature = `v1=${crypto
    .createHmac('sha256', CALENDLY_SIGNING_KEY)
    .update(rawBody)
    .digest('hex')}`;

  if (signatureHeader !== expectedSignature) {
    console.error('Signature mismatch!');
    return res.status(401).send('Invalid signature');
  }

  next();
}

// Webhook endpoint (Calendly calls this)
router.post('/webhook', express.json({ verify: (req, res, buf) => (req.rawBody = buf) }), verifyCalendlySignature, (req, res) => {
  const eventType = req.body.event;
  const payload = req.body.payload;
  console.log('Webhook received:', eventType, payload);
  // Handle invitee.created, invitee.canceled, etc.
  res.status(200).send('OK');
});

module.exports = router;