import Hotspot from "./interfaces.tsx";

export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

export function indexOf(id: number, hotspots: Hotspot[]) {
  for (let i = 0; i < hotspots.length; i++) {
    if (hotspots[i].id === id) {
      return i;
    }
  }
  return -1;
}

export function myHotspot(id: number, hotspots: Hotspot[]) {
  const index = indexOf(id, hotspots);
  return index >= 0 ? hotspots[index] : null;
}

export default myHotspot;
