/**
 * Acronymicon — analytics.js
 * GA4 Measurement Protocol event batching.
 *
 * Events are queued in memory and flushed via sendBeacon on page hide/unload.
 * No PII is collected — only acronym tokens and event names.
 *
 * To activate: set MEASUREMENT_ID and API_SECRET below.
 * Both are found in GA4 → Admin → Data Streams → Measurement Protocol.
 */

const AcronymAnalytics = (() => {
  "use strict";

  const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
  const MEASUREMENT_ID = AcronymConfig.measurementId;
  const API_SECRET = AcronymConfig.apiSecret;

  let clientId = null;
  const queue = [];

  async function init() {
    const { acClientId } = await chrome.storage.local.get("acClientId");
    if (acClientId) {
      clientId = acClientId;
    } else {
      clientId = crypto.randomUUID();
      chrome.storage.local.set({ acClientId: clientId });
    }
  }

  function track(eventName, params = {}) {
    if (!MEASUREMENT_ID || !API_SECRET) return;
    queue.push({ name: eventName, params });
    if (queue.length >= 25) flush(); // GA4 max per request
  }

  function flush() {
    if (!queue.length || !MEASUREMENT_ID || !API_SECRET || !clientId) return;
    const events = queue.splice(0);
    const payload = JSON.stringify({ client_id: clientId, events });
    navigator.sendBeacon(
      `${GA_ENDPOINT}?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(API_SECRET)}`,
      new Blob([payload], { type: "application/json" })
    );
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });

  init();

  return { track };
})();
