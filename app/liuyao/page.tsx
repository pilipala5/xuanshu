"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CoinStage, RitualCoin, RitualTray } from "@/components/CoinStage";
import { HexagramView } from "@/components/HexagramView";
import { SiteHeader } from "@/components/SiteChrome";
import { createLiuYaoSession } from "@/features/liuyao/engine";
import type { LiuYaoSession, YaoValue } from "@/features/liuyao/domain/types";
import { saveSession } from "@/features/liuyao/storage/history";

type Phase = "input" | "casting" | "complete";

export default function LiuYaoPage() {
  const reducedMotion = useReducedMotion() ?? false;
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [session, setSession] = useState<LiuYaoSession | null>(null);
  const [castIndex, setCastIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState<YaoValue[]>([]);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  const beginCasting = () => {
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 2) { setError("请先写下一个清楚、具体的问题"); return; }
    const now = new Date();
    const id = crypto.randomUUID?.() ?? `${now.getTime()}-${Math.random().toString(16).slice(2)}`;
    const next = createLiuYaoSession({ question: cleanQuestion, id, now, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    setSession({ ...next, status: "casting" });
    setVisibleLines([]);
    setCastIndex(0);
    setError("");
    setSaveState("idle");
    setPhase("casting");
  };

  const finishCast = () => {
    if (!session) return;
    const nextLines = session.lines.slice(0, castIndex + 1);
    setVisibleLines(nextLines);
    if (castIndex < 5) {
      schedule(() => setCastIndex((value) => value + 1), reducedMotion ? 80 : 190);
      return;
    }
    const completed = { ...session, status: "completed" as const };
    setSession(completed);
    setSaveState("saving");
    schedule(() => setPhase("complete"), reducedMotion ? 80 : 520);
    void saveSession(completed)
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("error"));
  };

  const reset = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setPhase("input"); setSession(null); setVisibleLines([]); setCastIndex(0); setSaveState("idle");
  };

  const openResult = async () => {
    if (!session || saveState === "saving") return;
    setSaveState("saving");
    try {
      await saveSession(session);
      setSaveState("saved");
      window.location.assign(`/liuyao/result/${session.id}`);
    } catch {
      setSaveState("error");
    }
  };

  return (
    <main className={`ritual-page ritual-phase-${phase}`}>
      <SiteHeader backHref="/" title="六爻 · 起卦" />
      <div className="ritual-backdrop" aria-hidden="true"><i /><i /></div>
      <div className="ritual-shell">
        <div className="ritual-guide"><h1>六爻起卦</h1><p>写下问题，自动完成六次投掷。查看卦象后，复制提示词给 AI 解读。</p><ol className="method-workflow" aria-label="使用步骤"><li className={phase === "input" ? "is-current" : "is-done"}><span>1</span>写下问题</li><li className={phase === "casting" ? "is-current" : phase === "complete" ? "is-done" : ""}><span>2</span>自动起卦</li><li className={phase === "complete" ? "is-current" : ""}><span>3</span>查看并问 AI</li></ol></div>
        <section className={`question-card ${phase !== "input" ? "is-locked" : ""}`}>
          <label htmlFor="question">你想问什么？</label>
          <div><textarea id="question" value={question} onChange={(event) => { setQuestion(event.target.value); if (error) setError(""); }} disabled={phase !== "input"} maxLength={80} rows={2} placeholder="例如：最近事业发展如何？" /><span>{question.length}/80</span></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <small>一事一问，问题越具体，越便于之后阅读卦象。</small>
        </section>

        <section className="ritual-area">
          <div className="ritual-caption"><span><b aria-hidden="true" />{phase === "input" ? "静心 · 定问" : phase === "casting" ? `第 ${castIndex + 1} / 6 爻` : "起卦完成"}</span><i /></div>
          {phase === "input" ? (
            <div className="idle-coins" aria-label="三枚静置铜钱">
              <div className="idle-coin-row">
                <RitualCoin label="乾通元宝字面" />
                <RitualCoin label="乾通元宝字面" />
                <RitualCoin label="乾通元宝字面" />
              </div>
              <RitualTray />
            </div>
          ) : session ? (
            <CoinStage key={castIndex} scores={session.coinScores[castIndex]} castIndex={castIndex} reducedMotion={reducedMotion} onComplete={finishCast} />
          ) : null}
        </section>

        <section className="casting-panel">
          <div className="casting-head"><span>六爻进度</span><b><AnimatePresence mode="popLayout" initial={false}><motion.i key={phase === "input" ? 0 : visibleLines.length} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>{phase === "input" ? "0" : visibleLines.length}</motion.i></AnimatePresence><em>/ 6</em></b></div>
          <div className="progress-track"><i style={{ width: `${visibleLines.length / 6 * 100}%` }} /></div>
          <HexagramView lines={[...(visibleLines.length ? visibleLines : [8, 8, 8, 8, 8, 8])] as YaoValue[]} activeCount={visibleLines.length} />
          <AnimatePresence mode="wait">
            {phase === "input" && <motion.button key="start" className="action-button action-button-primary primary-ritual-button" type="button" onClick={beginCasting} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span>开始起卦<small>三钱六掷</small></span><i aria-hidden="true">→</i></motion.button>}
            {phase === "casting" && <motion.p key="casting" className="casting-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><i aria-hidden="true" />正在完成六次投掷，请等待卦象生成。</motion.p>}
            {phase === "complete" && session && <motion.div key="complete" className="complete-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div><small>本卦</small><strong>{session.originalHexagram.name}</strong><span>→</span><small>变卦</small><strong>{session.changedHexagram.name}</strong></div>{saveState === "error" && <p className="save-error" role="alert">本机记录保存失败，请重试后查看卦象。</p>}<button className="action-button action-button-primary" type="button" onClick={() => void openResult()} disabled={saveState === "saving"}><span>{saveState === "saving" ? "正在保存卦象…" : saveState === "error" ? "重试并查看" : "查看卦象"}</span><i aria-hidden="true">→</i></button><button type="button" className="action-button action-button-secondary secondary-button" onClick={reset} disabled={saveState === "saving"}><span>重新起卦</span></button></motion.div>}
          </AnimatePresence>
        </section>
      </div>
      <nav className="bottom-nav" aria-label="六爻页面导航"><Link href="/#about">说明</Link><Link className="is-active" href="/liuyao">起卦</Link><Link href="/history">记录</Link></nav>
    </main>
  );
}
