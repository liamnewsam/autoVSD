import "../style/HotSpotInfo.css";
import Hotspot from "./interfaces.tsx";
import { indexOf, myHotspot, arrayToRGB } from "./functions.tsx";

export interface HotSpotData {
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  setFocusID: (x: string) => void;
  //setHotspotDeletion: (id: number) => void;

  focusID: string;
  id: string;
}

function HotSpotInfo({
  hotspots,
  hotspotsClone,
  setHotspots,
  setFocusID,
  focusID,
  id,
}: HotSpotData) {
  let hs = myHotspot(id, hotspots);
  let hsIndex = indexOf(id, hotspots);

  if (hs) {
    return (
      <div
        className={
          "hotSpotInfo" + (hs.outlinePoints.length > 0 ? " has-mask" : "")
        }
        onClick={() => setFocusID(id)}
        style={{
          borderColor:
            id === focusID ? arrayToRGB(hs.color[1]) : arrayToRGB(hs.color[0]),
        }}
      >
        <button
          type="button"
          className="close-button"
          aria-label="Close"
          onClick={(event) => {
            event.stopPropagation();
            hotspotsClone.splice(hsIndex, 1);
            setHotspots(hotspotsClone);
            setFocusID("");
          }}
        >
          x
        </button>
        <h2 className="hotspotName">{hs.hotspotName}</h2>
        <ul className="options">
          {hs.options.map((option, index) => (
            <li className="option" key={index}>
              {option}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default HotSpotInfo;
