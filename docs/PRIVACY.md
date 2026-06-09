# Privacy Policy — Acronymicon

_Last updated: 9 June 2026_

---

## Overview

Acronymicon is a browser extension that detects acronyms on web pages and shows instant definitions via tooltip. This policy explains what data is collected, how it is used, and what is stored on your device.

**The short version:** no personally identifiable information (PII) is ever collected. Your rating votes are stored locally on your device; submitting a rating sends an anonymous event to analytics (if configured) containing only the acronym and definition text. Analytics are anonymous and optional — the extension works fully without them.

---

## Data Collected

### Anonymous Analytics (optional)

If the extension owner has configured Google Analytics 4 (GA4) credentials, the following anonymous events are sent to GA4 via the Measurement Protocol when you leave or switch a tab:

| Data | Purpose |
|---|---|
| Acronym tokens detected on the page | Identify which acronyms are commonly encountered |
| Page hostname (e.g. `linkedin.com`) | Understand which sites the extension is used on |
| Whether an acronym has a dictionary entry | Measure dictionary coverage |
| Hover events on acronyms | Understand which acronyms users look up |
| Helpful / Not Helpful rating events (acronym + definition text) | Measure definition quality |
| Dictionary language in use | Support multi-language improvements |

All events are attributed to a **randomly generated anonymous device ID** (UUID) stored in `chrome.storage.local`. This ID is not linked to your Google account, browser profile, or any personal information. It cannot be used to identify you.

**If no GA4 credentials are configured, no data is sent anywhere.** The Web Store release build includes credentials and sends anonymous analytics to the extension developer. Builds loaded manually from source without credentials configured do not send any data.

### What is never collected

- Your name, email address, or any account information
- The full text or content of any page you visit
- Passwords, form inputs, or any data you type
- Your precise location
- Any data from `chrome://` or extension pages (the content script does not run there)

---

## Data Stored Locally

The following data is stored on your device only, using the Chrome extension storage API, and is never transmitted to any server:

| Key | Storage type | Contents |
|---|---|---|
| `acRatings` | `chrome.storage.local` | Your Helpful / Not Helpful votes, keyed by acronym and definition text — stores the current state of each vote locally; the act of submitting a rating also sends an analytics event (see above) |
| `acClientId` | `chrome.storage.local` | Anonymous random UUID for analytics attribution |
| `acEnabled` | `chrome.storage.sync` | Whether the extension is currently enabled |
| `acLang` | `chrome.storage.sync` | Your chosen dictionary language |

`chrome.storage.sync` keys (`acEnabled`, `acLang`) may be synced across your devices by Chrome if you are signed in and have sync enabled — this is handled entirely by Chrome and does not involve any Acronymicon server.

---

## Third-Party Services

When analytics are active, events are sent to **Google Analytics 4** (Google LLC) via the GA4 Measurement Protocol endpoint (`https://www.google-analytics.com/mp/collect`). This is the only external service the extension communicates with. Please refer to [Google's Privacy Policy](https://policies.google.com/privacy) for details on how Google handles this data.

No other third-party services receive any data from this extension.

---

## Permissions

| Permission | Why it is needed |
|---|---|
| `storage` | To persist your ratings, preferences, and anonymous analytics ID locally |
| `activeTab` | To allow the extension popup to retrieve live acronym statistics from the current tab and relay the on/off toggle |
| `host_permissions: google-analytics.com` | To send anonymous analytics events to GA4 |

The extension's dictionary is bundled locally within the extension package. No data is fetched from any remote server at runtime, and no remote code is executed.

---

## Your Choices

- **Disable analytics:** The Web Store build includes analytics. To opt out, disable the extension or uninstall it. Developers running from source without GA4 credentials configured are not tracked.
- **Clear your ratings:** You can remove all stored rating data by clearing the extension's storage via Chrome's developer tools (`chrome.storage.local.clear()`), or by uninstalling the extension.
- **Disable the extension:** Use the toggle in the extension popup or remove it from Chrome entirely.

---

## Changes to This Policy

If this policy changes materially, the _Last updated_ date at the top will be revised. Continued use of the extension after a change constitutes acceptance of the updated policy.

---

## Contact

For questions or concerns, open an issue at [github.com/robwadevision/acronymicon](https://github.com/robwadevision/acronymicon) or contact the developer directly.