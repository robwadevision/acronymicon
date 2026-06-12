# Changelog

### v1.6.14
- Manifest: removed `src/constants.js` from `content_scripts` permanently — any zip built from the repo is now valid for Chrome Web Store upload without a CI pipeline
- Analytics: added `typeof AcronymConfig !== 'undefined'` guards so local dev no longer throws a `ReferenceError` when `constants.js` is absent; analytics degrades silently to a no-op
- Release workflow: updated GA4 credential injection to replace the entire `const` declaration line via regex, ensuring the shipped `analytics.js` contains a clean hardcoded value with no runtime conditional

### v1.6.13
- README: added Author section to both `README.md` and `docs/README.md` linking to the author's LinkedIn profile

### v1.6.12
- Release workflow: production zip no longer includes or references `src/constants.js` — the CI build now injects GA4 credentials directly into `analytics.js` via node string replacement, patches `manifest.json` to strip `src/constants.js` from `content_scripts`, and explicitly excludes both `constants.js` and `constants.example.js` from the zip; local dev workflow is unchanged
- Popup: added "About ↗" link to the footer pointing to the GitHub Pages README, alongside the existing GitHub link
- Popup: added a language badge to the header showing the active dictionary language (globe icon + language code read from `acLang` storage, defaulting to `EN`); non-interactive for now, structured for future language switching

### v1.6.11
- Tooltip: undefined acronyms are no longer highlighted or interactive — only dictionary-defined acronyms receive the underline and tooltip
- Analytics: `acronym_undefined` events continue to fire silently for unrecognised regex matches, preserving the dictionary-gap data signal

### v1.6.10
- GitHub Pages: moved Jekyll config (`_config.yml`) and privacy policy copy into a `docs/` subfolder — Chrome extension loader rejects filenames starting with `_` at the extension root
- GitHub Pages source updated to serve from `/docs` rather than root
- Release workflow: fixed missing line-continuation backslash in zip exclude list; added `docs/*` and `scripts/*` excludes

### v1.6.9
- Added `PRIVACY.md` — full privacy policy covering data collected (analytics events, hostname, acronym tokens, rating events), local storage keys (`acRatings`, `acClientId`, `acEnabled`, `acLang`), permissions justifications, third-party services, and user choices

### v1.6.8
- Dictionary: added 39 entries — UK Premier League clubs (AFC, AVFC, BHAFC, CFC, CPFC, EFC, LCFC, LFC, LUFC, MCFC, MUFC, NFFC, NUFC, SUFC, THFC, WHUFC), video game franchises (AOE, BOTW, COD, CSGO, DOTA, ESO, GTA, MK, NFS, PES, PUBG, RDR, TOTK, WOW), European football competitions (UCL, UEFA, UWCL), and hardware/display terms (HD, NAS, PD, RGB, SD, WiFi)

### v1.6.7
- Dictionary: added 30 audiovisual and display technology entries — display technologies (AMOLED, FHD, IPS, LCD, LED, OLED, QLED, QHD), display features (AOD, DCI, FALD, HDCP, VRR), connectivity (ARC, CEC, DP), audio codecs (AAC, ALAC, FLAC, SBC, WAV), audio hardware (ADC, DAC, DSP, ENC, SNR, THD), camera optics (OIS, PDAF)

### v1.6.6
- Dictionary: added 31 sports position acronyms — association football (CAM, CB, CDM, CF, CM, GK, LB, LM, LW, RM, RW, ST), American football (DT, FL, FS, OT, QB, RB, TE, WR), basketball (PF, PG, SF), baseball (DH, LF, RF, RP, SP, SS), and field hockey/rugby positions (FH, SH)

### v1.6.5
- Dictionary: added 10 entries — social/messaging platforms (DMs, FB, IG), financial regulation (EMIR, FIS), enterprise software (AMS, SAP), and others (IMI, ION, TT)

### v1.6.4
- Dictionary: added 7 entries — AGI (Artificial General Intelligence), CX (Customer Experience), EA (Electronic Arts / Enterprise Agreement), GCGRA (General Commercial Gaming Regulatory Authority), IDS (Intrusion Detection System), LLC (Limited Liability Company), PI (Principal Investigator)

