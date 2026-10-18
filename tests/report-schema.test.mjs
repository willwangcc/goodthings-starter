import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("../", import.meta.url);
const load = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(load("schemas/installation-report.schema.json"));
const fixture = load("examples/installation-report.example.json");
const copy = () => structuredClone(fixture);

test("synthetic private installation report matches the schema", () => {
  assert.equal(validate(copy()), true, JSON.stringify(validate.errors));
  assert.equal(fixture.metrics.elapsed_minutes, null);
  assert.equal(fixture.checks[0].status, "NOT_TESTED");
});

test("rejects fictitious stage/check states and invalid negative measurements", () => {
  const invalid = copy();
  invalid.last_verified_state = "DONE_UNVERIFIED";
  assert.equal(validate(invalid), false);

  const badMetric = copy();
  badMetric.metrics.manual_interventions = -2;
  assert.equal(validate(badMetric), false);

  const badCheck = copy();
  badCheck.checks[0].test_id = "T99";
  assert.equal(validate(badCheck), false);
});

test("rejects accidentally added private identifiers and arbitrary report fields", () => {
  const invalid = copy();
  invalid.private_repo_url = "should-not-be-a-top-level-field";
  assert.equal(validate(invalid), false);

  const invalidFriction = copy();
  invalidFriction.frictions[0].token = "DO-NOT-STORE";
  assert.equal(validate(invalidFriction), false);
});

test("public issue URLs are constrained to canonical source Issues", () => {
  const invalid = copy();
  invalid.public_issue_links.push("https://github.com/example/private-instance/issues/4");
  assert.equal(validate(invalid), false);

  const valid = copy();
  valid.public_issue_links.push("https://github.com/willwangcc/goodthings-starter/issues/3");
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
});

