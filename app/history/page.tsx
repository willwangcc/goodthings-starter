import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import profile from "../../data/profile.json";
import { SESSION_COOKIE, verifySession } from "../../lib/auth";
import { loadHistory } from "../../lib/history";
import HistoryLibrary from "./history-library";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HistoryPage() {
  const cookieStore = await cookies();
  if (!verifySession(cookieStore.get(SESSION_COOKIE)?.value)) redirect("/login");

  try {
    const snapshot = await loadHistory(profile.user_id);
    return <HistoryLibrary snapshot={snapshot} />;
  } catch {
    // Fail closed on invalid, incomplete, or temporarily inaccessible private
    // history. Never silently show an incomplete collection as "all history".
    return (
      <main className="shell history-shell">
        <header className="history-topbar">
          <span className="eyebrow">GOOD THINGS</span>
          <Link href="/" className="history-back">← 返回机会</Link>
        </header>
        <section className="history-error" role="alert">
          <h1>历史暂不可用</h1>
          <p>未能完整读取私人 GitHub 仓库中的历史记录。请检查仓库读取权限或稍后重试；目前不会将部分记录误标为完整历史。</p>
          <Link href="/history">重新加载</Link>
        </section>
      </main>
    );
  }
}
