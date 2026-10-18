import { NextResponse } from "next/server";
import { authConfigured, createSession, SESSION_COOKIE, verifyPassword } from "../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Private access is not configured." }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origin mismatch." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  const data = await request.formData().catch(() => null);
  const candidate = data?.get("password");
  if (typeof candidate !== "string" || candidate.length > 512 || !verifyPassword(candidate)) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
