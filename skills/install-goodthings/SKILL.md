---
name: install-goodthings
description: Chat-first, Work-optional installation of a private Good Things opportunity radar, with capability checks, consent, protected deployment and verified scheduled refresh.
---

# Good Things Installer v0.2

## Goal
A new user in ordinary ChatGPT can request "Install Good Things" with one message. The agent performs supported steps, pauses for user-controlled authorization and credentials, and NEVER claims an unattended one-click installation if prerequisites are missing.

## Source of truth
- Canonical source: https://github.com/willwangcc/goodthings-starter
- Install per person into a NEW private repository created from the GitHub template.
- Read README.md, SETUP.md, AGENTS.md, prompts/install.md and all schemas in the newly created instance.
- Do not copy other people's private profiles, opportunity packs, tokens, or interactions into this instance.

## Execution policy — Chat-first, Work-optional

1. **Default to ordinary Chat.** Read this skill and use already authorized GitHub/Vercel/Task actions directly when those actions actually exist. Do not require a different ChatGPT mode as a prerequisite.
2. **Inventory tools before promising actions:** public repo read, private repo read/write, template-repo creation, code execution/validation, Vercel configuration, Scheduled Task creation, and whether scheduled executions can use the same connected apps. Read permission is not write permission.
3. **Use Work only when available and useful** for a website-UI step that the connected tools cannot perform (for example, GitHub template creation or Vercel import). If Work is unavailable, hand off exactly one UI action to the user, obtain confirmation, and continue the same installation in Chat.
4. **Ask for explicit consent** before creating resources or a recurring task; never infer authorization from merely sharing a URL. Keep GitHub permissions scoped to the user's instance.
5. **Make installation resumable:** inspect existing instance, deployment, data, and tasks before provisioning anything; avoid duplicate repositories, tasks, and feed writes. Never overwrite prior private data.
6. **No hidden success claims:** if a tool cannot do a step, label it PENDING or BLOCKED, give the smallest viable next action, and continue after it is complete. A task created now does not establish future scheduled-run access.

## Progress states

Report evidence, not intentions: `REPO_READY` → `DATA_READY` → `APP_READY` → `FEEDBACK_READY` → `SCHEDULE_READY` → `COMPLETE`. Use `PENDING` or `BLOCKED` for missing capabilities, approvals, or checks. `COMPLETE` requires **an actual unattended scheduled run** to consume feedback and commit a validated subsequent feed, not merely a manual refresh.

## Stage 0 — Detect capabilities
Check whether this ChatGPT environment has actual working GitHub read/write access, Vercel project-management capabilities, and Scheduled Task creation. Do not assume a connector is installed, authorized or writable just because the public repo can be read.

For each unavailable capability, tell the user the single next authorization or UI step. Continue once they have completed it. Never ask the user to paste credentials into ChatGPT or a public issue.

## Stage 1 — Claim a private instance
1. Confirm the canonical repo is configured as GitHub Template. If not, use the owner's Template Settings to fix it (when authorized) or report this as a blocker; do not disguise a fork as a template.
2. First check whether the user already owns a Good Things private instance. Reuse and resume it if present; otherwise, with permission, create one under the user's own GitHub account using "Use this template".
3. Verify its visibility is private and record its owner/name. Do not mutate the canonical repo or another person's instance.
4. If the tool cannot create from a template, offer the user this GitHub creation page after template is enabled:
   https://github.com/new?template_owner=willwangcc&template_name=goodthings-starter&visibility=private&name=my-goodthings

## Stage 2 — Calibrate, never invent
1. Read the new instance's profile and profile schema.
2. Populate profile from the user's explicit statements and reliably available personal context.
3. Only ask questions about impactful unknown constraints/eligibility; preserve null and unknown.
4. Never retain private data in the public template repository.
5. Validate profile and write it to the new private repo. Confirm the commit.

## Stage 3 — Produce first REAL feed
Run prompts/install.md together with skills/generate-opportunities/SKILL.md.
Verify high-signal opportunities against real sources. Deduplicate against data/opportunity-index.json; leave unknown facts unknown; respect generation.target_count.
Write exactly one valid dated data/opportunities/YYYY-MM-DDTHH-mm-ssZ.json (unique UTC timestamp; no overwrite) plus updated index.
Avoid editing the sample fixture. Validate the feed. Confirm the commit and the new file exists.

## Stage 4 — Deploy and protect
1. Import ONLY the user's private instance into Vercel.
2. In Vercel's secret environment variables, the user must configure:
   GOODTHINGS_ACCESS_PASSWORD (unique 16+ chars)
   GOODTHINGS_SESSION_SECRET (random 32+ chars, e.g. openssl rand -hex 32)
   GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN.
3. GITHUB_TOKEN must be a fine-grained token scoped only to this instance, with Contents read/write. Never print, commit, or persist it in chat.
4. Require that the built-in server login blocks unauthenticated visitors and feedback POSTs; verify logged-out GET / serves no personal cards and logged-out POST /api/feedback is denied. Recommend Vercel deployment protection or edge rate limiting on top of the built-in app password, especially for publicly reachable domains. A private GitHub repo does not make a public Vercel URL private.
5. The app stays locked if app credentials are missing. Never remove this protection to make onboarding appear successful.
6. Verify production URL, log in and render real cards on a phone-sized screen. The UI currently uses Nope/Want buttons; do not claim gesture swipes.

## Stage 5 — Schedule, with explicit user choice
1. Show the user the recurring schedule and ask their preferred daily time if not already specified.
2. Use prompts/scheduled-task.md with the user's exact private repo owner/name.
3. Create/confirm a real ChatGPT Scheduled Task only if the current environment supports it. A pasted prompt or reminder is NOT proof a task is configured.
4. Verify a real scheduled execution (not only a manual run) can read the prior interaction batch, validate/dedupe, and commit the next feed with the task's actual permissions. Until that run succeeds, report SCHEDULE_READY rather than COMPLETE. If the task cannot access/write the repo, report blocked and use an authorized fallback; no fake automation.

## Stage 6 — Full-loop acceptance
Follow docs/installation-test.md:
- private repo and real profile
- generated dated feed with validated cards
- Vercel app access denied while logged out
- 10 cards readable, buttons work
- full batch GitHub write-back, unauthorized/malformed request rejected
- on temporary GitHub failure, pending feedback remains locally retryable
- subsequent generation consumes interactions and prevents duplicates
- actual Scheduled Task created, if supported

## Completion response
Return: instance URL, protected app URL (only if verified), task schedule and task status, counts of valid real cards, interaction write-back confirmation, number of manual interventions, blockers and the next concrete action. For each acceptance check state PASS, PENDING or BLOCKED; distinguish verified actions from future checks.

## Non-goals
- No public Plugin or paid Work requirement for v0.2.
- No claims of universal one-click provisioning.
- No OAuth/Token automation unless a user-authorized tool actually supports it.
- Do not update everyone else's previously installed instances automatically.


## Stage 7 — Optional Installation Learning Loop

At COMPLETE, PARTIAL or BLOCKED, offer (do not silently run/publish) a post-install review using skills/post-install-review/SKILL.md and docs/installation-report.md.
Capture only verified stages, measured human interventions and actual friction. With consent, save a schema-validated installation report to the participant's PRIVATE instance; never to the public template.
Search open and closed issues and present any NEW sanitized public Issue in full for explicit approval before publication. Do not file public security vulnerabilities. This review is optional and is never a blocker for using Good Things.
