import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "goodthings_session";
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function authConfigured(): boolean {
  return Boolean(
    process.env.GOODTHINGS_ACCESS_PASSWORD &&
    process.env.GOODTHINGS_ACCESS_PASSWORD.length >= 16 &&
    process.env.GOODTHINGS_SESSION_SECRET &&
    process.env.GOODTHINGS_SESSION_SECRET.length >= 32
  );
}

function safeEqual(left: string, right: string): boolean {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function verifyPassword(candidate: string): boolean {
  return authConfigured() && safeEqual(candidate, process.env.GOODTHINGS_ACCESS_PASSWORD || "");
}

function signature(message: string): string {
  return createHmac("sha256", process.env.GOODTHINGS_SESSION_SECRET || "")
    .update(message)
    .digest("hex");
}

export function createSession(now = Date.now()): string {
  if (!authConfigured()) throw new Error("Good Things authentication is not configured.");
  const payload = "v1." + String(now + SESSION_LIFETIME_MS);
  return payload + "." + signature(payload);
}

export function verifySession(value: string | null | undefined, now = Date.now()): boolean {
  if (!authConfigured() || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!Number.isSafeInteger(expires) || expires <= now || expires > now + SESSION_LIFETIME_MS) return false;
  const received = parts[2];
  if (!/^[a-f0-9]{64}$/.test(received)) return false;
  const expected = signature(parts[0] + "." + parts[1]);
  return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}

export function readCookie(cookieHeader: string | null, name: string): string | null {
  for (const entry of (cookieHeader || "").split(";")) {
    const separator = entry.indexOf("=");
    if (separator === -1) continue;
    if (entry.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(entry.slice(separator + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}
