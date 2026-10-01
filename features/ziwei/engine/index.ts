import { astro } from "iztro";
import { Solar } from "lunar-typescript";
import { parseCalendarInput } from "../../method-utils";

export type ZiweiInput = { date: string; time: string; gender: "男" | "女"; flowYear?: string };
export type ZiweiStar = { name: string; brightness?: string; mutagen?: string };
export type ZiweiMutagen = { kind: "禄" | "权" | "科" | "忌"; star: string };
export const ZIWEI_RULES_VERSION = "xuanshu-ziwei-v3-calendar-rollover" as const;
// iztro 的宫位索引从寅开始；命盘采用巳午未申在上、寅丑子亥在下的地支方位。
export const ZIWEI_PALACE_SLOTS = [3, 4, 5, 6, 2, null, null, 7, 1, null, null, 8, 0, 11, 10, 9] as const;
export type ZiweiPalace = {
  index: number;
  name: string;
  stemBranch: string;
  isBodyPalace: boolean;
  majorStars: ZiweiStar[];
  minorStars: ZiweiStar[];
  adjectiveStars: ZiweiStar[];
  changsheng12: string;
  boshi12: string;
  jiangqian12: string;
  suiqian12: string;
  decadal: [number, number];
};
export type ZiweiYearly = {
  year: number;
  referenceDate: string;
  lunarDate: string;
  nominalAge: number;
  stemBranch: string;
  soulPalaceIndex: number;
  palaceNames: string[];
  mutagens: ZiweiMutagen[];
  stars: ZiweiStar[][];
  jiangqian12: string[];
  suiqian12: string[];
  decadal: {
    name: string;
    index: number;
    natalPalaceName: string;
    stemBranch: string;
    ageRange: [number, number] | null;
    mutagens: ZiweiMutagen[];
    stars: ZiweiStar[][];
  } | null;
};
export type ZiweiResult = {
  solarDate: string;
  inputSolarDate: string;
  legacyLateZi: boolean;
  lunarDate: string;
  chineseDate: string;
  timeLabel: string;
  timeRange: string;
  gender: string;
  zodiac: string;
  sign: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  soulPalaceBranch: string;
  bodyPalaceBranch: string;
  palaces: ZiweiPalace[];
  yearly: ZiweiYearly | null;
  rulesVersion: string;
};

export function hourToTimeIndex(time: string): number {
  if (typeof time !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("请输入完整的出生时间（HH:mm）");
  const hour = Number(time.slice(0, 2));
  return hour === 23 ? 12 : Math.floor((hour + 1) / 2);
}

function mapStars(stars: readonly ZiweiStar[]): ZiweiStar[] {
  return stars.map((star) => ({ name: star.name, brightness: star.brightness || undefined, mutagen: star.mutagen || undefined }));
}

function mapMutagens(stars: readonly string[]): ZiweiMutagen[] {
  const kinds = ["禄", "权", "科", "忌"] as const;
  return kinds.map((kind, index) => ({ kind, star: stars[index] }));
}

function createYearly(chart: ReturnType<typeof astro.bySolar>, flowYear: string | undefined): ZiweiYearly | null {
  if (flowYear === undefined || flowYear === "") return null;
  if (typeof flowYear !== "string" || !/^\d{4}$/.test(flowYear)) throw new Error("请输入完整的流年年份");
  const year = Number(flowYear);
  if (year < 1900 || year > 2100) throw new Error("流年年份支持 1900—2100 年");
  if (year < chart.rawDates.lunarDate.lunarYear) throw new Error("流年年份不能早于出生农历年");
  // 年度视图采用年中日期，避开公历年初尚未换农历年的歧义；只提取年与大限信息。
  const referenceDate = `${year}-07-01`;
  const flow = chart.horoscope(referenceDate, 6);
  const decadalPalace = chart.palaces.find((palace) => palace.index === flow.decadal.index);
  return {
    year,
    referenceDate,
    lunarDate: flow.lunarDate,
    nominalAge: flow.age.nominalAge,
    stemBranch: `${flow.yearly.heavenlyStem}${flow.yearly.earthlyBranch}`,
    soulPalaceIndex: flow.yearly.index,
    palaceNames: [...flow.yearly.palaceNames],
    mutagens: mapMutagens(flow.yearly.mutagen),
    stars: (flow.yearly.stars ?? Array.from({ length: 12 }, () => [])).map(mapStars),
    jiangqian12: [...flow.yearly.yearlyDecStar.jiangqian12],
    suiqian12: [...flow.yearly.yearlyDecStar.suiqian12],
    decadal: decadalPalace ? {
      name: flow.decadal.name,
      index: flow.decadal.index,
      natalPalaceName: decadalPalace.name,
      stemBranch: `${flow.decadal.heavenlyStem}${flow.decadal.earthlyBranch}`,
      ageRange: flow.decadal.name === "大限" ? [...decadalPalace.decadal.range] : null,
      mutagens: mapMutagens(flow.decadal.mutagen),
      stars: (flow.decadal.stars ?? Array.from({ length: 12 }, () => [])).map(mapStars),
    } : null,
  };
}

export function createZiweiResult(input: ZiweiInput, options: { legacyLateZi?: boolean } = {}): ZiweiResult {
  const { year, month, day } = parseCalendarInput(input.date, input.time);
  if (year < 1900 || year > 2100) throw new Error("当前版本支持 1900—2100 年");
  if (input.gender !== "男" && input.gender !== "女") throw new Error("请选择有效的性别");
  const timeIndex = hourToTimeIndex(input.time);
  const legacyLateZi = Boolean(options.legacyLateZi && timeIndex === 12);
  const calendarDate = timeIndex === 12 && !legacyLateZi ? Solar.fromYmd(year, month, day).next(1).toYmd() : input.date;
  const chart = astro.bySolar(calendarDate, timeIndex === 12 && !legacyLateZi ? 0 : timeIndex, input.gender, true, "zh-CN");
  return {
    inputSolarDate: `${input.date} ${input.time}`,
    legacyLateZi,
    solarDate: chart.solarDate,
    lunarDate: chart.lunarDate,
    chineseDate: chart.chineseDate,
    timeLabel: timeIndex === 12 ? "晚子时" : chart.time,
    timeRange: timeIndex === 12 ? "23:00~00:00" : chart.timeRange,
    gender: chart.gender,
    zodiac: chart.zodiac,
    sign: chart.sign,
    soul: chart.soul,
    body: chart.body,
    fiveElementsClass: chart.fiveElementsClass,
    soulPalaceBranch: chart.earthlyBranchOfSoulPalace,
    bodyPalaceBranch: chart.earthlyBranchOfBodyPalace,
    palaces: chart.palaces.map((palace) => ({
      index: palace.index,
      name: palace.name,
      stemBranch: `${palace.heavenlyStem}${palace.earthlyBranch}`,
      isBodyPalace: palace.isBodyPalace,
      majorStars: mapStars(palace.majorStars),
      minorStars: mapStars(palace.minorStars),
      adjectiveStars: mapStars(palace.adjectiveStars),
      changsheng12: palace.changsheng12,
      boshi12: palace.boshi12,
      jiangqian12: palace.jiangqian12,
      suiqian12: palace.suiqian12,
      decadal: [...palace.decadal.range],
    })),
    yearly: createYearly(chart, input.flowYear),
    rulesVersion: legacyLateZi ? "xuanshu-ziwei-legacy-late-zi" : ZIWEI_RULES_VERSION,
  };
}
