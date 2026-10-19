# Good Things — daily discovery + attention task

Refresh THIS participant's private Good Things instance. Use the exact private owner/repo resolved at installation; never write personal data to the public starter.

Run at the daily local time explicitly confirmed during installation (suggest 09:00 in the participant's confirmed timezone; do not infer timezone from network location). Do not assume the task exists or that it has GitHub write access until verified.

## A. Discover and persist (the full library)

Read `AGENTS.md`, `docs/attention-contract.md`, `data/profile.json`, `data/opportunity-index.json`, `data/attention-history.json`, recent `data/interactions/*.json`, recent `data/opportunities/*.json`, `skills/evolve-profile/SKILL.md`, and `skills/generate-opportunities/SKILL.md`.

1. Evolve the profile only when strong new evidence warrants a change. Prefer known ChatGPT context and observed feedback; do not invent personal facts or require a questionnaire.
2. Discover current, genuinely actionable opportunities across relevant events/hackathons, funding/programs, collaboration/jobs, project-unblocking tools/APIs, research/open source, and asymmetric-upside experiments. Search broadly enough for exploration.
3. Verify source, timing, eligibility and application path against primary sources where possible. Leave unknown values unknown.
4. Canonicalize URLs and dedupe against the full index and prior feeds. Do not repeat the same opportunity edition.
5. Rank for this person using profile and interactions. Produce **up to** `profile.generation.target_count` real cards (default 10), fewer or zero if evidence is weak; never pad.
6. Validate feed JSON against the schemas, write a new immutable dated feed under `data/opportunities/`, update `data/opportunity-index.json`, and commit. Only update `data/profile.json` if evidence supports it.

## B. Assess attention separately (0–3 alerts)

**North star:** "Knowing this person, is there a non-obvious reason they should act on this now?"

The persisted feed is NOT a notification list. For each potentially alert-worthy card, ground a temporary attention assessment in real evidence: `opportunity_id`, `actionable_now`, `why_interrupt`, `time_evidence`, `next_move_minutes`. State a 5–30-minute concrete next action; do not invent urgency.

Where execution is supported, apply `lib/attention.mjs` via `scripts/attention-plan.mjs` to the committed feed, temporary assessments and private `data/attention-history.json`. The gate requires verified status, Fit >= 0.75, specific Why you + Why now + Next move, time-sensitive evidence, a 5–30-minute step, and no previously surfaced equivalent edition. It sorts by fit and returns **at most 3** alerts. If the deterministic gate cannot run, do not claim that it did or substitute unfiltered notifications.

If zero qualify, **do not send a Good Things opportunity alert**. Do not fill an alert quota or produce generic news. The host platform may still emit a task-completion notification; never promise native silence unless verified.

If 1–3 qualify and the host offers a supported notification channel, surface ONLY those concise cards with: title, one-line summary, Why you, Why now, Next move, Fit score and primary link. Once actually surfaced, record only surfaced keys via `recordSurfaced(...)` in `data/attention-history.json` and commit. **Selecting is not sending**; never record unsurfaced candidates. If conditional delivery is not supported or delivery cannot be verified, report that integration as PENDING/BLOCKED rather than falsely claiming push notifications.

A real unattended scheduled run must prove it can read participant feedback, dedupe and write a valid feed. Task creation, manual execution or passing unit tests alone do not satisfy that acceptance criterion.
