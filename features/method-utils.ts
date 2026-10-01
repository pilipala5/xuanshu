export function createRecordId(): string {
  const now = Date.now();
  return globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random().toString(16).slice(2)}`;
}

function two(value: number): string {
  return String(value).padStart(2, "0");
}

export function localDateValue(date = new Date()): string {
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
}

export function localTimeValue(date = new Date()): string {
  return `${two(date.getHours())}:${two(date.getMinutes())}`;
}

export function parseCalendarInput(date: string, time: string): { year: number; month: number; day: number; hour: number; minute: number } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("请输入完整的日期与时间");
  }
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (year < 1900 || year > 2100) throw new Error("当前版本支持 1900—2100 年");
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    throw new Error("日期不存在，请检查年月日");
  }
  if (hour > 23 || minute > 59) throw new Error("时间须在 00:00—23:59 之间");
  return { year, month, day, hour, minute };
}
