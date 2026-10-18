# Good Things installation guide v0.2

One person = one private GitHub instance. The public starter is CODE and PLACEHOLDERS ONLY. Never store a real person's private profile in the public starter.

## Fastest route: ChatGPT-assisted install

1. Open prompts/one-prompt-install.md from the public source.
2. Paste its content into **ordinary ChatGPT**. It uses connected tools when possible; Work is optional only for website-UI steps that the available tools cannot perform.
3. Connect/authorize GitHub and Vercel when prompted. The installation assistant follows skills/install-goodthings/SKILL.md.
4. Confirm permissions, private repository owner/name, preferred daily schedule, and environment secrets inside the provider UI.
5. Finish the verification checklist in docs/installation-test.md.

This is currently an ASSISTED installation. ChatGPT can only automate actions supported by the tools and access actually available in the user's session.

## Manual fallback

### A. Private GitHub instance
The template owner first enables Settings > General > Template repository. New user selects Use this template > Create a new repository > Private.
Do not fork; do not copy user data from an existing instance.

### B. Initial profile and data
Edit data/profile.json using the user's real goals/constraints. Leave unknown fields empty/unknown.
Use prompts/install.md to generate one real dated feed under data/opportunities/YYYY-MM-DD.json and update data/opportunity-index.json.
The example JSON is not a real opportunity and is deliberately excluded from the live feed.

### C. Local smoke test

~~~sh
npm install
npm run validate
npm test
npm run typecheck
npm run build
npm run dev
~~~

### D. Deploy a private instance to Vercel
Import the NEW private repo into Vercel. Configure these environment variables in Vercel project settings (never in committed files):

- GOODTHINGS_ACCESS_PASSWORD — unique long random 16+ character password. Share it with the owner outside public chat.
- GOODTHINGS_SESSION_SECRET — independent random 32+ character string; generate locally with "openssl rand -hex 32".
- GITHUB_OWNER — new private repo owner.
- GITHUB_REPO — new private repo name.
- GITHUB_TOKEN — fine-grained GitHub token restricted to this repo, Contents read/write.

Redeploy after environment changes. Public visitors must see the LOCKED login screen, not user data. If app-password variables are unset the page remains locked. For publicly reachable domains, enable Vercel Authentication/deployment protection or provider-side throttling too; application login does not currently implement distributed brute-force rate limiting.

### E. Feedback and task
Log in, judge every card with Nope/Want, then look for a newly committed data/interactions/*.json file in the private repo. If write-back fails, use Retry; the pending batch is kept on that device.

Set up a recurring ChatGPT Scheduled Task with prompts/scheduled-task.md and the EXACT private repo name. Confirm creation in ChatGPT's task UI. Validate one executed run writes a new real feed. The scheduled execution may have different connector availability/permissions; do not assume success.

### F. Verify and record
Use docs/installation-test.md to record each pass/fail, human intervention, time cost and follow-up fix.

## Credentials and privacy
Never put token/password/session secret into JSON, a git commit, an issue, a screenshot, or chat. The template is public; generated per-user repositories must remain private. Avoid transmitting a person's actual profile into public test fixtures.

