import assert from "node:assert/strict";
import test from "node:test";
import { parseCalendarInput } from "../features/method-utils";
import { deriveMonthBuild, createLiuYaoSession, seededRandom } from "../features/liuyao/engine";
import { createZiweiResult } from "../features/ziwei/engine";
import { createXiaoLiuRenResult } from "../features/xiaoliuren/engine";

test("日期校验拒绝不存在的日期与非法时分，包含公历世纪闰年", () => {
  for (const date of ["", "2026-02-29", "1900-02-29", "2026-04-31", "2026-00-01", "2026-13-01", "2026-01-00", "2026-1-01"]) {
    assert.throws(() => parseCalendarInput(date, "12:00"));
  }
  for (const time of ["", "23:60", "24:00", "1:00", "12", "-1:30"]) assert.throws(() => parseCalendarInput("2026-01-01", time));
  assert.deepEqual(parseCalendarInput("2000-02-29", "23:59"), { year: 2000, month: 2, day: 29, hour: 23, minute: 59 });
});

test("六爻月建在 2026 立春准确到交节秒，独立于主机时区", () => {
  assert.equal(deriveMonthBuild(new Date("2026-02-04T04:02:07+08:00")), "丑");
  assert.equal(deriveMonthBuild(new Date("2026-02-04T04:02:08+08:00")), "寅");
});

test("历史夏令时不会把固定北京时间节气提前一小时", () => {
  assert.equal(deriveMonthBuild(new Date("1990-08-07T18:15:32Z")), "未");
  assert.equal(deriveMonthBuild(new Date("1990-08-07T18:45:32Z")), "申");
});

test("六爻日辰采用会话时区的午夜日期，与显示的日期一致", () => {
  const input = { question: "边界", id: "timezone", now: new Date("2000-01-07T18:00:00Z"), rng: seededRandom(7) };
  const shanghai = createLiuYaoSession({ ...input, timezone: "Asia/Shanghai" });
  const utc = createLiuYaoSession({ ...input, timezone: "UTC" });
  assert.equal(shanghai.metadata.dayPillar, "乙丑");
  assert.equal(utc.metadata.dayPillar, "甲子");
});

test("紫微晚子时完整推进农历月、年与闰月中段，旧取法仍可恢复", () => {
  for (const [date, nextDay] of [["1990-01-26", "1990-01-27"], ["2023-04-05", "2023-04-06"], ["2026-12-31", "2027-01-01"]]) {
    const late = createZiweiResult({ date, time: "23:00", gender: "男", flowYear: "2027" });
    const early = createZiweiResult({ date: nextDay, time: "00:00", gender: "男", flowYear: "2027" });
    assert.deepEqual(late.palaces, early.palaces);
    assert.deepEqual(late.yearly, early.yearly);
  }
  const input = { date: "1990-01-26", time: "23:00", gender: "男" as const };
  const legacy = createZiweiResult(input, { legacyLateZi: true });
  assert.equal(legacy.legacyLateZi, true);
  assert.equal(legacy.soulPalaceBranch, "丑");
  assert.equal(createZiweiResult(input).soulPalaceBranch, "寅");
});

test("小六壬闰月沿用同名月计数，并显示明确过程", () => {
  const result = createXiaoLiuRenResult({ date: "2023-03-22", time: "00:00" });
  assert.equal(result.isLeapMonth, true);
  assert.equal(result.lunarMonth, 2);
  assert.equal(result.lunarDay, 1);
  assert.equal(result.resultPalace, "留连");
  assert.match(result.calculation.month, /顺行 1 步/);
  assert.match(result.calculation.time, /顺行 0 步/);
});
