"use client";

import { MethodScaffold } from "@/components/methods/MethodScaffold";
import { localDateValue, localTimeValue } from "@/features/method-utils";
import { createXiaoLiuRenResult, type XiaoLiuRenResult } from "@/features/xiaoliuren/engine";
import { useMethodWorkbench } from "@/features/useMethodWorkbench";

type InputState = { date: string; time: string };

export default function XiaoLiuRenPage() {
  const workbench = useMethodWorkbench<InputState, XiaoLiuRenResult>({
    method: "xiaoliuren",
    initialInput: { date: "", time: "12:00" },
    initializeInput: () => { const now = new Date(); return { date: localDateValue(now), time: localTimeValue(now) }; },
    calculate: createXiaoLiuRenResult,
    title: (result) => `小六壬 · ${result.resultPalace}`,
    summary: (result) => `${result.lunarDate} · ${result.timeBranch}时落${result.resultPalace}`,
    rulesVersion: "xuanshu-xiaoliuren-month-day-hour-v1",
  });
  const form = (
    <form className="method-form" onSubmit={workbench.submit}>
      <div className="method-form-heading"><span>按时起课</span><h2>月日时落宫</h2><p>选择事情发生或准备决断的日期与当地钟表时间。</p></div>
      <div className="method-field-grid"><label><span>公历日期</span><input type="date" min="1900-01-01" max="2100-12-31" required value={workbench.input.date} onChange={(event) => workbench.updateInput("date", event.target.value)} /></label><label><span>当地时间</span><input type="time" required value={workbench.input.time} onChange={(event) => workbench.updateInput("time", event.target.value)} /></label></div>
      <p className="method-formula">大安起正月，月上起日，日上起时；子时为首，六宫顺行。</p>
      <button className="method-inline-button" type="button" onClick={() => { const now = new Date(); workbench.updateInputs({ date: localDateValue(now), time: localTimeValue(now) }); }}>使用当前时间</button>
      {workbench.error && <p className="method-form-error" role="alert">{workbench.error}</p>}
      <button className="action-button action-button-primary" type="submit"><span>开始起课</span><i aria-hidden="true">→</i></button>
    </form>
  );
  const result = workbench.result && (
    <>
      <header className="method-result-heading"><span>六宫落位</span><div><h2>{workbench.result.resultPalace}</h2><p>{workbench.result.lunarDate} · {workbench.result.timeBranch}时</p></div></header>
      <div className="six-palace-wheel" aria-label={`六宫结果：${workbench.result.resultPalace}`}><div className="six-palace-axis"><span>月</span><b>{workbench.result.monthPalace}</b><i /><span>日</span><b>{workbench.result.dayPalace}</b><i /><span>时</span><strong>{workbench.result.resultPalace}</strong></div>{workbench.result.palaces.map((palace, index) => <div key={palace.name} className={`six-palace-node node-${index}${index === workbench.result!.resultIndex ? " is-active" : ""}`}><b>{palace.name}</b><small>{palace.keyword}</small></div>)}</div>
      <section className="method-fact-strip"><div><span>月落宫</span><b>{workbench.result.monthPalace}</b></div><div><span>日落宫</span><b>{workbench.result.dayPalace}</b></div><div><span>时落宫</span><b>{workbench.result.resultPalace}</b></div></section>
      <section className="method-data-section"><div className="method-section-title"><span>六宫次序</span><small>五行 · 方位 · 关键词</small></div><div className="six-palace-list">{workbench.result.palaces.map((palace, index) => <div key={palace.name} className={index === workbench.result!.resultIndex ? "is-active" : ""}><span>0{index + 1}</span><b>{palace.name}</b><p>{palace.element} · {palace.direction}</p><em>{palace.keyword}</em></div>)}</div></section>
      <section className="method-data-section"><div className="method-section-title"><span>计算过程</span><small>{workbench.result.isLeapMonth ? "闰月按同名月份计算" : "月、日、时依次顺行"}</small></div><dl className="method-rule-list"><div><dt>定月宫</dt><dd>{workbench.result.calculation.month}</dd></div><div><dt>定日宫</dt><dd>{workbench.result.calculation.day}</dd></div><div><dt>定时宫</dt><dd>{workbench.result.calculation.time}</dd></div></dl></section>
      <p className="method-rule-note">规则版本 {workbench.result.rulesVersion} · 依农历月、日、时辰机械落宫，不生成扩展断语。</p>
    </>
  );
  return <MethodScaffold method="xiaoliuren" form={form} result={result} notice={workbench.notice} />;
}
