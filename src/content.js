/**
 * Acronymicon — content.js
 * v1.1: Whole-page highlight mode on by default, with MutationObserver
 * to catch dynamically loaded content (SPAs, infinite scroll, etc.)
 */

(function () {
  "use strict";

  // ─── State ────────────────────────────────────────────────────────────────

  let acronymData = {};
  let detectedIndustry = "default";
  let activeTooltip = null;
  let activeSpan = null;
  let isEnabled = true;
  let observer = null;
  let isProcessing = false;
  let closeTimer = null;
  let ratings = {};
  const trackedHighlights = new Set();

  // ─── Constants ────────────────────────────────────────────────────────────

  const ACRONYM_CLASS = "acronymicon-word";
  const TOOLTIP_ID = "acronymicon-tooltip";
  const TOOLTIP_ANCHOR_ATTR = "data-ac-word";

  const EXCLUDED_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT", "EMBED",
    "INPUT", "TEXTAREA", "SELECT", "BUTTON", "LABEL",
    "CODE", "KBD", "SAMP", "VAR", "PRE",
    "SVG", "MATH", "CANVAS"
  ]);

  const INDUSTRY_KEYWORDS = {
    tech: [
      "saas", "api", "cloud", "devops", "kubernetes", "docker", "microservice",
      "backend", "frontend", "fullstack", "full-stack", "software engineer",
      "typescript", "javascript", "python", "golang", "terraform", "github",
      "aws", "gcp", "azure", "machine learning", "llm", "data engineer"
    ],
    finance: [
      "investment", "portfolio", "equity", "hedge fund", "trading", "derivatives",
      "asset management", "compliance", "regulatory", "basel", "ifrs", "gaap"
    ],
    pharma: [
      "clinical", "regulatory", "fda", "ema", "phase ii", "trial", "pharmacology",
      "biotech", "drug", "therapeutics", "gcp", "ich", "protocol"
    ],
    hr: [
      "talent acquisition", "people operations", "hrbp", "onboarding",
      "employee experience", "compensation", "benefits", "learning and development"
    ]
  };

  // ─── Init ─────────────────────────────────────────────────────────────────

  async function init() {
    const { acEnabled = true, acLang = "en" } = await chrome.storage.sync.get(["acEnabled", "acLang"]);
    isEnabled = acEnabled;
    AcronymAnalytics.setUserProperty("dictionary_language", acLang);

    acronymData = await loadAcronymData(acLang);
    detectedIndustry = detectIndustry();

    const { acRatings = {} } = await chrome.storage.local.get("acRatings");
    ratings = acRatings;

    if (isEnabled) {
      scanAndHighlight(document.body);
      startObserver();
    }

    chrome.runtime.onMessage.addListener(handleMessage);
  }

  async function loadAcronymData(lang = "en") {
    try {
      if (!chrome.runtime?.id) return {};
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "AC_GET_ACRONYM_DATA", lang }, (response) => {
          if (chrome.runtime.lastError) { resolve({}); return; }
          resolve(response?.data ?? {});
        });
      });
    } catch (err) {
      console.warn("[Acronymicon] Failed to load acronym data:", err);
      return {};
    }
  }

  // ─── Industry Detection ───────────────────────────────────────────────────

  function detectIndustry() {
    const pageText = (document.body?.innerText || "").toLowerCase().slice(0, 8000);
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
      const hits = keywords.filter((kw) => pageText.includes(kw)).length;
      if (hits >= 2) return industry;
    }
    return "default";
  }

  // ─── Lookup ───────────────────────────────────────────────────────────────

  function lookup(word) {
    const entry = acronymData[word];
    if (!entry) return null;
    let primary = entry.default;
    if (entry.industry && entry.industry[detectedIndustry]) {
      primary = entry.industry[detectedIndustry];
    }
    return {
      primary,
      alternatives: (entry.alternatives || []).filter((a) => a !== primary)
    };
  }

  // ─── DOM Scanning ─────────────────────────────────────────────────────────

  const ACRONYM_RE = /\b([A-Z]{2,6}s?|[A-Z][a-z]+[A-Z][A-Za-z]*)\b/g;

  function isExcludedNode(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== document.body) {
      if (EXCLUDED_TAGS.has(el.tagName)) return true;
      if (el.isContentEditable) return true;
      if (el.classList?.contains(ACRONYM_CLASS)) return true;
      if (el.id === TOOLTIP_ID) return true;
      el = el.parentElement;
    }
    return false;
  }

  function getTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (isExcludedNode(node)) return NodeFilter.FILTER_REJECT;
        if (!node.textContent.trim()) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function processTextNode(textNode) {
    const text = textNode.textContent;
    ACRONYM_RE.lastIndex = 0;

    const matches = [];
    let m;
    while ((m = ACRONYM_RE.exec(text)) !== null) {
      const word = m[1];
      matches.push({ word, index: m.index, length: m[0].length });
      if (!trackedHighlights.has(word)) {
        trackedHighlights.add(word);
        AcronymAnalytics.track(
          lookup(word) ? "acronym_identified" : "acronym_undefined",
          { acronym: word }
        );
      }
    }

    if (matches.length === 0) return;

    const frag = document.createDocumentFragment();
    let cursor = 0;

    for (const { word, index, length } of matches) {
      if (index > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, index)));
      }
      const span = document.createElement("span");
      span.className = ACRONYM_CLASS;
      span.setAttribute(TOOLTIP_ANCHOR_ATTR, word);
      span.textContent = word;
      span.addEventListener("mouseenter", onAcronymEnter);
      span.addEventListener("mouseleave", onAcronymLeave);
      frag.appendChild(span);
      cursor = index + length;
    }

    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  }

  function scanAndHighlight(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.id === TOOLTIP_ID) return;
    const nodes = getTextNodes(root);
    nodes.forEach(processTextNode);
  }

  function removeHighlights() {
    clearTimeout(closeTimer);
    trackedHighlights.clear();
    closeTooltip();
    document.querySelectorAll(`.${ACRONYM_CLASS}`).forEach((span) => {
      span.replaceWith(document.createTextNode(span.textContent));
    });
    document.normalize();
  }

  // ─── MutationObserver ─────────────────────────────────────────────────────

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      if (!chrome.runtime?.id) { stopObserver(); return; }
      if (isProcessing) return;
      isProcessing = true;

      requestAnimationFrame(() => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.id === TOOLTIP_ID) continue;
            if (EXCLUDED_TAGS.has(node.tagName)) continue;
            scanAndHighlight(node);
          }
        }
        isProcessing = false;
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // ─── Hover Handlers ───────────────────────────────────────────────────────

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeTooltip, 150);
  }

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  function onAcronymEnter(e) {
    cancelClose();
    openTooltip(e.currentTarget);
  }

  function onAcronymLeave() {
    scheduleClose();
  }

  // ─── Ratings ──────────────────────────────────────────────────────────────

  function saveRating(word, vote) {
    if (!chrome.runtime?.id) return;
    if (ratings[word] === vote) {
      delete ratings[word];
    } else {
      ratings[word] = vote;
      const params = { acronym: word, definition: lookup(word)?.primary ?? null };
      AcronymAnalytics.track(vote === "up" ? "rating_helpful" : "rating_not_helpful", params);
    }
    chrome.storage.local.set({ acRatings: ratings });
    updateRatingButtons(word);
  }

  function updateRatingButtons(word) {
    if (!activeTooltip) return;
    activeTooltip.querySelectorAll(".ai-rating-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.vote === ratings[word]);
    });
  }

  // ─── Tooltip ──────────────────────────────────────────────────────────────

  function openTooltip(span) {
    const word = span.getAttribute(TOOLTIP_ANCHOR_ATTR);
    const result = lookup(word);
    AcronymAnalytics.track("acronym_highlighted", { acronym: word });

    closeTooltip();
    activeSpan = span;
    span.setAttribute("data-ac-active", "true");

    const box = document.createElement("div");
    box.id = TOOLTIP_ID;
    box.setAttribute("role", "tooltip");
    box.setAttribute("aria-label", `Definition of ${word}`);

    const header = document.createElement("div");
    header.className = "ai-tooltip-header";
    header.textContent = "The Acronymicon";
    box.appendChild(header);

    const closeBtn = document.createElement("button");
    closeBtn.className = "ai-tooltip-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); closeTooltip(); });
    box.appendChild(closeBtn);

    const wordLabel = document.createElement("div");
    wordLabel.className = "ai-tooltip-word";
    wordLabel.textContent = word;
    box.appendChild(wordLabel);

    if (result) {
      const primary = document.createElement("div");
      primary.className = "ai-tooltip-primary";
      primary.textContent = result.primary;
      box.appendChild(primary);

      const contextLabel = document.createElement("div");
      contextLabel.className = "ai-tooltip-context";
      contextLabel.textContent = detectedIndustry !== "default"
        ? `Most likely in ${detectedIndustry} context`
        : "Most likely meaning";
      box.appendChild(contextLabel);

      if (result.alternatives.length > 0) {
        const divider = document.createElement("hr");
        divider.className = "ai-tooltip-divider";
        box.appendChild(divider);

        const altLabel = document.createElement("div");
        altLabel.className = "ai-tooltip-alt-label";
        altLabel.textContent = "Also means";
        box.appendChild(altLabel);

        result.alternatives.forEach((alt) => {
          const altItem = document.createElement("div");
          altItem.className = "ai-tooltip-alt";
          altItem.textContent = alt;
          box.appendChild(altItem);
        });
      }

      const ratingRow = document.createElement("div");
      ratingRow.className = "ai-tooltip-rating";

      const ratingLabel = document.createElement("span");
      ratingLabel.className = "ai-tooltip-rating-label";
      ratingLabel.textContent = "Helpful?";
      ratingRow.appendChild(ratingLabel);

      ["up", "down"].forEach((vote) => {
        const btn = document.createElement("button");
        btn.className = "ai-rating-btn";
        btn.dataset.vote = vote;
        btn.textContent = vote === "up" ? "👍" : "👎";
        btn.setAttribute("aria-label", vote === "up" ? "Helpful" : "Not helpful");
        if (ratings[word] === vote) btn.classList.add("active");
        btn.addEventListener("click", (e) => { e.stopPropagation(); saveRating(word, vote); });
        ratingRow.appendChild(btn);
      });

      box.appendChild(ratingRow);
    } else {
      const nodef = document.createElement("div");
      nodef.className = "ai-tooltip-nodef";
      nodef.textContent = "No definition available yet";
      box.appendChild(nodef);
    }

    box.addEventListener("mouseenter", cancelClose);
    box.addEventListener("mouseleave", scheduleClose);

    document.body.appendChild(box);
    activeTooltip = box;
    positionTooltip(span, box);
  }

  function positionTooltip(span, box) {
    const spanRect = span.getBoundingClientRect();
    const boxWidth = box.offsetWidth || 240;
    const boxHeight = box.offsetHeight || 120;
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = spanRect.bottom + scrollY + 8;
    let left = spanRect.left + scrollX;

    if (spanRect.bottom + boxHeight + 8 > vpHeight) {
      top = spanRect.top + scrollY - boxHeight - 8;
    }
    if (left + boxWidth > vpWidth + scrollX - 12) {
      left = vpWidth + scrollX - boxWidth - 12;
    }
    if (left < scrollX + 8) left = scrollX + 8;

    box.style.top = `${top}px`;
    box.style.left = `${left}px`;
  }

  function closeTooltip() {
    if (activeTooltip) { activeTooltip.remove(); activeTooltip = null; }
    if (activeSpan) { activeSpan.removeAttribute("data-ac-active"); activeSpan = null; }
  }

  // ─── Global dismiss ───────────────────────────────────────────────────────

  document.addEventListener("click", (e) => {
    if (!activeTooltip) return;
    if (activeTooltip.contains(e.target)) return;
    if (activeSpan?.contains(e.target)) return;
    closeTooltip();
  }, true);

  // ─── Messages ─────────────────────────────────────────────────────────────

  function handleMessage(msg, _sender, sendResponse) {
    if (msg.type === "AC_TOGGLE") {
      isEnabled = msg.enabled;
      if (isEnabled) {
        scanAndHighlight(document.body);
        startObserver();
      } else {
        stopObserver();
        removeHighlights();
      }
    }

    if (msg.type === "AC_GET_STATS") {
      const spans = document.querySelectorAll(`.${ACRONYM_CLASS}`);
      let defined = 0;
      spans.forEach((s) => {
        if (lookup(s.getAttribute(TOOLTIP_ANCHOR_ATTR))) defined++;
      });
      const dictionarySize = Object.keys(acronymData).filter(k => k !== "_meta").length;
      sendResponse({ identified: spans.length, defined, industry: detectedIndustry, dictionarySize });
    }

    return true;
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────

  init();
})();
