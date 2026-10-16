# Evolve Profile

## Purpose
Keep `data/profile.json` useful without turning it into a hallucinated biography.

## Evidence hierarchy

Strongest → weakest:
1. explicit user statement
2. repeated behavior across multiple opportunities/sessions
3. a single right/left swipe
4. detail/source open
5. model inference without direct evidence

Only levels 1–2 should normally change stable facts. Levels 2–4 may tune intent/preferences/generation when the direction is clear.

## Allowed evolution
- add/remove current interests when repeated behavior supports it
- refine current goals when explicitly stated
- update current projects from explicit evidence
- tune `opportunity_kinds`
- add avoid-patterns after repeated negative evidence
- tune `exploration_ratio`
- update constraints only from explicit facts

## Do not
- infer age, citizenship, visa status, income, company status, degree, or eligibility from weak behavior
- convert one swipe into a stable identity claim
- silently erase earlier facts; revise them only with stronger newer evidence
- overfit the profile until exploration collapses

## Output
If there is no meaningful new evidence, do not modify the profile. A no-op is a correct result.
