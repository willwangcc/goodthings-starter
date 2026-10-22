# Good Things Starter — Agent Contract

This repo is a **personal Good Things instance**, not a generic opportunity database.

## Golden loop

```text
READ → LEARN → DISCOVER → VERIFY → NORMALIZE → DEDUPE → RANK → WRITE → FEEDBACK
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
Write one immutable UTC timestamped `opportunity-feed.v1` file under `data/opportunities/YYYY-MM-DDTHH-mm-ssZ.json` (keep prior daily `YYYY-MM-DD.json` files for compatibility), then update `data/opportunity-index.json` and `data/profile.json` if warranted.

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
