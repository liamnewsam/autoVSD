import { useRef, useEffect, useState } from "react";
import "../style/ImageDraw.css";

import { Hotspot } from "./interfaces.tsx";
import {
  indexOf,
  myHotspot,
  arrayToRGB,
  chaikinSmooth,
  decreasePointDensity,
} from "./functions.tsx";

interface ImageDrawProps {
  hotspotImage: string;
  hotspots: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  focusID: string;
}

function ImageDraw({
  hotspotImage,
  hotspots,
  setHotspots,
  focusID,
}: ImageDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState([0, 0]);
  const [imageDimensions, setImageDimensions] = useState<number[]>([0, 0]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingData, setDrawingData] = useState<any[]>([]); // State to hold drawing data
  const [readyToDraw, setReadyToDraw] = useState(false);

  let hotspotsClone = structuredClone(hotspots);
  let focusedHotspot = myHotspot(focusID, hotspotsClone);
  let backgroundImage = new Image();
  let scalingFactor = (canvasDimensions[0] * 1.0) / imageDimensions[0];

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

  useEffect(() => {
    backgroundImage.src = hotspotImage;

    backgroundImage.onload = () => {
      calculateCanvasSize(backgroundImage.width, backgroundImage.height);
      setImageDimensions([backgroundImage.width, backgroundImage.height]);
    };
  }, [hotspotImage]);

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

    context.lineWidth = 4;
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
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";

    let currentDrawingData: any[] = [];

    const startDrawing = (event: MouseEvent | TouchEvent) => {
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

    const draw = (event: MouseEvent | TouchEvent) => {
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

    const getMousePosition = (
      canvas: HTMLCanvasElement,
      event: MouseEvent | TouchEvent
    ) => {
      const rect = canvas.getBoundingClientRect();
      if (event instanceof MouseEvent) {
        return {
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
        };
      } else {
        const touch = event.touches[0];
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top,
        };
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", finishDrawing);
    canvas.addEventListener("mouseout", finishDrawing);
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", finishDrawing);
    canvas.addEventListener("touchcancel", finishDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", finishDrawing);
      canvas.removeEventListener("mouseout", finishDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", finishDrawing);
      canvas.removeEventListener("touchcancel", finishDrawing);
    };
  }, [isDrawing, focusID]);

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
