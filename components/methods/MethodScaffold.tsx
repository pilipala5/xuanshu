"use client";
/* eslint-disable @next/next/no-img-element -- Existing supplied method assets are intentional product illustrations. */

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteChrome";
import { AiReadingCard } from "@/components/AiReadingCard";
import type { ExtendedMethodId } from "@/features/method-history";
import { copyText } from "@/features/liuyao/prompts/copyText";
import { methods } from "@/config/methods";

const METHOD_META: Record<ExtendedMethodId, { title: string; subtitle: string; inputHint: string; visual: string }> = {
  bazi: { title: "四柱八字", subtitle: "从出生时间，查看四柱与大运流年。", inputHint: "填写公历出生信息；默认选项即可开始。", visual: "/assets/v2/methods/bazi-four-jade-slips.webp" },
  ziwei: { title: "紫微斗数", subtitle: "查看十二宫星曜，了解命盘的结构。", inputHint: "填写出生信息；想看某一年，可选填流年年份。", visual: "/assets/v2/methods/ziwei-twelve-palaces.webp" },
  meihua: { title: "梅花易数", subtitle: "想好一件事，用两个数字生成卦象。", inputHint: "分别输入两个 1—999999 的整数。", visual: "/assets/v2/methods/meihua-plum-branch.webp" },
  xiaoliuren: { title: "小六壬", subtitle: "选一个时间，查看这次起课的最终落宫。", inputHint: "可以直接使用当前时间，再点击生成结果。", visual: "/assets/v2/methods/xiaoliuren-six-palaces.webp" },
};

export function MethodScaffold({ method, form, result, notice, aiPrompt }: { method: ExtendedMethodId; form: ReactNode; result?: ReactNode; notice?: string; aiPrompt?: string }) {
  const meta = { ...METHOD_META[method], visual: methods.find((item) => item.id === method)!.visual };
  const inputPanel = useRef<HTMLElement>(null);
  const resultPanel = useRef<HTMLElement>(null);
  const resultBody = useRef<HTMLDivElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const hasResult = Boolean(result);
  useEffect(() => {
    if (!hasResult) return;
    const frame = window.requestAnimationFrame(() => {
      setCopyMessage("");
      if (window.matchMedia("(max-width: 899px)").matches) {
        resultPanel.current?.scrollIntoView({ behavior: "instant", block: "start" });
        resultPanel.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hasResult]);

  const copyResult = async () => {
    try {
      await copyText(`${meta.title}\n${resultBody.current?.innerText ?? ""}`);
      setCopyMessage("排盘文字已复制");
    } catch {
      setCopyMessage("浏览器未允许复制，请长按结果文字手动复制");
    }
  };
  return (
    <main className={`method-page method-page-${method}`}>
      <SiteHeader backHref="/" title={meta.title} />
      <div className="method-page-atmosphere" aria-hidden="true"><i /><i /></div>
      <div className={`method-workbench-shell${hasResult ? " is-showing-result" : ""}`}>
        <div className="method-sidebar">
        <section className="method-intro-panel">
          <div className="method-intro-copy"><h1>{meta.title}</h1><p>{meta.subtitle}</p></div>
          <div className="method-intro-visual" aria-hidden="true"><img src={meta.visual} alt="" width="768" height="768" /></div>
          <ol className="method-workflow" aria-label="使用步骤"><li className={!hasResult ? "is-current" : "is-done"}><span>1</span>填写信息</li><li className={hasResult ? "is-done" : ""}><span>2</span>生成排盘</li><li className={hasResult ? "is-current" : ""}><span>3</span>复制问 AI</li></ol>
          <p className="method-start-hint">{hasResult ? "排盘已完成。结果区可以复制 AI 提示词，继续询问解释。" : meta.inputHint}</p>
        </section>
        <section className="method-input-panel" ref={inputPanel}>{form}<p className="method-local-note">输入与结果只保存在当前浏览器，不上传云端。</p></section>
        </div>
        {result && <section className="method-result-panel" ref={resultPanel} tabIndex={-1} aria-label={`${meta.title}排盘结果`}>{aiPrompt && <AiReadingCard key={aiPrompt} prompt={aiPrompt} />}<div className="method-chart-content" ref={resultBody}>{result}</div><div className="method-result-actions"><button type="button" onClick={() => void copyResult()}>仅复制排盘文字</button><button type="button" onClick={() => { inputPanel.current?.scrollIntoView({ behavior: "instant", block: "start" }); inputPanel.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }); }}>修改输入</button></div>{copyMessage && <p className="method-copy-status" role="status">{copyMessage}</p>}</section>}
      </div>
      {notice && <div className="toast" role="status" aria-live="polite">{notice}</div>}
      <nav className="bottom-nav" aria-label={`${meta.title}页面导航`}><Link href="/">首页</Link><Link className="is-active" href={`/${method}`}>排盘</Link><Link href="/history">记录</Link></nav>
    </main>
  );
}
