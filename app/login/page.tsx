import { authConfigured } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const ready = authConfigured();
  return (
    <main className="shell">
      <section className="done">
        <div className="eyebrow">GOOD THINGS</div>
        <h1>{ready ? "Your private radar" : "Installation not finished"}</h1>
        {!ready ? (
          <p>Ask the installer to set GOODTHINGS_ACCESS_PASSWORD (16+ characters) and GOODTHINGS_SESSION_SECRET (32+ characters) in Vercel, then redeploy. No personal data is accessible until these are configured.</p>
        ) : (
          <form action="/api/login" method="post" className="loginForm">
            <label htmlFor="password">Access password</label>
            <input id="password" type="password" name="password" autoComplete="current-password" required minLength={16} />
            {params.error ? <p role="alert">Incorrect password. Try again.</p> : null}
            <button type="submit">Unlock Good Things</button>
          </form>
        )}
      </section>
    </main>
  );
}
