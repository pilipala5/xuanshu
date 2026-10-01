export type YaoValue = 6 | 7 | 8 | 9;
export type ElementName = "木" | "火" | "土" | "金" | "水";
export type LiuQinName = "父母" | "兄弟" | "子孙" | "妻财" | "官鬼";

export type HexagramResult = {
  number: number;
  name: string;
  shortName: string;
  upper: string;
  lower: string;
  upperSymbol: string;
  lowerSymbol: string;
  lines: Array<0 | 1>;
};

export type LineDetail = {
  position: number;
  value: YaoValue;
  yinYang: "阴" | "阳";
  moving: boolean;
  stem: string;
  branch: string;
  element: ElementName;
  liuQin: LiuQinName;
  liuShen: string;
  marker?: "世" | "应";
};

export type LiuYaoSession = {
  id: string;
  question: string;
  createdAt: string;
  lines: YaoValue[];
  coinScores: number[][];
  originalHexagram: HexagramResult;
  changedHexagram: HexagramResult;
  movingLines: number[];
  palace: string;
  palaceElement: ElementName;
  palaceStage: string;
  shiLine: number;
  yingLine: number;
  lineDetails: LineDetail[];
  metadata: {
    timezone: string;
    calendarDate: string;
    monthBuild: string;
    dayPillar: string;
    voidBranches: string;
    method: "三钱法";
    rulesVersion: "xuanshu-liuyao-v1" | "xuanshu-liuyao-v2-jieqi";
  };
  status: "created" | "casting" | "completed";
};
