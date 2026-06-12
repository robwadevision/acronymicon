# Acronymicon 🔍

A lightweight browser extension that detects acronyms on web pages — especially job ads — and shows instant definitions via tooltip on hover.

**No backend. No PII collected.** Everything runs locally in your browser, with optional anonymous aggregate analytics.

---

## Features

- **Whole-page highlight mode** — every known acronym on the page is underlined automatically on load
- **Hover to reveal** — tooltip opens on mouseover; no click required (works correctly inside hyperlinks)
- **MutationObserver** — catches dynamically loaded content (LinkedIn, Greenhouse, SPAs, infinite scroll)
- Shows primary meaning instantly, with alternatives
- Industry-tagged definitions — every entry is labelled with one of 13 categories (`Business`, `Currencies`, `Finance`, `Gaming`, `General`, `Geography`, `Government`, `Media`, `Medical`, `Science`, `Sports`, `Tech`, `Work`) for richer context
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

Before loading the extension, create the required credentials file:

```
cp src/constants.example.js src/constants.js
```

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
  "definitions": [
    { "text": "Primary meaning", "industry": "Tech" },
    { "text": "Alternative meaning", "industry": "Finance" }
  ]
}
```

The first definition is treated as primary. `industry` is optional; omit it for cross-industry terms or use one of: `Tech`, `Finance`, `Medical`, `Sports`, `Government`, `Media`, `General`, `Geography`, `Gaming`, `Work`, `Currencies`, `Business`, `Science`

---

## Analytics

No PII is sent — only acronym tokens and event names, attributed to a randomly generated anonymous device ID.

See [PRIVACY.md](PRIVACY.md).
---

## Roadmap

- [x] Whole-page mode (auto-highlight all acronyms on load)
- [x] Hover to reveal (tooltip on mouseover)
- [x] Rating system (👍 / 👎 feedback)
- [x] Multi-language dictionary support
- [x] Anonymous aggregate analytics
- [x] Community dictionary via GitHub-hosted JSON

---

## Support

Acronymicon is free to use and always will be. If it saves you time and you'd like to say thanks, tips are entirely optional but very welcome!

[Tip via PayPal](https://www.paypal.com/donate?business=fringe_player%40hotmail.co.uk&item_name=Thanks+for+making+Acronymicon&currency_code=GBP)

---

## License

MIT

---

## Author

[Rob Wade](https://www.linkedin.com/in/robwadevision)