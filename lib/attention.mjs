// Attention Contract v1. This module selects candidates; it does not deliver notifications.
export const ATTENTION_POLICY = Object.freeze({ minFit: 0.75, maxAlerts: 3, minMinutes: 5, maxMinutes: 30 });

function normalizedText(value) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

function canonicalUrl(value) {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_/i.test(key) || ["fbclid", "gclid", "mc_cid", "mc_eid"].includes(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    url.searchParams.sort();
    url.pathname = url.pathname.replace(/\/$/, "") || "/";
    return url.toString();
  } catch {
    return null;
  }
}

// A new edition may have a new deadline while keeping the same landing page.
// Never use a feed timestamp as identity: reruns of one edition must not re-alert.
export function attentionKey(item) {
  const opportunity = item?.opportunity;
  const source = canonicalUrl(opportunity?.provenance?.primary_source_url);
  const title = normalizedText(opportunity?.identity?.title);
  const organizer = normalizedText(opportunity?.identity?.organizer);
  if (!source || !title || !organizer) return null;
  const deadline = opportunity?.lifecycle?.deadline_at || "";
  return JSON.stringify([source, organizer, title, deadline]);
}

export function selectAttentionCandidates(feed, assessments = [], history = { surfaced: [] }) {
  const reviewed = new Map(
    Array.isArray(assessments)
      ? assessments.filter((a) => a && typeof a.opportunity_id === "string").map((a) => [a.opportunity_id, a])
      : []
  );
  const previouslySurfaced = new Set(
    Array.isArray(history?.surfaced) ? history.surfaced.map((entry) => entry?.key).filter(Boolean) : []
  );
  const candidates = [];

  for (const item of Array.isArray(feed?.items) ? feed.items : []) {
    const opportunity = item?.opportunity;
    const match = item?.match;
    if (typeof opportunity?.id !== "string" || !opportunity.id.trim()) continue;
    const assessment = reviewed.get(opportunity?.id);
    const key = attentionKey(item);
    if (!key || previouslySurfaced.has(key)) continue;
    if (typeof match?.score !== "number" || !Number.isFinite(match.score) || match.score < ATTENTION_POLICY.minFit || match.score > 1) continue;
    if (!["open", "rolling", "upcoming"].includes(opportunity?.lifecycle?.status)) continue;
    if (opportunity?.provenance?.verification_status !== "verified") continue;
    if (!normalizedText(match.why_you) || !normalizedText(match.why_now) || !normalizedText(match.next_step)) continue;
    if (assessment?.actionable_now !== true || !normalizedText(assessment.why_interrupt) || !normalizedText(assessment.time_evidence)) continue;
    const minutes = assessment.next_move_minutes;
    if (!Number.isInteger(minutes) || minutes < ATTENTION_POLICY.minMinutes || minutes > ATTENTION_POLICY.maxMinutes) continue;
    candidates.push({
      key,
      opportunity_id: opportunity.id,
      title: opportunity.identity.title,
      fit: Math.round(match.score * 100),
      why_you: match.why_you,
      why_now: match.why_now,
      next_move: match.next_step,
      next_move_minutes: minutes,
      why_interrupt: assessment.why_interrupt,
      time_evidence: assessment.time_evidence,
      primary_source_url: opportunity.provenance.primary_source_url
    });
  }

  candidates.sort((a, b) => b.fit - a.fit || a.key.localeCompare(b.key));
  const seenThisRun = new Set();
  const alerts = [];
  for (const candidate of candidates) {
    if (seenThisRun.has(candidate.key)) continue;
    seenThisRun.add(candidate.key);
    alerts.push(candidate);
    if (alerts.length === ATTENTION_POLICY.maxAlerts) break;
  }
  return alerts;
}

// Call ONLY after the alerts have actually been surfaced in a supported channel.
// Planning candidates alone must not mutate the ledger.
export function recordSurfaced(history, alerts, at) {
  if (typeof at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(at) || !Number.isFinite(Date.parse(at))) {
    throw new Error("A valid UTC ISO timestamp is required");
  }
  const rows = Array.isArray(history?.surfaced) ? history.surfaced : [];
  const existing = new Set(rows.map((row) => row.key));
  const next = [...rows];
  for (const alert of alerts) {
    if (typeof alert?.key !== "string" || existing.has(alert.key)) continue;
    next.push({ key: alert.key, opportunity_id: alert.opportunity_id, surfaced_at: at });
    existing.add(alert.key);
  }
  return { schema_version: "attention-history.v1", surfaced: next };
}
