import { useState, useEffect, useMemo } from "react";

import "../style/App.css";
import "../style/HotSpotInfo.css";

import HotSpotInfo from "./HotspotInfo.tsx";
import Editor from "./Editor.tsx";
import ImageDraw from "./ImageDraw.tsx";
import Camera from "./Camera.tsx";
import HotspotMenu from "./HotspotMenu.tsx";
import Hotspot from "./interfaces.tsx";
import { getRandomInt, indexOf, myHotspot } from "./functions.tsx";

import data from "../assets/data.json";
//import imageObject from "../assets/ex1.png";

function App() {
  // App State:
  //              1 = taking photo
  //              2 = editing hotspot
  //              3 = final hotspot

  let [appState, setAppState] = useState(2);
  let [hotspotImage, setHotspotImage] = useState("");

  useEffect(() => {
    if (hotspotImage) {
      setAppState(2);
    }
  }, [hotspotImage]);
  let [hotspots, setHotspots] = useState<Hotspot[]>(
    data.map((hs) => {
      return {
        hotspotName: hs.hotspotName,
        options: hs.options,
        id: getRandomInt(0, 500),
        points: [],
      };
    })
  );

  let hotspotsClone = structuredClone(hotspots);

  let [focusHotSpotID, setFocusHotSpotID] = useState(-1);
  /*useEffect(() => {
    let deleteIndex = indexOf(hotspotDeletion, hotspots);
    setHotspots(
      hotspots.filter((hotspot) => hotspot.id !== hotspots[deleteIndex].id)
    );

    //hotspotSetters.splice(deleteIndex, deleteIndex);
    console.log("what?");
    setFocusHotSpotID(-1);
  }, [hotspotDeletion]);*/
  if (appState == 1) {
    return (
      <div id="camera-container">
        <Camera setHotspotImage={setHotspotImage} />
      </div>
    );
  }

  if (appState == 2) {
    return (
      <div id="container">
        <div id="left-half">
          <div id="image-container">
            <ImageDraw
              //hotspotImage={hotspotImage}
              hotspotImage={hotspotImage}
              hotspots={hotspots}
              hotspotsClone={hotspotsClone}
              setHotspots={setHotspots}
              focusID={focusHotSpotID}
            />
          </div>
          <div id="editor-container">
            <Editor
              hotspots={hotspots}
              hotspotsClone={hotspotsClone}
              setHotspots={setHotspots}
              focusID={focusHotSpotID}
            />
          </div>
          <div id="hotspot-menu-container">
            <HotspotMenu />
          </div>
        </div>
        <div id="right-half">
          {hotspots.map((items, index) => (
            <HotSpotInfo
              hotspots={hotspots}
              hotspotsClone={hotspotsClone}
              setHotspots={setHotspots}
              setFocusID={setFocusHotSpotID}
              focusID={focusHotSpotID}
              id={items.id}
              key={index}
            />
          ))}
          <div
            className="add-hotspot"
            onClick={() => {
              if (hotspots.length < 6) {
                hotspotsClone.push({
                  hotspotName: "Hotspot",
                  options: ["option1", "option2", "option3"],
                  id: getRandomInt(0, 500),
                  points: [],
                });
                setHotspots(hotspotsClone);
                console.log("add!");
              }
            }}
          >
            +
          </div>
        </div>
      </div>
    );
  }
}

export default App;
