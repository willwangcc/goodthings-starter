import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const opportunitySchema = readJson("schemas/opportunity.schema.json");
const profileSchema = readJson("schemas/profile.schema.json");
const feedSchema = readJson("schemas/feed.schema.json");
const interactionSchema = readJson("schemas/interaction.schema.json");
const installationReportSchema = readJson("schemas/installation-report.schema.json");
const attentionHistorySchema = readJson("schemas/attention-history.schema.json");

ajv.addSchema(opportunitySchema, "opportunity.schema.json");
const validateProfile = ajv.compile(profileSchema);
const validateFeed = ajv.compile(feedSchema);
const validateInteraction = ajv.compile(interactionSchema);
const validateInstallationReport = ajv.compile(installationReportSchema);
const validateAttentionHistory = ajv.compile(attentionHistorySchema);

const checks = [];
checks.push(["data/profile.json", validateProfile, readJson("data/profile.json")]);
checks.push(["data/attention-history.json", validateAttentionHistory, readJson("data/attention-history.json")]);
checks.push(["examples/installation-report.example.json", validateInstallationReport, readJson("examples/installation-report.example.json")]);

for (const name of fs.readdirSync(path.join(root, "data/opportunities")).filter((n) => n.endsWith(".json"))) {
  checks.push([`data/opportunities/${name}`, validateFeed, readJson(`data/opportunities/${name}`)]);
}
for (const name of fs.readdirSync(path.join(root, "data/interactions")).filter((n) => n.endsWith(".json"))) {
  checks.push([`data/interactions/${name}`, validateInteraction, readJson(`data/interactions/${name}`)]);
}

const reportDir = path.join(root, "data/installation-reports");
if (fs.existsSync(reportDir)) {
  for (const name of fs.readdirSync(reportDir).filter((n) => n.endsWith(".json"))) {
    checks.push([
      `data/installation-reports/${name}`,
      validateInstallationReport,
      readJson(`data/installation-reports/${name}`)
    ]);
  }
}

let failed = false;
for (const [name, validate, value] of checks) {
  const ok = validate(value);
  if (!ok) {
    failed = true;
    console.error(`\n✗ ${name}`);
    console.error(validate.errors);
  } else {
    console.log(`✓ ${name}`);
  }
}

if (failed) process.exit(1);
