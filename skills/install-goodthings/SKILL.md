---
name: install-goodthings
description: Install a private Good Things opportunity radar using a Chat-first, capability-aware workflow; use Work only when browser interaction is needed and available.
---

# Install Good Things (Chat-first)

## Goal and scope

Turn a first-time user's request (often just a link to https://github.com/willwangcc/goodthings-starter) into **one private, working Good Things instance** with an evidence-based profile, verified opportunity feed, protected mobile app, GitHub feedback, and a real recurring refresh.

The source template is public **code and examples**. Every user's profile, opportunities, interactions, and credentials belong only to that user's **private instance**. Never write personal data back to the public starter repo.

This is an installation *workflow*, not a claim that pasting one URL can bypass authentication, create every resource, or activate a scheduled task without permission.

## Entry point and routing

1. **Default to ordinary Chat.** Read the linked public repo and this skill. Ask for GitHub access only when required for the next write. Use connected GitHub/Vercel tools for permitted API operations.
2. Inventory the real capabilities of this session: read repository; create a private repository from a template; read/write files; execute commands; deploy/configure Vercel; create a Scheduled Task; access those tools during later scheduled runs.
3. **Do not invent tool capabilities.** A connected GitHub tool that can edit files might not be able to create a repository or change GitHub settings. A session that can create a task does not prove future runs can write to GitHub.
4. **Use Work only when needed and available:** for website UI operations that cannot be performed through connected tools (for example, GitHub template/settings or Vercel import). Work is an optional execution engine, not an installation requirement. If Work is unavailable, give the user the exact UI step/link, wait for confirmation, then resume in Chat.
5. Do not request access to unrelated GitHub repositories, accounts, or scopes. Never ask the user to paste tokens, passwords, or secret values into the conversation. Pause for user-controlled login/consent.

Before each stage, check whether it is already complete. **Resume rather than reinstall**; avoid duplicate repos, duplicate scheduled tasks, and duplicate opportunity writes.

## Installation states

Track only observed outcomes:

- `NOT_STARTED`: target private instance has not been identified.
- `REPO_READY`: private repo exists under the intended user's control and contains starter files.
- `DATA_READY`: profile and initial feed/index have been written and validated.
- `APP_READY`: deployment renders real cards behind verified access controls.
- `FEEDBACK_READY`: a real interaction batch has landed in the correct private repo.
- `SCHEDULE_READY`: a recurring task exists with the correct repository, cadence and permissions.
- `COMPLETE`: a scheduled execution has actually read feedback and written a valid subsequent feed.
- `BLOCKED`: required tool, authorization, deployment protection, or verification is missing; report the precise blocker and recovery action.

Never label an installation `COMPLETE` merely because an installation prompt was accepted or a task was created.

## Procedure

### 1. Inspect and identify the destination

- Read `README.md`, `AGENTS.md`, `SETUP.md`, `schemas/*`, this skill, `prompts/scheduled-task.md`, and the existing data files.
- Confirm whether the user already has a private Good Things instance. If so, reuse it; do not overwrite existing data or create a second instance without asking.
- If not: guide creation through **Use this template → Create a new repository → Private** from https://github.com/willwangcc/goodthings-starter. If template mode is unavailable, say the source owner must enable "Template repository"; do not pretend a fork provides the same independent instance.
- Confirm the *exact* `OWNER/REPO` and that it is private before writing profile data. The user retains ownership and control.

**Gate:** never write user-specific data to a public repo or an unverified target.

### 2. Initialize the profile using evidence, not guesses

- Read `schemas/profile.schema.json` and existing `data/profile.json`; read `skills/evolve-profile/SKILL.md` if helpful.
- Populate only what the user has stated or what is reliably accessible in the current authorized ChatGPT context. Do not infer eligibility, location, career facts, or preferences from stereotypes.
- Ask one short, high-value question only if a missing answer materially affects opportunity search. Preserve unknowns using schema-appropriate values.
- Write `data/profile.json` to the **private instance**, not the starter. Do not expose profile content in logs, public build artifacts, or installation screenshots.
- Validate against the schema before claiming success.

### 3. Generate the first real feed

- Read `AGENTS.md`, `skills/generate-opportunities/SKILL.md`, `data/opportunity-index.json`, and recent interaction/feed history.
- Search current primary sources; verify actionability, deadlines, geography, benefits and eligibility where possible. Unknown must stay unknown.
- Normalize canonical URLs; deduplicate across the full index and earlier feeds. Never invent opportunities to fill a quota.
- Write a schema-valid `data/opportunities/YYYY-MM-DD.json`, update `data/opportunity-index.json`, and update the profile only with evidence. Commit to the exact private instance.
- Prefer `npm install && npm run validate && npm run typecheck && npm run build` when command execution is available. Otherwise perform available checks and explicitly mark unexecuted checks.

