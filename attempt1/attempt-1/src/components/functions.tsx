import Hotspot from "./interfaces.tsx";

export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

export function indexOf(id: string, hotspots: Hotspot[]) {
  for (let i = 0; i < hotspots.length; i++) {
    if (hotspots[i].id == id) {
      return i;
    }
  }
  return -1;
}

export function myHotspot(id: string, hotspots: Hotspot[]) {
  const index = indexOf(id, hotspots);
  return index >= 0 ? hotspots[index] : null;
}

export function arrayToRgba(arr: number[], transparency: boolean): string {
  if (arr.length !== 4) {
    throw new Error("Array must have exactly four elements.");
  }
  let [r, g, b, a] = arr;
  if (transparency) {
    a = (a * 1.0) / 255;
  } else {
    a = 1;
  }

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function arrayToRGB(arr: number[]) {
  let [r, g, b] = arr;
  return `rgb(${r}, ${g}, ${b})`;
}
export default myHotspot;
