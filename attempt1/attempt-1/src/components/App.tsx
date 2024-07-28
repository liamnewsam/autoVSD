import { useState, useEffect } from "react";
import "../style/App.css";
import "../style/HotSpotInfo.css";

import HotSpotInfo from "./HotspotInfo.tsx";
import Editor from "./Editor.tsx";
import ImageDraw from "./ImageDraw.tsx";
import Camera from "./Camera.tsx";
import HotspotMenu from "./HotspotMenu.tsx";
import { Hotspot, RGB } from "./interfaces.tsx";
import InteractiveVSD from "./InteractiveVSD.tsx";
import { getRandomInt, shuffle } from "./functions.tsx";
import LoadingOverlay from "./LoadingOverlay.tsx";

import sampleVSDData from "../assets/sampleVSD.json";
import { initialColors } from "./colors.tsx";

function App() {
  const [isCameraState, setIsCameraState] = useState(true);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isEditingState, setIsEditingState] = useState(false);
  const [isSendingState, setIsSendingState] = useState(false);
  const [isFinalState, setIsFinalState] = useState(false);

  const [hotspotImage, setHotspotImage] = useState("");
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [focusHotSpotID, setFocusHotSpotID] = useState("");
  const [colors, setColors] = useState(initialColors);

  const sendImageToBackend = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/send-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hotspotImage),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      setHotspots(
        responseData.map(
          (datum: { hotspotName: string; options: string[] }, i: number) => ({
            hotspotName: datum.hotspotName,
            options: datum.options,
            id: crypto.randomUUID(),
            color: colors.pop(),
            outlinePoints: [],
          })
        )
      );
      setColors(colors.slice(hotspots.length));
      setIsLoadingState(false);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const resetAppStates = () => {
    setIsCameraState(false);
    setIsEditingState(false);
    setIsFinalState(false);
    setIsLoadingState(false);
    setIsSendingState(false);
  };

  useEffect(() => {
    if (hotspotImage) {
      setIsCameraState(false);
      setIsEditingState(true);
      setIsLoadingState(true);
      sendImageToBackend();
    }
  }, [hotspotImage]);

  const activateNewVSD = () => {
    setHotspotImage("");
    setHotspots([]);
    setFocusHotSpotID("");
    setColors(shuffle([...initialColors]));

    resetAppStates();
    setIsCameraState(true);
  };

  const activateSendVSD = () => {
    setTimeout(() => {
      setFocusHotSpotID("");
      setIsSendingState(false);
      setIsFinalState(true);
    }, 2000);
    setIsEditingState(false);
    setIsSendingState(true);
  };

  const renderCamera = () => (
    <div id="camera-container">
      <Camera setHotspotImage={setHotspotImage} />
    </div>
  );

  const renderEditor = () => (
    <>
      {isLoadingState && <LoadingOverlay />}
      <div id="container">
        <div id="top-half">
          <div id="top-left-div">
            <div id="editor-container">
              <Editor
                hotspots={hotspots}
                setHotspots={setHotspots}
                focusID={focusHotSpotID}
              />
            </div>
            <div id="hotspot-menu-container">
              <HotspotMenu
                activateSendVSD={activateSendVSD}
                activateNewVSD={activateNewVSD}
              />
            </div>
          </div>
          <div id="image-container">
            <ImageDraw
              hotspotImage={hotspotImage}
              hotspots={hotspots}
              setHotspots={setHotspots}
              focusID={focusHotSpotID}
            />
          </div>
        </div>
        <div id="hotspots-container">
          {hotspots.map((items, index) => (
            <HotSpotInfo
              key={index}
              hotspots={hotspots}
              setHotspots={setHotspots}
              setFocusID={setFocusHotSpotID}
              focusID={focusHotSpotID}
              id={items.id}
            />
          ))}
          <div
            className="hotSpotInfo add-hotspot"
            onClick={() => {
              if (hotspots.length < 6) {
                setHotspots([
                  ...hotspots,
                  {
                    hotspotName: "Hotspot",
                    options: ["option1", "option2", "option3"],
                    id: crypto.randomUUID(),
                    color: colors.pop() || [
                      [0, 0, 0],
                      [0, 0, 0],
                    ],
                    outlinePoints: [],
                  },
                ]);
                console.log("add!");
              }
            }}
          >
            +
          </div>
        </div>
      </div>
    </>
  );

  const renderSending = () => {
    return (
      <div className="sending-vsd-loading-screen">Sending VSD to User</div>
    );
  };

  const renderFinal = () => (
    <InteractiveVSD
      hotspots={hotspots}
      hotspotsImage={hotspotImage}
      activateNewVSD={activateNewVSD}
      focusID={focusHotSpotID}
      setFocusID={setFocusHotSpotID}
      setHotspots={setHotspots}
    />
  );

  if (isCameraState) return renderCamera();
  if (isLoadingState || isEditingState) return renderEditor();
  if (isSendingState) return renderSending();
  if (isFinalState) return renderFinal();

  return null; // Default return in case no state matches
}

export default App;
