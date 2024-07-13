import { useRef, useEffect, useState } from "react";
import "../style/ImageDraw.css";

import Hotspot from "./interfaces.tsx";
import { indexOf, myHotspot, arrayToRgba, arrayToRGB } from "./functions.tsx";

interface ImageDrawProps {
  hotspotImage: string;
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  focusID: string;
}
interface Point {
  x: number;
  y: number;
}

const outlineThickness = 4;

function chaikinSmooth(points: Point[], iterations: number = 5): Point[] {
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

function decreasePointDensity(
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

function ImageDraw({
  hotspotImage,
  hotspots,
  setHotspots,
  focusID,
}: ImageDrawProps) {
  let hotspotsClone = structuredClone(hotspots);

  let focusedHotspot = myHotspot(focusID, hotspotsClone);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasDimensions, setCanvasDimensions] = useState([0, 0]);

  const [imageDimensions, setImageDimensions] = useState<number[]>([0, 0]);

  const calculateCanvasSize = (imageW: number, imageH: number) => {
    let parent = document.getElementById("canvas-container");
    if (!parent) return;
    let parentW = parent.clientWidth;
    let parentH = parent.clientHeight;

    let testWidth = ((parentH * 1.0) / imageH) * imageW;
    if (testWidth <= parentW) {
      setCanvasDimensions([testWidth, parentH]);
    } else {
      let testHeight = ((parentW * 1.0) / imageW) * imageH;
      setCanvasDimensions([parentW, testHeight]);
    }
  };

  let backgroundImage = new Image();
  useEffect(() => {
    backgroundImage.src = hotspotImage;

    backgroundImage.onload = () => {
      calculateCanvasSize(backgroundImage.width, backgroundImage.height);
      setImageDimensions([backgroundImage.width, backgroundImage.height]);
    };
  }, [hotspotImage]);

  /*
  const [scalingFactor, setScalingFactor] = useState(0);
  useEffect(() => {
    if (canvasDimensions[0] && imageDimensions[0]) {
      setScalingFactor((canvasDimensions[0] * 1.0) / imageDimensions[0]);
    }
  }, [canvasDimensions, imageDimensions]);*/
  let scalingFactor = (canvasDimensions[0] * 1.0) / imageDimensions[0];

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingData, setDrawingData] = useState<any[]>([]); // State to hold drawing data
  const [readyToDraw, setReadyToDraw] = useState(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawOutlines = (exclude: string[] = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineWidth = outlineThickness;
    context.lineCap = "round";
    context.lineJoin = "round";

    clearCanvas();

    for (let hotspot of hotspots) {
      if (exclude.indexOf(hotspot.id) > -1) {
        continue;
      }
      if (hotspot.outlinePoints.length < 3) continue;

      context.strokeStyle = arrayToRGB(
        hotspot.id == focusID ? hotspot.color[1] : hotspot.color[0]
      );

      context.beginPath();
      context.moveTo(
        hotspot.outlinePoints[0].x * scalingFactor,
        hotspot.outlinePoints[0].y * scalingFactor
      );
      for (let i = 1; i < hotspot.outlinePoints.length; i++) {
        let point = hotspot.outlinePoints[i];
        context.lineTo(point.x * scalingFactor, point.y * scalingFactor);
      }
      context.stroke();
    }
  };

  useEffect(() => {
    clearCanvas();
    drawOutlines();
  }, [focusID]);

  useEffect(() => {
    if (focusedHotspot && drawingData.length > 0) {
      focusedHotspot.outlinePoints = drawingData;
      setHotspots(hotspotsClone);
      setDrawingData([]);
      setReadyToDraw(true);
    }
  }, [drawingData]);

  useEffect(() => {
    if (readyToDraw) {
      drawOutlines();
      setReadyToDraw(false);
    }
  }, [readyToDraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (!focusedHotspot) return;
    context.strokeStyle = arrayToRGB(focusedHotspot.color[1]);
    context.lineWidth = outlineThickness;
    context.lineCap = "round";
    context.lineJoin = "round";

    let currentDrawingData: any[] = [];

    const startDrawing = (event: TouchEvent) => {
      setIsDrawing(true);

      clearCanvas();
      drawOutlines([focusID]);
      const { offsetX, offsetY } = getMousePosition(canvas, event);
      context.beginPath();
      context.moveTo(offsetX, offsetY);

      currentDrawingData.push({
        x: offsetX / scalingFactor,
        y: offsetY / scalingFactor,
      });
    };

    const draw = (event: TouchEvent) => {
      if (!isDrawing) return;

      const { offsetX, offsetY } = getMousePosition(canvas, event);
      context.lineTo(offsetX, offsetY);
      context.stroke();

      currentDrawingData.push({
        x: offsetX / scalingFactor,
        y: offsetY / scalingFactor,
      });
    };

    const finishDrawing = () => {
      setIsDrawing(false);
      setDrawingData(
        chaikinSmooth(decreasePointDensity(currentDrawingData, 5))
      );
    };

    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", finishDrawing);
    canvas.addEventListener("touchcancel", finishDrawing);

    return () => {
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", finishDrawing);
      canvas.removeEventListener("touchcancel", finishDrawing);
    };
  }, [isDrawing, focusID]);

  const getMousePosition = (canvas: HTMLCanvasElement, event: TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
  };

  const style: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    backgroundImage: `url(${hotspotImage})`,
  };

  return (
    <div id="canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasDimensions[0]}
        height={canvasDimensions[1]}
        style={style}
        className={
          "canvas" + (indexOf(focusID, hotspots) !== -1 ? "" : " empty")
        }
        id="canvas"
      />
    </div>
  );
}

export default ImageDraw;
