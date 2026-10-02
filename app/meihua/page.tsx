"use client";

import { HexagramView } from "@/components/HexagramView";
import { createMethodAiPrompt } from "@/features/ai/createMethodPrompt";
import { MethodScaffold } from "@/components/methods/MethodScaffold";
import { createMeihuaResult, type MeihuaResult } from "@/features/meihua/engine";
import { useMethodWorkbench } from "@/features/useMethodWorkbench";

type InputState = { upperNumber: string; lowerNumber: string };

export default function MeihuaPage() {
  const workbench = useMethodWorkbench<InputState, MeihuaResult>({
    method: "meihua",
    initialInput: { upperNumber: "", lowerNumber: "" },
    calculate: (input) => createMeihuaResult({ upperNumber: Number(input.upperNumber), lowerNumber: Number(input.lowerNumber) }),
    title: (result) => `梅花 · ${result.originalHexagram.name}`,
    summary: (result) => `${result.movingLine === 1 ? "初" : result.movingLine === 6 ? "上" : result.movingLine}爻动 → ${result.changedHexagram.name}`,
    rulesVersion: "xuanshu-meihua-two-number-v1",
  });
  const form = (
    <form className="method-form" onSubmit={workbench.submit}>
      <div className="method-form-heading"><h2>输入两个数字</h2><p>先想好一件具体的事，再输入两个 1—999999 的整数，例如 17 和 28。</p></div>
      <div className="method-field-grid method-number-fields"><label><span>第一数 · 上卦</span><input inputMode="numeric" pattern="[0-9]*" min="1" max="999999" type="number" required placeholder="例如 17" value={workbench.input.upperNumber} onChange={(event) => workbench.updateInput("upperNumber", event.target.value)} /></label><label><span>第二数 · 下卦</span><input inputMode="numeric" pattern="[0-9]*" min="1" max="999999" type="number" required placeholder="例如 28" value={workbench.input.lowerNumber} onChange={(event) => workbench.updateInput("lowerNumber", event.target.value)} /></label></div>
      {workbench.error && <p className="method-form-error" role="alert">{workbench.error}</p>}
      <button className="action-button action-button-primary" type="submit"><span>生成梅花卦象</span><i aria-hidden="true">→</i></button>
    </form>
  );
  const result = workbench.result && (
    <>
      <header className="method-result-heading"><span>梅花卦象</span><div><h2>{workbench.result.originalHexagram.name}</h2><p>{workbench.result.upperTrigram.symbol} {workbench.result.upperTrigram.name}上 · {workbench.result.lowerTrigram.symbol} {workbench.result.lowerTrigram.name}下</p></div></header>
      <p className="method-reading-guide">先看<strong>本卦「{workbench.result.originalHexagram.name}」</strong>，再看动爻如何变为「{workbench.result.changedHexagram.name}」。互卦展示中间关系，体 / 用区分两部分的角色；具体含义可交给 AI 解释。</p>
      <div className="meihua-hexagrams"><article><small>本卦 · 第{workbench.result.originalHexagram.number}卦</small><h3>{workbench.result.originalHexagram.name}</h3><HexagramView lines={workbench.result.lines} compact /></article><i aria-hidden="true">→</i><article><small>变卦 · 第{workbench.result.changedHexagram.number}卦</small><h3>{workbench.result.changedHexagram.name}</h3><HexagramView lines={workbench.result.changedLines} compact /></article></div>
      <section className="method-fact-strip"><div><span>动爻</span><b>{workbench.result.movingLine === 1 ? "初爻" : workbench.result.movingLine === 6 ? "上爻" : `${workbench.result.movingLine}爻`}</b></div><div><span>互卦</span><b>{workbench.result.mutualHexagram.name}</b></div><div><span>体 / 用</span><b>{workbench.result.bodyTrigram} / {workbench.result.useTrigram}</b></div></section>
      <section className="method-data-section"><div className="method-section-title"><span>计算留痕</span><small>相同输入得到相同卦象</small></div><dl className="method-rule-list"><div><dt>第一数</dt><dd>{workbench.result.upperNumber} → {workbench.result.upperTrigram.name}卦</dd></div><div><dt>第二数</dt><dd>{workbench.result.lowerNumber} → {workbench.result.lowerTrigram.name}卦</dd></div><div><dt>两数合计</dt><dd>{workbench.result.upperNumber + workbench.result.lowerNumber} → 第 {workbench.result.movingLine} 爻动</dd></div></dl></section>
      <details className="method-details method-calculation-note"><summary>计算口径<span>双数起卦</span></summary><p className="method-rule-note">本次只按输入数字计算本卦、互卦、变卦与体用，不加入未提供的时间信息。版本：{workbench.result.rulesVersion}。</p></details>
    </>
  );
  return <MethodScaffold aiPrompt={workbench.result ? createMethodAiPrompt({ method: "meihua", input: { upperNumber: Number(workbench.input.upperNumber), lowerNumber: Number(workbench.input.lowerNumber) }, result: workbench.result }) : undefined} method="meihua" form={form} result={result} notice={workbench.notice} />;
}
