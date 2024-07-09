import { useRef, useState, useEffect } from "react";
import Hotspot from "./interfaces";
import "../style/VSDImage.css";
import { myHotspot } from "./functions";

let marginSize = 10;

interface VSDImageData {
  hotspotsImage: string;
  hotspots: Hotspot[];
  focusID: number;
  setFocusID: (x: number) => void;
  vsdMode: number;
}

function VSDImage({
  hotspotsImage,
  hotspots,
  focusID,
  setFocusID,
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add click event listener
    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [canvasDimensions, hotspotsImage, hotspots]);

  const handleCanvasClick = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determine which mask was clicked
    for (let i = 0; i < hotspots.length; i++) {
      const maskImg = new Image();
      maskImg.src = hotspots[i].defaultMask;

      maskImg.onload = () => {
        const maskCanvas = document.createElement("canvas");
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) return;
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        const imageData = maskCtx.getImageData(x, y, 1, 1).data;

        // Check if the clicked pixel is semi-transparent
        if (imageData[3] > 0) {
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
