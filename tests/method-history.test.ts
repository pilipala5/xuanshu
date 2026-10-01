import assert from "node:assert/strict";
import test from "node:test";
import { listMethodRecords, saveMethodRecord, type MethodHistoryRecord } from "../features/method-history";

test("历史过滤损坏记录并保留旧版规则与新增排盘选项", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  try {
    const record: MethodHistoryRecord = { id: "old", method: "bazi", title: "四柱", summary: "日主丙", createdAt: "2026-01-01T00:00:00Z", input: { date: "1990-01-01", time: "12:00", gender: "男" }, rulesVersion: "xuanshu-bazi-v1-lunar-typescript" };
    values.set("xuanshu-method-history-v1", JSON.stringify([record, { ...record, id: "broken-date", createdAt: "wrong" }, { ...record, id: "broken-method", method: "missing" }, { ...record, id: "broken-input", input: null }]));
    assert.deepEqual(listMethodRecords().map((item) => item.id), ["old"]);
    saveMethodRecord({ ...record, id: "new", createdAt: "2026-02-01T00:00:00Z", input: { ...record.input, flowYear: "2026", dayBoundary: "zi-hour" }, rulesVersion: "xuanshu-bazi-v2-lunar-typescript" });
    assert.equal(listMethodRecords()[0].input.dayBoundary, "zi-hour");
    assert.equal(listMethodRecords()[1].rulesVersion, "xuanshu-bazi-v1-lunar-typescript");
    values.set("xuanshu-method-history-v1", "not-json");
    assert.deepEqual(listMethodRecords(), []);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
