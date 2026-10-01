export type ExtendedMethodId = "bazi" | "ziwei" | "meihua" | "xiaoliuren";

export type MethodHistoryRecord = {
  id: string;
  method: ExtendedMethodId;
  title: string;
  summary: string;
  createdAt: string;
  input: Record<string, string>;
  rulesVersion: string;
};

const STORAGE_KEY = "xuanshu-method-history-v1";
const MAX_RECORDS = 50;

function isRecord(value: unknown): value is MethodHistoryRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<MethodHistoryRecord>;
  return typeof item.id === "string" && item.id.length > 0
    && ["bazi", "ziwei", "meihua", "xiaoliuren"].includes(item.method ?? "")
    && typeof item.title === "string" && typeof item.summary === "string"
    && typeof item.createdAt === "string" && Number.isFinite(Date.parse(item.createdAt))
    && typeof item.rulesVersion === "string"
    && !!item.input && typeof item.input === "object" && !Array.isArray(item.input)
    && Object.values(item.input).every((value) => typeof value === "string");
}

function readRecords(): MethodHistoryRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

function writeRecords(records: MethodHistoryRecord[]): void {
  if (typeof localStorage === "undefined") throw new Error("当前环境无法使用本机存储");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
}

export function listMethodRecords(): MethodHistoryRecord[] {
  return readRecords().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, MAX_RECORDS);
}

export function getMethodRecord(id: string): MethodHistoryRecord | null {
  return readRecords().find((record) => record.id === id) ?? null;
}

export function saveMethodRecord(record: MethodHistoryRecord): void {
  writeRecords([record, ...readRecords().filter((item) => item.id !== record.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export function deleteMethodRecord(id: string): void {
  writeRecords(readRecords().filter((record) => record.id !== id));
}

export function clearMethodRecords(): void {
  writeRecords([]);
}
