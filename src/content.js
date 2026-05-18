/**
 * Acronymicon — content.js
 * Scans the page for known acronyms, wraps them in interactive spans,
 * and renders instant tooltip definitions on click.
 */

(function () {
  "use strict";

  // ─── State ────────────────────────────────────────────────────────────────

  let acronymData = {};
  let detectedIndustry = "default";
  let activeTooltip = null;
  let activeSpan = null;
  let isEnabled = true;
  let hasScanned = false;

  // ─── Constants ────────────────────────────────────────────────────────────

  const ACRONYM_CLASS = "acronym-clarity-word";
  const TOOLTIP_ID = "acronym-clarity-tooltip";
  const TOOLTIP_ANCHOR_ATTR = "data-ac-word";

  // Tags whose text content we must never touch
  const EXCLUDED_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT", "EMBED",
    "INPUT", "TEXTAREA", "SELECT", "BUTTON", "LABEL",
    "CODE", "KBD", "SAMP", "VAR", "PRE",
    "SVG", "MATH", "CANVAS"
  ]);

  // Industry keyword map for lightweight context detection
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

  // ─── Initialisation ───────────────────────────────────────────────────────

  async function init() {
    const { acEnabled = true } = await chrome.storage.sync.get("acEnabled");
    isEnabled = acEnabled;
    if (!isEnabled) return;

    acronymData = await loadAcronymData();
    detectedIndustry = detectIndustry();
    scanAndHighlight();

    // Listen for toggle messages from popup
    chrome.runtime.onMessage.addListener(handleMessage);
  }

  async function loadAcronymData() {
    try {
      const url = chrome.runtime.getURL("src/acronyms.json");
      const res = await fetch(url);
      const json = await res.json();
      // Remove _meta key before using
      const { _meta, ...data } = json;
      return data;
    } catch (err) {
      console.warn("[AcronymClarity] Failed to load acronym data:", err);
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

  // ─── Acronym Lookup ───────────────────────────────────────────────────────

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

  // Matches 2-6 uppercase letters (with optional trailing 's'), or known mixed-case
  // acronyms like "SaaS", "IaC", "OTel", "DevOps", "MLOps"
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
      if (lookup(word)) {
        matches.push({ word, index: m.index, length: m[0].length });
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
      span.addEventListener("click", onAcronymClick);
      frag.appendChild(span);
      cursor = index + length;
    }

    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  }

  function scanAndHighlight() {
    if (hasScanned) return;
    hasScanned = true;
    const nodes = getTextNodes(document.body);
    nodes.forEach(processTextNode);
  }

  function removeHighlights() {
    closeTooltip();
    document.querySelectorAll(`.${ACRONYM_CLASS}`).forEach((span) => {
      span.replaceWith(document.createTextNode(span.textContent));
    });
    document.normalize();
    hasScanned = false;
  }

  // ─── Click Handler ────────────────────────────────────────────────────────

  function onAcronymClick(e) {
    e.stopPropagation();
    const span = e.currentTarget;
    if (span === activeSpan) {
      closeTooltip();
      return;
    }
    openTooltip(span);
  }

  // ─── Tooltip ──────────────────────────────────────────────────────────────

  function openTooltip(span) {
    const word = span.getAttribute(TOOLTIP_ANCHOR_ATTR);
    const result = lookup(word);

    closeTooltip(); // clean up previous

    activeSpan = span;
    span.setAttribute("data-ac-active", "true");

    const box = document.createElement("div");
    box.id = TOOLTIP_ID;
    box.setAttribute("role", "tooltip");
    box.setAttribute("aria-label", `Definition of ${word}`);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "ac-tooltip-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); closeTooltip(); });
    box.appendChild(closeBtn);

    // Word label
    const wordLabel = document.createElement("div");
    wordLabel.className = "ac-tooltip-word";
    wordLabel.textContent = word;
    box.appendChild(wordLabel);

    if (result) {
      const primary = document.createElement("div");
      primary.className = "ac-tooltip-primary";
      primary.textContent = result.primary;
      box.appendChild(primary);

      const contextLabel = document.createElement("div");
      contextLabel.className = "ac-tooltip-context";
      contextLabel.textContent =
        detectedIndustry !== "default"
          ? `Most likely in ${detectedIndustry} context`
          : "Most likely meaning";
      box.appendChild(contextLabel);

      if (result.alternatives.length > 0) {
        const divider = document.createElement("hr");
        divider.className = "ac-tooltip-divider";
        box.appendChild(divider);

        const altLabel = document.createElement("div");
        altLabel.className = "ac-tooltip-alt-label";
        altLabel.textContent = "Also means";
        box.appendChild(altLabel);

        result.alternatives.forEach((alt) => {
          const altItem = document.createElement("div");
          altItem.className = "ac-tooltip-alt";
          altItem.textContent = alt;
          box.appendChild(altItem);
        });
      }
    } else {
      const nodef = document.createElement("div");
      nodef.className = "ac-tooltip-nodef";
      nodef.textContent = "No definition available yet";
      box.appendChild(nodef);
    }

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

    // Flip above if clipped at bottom
    if (spanRect.bottom + boxHeight + 8 > vpHeight) {
      top = spanRect.top + scrollY - boxHeight - 8;
    }
    // Nudge left if clipped at right
    if (left + boxWidth > vpWidth + scrollX - 12) {
      left = vpWidth + scrollX - boxWidth - 12;
    }
    if (left < scrollX + 8) left = scrollX + 8;

    box.style.top = `${top}px`;
    box.style.left = `${left}px`;
  }

  function closeTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
    if (activeSpan) {
      activeSpan.removeAttribute("data-ac-active");
      activeSpan = null;
    }
  }

  // ─── Global dismiss on outside click ─────────────────────────────────────

  document.addEventListener("click", (e) => {
    if (!activeTooltip) return;
    if (activeTooltip.contains(e.target)) return;
    if (activeSpan?.contains(e.target)) return;
    closeTooltip();
  }, true);

  // ─── Message handler (from popup) ────────────────────────────────────────

  function handleMessage(msg, _sender, sendResponse) {
    if (msg.type === "AC_TOGGLE") {
      isEnabled = msg.enabled;
      if (isEnabled) {
        scanAndHighlight();
      } else {
        removeHighlights();
      }
    }

    if (msg.type === "AC_GET_STATS") {
      const spans = document.querySelectorAll(`.${ACRONYM_CLASS}`);
      let defined = 0;
      spans.forEach((s) => {
        if (lookup(s.getAttribute(TOOLTIP_ANCHOR_ATTR))) defined++;
      });
      sendResponse({
        found: spans.length,
        defined,
        industry: detectedIndustry
      });
    }

    return true; // keep message channel open for async sendResponse
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────

  init();
})();
