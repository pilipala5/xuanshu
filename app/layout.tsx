import type { Metadata } from "next";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.XUANSHU_SITE_URL || "http://localhost:5173"),
  title: "玄枢 · 东方术数排盘与推演工具",
  description: "确定性规则驱动的现代东方术数工具，支持六爻、四柱八字、紫微斗数、梅花易数与小六壬。",
  openGraph: {
    title: "玄枢 · 心静意诚，万象自明",
    description: "确定性规则驱动的现代东方术数工具，支持六爻、四柱八字、紫微斗数、梅花易数与小六壬。",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "玄枢东方术数排盘与推演工具" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "玄枢 · 心静意诚，万象自明",
    description: "确定性规则驱动的现代东方术数工具，支持六爻、四柱八字、紫微斗数、梅花易数与小六壬。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning><body><MotionProvider>{children}</MotionProvider></body></html>;
}
