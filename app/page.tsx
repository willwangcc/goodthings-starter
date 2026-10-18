import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "../lib/auth";
import { loadLatestFeed } from "../lib/data";
import Feed from "./feed";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  if (!verifySession(cookieStore.get(SESSION_COOKIE)?.value)) {
    redirect("/login");
  }
  const feed = loadLatestFeed();
  return <Feed feed={feed} />;
}
