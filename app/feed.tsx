"use client";

import { useMemo, useState } from "react";
import type { OpportunityFeed } from "../lib/data";

type Event = {
  at: string;
  opportunity_id: string;
  action: "left" | "right" | "detail" | "source";
  dwell_ms?: number;
};

export default function Feed({ feed }: { feed: OpportunityFeed }) {
  const [index, setIndex] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [startedAt] = useState(() => new Date().toISOString());
  const [cardStartedAt, setCardStartedAt] = useState(() => Date.now());
  const [detail, setDetail] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = feed.items[index];
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  async function finish(nextEvents: Event[]) {
    if (saved || nextEvents.length === 0) return;
    const payload = {
      schema_version: "interaction-batch.v1",
      batch_id: crypto.randomUUID(),
      user_id: feed.user_id,
      session_id: sessionId,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      feed_generated_at: feed.generated_at,
      events: nextEvents,
    };

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) setSaved(true);
  }

  async function decide(action: "left" | "right") {
    if (!current) return;
    const event: Event = {
      at: new Date().toISOString(),
      opportunity_id: current.opportunity.id,
      action,
      dwell_ms: Date.now() - cardStartedAt,
    };
    const nextEvents = [...events, event];
    setEvents(nextEvents);
    setDetail(false);

    if (index >= feed.items.length - 1) {
      setIndex(index + 1);
      await finish(nextEvents);
    } else {
      setIndex(index + 1);
      setCardStartedAt(Date.now());
    }
  }

  function openDetail() {
    if (!current) return;
    setDetail(true);
    setEvents((prev) => [...prev, { at: new Date().toISOString(), opportunity_id: current.opportunity.id, action: "detail" }]);
  }

  function openSource() {
    if (!current) return;
    setEvents((prev) => [...prev, { at: new Date().toISOString(), opportunity_id: current.opportunity.id, action: "source" }]);
    window.open(current.opportunity.provenance.primary_source_url, "_blank", "noopener,noreferrer");
  }

  if (!current) {
    return (
      <main className="shell">
        <section className="done">
          <div className="eyebrow">GOOD THINGS</div>
          <h1>{feed.items.length ? "今天刷完了" : "还没有机会卡片"}</h1>
          <p>{feed.items.length ? (saved ? "反馈已经写回 GitHub。" : "正在保存反馈…") : "运行 Scheduled Task 后，这里会出现你的机会。"}</p>
        </section>
      </main>
    );
  }

  const benefit = current.opportunity.benefits[0];
  const deadline = current.opportunity.lifecycle.deadline_at
    ? new Date(current.opportunity.lifecycle.deadline_at).toLocaleDateString()
    : "No verified deadline";

  return (
    <main className="shell">
      <header>
        <span className="eyebrow">GOOD THINGS</span>
        <span className="count">{index + 1} / {feed.items.length}</span>
      </header>

      <article className="card">
        <div className="meta">{current.opportunity.identity.kind} · {current.opportunity.identity.organizer}</div>
        <h1>{current.opportunity.identity.title}</h1>
        <p className="summary">{current.opportunity.summary.short}</p>

        <div className="facts">
          <div><span>WHY YOU</span><strong>{current.match.why_you}</strong></div>
          <div><span>WHY NOW</span><strong>{current.match.why_now}</strong></div>
          <div><span>UPSIDE</span><strong>{benefit?.note || benefit?.type || "See source"}</strong></div>
          <div><span>DEADLINE</span><strong>{deadline}</strong></div>
        </div>

        {detail && (
          <div className="detail">
            <p>{current.opportunity.summary.long || "No additional verified detail."}</p>
            <p><b>Next:</b> {current.match.next_step}</p>
            <button onClick={openSource}>Open primary source ↗</button>
          </div>
        )}
      </article>

      <nav className="actions">
        <button className="no" onClick={() => decide("left")}>← Nope</button>
        <button className="detailButton" onClick={openDetail}>Detail</button>
        <button className="yes" onClick={() => decide("right")}>Want →</button>
      </nav>
    </main>
  );
}
