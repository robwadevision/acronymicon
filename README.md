# Acronymicon 🔍

A lightweight browser extension that detects acronyms on web pages — especially job ads — and shows instant definitions via tooltip on hover.

**No backend. No PII collected.** Everything runs locally in your browser, with optional anonymous aggregate analytics.

---

## Features

- **Whole-page highlight mode** — every known acronym on the page is underlined automatically on load
- **Hover to reveal** — tooltip opens on mouseover; no click required (works correctly inside hyperlinks)
- **MutationObserver** — catches dynamically loaded content (LinkedIn, Greenhouse, SPAs, infinite scroll)
- Shows primary meaning instantly, with alternatives
- Detects industry context (tech, finance, pharma, HR) to surface the most relevant definition
- **Rate definitions** — 👍 / 👎 feedback per acronym, stored locally
- **Multi-language ready** — drop in `src/acronyms.<lang>.json` to add a language
- Dark mode support
- Toggle on/off from the popup
- 100+ acronyms in the English dictionary out of the box

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## Install (Development / Unpacked)

### Chrome
1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`acronymicon/`)

### Edge
1. Open `edge://extensions`
2. Enable **Developer mode** (left sidebar)
3. Click **Load unpacked**
4. Select this folder

---

## Project Structure

```
acronymicon/
├── manifest.json               # Chrome MV3 manifest
├── popup.html                  # Extension popup UI
├── popup.css
├── popup.js
├── icons/
└── src/
    ├── constants.js            # Local credentials — gitignored, copy from constants.example.js
    ├── constants.example.js    # Committed template for constants.js
    ├── analytics.js            # GA4 Measurement Protocol batching
    ├── content.js              # DOM scanner + tooltip engine
    ├── content.css             # Injected styles (tooltip + highlights)
    ├── background.js           # Service worker
    └── acronyms.en.json        # English dictionary (default)
```

---

## Adding Acronyms

Edit `src/acronyms.en.json`. Each entry follows this schema:

```json
"ACRONYM": {
  "default": "Primary meaning",
  "alternatives": ["Other meaning 1", "Other meaning 2"],
  "industry": {
    "tech": "Tech-specific meaning",
    "finance": "Finance-specific meaning"
  }
}
```

Industry keys: `tech`, `finance`, `pharma`, `hr`

---

## Analytics Setup

Analytics are disabled by default. To activate:

1. Copy `src/constants.example.js` to `src/constants.js`
2. Fill in your GA4 `measurementId` (e.g. `G-XXXXXXXXXX`) and `apiSecret`
3. Both are found in GA4 → Admin → Data Streams → Measurement Protocol

No PII is sent — only acronym tokens and event names, attributed to a randomly generated anonymous device ID.

---

## Roadmap

- [x] Whole-page mode (auto-highlight all acronyms on load)
- [x] Hover to reveal (tooltip on mouseover)
- [x] Rating system (👍 / 👎 feedback)
- [x] Multi-language dictionary support
- [x] Anonymous aggregate analytics
- [ ] Domain whitelist / blacklist settings
- [ ] Community dictionary via GitHub-hosted JSON
- [ ] LLM-powered context ranking

---

## License

MIT
