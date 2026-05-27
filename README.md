# Acronymicon 🔍

A lightweight browser extension that detects acronyms on web pages — especially job ads — and shows instant definitions via a tooltip on click.

**No backend. No tracking. No external API calls.** Everything runs locally in your browser.

---

## Features

- **Whole-page highlight mode** — every acronym on the page is underlined automatically on load
- **MutationObserver** — catches dynamically loaded content (LinkedIn, Greenhouse, SPAs, infinite scroll)
- Shows primary meaning instantly on click, with alternatives
- Detects industry context (tech, finance, pharma, HR) to surface the most relevant definition
- Dark mode support
- Toggle on/off from the popup
- 100+ acronyms in the dictionary out of the box

## Changelog

### v1.1.0
- Whole-page highlight mode on by default — all acronyms underlined automatically
- MutationObserver added to scan dynamically injected content (LinkedIn job cards, SPA navigation, etc.)

### v1.0.0
- Initial release

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
├── manifest.json          # Chrome MV3 manifest
├── popup.html             # Extension popup UI
├── popup.css
├── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── content.js         # DOM scanner + tooltip engine
    ├── content.css        # Injected styles (tooltip + highlights)
    ├── background.js      # Service worker
    └── acronyms.json      # Local dictionary
```

---

## Adding Acronyms

Edit `src/acronyms.json`. Each entry follows this schema:

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

## Roadmap

- [X] Whole-page mode (auto-highlight all acronyms on load)
- [ ] User-contributed definitions (👍/👎 feedback)
- [ ] Domain whitelist / blacklist settings
- [ ] Community dictionary via GitHub-hosted JSON
- [ ] LLM-powered context ranking (post-MVP)

---

## License

MIT
