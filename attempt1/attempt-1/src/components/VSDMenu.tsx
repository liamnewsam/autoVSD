import Hotspot from "./interfaces";
import "../style/VSDMenu.css";

interface VSDMenuData {
  setAppState: (x: number) => void;
}

function VSDMenu({ setAppState }: VSDMenuData) {
  return (
    <div id="menu-div">
      <button
        className="menu-button accented-VSD-menu-button"
        onClick={() => setAppState(1)}
      >
        New VSD
      </button>
      <button className="menu-button">Archive</button>
    </div>
  );
}

export default VSDMenu;
