import fs from "node:fs";

const required = [
  "data/profile.json",
  "data/opportunity-index.json",
  "schemas/profile.schema.json",
  "schemas/opportunity.schema.json",
  "schemas/feed.schema.json",
  "schemas/interaction.schema.json",
  "skills/install-goodthings/SKILL.md",
  "prompts/install.md",
  "prompts/scheduled-task.md"
];

let ok = true;
for (const file of required) {
  if (!fs.existsSync(file)) {
    ok = false;
    console.error(`✗ missing ${file}`);
  } else {
    console.log(`✓ ${file}`);
  }
}

for (const name of ["GITHUB_OWNER", "GITHUB_REPO", "GITHUB_TOKEN"]) {
  console.log(`${process.env[name] ? "✓" : "·"} ${name}${process.env[name] ? " configured" : " not present in this shell"}`);
}

if (!ok) process.exit(1);
