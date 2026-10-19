# Good Things Starter — Agent Contract

This repo is a **personal Good Things instance**, not a generic opportunity database.

## Golden loop

```text
READ → LEARN → DISCOVER → VERIFY → NORMALIZE → DEDUPE → RANK → WRITE → ATTENTION → FEEDBACK
```

### READ
Always inspect:
- `data/profile.json`
- `data/opportunity-index.json`
- recent files under `data/interactions/`
- recent files under `data/opportunities/`

### LEARN
Update the profile conservatively. Stable facts require explicit evidence. Behavior can update interests, avoid-list, exploration ratio, and current intent only when repeated evidence supports it.

### DISCOVER
Find real, currently actionable opportunities. Prefer primary sources and opportunities with a clear action path.

### VERIFY
Never convert inference into fact. If deadline, eligibility, amount, geography, or application requirements cannot be verified, leave them unknown/null and say so.

### NORMALIZE
Canonicalize source URLs before dedupe: strip tracking parameters and fragments; keep identity-bearing path/query parameters.

### DEDUPE
Exact canonical URL match means duplicate. Near-duplicate title + organizer can suppress only when it is clearly the same underlying opportunity. A recurring/new edition is a new opportunity.

### RANK
Rank for this person, not for generic prestige. A strong card answers:
- Why this person?
- Why now?
- What is the upside?
- What is the next action?

### WRITE
Write one dated `opportunity-feed.v1` file under `data/opportunities/`, then update `data/opportunity-index.json` and `data/profile.json` if warranted.

### ATTENTION

Discovery is not notification. Write the private feed first; then apply the separate [Attention Contract v1](docs/attention-contract.md). A card may stay in the library even if it is not worth interrupting the user for. The editorial north star is:

> Knowing this person, is there a non-obvious reason they should act on this now?

For a notification candidate, require verified sources, Fit >= 0.75, specific Why you / Why now, a 5–30-minute Next move, and grounded time-window evidence. No more than 3, zero is a valid answer. Use the deterministic selector in `lib/attention.mjs` and dedupe against the private `data/attention-history.json` ledger. Do not count selection as delivery, do not mark surfaced before actually surfacing, and do not claim native silent/conditional notifications without a real host test.

### FEEDBACK
Treat swipe/detail/source behavior as evidence, not truth. Right-swipe is positive evidence; left-swipe is negative evidence; detail/source opens indicate uncertainty or interest but are weaker signals.

## Invariants

- Opportunity is discovered, not invented.
- Unknown facts remain unknown.
- Do not fabricate UI-completeness fields.
- Do not silently rewrite stable profile facts from one swipe.
- Keep interactions immutable; append a new batch instead of rewriting history.
- Keep schemas versioned.
- Do not put renderer-specific fields into canonical opportunity data.

## Product rule

> No installer feature without a failing real installation.

## Installation Learning Loop

After each installation, optionally run skills/post-install-review/SKILL.md using docs/installation-report.md and schemas/installation-report.schema.json.
The private report is distinct from the public bug report. Never save a real user's installation report in this public source repo. Search open AND closed Issues for duplicates and require explicit participant approval for each newly published sanitized Issue. Security vulnerabilities require private disclosure, not public Issues.
