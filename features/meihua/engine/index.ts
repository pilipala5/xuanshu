import { deriveChangedHexagram, deriveHexagram } from "../../liuyao/engine";
import type { HexagramResult, YaoValue } from "../../liuyao/domain/types";

export type MeihuaInput = { upperNumber: number; lowerNumber: number };
export type MeihuaResult = {
  upperNumber: number;
  lowerNumber: number;
  upperTrigram: { name: string; image: string; symbol: string };
  lowerTrigram: { name: string; image: string; symbol: string };
  originalHexagram: HexagramResult;
  mutualHexagram: HexagramResult;
  changedHexagram: HexagramResult;
  lines: YaoValue[];
  changedLines: YaoValue[];
  movingLine: number;
  bodyTrigram: string;
  useTrigram: string;
  rulesVersion: "xuanshu-meihua-two-number-v1";
};

const TRIGRAMS = [
  { number: 1, name: "乾", image: "天", symbol: "☰", lines: [1, 1, 1] },
  { number: 2, name: "兑", image: "泽", symbol: "☱", lines: [1, 1, 0] },
  { number: 3, name: "离", image: "火", symbol: "☲", lines: [1, 0, 1] },
  { number: 4, name: "震", image: "雷", symbol: "☳", lines: [1, 0, 0] },
  { number: 5, name: "巽", image: "风", symbol: "☴", lines: [0, 1, 1] },
  { number: 6, name: "坎", image: "水", symbol: "☵", lines: [0, 1, 0] },
  { number: 7, name: "艮", image: "山", symbol: "☶", lines: [0, 0, 1] },
  { number: 8, name: "坤", image: "地", symbol: "☷", lines: [0, 0, 0] },
] as const;

function trigram(number: number) {
  const normalized = ((number - 1) % 8 + 8) % 8 + 1;
  return TRIGRAMS[normalized - 1];
}

export function createMeihuaResult(input: MeihuaInput): MeihuaResult {
  if (![input.upperNumber, input.lowerNumber].every((value) => Number.isInteger(value) && value > 0 && value <= 999999)) throw new Error("请输入 1—999999 之间的两个整数");
  const upper = trigram(input.upperNumber);
  const lower = trigram(input.lowerNumber);
  const movingLine = ((input.upperNumber + input.lowerNumber - 1) % 6 + 6) % 6 + 1;
  const binary = [...lower.lines, ...upper.lines] as Array<0 | 1>;
  const lines = binary.map((line, index) => index === movingLine - 1 ? (line ? 9 : 6) : (line ? 7 : 8)) as YaoValue[];
  const changedLines = lines.map((line) => line === 6 ? 7 : line === 9 ? 8 : line) as YaoValue[];
  const mutualLines = [binary[1], binary[2], binary[3], binary[2], binary[3], binary[4]] as Array<0 | 1>;
  return {
    upperNumber: input.upperNumber,
    lowerNumber: input.lowerNumber,
    upperTrigram: upper,
    lowerTrigram: lower,
    originalHexagram: deriveHexagram(lines),
    mutualHexagram: deriveHexagram(mutualLines),
    changedHexagram: deriveChangedHexagram(lines),
    lines,
    changedLines,
    movingLine,
    bodyTrigram: movingLine <= 3 ? upper.name : lower.name,
    useTrigram: movingLine <= 3 ? lower.name : upper.name,
    rulesVersion: "xuanshu-meihua-two-number-v1",
  };
}
