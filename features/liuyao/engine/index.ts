import type { ElementName, HexagramResult, LineDetail, LiuQinName, LiuYaoSession, YaoValue } from "../domain/types";
import { Solar } from "lunar-typescript";

export type RandomSource = () => number;

type Trigram = { key: string; name: string; image: string; symbol: string; element: ElementName };

const TRIGRAMS: Trigram[] = [
  { key: "111", name: "乾", image: "天", symbol: "☰", element: "金" },
  { key: "110", name: "兑", image: "泽", symbol: "☱", element: "金" },
  { key: "101", name: "离", image: "火", symbol: "☲", element: "火" },
  { key: "100", name: "震", image: "雷", symbol: "☳", element: "木" },
  { key: "011", name: "巽", image: "风", symbol: "☴", element: "木" },
  { key: "010", name: "坎", image: "水", symbol: "☵", element: "水" },
  { key: "001", name: "艮", image: "山", symbol: "☶", element: "土" },
  { key: "000", name: "坤", image: "地", symbol: "☷", element: "土" },
];

const HEXAGRAM_NUMBERS = [
  [1, 43, 14, 34, 9, 5, 26, 11],
  [10, 58, 38, 54, 61, 60, 41, 19],
  [13, 49, 30, 55, 37, 63, 22, 36],
  [25, 17, 21, 51, 42, 3, 27, 24],
  [44, 28, 50, 32, 57, 48, 18, 46],
  [6, 47, 64, 40, 59, 29, 4, 7],
  [33, 31, 56, 62, 53, 39, 52, 15],
  [12, 45, 35, 16, 20, 8, 23, 2],
];

const HEXAGRAM_NAMES: Record<number, string> = {
  1: "乾为天", 2: "坤为地", 3: "水雷屯", 4: "山水蒙", 5: "水天需", 6: "天水讼", 7: "地水师", 8: "水地比",
  9: "风天小畜", 10: "天泽履", 11: "地天泰", 12: "天地否", 13: "天火同人", 14: "火天大有", 15: "地山谦", 16: "雷地豫",
  17: "泽雷随", 18: "山风蛊", 19: "地泽临", 20: "风地观", 21: "火雷噬嗑", 22: "山火贲", 23: "山地剥", 24: "地雷复",
  25: "天雷无妄", 26: "山天大畜", 27: "山雷颐", 28: "泽风大过", 29: "坎为水", 30: "离为火", 31: "泽山咸", 32: "雷风恒",
  33: "天山遁", 34: "雷天大壮", 35: "火地晋", 36: "地火明夷", 37: "风火家人", 38: "火泽睽", 39: "水山蹇", 40: "雷水解",
  41: "山泽损", 42: "风雷益", 43: "泽天夬", 44: "天风姤", 45: "泽地萃", 46: "地风升", 47: "泽水困", 48: "水风井",
  49: "泽火革", 50: "火风鼎", 51: "震为雷", 52: "艮为山", 53: "风山渐", 54: "雷泽归妹", 55: "雷火丰", 56: "火山旅",
  57: "巽为风", 58: "兑为泽", 59: "风水涣", 60: "水泽节", 61: "风泽中孚", 62: "雷山小过", 63: "水火既济", 64: "火水未济",
};

const NAJIA: Record<string, { innerStem: string; outerStem: string; inner: string[]; outer: string[] }> = {
  "乾": { innerStem: "甲", outerStem: "壬", inner: ["子", "寅", "辰"], outer: ["午", "申", "戌"] },
  "坤": { innerStem: "乙", outerStem: "癸", inner: ["未", "巳", "卯"], outer: ["丑", "亥", "酉"] },
  "震": { innerStem: "庚", outerStem: "庚", inner: ["子", "寅", "辰"], outer: ["午", "申", "戌"] },
  "巽": { innerStem: "辛", outerStem: "辛", inner: ["丑", "亥", "酉"], outer: ["未", "巳", "卯"] },
  "坎": { innerStem: "戊", outerStem: "戊", inner: ["寅", "辰", "午"], outer: ["申", "戌", "子"] },
  "离": { innerStem: "己", outerStem: "己", inner: ["卯", "丑", "亥"], outer: ["酉", "未", "巳"] },
  "艮": { innerStem: "丙", outerStem: "丙", inner: ["辰", "午", "申"], outer: ["戌", "子", "寅"] },
  "兑": { innerStem: "丁", outerStem: "丁", inner: ["巳", "卯", "丑"], outer: ["亥", "酉", "未"] },
};