**Gate:** real, verifiable, correctly scoped opportunity data; no example-only feed misrepresented as the initial generation.

### 4. Deploy the protected app

- Import the private instance into Vercel using connected tools or a user-confirmed browser step. Do not create a deployment for the *public starter* as the user's personal app.
- Configure `GITHUB_OWNER`, `GITHUB_REPO` and `GITHUB_TOKEN` as **server-side environment variables**, never committed files or client-side/public environment variables. Use a narrowly scoped fine-grained token: only this instance, only the permissions actually required for writes.
- **Security stop:** the current starter's `app/api/feedback/route.ts` has no application-level session authorization; it relies on the deployment's access layer. Protect the **production deployment and API route**, not just preview URLs. Verify unauthenticated requests to the feed and `POST /api/feedback` are denied before any real personal data is exposed. If protection cannot be verified, do **not** treat this as a safely usable personal app; stop and report how to finish protection.
- Verify that new commits to the private instance trigger the expected deployment refresh. A private GitHub repository does not automatically imply that the Vercel URL is private.

### 5. Verify the feedback loop

- Open the protected mobile deployment; verify it renders the newly generated cards (not only demo placeholders).
- Submit a real `Nope`/`Want` feedback batch and confirm a new immutable file under `data/interactions/` in the intended private instance.
- Verify the batch schema; inspect failed writes instead of reporting success on a UI-only click.
- Never emit secrets or full sensitive interaction payloads into public issues, screenshots, or logs.

### 6. Create and verify the scheduled refresh

- Ask the user to choose the cadence and local execution time if unknown. Obtain their authorization to create the recurring task. Avoid duplicate Good Things tasks for the same repo.
- Build the task from `prompts/scheduled-task.md`; **include the exact private `OWNER/REPO` in the task instruction**. Ensure the user can authorize any required connected apps.
- If task creation is not available in the current Chat session, provide a short, copyable task instruction and guide the user through the ChatGPT Scheduled Tasks UI. Work is not a mandatory workaround.
- A task's future tool availability and permission to commit are **not guaranteed** by successful creation. Check a real scheduled execution: it must read the previous interaction, dedupe, validate and commit a new feed to the correct repo. If no scheduled execution has occurred yet, report `SCHEDULE_READY`, not `COMPLETE`.
- A one-off manual refresh is useful for debugging, but is not evidence that unattended scheduled execution works.

## Verification / acceptance checklist

Report each item explicitly as `PASS`, `PENDING`, or `BLOCKED`:

1. Target `OWNER/REPO` is a private, user-owned instance created/reused intentionally.
2. Profile, opportunity feed, and dedupe index contain real data and pass the available JSON/schema checks.
3. Vercel production app renders the expected latest cards.
4. Unauthenticated access to both card content and feedback write-back is denied.
5. A feedback batch is committed in the private repo.
6. A recurring task exists with correct target/cadence, and **an actual scheduled run** successfully consumes feedback and commits a new feed.

Finish with: private repo URL, protected app URL (only after verified), task cadence/status, any human actions still required, and any unrun tests. Do not fabricate URLs, deployment states, Task IDs, verification results, or access grants.

## Escalation and failure recovery

- Missing GitHub access → ask the user to connect/authorize just the target repo, then resume.
- No "Use this template" → report disabled template setting to source owner; offer exact UI guidance, not a fake completed clone.
- Missing repository-creation API → provide GitHub's template UI path, then resume in Chat after the user creates the private instance.
- Missing Vercel integration/browser control → give user the exact import/environment/protection steps from `SETUP.md` and wait for confirmation.
- Missing task creation or future task connector write access → explain the limitation, provide the task text, and leave the step `PENDING` or `BLOCKED`.
- Invalid profile/feed, duplicate opportunity, or failed commit → fix and revalidate before proceeding; preserve original interactions and stable profile facts.
- Security test fails → **stop before onboarding real data**; do not weaken security to make installation appear successful.

## Installation design principles

- **Chat-first, Work-optional, user-owned.**
- Least privilege, explicit consent, privacy by default.
- One canonical installation skill; `prompts/install.md` is only the thin bootstrap.
- Copying a template does **not** automatically pull future starter updates. Never overwrite user customizations/data while upgrading.
- Optimize the fourth real install, not an imagined one-click funnel: record actual friction and address proven failures first.
