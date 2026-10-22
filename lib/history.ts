import fs from "node:fs";
import path from "node:path";
import type { FeedItem, OpportunityFeed } from "./data";

type InteractionBatch = {
  user_id: string;
  events: Array<{ at: string; opportunity_id: string; action: string }>;
};

export type HistoryDecision = "want" | "pass" | "unreviewed";
export type HistoryItem = {
  id: string;
  opportunity: FeedItem["opportunity"];
  match: FeedItem["match"];
  first_seen_at: string;
  last_seen_at: string;
  appearances: number;
  decision: HistoryDecision;
  decided_at: string | null;
};

export type HistorySnapshot = {
  items: HistoryItem[];
  feed_count: number;
  interaction_batch_count: number;
};

const FEED_FILE = /^data\/opportunities\/\d{4}-\d{2}-\d{2}(?:T\d{2}-\d{2}-\d{2}Z)?\.json$/;
const INTERACTION_FILE = /^data\/interactions\/[^/]+\.json$/;
export const isOpportunityFile = (name: string) => FEED_FILE.test(name);
export const isInteractionFile = (name: string) => INTERACTION_FILE.test(name);

function canonicalSource(raw: string | undefined): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return "";
  }
}

// Deliberately narrower than the full schema: historical v1 files should remain readable
// without migrating them whenever the live Opportunity schema evolves.
function assertFeed(input: unknown, expectedUser: string): asserts input is OpportunityFeed {
  const feed = input as Partial<OpportunityFeed> | null;
  if (!feed || feed.schema_version !== "opportunity-feed.v1" ||
      feed.user_id !== expectedUser || !Array.isArray(feed.items) ||
      typeof feed.generated_at !== "string" || !Number.isFinite(Date.parse(feed.generated_at))) {
    throw new Error("Invalid or out-of-scope opportunity history.");
  }
  for (const item of feed.items) {
    if (!item?.opportunity?.id || !item.opportunity.identity?.title ||
        !item.opportunity.identity?.organizer || !item.match) {
      throw new Error("Invalid opportunity history entry.");
    }
  }
}

function assertBatch(input: unknown, expectedUser: string): asserts input is InteractionBatch {
  const batch = input as Partial<InteractionBatch> | null;
  if (!batch || batch.user_id !== expectedUser || !Array.isArray(batch.events) ||
      batch.events.some(event => !event || typeof event.at !== "string" ||
        !event.opportunity_id || !event.action)) {
    throw new Error("Invalid or out-of-scope interaction history.");
  }
}

export function buildHistory(
  rawFeeds: unknown[],
  rawBatches: unknown[],
  expectedUser: string,
): HistorySnapshot {
  const feeds = rawFeeds.map((value) => {
    assertFeed(value, expectedUser);
    return value;
  }).sort((a, b) => a.generated_at.localeCompare(b.generated_at));
  const batches = rawBatches.map((value) => {
    assertBatch(value, expectedUser);
    return value;
  });

  const records = new Map<string, HistoryItem>();
  const aliasToKey = new Map<string, string>();
  const idToKey = new Map<string, string>();
  for (const feed of feeds) {
    const seenInFeed = new Set<string>();
    for (const item of feed.items) {
      const op = item.opportunity;
      // A shared organizer landing page is NOT enough to merge distinct opportunities.
      const source = canonicalSource(op.provenance?.primary_source_url);
      const alias = source
        ? source + "|" + op.identity.organizer.trim().toLowerCase() + "|" + op.identity.title.trim().toLowerCase()
        : "";
      const key = idToKey.get(op.id) || (alias ? aliasToKey.get(alias) : undefined) || op.id;
      idToKey.set(op.id, key);
      if (alias) aliasToKey.set(alias, key);
      const previous = records.get(key);
      if (!previous) {
        records.set(key, {
          id: key, opportunity: op, match: item.match,
          first_seen_at: feed.generated_at, last_seen_at: feed.generated_at,
          appearances: 1, decision: "unreviewed", decided_at: null,
        });
      } else {
        if (feed.generated_at >= previous.last_seen_at) {
          previous.opportunity = op;
          previous.match = item.match;
          previous.last_seen_at = feed.generated_at;
        }
        if (!seenInFeed.has(key)) previous.appearances += 1;
      }
      seenInFeed.add(key);
    }
  }

  // Only left/right are decisions. Inspecting a source or detail never implies Want.
  const decisions = batches.flatMap(batch => batch.events)
    .filter(event => event.action === "left" || event.action === "right")
    .sort((a, b) => a.at.localeCompare(b.at));
  for (const event of decisions) {
    const key = idToKey.get(event.opportunity_id);
    const entry = key ? records.get(key) : undefined;
    if (entry) {
      entry.decision = event.action === "right" ? "want" : "pass";
      entry.decided_at = event.at;
    }
  }

  return {
    items: [...records.values()].sort((a, b) =>
      b.last_seen_at.localeCompare(a.last_seen_at) || a.id.localeCompare(b.id)),
    feed_count: feeds.length,
    interaction_batch_count: batches.length,
  };
}

