"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { OpportunityFeed } from "../lib/data";

type Event = {
  at: string;
  opportunity_id: string;
  action: "left" | "right" | "detail" | "source";
  dwell_ms?: number;
};

type Batch = {
  schema_version: "interaction-batch.v1";
  batch_id: string;
  user_id: string;
  session_id: string;
  started_at: string;
  completed_at: string;
  feed_generated_at: string;
  events: Event[];
};

const PENDING_KEY = "goodthings.pending-feedback.v1";
const DRAFT_KEY = "goodthings.in-progress-deck.v1";

export default function Feed({ feed }: { feed: OpportunityFeed }) {
  const [index, setIndex] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [cardStartedAt, setCardStartedAt] = useState(() => Date.now());
  const [detail, setDetail] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [saveError, setSaveError] = useState("");
  const [pending, setPending] = useState<Batch | null>(null);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    try {
      const json = localStorage.getItem(PENDING_KEY);
      if (json) {
        const batch = JSON.parse(json) as Batch;
        if (batch.schema_version === "interaction-batch.v1" && batch.user_id === feed.user_id) {
          localStorage.removeItem(DRAFT_KEY);
          setPending(batch);
          setSaveState("failed");
          setSaveError("You have unsaved feedback. Retry to send it to your private GitHub repository.");
          setIndex(feed.items.length);
          return;
        }
      }
      const draftJson = localStorage.getItem(DRAFT_KEY);
      if (!draftJson) return;
      const draft = JSON.parse(draftJson) as {
        user_id: string; feed_generated_at: string; index: number;
        events: Event[]; session_id: string; started_at: string;
      };
      if (draft.user_id === feed.user_id && draft.feed_generated_at === feed.generated_at &&
          Array.isArray(draft.events) && Number.isInteger(draft.index) &&
          draft.index >= 0 && draft.index < feed.items.length &&
          typeof draft.started_at === "string" && typeof draft.session_id === "string") {
        setEvents(draft.events);
        setIndex(draft.index);
        setStartedAt(draft.started_at);
        setSessionId(draft.session_id);
      }
    } catch {
      localStorage.removeItem(PENDING_KEY);
    }
  }, [feed.user_id, feed.items.length]);

  function saveDraft(nextEvents: Event[], nextIndex: number) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        user_id: feed.user_id, feed_generated_at: feed.generated_at,
        index: nextIndex, events: nextEvents, session_id: sessionId, started_at: startedAt,
      }));
    } catch {
      // Storage may be disabled; current in-memory session still works.
    }
  }

  async function submit(batch: Batch) {
    setSaveState("saving");
    setSaveError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(batch),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      localStorage.removeItem(PENDING_KEY);
      localStorage.removeItem(DRAFT_KEY);
      setPending(null);
      setSaveState("saved");
    } catch {
      setSaveState("failed");
      setSaveError("Could not save feedback. Your batch is stored on this device. Tap Retry.");
    }
  }

  async function finish(nextEvents: Event[]) {
    const batch: Batch = {
      schema_version: "interaction-batch.v1",
      batch_id: crypto.randomUUID(),
      user_id: feed.user_id,
      session_id: sessionId,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      feed_generated_at: feed.generated_at,
      events: nextEvents,
    };
    localStorage.setItem(PENDING_KEY, JSON.stringify(batch));
    setPending(batch);
    await submit(batch);
  }

  async function decide(action: "left" | "right") {
    const current = feed.items[index];
    if (!current || saveState === "saving") return;
    const event: Event = {
      at: new Date().toISOString(),
      opportunity_id: current.opportunity.id,
      action,
      dwell_ms: Date.now() - cardStartedAt,
    };
    const nextEvents = [...events, event];
    setEvents(nextEvents);
    if (index < feed.items.length - 1) saveDraft(nextEvents, index + 1);
    setDetail(false);
    setIndex(index + 1);
    if (index >= feed.items.length - 1) {
      await finish(nextEvents);
    } else {
      setCardStartedAt(Date.now());
    }
  }

  function openDetail() {
    const current = feed.items[index];
    if (!current) return;
    setDetail(true);
    const nextEvents: Event[] = [...events, { at: new Date().toISOString(), opportunity_id: current.opportunity.id, action: "detail" }];
    setEvents(nextEvents);
    saveDraft(nextEvents, index);
  }

  function openSource() {
    const current = feed.items[index];
    if (!current) return;
    const nextEvents: Event[] = [...events, { at: new Date().toISOString(), opportunity_id: current.opportunity.id, action: "source" }];
    setEvents(nextEvents);
    saveDraft(nextEvents, index);
    window.open(current.opportunity.provenance.primary_source_url, "_blank", "noopener,noreferrer");
  }

  const current = feed.items[index];
  if (!current) {
    return (
      <main className="shell">
        <header><span className="eyebrow">GOOD THINGS</span><Link className="history-nav" href="/history">历史 ↗</Link></header>
        <section className="done">
          <div className="eyebrow">GOOD THINGS</div>
          <h1>{feed.items.length ? "今天刷完了" : "还没有机会卡片"}</h1>
          <p role={saveState === "failed" ? "alert" : undefined}>
            {!feed.items.length
              ? "运行 Scheduled Task 后，这里会出现你的真实机会。"
              : saveState === "saved"
                ? "反馈已经写回 GitHub。"
                : saveState === "failed"
                  ? saveError
                  : saveState === "saving"
                    ? "正在安全地保存反馈…"
                    : "等待保存反馈。"}
          </p>
          {saveState === "failed" && pending ? (
            <button type="button" onClick={() => submit(pending)}>Retry saving feedback</button>
          ) : null}
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
        <div className="feed-header-end"><span className="count">{index + 1} / {feed.items.length}</span><Link className="history-nav" href="/history">历史 ↗</Link></div>
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
        {detail ? (
          <div className="detail">
            <p>{current.opportunity.summary.long || "No additional verified detail."}</p>
            <p><b>Next:</b> {current.match.next_step}</p>
            <button onClick={openSource}>Open primary source ↗</button>
          </div>
        ) : null}
      </article>
      <nav className="actions">
        <button className="no" onClick={() => decide("left")}>← Nope</button>
        <button className="detailButton" onClick={openDetail}>Detail</button>
        <button className="yes" onClick={() => decide("right")}>Want →</button>
      </nav>
    </main>
  );
}
