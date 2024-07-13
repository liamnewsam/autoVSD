import { useState, useEffect } from "react";

import "../style/App.css";
import "../style/HotSpotInfo.css";

import HotSpotInfo from "./HotspotInfo.tsx";
import Editor from "./Editor.tsx";
import ImageDraw from "./ImageDraw.tsx";
import Camera from "./Camera.tsx";
import HotspotMenu from "./HotspotMenu.tsx";
import Hotspot from "./interfaces.tsx";
import { RGB } from "./interfaces.tsx";
import InteractiveVSD from "./InteractiveVSD.tsx";
import { getRandomInt } from "./functions.tsx";
import LoadingOverlay from "./LoadingOverlay.tsx";

import sampleVSDData from "../assets/sampleVSD.json";

//import imageObject from "../assets/ex1.png";

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

let colors: [defaultColor: RGB, focusColor: RGB][] = [
  [
    [255, 235, 238],
    [255, 205, 210],
  ], // Light Pink
  [
    [248, 187, 208],
    [244, 143, 177],
  ], // Light Pink 2
  [
    [209, 196, 233],
    [179, 157, 219],
  ], // Light Purple
  [
    [197, 202, 233],
    [159, 168, 218],
  ], // Light Indigo
  [
    [187, 222, 251],
    [144, 202, 249],
  ], // Light Blue
  [
    [179, 229, 252],
    [129, 212, 250],
  ], // Light Sky Blue
  [
    [178, 235, 242],
    [128, 222, 234],
  ], // Light Cyan
  [
    [178, 223, 219],
    [128, 203, 196],
  ], // Light Teal
  [
    [197, 225, 165],
    [174, 213, 129],
  ], // Light Green
  [
    [230, 238, 156],
    [220, 231, 117],
  ], // Light Lime
  [
    [255, 245, 157],
    [255, 241, 118],
  ], // Light Yellow
  [
    [255, 224, 178],
    [255, 204, 128],
  ], // Light Orange
  [
    [255, 204, 188],
    [255, 171, 145],
  ], // Light Deep Orange
];
let colorsCopy: [defaultColor: RGB, focusColor: RGB][];

function App() {
  // App State:
  //              1 = taking photo
  //              2 = loading screen
  //              3 = editing hotspot
  //              4 = sending vsd
  //              5 = final hotspot

  // Change these States into individual screen states, like CameraState, EditState, VSDState, and have them be boolean!

  let [appState, setAppState] = useState(1);
  let [hotspotImage, setHotspotImage] = useState("");
  let [hotspots, setHotspots] = useState<Hotspot[]>([]);
  //console.log(hotspots);
  let hotspotsClone = structuredClone(hotspots);
  let [focusHotSpotID, setFocusHotSpotID] = useState("");

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
            color: colorsCopy.pop(),
            outlinePoints: [],
          })
        )
      ); // Set response data in state
      colors = colors.slice(hotspots.length);
      setAppState(3);
    } catch (error) {
      console.error("Error sending data:", error);
      // Handle error state if needed
    }
  };

  console.log(hotspots);

  useEffect(() => {
    if (hotspotImage) {
      setAppState(2);
      sendImageToBackend();
    }
  }, [hotspotImage]);

  useEffect(() => {
    if (appState == 1) {
      setHotspotImage("");
      setHotspots([]);
      setFocusHotSpotID("");
      colorsCopy = [...colors];
      colorsCopy = shuffle(colorsCopy);
    }

    if (appState == 5) {
      /*
      fetch("http://localhost:5000/api/send-VSD", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hotspots: hotspots, image: hotspotImage }),
      });*/
      setFocusHotSpotID("");
    }
  }, [appState]);

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
  /*
  if (appState == 2) {
    return <div>Loading</div>;
  }*/
  if (appState == 2 || appState == 3) {
    return (
      <>
        {appState == 2 && <LoadingOverlay />}
        <div id="container">
          <div id="left-half">
            <div id="editor-container">
              <Editor
                hotspots={hotspots}
                hotspotsClone={hotspotsClone}
                setHotspots={setHotspots}
                focusID={focusHotSpotID}
              />
            </div>
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
            <div id="hotspot-menu-container">
              <HotspotMenu setAppState={setAppState} />
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
                    id: crypto.randomUUID(),
                    color: colorsCopy.pop() || [
                      [0, 0, 0],
                      [0, 0, 0],
                    ],
                    outlinePoints: [],
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
      </>
    );
  }
  if (appState == 4) {
    setTimeout(() => {
      setAppState(5);
    }, 2000);
    return (
      <div className="sending-vsd-loading-screen">Sending VSD to User</div>
    );
  }
  if (appState == 5) {
    return (
      <InteractiveVSD
        hotspots={hotspots}
        hotspotsClone={hotspotsClone}
        hotspotsImage={hotspotImage}
        setAppState={setAppState}
        focusID={focusHotSpotID}
        setFocusID={setFocusHotSpotID}
        setHotspots={setHotspots}
      />
    );
  }
}

export default App;
