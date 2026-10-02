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
      <section className="support-section" id="support" aria-labelledby="support-title">
        <div className="support-copy">
          <span className="support-tea" aria-hidden="true">🍵</span>
          <h2 id="support-title">一起为爱发电</h2>
          <p>如果玄枢对你有帮助，欢迎请作者喝杯茶，<br className="support-desktop-break" />支持日常维护与新功能开发。</p>
          <p className="support-voluntary">完全自愿，金额随意。所有功能始终免费使用。</p>
          <a className="support-star" href="https://github.com/pilipala5/xuanshu" target="_blank" rel="noopener noreferrer">点一颗 Star，也是一份支持 <span aria-hidden="true">↗</span></a>
        </div>
        <figure className="support-code">
          <a href="/assets/support/wechat-support.jpg" target="_blank" rel="noopener noreferrer" aria-label="查看作者的微信收款码原图">
            <img src="/assets/support/wechat-support.jpg" alt="作者提供的微信收款二维码，用于自愿支持玄枢维护与开发" width="828" height="1124" loading="lazy" decoding="async" />
          </a>
          <figcaption>微信扫一扫 · 手机可保存后在微信识别</figcaption>
          <a className="support-save" href="/assets/support/wechat-support.jpg" download="玄枢-自愿支持-微信收款码.jpg">保存收款码</a>
        </figure>
      </section>
      <footer><span>玄枢 · XUANSHU</span><p>准 · 美 · 顺</p></footer>
    </main>
  );
}
