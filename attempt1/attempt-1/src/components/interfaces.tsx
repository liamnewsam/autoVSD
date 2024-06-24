interface Hotspot {
  hotspotName: string;
  options: string[];
  id: number;
  points: { x: number; y: number }[];
}

export default Hotspot;
