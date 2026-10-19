import assert from "node:assert/strict";
import { test } from "node:test";
import { attentionKey, recordSurfaced, selectAttentionCandidates } from "../lib/attention.mjs";

function card(id, score = 0.85, opts = {}) {
  return {
    opportunity: {
      id,
      identity: { kind: "event", title: opts.title || "Event " + id, organizer: "Organizer" },
      lifecycle: { status: opts.status || "open", deadline_at: opts.deadline || "2026-11-01T00:00:00Z" },
      provenance: { primary_source_url: opts.url || "https://example.org/" + id, verification_status: opts.verification || "verified" }
    },
    match: { score, why_you: "Aligned with the user's project", why_now: "Applications close soon", next_step: "Review application page" }
  };
}
function assessment(id, overrides = {}) {
  return { opportunity_id: id, actionable_now: true, why_interrupt: "Unusual fit with a narrow window", time_evidence: "Verified closing date", next_move_minutes: 15, ...overrides };
}
const feed = (items) => ({ items });

test("zero qualified opportunities means zero alerts: fail closed without evidence", () => {
  assert.deepEqual(selectAttentionCandidates(feed([card("a", 0.74)]), [assessment("a")]), []);
  assert.deepEqual(selectAttentionCandidates(feed([card("a")]), []), []);
  assert.deepEqual(selectAttentionCandidates(feed([card("a")]), [assessment("a", { actionable_now: false })]), []);
  assert.deepEqual(selectAttentionCandidates(feed([card("a")]), [assessment("a", { time_evidence: "" })]), []);
});

test("fit threshold is inclusive, and top three are ranked (no quota filling)", () => {
  const items = [card("a", 0.75), card("b", 0.95), card("c", 0.8), card("d", 0.9), card("e", 0.74)];
  const alerts = selectAttentionCandidates(feed(items), items.map((x) => assessment(x.opportunity.id)));
  assert.deepEqual(alerts.map((x) => x.opportunity_id), ["b", "d", "c"]);
  assert.equal(selectAttentionCandidates(feed([card("a", 0.75)]), [assessment("a")]).length, 1);
});

test("not actionable, stale, unverified, and out-of-range next moves cannot alert", () => {
  assert.deepEqual(selectAttentionCandidates(feed([card("a", 0.9, { status: "closed" })]), [assessment("a")]), []);
  assert.deepEqual(selectAttentionCandidates(feed([card("a", 0.9, { verification: "partial" })]), [assessment("a")]), []);
  for (const minutes of [0, 4, 31, 90, 10.5]) {
    assert.deepEqual(selectAttentionCandidates(feed([card("a")]), [assessment("a", { next_move_minutes: minutes })]), []);
  }
  assert.equal(selectAttentionCandidates(feed([card("a")]), [assessment("a", { next_move_minutes: 5 })]).length, 1);
  assert.equal(selectAttentionCandidates(feed([card("a")]), [assessment("a", { next_move_minutes: 30 })]).length, 1);
});

test("same edition is deduped across source aliases, history and reruns", () => {
  const a = card("a", 0.96, { title: "Same event", url: "https://example.org/event?utm_source=email" });
  const alias = card("alias", 0.91, { title: "Same event", url: "https://example.org/event" });
  const assessments = [assessment("a"), assessment("alias")];
  const first = selectAttentionCandidates(feed([a, alias]), assessments);
  assert.equal(first.length, 1);
  const history = recordSurfaced({ surfaced: [] }, first, "2026-10-19T02:00:00Z");
  assert.equal(history.surfaced.length, 1);
  assert.equal(selectAttentionCandidates(feed([a, alias]), assessments, history).length, 0);
  // Reopened/new edition with a new verified deadline must not be permanently suppressed.
  const nextEdition = card("a2", 0.96, { title: "Same event", url: "https://example.org/event", deadline: "2027-11-01T00:00:00Z" });
  assert.equal(selectAttentionCandidates(feed([nextEdition]), [assessment("a2")], history).length, 1);
});

test("candidate planning does not mark a notification as delivered", () => {
  const history = { schema_version: "attention-history.v1", surfaced: [] };
  const alerts = selectAttentionCandidates(feed([card("a")]), [assessment("a")], history);
  assert.equal(history.surfaced.length, 0);
  const recorded = recordSurfaced(history, alerts, "2026-10-19T02:00:00Z");
  assert.equal(recorded.surfaced.length, 1);
  assert.equal(recordSurfaced(recorded, alerts, "2026-10-19T03:00:00Z").surfaced.length, 1);
});

test("key generation refuses malformed URLs rather than inventing identity", () => {
  assert.equal(attentionKey(card("a", 0.9, { url: "not-a-url" })), null);
});
