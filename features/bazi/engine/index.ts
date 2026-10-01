import { LunarUtil, Solar } from "lunar-typescript";
import { parseCalendarInput } from "../../method-utils";

export const BAZI_RULES_VERSION = "xuanshu-bazi-v2-lunar-typescript";
export type BaziInput = {
  date: string;
  time: string;
  gender: "男" | "女";
  dayBoundary?: "midnight" | "zi-hour";
  flowYear?: string;
};
export type BaziHiddenGan = { gan: string; shiShen: string };
export type BaziDecade = { ganZhi: string; ageRange: [number, number]; yearRange: [number, number] };
export type BaziPillar = {
  label: "年柱" | "月柱" | "日柱" | "时柱";
  ganZhi: string;
  gan: string;
  zhi: string;
  wuXing: string;
  naYin: string;
  shiShen: string;
  hiddenGan: string[];
  hiddenGanDetails: BaziHiddenGan[];
  diShi: string;
  xunKong: string;
};
export type BaziResult = {
  solarDate: string;
  lunarDate: string;
  zodiac: string;
  dayMaster: string;
  dayBoundary: "midnight" | "zi-hour";
  pillars: BaziPillar[];
  elementCounts: Record<"木" | "火" | "土" | "金" | "水", number>;
  taiYuan: string;
  mingGong: string;
  shenGong: string;
  luck: {
    direction: "顺行" | "逆行";
    start: string;
    startDate: string;
    decades: BaziDecade[];
  };
  annualLuck: {
    year: number;
    age: number;
    ganZhi: string;
    ganShiShen: string;
    hiddenGanDetails: BaziHiddenGan[];
    xunKong: string;
    decade: BaziDecade | null;
  };
  rulesVersion: typeof BAZI_RULES_VERSION;
};

const ELEMENTS = ["木", "火", "土", "金", "水"] as const;

function hiddenGanDetails(dayMaster: string, stems: string[]): BaziHiddenGan[] {
  return stems.map((gan) => ({ gan, shiShen: LunarUtil.SHI_SHEN[dayMaster + gan] }));
}