type GitTree = { truncated?: boolean; tree?: Array<{ path: string; type: string; sha: string }> };
type GitBlob = { encoding?: string; content?: string };
const GITHUB_HEADERS = (token: string) => ({
  authorization: "Bearer " + token,
  accept: "application/vnd.github+json",
  "x-github-api-version": "2022-11-28",
});

async function loadRemoteHistory(owner: string, repo: string, token: string, userId: string): Promise<HistorySnapshot> {
  const root = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo);
  const headers = GITHUB_HEADERS(token);
  // Refresh from GitHub on every authenticated request; a feedback write does
  // not necessarily trigger a new Vercel deployment.
  const treeResponse = await fetch(root + "/git/trees/main?recursive=1", { headers, cache: "no-store" });
  if (!treeResponse.ok) throw new Error("GitHub history index unavailable.");
  const tree = await treeResponse.json() as GitTree;
  if (tree.truncated || !Array.isArray(tree.tree)) {
    throw new Error("GitHub history index is incomplete.");
  }
  const refs = tree.tree.filter(file =>
    file.type === "blob" && (isOpportunityFile(file.path) || isInteractionFile(file.path)));
  async function readBlob(sha: string): Promise<unknown> {
    const response = await fetch(root + "/git/blobs/" + encodeURIComponent(sha), {
      headers, cache: "no-store",
    });
    if (!response.ok) throw new Error("Cannot read private history file.");
    const blob = await response.json() as GitBlob;
    if (blob.encoding !== "base64" || !blob.content) {
      throw new Error("Invalid private history file encoding.");
    }
    return JSON.parse(Buffer.from(blob.content.replace(/\s/g, ""), "base64").toString("utf8"));
  }
  // Bounded concurrent reads to avoid a burst of unbounded GitHub requests.
  const content: unknown[] = new Array(refs.length);
  const concurrency = Math.min(6, refs.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < refs.length) {
      const index = cursor++;
      content[index] = await readBlob(refs[index].sha);
    }
  }));
  return buildHistory(
    content.filter((_, i) => isOpportunityFile(refs[i].path)),
    content.filter((_, i) => isInteractionFile(refs[i].path)),
    userId,
  );
}

function loadLocalHistory(userId: string): HistorySnapshot {
  function readDirectory(dir: string, matches: (path: string) => boolean): unknown[] {
    const folder = path.join(process.cwd(), "data", dir);
    if (!fs.existsSync(folder)) return [];
    return fs.readdirSync(folder)
      .map(name => "data/" + dir + "/" + name)
      .filter(matches)
      .map(file => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), "utf8")));
  }
  return buildHistory(
    readDirectory("opportunities", isOpportunityFile),
    readDirectory("interactions", isInteractionFile),
    userId,
  );
}

export async function loadHistory(userId: string): Promise<HistorySnapshot> {
  const { GITHUB_OWNER: owner, GITHUB_REPO: repo, GITHUB_TOKEN: token } = process.env;
  if (!owner && !repo && !token) return loadLocalHistory(userId);
  if (!owner || !repo || !token) throw new Error("Private history access is not fully configured.");
  return loadRemoteHistory(owner, repo, token, userId);
}
