import assert from "node:assert/strict";
import test from "node:test";
import { buildHistory, isOpportunityFile, isInteractionFile, loadHistory } from "../lib/history.ts";

const USER = "history-example-user";
function opportunity(id, title, source = "https://example.org/" + id, kind = "event") {
  return {
    id,
    identity: { kind, title, organizer: "Example Organizer" },
    summary: { short: title, long: "Some details" },
    taxonomy: { topics: ["AI"], audiences: [], tags: ["demo"] },
    provenance: { primary_source_url: source, verification_status: "verified" },
  };
}
function feed(at, opportunities, user_id = USER) {
  return {
    schema_version: "opportunity-feed.v1", generated_at: at, user_id,
    items: opportunities.map(opportunity => ({
      opportunity, match: { score: .8, why_you: "Match", why_now: "Now", next_step: "Visit" },
    })),
  };
}
function batch(events, user_id = USER) {
  return { user_id, events: events.map(([at, id, action]) => ({ at, opportunity_id: id, action })) };
}

test("accepts legacy and timestamped snapshots, ignores examples and unrelated files", () => {
  assert.equal(isOpportunityFile("data/opportunities/2026-10-18.json"), true);
  assert.equal(isOpportunityFile("data/opportunities/2026-10-18T14-05-59Z.json"), true);
  assert.equal(isOpportunityFile("data/opportunities/0000-00-00.example.json"), false);
  assert.equal(isOpportunityFile("data/opportunities/2026-10-18.json.bak"), false);
  assert.equal(isInteractionFile("data/interactions/2026-10-18-uuid.json"), true);
  assert.equal(isInteractionFile("data/interactions/.gitkeep"), false);
});

test("collects every preserved feed and newest snapshot, not just the most recent deck", () => {
  const old = opportunity("x", "Existing opportunity");
  const renewed = opportunity("x", "Existing opportunity");
  const other = opportunity("y", "Another opportunity");
  const result = buildHistory([
    feed("2026-10-17T10:00:00Z", [old]),
    feed("2026-10-18T10:00:00Z", [renewed, other]),
  ], [], USER);
  assert.equal(result.feed_count, 2);
  assert.equal(result.items.length, 2);
  const x = result.items.find(item => item.opportunity.id === "x");
  assert.equal(x.appearances, 2);
  assert.equal(x.first_seen_at, "2026-10-17T10:00:00Z");
  assert.equal(x.last_seen_at, "2026-10-18T10:00:00Z");
  assert.equal(x.decision, "unreviewed");
});

test("deduplicates safe same-source aliases without merging distinct opportunities on shared URLs", () => {
  const same = opportunity("new-id", "Existing opportunity", "https://example.org/x?utm_source=social");
  const old = opportunity("old-id", "Existing opportunity", "https://example.org/x");
  const distinct = opportunity("different", "Different opportunity", "https://example.org/x");
  const result = buildHistory([
    feed("2026-10-17T10:00:00Z", [old, distinct]),
    feed("2026-10-18T10:00:00Z", [same]),
  ], [batch([["2026-10-18T11:00:00Z", "new-id", "right"]])], USER);
  assert.equal(result.items.length, 2);
  assert.equal(result.items.find(item => item.decision === "want").appearances, 2);
});

test("reconstructs last real decision; detail and source do not count as decisions", () => {
  const result = buildHistory([feed("2026-10-18T10:00:00Z", [
    opportunity("a", "A"), opportunity("b", "B"), opportunity("c", "C"),
  ])], [
    batch([["2026-10-18T10:10:00Z", "a", "right"], ["2026-10-18T10:12:00Z", "b", "detail"]]),
    batch([["2026-10-18T10:20:00Z", "a", "left"], ["2026-10-18T10:25:00Z", "c", "source"]]),
  ], USER);
  assert.equal(result.items.find(item => item.opportunity.id === "a").decision, "pass");
  assert.equal(result.items.find(item => item.opportunity.id === "b").decision, "unreviewed");
  assert.equal(result.items.find(item => item.opportunity.id === "c").decision, "unreviewed");
});

test("rejects mismatched participants or malformed historical files rather than claiming completeness", () => {
  assert.throws(() => buildHistory([feed("2026-10-18T10:00:00Z", [opportunity("a", "A")], "somebody-else")], [], USER));
  assert.throws(() => buildHistory([feed("2026-10-18T10:00:00Z", [])], [batch([], "another-user")], USER));
  assert.throws(() => buildHistory([{ bad: true }], [], USER));
});

test("server reads latest GitHub blobs with a token and rejects truncated history trees", async () => {
  const savedFetch = globalThis.fetch;
  const prior = [process.env.GITHUB_OWNER, process.env.GITHUB_REPO, process.env.GITHUB_TOKEN];
  const calls = [];
  const f = feed("2026-10-18T10:00:00Z", [opportunity("remote", "Remote Opportunity")]);
  const b = batch([["2026-10-18T10:15:00Z", "remote", "right"]]);
  const toBlob = value => ({ encoding: "base64", content: Buffer.from(JSON.stringify(value)).toString("base64") });
  process.env.GITHUB_OWNER = "owner";
  process.env.GITHUB_REPO = "private";
  process.env.GITHUB_TOKEN = "test-token";
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), auth: options.headers.authorization, cache: options.cache });
    const data = String(url).includes("/git/trees/")
      ? { truncated: false, tree: [
          { path: "data/opportunities/2026-10-18.json", type: "blob", sha: "aaa" },
          { path: "data/interactions/2026-10-18-batch.json", type: "blob", sha: "bbb" },
        ] }
      : String(url).endsWith("/aaa") ? toBlob(f) : toBlob(b);
    return { ok: true, json: async () => data };
  };
  try {
    const result = await loadHistory(USER);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].decision, "want");
    assert.ok(calls.every(call => call.auth === "Bearer test-token" && call.cache === "no-store"));
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ truncated: true, tree: [] }) });
    await assert.rejects(() => loadHistory(USER), /incomplete/);
  } finally {
    globalThis.fetch = savedFetch;
    [process.env.GITHUB_OWNER, process.env.GITHUB_REPO, process.env.GITHUB_TOKEN] = prior;
  }
});
