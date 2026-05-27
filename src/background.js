/**
 * Acronymicon — background.js (Service Worker)
 * Handles extension install/update events and badge state.
 */

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // Set default storage values on first install
    chrome.storage.sync.set({ acEnabled: true, acLang: "en" });
    console.log("[AcronymClarity] Installed. Extension active.");
  }
});
