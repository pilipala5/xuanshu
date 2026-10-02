"use client";

import { useState } from "react";
import { createMethodAiPrompt } from "@/features/ai/createMethodPrompt";
import { MethodScaffold } from "@/components/methods/MethodScaffold";
import { createZiweiResult, ZIWEI_PALACE_SLOTS, ZIWEI_RULES_VERSION, type ZiweiInput, type ZiweiMutagen, type ZiweiResult, type ZiweiStar } from "@/features/ziwei/engine";
import { useMethodWorkbench } from "@/features/useMethodWorkbench";

const PALACE_TOPICS: Record<string, string> = {
  命宫: "自我与整体结构", 兄弟: "手足关系", 夫妻: "伴侣关系", 子女: "子女关系", 财帛: "钱财与收支", 疾厄: "传统健康主题", 迁移: "外出与环境变化", 仆役: "朋友与人际关系", 交友: "朋友与人际关系", 官禄: "事业与工作", 田宅: "家庭与居所", 福德: "精神状态与内在感受", 父母: "父母与长辈关系",
};

function starText(star: ZiweiStar): string {
  return `${star.name}${star.brightness ? `（${star.brightness}）` : ""}${star.mutagen ? `·生年化${star.mutagen}` : ""}`;
}

function StarGroup({ label, stars }: { label: string; stars: ZiweiStar[] }) {
  return <div className="ziwei-star-group"><span>{label}</span><div>{stars.length ? stars.map((star) => <span className="ziwei-star-chip" key={star.name}><b>{star.name}</b>{star.brightness && <small>{star.brightness}</small>}{star.mutagen && <em>生年化{star.mutagen}</em>}</span>) : <small>无</small>}</div></div>;
}

function MutagenList({ items }: { items: ZiweiMutagen[] }) {
  return <div className="ziwei-mutagen-list">{items.map((item) => <span key={item.kind}><em>化{item.kind}</em><b>{item.star}</b></span>)}</div>;
}

