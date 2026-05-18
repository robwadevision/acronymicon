# Acronymicon 🔍

A lightweight browser extension that detects acronyms on web pages — designed primarily for job ads — and shows instant definitions via a tooltip on click.

**No backend. No tracking. No external API calls.** Everything runs locally in your browser.

---

## Features

- Detects acronyms using a fast regex + local dictionary
- Shows primary meaning instantly on click, with alternatives
- Detects industry context (tech, finance, pharma, HR) to surface the most relevant definition
- Dark mode support
- Toggle on/off per session from the popup
- 100+ acronyms in the dictionary out of the box

---

## Install (Development / Unpacked)

### Chrome
1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`acronym-clarity/`)

### Edge
1. Open `edge://extensions`
2. Enable **Developer mode** (left sidebar)
3. Click **Load unpacked**
4. Select this folder

---

## Project Structure

```
acronym-clarity/
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

## Publishing to Chrome Web Store

1. Zip the extension folder:
   ```bash
   cd acronym-clarity && zip -r ../acronym-clarity.zip . --exclude "*.DS_Store"
   ```
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Click **New item** → upload the zip
4. Fill in store listing details, add screenshots, submit for review

> Chrome Web Store requires a one-time $5 developer registration fee.

### Publishing to Edge Add-ons
1. Zip the same folder (same codebase works for Edge)
2. Go to [Edge Add-ons Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)
3. Submit for review (free, no fee)

---

## Roadmap

- [ ] Whole-page mode (auto-highlight all acronyms on load)
- [ ] User-contributed definitions (👍/👎 feedback)
- [ ] Domain whitelist / blacklist settings
- [ ] Community dictionary via GitHub-hosted JSON
- [ ] LLM-powered context ranking (post-MVP)

---

## License

MIT
