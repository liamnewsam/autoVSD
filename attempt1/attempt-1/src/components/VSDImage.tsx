import { useRef, useState, useEffect } from "react";
import { Hotspot } from "./interfaces";
import "../style/VSDImage.css";
import { myHotspot } from "./functions";
import { arrayToRGB } from "./functions";

let marginSize = 10;
let outlineThickness = 10;

interface VSDImageData {
  hotspotsImage: string;
  hotspots: Hotspot[];
  focusID: string;
  setFocusID: (x: string) => void;
  setHotspots: (x: Hotspot[]) => void;
  vsdMode: number;
}

function VSDImage({
  hotspotsImage,
  hotspots,
  focusID,
  setFocusID,
  setHotspots,
  vsdMode,
}: VSDImageData) {
  let focusedHotspot = myHotspot(focusID, hotspots);

  let [canvasDimensions, setCanvasDimensions] = useState([0, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
  }>({ visible: false, text: "", x: 0, y: 0 });

  const tooltipVisibleRef = useRef(false);

  const calculateCanvasSize = (imageW: number, imageH: number) => {
    let parent = document.getElementById("VSD-image");
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

  let [imageDimensions, setImageDimensions] = useState<number[]>([0, 0]);
  let backgroundImage = new Image();
  useEffect(() => {
    backgroundImage.src = hotspotsImage;
    backgroundImage.onload = () => {
      setImageDimensions([backgroundImage.width, backgroundImage.height]);
      calculateCanvasSize(backgroundImage.width, backgroundImage.height);
    };
  }, [hotspotsImage]);

  let scalingFactor = (canvasDimensions[0] * 1.0) / imageDimensions[0];

  const bakeMasks = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.log("Context not found");
      return;
    }

    const updatedHotspots = hotspots.map((hs) => {
      if (hs.outlinePoints.length === 0) return hs;

      clearCanvas();

      context.strokeStyle = "rgba(255, 0, 0, 1)";
      context.lineWidth = outlineThickness;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.fillStyle = "rgba(255, 0, 0, 1)";

      context.beginPath();
      context.moveTo(
        hs.outlinePoints[0].x * scalingFactor,
        hs.outlinePoints[0].y * scalingFactor
      );

      for (let i = 1; i < hs.outlinePoints.length; i++) {
        let point = hs.outlinePoints[i];
        context.lineTo(point.x * scalingFactor, point.y * scalingFactor);
      }
      context.stroke();
      context.fill();

      return {
        ...hs,
        mask: canvas.toDataURL("image/png"),
      };
    });

    setHotspots(updatedHotspots);
    clearCanvas();
  };

  useEffect(() => {
    console.log("Canvas dimensions changed");
    bakeMasks();
    drawOutlines();
  }, [canvasDimensions]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Canvas cleared");
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
    drawOutlines();
  }, [focusID]);

  const handleCanvasClick = (event: MouseEvent | TouchEvent) => {
    console.log("at least we are");
    if (tooltipVisibleRef.current) {
      console.log("Tooltip is already visible!");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let x: number, y: number;
    if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else if (event instanceof TouchEvent) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
      console.log(event.touches);
    } else {
      return;
    }

    for (let i = 0; i < hotspots.length; i++) {
      const maskImg = new Image();
      maskImg.src = hotspots[i].mask as string;

      maskImg.onload = () => {
        const maskCanvas = document.createElement("canvas");
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) return;
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        const imageData = maskCtx.getImageData(x, y, 1, 1).data;

        if (imageData[0] > 0 && !tooltipVisibleRef.current) {
          setFocusID(hotspots[i].id);
          console.log("Hotspot " + hotspots[i].id + " has been clicked!");
          tooltipVisibleRef.current = true;

          showTooltip(hotspots[i].hotspotName, x + rect.left, y + rect.top);

          return;
        }
      };
    }
  };

  useEffect(() => {
    console.log("hello");
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Add click event listener
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchstart", handleCanvasClick);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("touchstart", handleCanvasClick);
    };
  }, [canvasDimensions, hotspotsImage, hotspots, focusID]);

  const showTooltip = (text: string, x: number, y: number) => {
    console.log("Showing tooltip");

    setTooltip({ visible: true, text, x, y });

    setTimeout(() => {
      setTooltip((tooltip) => ({ ...tooltip, visible: false }));
      tooltipVisibleRef.current = false;
      setFocusID("");
      console.log("Tooltip has been hidden");
    }, 1000);

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      console.log("Text-to-speech not supported in this browser.");
    }
  };

  const imageStyle: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    backgroundImage: `url(${hotspotsImage})`,
  };

  const tooltipStyle: React.CSSProperties = {
    left: tooltip.x,
    top: tooltip.y,
    opacity: tooltip.visible ? 1 : 0,
    pointerEvents: "none",
  };

  return (
    <div id="VSD-image-div">
      <div id="VSD-image">
        <canvas
          ref={canvasRef}
          id="VSD-canvas"
          width={canvasDimensions[0]}
          height={canvasDimensions[1]}
          style={imageStyle}
          className="canvas"
        />

        <div className="tooltip" style={tooltipStyle}>
          {tooltip.text}
        </div>
      </div>
    </div>
  );
}

export default VSDImage;
