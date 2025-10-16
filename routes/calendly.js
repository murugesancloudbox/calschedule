// backend/routes/calendly.js
const express = require('express');
const router = express.Router();
const CalendlyService = require('../calendlyService');

// Suppose you have your personal access token or OAuth token stored
const calendly = new CalendlyService({ accessToken: process.env.CALENDLY_TOKEN });

router.get('/me', async (req, res, next) => {
  try {
    const data = await calendly.getCurrentUser();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/event-types', async (req, res, next) => {
  try {
    const user = await calendly.getCurrentUser();
    const data = await calendly.listEventTypes({ userUri: user.resource.uri });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/events', async (req, res, next) => {
  try {
    const user = await calendly.getCurrentUser();
    const orgUri = user.resource.current_organization;
    const data = await calendly.listScheduledEvents({ orgUri });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/events/:eventId', async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const data = await calendly.getEventDetails(eventId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/events/:eventId/invitees', async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const data = await calendly.listInvitees(eventId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/events/:eventId/cancel', async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const body = req.body;
    const resp = await calendly.cancelEvent(eventId, body.reason);
    res.json(resp);
  } catch (err) {
    next(err);
  }
});

// Webhook endpoint for Calendly to send event updates
router.post('/webhook', express.json(), (req, res) => {
  const { event, payload } = req.body;
  console.log('Received webhook:', event, payload);
  // TODO: verify signature, then act based on event types
  res.status(200).send('OK');
});

module.exports = router;
