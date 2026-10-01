import { Solar } from "lunar-typescript";
import { parseCalendarInput } from "../../method-utils";

export type XiaoLiuRenInput = { date: string; time: string };
export type XiaoLiuRenPalaceName = "大安" | "留连" | "速喜" | "赤口" | "小吉" | "空亡";
export type XiaoLiuRenResult = {
  solarDate: string;
  lunarDate: string;
  timeBranch: string;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  calculation: { month: string; day: string; time: string };
  monthPalace: XiaoLiuRenPalaceName;
  dayPalace: XiaoLiuRenPalaceName;
  resultPalace: XiaoLiuRenPalaceName;
  resultIndex: number;
  palaces: Array<{ name: XiaoLiuRenPalaceName; element: string; direction: string; keyword: string }>;
  rulesVersion: "xuanshu-xiaoliuren-month-day-hour-v1";
};

export const XIAOLIUREN_PALACES: XiaoLiuRenResult["palaces"] = [
  { name: "大安", element: "木", direction: "东方", keyword: "安定" },
  { name: "留连", element: "水", direction: "北方", keyword: "迟滞" },
  { name: "速喜", element: "火", direction: "南方", keyword: "迅捷" },
  { name: "赤口", element: "金", direction: "西方", keyword: "口舌" },
  { name: "小吉", element: "水", direction: "北方", keyword: "和合" },
  { name: "空亡", element: "土", direction: "中央", keyword: "落空" },
];

const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function createXiaoLiuRenResult(input: XiaoLiuRenInput): XiaoLiuRenResult {
  const value = parseCalendarInput(input.date, input.time);
  const solar = Solar.fromYmdHms(value.year, value.month, value.day, value.hour, value.minute, 0);
  const lunar = solar.getLunar();
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const timeBranch = lunar.getTimeZhi();
  const hourIndex = BRANCHES.indexOf(timeBranch);
  if (hourIndex < 0) throw new Error("无法确定当前时辰");
  const monthIndex = (lunarMonth - 1) % 6;
  const dayIndex = (monthIndex + lunarDay - 1) % 6;
  const resultIndex = (dayIndex + hourIndex) % 6;
  return {
    solarDate: solar.toYmdHms(),
    lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    timeBranch,
    lunarMonth,
    lunarDay,
    isLeapMonth: lunar.getMonth() < 0,
    calculation: {
      month: `从大安起正月，顺行 ${lunarMonth - 1} 步 → ${XIAOLIUREN_PALACES[monthIndex].name}`,
      day: `从${XIAOLIUREN_PALACES[monthIndex].name}起初一，顺行 ${lunarDay - 1} 步 → ${XIAOLIUREN_PALACES[dayIndex].name}`,
      time: `从${XIAOLIUREN_PALACES[dayIndex].name}起子时，顺行 ${hourIndex} 步 → ${XIAOLIUREN_PALACES[resultIndex].name}`,
    },
    monthPalace: XIAOLIUREN_PALACES[monthIndex].name,
    dayPalace: XIAOLIUREN_PALACES[dayIndex].name,
    resultPalace: XIAOLIUREN_PALACES[resultIndex].name,
    resultIndex,
    palaces: XIAOLIUREN_PALACES,
    rulesVersion: "xuanshu-xiaoliuren-month-day-hour-v1",
  };
}
