import { NextResponse } from "next/server";

function encodeBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

export async function POST(request: Request) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    return NextResponse.json({ error: "GitHub write-back is not configured." }, { status: 503 });
  }

  const body = await request.json();
  if (body?.schema_version !== "interaction-batch.v1" || !body?.batch_id || !Array.isArray(body?.events)) {
    return NextResponse.json({ error: "Invalid interaction batch." }, { status: 400 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const safeBatchId = String(body.batch_id).replace(/[^a-zA-Z0-9-_]/g, "");
  const path = `data/interactions/${day}-${safeBatchId}.json`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message: `data(goodthings): record interaction ${safeBatchId}`,
      content: encodeBase64(JSON.stringify(body, null, 2) + "\n"),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error: "GitHub write-back failed.", detail: error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, path });
}