function ZiweiChart({ chart }: { chart: ZiweiResult }) {
  const [selectedIndex, setSelectedIndex] = useState(() => chart.palaces.find((palace) => palace.name === "命宫")?.index ?? 0);
  const selectedPalace = chart.palaces.find((palace) => palace.index === selectedIndex)!;
  const flow = chart.yearly;
  const decadal = flow?.decadal;

  return <>
    <header className="method-result-heading"><span>本命十二宫</span><div><h2>{chart.fiveElementsClass}</h2><p>{chart.inputSolarDate} · {chart.timeLabel}</p><p>{chart.lunarDate}</p></div></header>
    <p className="method-reading-guide">先看<strong>命宫</strong>了解整体结构；看事业点<strong>官禄宫</strong>，看钱财点<strong>财帛宫</strong>。点选后，下方显示该宫详情。{flow ? `「流年」标签对应 ${flow.year} 年。` : "流年年份可在输入区选填。"}</p>
    {chart.legacyLateZi && <p className="method-formula">此历史记录保留旧版晚子时结果。重新排盘将按次日历法计算。</p>}
    <p className="method-chart-hint">点选宫位，展开完整星曜 <span>大限年龄按虚岁</span></p>
    <div className="ziwei-board" aria-label="紫微本命十二宫命盘">
      {ZIWEI_PALACE_SLOTS.map((slot, gridIndex) => {
        if (slot === null) return <span key={`space-${gridIndex}`} aria-hidden="true" />;
        const palace = chart.palaces.find((item) => item.index === slot)!;
        return <article key={palace.index} className={`${palace.name === "命宫" ? "is-soul-palace" : ""} ${palace.index === selectedIndex ? "is-selected" : ""}`}>
          <button type="button" className="ziwei-palace-button" aria-pressed={palace.index === selectedIndex} aria-controls="ziwei-palace-detail" aria-label={`查看本命${palace.name}，${palace.stemBranch}${flow ? `，流年${flow.palaceNames[palace.index]}` : ""}`} onClick={() => setSelectedIndex(palace.index)}>
            <span className="ziwei-palace-topline"><span>{palace.stemBranch}</span>{palace.isBodyPalace && <em>身</em>}</span>
            <span className="ziwei-palace-name">{palace.name}</span>
            <span className="ziwei-palace-stars">{palace.majorStars.length ? palace.majorStars.map((star) => <b key={star.name}>{star.name}{star.mutagen && <i aria-label={`生年化${star.mutagen}`}>{star.mutagen}</i>}</b>) : <b>空宫</b>}</span>
            {flow && <span className="ziwei-flow-label">流年 · {flow.palaceNames[palace.index]}</span>}
            <small>{palace.decadal[0]}–{palace.decadal[1]} 岁</small>
          </button>
        </article>;
      })}
      <div className="ziwei-center"><span>命主</span><strong>{chart.soul}</strong><i /><span>身主</span><strong>{chart.body}</strong><small>命宫 {chart.soulPalaceBranch} · 身宫 {chart.bodyPalaceBranch}</small>{flow && <small>{flow.year} {flow.stemBranch}年 · 虚岁 {flow.nominalAge}</small>}</div>
    </div>
    <section id="ziwei-palace-detail" className="method-data-section ziwei-palace-detail" aria-live="polite" aria-atomic="true">
      <div className="method-section-title"><span>本命 · {selectedPalace.name}</span><small>{selectedPalace.stemBranch}{selectedPalace.isBodyPalace ? " · 身宫" : ""}</small></div>
      <p className="method-palace-topic">传统上用于讨论{PALACE_TOPICS[selectedPalace.name] ?? "相关人生主题"}。不熟悉下方星曜？复制完整排盘给 AI，询问这个宫位即可。</p>
      <div className="ziwei-star-groups"><StarGroup label="主星" stars={selectedPalace.majorStars} /><StarGroup label="辅星" stars={selectedPalace.minorStars} /><StarGroup label="杂曜" stars={selectedPalace.adjectiveStars} /></div>
      <div className="method-fact-strip"><div><span>十二长生</span><b>{selectedPalace.changsheng12}</b></div><div><span>大限（虚岁）</span><b>{selectedPalace.decadal[0]}–{selectedPalace.decadal[1]} 岁</b></div><div><span>博士十二神</span><b>{selectedPalace.boshi12}</b></div></div>
      <p className="method-rule-note">本命将前：{selectedPalace.jiangqian12} · 本命岁前：{selectedPalace.suiqian12}。星曜旁的亮度与生年四化属于本命盘。</p>
      {flow && <>
        <div className="method-section-title"><span>{flow.year} 流年 · {flow.palaceNames[selectedIndex]}</span><small>叠加在本命{selectedPalace.name}</small></div>
        <div className="ziwei-star-groups"><StarGroup label="流年星曜" stars={flow.stars[selectedIndex]} />{decadal && <StarGroup label={`${decadal.name}星曜`} stars={decadal.stars[selectedIndex]} />}</div>
        <p className="method-rule-note">流年将前：{flow.jiangqian12[selectedIndex]} · 流年岁前：{flow.suiqian12[selectedIndex]}。</p>
      </>}
    </section>
    {flow && <section className="method-data-section ziwei-horoscope-summary" aria-label="流年与大限概览">
      <div className="method-section-title"><span>{flow.year} {flow.stemBranch}流年</span><small>虚岁 {flow.nominalAge}</small></div>
      <div className="method-fact-strip"><div><span>流年命宫所在本命宫</span><b>{chart.palaces.find((palace) => palace.index === flow.soulPalaceIndex)?.name}</b></div><div><span>{decadal?.name ?? "大限"}所在本命宫</span><b>{decadal?.natalPalaceName ?? "无可用大限"}</b></div><div><span>{decadal?.name === "童限" ? "童限干支" : "大限干支"}</span><b>{decadal?.stemBranch ?? "—"}</b></div></div>
      <p className="method-rule-note">流年四化</p><MutagenList items={flow.mutagens} />
      {decadal && <><p className="method-rule-note">{decadal.name}四化{decadal.ageRange ? ` · ${decadal.ageRange[0]}–${decadal.ageRange[1]} 虚岁` : ""}</p><MutagenList items={decadal.mutagens} /></>}
      <p className="method-rule-note">以农历正月初一换年；年度视图取公历 {flow.referenceDate} 为参考日，虚岁与{decadal?.name ?? "大限"}对应此日。该参考年农历：{flow.lunarDate}。流年四化与生年四化分别展示。</p>
      {!decadal && <p className="method-rule-note">该参考日尚未起大限或已超出本命盘的大限年龄范围。</p>}
    </section>}
    <details className="method-details"><summary>十二宫总览<span>完整星曜</span><i aria-hidden="true">⌄</i></summary><div className="ziwei-palace-list">{chart.palaces.map((palace) => <div key={palace.index}><button className="ziwei-palace-list-button" type="button" aria-pressed={palace.index === selectedIndex} aria-controls="ziwei-palace-detail" onClick={() => { setSelectedIndex(palace.index); document.getElementById("ziwei-palace-detail")?.scrollIntoView({ behavior: "instant", block: "start" }); }}><b>{palace.name}</b><span>{palace.majorStars.map(starText).join("、") || "无主星"}</span><small>辅星：{palace.minorStars.map(starText).join("、") || "无"} · 杂曜：{palace.adjectiveStars.map(starText).join("、") || "无"}{flow ? ` · 流年${flow.palaceNames[palace.index]}` : ""}</small></button></div>)}</div></details>
    <p className="method-rule-note">通行安星法；闰月十五日（含）前按当月、十六日起按下月；{chart.legacyLateZi ? "此记录保留旧版晚子取法" : "23:00–23:59 为晚子时，按次日安星"}。使用钟表时间，尚未校正真太阳时。</p>
    <p className="method-rule-note">规则版本 {chart.rulesVersion} · 仅排盘，不自动论断。</p>
  </>;
}

