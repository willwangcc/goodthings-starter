# Generate Opportunities

## Purpose
Generate a small, verified, deduplicated set of opportunities that this specific person can judge quickly.

## Inputs
- `data/profile.json`
- `data/opportunity-index.json`
- recent `data/interactions/*.json`
- recent `data/opportunities/*.json`
- current public sources

## Procedure

1. Build a search brief from the profile: goals, current projects, geographies, constraints, opportunity kinds, avoid-list.
2. Read recent interactions. Use right/left evidence to shift ranking, not to rewrite stable facts.
3. Search broadly enough to preserve exploration. The default exploration ratio comes from `profile.generation.exploration_ratio`.
4. Prefer primary sources. Verify status, deadline, location, benefits, eligibility, and application path when possible.
5. Normalize the primary source URL.
6. Dedupe against `data/opportunity-index.json`.
7. Score each candidate 0–1 for this person. Do not use fake precision: the score is ranking metadata, not scientific truth.
8. Select **up to** `profile.generation.target_count` real opportunities with a mix of exploitation + exploration. Fewer or zero is correct when verification or fit is weak.
9. Write an `opportunity-feed.v1` file to `data/opportunities/YYYY-MM-DD.json`.
10. Update the dedupe index for every selected opportunity.

## Quality bar
A selected item should usually have at least one of:
- unusual expected upside
- unusually strong fit
- time sensitivity
- low friction + useful payoff
- access to funding, distribution, infrastructure, collaborators, learning, mobility, or high-signal networks

## Separate attention layer

Discovery populates the participant's opportunity library; it does not decide who gets interrupted. Preserve verified lower-fit cards in the feed. After the full feed is validated and committed, assess any genuinely urgent cards with [Attention Contract v1](../../docs/attention-contract.md) and the `lib/attention.mjs` selector.

For each potential alert, articulate *why this particular person should act now*, give source-backed timing evidence and a feasible 5–30-minute first action. The notification gate requires Fit >= 0.75 and returns a maximum of 3, possibly 0. Do not change the canonical opportunity schema to carry delivery state.

## Hard rules
- Do not invent opportunities.
- Do not make a closed opportunity look open.
- Do not claim eligibility when key facts are unknown.
- Do not duplicate the same underlying opportunity because marketing URLs differ.
- Do not create renderer-specific JSON fields.
