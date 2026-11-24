export const NAV: { id: string; label: string; divider?: boolean }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "domain", label: "Domain" },
];

/* ───────────── isometric "Business World" scene ───────────── */
const C = {
  white: ["#FFFFFF", "#F1F2EE", "#E3E6E0"], off: ["#F4F5F1", "#E6E8E2", "#D8DBD4"], green: ["#3A8A60", "#26734D", "#1D603F"],
  deep: ["#226B47", "#185C3B", "#124A2F"], soft: ["#E4F0E8", "#D3E5D9", "#C3DACB"], indigo: ["#4A5D93", "#34467A", "#2A3A66"],
  indigo2: ["#7A8BB8", "#5D6F9F", "#4D5E8B"], sand: ["#F0E3C6", "#E1CFA8", "#D2BF96"], tan: ["#D6A25A", "#C58B34", "#A9752A"],
  kraft: ["#E2CDA9", "#D0B88F", "#BCA37A"], pole: ["#DDE2DB", "#CDD3CB", "#BCC3BA"], glass: ["#EEF6F0", "#DCEBE1", "#CCE0D3"],
} as const;
type ColorKey = keyof typeof C;
// [x, y, w, d, h, z, color, minStage, maxStage?, group?]
type BoxDef = [number, number, number, number, number, number, ColorKey, number, number?, string?];
const B: BoxDef[] = [
  [-2, -2, 104, 104, 4, -4, "off", 0], [0, 0, 100, 100, 0.4, 0, "white", 0],
  [10, 46, 6, 6, 1, 0.4, "soft", 1, 2], [9.5, 45.5, 7, 7, 7, 6, "green", 1, 2],
  [19, 24, 30, 20, 20, 0.4, "white", 3, 99, "store"], [17, 22, 34, 24, 2, 20.4, "off", 3, 99, "store"], [19, 44, 30, 6, 1.4, 14, "green", 3, 99, "store"],
  [22, 44, 12, 0.6, 9, 4, "glass", 3, 99, "store"], [37, 44, 7, 0.6, 12, 0.4, "deep", 3, 99, "store"],
  [25, 44.5, 18, 1.4, 5, 23, "green", 2, 99, "store"], [27, 45, 1, 1, 3, 20.4, "pole", 2, 99, "store"], [40, 45, 1, 1, 3, 20.4, "pole", 2, 99, "store"],
  [58, 26, 26, 2.5, 17, 0.4, "off", 4, 99, "products"], [59, 30, 24, 4, 0.8, 11, "white", 4, 99, "products"],
  [61, 30.5, 4, 3, 4.5, 11.8, "indigo2", 4, 99, "products"], [68, 30.5, 4, 3, 4.5, 11.8, "indigo", 4, 99, "products"], [75, 31, 3, 3, 3.5, 11.8, "tan", 4, 99, "products"],
  [60, 38, 24, 11, 7, 0.4, "sand", 4, 99, "products"], [62, 41, 5, 2, 6, 7.4, "indigo", 4, 99, "products"], [70, 40, 5, 4, 1.4, 7.4, "indigo2", 4, 99, "products"], [78, 42, 3.5, 3.5, 4, 7.4, "tan", 4, 99, "products"],
  [71, 64, 11, 11, 11, 0.4, "white", 5, 99, "payments"], [70, 63, 13, 13, 1, 11.4, "green", 5, 99, "payments"], [72.5, 67, 8, 5, 0.6, 16, "deep", 5, 99, "payments"],
  [46, 74, 16, 11, 1, 0.4, "white", 5, 99, "finance"], [49, 76, 4, 4, 5, 1.4, "sand", 5, 99, "finance"], [54.5, 75, 4, 4, 3, 1.4, "sand", 5, 99, "finance"], [56, 80, 4, 4, 7, 1.4, "sand", 5, 99, "finance"],
  [27, 68, 8, 8, 1.5, 0.4, "off", 5, 99, "domain"], [30.3, 71.3, 1.4, 1.4, 17, 1.9, "pole", 5, 99, "domain"], [26.5, 67.5, 9, 9, 9, 19, "glass", 5, 99, "domain"],
  [33, 54, 15, 11, 0.5, 0.4, "soft", 6, 99, "orders"], [35, 56, 4.5, 4.5, 3.5, 0.9, "kraft", 6, 99, "orders"], [41, 58.5, 3.8, 3.8, 3, 0.9, "kraft", 6, 99, "orders"], [35.5, 56.5, 3.2, 3.2, 2.6, 4.4, "kraft", 6, 99, "orders"],
];

const u = (v: number) => (v * 0.62).toFixed(2) + "cqmin";

export interface IsoBox {
  x: string; y: string; w: string; d: string; h: string; top: string; front: string; side: string;
  topT: string; frontT: string; sideT: string; op: number; wrapT: string; origin: string;
}

export function boxes(stage: number, focus: string | null): IsoBox[] {
  return B.map(([x, y, w, d, h, z, c, mn, mx = 99, g]) => {
    const on = stage >= mn && stage <= mx;
    const col = C[c];
    const dim = focus && g && g !== focus ? 0.35 : 1;
    return {
      x: u(x), y: u(y), w: u(w), d: u(d), h: u(h), top: col[0], front: col[1], side: col[2],
      topT: `translateZ(${u(z + h)})`, frontT: `translateZ(${u(z)}) rotateX(-90deg)`, sideT: `translateZ(${u(z)}) rotateY(90deg)`,
      op: on ? dim : 0, wrapT: on ? "none" : "scale3d(.6,.6,.6)", origin: `${u(x + w / 2)} ${u(y + d / 2)}`,
    };
  });
}
