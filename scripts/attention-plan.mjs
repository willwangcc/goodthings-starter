// Usage: node scripts/attention-plan.mjs <feed.json> <assessments.json> [attention-history.json]
// Prints candidate alerts only. No notification is sent and no history is written.
import fs from "node:fs";
import { selectAttentionCandidates } from "../lib/attention.mjs";

const [feedPath, assessmentsPath, historyPath = "data/attention-history.json"] = process.argv.slice(2);
if (!feedPath || !assessmentsPath) {
  console.error("Usage: node scripts/attention-plan.mjs <feed.json> <assessments.json> [attention-history.json]");
  process.exit(2);
}
try {
  const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
  const alerts = selectAttentionCandidates(read(feedPath), read(assessmentsPath), read(historyPath));
  process.stdout.write(JSON.stringify({ alert_count: alerts.length, alerts }, null, 2) + "\n");
} catch (error) {
  console.error("Attention plan failed:", error instanceof Error ? error.message : String(error));
  process.exit(1); // Fail closed, never fall back to unfiltered notifications.
}
