import { useRef } from "react";
import Hotspot from "./interfaces";
import VSDMenu from "./VSDMenu.tsx";
import VSDImage from "./VSDImage.tsx";
import "../style/InteractiveVSD.css";

interface InteractiveVSDData {
  hotspotsImage: string;
  hotspots: Hotspot[];
  setAppState: (x: number) => void;
  focusID: number;
  setFocusID: (x: number) => void;
}

function InteractiveVSD({
  hotspotsImage,
  hotspots,
  setAppState,
  focusID,
  setFocusID,
}: InteractiveVSDData) {
  hotspots;
  return (
    <div id="VSD-div">
      <VSDMenu setAppState={setAppState} />
      <VSDImage
        hotspotsImage={hotspotsImage}
        hotspots={hotspots}
        focusID={focusID}
        setFocusID={setFocusID}
        vsdMode={3}
      />
    </div>
  );
}

export default InteractiveVSD;
