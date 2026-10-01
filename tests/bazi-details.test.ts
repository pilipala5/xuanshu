import assert from "node:assert/strict";
import test from "node:test";
import { createBaziResult, type BaziInput } from "../features/bazi/engine/index";

const birth: BaziInput = { date: "1990-01-01", time: "12:00", gender: "男" };

test("晚子时在 23:00 开始按所选规则换日，默认保持午夜换日", () => {
  const lateZi = { ...birth, time: "23:00" };
  const midnight = createBaziResult(lateZi);
  const ziHour = createBaziResult({ ...lateZi, dayBoundary: "zi-hour" });
  assert.equal(midnight.pillars[2].ganZhi, "丙寅");
  assert.equal(ziHour.pillars[2].ganZhi, "丁卯");
  assert.equal(midnight.dayBoundary, "midnight");
  assert.equal(ziHour.dayBoundary, "zi-hour");
  assert.equal(ziHour.pillars[2].ganZhi, createBaziResult({ ...birth, date: "1990-01-02", time: "00:00" }).pillars[2].ganZhi);
  assert.equal(createBaziResult({ ...birth, time: "22:59" }).pillars[2].ganZhi, createBaziResult({ ...birth, time: "22:59", dayBoundary: "zi-hour" }).pillars[2].ganZhi);
  // The library's time pillar stays 庚子 under both sects; only its ten-god
  // relationship changes with the selected day master.
  assert.equal(midnight.pillars[3].ganZhi, "庚子");
  assert.equal(ziHour.pillars[3].ganZhi, "庚子");
  assert.equal(midnight.pillars[3].shiShen, "偏财");
  assert.equal(ziHour.pillars[3].shiShen, "正财");
});

test("藏干十神逐一对应日主，换日后重新计算", () => {
  const original = createBaziResult({ ...birth, time: "23:30" });
  assert.deepEqual(original.pillars[2].hiddenGanDetails, [
    { gan: "甲", shiShen: "偏印" },
    { gan: "丙", shiShen: "比肩" },
    { gan: "戊", shiShen: "食神" },
  ]);
  assert.deepEqual(original.pillars.map((pillar) => pillar.xunKong), ["戌亥", "申酉", "戌亥", "辰巳"]);
  const switched = createBaziResult({ ...birth, time: "23:30", dayBoundary: "zi-hour" });
  assert.deepEqual(switched.pillars[2].hiddenGanDetails, [{ gan: "乙", shiShen: "偏印" }]);
  assert.deepEqual(switched.pillars[1].hiddenGanDetails, [{ gan: "癸", shiShen: "七杀" }]);
  assert.equal(Object.values(original.elementCounts).reduce((sum, value) => sum + value, 0), 8);
});

test("2026 流年为丙午，按丙日主展示十神和所在大运", () => {
  const result = createBaziResult({ ...birth, flowYear: "2026" });
  assert.deepEqual(result.annualLuck, {
    year: 2026,
    age: 37,
    ganZhi: "丙午",
    ganShiShen: "比肩",
    hiddenGanDetails: [{ gan: "丁", shiShen: "劫财" }, { gan: "己", shiShen: "伤官" }],
    xunKong: "寅卯",
    decade: { ganZhi: "癸酉", ageRange: [29, 38], yearRange: [2018, 2027] },
  });
  assert.equal(result.luck.startDate, "1998-05-01 12:00:00");
});

test("流年大运归属在年度范围边界切换，并覆盖显示列表以后的年份", () => {
  const lastYear = createBaziResult({ ...birth, flowYear: "2027" }).annualLuck;
  const firstYear = createBaziResult({ ...birth, flowYear: "2028" }).annualLuck;
  assert.equal(lastYear.decade?.ganZhi, "癸酉");
  assert.equal(firstYear.decade?.ganZhi, "壬申");
  assert.equal(firstYear.ganZhi, "戊申");
  assert.equal(firstYear.ganShiShen, "食神");
  assert.equal(createBaziResult({ ...birth, flowYear: "2100" }).annualLuck.ganZhi, "庚申");
});

test("起运前年份不会错误挂到第一步大运，旧输入默认取出生年", () => {
  const oldRecord = createBaziResult(birth);
  assert.equal(oldRecord.annualLuck.year, 1990);
  assert.equal(oldRecord.annualLuck.ganZhi, "庚午");
  assert.equal(oldRecord.annualLuck.decade, null);
  assert.deepEqual(oldRecord, createBaziResult({ ...birth, dayBoundary: "midnight", flowYear: "1990" }));
});

test("非法日历日期、性别和排盘选项不产生结果", () => {
  for (const override of [
    { date: "2026-02-30" },
    { time: "24:00" },
    { gender: "未知" },
    { dayBoundary: "other" },
    { flowYear: "1989" },
    { flowYear: "2101" },
    { flowYear: "2026.5" },
    { flowYear: 2026 },
  ]) {
    assert.throws(() => createBaziResult({ ...birth, ...override } as BaziInput));
  }
});
