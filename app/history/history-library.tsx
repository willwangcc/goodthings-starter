"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HistoryDecision, HistorySnapshot } from "../../lib/history";

const PAGE_SIZE = 30;
type Filter = "all" | HistoryDecision;
const decisions: { id: Filter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "want", label: "想要" },
  { id: "pass", label: "不适合" },
  { id: "unreviewed", label: "无决策记录" },
];
const kindLabels: Record<string, string> = {
  grant: "资助", subsidy: "补贴", program: "项目", job: "工作",
  event: "活动", competition: "比赛", resource: "资源",
  perk: "福利", community: "社群", other: "其他",
};
const decisionLabels: Record<HistoryDecision, string> = {
  want: "想要", pass: "不适合", unreviewed: "无决策记录",
};

function displayDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "时间未知";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
function safeSource(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export default function HistoryLibrary({ snapshot }: { snapshot: HistorySnapshot }) {
  const [decision, setDecision] = useState<Filter>("all");
  const [kind, setKind] = useState("all");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [expanded, setExpanded] = useState<string | null>(null);
  const kinds = useMemo(() => [...new Set(snapshot.items.map(item =>
    item.opportunity.identity.kind || "other"))].sort(), [snapshot.items]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return snapshot.items.filter(item => {
      const opportunity = item.opportunity;
      if (decision !== "all" && item.decision !== decision) return false;
      if (kind !== "all" && opportunity.identity.kind !== kind) return false;
      if (query && ![
        opportunity.identity.title,
        opportunity.identity.organizer,
        opportunity.summary.short,
        ...(opportunity.taxonomy?.topics || []),
        ...(opportunity.taxonomy?.tags || []),
      ].join(" ").toLocaleLowerCase().includes(query)) return false;
      return true;
    });
  }, [snapshot.items, decision, kind, search]);
  function changeDecision(value: Filter) { setDecision(value); setVisible(PAGE_SIZE); setExpanded(null); }
  function changeKind(value: string) { setKind(value); setVisible(PAGE_SIZE); setExpanded(null); }

  return (
    <main className="shell history-shell">
      <header className="history-topbar">
        <span className="eyebrow">GOOD THINGS</span>
        <Link href="/" className="history-back">← 返回机会</Link>
      </header>
      <div className="history-intro">
        <span className="history-eyebrow">PERSONAL LIBRARY</span>
        <h1>你的机会库</h1>
        <p>每一个曾经推送给你的机会，都值得再看一眼。</p>
        <div className="history-count"><strong>{snapshot.items.length}</strong> 个不同机会 <span>· {snapshot.feed_count} 轮推送</span></div>
      </div>

      <div className="history-filters">
        <div role="group" aria-label="按判断筛选" className="history-tabs">
          {decisions.map(option => (
            <button type="button" key={option.id}
              aria-pressed={decision === option.id}
              className={decision === option.id ? "active" : ""}
              onClick={() => changeDecision(option.id)}>{option.label}</button>
          ))}
        </div>
        <div className="history-inputs">
          <label>
            <span>机会类型</span>
            <select value={kind} onChange={event => changeKind(event.target.value)}>
              <option value="all">全部类型</option>
              {kinds.map(value => <option key={value} value={value}>{kindLabels[value] || value}</option>)}
            </select>
          </label>
          <label>
            <span>搜索历史</span>
            <input type="search" value={search} placeholder="名称、组织、主题"
              onChange={event => { setSearch(event.target.value); setVisible(PAGE_SIZE); setExpanded(null); }} />
          </label>
        </div>
      </div>

      <section aria-label="历史机会列表" className="history-list">
        <div className="history-list-heading">
          <h2>{filtered.length} 个结果</h2>
          <span>按最近推送排序</span>
        </div>
        {filtered.length === 0 ? <p className="history-empty">
          {snapshot.items.length ? "没有符合筛选条件的机会。" : "还没有真实机会。首次生成并保存 Feed 后，它们会出现在这里。"}
        </p> : null}
        {filtered.slice(0, visible).map(item => {
          const op = item.opportunity;
          const source = safeSource(op.provenance?.primary_source_url || "");
          const open = expanded === item.id;
          const topics = op.taxonomy?.topics || [];
          return (
            <article key={item.id} className="history-item">
              <button className="history-item-toggle" type="button"
                aria-expanded={open}
                onClick={() => setExpanded(open ? null : item.id)}>
                <span className="history-item-copy">
                  <span className="history-item-meta">{kindLabels[op.identity.kind] || op.identity.kind} · {op.identity.organizer}</span>
                  <strong>{op.identity.title}</strong>
                  <span className="history-item-summary">{op.summary.short}</span>
                  <span className="history-item-footer">
                    <span className={"history-decision history-decision-" + item.decision}>{decisionLabels[item.decision]}</span>
                    <time dateTime={item.last_seen_at}>最近推送 {displayDate(item.last_seen_at)}</time>
                  </span>
                </span>
                <span aria-hidden="true" className="history-chevron">{open ? "−" : "+"}</span>
              </button>
              {open ? (
                <div className="history-item-detail">
                  {topics.length > 0 ? <div className="history-topics">
                    {topics.map(topic => <span key={topic}>{topic}</span>)}
                  </div> : null}
                  {op.summary.long ? <p>{op.summary.long}</p> : null}
                  <p><b>为什么适合你：</b>{item.match.why_you}</p>
                  <p><b>下一步：</b>{item.match.next_step}</p>
                  <p className="history-provenance">首次推送 {displayDate(item.first_seen_at)} · 共出现 {item.appearances} 次</p>
                  {source ? <a href={source} target="_blank" rel="noopener noreferrer" className="history-source">查看原始来源 ↗</a> : null}
                </div>
              ) : null}
            </article>
          );
        })}
        {visible < filtered.length ? <button type="button" className="history-loadmore"
          onClick={() => setVisible(count => count + PAGE_SIZE)}>
          加载更多（剩余 {filtered.length - visible}）
        </button> : null}
      </section>
      <p className="history-note">「无决策记录」仅表示没有保存的左/右判断，不代表你一定没看过。机会状态为最后保存的快照，可能不是当前实时状态。</p>
    </main>
  );
}
