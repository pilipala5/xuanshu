import type { LiuYaoSession, YaoValue } from "../domain/types";

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

function yaoSvg(value: YaoValue, y: number, x: number, lineColor: string): string {
  const yang = value === 7 || value === 9;
  const moving = value === 6 || value === 9;
  const lines = yang
    ? `<rect x="${x}" y="${y}" width="190" height="18" rx="9" fill="${lineColor}"/>`
    : `<rect x="${x}" y="${y}" width="78" height="18" rx="9" fill="${lineColor}"/><rect x="${x + 112}" y="${y}" width="78" height="18" rx="9" fill="${lineColor}"/>`;
  return `${lines}${moving ? `<circle cx="${x + 218}" cy="${y + 9}" r="8" fill="#9a5144"/>` : ""}`;
}

export type SaveImageOutcome = "shared" | "downloaded" | "cancelled";

export async function downloadResultImage(session: LiuYaoSession): Promise<SaveImageOutcome> {
  const dark = document.documentElement.dataset.theme === "dark";
  const palette = dark
    ? { paper: "#101b18", ink: "#edf1ee", jade: "#9bb5aa", jadeDeep: "#29483e", gold: "#c4a675", goldSoft: "#756d5e", mist: "#20302b", muted: "#a4b0aa", veilTop: ".9", veilMid: ".82", veilBottom: ".5" }
    : { paper: "#fbfaf6", ink: "#202824", jade: "#29483e", jadeDeep: "#29483e", gold: "#b28d58", goldSoft: "#ddd0b8", mist: "#dde6e1", muted: "#7f8b85", veilTop: ".96", veilMid: ".9", veilBottom: ".46" };
  const movingText = session.movingLines.length ? session.movingLines.map((line) => line === 1 ? "初爻" : line === 6 ? "上爻" : `${line}爻`).join("、") : "无动爻";
  const originalLines = [...session.lines].reverse().map((line, index) => yaoSvg(line, 610 + index * 55, 255, palette.jade)).join("");
  const changedValues = session.lines.map((line) => line === 6 ? 7 : line === 9 ? 8 : line) as YaoValue[];
  const changedLines = [...changedValues].reverse().map((line, index) => yaoSvg(line, 610 + index * 55, 995, palette.jade)).join("");
  const details = session.lineDetails.slice().reverse().map((line, index) => `<text x="185" y="${1190 + index * 74}" font-size="28" fill="${palette.jade}">${escapeXml(`${line.position === 6 ? "上" : line.position === 1 ? "初" : line.position}爻  ${line.liuShen}  ${line.liuQin}  ${line.stem}${line.branch}${line.element}${line.marker ? ` · ${line.marker}` : ""}${line.moving ? " · 动" : ""}`)}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1920" viewBox="0 0 1440 1920">
    <defs><linearGradient id="veil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${palette.paper}" stop-opacity="${palette.veilTop}"/><stop offset=".56" stop-color="${palette.paper}" stop-opacity="${palette.veilMid}"/><stop offset="1" stop-color="${palette.paper}" stop-opacity="${palette.veilBottom}"/></linearGradient></defs>
    <rect width="1440" height="1920" fill="url(#veil)"/><circle cx="1220" cy="180" r="290" fill="${palette.mist}" opacity=".42"/><circle cx="1210" cy="190" r="200" fill="none" stroke="${palette.gold}" stroke-opacity=".35"/><circle cx="1210" cy="190" r="140" fill="none" stroke="${palette.jade}" stroke-opacity=".25" stroke-dasharray="8 12"/>
    <text x="150" y="145" font-family="Songti SC,Noto Serif CJK SC,serif" font-size="54" font-weight="700" fill="${palette.ink}" letter-spacing="10">玄枢</text><text x="153" y="186" font-family="Arial,sans-serif" font-size="17" fill="${palette.gold}" letter-spacing="8">XUANSHU</text>
    <text x="150" y="305" font-family="PingFang SC,Noto Sans CJK SC,sans-serif" font-size="24" fill="${palette.jade}" letter-spacing="5">所问之事</text><text x="150" y="375" font-family="Songti SC,Noto Serif CJK SC,serif" font-size="44" fill="${palette.ink}">${escapeXml(session.question.slice(0, 28))}</text>
    <line x1="150" y1="435" x2="1290" y2="435" stroke="${palette.goldSoft}"/>
    <text x="350" y="535" text-anchor="middle" font-size="25" fill="${palette.jade}">本卦 · 第${session.originalHexagram.number}卦</text><text x="350" y="585" text-anchor="middle" font-family="Songti SC,serif" font-size="46" fill="${palette.ink}">${escapeXml(session.originalHexagram.name)}</text>
    <text x="1090" y="535" text-anchor="middle" font-size="25" fill="${palette.jade}">变卦 · 第${session.changedHexagram.number}卦</text><text x="1090" y="585" text-anchor="middle" font-family="Songti SC,serif" font-size="46" fill="${palette.ink}">${escapeXml(session.changedHexagram.name)}</text>
    ${originalLines}${changedLines}<text x="720" y="755" text-anchor="middle" font-size="48" fill="${palette.gold}">→</text>
    <rect x="150" y="985" width="1140" height="112" rx="28" fill="${palette.jadeDeep}"/><text x="720" y="1052" text-anchor="middle" font-size="31" fill="#f5f2ea">${escapeXml(`${movingText} · ${session.palace} ${session.palaceStage} · 世${session.shiLine} 应${session.yingLine}`)}</text>
    ${details}
    <line x1="150" y1="1680" x2="1290" y2="1680" stroke="${palette.goldSoft}"/><text x="150" y="1750" font-size="24" fill="${palette.jade}">${escapeXml(`月建 ${session.metadata.monthBuild} · 日辰 ${session.metadata.dayPillar} · 空亡 ${session.metadata.voidBranches}`)}</text><text x="150" y="1800" font-size="21" fill="${palette.muted}">${escapeXml(`${session.metadata.calendarDate} · ${session.metadata.timezone} · ${session.metadata.method}`)}</text><text x="1290" y="1810" text-anchor="end" font-size="19" fill="${palette.gold}" letter-spacing="4">RULES FIRST · FREE &amp; OPEN</text>
  </svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("结果图渲染失败")); image.src = src; });
    const [image, background] = await Promise.all([
      loadImage(url),
      loadImage(dark ? "/assets/result/share-background-dark.webp" : "/assets/result/share-background-light.webp"),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = 1440; canvas.height = 1920;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("当前浏览器无法生成结果图");
    context.drawImage(background, 0, 0, 1440, 1920);
    context.drawImage(image, 0, 0);
    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("结果图导出失败")), "image/png", 1);
    });
    const filename = `玄枢-${session.originalHexagram.shortName}-${session.id.slice(0, 8)}.png`;
    const file = new File([imageBlob], filename, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `玄枢 · ${session.originalHexagram.name}`, text: session.question });
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      }
    }

    const downloadUrl = URL.createObjectURL(imageBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    return "downloaded";
  } finally { URL.revokeObjectURL(url); }
}
