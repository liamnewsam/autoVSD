import { useRef } from "react";
import Hotspot from "./interfaces";
import VSDMenu from "./VSDMenu.tsx";
import VSDImage from "./VSDImage.tsx";
import "../style/InteractiveVSD.css";

interface InteractiveVSDData {
  hotspotsImage: string;
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  setAppState: (x: number) => void;
  focusID: string;
  setFocusID: (x: string) => void;
  setHotspots: (x: Hotspot[]) => void;
}

function InteractiveVSD({
  hotspotsImage,
  hotspots,
  hotspotsClone,
  setAppState,
  focusID,
  setFocusID,
  setHotspots,
}: InteractiveVSDData) {
  hotspots;
  return (
    <div id="VSD-div">
      <VSDMenu setAppState={setAppState} />
      <VSDImage
        hotspotsImage={hotspotsImage}
        hotspots={hotspots}
        hotspotsClone={hotspotsClone}
        focusID={focusID}
        setFocusID={setFocusID}
        setHotspots={setHotspots}
        vsdMode={3}
      />
    </div>
  );
}

export default InteractiveVSD;
