#!/usr/bin/env node
/**
 * Reads versionNumber from src/constants.js and syncs it to:
 *   - manifest.json  ("version" field)
 *   - CLAUDE.md      (**Current version:** line)
 *
 * Run after updating versionNumber: node scripts/sync-version.js
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const constants = fs.readFileSync(path.join(root, "src/constants.js"), "utf8");
const match = constants.match(/const versionNumber\s*=\s*["']([^"']+)["']/);

if (!match) {
  console.error("Could not find versionNumber in src/constants.js");
  process.exit(1);
}

const version = match[1];

// manifest.json
const manifestPath = path.join(root, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`manifest.json → ${version}`);

// CLAUDE.md (gitignored — skip if not present)
const claudePath = path.join(root, "CLAUDE.md");
if (fs.existsSync(claudePath)) {
  const claude = fs.readFileSync(claudePath, "utf8");
  const updatedClaude = claude.replace(
    /\*\*Current version:\*\* v[\d.]+/,
    `**Current version:** v${version}`
  );
  fs.writeFileSync(claudePath, updatedClaude, "utf8");
  console.log(`CLAUDE.md     → v${version}`);
} else {
  console.log("CLAUDE.md     → skipped (not present)");
}
