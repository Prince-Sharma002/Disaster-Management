// src/components/PolygonModal.jsx
import React from "react";

const PolygonModal = ({ 
  showModal, 
  setShowModal, 
  polygonName, 
  setPolygonName, 
  polygonColor,
  setPolygonColor,
  polygonImage, 
  setPolygonImage, 
  handlePolygonSubmit,
  isLoading 
}) => {
  if (!showModal) return null;

  const colorOptions = [
    { name: 'Blue', value: '#088888' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Yellow', value: '#ca8a04' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Gray', value: '#6b7280' }
  ];

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-md">
        <h2 className="text-lg font-bold mb-4">Create New Polygon</h2>
        
        {/* Polygon Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Polygon Name
          </label>
          <input
            type="text"
            placeholder="Enter polygon name"
            value={polygonName}
            onChange={(e) => setPolygonName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Color Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Polygon Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setPolygonColor(color.value)}
                className={`w-12 h-8 rounded border-2 transition-all ${
                  polygonColor === color.value 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPolygonImage(e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {polygonImage && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {polygonImage.name}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowModal(false)}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePolygonSubmit}
            disabled={isLoading || !polygonName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Polygon'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolygonModal;
