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

## Install

1. Create a **private repository from this template**.
2. Follow [`SETUP.md`](SETUP.md).
3. Connect the repo to Vercel.
4. Connect GitHub in ChatGPT.
5. Paste [`prompts/install.md`](prompts/install.md) once.
6. Create a recurring ChatGPT Scheduled Task using [`prompts/scheduled-task.md`](prompts/scheduled-task.md).

The first successful install is not “the app opens.” It is this full loop:

```text
profile → generated feed → Vercel cards → swipe → GitHub interaction → next refresh improves
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
