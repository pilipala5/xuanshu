import assert from "node:assert/strict";
import test from "node:test";
import { createZiweiResult, hourToTimeIndex, ZIWEI_PALACE_SLOTS, type ZiweiInput } from "../features/ziwei/engine/index";

const birth: ZiweiInput = { date: "1990-01-01", time: "12:00", gender: "男" };

test("紫微固定宫位索引与地支方位一致，命宫保持已知位置", () => {
  const chart = createZiweiResult(birth);
  assert.deepEqual(chart.palaces.map((palace) => palace.stemBranch.slice(-1)), ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"]);
  assert.deepEqual(ZIWEI_PALACE_SLOTS.slice(0, 4).map((index) => chart.palaces[index!].stemBranch.slice(-1)), ["巳", "午", "未", "申"]);
  assert.deepEqual(ZIWEI_PALACE_SLOTS.slice(-4).map((index) => chart.palaces[index!].stemBranch.slice(-1)), ["寅", "丑", "子", "亥"]);
  assert.equal(chart.palaces.find((palace) => palace.name === "命宫")?.index, 5);
});

test("紫微完整保留主星、辅星、杂曜、亮度、生年四化与长生", () => {
  const chart = createZiweiResult(birth);
  const soul = chart.palaces[5];
  assert.deepEqual(soul.majorStars, [{ name: "天梁", brightness: "旺", mutagen: "科" }]);
  assert.deepEqual(soul.minorStars.map((star) => star.name), ["擎羊"]);
  assert.deepEqual(soul.adjectiveStars.map((star) => star.name), ["三台", "八座", "恩光", "蜚廉"]);
  assert.equal(soul.changsheng12, "沐浴");
  assert.deepEqual(soul.decadal, [5, 14]);
  assert.equal(chart.palaces.reduce((total, palace) => total + palace.majorStars.length, 0), 14);
  assert.equal(chart.palaces.reduce((total, palace) => total + palace.minorStars.length, 0), 14);
  assert.equal(chart.palaces.reduce((total, palace) => total + palace.adjectiveStars.length, 0), 38);
  assert.equal(chart.palaces.flatMap((palace) => [...palace.majorStars, ...palace.minorStars]).filter((star) => star.mutagen).length, 4);
});

test("2026 年流年宫名按本命索引对应，流年四化与大限四化各自保留", () => {
  const chart = createZiweiResult({ ...birth, flowYear: "2026" });
  const flow = chart.yearly!;
  assert.equal(flow.referenceDate, "2026-07-01");
  assert.equal(flow.nominalAge, 38); // 出生公历 1990 年 1 月 1 日仍属农历 1989 年。
  assert.equal(flow.stemBranch, "丙午");
  assert.equal(flow.soulPalaceIndex, 4);
  assert.deepEqual(flow.palaceNames, ["财帛", "子女", "夫妻", "兄弟", "命宫", "父母", "福德", "田宅", "官禄", "仆役", "迁移", "疾厄"]);
  assert.equal(chart.palaces[flow.soulPalaceIndex].name, "兄弟");
  assert.deepEqual(flow.mutagens, [{ kind: "禄", star: "天同" }, { kind: "权", star: "天机" }, { kind: "科", star: "文昌" }, { kind: "忌", star: "廉贞" }]);
  assert.equal(flow.decadal?.index, 2);
  assert.equal(flow.decadal?.natalPalaceName, "子女");
  assert.deepEqual(flow.decadal?.ageRange, [35, 44]);
  assert.deepEqual(flow.decadal?.mutagens.map((item) => item.star), ["贪狼", "太阴", "右弼", "天机"]);
  assert.deepEqual(flow.stars[4].map((star) => star.name), ["流曲", "流羊"]);
  assert.equal(flow.stars.length, 12);
  assert.equal(flow.jiangqian12.length, 12);
  assert.equal(flow.suiqian12.length, 12);
});

test("切换流年只改变年度叠加，本命星曜与生年四化不变", () => {
  const first = createZiweiResult({ ...birth, flowYear: "2026" });
  const next = createZiweiResult({ ...birth, flowYear: "2027" });
  assert.deepEqual(first.palaces, next.palaces);
  assert.equal(next.yearly?.stemBranch, "丁未");
  assert.equal(next.yearly?.soulPalaceIndex, 5);
  assert.deepEqual(next.yearly?.mutagens.map((item) => item.star), ["太阴", "天同", "天机", "巨门"]);
  assert.equal(createZiweiResult(birth).yearly, null); // 旧记录缺少年份时保持仅本命。
  assert.equal(createZiweiResult({ ...birth, flowYear: "" }).yearly, null);
});

test("闰二月十五与十六按默认闰月修正落在相邻命宫", () => {
  const before = createZiweiResult({ date: "2023-04-05", time: "12:00", gender: "女" });
  const after = createZiweiResult({ date: "2023-04-06", time: "12:00", gender: "女" });
  assert.match(before.lunarDate, /闰二月十五/);
  assert.match(after.lunarDate, /闰二月十六/);
  assert.equal(before.soulPalaceBranch, "酉");
  assert.equal(after.soulPalaceBranch, "戌");
});

test("早子与晚子区分，晚子安星等于次日早子", () => {
  assert.equal(hourToTimeIndex("00:59"), 0);
  assert.equal(hourToTimeIndex("01:00"), 1);
  assert.equal(hourToTimeIndex("22:59"), 11);
  assert.equal(hourToTimeIndex("23:00"), 12);
  const early = createZiweiResult({ ...birth, time: "00:00" });
  const late = createZiweiResult({ ...birth, time: "23:00" });
  const nextEarly = createZiweiResult({ ...birth, date: "1990-01-02", time: "00:00" });
  assert.notDeepEqual(early.palaces[11].majorStars, late.palaces[11].majorStars);
  assert.deepEqual(late.palaces, nextEarly.palaces);
});

test("紫微拒绝错误分钟、非完整时间、无效公历日与错误性别", () => {
  for (const time of ["", ":30", "1:00", "12:", "12:60", "23:99", "24:00", "12:30:00", "12:30extra", " 12:30"]) assert.throws(() => hourToTimeIndex(time), /完整的出生时间/);
  assert.throws(() => createZiweiResult({ ...birth, date: "2023-02-29" }));
  assert.throws(() => createZiweiResult({ ...birth, gender: "其他" } as unknown as ZiweiInput), /有效的性别/);
  for (const flowYear of ["202", "2026.5", "1899", "2101", "1988"]) assert.throws(() => createZiweiResult({ ...birth, flowYear }), /流年/);
});

test("超出大限区间时不展示库的默认天干地支为真实大限", () => {
  const chart = createZiweiResult({ date: "1900-06-01", time: "12:00", gender: "男", flowYear: "2100" });
  assert.ok(chart.yearly);
  assert.equal(chart.yearly.decadal, null);
  assert.equal(chart.yearly.palaceNames.length, 12);
});
