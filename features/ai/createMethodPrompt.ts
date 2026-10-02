import type { BaziInput, BaziResult } from "../bazi/engine";
import type { ZiweiInput, ZiweiResult } from "../ziwei/engine";
import type { MeihuaInput, MeihuaResult } from "../meihua/engine";
import type { XiaoLiuRenInput, XiaoLiuRenResult } from "../xiaoliuren/engine";

export type MethodPromptData =
  | { method: "bazi"; input: BaziInput; result: BaziResult }
  | { method: "ziwei"; input: ZiweiInput; result: ZiweiResult }
  | { method: "meihua"; input: MeihuaInput; result: MeihuaResult }
  | { method: "xiaoliuren"; input: XiaoLiuRenInput; result: XiaoLiuRenResult };

const PROMPT_META = {
  bazi: {
    title: "四柱八字",
    rules: "按北京时间 UTC+8、节气定年与月，日柱按 dayBoundary 的换日规则（midnight 为 00:00，zi-hour 为 23:00）。没有出生地或真太阳时校正。elementCounts 仅为四柱表层干支计数，不能直接当作旺衰或喜用神结论；请结合藏干、季节和整体结构谨慎解释。",
    focus: "先说明日主、四柱与十神，再结合用户关心的主题解释；如涉及运势，区分本命、大运与所选流年。",
  },
  ziwei: {
    title: "紫微斗数",
    rules: "使用出生钟表时间，未校正真太阳时；闰月十五日（含）前按当月、十六日起按下月。legacyLateZi 为 true 的旧记录保留旧版晚子时；否则晚子时按次日安星。yearly 为 null 表示未选择流年，不能编造年度星曜；若有流年，须使用其 referenceDate 和虚岁口径，并区分生年、流年与大限四化。",
    focus: "先解释命宫、身宫、主星与四化，再针对用户问题选相关宫位；分析以全部十二宫为依据，不局限于界面当前选中的宫位。",
  },
  meihua: {
    title: "梅花易数",
    rules: "按两个整数取上、下卦及动爻，互卦、变卦与体用已计算完成。本次未提供起卦时间，不能自行添加月日旺衰等时间信息。",
    focus: "先用白话区分本卦（当前结构）、互卦（中间关系）、变卦（变化参考）、动爻和体用，再联系用户所问解释。",
  },
  xiaoliuren: {
    title: "小六壬",
    rules: "按输入公历日期与钟表时间换算农历月、日、时辰。大安起正月，月上起日，日上起时；闰月按同名月份。monthPalace、dayPalace 为中间步骤，resultPalace（时落宫）才是最终落宫。六宫关键词是传统术语，不能直接当作具体事件的确定结论。",
    focus: "先说明最终落宫与关键词的传统含义，再结合用户所问解释；用一两句说明月、日、时的推算过程。",
  },
} as const;

export function createMethodAiPrompt(data: MethodPromptData): string {
  const meta = PROMPT_META[data.method];
  return `请用中文、面向初学者，解释下面这份玄枢${meta.title}排盘。\n\n要求：\n1. 先用三句话说明重点，再解释必要术语。${meta.focus}\n2. 严格使用提供的输入和排盘数据，不重新排盘、不生成新的卦象、不补造未提供的信息。\n3. 区分“已计算的事实”和“传统解释”，说明依据、取法差异与不确定性；缺少信息时先提问。\n4. 用于传统文化学习与个人参考，不作命运、吉凶或医疗、法律、投资的确定承诺。\n\n计算口径：${meta.rules}\n\n原始输入（JSON）：\n${JSON.stringify(data.input, null, 2)}\n\n完整排盘（JSON，包含界面折叠区的数据）：\n${JSON.stringify(data.result, null, 2)}`;
}
