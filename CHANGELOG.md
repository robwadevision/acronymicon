# Changelog

### v1.5.9
- Added ~70 programming and web technology terms: ACID, AJAX, AOT, AST, BDD, CLI, CMS, CORS, CQRS, CRUD, CSRF, CSP, CSR, CSS, DDD, DHCP, DI, DOM, DRY, ECMA, ETL, FTP, GC, GUI, HTML, HTTP, HTTPS, IEEE, IMAP, IoC, IP, JIT, JSON, JWT, KISS, LAN, MR, MVC, MVVM, NAT, NoSQL, OLAP, OLTP, OS, OSS, POSIX, PWA, RAM, ROM, SAML, SFTP, SMTP, SOA, SOAP, SPA, SQL, SSH, SSG, SSR, TDD, UDP, URI, URL, VM, VPN, WAN, WASM, XML, XSS, YAGNI, YAML
- Ambiguous entries carry industry overrides: CSR (tech → Client-Side Rendering), GC (tech → Garbage Collection), IP (tech → Internet Protocol), JIT (tech → Just-In-Time Compilation), MR (tech → Merge Request), ROM (pharma → Range of Motion)
- MVP updated with "Model-View-Presenter" as an additional alternative

### v1.5.7
- Added 27 job title acronyms: AVP, BDM, BDR, CCO, CDO, CHRO, CIO, CLO, CRO, CSM, CSO, DBA, ED, ELT, EVP, FTE, GM, HM, HRBP, MD, QE, SDR, SLT, SVP, TA, TL, TPM
- SDR carries a `finance` industry override (Special Drawing Rights); all other new entries have no industry tag
- Updated existing entries: AE gains "Account Executive" as an alternative; SA gains "Solutions Architect" as an alternative with a `tech` industry override; PM gains "Programme Manager" as an alternative
- Popup now shows "X Definitions available" below the stat note, sourced from the live dictionary size
- `AC_GET_STATS` response extended with `dictionarySize` (total entries in the loaded dictionary, excluding `_meta`)
- Added ~52 finance and investment terms: ABS, ACV, AML, ARPU, AUM, CAGR, CDS, DCF, DD, DPI, EBIT, EPS, ETF, EV, FCA, FCF, FDI, FIFO, FY, GAAP, GP, IFRS, IPO, IRR, KYC, LBO, LIFO, LOI, LP, MBO, MBS, MOIC, NAV, NDA, NPS, NPV, NRR, OTC, PEG, REIT, RSU, SAFE, SAM, SEC, SOM, SPV, TAM, TCV, TVPI, VC, WACC, YTD
- Updated CDO, CLO, CMO with their respective collateralised securities meanings as `finance` industry overrides (CDO → Collateralised Debt Obligation, CLO → Collateralised Loan Obligation, CMO → Collateralised Mortgage Obligation)
- Updated IC with "Investment Committee" as a `finance` industry override
- Updated QE with "Quantitative Easing" as a `finance` industry override

### v1.5.6
- Added 52 ISO 3166-1 alpha-2 country codes to the dictionary (AE, AR, AT, BE, BR, CA, CH, CL, CN, CO, CZ, DE, DK, EG, ES, EU, FI, FR, GB, GR, HK, HU, ID, IL, IN, JP, KR, KW, MX, MY, NG, NL, NO, NZ, PE, PH, PK, PL, PT, RO, RU, SA, SE, SG, TH, TW, UA, UK, US, VN, ZA)
- Country codes carry no industry tag unless an alternate meaning is industry-specific (SE → Software Engineer in tech; ID → Identifier in tech; PT → Physical Therapy in pharma; PE → Private Equity in finance)
- Four existing entries updated to add country as an alternative: CI (Côte d'Ivoire), HR (Croatia), IT (Italy), QA (Qatar); QA gains a tech industry override since its primary meaning is industry-specific
- Added 3-letter codes for countries where the 3-letter form is in common use: UAE, USA, GBR, AUS, CAN, CHN, JPN, KOR, IND, BRA, MEX, ARG, RUS, TUR, UKR, ISR, EGY, NGA, PAK, ZAF, QAT, COL, ESP, NOR, SWE, POL, NZL, KSA (Saudi Arabia — common informal code, not ISO standard)
- Also added missing 2-letter codes AU (Australia) and TR (Turkey)

### v1.5.5
- Popup stats renamed "Found" → "Identified" to align with analytics event naming
- Removed the "Undefined" stat column; replaced with a text note below the stats (e.g. "3 identified without a definition") that only appears when the gap is non-zero
- `AC_GET_STATS` response key renamed `found` → `identified` to match
- Added 42 ISO 4217 currency codes to the dictionary (AED, ARS, AUD, BRL, CAD, CHF, CLP, CNY, COP, CZK, DKK, EGP, EUR, GBP, HKD, HUF, IDR, ILS, INR, JPY, KRW, KWD, MXN, MYR, NGN, NOK, NZD, PHP, PKR, PLN, QAR, RUB, SAR, SEK, SGD, THB, TRY, TWD, UAH, USD, VND, ZAR)
- All currency entries include a `finance` industry override and alternatives where relevant (e.g. CNY → Renminbi, GBP → Sterling)
- Ambiguous codes carry additional alternatives (PHP → Hypertext Preprocessor in tech, SAR → Suspicious Activity Report/Search and Rescue, COP → Community of Practice)

### v1.5.4
- Removed dictionary gating — all regex-matched acronyms are highlighted, not just those with a dictionary entry
- `acronym_highlighted` now fires for undefined acronyms too, capturing user intent (hover on unknown term = desire to know)
- `acronym_undefined` still fires on page scan to flag gaps in the dictionary

### v1.5.3
- Popup and tooltip redesigned with a dark purple theme (`#1e0a3c` background, white text)
- Tooltip now has a branded "The Acronymicon" header with a purple accent and divider
- Acronym label in tooltip coloured in light purple (`#a78bfa`) to visually distinguish it from the definition
- Acronym label font size increased from 10px to 14px
- Tooltip scaled up 10% proportionally (width 240px → 264px, all font sizes and spacing adjusted)
- `versionNumber` constant added to `src/constants.js` as the single source of truth for the version
- `scripts/sync-version.js` added to propagate `versionNumber` to `manifest.json` and `CLAUDE.md`
- Release workflow updated to generate `constants.js` from the git tag and run the version sync before zipping

### v1.5.2
- Reverted visual highlighting to dictionary-gated only — too many false positives on all-caps words when highlighting all regex matches
- `acronym_undefined` analytics event still fires silently for regex matches with no dictionary entry, preserving the data signal without the UX noise

### v1.5.1

- CSS changes and version control sync to enable one-place updates

### v1.5.0
- All regex-matched acronyms are now highlighted, regardless of whether they have a dictionary entry
- Tooltip already handled the no-definition case ("No definition available yet") — no UI change needed
- `acronym_undefined` analytics event now fires for regex matches with no dictionary entry (once per unique word per page scan)
- Deleted legacy `acronyms.json` from root (superseded by `src/acronyms.en.json`)

### v1.4.8
- Analytics: `rating_helpful` and `rating_not_helpful` events now both include `definition` param — the primary definition text shown at the time of rating

### v1.4.7

- Abstracted changelog into its own file, and alphabetised the definitions

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
