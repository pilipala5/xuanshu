"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim duplicates React during hydration; sized WebP assets are used instead. */

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef } from "react";

export function RitualTray({ active = false }: { active?: boolean }) {
  return (
    <div className={`ritual-tray ${active ? "is-active" : ""}`} aria-hidden="true">
      <img className="ritual-tray-material" src="/assets/liuyao/ritual-tray.webp" alt="" width="1254" height="1254" decoding="async" />
      <svg viewBox="0 0 320 320">
        <circle cx="160" cy="160" r="121" />
        <circle cx="160" cy="160" r="96" />
        <circle cx="160" cy="160" r="67" />
        {Array.from({ length: 48 }).map((_, index) => <line key={index} x1="160" y1="32" x2="160" y2={index % 6 === 0 ? "43" : "38"} transform={`rotate(${index * 7.5} 160 160)`} />)}
      </svg>
    </div>
  );
}

export function RitualCoin({ label = "铜钱" }: { label?: string }) {
  return (
    <div className="ritual-coin">
      <div className="coin-face coin-front"><img src="/assets/liuyao/coin-front.webp" alt="" width="384" height="384" decoding="async" /></div>
      <div className="coin-face coin-back"><img src="/assets/liuyao/coin-back.webp" alt="" width="384" height="384" decoding="async" /></div>
      <div className="coin-edge"><img src="/assets/liuyao/coin-side.webp" alt="" width="384" height="384" decoding="async" /></div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CoinStage({ scores, castIndex, reducedMotion, onComplete }: { scores: number[]; castIndex: number; reducedMotion: boolean; onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const callback = useRef(onComplete);
  useEffect(() => { callback.current = onComplete; }, [onComplete]);

  useLayoutEffect(() => {
    if (!root.current) return;
    if (reducedMotion) {
      const timer = window.setTimeout(() => callback.current(), 180);
      return () => window.clearTimeout(timer);
    }
    const context = gsap.context(() => {
      const coins = gsap.utils.toArray<HTMLElement>(".ritual-coin");
      const timeline = gsap.timeline({ onComplete: () => callback.current() });
      coins.forEach((coin, index) => {
        const finalRotation = 720 + (scores[index] === 3 ? 180 : 0);
        timeline.fromTo(coin,
          { y: 18, x: 0, rotateX: 0, rotateY: 0, rotateZ: index * 10 - 10, scale: .9 },
          { y: index === 1 ? -104 : -86 - index * 8, x: (index - 1) * 15, rotateX: 450 + index * 90, rotateY: 310 + index * 70, rotateZ: index * 16 - 16, scale: 1.06, duration: .3, ease: "power2.out", force3D: true },
          index * .055,
        ).to(coin, { y: 0, x: (index - 1) * 9, rotateX: finalRotation, rotateY: 720, rotateZ: index * 8 - 8, scale: 1, duration: .72, ease: "bounce.out", force3D: true }, .31 + index * .055);
      });
    }, root);
    return () => context.revert();
  }, [scores, castIndex, reducedMotion]);

  return (
    <div className="coin-stage" ref={root} aria-label={`第 ${castIndex + 1} 次摇卦，三枚铜钱`}>
      <RitualTray active />
      <div className="coin-shadow" aria-hidden="true"><i /><i /><i /></div>
      <div className="coin-row">
        {scores.map((score, index) => (
          <RitualCoin key={`${castIndex}-${index}`} label={score === 3 ? "背" : "字"} />
        ))}
      </div>
    </div>
  );
}
