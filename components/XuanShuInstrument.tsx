/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim duplicates React during hydration; the LCP WebP is explicitly sized and prioritized. */
export function XuanShuInstrument() {
  const ticks = Array.from({ length: 72 });
  return (
    <div className="instrument" aria-label="由玉、青铜材质与程序绘制星轨组成的玄枢仪">
      <div className="instrument-aura" aria-hidden="true" />
      <img
        className="instrument-material"
        src="/assets/instrument/xuanshu-instrument-main.webp"
        alt=""
        width="1254"
        height="1254"
        fetchPriority="high"
        decoding="async"
      />
      <svg className="instrument-overlay orbit-lines" viewBox="0 0 400 400" aria-hidden="true">
        <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeOpacity=".38" strokeWidth=".8" />
        <circle cx="200" cy="200" r="163" fill="none" stroke="currentColor" strokeOpacity=".22" strokeDasharray="1 7" />
        <circle cx="200" cy="200" r="132" fill="none" stroke="currentColor" strokeOpacity=".28" strokeDasharray="22 8" />
        {ticks.map((_, index) => (
          <line
            key={index}
            x1="200"
            y1="17"
            x2="200"
            y2={index % 6 === 0 ? "29" : "23"}
            stroke="currentColor"
            strokeOpacity={index % 6 === 0 ? ".54" : ".27"}
            strokeWidth={index % 6 === 0 ? "1.2" : ".65"}
            transform={`rotate(${index * 5} 200 200)`}
          />
        ))}
      </svg>
      <div className="instrument-orbit instrument-orbit-one"><i /></div>
      <div className="instrument-orbit instrument-orbit-two"><i /></div>
      <span className="instrument-heart" aria-hidden="true" />
      <span className="instrument-star star-a" /><span className="instrument-star star-b" /><span className="instrument-star star-c" />
    </div>
  );
}
