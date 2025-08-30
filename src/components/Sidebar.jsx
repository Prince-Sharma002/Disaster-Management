// src/components/Sidebar.jsx
import React from "react";
import { FiMapPin, FiX, FiAlertCircle } from "react-icons/fi";
import SearchBox from "./SearchBox";
import LayerControls from "./LayerControls";

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  selectedSearchCategory, 
  setSelectedSearchCategory, 
  map, 
  activeLayer, 
  setActiveLayer, 
  layers, 
  toggleLayer 
}) => {
  return (
    <div
      className={`bg-white shadow-lg w-64 flex-shrink-0 transition-all duration-300 flex flex-col h-full ${
        sidebarOpen ? "ml-0" : "-ml-64"
      }`}
    >
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800 flex items-center">
            <FiMapPin className="inline-block mr-2 text-red-500" />
            Disaster Management
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500">Global Search Enabled</p>
      </div>

      {/* Search */}
      <SearchBox 
        selectedSearchCategory={selectedSearchCategory}
        setSelectedSearchCategory={setSelectedSearchCategory}
        map={map}
      />

      {/* Layers */}
      <LayerControls 
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        layers={layers}
        toggleLayer={toggleLayer}
      />

      {/* Alerts */}
      <div className="p-4 border-t border-gray-200 bg-red-50 sticky bottom-0">
        <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
          <FiAlertCircle className="mr-2" /> Emergency Alerts
        </h3>
        <p className="text-xs text-red-600">No active alerts.</p>
      </div>
    </div>
  );
};

export default Sidebar;
