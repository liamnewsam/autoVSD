import { useRef } from "react";

import "../style/Camera.css";

interface CameraProps {
  setHotspotImage: (img: string) => void;
}

function Camera({ setHotspotImage }: CameraProps) {
  let video: HTMLVideoElement;
  let canvas: HTMLCanvasElement;
  let div: HTMLDivElement;

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((mediaStream) => {
      video = document.getElementById("video") as HTMLVideoElement;
      canvas = document.getElementById("camera-canvas") as HTMLCanvasElement;
      div = document.getElementById(
        "camera-canvas-container"
      ) as HTMLDivElement;

      if (video === null || canvas === null || div === null) return;

      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        const containerAspectRatio = maxWidth / maxHeight;

        if (containerAspectRatio > videoAspectRatio) {
          div.style.width = maxHeight * videoAspectRatio + "px";
          div.style.height = maxHeight + "px";
        } else {
          div.style.width = maxWidth + "px";
          div.style.height = maxWidth / videoAspectRatio + "px";
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        video.play();
      };
    })
    .catch((err) => {
      console.error(`${err.name}: ${err.message}`);
    });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  function takePicture() {
    const context = canvas.getContext("2d");
    if (context == null) return;
    context.drawImage(video, 0, 0);

    const data = canvas.toDataURL("image/png");
    setHotspotImage(data);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const img = new Image();
          img.onload = () => {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const ctx = tempCanvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, img.width, img.height);

              setHotspotImage(tempCanvas.toDataURL("image/png"));
            }
          };
          img.src = e.target.result.toString();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="camera-canvas-container">
      <video id="video" />
      <div id="start-button-ring">
        <button id="start-button" onClick={() => takePicture()}>
          H
        </button>
      </div>
      <button id="upload-button" onClick={handleButtonClick}>
        Upload Image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        id="file-input"
      />
      <canvas id="camera-canvas" />
    </div>
  );
}

export default Camera;
