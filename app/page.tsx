import { loadLatestFeed } from "../lib/data";
import Feed from "./feed";

export const dynamic = "force-dynamic";

export default function Page() {
  const feed = loadLatestFeed();
  return <Feed feed={feed} />;
}
