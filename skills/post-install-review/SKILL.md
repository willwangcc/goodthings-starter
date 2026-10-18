---
name: post-install-review
description: Produce a private, evidence-grounded Good Things installation report, deduplicate installation frictions, and draft privacy-reviewed public GitHub issues only with explicit participant approval.
---

# Good Things — Post-install Review v1

Use after any complete, partial or blocked Good Things installation. Follow docs/installation-report.md, docs/installation-test.md, and schemas/installation-report.schema.json.

## 1. Establish evidence boundary

Read only installation events, results and files the participant actually supplied or authorized. This chat may not contain full preceding installation history; ask for missing high-value facts rather than pretending to remember.

Confirm the participant's own private instance. NEVER treat the public willwangcc/goodthings-starter repo as the participant's data repository. If the private instance is inaccessible, prepare a local report draft instead of writing anywhere.

## 2. Reconstruct the timeline

Assign the last *verified* state from REPO_READY, DATA_READY, APP_READY, FEEDBACK_READY, SCHEDULE_READY, COMPLETE. Installation may end as PASS, PARTIAL or BLOCKED. Treat T10 task-created and T11 real scheduled commit as different requirements; COMPLETE requires proven unattended refresh.

For each T01–T13 check, use PASS, FAIL, PENDING, BLOCKED or NOT_TESTED; attach the smallest safe evidence statement. Extract per-friction expected/observed/reproduction/workaround/minutes lost, preserving unknowns as null and clearly distinguishing fact from hypothesis.

Only use a measurement for elapsed time or manual interventions when it was actually tracked. If missing, leave null.

## 3. Prepare and validate a private report

Create installation-report.v1 JSON using the schema. Generate a unique report ID (install-YYYYMMDD-shortid) with no personal identifiers. The reports folder in a template is empty; examples/installation-report.example.json is SYNTHETIC.

Show the participant a short summary. Ask whether to commit the JSON report into their own private instance under data/installation-reports/<report-id>.json. This is optional. Do not persist real participant reports in the PUBLIC source repo, a public pull request, or an unapproved shared folder.

If code execution is available validate the JSON with npm run validate after saving it; otherwise check the schema fields carefully and mark automated validation NOT VERIFIED.

## 4. Deduplicate and draft Issues

For each actionable friction, search both open and closed issues in willwangcc/goodthings-starter by stage, generic symptom and component. Read matches. Reuse a matching Issue URL in the private report without publicly posting participant data. Do not create a second Issue when the previous one already covers it.

For a novel reproducible problem, prepare a PUBLIC title and body following the installation-friction Issue Form. Include sanitized expected/actual results, generic steps, workaround and acceptance criteria, and no identity-bearing identifiers.

**Private/security problems:** If the technical details could expose a vulnerability or a secret, do NOT create a public Issue; refer the participant to private security disclosure with the maintainer.

Redaction is a **review**, not just a regex. Remove direct identifiers, private service URLs, personal profile facts, tokens, IP addresses, raw request/response logs, email addresses, personal dates, screenshots with private data, and any material that would allow linking the report back to the participant. If unsure, omit it.

## 5. Consent gate and follow-through

Before EACH publication, present the exact public title and body and ask: "May I create this public GitHub Issue with exactly this information?" Do not infer consent from authorizing installation or from an instruction to "create a report".

Only after explicit approval and actual GitHub write access create the public Issue. If permissions are absent, give a reviewed draft and manual issue-form URL; do not claim an Issue was created.

On success, record the real Issue URL in the private report with permission; link a future PR/regression test to the issue. If the participant declines publication, keep the private draft and continue.

## Output summary

- Report ID / storage location (or draft only)
- Last verified stage and acceptance coverage
- Timing / intervention metrics only when measured
- Frictions: new / existing Issue / insufficient evidence / security-private
- Sanitized public drafts awaiting approval
- Actual public Issue URLs, if and only if created
- Top 1–3 evidence-based improvements and next installer iteration

No Issue needed is a valid outcome. Never publish private data or invent an unsuccessful installation.

