import { Hotspot, Point } from "./interfaces.tsx";

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

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function chaikinSmooth(
  points: Point[],
  iterations: number = 5
): Point[] {
  if (points.length < 3) return points; // No need to smooth if there are less than 3 points

  const smoothPoints = (pts: Point[]): Point[] => {
    let newPoints: Point[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const Q = { x: 0.75 * p0.x + 0.25 * p1.x, y: 0.75 * p0.y + 0.25 * p1.y };
      const R = { x: 0.25 * p0.x + 0.75 * p1.x, y: 0.25 * p0.y + 0.75 * p1.y };
      newPoints.push(Q, R);
    }
    // Handle closing the shape by connecting the last point to the first point
    const firstPoint = pts[0];
    const lastPoint = pts[pts.length - 1];
    const Q = {
      x: 0.75 * lastPoint.x + 0.25 * firstPoint.x,
      y: 0.75 * lastPoint.y + 0.25 * firstPoint.y,
    };
    const R = {
      x: 0.25 * lastPoint.x + 0.75 * firstPoint.x,
      y: 0.25 * lastPoint.y + 0.75 * firstPoint.y,
    };
    newPoints.push(Q, R);
    newPoints.push(newPoints[0]); // Ensure the shape is closed
    return newPoints;
  };

  let smoothedPoints = points;
  for (let i = 0; i < iterations; i++) {
    smoothedPoints = smoothPoints(smoothedPoints);
  }
  return smoothedPoints;
}

export function decreasePointDensity(
  points: { x: number; y: number }[],
  factor: number
) {
  if (factor <= 1) {
    return points; // Factor of 1 or less means no reduction
  }

  const reducedPoints = [];
  for (let i = 0; i < points.length; i += factor) {
    reducedPoints.push(points[i]);
  }
  return reducedPoints;
}
