import type { Metadata } from "next";
import { ResultClient } from "./ResultClient";

export const metadata: Metadata = {
  title: "六爻结果 · 玄枢",
  description: "保存在当前设备上的六爻结构化排盘结果。",
  openGraph: { title: "六爻结果 · 玄枢", description: "设备本地保存的结构化排盘结果。", images: [] },
  twitter: { card: "summary", title: "六爻结果 · 玄枢", description: "设备本地保存的结构化排盘结果。", images: [] },
};

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultClient id={id} />;
}
