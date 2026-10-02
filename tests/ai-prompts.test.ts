import assert from "node:assert/strict";
import test from "node:test";
import { createMethodAiPrompt, type MethodPromptData } from "../features/ai/createMethodPrompt";
import { createBaziResult, type BaziInput } from "../features/bazi/engine";
import { createZiweiResult, type ZiweiInput } from "../features/ziwei/engine";
import { createMeihuaResult } from "../features/meihua/engine";
import { createXiaoLiuRenResult } from "../features/xiaoliuren/engine";
import { createLiuYaoSession, seededRandom } from "../features/liuyao/engine";
import { createAiPrompt } from "../features/liuyao/prompts/createPrompt";

function exportedData(data: MethodPromptData) {
  const prompt = createMethodAiPrompt(data);
  const inputPart = prompt.split("原始输入（JSON）：\n")[1];
  const [input, result] = inputPart.split("\n\n完整排盘（JSON，包含界面折叠区的数据）：\n");
  return { prompt, input: JSON.parse(input), result: JSON.parse(result) };
}

test("八字提示词保留性别、换日与折叠明细，五行计数不冒充旺衰", () => {
  const input: BaziInput = { date: "1990-06-15", time: "23:30", gender: "女", dayBoundary: "zi-hour", flowYear: "2026" };
  const result = createBaziResult(input);
  const exported = exportedData({ method: "bazi", input, result });
  assert.deepEqual(exported.input, input);
  assert.deepEqual(exported.result, JSON.parse(JSON.stringify(result)));
  assert.ok(exported.result.pillars.every((pillar: { hiddenGanDetails: unknown[] }) => pillar.hiddenGanDetails.length));
  assert.match(exported.prompt, /不能直接当作旺衰或喜用神结论/);
});

test("紫微提示词包含全部十二宫、杂曜和年度叠盘，与宫位选中状态无关", () => {
  const input: ZiweiInput = { date: "1990-06-15", time: "12:00", gender: "男", flowYear: "2026" };
  const result = createZiweiResult(input);
  const exported = exportedData({ method: "ziwei", input, result });
  assert.deepEqual(exported.input, input);
  assert.deepEqual(exported.result, JSON.parse(JSON.stringify(result)));
  assert.equal(exported.result.palaces.length, 12);
  assert.ok(exported.result.yearly);
  assert.equal(exported.result.yearly.stars.length, 12);
  assert.ok(exported.result.palaces.flatMap((palace: { adjectiveStars: unknown[] }) => palace.adjectiveStars).length > 0);
  const natal = exportedData({ method: "ziwei", input: { ...input, flowYear: "" }, result: createZiweiResult({ ...input, flowYear: "" }) });
  assert.equal(natal.result.yearly, null);
});

test("梅花提示词保留两个数与实际卦象，不补造起卦时间", () => {
  const input = { upperNumber: 17, lowerNumber: 28 };
  const result = createMeihuaResult(input);
  const exported = exportedData({ method: "meihua", input, result });
  assert.deepEqual(exported.input, input);
  assert.equal(exported.result.originalHexagram.name, "天雷无妄");
  assert.equal(exported.result.changedHexagram.name, "天火同人");
  assert.equal(exported.result.movingLine, 3);
  assert.match(exported.prompt, /本次未提供起卦时间/);
});

test("小六壬提示词保留中间落宫，并明确时落宫是最终结果", () => {
  const input = { date: "2026-10-01", time: "12:00" };
  const exported = exportedData({ method: "xiaoliuren", input, result: createXiaoLiuRenResult(input) });
  assert.equal(exported.result.monthPalace, "留连");
  assert.equal(exported.result.dayPalace, "赤口");
  assert.equal(exported.result.resultPalace, "赤口");
  assert.match(exported.prompt, /resultPalace（时落宫）才是最终落宫/);
});

test("六爻提示词保留所问、锁定的爻值与六条明细", () => {
  const session = createLiuYaoSession({ question: "近期如何安排学习计划？", id: "prompt-test", now: new Date("2026-10-01T12:00:00+08:00"), timezone: "Asia/Shanghai", rng: seededRandom(2026) });
  const before = JSON.stringify(session);
  const prompt = createAiPrompt(session);
  assert.ok(prompt.includes(session.question));
  assert.ok(prompt.includes(`[${session.lines.join(", ")}]`));
  assert.ok(prompt.includes(session.originalHexagram.name));
  assert.ok(prompt.includes(session.changedHexagram.name));
  for (const line of session.lineDetails) assert.ok(prompt.includes(`${line.position}爻：${line.liuShen} ${line.liuQin} ${line.stem}${line.branch}${line.element}`));
  assert.equal(JSON.stringify(session), before);
});
