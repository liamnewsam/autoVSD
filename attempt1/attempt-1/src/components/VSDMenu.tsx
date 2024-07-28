import { Hotspot } from "./interfaces";
import "../style/VSDMenu.css";

interface VSDMenuData {
  activateNewVSD: () => void;
}

function VSDMenu({ activateNewVSD }: VSDMenuData) {
  return (
    <div id="menu-div">
      <button
        className="menu-button accented-VSD-menu-button"
        onClick={() => activateNewVSD()}
      >
        New VSD
      </button>
      <button className="menu-button">Archive</button>
    </div>
  );
}

export default VSDMenu;
