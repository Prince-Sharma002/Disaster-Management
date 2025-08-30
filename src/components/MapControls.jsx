// src/components/MapControls.jsx
import React from "react";
import { FiPlus, FiMinus, FiCompass } from "react-icons/fi";

const MapControls = ({ map }) => {
  const zoomIn = () => map.current?.zoomIn();
  const zoomOut = () => map.current?.zoomOut();
  const resetNorth = () => map.current?.resetNorth();

  return (
    <div className="absolute right-4 bottom-20 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200">
      <button
        onClick={zoomIn}
        className="p-2 hover:bg-gray-100 block w-10 h-10 flex items-center justify-center text-gray-700"
        title="Zoom in"
      >
        <FiPlus className="w-4 h-4" />
      </button>
      <div className="border-t border-gray-200"></div>
      <button
        onClick={zoomOut}
        className="p-2 hover:bg-gray-100 block w-10 h-10 flex items-center justify-center text-gray-700"
        title="Zoom out"
      >
        <FiMinus className="w-4 h-4" />
      </button>
      <div className="border-t border-gray-200"></div>
      <button
        onClick={resetNorth}
        className="p-2 hover:bg-gray-100 block w-10 h-10 flex items-center justify-center text-gray-700"
        title="Reset North"
      >
        <FiCompass className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MapControls;
