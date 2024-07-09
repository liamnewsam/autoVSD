import { useRef, useEffect, useState } from "react";
import { Simplify, ISimplifyObjectPoint } from "simplify-ts";

import "../style/ImageDraw.css";

import Hotspot from "./interfaces.tsx";
import { indexOf, myHotspot, arrayToRgba } from "./functions.tsx";

interface ImageDrawProps {
  hotspotImage: string;
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  focusID: string;
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
  useEffect(() => {
    backgroundImage.src = hotspotImage;
    calculateCanvasSize(backgroundImage.width, backgroundImage.height);
    console.log("hi");
  }, [hotspotImage]);
  /*
  let backgroundImage = new Image();
  backgroundImage.onload = () => {
    calculateCanvasSize(backgroundImage.width, backgroundImage.height);
    drawMasks();
  };
  backgroundImage.src = hotspotImage;*/

  //This is because I don't know how to get masks to be drawn when they first get loaded into hotspots.

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingData, setDrawingData] = useState<any[]>([]); // State to hold drawing data

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    //console.log("we do be clearing!");
    context.clearRect(0, 0, canvas.width, canvas.height);
    //setDrawingData(() => []);
  };

  const drawOutlines = (exclude: string[] = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = "rgba(50, 50, 50, 0.2)";

    for (let hotspot of hotspots) {
      if (exclude.indexOf(hotspot.id) > -1) {
        console.log("Alright we are excluding: ", hotspot.id);
        continue;
      }
      //console.log(hotspot.focusMask);
      if (hotspot.outlinePoints.length < 1) continue;

      console.log("at least we are in here!");
      //context.beginPath();
      context.moveTo(hotspot.outlinePoints[0].x, hotspot.outlinePoints[0].y);
      for (let i = 1; i < hotspot.outlinePoints.length; i++) {
        let point = hotspot.outlinePoints[i];
        context.lineTo(point.x, point.y);
        context.stroke();
      }
      //context.closePath();
    }
  };
  /*
  useEffect(() => {
    if (drawingData.length > 0) {
      drawMask();
    }
  }, [drawingData]);*/

  useEffect(() => {
    //console.log("we should be drawing cuz focusID updated!");
    clearCanvas();
    drawOutlines();
    console.log("currently focused ID is:", focusID);
  }, [focusID]);

  useEffect(() => {
    if (focusedHotspot && drawingData.length > 0) {
      console.log("YESirrrrrrrrr");
      focusedHotspot.outlinePoints = drawingData;
      setHotspots(hotspotsClone);
      setDrawingData([]);
    }
  }, [drawingData]);

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
    console.log("AM I Drawing???: ", isDrawing);
    console.log("What is Focus?: ", focusID);

    if (isDrawing) {
      clearCanvas();
      drawOutlines([focusID]);
    }

    const startDrawing = (event: TouchEvent) => {
      setIsDrawing(true);
      console.log("we should be excluding focusID...", focusID);

      console.log("lets a go!");
      const { offsetX, offsetY } = getMousePosition(canvas, event);
      //context.beginPath();
      context.moveTo(offsetX, offsetY);

      currentDrawingData.push({ x: offsetX, y: offsetY });
    };

    const draw = (event: TouchEvent) => {
      if (!isDrawing) return;

      const { offsetX, offsetY } = getMousePosition(canvas, event);
      //console.log(offsetX, offsetY);
      context.lineTo(offsetX, offsetY);
      context.stroke();

      currentDrawingData.push({ x: offsetX, y: offsetY });
    };

    const finishDrawing = () => {
      console.log("phew");
      //context.closePath();
      setIsDrawing(false);

      setDrawingData(currentDrawingData);
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
