import type { YaoValue } from "@/features/liuyao/domain/types";

export function HexagramView({ lines, compact = false, activeCount = 6 }: { lines: YaoValue[]; compact?: boolean; activeCount?: number }) {
  return (
    <div className={`hexagram ${compact ? "hexagram-compact" : ""}`} aria-label="六爻卦象，由上爻至初爻显示">
      {[...lines].map((value, sourceIndex) => ({ value, position: sourceIndex + 1 })).reverse().map(({ value, position }) => {
        const active = position <= activeCount;
        const yang = value === 7 || value === 9;
        const moving = value === 6 || value === 9;
        return (
          <div className={`yao-row ${active ? "is-active" : ""}`} key={position}>
            <span>{position === 1 ? "初" : position === 6 ? "上" : position}</span>
            <div className={`yao-line ${yang ? "yang" : "yin"}`}>{yang ? <i /> : <><i /><i /></>}</div>
            {moving && <b title="动爻" />}
          </div>
        );
      })}
    </div>
  );
}