export function createBaziResult(input: BaziInput): BaziResult {
  const value = parseCalendarInput(input.date, input.time);
  if (input.gender !== "男" && input.gender !== "女") throw new Error("请选择男或女");
  const dayBoundary = input.dayBoundary ?? "midnight";
  if (dayBoundary !== "midnight" && dayBoundary !== "zi-hour") throw new Error("请选择有效的子时换日规则");
  // Older records have no annual selection. Use the birth year so reopening them
  // stays deterministic instead of changing with the device's current year.
  const flowYearValue = input.flowYear ?? String(value.year);
  if (typeof flowYearValue !== "string" || !/^\d{4}$/.test(flowYearValue)) throw new Error("请输入四位流年年份");
  const flowYear = Number(flowYearValue);
  if (flowYear < value.year || flowYear > 2100) throw new Error("流年年份须在出生年份至 2100 年之间");
  const solar = Solar.fromYmdHms(value.year, value.month, value.day, value.hour, value.minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(dayBoundary === "zi-hour" ? 1 : 2);
  const luck = eightChar.getYun(input.gender === "男" ? 1 : 0);
  const basePillars: Omit<BaziPillar, "hiddenGanDetails">[] = [
    { label: "年柱", ganZhi: eightChar.getYear(), gan: eightChar.getYearGan(), zhi: eightChar.getYearZhi(), wuXing: eightChar.getYearWuXing(), naYin: eightChar.getYearNaYin(), shiShen: eightChar.getYearShiShenGan(), hiddenGan: eightChar.getYearHideGan(), diShi: eightChar.getYearDiShi(), xunKong: eightChar.getYearXunKong() },
    { label: "月柱", ganZhi: eightChar.getMonth(), gan: eightChar.getMonthGan(), zhi: eightChar.getMonthZhi(), wuXing: eightChar.getMonthWuXing(), naYin: eightChar.getMonthNaYin(), shiShen: eightChar.getMonthShiShenGan(), hiddenGan: eightChar.getMonthHideGan(), diShi: eightChar.getMonthDiShi(), xunKong: eightChar.getMonthXunKong() },
    { label: "日柱", ganZhi: eightChar.getDay(), gan: eightChar.getDayGan(), zhi: eightChar.getDayZhi(), wuXing: eightChar.getDayWuXing(), naYin: eightChar.getDayNaYin(), shiShen: "日主", hiddenGan: eightChar.getDayHideGan(), diShi: eightChar.getDayDiShi(), xunKong: eightChar.getDayXunKong() },
    { label: "时柱", ganZhi: eightChar.getTime(), gan: eightChar.getTimeGan(), zhi: eightChar.getTimeZhi(), wuXing: eightChar.getTimeWuXing(), naYin: eightChar.getTimeNaYin(), shiShen: eightChar.getTimeShiShenGan(), hiddenGan: eightChar.getTimeHideGan(), diShi: eightChar.getTimeDiShi(), xunKong: eightChar.getTimeXunKong() },
  ];
  const pillars = basePillars.map((pillar) => ({ ...pillar, hiddenGanDetails: hiddenGanDetails(eightChar.getDayGan(), pillar.hiddenGan) }));
  // All supported annual selections (1900–2100) fit within these 21 decades.
  const periods = luck.getDaYun(22);
  const annualPeriod = periods.find((period) => flowYear >= period.getStartYear() && flowYear <= period.getEndYear());
  const annual = annualPeriod?.getLiuNian().find((year) => year.getYear() === flowYear);
  if (!annual || !annualPeriod) throw new Error("当前年份没有可用的排运结果");
  const annualGanZhi = annual.getGanZhi();
  const periodDetails = (period: (typeof periods)[number]): BaziDecade => ({
    ganZhi: period.getGanZhi(),
    ageRange: [period.getStartAge(), period.getEndAge()],
    yearRange: [period.getStartYear(), period.getEndYear()],
  });
  const elementCounts = Object.fromEntries(ELEMENTS.map((element) => [element, pillars.reduce((count, pillar) => count + [...pillar.wuXing].filter((value) => value === element).length, 0)])) as BaziResult["elementCounts"];
  return {
    solarDate: solar.toYmdHms(),
    lunarDate: lunar.toString(),
    zodiac: lunar.getYearShengXiaoByLiChun(),
    dayMaster: eightChar.getDayGan(),
    dayBoundary,
    pillars,
    elementCounts,
    taiYuan: `${eightChar.getTaiYuan()} · ${eightChar.getTaiYuanNaYin()}`,
    mingGong: `${eightChar.getMingGong()} · ${eightChar.getMingGongNaYin()}`,
    shenGong: `${eightChar.getShenGong()} · ${eightChar.getShenGongNaYin()}`,
    luck: {
      direction: luck.isForward() ? "顺行" : "逆行",
      start: `${luck.getStartYear()}年${luck.getStartMonth()}个月${luck.getStartDay()}天后起运`,
      startDate: luck.getStartSolar().toYmdHms(),
      decades: periods.slice(1, 9).map(periodDetails),
    },
    annualLuck: {
      year: annual.getYear(),
      age: annual.getAge(),
      ganZhi: annualGanZhi,
      ganShiShen: LunarUtil.SHI_SHEN[eightChar.getDayGan() + annualGanZhi[0]],
      hiddenGanDetails: hiddenGanDetails(eightChar.getDayGan(), LunarUtil.ZHI_HIDE_GAN[annualGanZhi[1]]),
      xunKong: annual.getXunKong(),
      decade: annualPeriod.getIndex() === 0 ? null : periodDetails(annualPeriod),
    },
    rulesVersion: BAZI_RULES_VERSION,
  };
}
