import { useState, useEffect, useMemo } from "react";
import "./App.css";
import "./HotSpotInfo.css";
import HotSpotInfo from "./HotspotInfo";
//import type { HotSpotData } from "./HotspotInfo";
import Editor from "./Editor";
import ImageDraw from "./ImageDraw.tsx";
import data from "./data.json";
import Hotspot from "./interfaces.tsx";
import { getRandomInt, indexOf, myHotspot } from "./functions.tsx";
import imageObject from "./ex1.png";

function App() {
  //console.log("oh boy");
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

  return (
    <div id="container">
      <div id="left-half">
        <div id="image-container">
          <ImageDraw
            image={imageObject}
            hotspots={hotspots}
            hotspotsClone={hotspotsClone}
            setHotspots={setHotspots}
            focusID={focusHotSpotID}
          />
        </div>
        <div id="editor">
          <Editor
            hotspots={hotspots}
            hotspotsClone={hotspotsClone}
            setHotspots={setHotspots}
            focusID={focusHotSpotID}
          />
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
          className="hotSpotInfo"
          onClick={() => {
            hotspotsClone.push({
              hotspotName: "Hotspot",
              options: ["option1", "option2", "option3"],
              id: getRandomInt(0, 500),
              points: [],
            });
            setHotspots(hotspotsClone);
            console.log("add!");
          }}
        ></div>
      </div>
    </div>
  );
}

export default App;
