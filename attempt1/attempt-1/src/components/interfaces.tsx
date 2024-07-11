type RGB = [number, number, number];

interface Hotspot {
  hotspotName: string;
  options: string[];
  id: string;
  color: [defaultColor: RGB, focusColor: RGB];
  outlinePoints: { x: number; y: number }[];
  mask?: string;
}

export default Hotspot;
export type { RGB };