const BRANCH_ELEMENT: Record<string, ElementName> = {
  "亥": "水", "子": "水", "寅": "木", "卯": "木", "巳": "火", "午": "火",
  "申": "金", "酉": "金", "辰": "土", "戌": "土", "丑": "土", "未": "土",
};

const GENERATES: Record<ElementName, ElementName> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROLS: Record<ElementName, ElementName> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const SIX_SPIRITS = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"];

function trigramByKey(key: string): Trigram {
  const trigram = TRIGRAMS.find((item) => item.key === key);
  if (!trigram) throw new Error(`未知三爻结构: ${key}`);
  return trigram;
}

export function seededRandom(seed: number): RandomSource {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function castCoins(rng: RandomSource = Math.random): { value: YaoValue; scores: number[] } {
  const scores: number[] = [0, 0, 0].map(() => rng() < 0.5 ? 2 : 3);
  return { value: scores.reduce((sum, value) => sum + value, 0) as YaoValue, scores };
}

export function deriveHexagram(values: YaoValue[] | Array<0 | 1>): HexagramResult {
  if (values.length !== 6) throw new Error("六爻结果必须恰好包含六爻");
  const lines = values.map((value) => (value === 7 || value === 9 || value === 1 ? 1 : 0)) as Array<0 | 1>;
  const lower = trigramByKey(lines.slice(0, 3).join(""));
  const upper = trigramByKey(lines.slice(3, 6).join(""));
  const upperIndex = TRIGRAMS.findIndex((item) => item.key === upper.key);
  const lowerIndex = TRIGRAMS.findIndex((item) => item.key === lower.key);
  const number = HEXAGRAM_NUMBERS[lowerIndex][upperIndex];
  const name = HEXAGRAM_NAMES[number];
  const shortName = name.includes("为") ? name.slice(0, name.indexOf("为")) : name.slice(2);
  return { number, name, shortName, upper: upper.name, lower: lower.name, upperSymbol: upper.symbol, lowerSymbol: lower.symbol, lines };
}

export function deriveChangedHexagram(lines: YaoValue[]): HexagramResult {
  return deriveHexagram(lines.map((value) => value === 6 ? 1 : value === 9 ? 0 : value === 7 ? 1 : 0));
}

export function deriveMovingLines(lines: YaoValue[]): number[] {
  return lines.flatMap((value, index) => value === 6 || value === 9 ? [index + 1] : []);
}

export function derivePalace(hexagram: HexagramResult): { palace: string; element: ElementName; stage: string; shi: number; ying: number } {
  const stages = [
    { name: "本宫", flips: [], shi: 6 },
    { name: "一世", flips: [0], shi: 1 },
    { name: "二世", flips: [0, 1], shi: 2 },
    { name: "三世", flips: [0, 1, 2], shi: 3 },
    { name: "四世", flips: [0, 1, 2, 3], shi: 4 },
    { name: "五世", flips: [0, 1, 2, 3, 4], shi: 5 },
    { name: "游魂", flips: [0, 1, 2, 4], shi: 4 },
    { name: "归魂", flips: [4], shi: 3 },
  ];
  for (const palaceTrigram of TRIGRAMS) {
    const pure = [...palaceTrigram.key, ...palaceTrigram.key].map(Number) as Array<0 | 1>;
    for (const stage of stages) {
      const candidate = pure.map((line, index) => stage.flips.includes(index) ? (1 - line) as 0 | 1 : line);
      if (candidate.join("") === hexagram.lines.join("")) {
        const ying = stage.shi <= 3 ? stage.shi + 3 : stage.shi - 3;
        return { palace: `${palaceTrigram.name}宫`, element: palaceTrigram.element, stage: stage.name, shi: stage.shi, ying };
      }
    }
  }
  throw new Error("无法确定卦宫");
}

function deriveLiuQin(lineElement: ElementName, palaceElement: ElementName): LiuQinName {
  if (lineElement === palaceElement) return "兄弟";
  if (GENERATES[lineElement] === palaceElement) return "父母";
  if (GENERATES[palaceElement] === lineElement) return "子孙";
  if (CONTROLS[palaceElement] === lineElement) return "妻财";
  return "官鬼";
}

function julianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function clockParts(date: Date, timezone?: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
  return { year: values.year, month: values.month, day: values.day, hour: values.hour, minute: values.minute, second: values.second };
}

export function deriveDayPillar(date: Date, timezone?: string): { index: number; stem: string; branch: string; label: string } {
  const value = clockParts(date, timezone);
  const index = (julianDay(value.year, value.month, value.day) + 49) % 60;
  const stem = STEMS[index % 10];
  const branch = BRANCHES[index % 12];
  return { index, stem, branch, label: `${stem}${branch}` };
}

export function deriveMonthBuild(date: Date): string {
  // The calendar library's solar-term timestamps use Beijing time (UTC+8).
  const value = clockParts(date, "Etc/GMT-8");
  return Solar.fromYmdHms(value.year, value.month, value.day, value.hour, value.minute, value.second).getLunar().getMonthZhiExact();
}

function deriveVoidBranches(dayIndex: number): string {
  return [["戌", "亥"], ["申", "酉"], ["午", "未"], ["辰", "巳"], ["寅", "卯"], ["子", "丑"]][Math.floor(dayIndex / 10)].join("、");
}

function sixSpiritSequence(dayStem: string): string[] {
  const start = dayStem === "甲" || dayStem === "乙" ? 0 : dayStem === "丙" || dayStem === "丁" ? 1 : dayStem === "戊" ? 2 : dayStem === "己" ? 3 : dayStem === "庚" || dayStem === "辛" ? 4 : 5;
  return Array.from({ length: 6 }, (_, index) => SIX_SPIRITS[(start + index) % 6]);
}

export function deriveLineDetails(lines: YaoValue[], hexagram: HexagramResult, palace: ReturnType<typeof derivePalace>, dayStem: string): LineDetail[] {
  const lower = NAJIA[hexagram.lower];
  const upper = NAJIA[hexagram.upper];
  const stems = [lower.innerStem, lower.innerStem, lower.innerStem, upper.outerStem, upper.outerStem, upper.outerStem];
  const branches = [...lower.inner, ...upper.outer];
  const spirits = sixSpiritSequence(dayStem);
  return lines.map((value, index) => {
    const element = BRANCH_ELEMENT[branches[index]];
    return {
      position: index + 1,
      value,
      yinYang: value === 7 || value === 9 ? "阳" : "阴",
      moving: value === 6 || value === 9,
      stem: stems[index],
      branch: branches[index],
      element,
      liuQin: deriveLiuQin(element, palace.element),
      liuShen: spirits[index],
      marker: palace.shi === index + 1 ? "世" : palace.ying === index + 1 ? "应" : undefined,
    };
  });
}

export function createLiuYaoSession(input: { question: string; id: string; now: Date; timezone: string; rng?: RandomSource }): LiuYaoSession {
  const casts = Array.from({ length: 6 }, () => castCoins(input.rng));
  const lines = casts.map((cast) => cast.value);
  const originalHexagram = deriveHexagram(lines);
  const changedHexagram = deriveChangedHexagram(lines);
  const palace = derivePalace(originalHexagram);
  const day = deriveDayPillar(input.now, input.timezone);
  return {
    id: input.id,
    question: input.question.trim(),
    createdAt: input.now.toISOString(),
    lines,
    coinScores: casts.map((cast) => cast.scores),
    originalHexagram,
    changedHexagram,
    movingLines: deriveMovingLines(lines),
    palace: palace.palace,
    palaceElement: palace.element,
    palaceStage: palace.stage,
    shiLine: palace.shi,
    yingLine: palace.ying,
    lineDetails: deriveLineDetails(lines, originalHexagram, palace, day.stem),
    metadata: {
      timezone: input.timezone,
      calendarDate: input.now.toLocaleString("zh-CN", { hour12: false, timeZone: input.timezone }),
      monthBuild: deriveMonthBuild(input.now),
      dayPillar: day.label,
      voidBranches: deriveVoidBranches(day.index),
      method: "三钱法",
      rulesVersion: "xuanshu-liuyao-v2-jieqi",
    },
    status: "created",
  };
}
