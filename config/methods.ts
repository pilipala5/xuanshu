export type MethodConfig = {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  visual: string;
  route: string;
  status: "available" | "coming-soon";
};

export const methods: MethodConfig[] = [
  { id: "liuyao", name: "六爻", subtitle: "围绕一件事，模拟铜钱起卦", icon: "爻", visual: "/assets/v2/methods/liuyao-coins.webp", route: "/liuyao", status: "available" },
  { id: "bazi", name: "四柱八字", subtitle: "输入出生时间，查看四柱与大运", icon: "柱", visual: "/assets/v3/methods/bazi-jade-slips.svg", route: "/bazi", status: "available" },
  { id: "ziwei", name: "紫微斗数", subtitle: "输入出生信息，查看十二宫星曜", icon: "斗", visual: "/assets/v3/methods/ziwei-celestial-atlas.svg", route: "/ziwei", status: "available" },
  { id: "meihua", name: "梅花易数", subtitle: "输入两个数字，生成本卦与变卦", icon: "梅", visual: "/assets/v3/methods/meihua-ink-blossom.svg", route: "/meihua", status: "available" },
  { id: "xiaoliuren", name: "小六壬", subtitle: "选择日期与时间，查看最终落宫", icon: "壬", visual: "/assets/v3/methods/xiaoliuren-ceramic-compass.svg", route: "/xiaoliuren", status: "available" }
];
