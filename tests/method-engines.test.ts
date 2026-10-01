import assert from "node:assert/strict";
import test from "node:test";
import { createBaziResult } from "../features/bazi/engine/index";
import { createMeihuaResult } from "../features/meihua/engine/index";
import { createXiaoLiuRenResult } from "../features/xiaoliuren/engine/index";
import { createZiweiResult, hourToTimeIndex } from "../features/ziwei/engine/index";

test("八字使用节气历法稳定生成四柱", () => {
  const result = createBaziResult({ date: "1990-01-01", time: "12:00", gender: "男" });
  assert.deepEqual(result.pillars.map((pillar) => pillar.ganZhi), ["己巳", "丙子", "丙寅", "甲午"]);
  assert.equal(result.dayMaster, "丙");
  assert.equal(Object.values(result.elementCounts).reduce((sum, value) => sum + value, 0), 8);
  assert.equal(result.luck.direction, "逆行");
  assert.equal(result.luck.decades[0].ganZhi, "乙亥");
});

test("紫微时辰索引覆盖早子、十二时辰与晚子", () => {
  assert.equal(hourToTimeIndex("00:30"), 0);
  assert.equal(hourToTimeIndex("01:00"), 1);
  assert.equal(hourToTimeIndex("22:59"), 11);
  assert.equal(hourToTimeIndex("23:00"), 12);
});

test("紫微命盘包含十二宫且每宫索引唯一", () => {
  const result = createZiweiResult({ date: "1990-01-01", time: "12:00", gender: "男" });
  assert.equal(result.palaces.length, 12);
  assert.equal(new Set(result.palaces.map((palace) => palace.index)).size, 12);
  assert.ok(result.palaces.some((palace) => palace.name === "命宫"));
  assert.equal(result.soul, "武曲");
  assert.equal(result.body, "天机");
});

test("梅花双数起卦计算本卦、动爻、互卦与变卦", () => {
  const result = createMeihuaResult({ upperNumber: 1, lowerNumber: 1 });
  assert.equal(result.originalHexagram.name, "乾为天");
  assert.equal(result.movingLine, 2);
  assert.equal(result.mutualHexagram.name, "乾为天");
  assert.equal(result.changedHexagram.name, "天火同人");
  assert.equal(result.bodyTrigram, "乾");
  assert.equal(result.useTrigram, "乾");
});

test("小六壬按农历月日时顺行落宫", () => {
  const result = createXiaoLiuRenResult({ date: "1990-01-01", time: "00:00" });
  assert.equal(result.lunarMonth, 12);
  assert.equal(result.lunarDay, 5);
  assert.equal(result.timeBranch, "子");
  assert.equal(result.monthPalace, "空亡");
  assert.equal(result.dayPalace, "赤口");
  assert.equal(result.resultPalace, "赤口");
});
