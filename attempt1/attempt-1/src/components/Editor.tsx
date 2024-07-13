import "../style/Editor.css";

import Hotspot from "./interfaces";
import { indexOf, myHotspot } from "./functions.tsx";

export interface HotSpotData {
  hotspots: Hotspot[];
  hotspotsClone: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;

  focusID: string;
}

function Editor({
  hotspots,
  hotspotsClone,
  setHotspots,
  focusID,
}: HotSpotData) {
  let hs = myHotspot(focusID, hotspots);
  let hsIndex = indexOf(focusID, hotspots);
  if (hsIndex >= 0 && hs) {
    return (
      <div className="editor-container">
        <input
          type="text"
          id="hotspotEditor"
          value={hs.hotspotName}
          onChange={(e) => {
            hotspotsClone[hsIndex].hotspotName = e.target.value;
            setHotspots(hotspotsClone);
          }}
          className="editor-hotspot-name editor-input"
        />
        <ul className="editor-options">
          {hs.options.map((option: string, index: number) => (
            <li className="editor-option" key={index}>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  hotspotsClone[hsIndex].options[index] = e.target.value;
                  setHotspots(hotspotsClone);
                  console.log("whel");
                }}
                className="editor-input"
              />
              <button
                className="editor-option-button delete-button"
                onClick={() => {
                  hotspotsClone[hsIndex].options.splice(index, 1);
                  setHotspots(hotspotsClone);
                }}
              >
                x
              </button>
            </li>
          ))}
          <li className="editor-option editor-option-add-list-item">
            <button
              className="editor-option-button add-button"
              onClick={() => {
                if (hs.options.length < 4) {
                  hotspotsClone[hsIndex].options.push("");
                  setHotspots(hotspotsClone);
                  console.log("I've been PUSHEDD");
                }
              }}
            >
              +
            </button>
          </li>
        </ul>
      </div>
    );
  } else {
    return <div className="empty-editor-text">Select Hotspot To Edit</div>;
  }
}

export default Editor;
