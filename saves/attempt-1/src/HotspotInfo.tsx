import "./HotSpotInfo.css";

export interface HotSpotData {
  hotspotName: string;
  options: string[];
  setFocusID: (x: number) => void;
  setHotspotDeletion: (id: number) => void;
  focusID: number;
  id: number;
}

function HotSpotInfo({
  hotspotName,
  options,
  setFocusID,
  focusID,
  id,
  setHotspotDeletion,
}: HotSpotData) {
  return (
    <div
      className={"hotSpotInfo" + (id === focusID ? " info-focus" : "")}
      onClick={() => setFocusID(id)}
    >
      <button
        type="button"
        className="close-button"
        aria-label="Close"
        onClick={(event) => {
          event.stopPropagation();
          setHotspotDeletion(id);
        }}
      >
        x
      </button>
      <h2 className="hotspotName">{hotspotName}</h2>
      <ul className="options">
        {options.map((option, index) => (
          <li className="option" key={index}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HotSpotInfo;
