import { useRef } from "react";
import { Hotspot } from "./interfaces";
import VSDMenu from "./VSDMenu.tsx";
import VSDImage from "./VSDImage.tsx";
import "../style/InteractiveVSD.css";

interface InteractiveVSDData {
  hotspotsImage: string;
  hotspots: Hotspot[];
  activateNewVSD: () => void;
  focusID: string;
  setFocusID: (x: string) => void;
  setHotspots: (x: Hotspot[]) => void;
}

function InteractiveVSD({
  hotspotsImage,
  hotspots,
  activateNewVSD,
  focusID,
  setFocusID,
  setHotspots,
}: InteractiveVSDData) {
  hotspots;
  return (
    <div id="VSD-div">
      <VSDImage
        hotspotsImage={hotspotsImage}
        hotspots={hotspots}
        focusID={focusID}
        setFocusID={setFocusID}
        setHotspots={setHotspots}
        vsdMode={3}
      />
      <VSDMenu activateNewVSD={activateNewVSD} />
    </div>
  );
}

export default InteractiveVSD;
