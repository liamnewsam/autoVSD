import "../style/HotspotMenu.css";

interface MenuData {
  setAppState: (x: number) => void;
}

function HotspotMenu({ setAppState }: MenuData) {
  return (
    <div className="menu-div">
      <button className="hotspot-menu-button">Archive</button>
      <button className="hotspot-menu-button" onClick={() => setAppState(1)}>
        New VSD
      </button>
      <button
        className="hotspot-menu-button accented-hotspot-menu-button"
        onClick={() => setAppState(4)}
      >
        Send VSD
      </button>
    </div>
  );
}

export default HotspotMenu;
