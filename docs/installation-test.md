# Installation test — clean-room participant #4

Purpose: test a NEW user's installation, not an existing participant's migrated repo.

## Record
- Test date:
- User-controlled private instance (owner/repo):
- Installer entry point: prompts/one-prompt-install.md
- Start / finish time:
- Total elapsed time (target: <=15 minutes, aspirational):
- Number of manual authorization steps:
- Number of custom code edits (target: zero):
- Environment: ChatGPT mode / GitHub / Vercel / Task availability:
- Outcome: PASS / PARTIAL / BLOCKED

## Acceptance tests

| ID | Test | How to prove it |
|---|---|---|
| T01 | New private repo | GitHub visibility is private; not a fork |
| T02 | Profile | Distinct user_id, grounded goals/constraints, validates |
| T03 | Opportunity feed | 10 real verified candidates or an explicitly justified smaller set; schema validation passes; no placeholder |
| T04 | Dedupe | Canonical URLs absent from prior index; repeat discovery does not recreate same edition |
| T05 | Public access denied | Logged-out GET / redirects to /login; no personal cards served |
| T06 | Feedback access denied | Logged-out POST /api/feedback returns 401 |
| T07 | CSRF and malformed rejected | Authenticated cross-origin POST gets 403; malformed/invalid JSON gets 400 |
| T08 | Feedback persistence | Complete deck, observe a new data/interactions/*.json in YOUR instance |
| T09 | Retry | Make upstream GitHub write fail intentionally using a temporary revoked token; UI keeps pending batch and Retry works after restoration |
| T10 | Daily task exists | Verify the task appears in ChatGPT task UI with explicit schedule, not just prose |
| T11 | Scheduled write permission | One real task run writes a fresh valid feed and updates index |
| T12 | Learning loop | Next run consumes previous interaction, without converting one swipe into a stable fact |
| T13 | Security hygiene | No private token / personal profile in public template or client bundle |
| T14 | Attention gate | Actual daily feed remains separate from a 0–3 shortlist; 0.75 Fit minimum, actionable verified evidence, 5–30-minute next move, and no re-alert of already surfaced edition; test selector output and private ledger |
| T15 | Native notification behavior | In this participant's real Scheduled Task environment, explicitly verify whether zero candidates means no platform push, and whether nonzero qualified candidates can trigger user-visible delivery; mark PENDING/BLOCKED if unsupported |

For T09 do NOT revoke the owner's real personal token during a live production session; perform the outage experiment in an isolated test instance, or simulate API failure under test.

## Known boundaries of v0.2
- App offers explicit Nope/Want buttons, not true gesture swipes.
- Real Vercel and GitHub account authorization still require user action.
- An autonomous Scheduled Task that can READ and WRITE the private repository must be verified, not presumed.
- Built-in password protection is fail-closed but has no globally coordinated rate limiting; enable provider-side protection for internet-facing apps.
- New instances do not automatically inherit later template updates.
- Pure attention tests cannot establish a platform-native silent/no-push guarantee; test this separately with the participant's actual Scheduled Task.

## Failure log and review
Capture each failure as (stage, observed error, evidence strength, user intervention, minutes lost if measured, proposed smallest fix, known public Issue URL). Use `schemas/installation-report.schema.json` for an optional private report and `prompts/post-install-review.md` to review the installation. See `docs/installation-report.md`.

Do not publish real participant reports, private repository paths, profile details, tokens or sensitive logs in the public starter. A PUBLIC Issue needs a generic reproducible problem, open/closed Issue deduplication and the participant's explicit approval of its exact redacted text. A fix should gain a regression test.

## Release gate
No "one-click install" claim until T01-T08 and T13 pass in a clean-room instance, T10-T12 are verifiably working with the user's actual Scheduled Task integration, and the user can recover from T09.
