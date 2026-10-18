import { NextResponse } from "next/server";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import interactionSchema from "../../../schemas/interaction.schema.json";
import profile from "../../../data/profile.json";
import { readCookie, SESSION_COOKIE, verifySession } from "../../../lib/auth";

export const runtime = "nodejs";
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
const validateBatch = ajv.compile(interactionSchema);
const MAX_BYTES = 65536;
const MAX_EVENTS = 200;

export async function POST(request: Request) {
  const session = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!verifySession(session)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origin mismatch." }, { status: 403 });
  }
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) {
    return NextResponse.json({ error: "JSON required." }, { status: 415 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) {
    return NextResponse.json({ error: "Batch too large." }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed JSON." }, { status: 400 });
  }
  if (!validateBatch(body)) {
    return NextResponse.json({ error: "Invalid interaction schema." }, { status: 400 });
  }

  const batch = body as {
    batch_id: string;
    user_id: string;
    events: Array<{ opportunity_id: string; action: string }>;
  };
  if (batch.user_id !== profile.user_id || batch.events.length < 1 || batch.events.length > MAX_EVENTS ||
      !/^[a-zA-Z0-9_-]{8,64}$/.test(batch.batch_id)) {
    return NextResponse.json({ error: "Invalid interaction scope." }, { status: 400 });
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) {
    return NextResponse.json({ error: "GitHub write-back is not configured." }, { status: 503 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const path = "data/interactions/" + day + "-" + batch.batch_id + ".json";
  const apiUrl = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" +
    encodeURIComponent(repo) + "/contents/" + path;
  const headers = {
    authorization: "Bearer " + token,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  };
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      message: "data(goodthings): record interaction " + batch.batch_id,
      content: Buffer.from(JSON.stringify(body, null, 2) + "\n", "utf8").toString("base64"),
    }),
    cache: "no-store",
  });

  if (!response.ok && response.status === 422) {
    // A retry may arrive after GitHub committed but before the browser received the response.
    const existing = await fetch(apiUrl, { headers, cache: "no-store" });
    if (existing.ok) {
      const file = await existing.json();
      try {
        const persisted = JSON.parse(Buffer.from(String(file.content).replace(/\s/g, ""), "base64").toString("utf8"));
        if (JSON.stringify(persisted) === JSON.stringify(body)) {
          return NextResponse.json({ ok: true, path, already_saved: true });
        }
      } catch {
        // Do not treat an unreadable or mismatched file as a success.
      }
    }
  }

  if (!response.ok) {
    // Do not leak GitHub upstream response or the write token to an unauthenticated client.
    return NextResponse.json({ error: "GitHub write-back failed. Please retry." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, path });
}
