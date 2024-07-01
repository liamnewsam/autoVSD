import { useRef, useEffect, useState } from "react";
import { Simplify, ISimplifyObjectPoint } from "simplify-ts";

import "../style/ImageDraw.css";

import Hotspot from "./interfaces.tsx";
import { indexOf, myHotspot } from "./functions.tsx";

const tolerance: number = 5;
const highQuality: boolean = true;

interface ImageDrawProps {
  hotspotImage: string;
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  focusID: number;
}

function ImageDraw({
  hotspotImage,
  hotspots,
  setHotspots,
  focusID,
}: ImageDrawProps) {
  let hotspotsClone = structuredClone(hotspots);
  let hs = myHotspot(focusID, hotspotsClone);
  //let hsIndex = indexOf(focusID, hotspots);

  /*return (
    <div id="image-div">
      <img src={image} className="image" />
    </div>
  );*/

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingData, setDrawingData] = useState<any[]>([]); // State to hold drawing data

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      setCanvasDimensions({ width, height });
    };

    // Initial resize
    resizeCanvas();

    // Resize canvas when the window is resized
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const drawHotspot = () => {
    //console.log("HI");
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = "rgba(50, 50, 50, 0.6)";

    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(0, 0, 0, 1)";
    context.globalCompositeOperation = "destination-out";

    hs = myHotspot(focusID, hotspots);
    //console.log(hs);
    if (hs && hs.points.length > 1) {
      context.beginPath();
      context.moveTo(hs.points[0].x, hs.points[0].y);
      for (let i = 1; i < hs.points.length; i++) {
        context.lineTo(hs.points[i].x, hs.points[i].y);
        context.stroke();
      }

      context.fill();
      context.closePath();

      const imgdata = canvas.toDataURL("image/png");
      fetch("http://localhost:5000/api/send-mask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imgdata),
      });
    }
    context.globalCompositeOperation = "source-over";
  };

  useEffect(() => {
    clearCanvas();
    drawHotspot();
  }, [focusID]);

  useEffect(() => {
    if (drawingData.length > 0) {
      updateData();
    } else drawHotspot();
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

    const startDrawing = (event: MouseEvent | TouchEvent) => {
      const { offsetX, offsetY } = getMousePosition(canvas, event);
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);

      //setDrawingData((prevData) => [...prevData, { x: offsetX, y: offsetY }]);
    };

    const draw = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;

      const { offsetX, offsetY } = getMousePosition(canvas, event);
      context.lineTo(offsetX, offsetY);
      context.stroke();

      //setDrawingData((prevData) => [...prevData, { x: offsetX, y: offsetY }]);

      setDrawingData((prevData) => [...prevData, { x: offsetX, y: offsetY }]);
    };

    const finishDrawing = () => {
      context.closePath();
      setIsDrawing(false);

      if (hs) {
        //console.log("BABABA");
        drawHotspot();
      }

      clearCanvas();
    };

    //canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("touchstart", startDrawing);
    //canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchmove", draw);
    //canvas.addEventListener("mouseup", finishDrawing);
    canvas.addEventListener("touchend", finishDrawing);
    //canvas.addEventListener("mouseleave", finishDrawing);

    return () => {
      //canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      //canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("touchmove", draw);
      //canvas.removeEventListener("mouseup", finishDrawing);
      canvas.removeEventListener("touchend", finishDrawing);
      //canvas.removeEventListener("mouseleave", finishDrawing);
    };
  }, [isDrawing]);

  const updateData = () => {
    let temp = [];
    for (let i = 0; i < drawingData.length; i++) {
      temp.push({ x: drawingData[i].x, y: drawingData[i].y });
      //console.log(i);
    }

    const points: ISimplifyObjectPoint[] = temp;
    const simplified_result = Simplify(points, tolerance, highQuality);
    //console.log("we did it?");

    if (hs) {
      hs.points = simplified_result;
    }

    setHotspots(hotspotsClone);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingData(() => []);
  };

  const getMousePosition = (
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY =
      event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  // Ensure canvas maintains its aspect ratio
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    backgroundImage: `url(${hotspotImage})`,
    //border: "1px solid black",
  };
  //console.log(hotspotImage);
  return (
    <div id="canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
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
