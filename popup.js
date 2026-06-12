/**
 * Acronymicon — popup.js
 */

(async function () {
  const toggle = document.getElementById("main-toggle");
  const toggleSub = document.getElementById("toggle-sub");
  const statIdentified = document.getElementById("stat-identified");
  const statDefined = document.getElementById("stat-defined");
  const statNote = document.getElementById("stat-note");
  const statDict = document.getElementById("stat-dict");

  // ── Load persisted state ───────────────────────────────────────────────
  const { acEnabled = true, acLang = "en" } = await chrome.storage.sync.get(["acEnabled", "acLang"]);
  toggle.checked = acEnabled;
  updateSubLabel(acEnabled);
  document.getElementById("lang-label").textContent = acLang.toUpperCase();

  // ── Query the active tab for live stats ───────────────────────────────
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: "AC_GET_STATS" });
      if (response) {
        const identified = response.identified ?? 0;
        const defined = response.defined ?? 0;
        const undefined_ = identified - defined;
        statIdentified.textContent = identified || "—";
        statDefined.textContent = defined || "—";
        if (undefined_ > 0) {
          statNote.textContent = `${undefined_} identified without a definition`;
        }
        if (response.dictionarySize) {
          statDict.textContent = `${response.dictionarySize} Definitions available`;
        }
      }
    } catch {
      // Content script not yet injected (e.g. chrome:// pages)
      statIdentified.textContent = "—";
      statDefined.textContent = "—";
    }
  }

  // ── Toggle handler ────────────────────────────────────────────────────
  toggle.addEventListener("change", async () => {
    const enabled = toggle.checked;
    await chrome.storage.sync.set({ acEnabled: enabled });
    updateSubLabel(enabled);

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "AC_TOGGLE", enabled }).catch(() => {});
    }
  });

  function updateSubLabel(enabled) {
    toggleSub.textContent = enabled ? "Scanning for acronyms" : "Extension paused";
  }
})();
