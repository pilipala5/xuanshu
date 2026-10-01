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
  { id: "liuyao", name: "六爻", subtitle: "三枚铜钱起卦 · 洞察万象", icon: "爻", visual: "/assets/v2/methods/liuyao-coins.webp", route: "/liuyao", status: "available" },
  { id: "bazi", name: "四柱八字", subtitle: "四柱命理 · 观照时运", icon: "柱", visual: "/assets/v3/methods/bazi-jade-slips.svg", route: "/bazi", status: "available" },
  { id: "ziwei", name: "紫微斗数", subtitle: "星曜十二宫 · 览见人生", icon: "斗", visual: "/assets/v3/methods/ziwei-celestial-atlas.svg", route: "/ziwei", status: "available" },
  { id: "meihua", name: "梅花易数", subtitle: "以数观象 · 触机而应", icon: "梅", visual: "/assets/v3/methods/meihua-ink-blossom.svg", route: "/meihua", status: "available" },
  { id: "xiaoliuren", name: "小六壬", subtitle: "六宫轮转 · 速断吉凶", icon: "壬", visual: "/assets/v3/methods/xiaoliuren-ceramic-compass.svg", route: "/xiaoliuren", status: "available" }
];
