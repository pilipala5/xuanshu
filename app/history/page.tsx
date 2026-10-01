"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteChrome";
import { clearMethodRecords, deleteMethodRecord, listMethodRecords, type ExtendedMethodId } from "@/features/method-history";
import { clearSessions, deleteSession, listSessions } from "@/features/liuyao/storage/history";

type HistoryItem = {
  id: string;
  source: "liuyao" | "method";
  method: "liuyao" | ExtendedMethodId;
  methodLabel: string;
  title: string;
  summary: string;
  createdAt: string;
  href: string;
};

const LABELS: Record<HistoryItem["method"], string> = { liuyao: "六爻", bazi: "八字", ziwei: "紫微", meihua: "梅花", xiaoliuren: "小六壬" };

async function loadHistoryItems(): Promise<HistoryItem[]> {
  const [liuyao, methods] = await Promise.all([listSessions(), Promise.resolve(listMethodRecords())]);
  return [
    ...liuyao.map((record): HistoryItem => ({ id: record.id, source: "liuyao", method: "liuyao", methodLabel: LABELS.liuyao, title: record.question, summary: `${record.originalHexagram.name} → ${record.changedHexagram.name}`, createdAt: record.createdAt, href: `/liuyao/result/${record.id}` })),
    ...methods.map((record): HistoryItem => ({ id: record.id, source: "method", method: record.method, methodLabel: LABELS[record.method], title: record.title, summary: record.summary, createdAt: record.createdAt, href: `/${record.method}?record=${record.id}` })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<number | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 3200);
  };

  const refresh = useCallback(async () => setRecords(await loadHistoryItems()), []);

  useEffect(() => {
    let cancelled = false;
    void loadHistoryItems().then((items) => { if (!cancelled) setRecords(items); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; if (noticeTimer.current) window.clearTimeout(noticeTimer.current); };
  }, []);

  const removeRecord = async (record: HistoryItem) => {
    if (!window.confirm(`删除“${record.title}”这条本机记录？`)) return;
    setBusyId(record.id);
    try {
      if (record.source === "liuyao") await deleteSession(record.id);
      else deleteMethodRecord(record.id);
      await refresh();
      showNotice("记录已从本机删除");
    } catch {
      showNotice("删除失败，请检查浏览器存储权限");
    } finally {
      setBusyId(null);
    }
  };

  const clearAll = async () => {
    if (!window.confirm(`清空当前浏览器中的 ${records.length} 条术数记录？此操作无法撤销。`)) return;
    setBusyId("all");
    const results = await Promise.allSettled([clearSessions(), Promise.resolve().then(clearMethodRecords)]);
    await refresh();
    showNotice(results.every((result) => result.status === "fulfilled") ? "本机记录已清空" : "部分记录未能清除，请检查浏览器存储权限");
    setBusyId(null);
  };

  return (
    <main className="history-page">
      <SiteHeader backHref="/" title="历史记录" />
      <div className="history-shell">
        <div className="history-heading"><span>仅存本机</span><h1>过往排盘</h1><p>六爻、八字、紫微、梅花与小六壬记录都只保存在当前浏览器。</p></div>
        {!loading && records.length > 0 && <div className="history-toolbar"><span>共 {records.length} 条</span><button type="button" onClick={() => void clearAll()} disabled={busyId !== null}>清空记录</button></div>}
        {loading ? <p className="empty-history">正在读取…</p> : records.length ? <div className="history-list">{records.map((record) => <article key={`${record.source}-${record.id}`}><a href={record.href} aria-label={`查看${record.title}的排盘`}><span><i>{record.methodLabel}</i>{new Date(record.createdAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}</span><div><h2>{record.title}</h2><p>{record.summary}</p></div><b aria-hidden="true">→</b></a><button type="button" onClick={() => void removeRecord(record)} disabled={busyId !== null} aria-label={`删除${record.title}的记录`}><span aria-hidden="true">×</span></button></article>)}</div> : <div className="empty-history"><i>卦</i><h2>还没有排盘记录</h2><p>完成任一术数排盘后，结果会自动保存在这里。</p><Link href="/#methods">选择术数</Link></div>}
      </div>
      {notice && <div className="toast" role="status" aria-live="polite">{notice}</div>}
    </main>
  );
}
