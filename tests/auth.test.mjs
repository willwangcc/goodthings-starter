import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { authConfigured, createSession, readCookie, verifyPassword, verifySession } from "../lib/auth.ts";

const originalPassword = process.env.GOODTHINGS_ACCESS_PASSWORD;
const originalSecret = process.env.GOODTHINGS_SESSION_SECRET;

before(() => {
  process.env.GOODTHINGS_ACCESS_PASSWORD = "correct-horse-battery-staple-v02";
  process.env.GOODTHINGS_SESSION_SECRET = "3b0d92550681d95699a8576e7539823c090d8ea99967ddfdce7d2bc485c4551a";
});

after(() => {
  if (originalPassword === undefined) delete process.env.GOODTHINGS_ACCESS_PASSWORD;
  else process.env.GOODTHINGS_ACCESS_PASSWORD = originalPassword;
  if (originalSecret === undefined) delete process.env.GOODTHINGS_SESSION_SECRET;
  else process.env.GOODTHINGS_SESSION_SECRET = originalSecret;
});

test("fails closed with weak configuration", () => {
  const saved = process.env.GOODTHINGS_ACCESS_PASSWORD;
  process.env.GOODTHINGS_ACCESS_PASSWORD = "short";
  assert.equal(authConfigured(), false);
  assert.equal(verifySession("anything"), false);
  process.env.GOODTHINGS_ACCESS_PASSWORD = saved;
});

test("password verification uses configured secret", () => {
  assert.equal(verifyPassword("correct-horse-battery-staple-v02"), true);
  assert.equal(verifyPassword("incorrect-password"), false);
});

test("session rejects expiry, tampering, and invalid shape", () => {
  const now = 1750000000000;
  const token = createSession(now);
  assert.equal(verifySession(token, now), true);
  assert.equal(verifySession(token, now + 8 * 24 * 3600 * 1000), false);
  assert.equal(verifySession(token.slice(0, -1) + (token.at(-1) === "f" ? "e" : "f"), now), false);
  assert.equal(verifySession("v1.bad.bad", now), false);
});

test("cookie parser reads named cookie", () => {
  assert.equal(readCookie("a=1; goodthings_session=v1.123.abc; b=2", "goodthings_session"), "v1.123.abc");
  assert.equal(readCookie("a=1", "goodthings_session"), null);
});
