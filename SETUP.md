# Setup

Goal: get one complete Good Things loop working for one person.

## 1. Personalize the repo

Edit `data/profile.json` or let ChatGPT do it via `prompts/install.md`.

At minimum set:
- `user_id`
- `display_name`
- current location if relevant
- current goals/interests
- important constraints

Do not fill unknown eligibility facts just to make the profile look complete.

## 2. Install dependencies

```bash
npm install
npm run validate
```

## 3. Deploy to Vercel

Import this private repository in Vercel.

Set these environment variables so swipe batches can be committed back to GitHub:

```text
GITHUB_OWNER=<repo owner>
GITHUB_REPO=<repo name>
GITHUB_TOKEN=<fine-grained token with Contents: Read and write for this repo>
```

Protect the deployment with Vercel Authentication or another access layer appropriate for the user.

## 4. Test feedback write-back

Open the deployed app, swipe through the current cards, then verify a new file appears under:

```text
data/interactions/YYYY-MM-DD-<batch-id>.json
```

A feed without write-back is a personalized feed, not yet a learning loop.

## 5. Install the ChatGPT task

Connect GitHub in ChatGPT and run `prompts/install.md` once. Then create a recurring Scheduled Task using `prompts/scheduled-task.md`.

The task must have access to this repository and should write only validated JSON matching the schemas in `schemas/`.

## 6. Done test

Installation is complete only when all six are true:

- profile exists
- opportunity index exists
- a dated opportunity feed exists
- Vercel renders the feed on mobile
- a swipe batch lands in GitHub
- the next scheduled refresh reads that batch and changes ranking/profile only when evidence supports it
