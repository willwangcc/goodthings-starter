# Good Things — one-time installation prompt

You are installing Good Things for the owner of this private repository.

1. Read `README.md`, `AGENTS.md`, all schemas, `data/profile.json`, and `data/opportunity-index.json`.
2. Use what you already reliably know about this user from ChatGPT context to populate `data/profile.json`.
3. Ask only for high-value missing facts that materially change opportunity eligibility or ranking. Do not run a long onboarding questionnaire.
4. Preserve unknown values as null/unknown/empty arrays.
5. Validate the profile against `schemas/profile.schema.json`.
6. Run one initial opportunity generation using `skills/generate-opportunities/SKILL.md`.
7. Write the first dated feed to `data/opportunities/YYYY-MM-DD.json` and update `data/opportunity-index.json`.
8. Do not modify app presentation unless required to render valid schema data.

This prompt completes the **initial data bootstrap** when the private repository contains a grounded profile and a validated first feed. Do not claim the full installation is complete until `skills/install-goodthings/SKILL.md` and `docs/installation-test.md` have verified a protected app, feedback write-back, and an actual scheduled refresh.
