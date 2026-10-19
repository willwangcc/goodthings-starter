# Good Things Starter

**Install once. Let it keep looking for good things for you.**

Good Things is a personal opportunity radar: ChatGPT finds real opportunities, a private GitHub repo remembers your goals and choices, and a mobile-first web app lets you review a fresh deck.

## Install from YOUR ChatGPT

**1. Copy the text in [One-Prompt Install](prompts/one-prompt-install.md) into ChatGPT.**

**2. Authorize your own GitHub and Vercel accounts when prompted.** The installer creates (or helps you create) a new **private** GitHub repository from this template. Do not fork or put your real profile in the public starter.

**3. Complete provider-only secret configuration and choose a daily task schedule.** Finish by verifying cards, a feedback commit and a real scheduled refresh.

The complete [installation guide](SETUP.md) and [installer skill](skills/install-goodthings/SKILL.md) cover tool limitations and manual fallbacks. This is an **assisted installation**, not yet a universal one-click OAuth flow.

[Create a private Good Things instance](https://github.com/new?template_owner=willwangcc&template_name=goodthings-starter&visibility=private&name=my-goodthings) (works once the template owner enables GitHub Template repository).

## Personal runtime

~~~text
Daily ChatGPT Scheduled Task
  read profile + prior opportunities + interactions
  verify + dedupe + rank real opportunities
  write a dated opportunity feed to a private GitHub repo
                ↓
       Private GitHub instance
                ↓
          Vercel mobile app
                ↓
       Nope / Want / Detail
                ↓
    authenticated /api/feedback
                ↓
   immutable GitHub interaction batch
                ↺
~~~

No opportunity is invented. Unknown eligibility remains unknown. Profile evolution requires evidence. Real feedback is recorded, not treated as an immutable personality trait.

## Repository map

~~~text
app/                             Protected mobile cards + login + feedback API
lib/                             Server feed loader + authentication
data/profile.json                Your editable user model (placeholder in template)
data/opportunity-index.json       Canonical URL dedupe memory
data/opportunities/               Immutable timestamped opportunity feeds (legacy daily files supported)
data/interactions/                Immutable interaction batches
schemas/                         Versioned JSON contracts
skills/install-goodthings/        Installer playbook
skills/generate-opportunities/    Discovery + verification + ranking
skills/evolve-profile/            Evidence-aware personalization
prompts/one-prompt-install.md     ChatGPT-facing one-message entry point
prompts/install.md                Initial data generation
prompts/scheduled-task.md         Recurring task payload
docs/installation-test.md         Clean-room acceptance checklist
~~~

## Personal opportunity history

After login, open **历史 / History** from either the live deck or its completion screen. The protected `/history` page reads **all retained private feed snapshots** and interaction batches, deduplicates the same underlying opportunity, and supports kind, Want/Pass/no-record and keyword/topic filters. History is a read-only library; it does not generate new swipe decisions.

For deployed instances, History reads the owner's PRIVATE GitHub repository through the existing server-side `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_TOKEN` environment variables (Contents read permission). Reads use `no-store` so newly committed feedback is visible without a Vercel redeploy. If GitHub access fails or the result is incomplete, the app shows an explicit error rather than pretending to show all history. Local development without GitHub settings reads checked-in files.

Every future refresh should create a **new UTC-timestamped file** at `data/opportunities/YYYY-MM-DDTHH-mm-ssZ.json`; the loader remains backward-compatible with legacy `YYYY-MM-DD.json`. Previously overwritten files cannot be reconstructed by this feature. Decision labels reflect only *persisted* feedback, so an opportunity without a recorded left/right action shows **无决策记录** rather than a claim that the user never viewed it. Last-pushed opportunity statuses are snapshots, not live web availability.

Changes in this template **do not propagate automatically to previously created private instances**. Existing participants must explicitly pull/migrate the feature and redeploy their own instance; preserve their private profile, feeds and interaction history during any upgrade.

## Improve the installer after every install

A successful, partial or blocked installation can produce an **Installation Report**. A private report stays with the participant in their private instance; an actionable, *sanitized* friction can become a public GitHub Issue **only after the participant reviews and approves its exact text**.

- [Post-install Review prompt](prompts/post-install-review.md) — use in the participant's ChatGPT after installation
- [Post-install Review Skill](skills/post-install-review/SKILL.md) — evidence, duplicate-issue search, privacy/consent
- [Installation Learning Loop](docs/installation-report.md) — reporting contract and severity/triage
- [Installation Report schema](schemas/installation-report.schema.json) — versioned private artifact
- [File a sanitized installation friction](https://github.com/willwangcc/goodthings-starter/issues/new/choose) — check for duplicates first

The public source repository contains a synthetic example only, not real participants' reports.

## Security by default
Without GOODTHINGS_ACCESS_PASSWORD and GOODTHINGS_SESSION_SECRET, personal cards remain inaccessible and feedback writes are denied. A private fine-grained GitHub token is required for write-back. Never commit secrets. See [SETUP.md](SETUP.md).

## Developer quick start

~~~sh
npm install
npm run validate
npm test
npm run typecheck
npm run build
npm run dev
~~~

The app has an empty state until you generate a real dated feed. Example fixtures are never surfaced as genuine opportunities.

## Product discipline

- Canonical opportunity facts and per-user matches remain separate.
- No duplicate underlying opportunity edition.
- Swipe activity may tune preferences, never silently rewrite stable identity.
- No installer feature without evidence from a failing real installation.
- The template creates independent private instances; it does NOT automatically upgrade them.

Related R&D: goodthings-opportunity (schema), goodthings-prototype (UX), goodthings-starter (per-user installable runtime).
