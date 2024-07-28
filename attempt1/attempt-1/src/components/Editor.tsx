import React, { useEffect } from "react";
import "../style/Editor.css";
import { Hotspot } from "./interfaces";
import { indexOf, myHotspot } from "./functions";

export interface HotSpotData {
  hotspots: Hotspot[];
  setHotspots: (x: Hotspot[]) => void;
  focusID: string;
}

function Editor({
  hotspots,

  setHotspots,
  focusID,
}: HotSpotData) {
  let hs = myHotspot(focusID, hotspots);
  let hsIndex = indexOf(focusID, hotspots);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement;
      target.value = "";
    };

    // Select all input elements
    const inputElements =
      document.querySelectorAll<HTMLInputElement>(".clear-on-focus");

    // Add event listener to each input element
    inputElements.forEach((input) => {
      input.addEventListener("focus", handleFocus);
    });

    // Clean up event listeners on component unmount
    return () => {
      inputElements.forEach((input) => {
        input.removeEventListener("focus", handleFocus);
      });
    };
  }, [hotspots, focusID]);

  if (hsIndex >= 0 && hs) {
    return (
      <div className="editor-container">
        <input
          type="text"
          id="hotspotEditor"
          value={hs.hotspotName}
          onChange={(e) => {
            const updatedHotspots = hotspots.map((hotspot, index) =>
              index === hsIndex
                ? { ...hotspot, hotspotName: e.target.value }
                : hotspot
            );
            setHotspots(updatedHotspots);
          }}
          className="editor-hotspot-name editor-input clear-on-focus"
        />
        <ul className="editor-options">
          {hs.options.map((option: string, index: number) => (
            <li className="editor-option" key={index}>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const updatedHotspots = hotspots.map((hotspot, index) =>
                    index === hsIndex
                      ? {
                          ...hotspot,
                          options: hotspot.options.map((option, optIndex) =>
                            optIndex === index ? e.target.value : option
                          ),
                        }
                      : hotspot
                  );
                  setHotspots(updatedHotspots);
                }}
                className="editor-input clear-on-focus"
              />
              <button
                className="editor-option-button delete-button"
                onClick={() => {
                  const updatedHotspots = hotspots.map((hotspot, index) =>
                    index === hsIndex
                      ? {
                          ...hotspot,
                          options: hotspot.options.filter(
                            (_, optIndex) => optIndex !== index
                          ),
                        }
                      : hotspot
                  );
                  setHotspots(updatedHotspots);
                }}
              >
                ⨯
              </button>
            </li>
          ))}
          <li className="editor-option editor-option-add-list-item">
            <button
              className="editor-option-button add-button"
              onClick={() => {
                if (hs.options.length < 4) {
                  const updatedHotspots = hotspots.map(
                    (hotspot, hotspotIndex) =>
                      hotspotIndex === hsIndex
                        ? { ...hotspot, options: [...hotspot.options, ""] }
                        : hotspot
                  );
                  setHotspots(updatedHotspots);
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
