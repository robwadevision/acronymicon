#!/usr/bin/env node
// Prints all definitions in acronyms.en.json that have no industry tag,
// and rewrites UNTAGGED.md with the current results.

const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, '../src/acronyms.en.json');
const outPath = path.join(__dirname, '../UNTAGGED.md');

const data = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

const untagged = [];
for (const [key, entry] of Object.entries(data)) {
  if (key === '_meta') continue;
  for (const def of entry.definitions) {
    if (!def.industry) {
      untagged.push({ acronym: key, text: def.text });
    }
  }
}
untagged.sort((a, b) => a.acronym.localeCompare(b.acronym));

const rows = untagged.map(u => `| ${u.acronym} | ${u.text} |`).join('\n');
const uniqueAcronyms = new Set(untagged.map(u => u.acronym)).size;

const md = `# Untagged Definitions

Definitions in \`src/acronyms.en.json\` that have no \`industry\` tag.
Run \`node scripts/list-untagged.js\` to regenerate this list.

| Acronym | Definition |
|---------|-----------|
${rows}

**Total: ${untagged.length} untagged definition${untagged.length !== 1 ? 's' : ''} across ${uniqueAcronyms} acronym${uniqueAcronyms !== 1 ? 's' : ''}**
`;

fs.writeFileSync(outPath, md);
console.log(`UNTAGGED.md updated — ${untagged.length} untagged definitions across ${uniqueAcronyms} acronyms`);
