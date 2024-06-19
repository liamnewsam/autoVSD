import { useState, useEffect, useMemo } from "react";
import "./App.css";
import "./HotSpotInfo.css";
import HotSpotInfo from "./HotspotInfo";
//import type { HotSpotData } from "./HotspotInfo";
import Editor from "./Editor";
import data from "./data.json";

interface HotSpotData {
  hotspotName: string;
  options: string[];
  id: number;
}

function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function indexOf(id: number, myArray: HotSpotData[]) {
  for (let i = 0; i < myArray.length; i++) {
    if (myArray[i].id === id) {
      return i;
    }
  }
  return -1;
}

function App() {
  console.log("oh boy");
  //const hotspots: HotSpotData[] = [];
  let [hotspots, setHotspots] = useState<HotSpotData[]>([]);
  let [hotspotSetters, setHotspotSetters] = useState<
    React.Dispatch<React.SetStateAction<HotSpotData>>[]
  >([]);

  let tempHotspots = [];
  let tempHotspotSetters = [];
  for (let hs of data) {
    let [hotSpot, setHotSpot] = useState({
      hotspotName: hs.hotspotName,
      options: hs.options,
      id: getRandomInt(0, 500),
    });
    tempHotspots.push(hotSpot);
    tempHotspotSetters.push(setHotSpot);
  }
  setHotspots(tempHotspots);
  setHotspotSetters(tempHotspotSetters);

  let [focusHotSpotID, setFocusHotSpotID] = useState(-1);
  let focusIndex = indexOf(focusHotSpotID, hotspots);
  let focusHotSpot, focusSetter;
  if (focusIndex >= 0) {
    focusHotSpot = hotspots[focusIndex];
    focusSetter = hotspotSetters[focusIndex];
    //console.log(hotspots);
  }

  let [hotspotDeletion, setHotspotDeletion] = useState(-1);
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
        <div id="image"></div>
        <div id="editor">
          {focusHotSpot && focusSetter ? (
            <Editor
              hotspotName={focusHotSpot.hotspotName}
              options={focusHotSpot.options}
              setter={focusSetter}
              id={focusHotSpot.id}
            />
          ) : (
            <div />
          )}
        </div>
      </div>
      <div id="right-half">
        {hotspots.map((items, index) => (
          <HotSpotInfo
            hotspotName={items.hotspotName}
            options={items.options}
            setFocusID={setFocusHotSpotID}
            focusID={focusHotSpotID}
            id={items.id}
            key={index}
            setHotspotDeletion={setHotspotDeletion}
          />
        ))}
        <div className="hotSpotInfo" onClick={() => console.log("add!")}></div>
      </div>
    </div>
  );
}

export default App;