### v1.6.3
- Dictionary: added ~72 new entries across Science (ADME, ATP, AUC, BBB, CRISPR, ELISA, EMA, GLP, GMO, GMP, HPLC, NMR, PCR, RCT, RNA, SNP, UV), Tech (CMOS, CSRF, EKS, GPU, GRR, TLS), Media (ACX, AM, FM, ITV, TV), and General/cross-industry (AA, ANC, BOE, CS, CT, DEI, DIY, DNA, FIFA, ICT, IMF, JPG, LA, MDR, MIT, ML, MRI, NEC, NFL, PDF, PNG, QBR, SEO, SIM, SLAs, UI, UX, VPN, WHO, WWE, and others)
- Popup: `dictionarySize` refactored to count total definitions (sum of each entry's `definitions.length`) rather than top-level keys — the "X Definitions available" stat now reflects the number of meanings, not the number of acronyms

### v1.6.2
- Tooltip: replaced single bottom "Helpful?" rating row with per-definition 👍/👎 buttons inline with each option
- Rating storage key changed from `word` to composite `word||definition text` to support independent ratings across multiple definitions per acronym
- CSS: added `.ai-tooltip-def-text` for correct flex layout of definition text alongside industry badges and rating buttons

### v1.6.1
- Tooltip: re-implemented page industry context detection — `detectPageIndustry()` scans up to 50k chars of page text against keyword signals for 10 industries, requiring a score of ≥ 2 with a clear lead over second place to avoid false positives
- Tooltip: "Most likely" definition surfaced at the top of the tooltip in a highlighted card when a page industry match is found; matched definition also retained at the bottom of the options list
- CSS: added `.ai-tooltip-primary-label` and `.ai-tooltip-primary` styles for the "Most likely" highlighted card
- CSS: added industry badge colour rules for the 9 new categories added in v1.6.0 (Business, Currencies, Gaming, General, Geography, Government, Media, Science, Work)

### v1.6.0
- Dictionary: all definitions now carry an `industry` tag — 100% coverage across 13 categories: `Business`, `Currencies`, `Finance`, `Gaming`, `General`, `Geography`, `Government`, `Media`, `Medical`, `Science`, `Sports`, `Tech`, `Work`
- Added 9 new categories beyond the original `Tech`, `Finance`, `Medical`, `Sports`: `Business` (job titles, HR, strategy), `Currencies` (ISO 4217 codes), `Gaming`, `General` (cross-industry terms), `Geography` (country codes, place names), `Government` (agencies, departments), `Media` (streaming, broadcasting), `Science`, `Work` (employment law, professional bodies)
- Added `scripts/list-untagged.js` — developer utility that scans the dictionary and regenerates `UNTAGGED.md` with any definitions missing an industry tag
- Added `UNTAGGED.md` — tracked list of untagged definitions for use during categorisation

### v1.5.18
- Tooltip: all definitions now shown in a flat "Options" list — primary definition included in the list rather than displayed separately above
- Tooltip: removed "Most likely meaning" / "Most likely in X context" label; removed "Also means" label (replaced by "Options")
- Popup: removed the industry-context badge from the header
- Removed page-context (industry) detection entirely — no longer scans page text on load

### v1.5.17
- Dictionary: added 33 computer hardware and component entries — storage (HDD, RAID, SATA, SSD), flash memory (NAND, UFS), memory (DDR, DIMM, DRAM, ECC, SRAM, VRAM), processors (APU, NPU, TPU), connectivity (HDMI, USB, VGA, DVI), expansion (PCB), firmware (BIOS, CMOS, POST, UEFI, ACPI), power (PSU, TDP, TDP, UPS), and performance (FLOPS, IOPS, DMA, IRQ, SMT)

### v1.5.16
- Dictionary: added 24 job seeking entries — recruitment tools (ATS, VMS), compensation (COLA, ESOP, ESPP, LTI, LTIP, TC), contracts (MSA, MSP, RPO, SOW), workplace (BYOD, DEI, ERG, HRIS, WLB), credentials (CIPD, SHRM), job ads (CV, EEO, EOE, JD), and interview techniques (STAR)
- Dictionary: DOE gains "Depends on Experience" as an alternative; FTC gains "Fixed-Term Contract"

### v1.5.15
- Dictionary: added 32 mental health entries — conditions (ADD, ADHD, ARFID, ASD, BPD, CPTSD, DID, EUPD, GAD, MDD, OCD, ODD, PMDD, PND, PPD, PTSD, SAD, SPD), therapies (CBT, EMDR, TMS), medications (MAOI, SNRI, SSRI, TCA), services (CAMHS, CMHT, IAPT, MHFA), diagnostic systems (DSM, ICD), and general (MH)
- Dictionary: DBT gains "Dialectical Behaviour Therapy" as an alternative

### v1.5.14
- Dictionary: added 26 board game and tabletop entries — community (BGG, FLGS, KS, LGS, MSRP, PnP, TTS), card games (CCG, LCG, MTG, TCG), board game mechanisms (AP, CDG, COIN), RPG (NPC, OSR, PBTA, RAI, RAW, RPG, SRD, TTRPG, WoTC, XP), and general (HP, PC)
- Dictionary: DM gains "Dungeon Master", GM gains "Game Master", OOP gains "Out of Print", VP gains "Victory Points" as alternatives

### v1.5.13
- Dictionary: added 36 media and streaming terms — delivery protocols (ABR, DASH, HLS, RTMP, RTSP), business models (AVOD, FAST, OTT, SVOD, TVOD, VOD), platforms (CTV, IPTV, STB), content protection (DRM), video (AVC, DVR, EPG, FPS, HDR, HEVC, PVR, UHD), advertising (CPA, CPC, CPM, CTR, DAI, VAST), and general (DAU, FTA, MAU, MCN, UGC)
- Dictionary: SDR gains "Standard Dynamic Range" as an alternative

### v1.5.12
- Bugfix: skip acronym detection when the matched token is immediately preceded by `#`, eliminating hashtag false positives (e.g. `#CEO`, `#HR`)

### v1.5.11
- Bugfix: release workflow moved from repo root to `.github/workflows/release.yml` — it was never being picked up by GitHub Actions, causing `constants.js` to be missing from all GitHub release zips
- README: added setup step to Install (Development / Unpacked) instructions — copy `src/constants.example.js` to `src/constants.js` before loading the extension
- Dictionary: added 38 pluralised job title entries: AEs, AVPs, BDMs, BDRs, CCOs, CDOs, CEOs, CFOs, CHROs, CIOs, CISOs, CLOs, CMOs, COOs, CPOs, CROs, CSMs, CSOs, CTOs, DBAs, DPOs, EDs, EMs, EVPs, GMs, GPs, HRBPs, ICs, LPs, MDs, PMs, SDRs, SREs, SVPs, TLs, TPMs, VCs, VPs
- Analytics: added `page_hostname` param to all tracked events — captures the site domain (`window.location.hostname`) automatically on every event

### v1.5.10
- Added 29 UK government departments and agencies: ACAS, CAA, CMA, CPS, CQC, DBT, DEFRA, DfE, DfT, DSIT, DVLA, DVSA, DWP, FCDO, GCHQ, HMRC, HMT, HSE, MOD, MOJ, NAO, NCA, NHS, NHSE, OBR, ONS, SIS, UKHSA, UKRI
- Added 45 US government departments and agencies: ATF, BLS, CBP, CBO, CDC, CFPB, CFTC, CIA, DEA, DHS, DOD, DOE, DOJ, DOL, DOS, DOT, EEOC, EPA, FBI, FCC, FDIC, FEMA, FDA, FTC, GAO, GSA, HHS, HUD, ICE, IRS, NASA, NIH, NIST, NOAA, NSA, NSF, OSHA, OMB, OPM, POTUS, SCOTUS, SSA, TSA, USCIS, USDA, USPS, VA
- Updated CMS to include "Centers for Medicare and Medicaid Services" as an alternative
- Updated NPS to include "National Park Service" as an alternative
- DOS set as "Disk Operating System" (primary) with "Department of State" and "Denial of Service" as alternatives
- CPS set as "Crown Prosecution Service" (primary) with "Child Protective Services" as alternative

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
