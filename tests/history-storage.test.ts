import assert from "node:assert/strict";
import test from "node:test";
import { createLiuYaoSession, seededRandom } from "../features/liuyao/engine/index";
import type { LiuYaoSession } from "../features/liuyao/domain/types";
import { clearSessions, deleteSession, listSessions, mergeSessions, saveSession } from "../features/liuyao/storage/history";

function record(id: string, createdAt: string, question = `问题 ${id}`): LiuYaoSession {
  const session = createLiuYaoSession({
    question,
    id,
    now: new Date(createdAt),
    timezone: "Asia/Shanghai",
    rng: seededRandom(id.length),
  });
  return { ...session, createdAt, status: "completed" };
}

test("本机记录合并时按 id 去重并保留较新的版本", () => {
  const oldVersion = record("same", "2026-01-01T00:00:00.000Z", "旧问题");
  const newVersion = record("same", "2026-02-01T00:00:00.000Z", "新问题");
  const other = record("other", "2026-01-15T00:00:00.000Z");
  const merged = mergeSessions([oldVersion, other], [newVersion]);
  assert.deepEqual(merged.map((item) => item.id), ["same", "other"]);
  assert.equal(merged[0].question, "新问题");
});

test("本机记录只保留最新五十条", () => {
  const records = Array.from({ length: 55 }, (_, index) => record(`record-${index}`, new Date(Date.UTC(2026, 0, index + 1)).toISOString()));
  const merged = mergeSessions(records);
  assert.equal(merged.length, 50);
  assert.equal(merged[0].id, "record-54");
  assert.equal(merged.at(-1)?.id, "record-5");
});

test("IndexedDB 不可用时仍可通过 localStorage 完成保存、读取与删除", async () => {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  try {
    const session = record("fallback", "2026-09-01T08:00:00.000Z");
    await saveSession(session);
    assert.deepEqual((await listSessions()).map((item) => item.id), ["fallback"]);
    await deleteSession(session.id);
    assert.deepEqual(await listSessions(), []);
    await saveSession(session);
    await clearSessions();
    assert.deepEqual(await listSessions(), []);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