export default function ZiweiPage() {
  const workbench = useMethodWorkbench<ZiweiInput, ZiweiResult>({
    method: "ziwei",
    initialInput: { date: "", time: "12:00", gender: "男", flowYear: "" },
    calculate: createZiweiResult,
    title: (result) => `紫微 · ${result.soul}命主 ${result.body}身主`,
    summary: (result) => `${result.fiveElementsClass} · 命宫${result.soulPalaceBranch}${result.yearly ? ` · ${result.yearly.year}流年` : ""}`,
    rulesVersion: ZIWEI_RULES_VERSION,
    restoreCalculate: (input, record) => createZiweiResult(input, { legacyLateZi: record.rulesVersion !== ZIWEI_RULES_VERSION }),
  });

  const form = (
    <form className="method-form" onSubmit={workbench.submit}>
      <div className="method-form-heading"><h2>填写出生信息</h2><p>输入公历出生日期、出生时的钟表时间与性别。想看某一年，可选填流年年份。</p></div>
      <div className="method-field-grid"><label><span>公历日期</span><input type="date" min="1900-01-01" max="2100-12-31" required value={workbench.input.date} onChange={(event) => workbench.updateInput("date", event.target.value)} /></label><label><span>出生时间</span><input type="time" required value={workbench.input.time} onChange={(event) => workbench.updateInput("time", event.target.value)} /></label></div>
      <fieldset><legend>性别</legend><div className="segmented-control"><label><input type="radio" name="ziwei-gender" checked={workbench.input.gender === "男"} onChange={() => workbench.updateInput("gender", "男")} /><span>男</span></label><label><input type="radio" name="ziwei-gender" checked={workbench.input.gender === "女"} onChange={() => workbench.updateInput("gender", "女")} /><span>女</span></label></div></fieldset>
      <details className="method-options"><summary><span>流年叠盘</span><small>可选年份</small><i aria-hidden="true">⌄</i></summary><div className="ziwei-horoscope-controls"><label><span>流年年份（选填）</span><input type="number" min="1900" max="2100" step="1" placeholder="例如 2026" value={workbench.input.flowYear ?? ""} onChange={(event) => workbench.updateInput("flowYear", event.target.value)} /></label><p className="method-rule-note">留空查看本命盘；流年按农历正月初一换年。</p></div></details>
      {workbench.error && <p className="method-form-error" role="alert">{workbench.error}</p>}
      <button className="action-button action-button-primary" type="submit"><span>生成紫微命盘</span><i aria-hidden="true">→</i></button>
    </form>
  );

  const result = workbench.result && <ZiweiChart key={`${workbench.result.solarDate}-${workbench.result.timeRange}-${workbench.result.gender}`} chart={workbench.result} />;
  return <MethodScaffold aiPrompt={workbench.result ? createMethodAiPrompt({ method: "ziwei", input: workbench.input, result: workbench.result }) : undefined} method="ziwei" form={form} result={result} notice={workbench.notice} />;
}
