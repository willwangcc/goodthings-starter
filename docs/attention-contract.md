# Good Things — Attention Contract v1

> Knowing this person, is there a non-obvious reason they should act on this now?

Two independent outputs:

1. **Discovery / library**: find and verify approximately `profile.generation.target_count` genuine opportunities (default 10, fewer when evidence is weak). Preserve the full private feed, including cards below the alert threshold.
2. **Attention / notification**: at most 3 qualified cards per run, or **zero**. No quota. The 0.75 score is an editorial policy threshold, not calibrated probability.

## Deterministic gate

`lib/attention.mjs` exports `selectAttentionCandidates(feed, assessments, history)`. Only candidates meeting **all** these requirements are returned:

- Fit score >= 0.75, finite and <= 1.
- Verified source; not closed, paused or unknown-status.
- Concrete Why you, Why now and Next move.
- Explicit assessment of **actionable_now**, **why_interrupt**, **time_evidence**, and integer **next_move_minutes** from 5 through 30.
- Not already surfaced in `data/attention-history.json`; do not repeat identical editions or source aliases.
- Sorted by Fit, limited to 3. No qualified cards means an empty list.

The agent must ground time evidence in real source facts; never mark an opportunity urgent merely to fill the quota. An `upcoming` opportunity is eligible only if there is something *actionable today* (for example, an open early-registration window), not solely because it exists.

## Assessments

Produce a temporary JSON array (outside the public template and preferably outside Git history), one entry for each potential alert:

~~~json
[
  {
    "opportunity_id": "real-feed-opportunity-id",
    "actionable_now": true,
    "why_interrupt": "Specific non-obvious personal upside worth interrupting for",
    "time_evidence": "Verified deadline, just-opened application or narrow opportunity window",
    "next_move_minutes": 15
  }
]
~~~

Then run:

~~~sh
node scripts/attention-plan.mjs data/opportunities/<real-feed-filename>.json /tmp/attention-assessments.json data/attention-history.json
~~~

This outputs **candidate alerts**, not a notification or proof of delivery. The temporary assessments must never contain secrets; if file or code execution is unavailable, say that the deterministic gate was not executed rather than claiming it passed.

## Surfacing and durable dedupe

- Publish alerts only through a supported, user-authorized Scheduled Task delivery mechanism. Never claim conditional push, silent runs, or delivery if the platform does not expose those controls.
- After the candidate text is actually surfaced in the supported task response, append the keys with `recordSurfaced(history, surfacedAlerts, ISO_timestamp)` and commit the updated private `data/attention-history.json`. **Do not mark a candidate surfaced merely because it was selected.** This ledger tracks what the task surfaced, not push delivery or user attention.
- Preserve the ledger across runs and deployment updates. Never add real users' histories to the public starter.
- On any verification/tool/access error, do not generate unverified alerts. Record a task failure/blocked status instead, using only supported host behavior.

## Scheduling

- Default suggestion: **09:00 in the participant's confirmed local timezone**, with an explicit user choice during installation. This is a per-user Scheduled Task setting, not a GitHub cron.
- Verify task creation in the participant's task UI, and validate one actual unattended run for read + write. Conditional silent notifications require separate real-world host verification.
- Existing private instances do **not** automatically inherit this policy.

## Acceptance

Automated test coverage (run with `npm test`): zero qualifying cards -> zero; eligible threshold inclusive; top 3 only; repeated edition/URL alias -> no repeat; next move 5–30 minutes; verified and timely evidence; ledger unchanged until surfaced.

Runtime checks still required: task timezone, connected GitHub permission in a scheduled execution, and platform-native zero-notification behavior. A passing Node test is not evidence of any of these.
