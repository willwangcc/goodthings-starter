Refresh this user's Good Things instance.

Read the repository contract first: `AGENTS.md`, then `data/profile.json`, `data/opportunity-index.json`, recent `data/interactions/*.json`, recent `data/opportunities/*.json`, `skills/evolve-profile/SKILL.md`, and `skills/generate-opportunities/SKILL.md`.

Then:

1. Evolve the profile only when new evidence warrants it.
2. Discover current real opportunities using fresh public sources.
3. Verify important facts from primary sources whenever possible.
4. Normalize canonical URLs and dedupe against the full opportunity index before selecting.
5. Rank for this user using profile + interaction evidence while preserving the configured exploration ratio.
6. Generate approximately `profile.generation.target_count` opportunities.
7. Validate all durable JSON against the schemas in `schemas/`.
8. Write a new `data/opportunities/YYYY-MM-DD.json` feed and update `data/opportunity-index.json`; update `data/profile.json` only if evidence warrants it.
9. Commit the changes to this repository with a concise refresh message.

Do not notify the user merely because the task ran. The value is the refreshed feed. Surface an alert only when an opportunity is unusually time-sensitive or high-upside and waiting until the user's normal review would materially reduce its value.
