# Changelog

### v1.4.6
- Renamed `language` user property to `dictionary_language` to avoid conflict with GA4's auto-collected `language` event parameter

### v1.4.5
- Split analytics event `acronym_highlighted` into two distinct events:
  - `acronym_identified` — fires when the extension wraps an acronym in a span (once per unique word per page scan)
  - `acronym_highlighted` — fires when the user opens the tooltip (every occurrence)
- Debug mode now logs the full GA4 payload to console on each flush

### v1.4.4
- Analytics: added `session_id` and `engagement_time_msec` to all events for proper GA4 session and active-user attribution
- Analytics: added `setUserProperty()` API and `user_properties` support in the GA4 payload
- Analytics: added `dictionary_language` user property, set from the active dictionary language on page load
- Analytics: debug mode now flushes immediately on each `track()` call and uses `fetch()` instead of `sendBeacon` for visible response status
- Content: combined two `chrome.storage.sync.get` calls in `init()` into one

### v1.4.3
- Bugfix: fixed errors on LinkedIn caused by missing `chrome.runtime?.id` guard in analytics init

### v1.4.2
- Added `debug` flag to `AcronymConfig` (and `constants.example.js` template)
- Analytics: debug mode sends `debug_mode: 1` with all events, making them visible in GA4 DebugView

### v1.4.1
- Bugfix: fixed an endless-reload error when the extension context is invalidated — added `chrome.runtime?.id` guards in `loadAcronymData()` and the `MutationObserver` callback

### v1.4.0
- Added `constants.js` / `constants.example.js` for credential management (gitignored)

### v1.3.0
- Anonymous aggregate analytics via GA4 Measurement Protocol — events batched and flushed on page hide via `sendBeacon`
- Tracked events: `acronym_highlighted`, `rating_helpful`, `rating_not_helpful`

### v1.2.0
- Hover replaces click — tooltip opens on `mouseenter`, closes on `mouseleave` (150ms delay to allow mouse travel to tooltip)
- Rating system — 👍 / 👎 per definition, persisted to `chrome.storage.local`
- Multi-language support — dictionary renamed to `acronyms.en.json`; language resolved from `acLang` storage key

### v1.1.0
- Whole-page highlight mode on by default — all known acronyms underlined automatically
- MutationObserver added to scan dynamically injected content (LinkedIn job cards, SPA navigation, etc.)

### v1.0.0
- Initial release
