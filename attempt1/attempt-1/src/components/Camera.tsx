import { useRef } from "react";

import "../style/Camera.css";

interface CameraProps {
  setHotspotImage: (img: string) => void;
}

function Camera({ setHotspotImage }: CameraProps) {
  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  //let streaming = false;

  let video: HTMLVideoElement;
  let canvas: HTMLCanvasElement;
  let div: HTMLDivElement;
  //let photo: HTMLImageElement;

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((mediaStream) => {
      video = document.getElementById("video") as HTMLVideoElement;
      canvas = document.getElementById("camera-canvas") as HTMLCanvasElement;
      div = document.getElementById(
        "camera-canvas-container"
      ) as HTMLDivElement;
      //photo = document.getElementById("photo") as HTMLImageElement;
      if (video === null || canvas === null || div === null) return;
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        const videoAspectRatio = video.videoWidth / video.videoHeight;

        // Determine the max width and height based on viewport dimensions
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

        console.log("Video metadata loaded:", {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });
        //streaming = true;
        video.play();
      };
    })
    .catch((err) => {
      // always check for errors at the end.
      console.error(`${err.name}: ${err.message}`);
    });

  // Fill the photo with an indication that none has been
  // captured.

  /*function clearphoto() {
    setHotspotImage("");
  }*/

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takePicture() {
    const context = canvas.getContext("2d");
    if (context == null) return;
    context.drawImage(video, 0, 0);

    const data = canvas.toDataURL("image/png");
    setHotspotImage(data);
  }
  //

  const fileInputRef = useRef<HTMLInputElement>(null); // Specify the type explicitly

  const handleButtonClick = () => {
    // Check if fileInputRef.current is not null before calling click()
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Now TypeScript knows fileInputRef.current is an HTMLInputElement
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        console.log("Data URL:", dataUrl);
        // Example: You could use dataUrl in further processing or upload to server
        setHotspotImage(dataUrl);
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
