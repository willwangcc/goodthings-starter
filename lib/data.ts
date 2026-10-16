import fs from "node:fs";
import path from "node:path";

export type FeedItem = {
  opportunity: {
    id: string;
    identity: { kind: string; title: string; organizer: string };
    summary: { short: string; long?: string | null };
    lifecycle: { status: string; deadline_at?: string | null };
    geography: { mode: string; locations: Array<{ city?: string | null; region?: string | null; country?: string | null }> };
    benefits: Array<{ type: string; amount?: number | null; currency?: string | null; note?: string | null }>;
    provenance: { primary_source_url: string; verification_status: string };
  };
  match: {
    score: number;
    why_you: string;
    why_now: string;
    next_step: string;
  };
};

export type OpportunityFeed = {
  schema_version: "opportunity-feed.v1";
  generated_at: string;
  user_id: string;
  source_profile_updated_at: string;
  items: FeedItem[];
};

export function loadLatestFeed(): OpportunityFeed {
  const dir = path.join(process.cwd(), "data", "opportunities");
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .reverse();

  if (!files.length) {
    return {
      schema_version: "opportunity-feed.v1",
      generated_at: new Date(0).toISOString(),
      user_id: "UNCONFIGURED",
      source_profile_updated_at: "1970-01-01",
      items: [],
    };
  }

  return JSON.parse(fs.readFileSync(path.join(dir, files[0]), "utf8"));
}
