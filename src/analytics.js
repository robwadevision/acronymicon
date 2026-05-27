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
  const DEBUG = AcronymConfig.debug ?? false;

  let clientId = null;
  const queue = [];

  async function init() {
    if (!chrome.runtime?.id) return;
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
    if (DEBUG) {
      console.log(`[Acronymicon Analytics] Queued: ${eventName}`, params, `(clientId: ${clientId ?? "pending"})`);
      flush();
    } else if (queue.length >= 25) {
      flush();
    }
  }

  function flush() {
    if (!queue.length || !MEASUREMENT_ID || !API_SECRET || !clientId) {
      if (DEBUG && queue.length) console.warn("[Acronymicon Analytics] Flush skipped — clientId not ready yet");
      return;
    }
    const events = queue.splice(0).map((e) =>
      DEBUG ? { ...e, params: { ...e.params, debug_mode: 1, traffic_type: "internal" } } : e
    );
    const payload = JSON.stringify({ client_id: clientId, events });

    if (DEBUG) {
      const endpoint = `${GA_ENDPOINT}?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(API_SECRET)}`;
      fetch(endpoint, { method: "POST", body: payload })
        .then((r) => console.log("[Acronymicon Analytics] Sent — status:", r.status))
        .catch((e) => console.warn("[Acronymicon Analytics] Send failed:", e));
    } else {
      navigator.sendBeacon(
        `${GA_ENDPOINT}?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(API_SECRET)}`,
        new Blob([payload], { type: "application/json" })
      );
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });

  init();

  return { track };
})();
