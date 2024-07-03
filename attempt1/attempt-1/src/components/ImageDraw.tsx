import { useRef, useEffect, useState } from "react";
import { Simplify, ISimplifyObjectPoint } from "simplify-ts";

import "../style/ImageDraw.css";

import Hotspot from "./interfaces.tsx";
import { indexOf, myHotspot } from "./functions.tsx";

interface ImageDrawProps {
  hotspotImage: string;
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  focusID: number;
}

function arrayToRgba(arr: number[]): string {
  if (arr.length !== 4) {
    throw new Error("Array must have exactly four elements.");
  }
  const [r, g, b, a] = arr;
  return `rgba(${r}, ${g}, ${b}, ${(a * 1.0) / 255})`;
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

  let [canvasDimensions, setCanvasDimensions] = useState([0, 0]);
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
  backgroundImage.src = hotspotImage;
  backgroundImage.onload = () => {
    calculateCanvasSize(backgroundImage.width, backgroundImage.height);
  };

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingData, setDrawingData] = useState<any[]>([]); // State to hold drawing data
  const [readyToBake, setReadyToBake] = useState<boolean>(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    console.log("why we ain't clearing?");
    context.clearRect(0, 0, canvas.width, canvas.height);
    //setDrawingData(() => []);
  };

  useEffect(() => {
    if (readyToBake) {
      if (!focusedHotspot) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      //Once for default!
      clearCanvas();

      context.strokeStyle = "transparent";
      context.fillStyle = arrayToRgba(focusedHotspot.defaultColor);

      if (drawingData.length > 0) {
        //console.log("ojojjojojoj");
        context.beginPath();
        context.moveTo(drawingData[0].x, drawingData[0].y);
        for (let i = 1; i < drawingData.length; i++) {
          context.lineTo(drawingData[i].x, drawingData[i].y);
          context.stroke();
        }
        context.closePath();
        context.fill();
      }

      focusedHotspot.defaultMask = canvas.toDataURL("image/png");

      //Again for focus!
      clearCanvas();

      context.strokeStyle = "transparent";
      context.fillStyle = arrayToRgba(focusedHotspot.focusColor);

      if (drawingData.length > 0) {
        //console.log("yessir");
        context.beginPath();
        context.moveTo(drawingData[0].x, drawingData[0].y);
        for (let i = 1; i < drawingData.length; i++) {
          context.lineTo(drawingData[i].x, drawingData[i].y);
          context.stroke();
        }
        context.closePath();
        context.fill();
      }

      focusedHotspot.focusMask = canvas.toDataURL("image/png");

      //Finish
      setHotspots(hotspotsClone);

      setReadyToBake(false);
    }
  }, [readyToBake]);

  const drawMasks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (!focusedHotspot) return;

    for (let hotspot of hotspots) {
      //console.log(hotspot.focusMask);
      let img = new Image();
      img.onload = () => {
        //console.log("okay, so atleast we are getting somowhere!");
        context.drawImage(img, 0, 0, canvasDimensions[0], canvasDimensions[1]);
      };
      img.src =
        hotspot.id == focusedHotspot.id
          ? hotspot.focusMask
          : hotspot.defaultMask;
    }
  };
  /*
  useEffect(() => {
    if (drawingData.length > 0) {
      drawMask();
    }
  }, [drawingData]);*/

  useEffect(() => {
    clearCanvas();
    drawMasks();
  }, [focusID]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = "rgba(50, 50, 50, 0.2)";

    let currentDrawingData: any[] = [];

    const startDrawing = (event: TouchEvent) => {
      clearCanvas();

      console.log("lets a go!");
      const { offsetX, offsetY } = getMousePosition(canvas, event);
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);

      currentDrawingData.push({ x: offsetX, y: offsetY });
    };

    const draw = (event: TouchEvent) => {
      if (!isDrawing) return;

      const { offsetX, offsetY } = getMousePosition(canvas, event);
      console.log(offsetX, offsetY);
      context.lineTo(offsetX, offsetY);
      context.stroke();

      currentDrawingData.push({ x: offsetX, y: offsetY });
    };

    const finishDrawing = () => {
      console.log("phew");
      context.closePath();
      setDrawingData(currentDrawingData);
      setReadyToBake(true);
      setIsDrawing(false);
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
  }, [isDrawing]);

  const getMousePosition = (canvas: HTMLCanvasElement, event: TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
  };

  const style: React.CSSProperties = {
    //width: "100%",
    //height: "100%",
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
          "canvas" + (indexOf(focusID, hotspots) != -1 ? "" : " empty")
        }
        id="canvas"
      />
    </div>
  );
}

export default ImageDraw;
