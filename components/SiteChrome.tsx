"use client";
/* eslint-disable @next/next/no-img-element -- The supplied brand SVG is the canonical V2 mark. */

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { methods } from "@/config/methods";

function SunIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.25" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M18.72 5.28 17.3 6.7M6.7 17.3l-1.42 1.42" /></svg>;
}

function MoonIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 15.1A7.8 7.8 0 0 1 8.9 4.6a7.9 7.9 0 1 0 10.5 10.5Z" /></svg>;
}

function MenuIcon() {
  return <span className="menu-icon" aria-hidden="true"><i /><i /></span>;
}

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <img src="/assets/v2/brand/xuanshu-brand-mark.svg" alt="" width="256" height="256" />
    </span>
  );
}

export function SiteHeader({ backHref, title }: { backHref?: string; title?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);

  useEffect(() => {
    let saved: "light" | "dark" | null = null;
    try { saved = localStorage.getItem("xuanshu-theme") as "light" | "dark" | null; } catch { /* Keep the light default. */ }
    const next = saved ?? "light";
    document.documentElement.dataset.theme = next;
    const frame = requestAnimationFrame(() => setTheme(next));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpen.current) menuButtonRef.current?.focus();
      wasMenuOpen.current = false;
      return;
    }
    wasMenuOpen.current = true;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    const applyTheme = () => {
      setTheme(next);
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("xuanshu-theme", next); } catch { /* The theme still works for this visit. */ }
    };
    const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => void };
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  return (
    <>
      <header className="header">
        {backHref ? (
          <a className="back-button" href={backHref} aria-label={backHref === "/" ? "返回首页" : "返回上一页"}>‹</a>
        ) : (
          <Link className="brand" href="/"><BrandMark /><span>玄枢<small>XUAN SHU</small></span></Link>
        )}
        {title && <strong className="page-title"><BrandMark /><span>{title}</span></strong>}
        <div className="header-actions">
          <button className="icon-button theme-icon-button" type="button" onClick={toggleTheme} aria-label={theme === "light" ? "切换深色主题" : "切换浅色主题"} aria-pressed={theme === "dark"}>
            <span className="theme-icon-stack"><span className="sun-icon"><SunIcon /></span><span className="moon-icon"><MoonIcon /></span></span>
          </button>
          <button ref={menuButtonRef} className="icon-button menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="打开菜单" aria-expanded={menuOpen}><MenuIcon /></button>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="menu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .24 }} onClick={() => setMenuOpen(false)}>
            <motion.aside className="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="menu-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: .38, ease: [0.22, 1, 0.36, 1] }} onClick={(event) => event.stopPropagation()}>
              <div className="menu-head"><Link className="brand" href="/" onClick={() => setMenuOpen(false)}><BrandMark /><span>玄枢<small>XUAN SHU</small></span></Link><button ref={closeButtonRef} className="icon-button close-button" type="button" onClick={() => setMenuOpen(false)} aria-label="关闭菜单"><span aria-hidden="true">×</span></button></div>
              <nav aria-label="主菜单">
                <p id="menu-title">探索术数</p>
                {methods.map((method, index) => <motion.div key={method.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .08 + index * .035 }}><Link href={method.status === "available" ? method.route : `/#methods`} onClick={() => setMenuOpen(false)}><span>{method.icon}</span><b>{method.name}</b><small>{method.status === "available" ? "进入" : "即将开放"}</small><i aria-hidden="true">→</i></Link></motion.div>)}
                <hr />
                <Link href="/history" onClick={() => setMenuOpen(false)}><span>时</span><b>历史记录</b><small>仅存本机</small><i aria-hidden="true">→</i></Link>
                <Link href="/#about" onClick={() => setMenuOpen(false)}><span>玄</span><b>关于玄枢</b><small>规则与边界</small><i aria-hidden="true">→</i></Link>
              </nav>
              <div className="menu-theme"><span><small>外观主题</small><b>{theme === "light" ? "宣纸浅色" : "玄青深色"}</b></span><button type="button" onClick={toggleTheme} aria-label="切换外观主题" aria-pressed={theme === "dark"}><span className="theme-switch-thumb" /><i>浅</i><i>深</i></button></div>
              <p className="menu-version">玄枢 V1.0 · FREE & OPEN SOURCE</p>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
