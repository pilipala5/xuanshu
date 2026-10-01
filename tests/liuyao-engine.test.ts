import assert from "node:assert/strict";
import test from "node:test";
import {
  castCoins,
  createLiuYaoSession,
  deriveChangedHexagram,
  deriveDayPillar,
  deriveHexagram,
  deriveMovingLines,
  deriveMonthBuild,
  derivePalace,
  seededRandom,
} from "../features/liuyao/engine/index";
import type { YaoValue } from "../features/liuyao/domain/types";

test("64 种阴阳结构一一映射到周易六十四卦", () => {
  const numbers = new Set<number>();
  for (let value = 0; value < 64; value += 1) {
    const lines = Array.from({ length: 6 }, (_, index) => ((value >> index) & 1) as 0 | 1);
    const hexagram = deriveHexagram(lines);
    numbers.add(hexagram.number);
    assert.doesNotThrow(() => derivePalace(hexagram));
  }
  assert.equal(numbers.size, 64);
  assert.deepEqual([...numbers].sort((a, b) => a - b), Array.from({ length: 64 }, (_, index) => index + 1));
});

test("基础卦象映射使用由初至上的爻序", () => {
  assert.equal(deriveHexagram([1, 1, 1, 1, 1, 1]).name, "乾为天");
  assert.equal(deriveHexagram([0, 0, 0, 0, 0, 0]).name, "坤为地");
  assert.equal(deriveHexagram([0, 1, 0, 0, 0, 1]).name, "山水蒙");
  assert.equal(deriveHexagram([1, 0, 1, 0, 1, 0]).name, "水火既济");
});

test("动爻只改变老阴与老阳", () => {
  const lines: YaoValue[] = [6, 7, 8, 9, 7, 8];
  assert.deepEqual(deriveMovingLines(lines), [1, 4]);
  assert.deepEqual(deriveChangedHexagram(lines).lines, [1, 1, 0, 0, 1, 0]);
});

test("八宫定位给出正确世应与游魂归魂", () => {
  assert.deepEqual(derivePalace(deriveHexagram([1, 1, 1, 1, 1, 1])), { palace: "乾宫", element: "金", stage: "本宫", shi: 6, ying: 3 });
  assert.deepEqual(derivePalace(deriveHexagram([0, 0, 0, 1, 0, 1])), { palace: "乾宫", element: "金", stage: "游魂", shi: 4, ying: 1 });
  assert.deepEqual(derivePalace(deriveHexagram([1, 1, 1, 1, 0, 1])), { palace: "乾宫", element: "金", stage: "归魂", shi: 3, ying: 6 });
  assert.deepEqual(derivePalace(deriveHexagram([0, 0, 0, 0, 1, 0])), { palace: "坤宫", element: "土", stage: "归魂", shi: 3, ying: 6 });
});

test("三钱法允许注入 Seed 并稳定复算", () => {
  const firstRng = seededRandom(12345);
  const secondRng = seededRandom(12345);
  const first = Array.from({ length: 6 }, () => castCoins(firstRng).value);
  const second = Array.from({ length: 6 }, () => castCoins(secondRng).value);
  assert.deepEqual(first, second);
  assert.ok(first.every((value) => [6, 7, 8, 9].includes(value)));
});

test("每次投掷恰有三枚铜钱，爻值等于钱面分值之和", () => {
  const rng = seededRandom(20260901);
  for (let index = 0; index < 100; index += 1) {
    const cast = castCoins(rng);
    assert.equal(cast.scores.length, 3);
    assert.ok(cast.scores.every((score) => score === 2 || score === 3));
    assert.equal(cast.value, cast.scores.reduce((sum, score) => sum + score, 0));
  }
});

test("没有动爻时本卦与变卦完全一致", () => {
  const lines: YaoValue[] = [7, 8, 7, 8, 7, 8];
  assert.deepEqual(deriveChangedHexagram(lines), deriveHexagram(lines));
  assert.deepEqual(deriveMovingLines(lines), []);
});

test("甲子日与旬空计算基准", () => {
  const day = deriveDayPillar(new Date(2000, 0, 7, 12));
  assert.equal(day.label, "甲子");
  const session = createLiuYaoSession({ question: "测试问题", id: "seeded", now: new Date(2000, 0, 7, 12), timezone: "Asia/Shanghai", rng: seededRandom(7) });
  assert.equal(session.metadata.dayPillar, "甲子");
  assert.equal(session.metadata.voidBranches, "戌、亥");
  assert.deepEqual(session.lineDetails.map((line) => line.liuShen), ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"]);
});

test("月建按节气换月而不是按公历一号", () => {
  assert.equal(deriveMonthBuild(new Date("2026-01-20T12:00:00+08:00")), "丑");
  assert.equal(deriveMonthBuild(new Date("2026-02-05T12:00:00+08:00")), "寅");
  assert.equal(deriveMonthBuild(new Date("2026-03-07T12:00:00+08:00")), "卯");
});

test("乾卦纳甲、六亲与世应结构完整", () => {
  const session = createLiuYaoSession({ question: "测试问题", id: "qian", now: new Date(2000, 0, 7, 12), timezone: "Asia/Shanghai", rng: () => .9 });
  assert.deepEqual(session.lines, [9, 9, 9, 9, 9, 9]);
  assert.equal(session.originalHexagram.name, "乾为天");
  assert.deepEqual(session.lineDetails.map((line) => `${line.stem}${line.branch}${line.element}`), ["甲子水", "甲寅木", "甲辰土", "壬午火", "壬申金", "壬戌土"]);
  assert.deepEqual(session.lineDetails.map((line) => line.liuQin), ["子孙", "妻财", "父母", "官鬼", "兄弟", "父母"]);
  assert.equal(session.lineDetails[5].marker, "世");
  assert.equal(session.lineDetails[2].marker, "应");
});
