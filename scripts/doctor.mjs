import fs from "node:fs";

const required = [
  "data/profile.json",
  "data/opportunity-index.json",
  "schemas/profile.schema.json",
  "schemas/opportunity.schema.json",
  "schemas/feed.schema.json",
  "schemas/interaction.schema.json",
  "prompts/one-prompt-install.md",
  "prompts/scheduled-task.md",
  "skills/install-goodthings/SKILL.md",
  "docs/installation-test.md"
];
let ok = true;
for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error("✗ missing " + file);
    ok = false;
  } else {
    console.log("✓ " + file);
  }
}

for (const name of ["GOODTHINGS_ACCESS_PASSWORD", "GOODTHINGS_SESSION_SECRET", "GITHUB_OWNER", "GITHUB_REPO", "GITHUB_TOKEN"]) {
  console.log((process.env[name] ? "✓ " : "· ") + name + (process.env[name] ? " configured" : " not present in this shell"));
}
if (process.env.GOODTHINGS_ACCESS_PASSWORD && process.env.GOODTHINGS_ACCESS_PASSWORD.length < 16) {
  console.error("✗ access password too short (min 16)");
  ok = false;
}
if (process.env.GOODTHINGS_SESSION_SECRET && process.env.GOODTHINGS_SESSION_SECRET.length < 32) {
  console.error("✗ session secret too short (min 32)");
  ok = false;
}
if (!ok) process.exit(1);

