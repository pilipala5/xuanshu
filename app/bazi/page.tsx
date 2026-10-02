"use client";

import { createMethodAiPrompt } from "@/features/ai/createMethodPrompt";
import { MethodScaffold } from "@/components/methods/MethodScaffold";
import { BAZI_RULES_VERSION, createBaziResult, type BaziInput, type BaziResult } from "@/features/bazi/engine";
import { useMethodWorkbench } from "@/features/useMethodWorkbench";

export default function BaziPage() {
  const workbench = useMethodWorkbench<BaziInput, BaziResult>({
    method: "bazi",
    initialInput: { date: "", time: "12:00", gender: "男", dayBoundary: "midnight", flowYear: String(new Date().getFullYear()) },
    calculate: createBaziResult,
    title: (result) => `四柱 · ${result.pillars.map((pillar) => pillar.ganZhi).join(" ")}`,
    summary: (result) => `日主 ${result.dayMaster} · ${result.lunarDate}`,
    rulesVersion: BAZI_RULES_VERSION,
    restoreInput: (stored) => ({ ...stored, dayBoundary: stored.dayBoundary ?? "midnight", flowYear: stored.flowYear || stored.date.slice(0, 4) }),
  });
  const maxElement = workbench.result ? Math.max(...Object.values(workbench.result.elementCounts), 1) : 1;

  const form = (
    <form className="method-form" onSubmit={workbench.submit}>
      <div className="method-form-heading"><h2>填写出生信息</h2><p>输入公历出生日期、北京时间（UTC+8）与性别；默认选项即可排盘。</p></div>
      <div className="method-field-grid">
        <label><span>公历日期</span><input type="date" min="1900-01-01" max="2100-12-31" required value={workbench.input.date} onChange={(event) => {
          const date = event.target.value;
          workbench.updateInputs({ date, ...(Number(date.slice(0, 4)) > Number(workbench.input.flowYear) ? { flowYear: date.slice(0, 4) } : {}) });
        }} /></label>
        <label><span>出生时间</span><input type="time" required value={workbench.input.time} onChange={(event) => workbench.updateInput("time", event.target.value)} /></label>
      </div>
      <fieldset><legend>性别</legend><div className="segmented-control"><label><input type="radio" name="bazi-gender" checked={workbench.input.gender === "男"} onChange={() => workbench.updateInput("gender", "男")} /><span>男</span></label><label><input type="radio" name="bazi-gender" checked={workbench.input.gender === "女"} onChange={() => workbench.updateInput("gender", "女")} /><span>女</span></label></div></fieldset>
      <details className="method-options"><summary><span>排盘选项</span><small>换日规则 · 流年</small><i aria-hidden="true">⌄</i></summary><div className="method-field-grid">
        <label><span>子时换日</span><select value={workbench.input.dayBoundary ?? "midnight"} onChange={(event) => workbench.updateInput("dayBoundary", event.target.value as BaziInput["dayBoundary"])}><option value="midnight">00:00 换日</option><option value="zi-hour">23:00 换日</option></select></label>
        <label><span>查看流年</span><input type="number" min={Number(workbench.input.date.slice(0, 4)) || 1900} max="2100" step="1" required value={workbench.input.flowYear ?? workbench.input.date.slice(0, 4)} onChange={(event) => workbench.updateInput("flowYear", event.target.value)} /></label>
      </div></details>
      {workbench.error && <p className="method-form-error" role="alert">{workbench.error}</p>}
      <button className="action-button action-button-primary" type="submit"><span>开始排八字</span><i aria-hidden="true">→</i></button>
    </form>
  );

  const result = workbench.result && (
    <>
      <header className="method-result-heading"><span>四柱排盘</span><div><h2>日主 · {workbench.result.dayMaster}</h2><p>{workbench.result.solarDate} · 北京时间</p><p>{workbench.result.lunarDate} · 属{workbench.result.zodiac}</p></div></header>
      <p className="method-reading-guide"><strong>日主「{workbench.result.dayMaster}」</strong>是这份八字的参照点。先看年、月、日、时四柱，再看大运与所选流年；十神、藏干等术语可以直接复制给 AI 解释。</p>
      <div className="bazi-pillars">
        {workbench.result.pillars.map((pillar) => <article key={pillar.label}><small>{pillar.label}</small><strong><b>{pillar.gan}</b><b>{pillar.zhi}</b></strong><p>{pillar.shiShen}</p><span>{pillar.wuXing}</span><em>{pillar.naYin}</em></article>)}
      </div>
      <details className="method-details"><summary>四柱明细<span>藏干 · 长生 · 旬空</span><i aria-hidden="true">⌄</i></summary><div className="bazi-pillar-details">{workbench.result.pillars.map((pillar) => <article key={pillar.label}><h3>{pillar.label}<span>{pillar.ganZhi}</span></h3><dl><div><dt>藏干十神</dt><dd>{pillar.hiddenGanDetails.map((item) => <span key={item.gan}><b>{item.gan}</b>{item.shiShen}</span>)}</dd></div><div><dt>十二长生</dt><dd>{pillar.diShi}</dd></div><div><dt>旬空</dt><dd>{pillar.xunKong}</dd></div></dl></article>)}</div></details>
      <section className="method-data-section"><div className="method-section-title"><span>五行计数</span><small>四柱干支本气，共八字</small></div><div className="element-bars">{Object.entries(workbench.result.elementCounts).map(([element, count]) => <div key={element}><span>{element}</span><i><b style={{ transform: `scaleX(${count / maxElement})` }} /></i><em>{count}</em></div>)}</div><p className="method-rule-note">每个天干、地支按本气记 1 次，不计藏干权重，不代表五行旺衰或喜用神。</p></section>
      <section className="method-fact-strip"><div><span>胎元</span><b>{workbench.result.taiYuan}</b></div><div><span>命宫</span><b>{workbench.result.mingGong}</b></div><div><span>身宫</span><b>{workbench.result.shenGong}</b></div></section>
      <section className="method-data-section"><div className="method-section-title"><span>大运</span><small>{workbench.result.luck.direction} · {workbench.result.luck.start}</small></div><div className="bazi-luck-list">{workbench.result.luck.decades.map((period) => <div key={`${period.ganZhi}-${period.yearRange[0]}`}><strong>{period.ganZhi}</strong><span>{period.ageRange[0]}–{period.ageRange[1]} 岁</span><small>{period.yearRange[0]}–{period.yearRange[1]}</small></div>)}</div></section>
      <section className="method-data-section" aria-label="所选年份流年排盘">
        <div className="method-section-title"><span>{workbench.result.annualLuck.year} 年流年</span><small>虚岁 {workbench.result.annualLuck.age}</small></div>
        <div className="method-fact-strip"><div><span>流年干支</span><b>{workbench.result.annualLuck.ganZhi}</b></div><div><span>流年天干十神</span><b>{workbench.result.annualLuck.ganShiShen}</b></div><div><span>年份对应大运</span><b>{workbench.result.annualLuck.decade?.ganZhi ?? "尚未起运"}</b></div></div>
        <p className="method-rule-note">地支藏干：{workbench.result.annualLuck.hiddenGanDetails.map((item) => `${item.gan}·${item.shiShen}`).join(" / ")}；旬空：{workbench.result.annualLuck.xunKong}。</p>
        <p className="method-rule-note">流年干支以当年立春为界；虚岁按出生公历年份计，大运按年度范围展示。起运日期：{workbench.result.luck.startDate}。</p>
      </section>
      <p className="method-rule-note">日柱采用 {workbench.result.dayBoundary === "zi-hour" ? "23:00" : "00:00"} 换日；晚子时（23:00–23:59）的时柱统一按次日子时排定。尚未校正真太阳时。</p>
      <p className="method-rule-note">规则版本 {workbench.result.rulesVersion} · 十神以日主为参照。</p>
    </>
  );

  return <MethodScaffold aiPrompt={workbench.result ? createMethodAiPrompt({ method: "bazi", input: workbench.input, result: workbench.result }) : undefined} method="bazi" form={form} result={result} notice={workbench.notice} />;
}
