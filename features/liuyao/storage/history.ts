import type { LiuYaoSession } from "../domain/types";

const DB_NAME = "xuanshu-v1";
const STORE_NAME = "history";
const FALLBACK_KEY = "xuanshu-history";
const MAX_HISTORY = 50;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("当前浏览器不支持 IndexedDB"));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开本机记录库"));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("本机记录操作失败"));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("本机记录写入失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("本机记录写入已中止"));
  });
}

function fallbackRecords(): LiuYaoSession[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FALLBACK_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed as LiuYaoSession[] : [];
  } catch {
    return [];
  }
}

function writeFallback(records: LiuYaoSession[]): void {
  if (typeof localStorage === "undefined") throw new Error("当前环境无法使用本机存储");
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
}

export function mergeSessions(...collections: LiuYaoSession[][]): LiuYaoSession[] {
  const records = new Map<string, LiuYaoSession>();
  collections.flat().forEach((record) => {
    if (!record || typeof record.id !== "string" || typeof record.createdAt !== "string") return;
    const current = records.get(record.id);
    if (!current || record.createdAt > current.createdAt) records.set(record.id, record);
  });
  return [...records.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_HISTORY);
}

async function getAllFromDatabase(database: IDBDatabase): Promise<LiuYaoSession[]> {
  const transaction = database.transaction(STORE_NAME, "readonly");
  return requestResult(transaction.objectStore(STORE_NAME).getAll()) as Promise<LiuYaoSession[]>;
}

async function saveToDatabase(session: LiuYaoSession): Promise<void> {
  const database = await openDatabase();
  try {
    const writeTransaction = database.transaction(STORE_NAME, "readwrite");
    writeTransaction.objectStore(STORE_NAME).put(session);
    await transactionComplete(writeTransaction);

    const allRecords = await getAllFromDatabase(database);
    const keep = new Set(mergeSessions(allRecords).map((record) => record.id));
    const expired = allRecords.filter((record) => !keep.has(record.id));
    if (expired.length) {
      const pruneTransaction = database.transaction(STORE_NAME, "readwrite");
      expired.forEach((record) => pruneTransaction.objectStore(STORE_NAME).delete(record.id));
      await transactionComplete(pruneTransaction);
    }
  } finally {
    database.close();
  }
}

async function deleteFromDatabase(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

async function clearDatabase(): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).clear();
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

function ensureOneStorageSucceeded(results: PromiseSettledResult<unknown>[], action: string): void {
  if (results.some((result) => result.status === "fulfilled")) return;
  throw new Error(`${action}失败：浏览器阻止了本机存储`);
}

export async function saveSession(session: LiuYaoSession): Promise<void> {
  const nextFallback = mergeSessions([session], fallbackRecords());
  const results = await Promise.allSettled([
    Promise.resolve().then(() => writeFallback(nextFallback)),
    saveToDatabase(session),
  ]);
  ensureOneStorageSucceeded(results, "保存记录");
}

export async function getSession(id: string): Promise<LiuYaoSession | null> {
  try {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const result = await requestResult(transaction.objectStore(STORE_NAME).get(id)) as LiuYaoSession | undefined;
      if (result) return result;
    } finally {
      database.close();
    }
  } catch {
    // localStorage remains the offline fallback.
  }
  return fallbackRecords().find((item) => item.id === id) ?? null;
}

export async function listSessions(): Promise<LiuYaoSession[]> {
  const fallback = fallbackRecords();
  let databaseRecords: LiuYaoSession[] = [];
  try {
    const database = await openDatabase();
    try {
      databaseRecords = await getAllFromDatabase(database);
    } finally {
      database.close();
    }
  } catch {
    // The fallback still gives the user access to records when IndexedDB is unavailable.
  }
  const merged = mergeSessions(databaseRecords, fallback);
  try { writeFallback(merged); } catch { /* IndexedDB may still be available. */ }
  return merged;
}

export async function deleteSession(id: string): Promise<void> {
  const results = await Promise.allSettled([
    Promise.resolve().then(() => writeFallback(fallbackRecords().filter((record) => record.id !== id))),
    deleteFromDatabase(id),
  ]);
  ensureOneStorageSucceeded(results, "删除记录");
}

export async function clearSessions(): Promise<void> {
  const results = await Promise.allSettled([
    Promise.resolve().then(() => writeFallback([])),
    clearDatabase(),
  ]);
  ensureOneStorageSucceeded(results, "清空记录");
}
