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
  //let photo: HTMLImageElement;

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((mediaStream) => {
      video = document.getElementById("video") as HTMLVideoElement;
      canvas = document.getElementById("camera-canvas") as HTMLCanvasElement;
      //photo = document.getElementById("photo") as HTMLImageElement;
      if (video === null || canvas === null) return;
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.setAttribute("width", "100%");
        video.setAttribute("height", "100%");
        video.setAttribute("maxWidth", "100%");
        video.setAttribute("maxHeight", "100%");

        canvas.setAttribute("width", video.videoWidth + "px");
        canvas.setAttribute("height", video.videoHeight + "px");

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

  return (
    <>
      <video id="video" />
      <button id="start-button" onClick={() => takePicture()}>
        H
      </button>
      <canvas id="camera-canvas" />
    </>
  );
}

export default Camera;
