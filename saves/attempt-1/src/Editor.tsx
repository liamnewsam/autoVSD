import "./Editor.css";

interface HotSpotData {
  hotspotName: string;
  options: string[];
  id: number;
  setter: (a: { hotspotName: string; options: string[]; id: number }) => void;
}

function Editor({ hotspotName, options, setter, id }: HotSpotData) {
  return (
    <div className="editor-container">
      <input
        type="text"
        id="hotspotEditor"
        value={hotspotName}
        onChange={(e) =>
          setter({ options: options, id: id, hotspotName: e.target.value })
        }
        className="editor-hotspot-name editor-input"
      />
      <ul className="editor-options">
        {options.map((option: string, index: number) => (
          <li className="editor-option" key={index}>
            <input
              type="text"
              value={option}
              onChange={(e) => {
                options[index] = e.target.value;
                setter({ options: options, id: id, hotspotName: hotspotName });
              }}
              className="editor-input"
            />
            <button
              className="editor-option-delete"
              onClick={() => {
                delete options[index];
                setter({ options: options, id: id, hotspotName: hotspotName });
              }}
            >
              x
            </button>
          </li>
        ))}
        <li className="editor-option editor-option-add-list-item">
          <button
            className="editor-option-add"
            onClick={() => {
              options.push("");
              setter({ options: options, id: id, hotspotName: hotspotName });
              console.log("I've been PUSHEDD");
            }}
          >
            +
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Editor;
