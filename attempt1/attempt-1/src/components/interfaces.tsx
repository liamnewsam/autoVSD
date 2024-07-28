type RGB = [number, number, number];

export interface Hotspot {
  hotspotName: string;
  options: string[];
  id: string;
  color: [defaultColor: RGB, focusColor: RGB];
  outlinePoints: { x: number; y: number }[];
  mask?: string;
}

export interface Point {
  x: number;
  y: number;
}
// Export Hotspot, Point, and RGB as named exports

// Export RGB as a named export
export type { RGB };
