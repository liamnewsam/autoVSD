import "../style/HotspotMenu.css";

interface MenuData {
  activateSendVSD: () => void;
  activateNewVSD: () => void;
}

function HotspotMenu({ activateSendVSD, activateNewVSD }: MenuData) {
  return (
    <div className="menu-div">
      <button className="hotspot-menu-button">Archive</button>
      <button className="hotspot-menu-button" onClick={() => activateNewVSD()}>
        New VSD
      </button>
      <button
        className="hotspot-menu-button accented-hotspot-menu-button"
        onClick={() => activateSendVSD()}
      >
        Send VSD
      </button>
    </div>
  );
}

export default HotspotMenu;
