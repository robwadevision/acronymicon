/**
 * Acronymicon — content.js
 * v1.1: Whole-page highlight mode on by default, with MutationObserver
 * to catch dynamically loaded content (SPAs, infinite scroll, etc.)
 */

(function () {
  "use strict";

  // ─── State ────────────────────────────────────────────────────────────────

  let acronymData = {};
  let activeTooltip = null;
  let activeSpan = null;
  let isEnabled = true;
  let observer = null;
  let isProcessing = false;
  let closeTimer = null;
  let ratings = {};
  const trackedHighlights = new Set();
  let pageIndustry = null;

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

  // ─── Init ─────────────────────────────────────────────────────────────────

  async function init() {
    const { acEnabled = true, acLang = "en" } = await chrome.storage.sync.get(["acEnabled", "acLang"]);
    isEnabled = acEnabled;
    AcronymAnalytics.setUserProperty("dictionary_language", acLang);

    acronymData = await loadAcronymData(acLang);
    pageIndustry = detectPageIndustry();

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

  // ─── Lookup ───────────────────────────────────────────────────────────────

  function lookup(word) {
    const entry = acronymData[word];
    if (!entry || !entry.definitions) return null;
    return entry.definitions; // [{ text, industry? }]
  }

  // ─── Page Context ─────────────────────────────────────────────────────────────────────────────

  function detectPageIndustry() {
    const text = (document.body?.innerText ?? '').slice(0, 50000).toLowerCase();

    const SIGNALS = {
      Tech:       ['javascript', 'typescript', 'python', 'software engineer', 'developer',
                   'api', 'cloud', 'devops', 'repository', 'frontend', 'backend', 'microservice'],
      Finance:    ['investment', 'portfolio', 'equity', 'hedge fund', 'dividend',
                   'balance sheet', 'asset management', 'shareholder', 'capital markets'],
      Medical:    ['patient', 'clinical', 'diagnosis', 'hospital', 'physician',
                   'prescription', 'surgery', 'healthcare', 'treatment plan'],
      Business:   ['go-to-market', 'stakeholder', 'performance review', 'hiring manager',
                   'executive team', 'board of directors', 'revenue target', 'corporate strategy'],
      Government: ['legislation', 'parliament', 'congress', 'minister', 'public sector',
                   'federal', 'regulatory', 'government department'],
      Media:      ['streaming', 'broadcast', 'editorial', 'newsroom',
                   'podcast', 'subscriber', 'content creator', 'publishing'],
      Gaming:     ['gameplay', 'multiplayer', 'dungeon', 'esports',
                   'speedrun', 'loot', 'respawn', 'leaderboard'],
      Sports:     ['fixture', 'league table', 'championship', 'transfer window',
                   'referee', 'squad', 'match report'],
      Science:    ['peer review', 'hypothesis', 'laboratory', 'experiment',
                   'methodology', 'findings', 'clinical study'],
      Work:       ['job posting', 'job description', 'recruitment', 'candidate',
                   'salary', 'interview', 'payroll', 'resignation', 'hiring'],
    };

    let best = null;
    let bestScore = 0;
    let secondScore = 0;

    for (const [industry, signals] of Object.entries(SIGNALS)) {
      const score = signals.reduce((n, s) => n + (text.includes(s) ? 1 : 0), 0);
      if (score > bestScore) {
        secondScore = bestScore;
        bestScore = score;
        best = industry;
      } else if (score > secondScore) {
        secondScore = score;
      }
    }

    return bestScore >= 2 && bestScore > secondScore ? best : null;
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
      if (m.index > 0 && text[m.index - 1] === "#") continue;
      matches.push({ word, index: m.index, length: m[0].length });
      if (!trackedHighlights.has(word)) {
        trackedHighlights.add(word);
        const definitions = lookup(word);
        if (definitions) {
          const industry = definitions[0]?.industry ?? null;
          AcronymAnalytics.track("acronym_identified", { acronym: word, ...(industry && { industry }) });
        } else {
          AcronymAnalytics.track("acronym_undefined", { acronym: word });
        }
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

  function saveRating(word, defText, vote) {
    if (!chrome.runtime?.id) return;
    const key = word + "||" + defText;
    if (ratings[key] === vote) {
      delete ratings[key];
    } else {
      ratings[key] = vote;
      AcronymAnalytics.track(vote === "up" ? "rating_helpful" : "rating_not_helpful", { acronym: word, definition: defText });
    }
    chrome.storage.local.set({ acRatings: ratings });
    updateRatingButtons(word, defText);
  }

  function updateRatingButtons(word, defText) {
    if (!activeTooltip) return;
    const key = word + "||" + defText;
    activeTooltip.querySelectorAll(".ai-rating-btn").forEach((btn) => {
      if (btn.dataset.acWord === word && btn.dataset.acDef === defText) {
        btn.classList.toggle("active", btn.dataset.vote === ratings[key]);
      }
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
      const matchedDef = pageIndustry
        ? (result.find(d => d.industry === pageIndustry) ?? null)
        : null;

      if (matchedDef) {
        const primaryLabel = document.createElement('div');
        primaryLabel.className = 'ai-tooltip-primary-label';
        primaryLabel.textContent = 'Most likely';
        box.appendChild(primaryLabel);

        const primaryItem = document.createElement('div');
        primaryItem.className = 'ai-tooltip-primary';
        primaryItem.textContent = matchedDef.text;
        box.appendChild(primaryItem);
      }

      const divider = document.createElement('hr');
      divider.className = 'ai-tooltip-divider';
      box.appendChild(divider);

      const altLabel = document.createElement('div');
      altLabel.className = 'ai-tooltip-alt-label';
      altLabel.textContent = 'Options';
      box.appendChild(altLabel);

      const orderedDefs = matchedDef
        ? [...result.filter(d => d !== matchedDef), matchedDef]
        : result;

      orderedDefs.forEach((def) => {
        const optItem = document.createElement('div');
        optItem.className = 'ai-tooltip-alt';

        const textSpan = document.createElement('span');
        textSpan.className = 'ai-tooltip-def-text';
        textSpan.textContent = def.text;
        optItem.appendChild(textSpan);

        if (def.industry) {
          const badge = document.createElement('span');
          badge.className = 'ai-tooltip-industry';
          badge.setAttribute('data-industry', def.industry);
          badge.textContent = def.industry;
          optItem.appendChild(badge);
        }

        ['up', 'down'].forEach((vote) => {
          const btn = document.createElement('button');
          btn.className = 'ai-rating-btn';
          btn.dataset.vote = vote;
          btn.dataset.acWord = word;
          btn.dataset.acDef = def.text;
          btn.textContent = vote === 'up' ? '👍' : '👎';
          btn.setAttribute('aria-label', vote === 'up' ? 'Helpful' : 'Not helpful');
          const key = word + '||' + def.text;
          if (ratings[key] === vote) btn.classList.add('active');
          btn.addEventListener('click', (e) => { e.stopPropagation(); saveRating(word, def.text, vote); });
          optItem.appendChild(btn);
        });

        box.appendChild(optItem);
      });
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
      const dictionarySize = Object.entries(acronymData)
        .filter(([k]) => k !== "_meta")
        .reduce((n, [, v]) => n + (v.definitions?.length ?? 0), 0);
      sendResponse({ identified: spans.length, defined, dictionarySize });
    }

    return true;
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────

  init();
})();
