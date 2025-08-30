// src/components/LayerControls.jsx
import React from "react";
import { FiLayers, FiFilter } from "react-icons/fi";

const LayerControls = ({ activeLayer, setActiveLayer, layers, toggleLayer }) => {
  // Map styles
  const mapStyles = {
    streets: "mapbox://styles/mapbox/streets-v11",
    satellite: "mapbox://styles/mapbox/satellite-streets-v11",
    dark: "mapbox://styles/mapbox/dark-v10",
    light: "mapbox://styles/mapbox/light-v10"
  };

  return (
    <div className="p-4 overflow-y-auto flex-1">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <FiLayers className="mr-2" /> Map Styles
      </h3>
      <div className="space-y-2 mb-4">
        {Object.entries(mapStyles).map(([key, _]) => (
          <button
            key={key}
            onClick={() => setActiveLayer(key)}
            className={`w-full text-left px-3 py-2 rounded text-sm flex items-center ${
              activeLayer === key
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="capitalize">{key}</span>
          </button>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <FiFilter className="mr-2" /> Data Layers
      </h3>
      <div className="space-y-2">
        {Object.entries(layers).map(([id, layer]) => (
          <label
            key={id}
            className="flex items-center space-x-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded"
              checked={layer.visible}
              onChange={() => toggleLayer(id)}
            />
            <span>{layer.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default LayerControls;
