import { useRef, useState, useEffect } from "react";
import Hotspot from "./interfaces";
import "../style/VSDImage.css";
import { myHotspot } from "./functions";
import { arrayToRGB, arrayToRgba } from "./functions";

let marginSize = 10;
let outlineThickness = 10;

interface VSDImageData {
  hotspotsImage: string;
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  focusID: string;
  setFocusID: (x: string) => void;
  setHotspots: (x: Hotspot[]) => void;
  vsdMode: number;
}

function VSDImage({
  hotspotsImage,
  hotspots,
  hotspotsClone,
  focusID,
  setFocusID,
  setHotspots,
  vsdMode,
}: VSDImageData) {
  /*
              VSD Modes:
                  1: Only speaks hotspot name
                  2. Speaks hotspot name, shows options around hotspot
                  3. Speaks hotspot name, shows options at bottom of the s
    */

  let focusedHotspot = myHotspot(focusID, hotspots);

  let [canvasDimensions, setCanvasDimensions] = useState([0, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let [optionWidth, setOptionWidth] = useState(10);
  useEffect(() => {
    let maxOptions = 0;
    for (let hotspot of hotspots) {
      if (hotspot.options.length > maxOptions)
        maxOptions = hotspot.options.length;
    }

    let totalWidth = document.getElementById("VSD-options")?.clientWidth;
    if (!totalWidth) return;
    let availableWidth = totalWidth - maxOptions * marginSize * 2;
    setOptionWidth(availableWidth / maxOptions);
  }, [hotspots]);

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

  let backgroundImage = new Image();
  useEffect(() => {
    backgroundImage.src = hotspotsImage;
    calculateCanvasSize(backgroundImage.width, backgroundImage.height);
  }, [hotspotsImage]);

  let [hasBaked, setHasBaked] = useState(false);
  useEffect(() => {
    if (!hasBaked) {
      console.log("we are fucking screwed");

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      for (let hs of hotspots) {
        if (hs.outlinePoints.length == 0) continue;

        clearCanvas();

        context.strokeStyle = arrayToRgba([255, 0, 0, 0], false);
        context.lineWidth = outlineThickness;
        context.lineCap = "round";
        context.lineJoin = "round";

        context.beginPath();
        context.moveTo(hs.outlinePoints[0].x, hs.outlinePoints[0].y);
        for (let i = 1; i < hs.outlinePoints.length; i++) {
          let point = hs.outlinePoints[i];
          context.lineTo(point.x, point.y);
        }
        //context.closePath();
        context.stroke();
        context.fill();

        console.log("are we getting here?");

        //hs.mask = canvas.toDataURL("image/png");
        hs.mask = "HI";
        setHotspots(hotspotsClone);
      }
      clearCanvas();
      drawOutlines();

      setHasBaked(true);
    }
  }, [hasBaked]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add click event listener
    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [canvasDimensions, hotspotsImage, hotspots]);

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
      context.moveTo(hotspot.outlinePoints[0].x, hotspot.outlinePoints[0].y);
      for (let i = 1; i < hotspot.outlinePoints.length; i++) {
        let point = hotspot.outlinePoints[i];
        context.lineTo(point.x, point.y);
      }
      //context.closePath();
      context.stroke();
      //context.fill();
    }
  };

  useEffect(() => {
    drawOutlines;
  }, [focusID]);

  const handleCanvasClick = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log("at least we click");
    console.log(hotspots);
    // Determine which mask was clicked
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

        // Check if the clicked pixel is semi-transparent
        if (imageData[0] > 0) {
          //Currently the masks will be red!
          setFocusID(hotspots[i].id);
          console.log("Hotspot " + hotspots[i].id + " has been clicked!");
          return;
        }
      };
    }
  };

  const style: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    backgroundImage: `url(${hotspotsImage})`,
  };
  const optionStyle: React.CSSProperties = {
    marginLeft: marginSize + "px",
    marginRight: marginSize + "px",
    width: optionWidth,
  };

  if (vsdMode == 3) {
    return (
      <div id="VSD-image-div">
        <div id="VSD-image">
          <canvas
            ref={canvasRef}
            id="VSD-canvas"
            width={canvasDimensions[0]}
            height={canvasDimensions[1]}
            style={style}
            className="canvas"
          />
        </div>
        <div id="VSD-options-div">
          <div id="VSD-options">
            {focusedHotspot
              ? focusedHotspot.options.map((option) => (
                  <button className="vsd-option" style={optionStyle}>
                    {option}
                  </button>
                ))
              : null}
          </div>
        </div>
      </div>
    );
  }
}

export default VSDImage;
