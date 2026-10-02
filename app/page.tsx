"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim duplicates React during hydration; sized WebP assets are used instead. */

import { motion } from "motion/react";
import { BrandMark, SiteHeader } from "@/components/SiteChrome";
import { XuanShuInstrument } from "@/components/XuanShuInstrument";
import { methods } from "@/config/methods";

const goldPoints = [
  [12, 28, 0], [21, 61, 2.1], [34, 19, 4.6], [43, 73, 1.2],
  [56, 34, 3.5], [64, 15, 5.4], [71, 57, .7], [79, 29, 3],
  [86, 68, 5.8], [91, 43, 1.8], [48, 48, 6.4], [27, 42, 4],
] as const;

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader />
      <section className="hero" id="top">
        <div className="mountain-far" aria-hidden="true" />
        <div className="mist-layer mist-far" aria-hidden="true" />
        <div className="mist-layer mist-mid" aria-hidden="true" />
        <div className="mist-layer mist-near" aria-hidden="true" />
        <div className="gold-points" aria-hidden="true">
          {goldPoints.map(([left, top, delay], index) => (
            <i key={index} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }} />
          ))}
        </div>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
          <p className="kicker">玄枢 · 东方术数排盘</p>
          <h1>心静意诚<br />万象自明</h1>
          <p className="subtitle">选一种术数，生成排盘。看不懂，就复制给 AI。</p>
        </motion.div>
        <XuanShuInstrument />
        <a className="primary-button" href="#methods"><span>选择排盘方式</span><i aria-hidden="true">⌄</i></a>
      </section>
      <section className="methods" id="methods">
        <div className="section-heading"><div><h2>从这里开始</h2><p>问一件事，或了解一份命盘。选好方式，按提示填写即可。</p></div></div>
        <motion.div className="method-list" initial="idle" whileInView="visible" viewport={{ once: true, amount: .16 }} variants={{ idle: {}, visible: { transition: { staggerChildren: .055 } } }}>
          {methods.map((method, index) => (
            <motion.a className={`method-card method-${method.id}`} href={method.status === "available" ? method.route : "#methods"} key={method.id} variants={{ idle: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: .46, ease: [0.22, 1, 0.36, 1] } } }}>
              <div className="method-visual">
                <img src={method.visual} alt="" width="768" height="768" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
              </div>
              <div className="method-copy"><h3>{method.name}</h3><p>{method.subtitle}</p></div>
              <b aria-hidden="true"><span>→</span></b>
            </motion.a>
          ))}
        </motion.div>
      </section>
      <section className="rules-note" id="about"><BrandMark /><h2>排盘有据，解读有路</h2><p>玄枢按传统规则计算排盘，记录保存在本机。五种术数都能复制 AI 提示词，把完整数据交给你常用的 AI 解释。</p><div><span>免费开源</span><span>本机记录</span><span>复制问 AI</span></div></section>
      <footer><span>玄枢 · XUANSHU</span><p>准 · 美 · 顺</p></footer>
    </main>
  );
}
