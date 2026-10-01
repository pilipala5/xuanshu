"use client";
/* eslint-disable @next/next/no-img-element -- Existing supplied method assets are intentional product illustrations. */

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteChrome";
import type { ExtendedMethodId } from "@/features/method-history";
import { copyText } from "@/features/liuyao/prompts/copyText";
import { methods } from "@/config/methods";

const METHOD_META: Record<ExtendedMethodId, { title: string; subtitle: string; eyebrow: string; visual: string }> = {
  bazi: { title: "四柱八字", subtitle: "以出生年月日时排定四柱、日主与五行结构", eyebrow: "年 · 月 · 日 · 时", visual: "/assets/v2/methods/bazi-four-jade-slips.webp" },
  ziwei: { title: "紫微斗数", subtitle: "以出生日期与时辰安十二宫、命身主与星曜", eyebrow: "十二宫 · 十四主星", visual: "/assets/v2/methods/ziwei-twelve-palaces.webp" },
  meihua: { title: "梅花易数", subtitle: "以两个自然数定上下卦，取动爻并推演变卦", eyebrow: "数起卦 · 体用", visual: "/assets/v2/methods/meihua-plum-branch.webp" },
  xiaoliuren: { title: "小六壬", subtitle: "按农历月、日、时辰依次落入六宫", eyebrow: "月上起日 · 日上起时", visual: "/assets/v2/methods/xiaoliuren-six-palaces.webp" },
};

export function MethodScaffold({ method, form, result, notice }: { method: ExtendedMethodId; form: ReactNode; result?: ReactNode; notice?: string }) {
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
      <div className="method-workbench-shell">
        <div className="method-sidebar">
        <section className="method-intro-panel">
          <div className="method-intro-copy"><span>{meta.eyebrow}</span><h1>{meta.title}</h1><p>{meta.subtitle}</p></div>
          <div className="method-intro-visual" aria-hidden="true"><img src={meta.visual} alt="" width="768" height="768" /></div>
        </section>
        <section className="method-input-panel" ref={inputPanel}>{form}<p className="method-local-note">输入与结果只保存在当前浏览器，不上传云端。</p></section>
        </div>
        {result && <section className="method-result-panel" ref={resultPanel} tabIndex={-1} aria-label={`${meta.title}排盘结果`}><div ref={resultBody}>{result}</div><div className="method-result-actions"><button type="button" onClick={() => void copyResult()}>复制排盘</button><button type="button" onClick={() => inputPanel.current?.scrollIntoView({ behavior: "instant", block: "start" })}>修改输入</button></div>{copyMessage && <p className="method-copy-status" role="status">{copyMessage}</p>}</section>}
      </div>
      {notice && <div className="toast" role="status" aria-live="polite">{notice}</div>}
      <nav className="bottom-nav" aria-label={`${meta.title}页面导航`}><Link href="/">首页</Link><Link className="is-active" href={`/${method}`}>排盘</Link><Link href="/history">记录</Link></nav>
    </main>
  );
}
