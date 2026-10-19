# Good Things Starter

**Install once. Let it keep looking for good things for you.**

Good Things is a personal opportunity radar: ChatGPT finds real opportunities, a private GitHub repo remembers your goals and choices, and a mobile-first web app lets you review a fresh deck.

## Install from YOUR ChatGPT

**1. Copy the text in [One-Prompt Install](prompts/one-prompt-install.md) into ChatGPT.**

**2. Authorize your own GitHub and Vercel accounts when prompted.** The installer creates (or helps you create) a new **private** GitHub repository from this template. Do not fork or put your real profile in the public starter.

**3. Complete provider-only secret configuration and choose a daily task schedule.** Finish by verifying cards, a feedback commit and a real scheduled refresh.

The complete [installation guide](SETUP.md) and [installer skill](skills/install-goodthings/SKILL.md) cover tool limitations and manual fallbacks. This is an **assisted installation**, not yet a universal one-click OAuth flow.

[Create a private Good Things instance](https://github.com/new?template_owner=willwangcc&template_name=goodthings-starter&visibility=private&name=my-goodthings) (works once the template owner enables GitHub Template repository).

## Discovery vs. attention

Every daily run maintains a private library of up to the configured target count (default 10 verified cards). This does **not** mean ten notifications: [Attention Contract v1](docs/attention-contract.md) selects at most three verified, time-relevant cards with Fit >= 75 and a concrete 5–30-minute next move, or zero. The selector has automated tests; native Scheduled Task conditional push/silence still requires a real participant-level verification. Never conflate a candidate shortlist with delivered push notifications.

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
data/opportunities/               Dated real opportunity feeds
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
