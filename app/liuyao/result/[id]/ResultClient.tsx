"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HexagramView } from "@/components/HexagramView";
import { SiteHeader } from "@/components/SiteChrome";
import { AiReadingCard } from "@/components/AiReadingCard";
import { Disclosure } from "@/components/ui/Disclosure";
import type { LiuYaoSession, YaoValue } from "@/features/liuyao/domain/types";
import { downloadResultImage } from "@/features/liuyao/prompts/downloadImage";
import { createAiPrompt } from "@/features/liuyao/prompts/createPrompt";
import { getSession } from "@/features/liuyao/storage/history";

function movingText(lines: number[]): string {
  if (!lines.length) return "无动爻";
  return `${lines.map((line) => line === 1 ? "初爻" : line === 6 ? "上爻" : `${line}爻`).join("、")}动`;
}

export function ResultClient({ id }: { id: string }) {
  const [session, setSession] = useState<LiuYaoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [busyAction, setBusyAction] = useState<"image" | null>(null);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    void getSession(id).then((result) => { setSession(result); setLoading(false); });
    return () => { if (noticeTimer.current) window.clearTimeout(noticeTimer.current); };
  }, [id]);

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 3200);
  };

  const saveImage = async () => {
    if (!session) return;
    setBusyAction("image");
    try {
      const outcome = await downloadResultImage(session);
      if (outcome === "shared") showNotice("高清结果长图已生成，可选择保存或分享");
      if (outcome === "downloaded") showNotice("高清结果长图已保存");
    } catch {
      showNotice("结果图生成失败，请稍后再试");
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) return <main className="result-page"><SiteHeader backHref="/liuyao" title="六爻 · 结果" /><div className="result-loading">正在从本机读取排盘…</div></main>;
  if (!session) return <main className="result-page"><SiteHeader backHref="/liuyao" title="六爻 · 结果" /><div className="result-missing"><span>卦</span><h1>未找到这条排盘</h1><p>结果只保存在起卦时使用的浏览器中，清理浏览器数据后无法恢复。</p><a href="/liuyao">重新起卦</a></div></main>;

  const changedLines = session.lines.map((line) => line === 6 ? 7 : line === 9 ? 8 : line) as YaoValue[];
  return (
    <main className="result-page">
      <SiteHeader backHref="/liuyao" title="六爻 · 结果" />
      <div className="result-landscape" aria-hidden="true" />
      <div className="result-shell">
        <AiReadingCard prompt={createAiPrompt(session)} />
        <motion.section className="result-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="result-question"><span>所问</span>{session.question}</p>
          <p className="result-reading-guide">本卦是起卦得到的卦象；变卦由动爻变化而来。红点标出动爻，下方可查六爻明细。</p>
          <div className="hexagram-transition">
            <article><small>本卦 · 第{session.originalHexagram.number}卦</small><h1>{session.originalHexagram.name}</h1><div className="trigram-pair"><span>{session.originalHexagram.upperSymbol}</span><span>{session.originalHexagram.lowerSymbol}</span></div><HexagramView lines={session.lines} compact /></article>
            <i>→</i>
            <article><small>变卦 · 第{session.changedHexagram.number}卦</small><h1>{session.changedHexagram.name}</h1><div className="trigram-pair"><span>{session.changedHexagram.upperSymbol}</span><span>{session.changedHexagram.lowerSymbol}</span></div><HexagramView lines={changedLines} compact /></article>
          </div>
          <p className="moving-summary"><i /> {movingText(session.movingLines)}</p>
          <div className="result-rule-mark" aria-hidden="true"><span>卦</span><i /></div>
        </motion.section>

        <section className="core-facts"><div><span>卦宫</span><b>{session.palace}</b><small>{session.palaceStage}</small></div><div><span>世应</span><b>世 {session.shiLine} · 应 {session.yingLine}</b><small>相隔三位</small></div><div><span>月建</span><b>{session.metadata.monthBuild}</b><small>按节气月</small></div><div><span>日辰</span><b>{session.metadata.dayPillar}</b><small>空亡 {session.metadata.voidBranches}</small></div></section>

        <section className="result-details">
          <Disclosure title="爻位信息" meta="六亲 · 六神 · 纳甲" defaultOpen><div className="line-detail-table">{session.lineDetails.slice().reverse().map((line) => <div key={line.position} className={line.moving ? "is-moving" : ""}><span>{line.position === 1 ? "初" : line.position === 6 ? "上" : line.position}</span><i className={line.yinYang === "阳" ? "mini-yang" : "mini-yin"}>{line.yinYang === "阳" ? <em /> : <><em /><em /></>}</i><strong>{line.liuQin}</strong><p>{line.liuShen}</p><p>{line.stem}{line.branch} · {line.element}</p>{line.marker && <b>{line.marker}</b>}{line.moving && <u>动</u>}</div>)}</div></Disclosure>
          <Disclosure title="完整排盘数据" meta="时间与规则版本"><dl><div><dt>起卦方式</dt><dd>{session.metadata.method}</dd></div><div><dt>起卦时间</dt><dd>{session.metadata.calendarDate}</dd></div><div><dt>时区</dt><dd>{session.metadata.timezone}</dd></div><div><dt>原始爻值</dt><dd>[{session.lines.join(", ")}]</dd></div><div><dt>规则版本</dt><dd>{session.metadata.rulesVersion}</dd></div></dl></Disclosure>
        </section>

        <section className="result-actions" aria-busy={busyAction !== null}><button className="action-button action-button-secondary" type="button" onClick={() => void saveImage()} disabled={busyAction !== null}><span>{busyAction === "image" ? "正在生成高清长图…" : "保存结果图片"}</span><i aria-hidden="true">↓</i></button></section>
      </div>
      {notice && <motion.div className="toast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="status" aria-live="polite">{notice}</motion.div>}
      <nav className="bottom-nav" aria-label="结果页面导航"><a href="/liuyao">再起一卦</a><a className="is-active" href={`/liuyao/result/${session.id}`}>卦象</a><a href="/history">记录</a></nav>
    </main>
  );
}
