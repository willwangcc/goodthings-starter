# Installation Learning Loop v1

**One install = one report; one independently fixable friction = at most one public Issue.**

A participant's installation experience is evidence about the installer, not a judgment of the participant. Recording a report is useful even when installation succeeds or the user stops early.

## Privacy / ownership boundaries

- A real report belongs to the participant. With their permission, save it ONLY in their **private instance** under data/installation-reports/install-YYYYMMDD-<short-random-id>.json (or give it to them to keep privately). The public starter contains only a synthetic example.
- The structured schema lives in schemas/installation-report.schema.json. Use null or NOT_TESTED when times, capabilities or evidence are unknown. Never manufacture metrics or successful test outcomes.
- Do not put passwords, tokens, credentials, cookies, profile details, private repo owner/name, private repo URLs, nonpublic deployment domains, names, emails, chat transcripts, screenshots, private stack traces or full raw logs into public Issues. Reports may also contain personal information: avoid unnecessary collection even in private storage.
- Never copy the entire report into a public Issue. Extract a small **generic, actionable technical problem** and review it carefully. Pattern matching or AI redaction is not guaranteed to catch every private detail.
- **Ask the participant's explicit approval for every public issue submission** after showing its exact title and body. Permission to install does not imply permission to publish. If they decline, leave only the private report/draft. Do not expose a private repo link even as a "reference".
- Treat exploitable security weaknesses, tokens, sensitive logs, and vulnerability details as confidential. Do NOT create public Issues for these. Use a private security disclosure channel to the maintainer instead.

## Workflow

1. **Capture**: At installation completion, PARTIAL result, or BLOCKED stop, reconstruct the stages actually reached (REPO_READY → DATA_READY → APP_READY → FEEDBACK_READY → SCHEDULE_READY → COMPLETE) from observable evidence. Mark PASS / FAIL / PENDING / BLOCKED / NOT_TESTED for each relevant T01–T13 acceptance check. Never infer a time from memory if no clock data exists.
2. **Report**: Produce an installation-report.v1 JSON with stage, observed/expected outcomes, recovery, minutes lost if measured, and any existing Issue link. Validate it against the schema. Ask permission before writing it to the participant's private repository. The user can instead keep a local copy.
3. **Triage**: For each friction, decide whether the failure is a reproducible installer defect, unclear instructions, external limitation, or a question requiring more evidence. Do not make an Issue for every transient, duplicate, or unsupported hypothesis.
4. **Deduplicate**: Search OPEN and CLOSED issues in willwangcc/goodthings-starter using the stage, generic symptoms and expected behavior. If an existing issue covers the root symptom, link it in the private report. Do not publicly comment with user-specific evidence.
5. **Draft**: For novel, actionable frictions, prepare exactly one public, minimal technical Issue per distinct fix. Use .github/ISSUE_TEMPLATE/installation-friction.yml. Describe prerequisites, public-template version or non-sensitive relevant component, generic reproduction, expected/actual behavior, and Definition of Done. Remove private details. Inability to prove a hypothesis is grounds for a draft, not a fabricated reproduction.
6. **Consent**: Show the exact proposed public title/body to the participant and request explicit approval to publish. Publish only with their approval and adequate GitHub permissions, otherwise provide the draft/issue form link. For security vulnerabilities, stop public publication.
7. **Close the loop**: Record returned public Issue URLs in the participant's private report (with permission). Link Issue to PR and regression test. In a later installation, check whether the fix reduced recurrence; only then mark the friction resolved.

## Suggested triage priority

- P0: genuine private-data leakage, token risk, or unsafe authorization (PRIVATE SECURITY HANDLING; not public).
- P1: blocks completing install with no reasonable workaround.
- P2: significant repeated manual intervention or wasted time.
- P3: minor polish/docs; batch when possible.

Prioritize using number of independent users affected, user minutes lost, severity, workaround availability, and confidence. Do not invent incidence statistics.

## Metrics

For each install: result (PASS/PARTIAL/BLOCKED), last verified stage, time to first verified opportunity, total elapsed minutes if known, number of human interventions, and custom code edits. Track these across **consenting** reports: successful install %, median elapsed minutes, percentage requiring zero code edits, and recurring frictions.

To avoid a misleading "one-click" claim: a report does not prove actual unattended Scheduled Task write access. Only verified task execution can establish COMPLETE.

## How to run

- Installer Agent: skills/install-goodthings/SKILL.md
- Post-install reviewer: skills/post-install-review/SKILL.md
- Copyable prompt: prompts/post-install-review.md
- Acceptance checks: docs/installation-test.md
- Schema: schemas/installation-report.schema.json
- Synthetic schema fixture: examples/installation-report.example.json
- Manual issue submission: https://github.com/willwangcc/goodthings-starter/issues/new/choose

The public starter itself is a **template and source code repository**, never a centralized database of participants.

