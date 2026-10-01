import type { LiuYaoSession } from "../domain/types";

export function createAiPrompt(session: LiuYaoSession): string {
  const lines = session.lineDetails.map((line) => `${line.position}爻：${line.liuShen} ${line.liuQin} ${line.stem}${line.branch}${line.element}${line.marker ? `（${line.marker}）` : ""}${line.moving ? "，动爻" : ""}`).join("\n");
  return `请以传统六爻纳甲体系，对以下结构化排盘进行审慎解读。请区分排盘事实与解释，不要改写或重新随机生成卦象，也不要把术数建议当作医疗、法律或投资保证。\n\n用户问题：${session.question}\n起卦方式：${session.metadata.method}\n起卦时间：${session.metadata.calendarDate}（${session.metadata.timezone}）\n本卦：${session.originalHexagram.name}（第${session.originalHexagram.number}卦）\n变卦：${session.changedHexagram.name}（第${session.changedHexagram.number}卦）\n动爻：${session.movingLines.length ? session.movingLines.join("、") : "无"}\n卦宫：${session.palace} · ${session.palaceStage}\n世爻：${session.shiLine}爻\n应爻：${session.yingLine}爻\n月建：${session.metadata.monthBuild}\n日辰：${session.metadata.dayPillar}\n空亡：${session.metadata.voidBranches}\n\n六爻明细（由初至上）：\n${lines}\n\n请按“卦象总体—用神选择—世应关系—动爻变化—月日旺衰—结论与行动建议”的顺序分析，并明确不确定性。`;
}
