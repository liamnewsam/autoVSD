import "../style/HotSpotInfo.css";
import { Hotspot } from "./interfaces.tsx";
import { indexOf, myHotspot, arrayToRGB } from "./functions.tsx";

export interface HotSpotData {
  hotspots: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  setFocusID: (x: string) => void;
  //setHotspotDeletion: (id: number) => void;

  focusID: string;
  id: string;
}

function HotSpotInfo({
  hotspots,
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
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            setHotspots(hotspots.filter((_, index) => index !== hsIndex));
            setFocusID("");
          }}
        >
          ⨯
        </button>
        <h2 className="hotspotName">{hs.hotspotName}</h2>
        <ul className="options">
          {hs.options.map((option: string, index: number) => (
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
