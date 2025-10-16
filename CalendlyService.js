// backend/calendlyService.js
const axios = require('axios');

const CALENDLY_API_BASE = 'https://api.calendly.com';

class CalendlyService {
  constructor({ accessToken }) {
    this.accessToken = accessToken;
  }

  _headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async getCurrentUser() {
    const resp = await axios.get(`${CALENDLY_API_BASE}/users/me`, {
      headers: this._headers(),
    });
    return resp.data;
  }

  async listEventTypes({ userUri = null, orgUri = null }) {
    const params = {};
    if (userUri) params.user = userUri;
    if (orgUri) params.organization = orgUri;
    const resp = await axios.get(`${CALENDLY_API_BASE}/event_types`, {
      headers: this._headers(),
      params,
    });
    return resp.data;
  }

  async listScheduledEvents({ orgUri = null, userUri = null, status = 'active', minStartTime, maxStartTime }) {
    const params = { status };
    if (orgUri) params.organization = orgUri;
    if (userUri) params.user = userUri;
    if (minStartTime) params.min_start_time = minStartTime;
    if (maxStartTime) params.max_start_time = maxStartTime;

    const resp = await axios.get(`${CALENDLY_API_BASE}/scheduled_events`, {
      headers: this._headers(),
      params,
    });
    return resp.data;
  }

  async getEventDetails(eventUuid) {
    const resp = await axios.get(`${CALENDLY_API_BASE}/scheduled_events/${eventUuid}`, {
      headers: this._headers(),
    });
    return resp.data;
  }

  async listInvitees(eventUuid) {
    const resp = await axios.get(`${CALENDLY_API_BASE}/scheduled_events/${eventUuid}/invitees`, {
      headers: this._headers(),
    });
    return resp.data;
  }

  async cancelEvent(eventUuid, reason = 'Cancelled via API') {
    const resp = await axios.post(
      `${CALENDLY_API_BASE}/scheduled_events/${eventUuid}/cancellation`,
      { reason },
      { headers: this._headers() }
    );
    return resp.data;
  }

  async createWebhook({ url, events = ['invitee.created', 'invitee.canceled'], scope = 'organization', orgUri }) {
    const body = {
      url,
      events,
      scope,
    };
    if (scope === 'organization') {
      body.organization = orgUri;
    }
    const resp = await axios.post(`${CALENDLY_API_BASE}/webhook_subscriptions`, body, {
      headers: this._headers(),
    });
    return resp.data;
  }
}

module.exports = CalendlyService;
