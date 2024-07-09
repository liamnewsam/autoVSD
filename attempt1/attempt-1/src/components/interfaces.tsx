interface Hotspot {
  hotspotName: string;
  options: string[];
  id: string;
  defaultColor: number[];
  focusColor: number[];
  outlinePoints: { x: number; y: number }[];
}

export default Hotspot;
