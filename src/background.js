/**
 * Acronymicon — background.js (Service Worker)
 * Handles extension install/update events and badge state.
 */

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.storage.sync.set({ acEnabled: true, acLang: "en" });
    console.log("[Acronymicon] Installed. Extension active.");
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "AC_GET_ACRONYM_DATA") {
    const url = chrome.runtime.getURL(`src/acronyms.${msg.lang}.json`);
    fetch(url)
      .then((res) => res.json())
      .then(({ _meta, ...data }) => sendResponse({ data }))
      .catch(() => sendResponse({ data: {} }));
    return true;
  }

  if (msg.type === "AC_FLUSH_ANALYTICS") {
    fetch(msg.endpoint, { method: "POST", body: msg.payload })
      .then((r) => sendResponse({ status: r.status }))
      .catch((e) => sendResponse({ error: e.message }));
    return true;
  }
});
