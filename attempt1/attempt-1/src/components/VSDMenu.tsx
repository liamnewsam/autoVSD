import Hotspot from "./interfaces";
import "../style/VSDMenu.css";

interface VSDMenuData {
  setAppState: (x: number) => void;
}

function VSDMenu({ setAppState }: VSDMenuData) {
  console.log("at least we're working");

  return (
    <div id="menu-div">
      <button className="menu-buttons" onClick={() => setAppState(1)}>
        New VSD
      </button>
      <button className="menu-buttons">Archive</button>
    </div>
  );
}

export default VSDMenu;
