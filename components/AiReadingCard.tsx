"use client";

import { useId, useState } from "react";
import { copyText } from "@/features/liuyao/prompts/copyText";

export function AiReadingCard({ prompt }: { prompt: string }) {
  const questionId = useId();
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "manual">("idle");
  const text = `${prompt}\n\n我想进一步了解：\n${question.trim() || "请先解释这份排盘的重点和必要术语，再告诉我可以继续追问什么。"}`;

  const copy = async () => {
    setStatus("copying");
    try {
      await copyText(text);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  };

  return <section className="ai-reading-card" aria-label="交给 AI 解读">
    <div className="ai-reading-heading"><span className="ai-reading-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 4h14v11H9l-4 4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 8h8M8 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span><div><h2>看不懂排盘？问问 AI</h2><p>复制完整排盘，粘贴给你常用的 AI 解读。</p></div></div>
    <details className="ai-question-options"><summary>补充你想问的问题<span>选填</span></summary><label className="sr-only" htmlFor={questionId}>你想了解什么？</label><textarea id={questionId} className="ai-question" rows={2} maxLength={500} value={question} placeholder="例如：这些术语是什么意思？有哪些值得关注的地方？" onChange={(event) => { setQuestion(event.target.value); setStatus("idle"); }} /></details>
    <button type="button" className="action-button action-button-primary ai-copy-button" onClick={() => void copy()} disabled={status === "copying"}><span>{status === "copying" ? "正在复制…" : "复制 AI 提示词"}</span><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.5" /></svg></button>
    <p className="ai-reading-steps"><strong>复制提示词</strong><span aria-hidden="true">→</span>打开 AI<span aria-hidden="true">→</span>粘贴并发送</p>
    <div className="ai-destinations"><span>可使用</span><a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT ↗</a><a href="https://chat.deepseek.com/" target="_blank" rel="noopener noreferrer">DeepSeek ↗</a><a href="https://www.doubao.com/chat/" target="_blank" rel="noopener noreferrer">豆包 ↗</a></div>
    {status === "copied" && <p className="ai-copy-status" role="status">已复制。打开你常用的 AI，粘贴并发送就能继续提问。</p>}
    {status === "manual" && <div className="ai-manual-copy"><label htmlFor={`${questionId}-manual`}>自动复制未成功，请全选下方提示词并手动复制。</label><textarea id={`${questionId}-manual`} readOnly value={text} rows={5} onFocus={(event) => event.target.select()} /></div>}
    <p className="ai-reading-privacy">提示词包含本次输入，可在粘贴后自行删减。</p>
  </section>;
}
