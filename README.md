# Good Things Starter

A self-hosted personal opportunity radar powered by ChatGPT, GitHub, and Vercel.

> **Install once. Let it keep looking for good things for you.**

This repository is the installable Good Things instance: one private repo per person. ChatGPT discovers and refreshes opportunities on a schedule, GitHub is the durable personal data store, and the Vercel app is the swipeable interface.

## Runtime

```text
ChatGPT Scheduled Task
  read profile + prior opportunities + interactions
  discover + verify + dedupe + rank
  evolve profile conservatively
  write today's opportunity feed
             ↓
       Private GitHub repo
             ↓
          Vercel app
             ↓
        swipe / detail
             ↓
       /api/feedback
             ↓
 data/interactions/*.json
             ↺
```

## What this repo owns

- one person's evolving `data/profile.json`
- durable dedupe memory in `data/opportunity-index.json`
- generated opportunity feeds in `data/opportunities/`
- swipe/detail/source events in `data/interactions/`
- schemas for every durable JSON object
- the Scheduled Task prompt + generation/evolution skills
- a minimal mobile-first card app deployable to Vercel

## Install (Chat-first)

**Start in ordinary ChatGPT**: share the source URL below and ask ChatGPT to install Good Things for you. Connected GitHub/Vercel tools can perform available steps; website-only steps may require ChatGPT Work (optional) or a short manual handoff.

> Install Good Things for me from https://github.com/willwangcc/goodthings-starter. Read `skills/install-goodthings/SKILL.md` and follow the workflow. Create or reuse my **private** instance, then guide me through the remaining authorizations and verification steps.

The ready-to-paste expanded instruction is in [`prompts/install.md`](prompts/install.md). The single canonical install procedure is [`skills/install-goodthings/SKILL.md`](skills/install-goodthings/SKILL.md).

1. Create your own **private repository from this GitHub template**. If your ChatGPT session cannot create one, use GitHub's **Use this template** UI and share the new `OWNER/REPO`.
2. Connect GitHub in ChatGPT with access to **only your private instance**; initialize the profile and generate verified opportunities.
3. Deploy that private repo on Vercel, configure server-side GitHub credentials, and protect **production pages and the feedback API** before putting personal data online.
4. Confirm a real swipe batch is committed to the private GitHub repo.
5. Create a recurring Scheduled Task at a time you approve. Confirm that an **actual scheduled run** can read feedback and write a new deduplicated feed; mere task creation is not sufficient.

See [`SETUP.md`](SETUP.md) for the operational steps. Do **not** paste tokens into ChatGPT or commit them to GitHub. A private GitHub repo does not automatically make its Vercel website private.

The first successful install is not “the app opens.” It is this full loop:

```text
profile → generated feed → protected Vercel cards → swipe → GitHub interaction → next scheduled refresh
```

## Data layout

```text
data/
  profile.json                  # current user model
  opportunity-index.json        # dedupe memory
  opportunities/                # dated generated feeds
  interactions/                 # immutable feedback batches

schemas/
  profile.schema.json
  opportunity.schema.json
  feed.schema.json
  interaction.schema.json

skills/
  install-goodthings/SKILL.md
  generate-opportunities/SKILL.md
  evolve-profile/SKILL.md

prompts/
  install.md
  scheduled-task.md
```

## Laws

1. **Opportunity is discovered, not invented.**
2. **Primary-source facts beat polished copy.**
3. **Unknown stays unknown.**
4. **No duplicate canonical URL.**
5. **Profile changes require evidence.**
6. **Stable semantics, variable presentation.** Card UI may evolve; JSON contracts should change deliberately.
7. **One real installation failure earns one installer improvement.** Do not automate imaginary pain.

## Local

```bash
npm install
npm run validate
npm run dev
```

## Repository roles

- `goodthings-opportunity`: semantic/card-design R&D
- `goodthings-prototype`: interaction R&D
- `goodthings-starter`: the installable per-person runtime

The starter should absorb only patterns proven useful by real installations.
