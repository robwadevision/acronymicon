/**
 * Acronymicon — popup.js
 */

(async function () {
  const toggle = document.getElementById("main-toggle");
  const toggleSub = document.getElementById("toggle-sub");
  const industryBadge = document.getElementById("industry-badge");
  const statIdentified = document.getElementById("stat-identified");
  const statDefined = document.getElementById("stat-defined");
  const statNote = document.getElementById("stat-note");

  // ── Load persisted state ───────────────────────────────────────────────
  const { acEnabled = true } = await chrome.storage.sync.get("acEnabled");
  toggle.checked = acEnabled;
  updateSubLabel(acEnabled);

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
        setIndustryBadge(response.industry || "default");
      }
    } catch {
      // Content script not yet injected (e.g. chrome:// pages)
      statIdentified.textContent = "—";
      statDefined.textContent = "—";
      industryBadge.textContent = "n/a";
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

  function setIndustryBadge(industry) {
    const labels = {
      tech: "Tech",
      finance: "Finance",
      pharma: "Pharma",
      hr: "HR",
      default: "General"
    };
    industryBadge.textContent = labels[industry] || "General";
    industryBadge.className = `badge ${industry}`;
  }
})();
