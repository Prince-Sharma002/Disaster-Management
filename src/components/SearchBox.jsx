// src/components/SearchBox.jsx
import React, { useEffect, useRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { FiMapPin } from "react-icons/fi";
import mapboxgl from "mapbox-gl";

const SearchBox = ({ selectedSearchCategory, setSelectedSearchCategory, map }) => {
  const geocoderRef = useRef(null);

  // Search categories
  const searchCategories = {
    all: { name: "All Places", types: [] },
    accommodation: { name: "Hotels & Lodging", types: ["lodging"] },
    food: { name: "Restaurants & Food", types: ["establishment", "food"] },
    shopping: { name: "Shopping", types: ["store"] },
    healthcare: { name: "Healthcare", types: ["hospital", "pharmacy", "doctor"] },
    transport: { name: "Transportation", types: ["transit_station", "airport", "bus_station"] },
    entertainment: { name: "Entertainment", types: ["amusement_park", "movie_theater", "tourist_attraction"] },
    services: { name: "Services", types: ["bank", "atm", "gas_station", "car_repair"] }
  };

  // Mount geocoder
  const mountGeocoder = () => {
    if (geocoderRef.current && typeof geocoderRef.current.onRemove === "function") {
      try {
        geocoderRef.current.onRemove(map.current);
      } catch (_) {}
    }

    const currentCategory = searchCategories[selectedSearchCategory];
    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: `Search ${currentCategory.name.toLowerCase()}...`,
      flyTo: { zoom: 15 },
      limit: 8,
      types: currentCategory.types.length > 0 ? currentCategory.types.join(',') : undefined,
      bbox: undefined,
      countries: undefined,
      language: 'en'
    });

    const searchContainer = document.getElementById("geocoder");
    if (searchContainer) {
      while (searchContainer.firstChild) {
        searchContainer.removeChild(searchContainer.firstChild);
      }
      const geocoderEl = geocoderRef.current.onAdd(map.current);
      searchContainer.appendChild(geocoderEl);
    }
  };

  // Update geocoder when search category changes
  useEffect(() => {
    if (map.current && geocoderRef.current) {
      mountGeocoder();
    }
  }, [selectedSearchCategory]);

  // Initial mount
  useEffect(() => {
    if (map.current) {
      mountGeocoder();
      map.current.on("style.load", mountGeocoder);
    }

    return () => {
      const sc = document.getElementById("geocoder");
      if (sc) while (sc.firstChild) sc.removeChild(sc.firstChild);
    };
  }, []);

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <FiMapPin className="mr-2" /> Search Places
      </h3>
      
      {/* Search Category Selector */}
      <div className="mb-3">
        <select
          value={selectedSearchCategory}
          onChange={(e) => setSelectedSearchCategory(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(searchCategories).map(([key, category]) => (
            <option key={key} value={key}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Search Box */}
      <div id="geocoder" className="w-full"></div>
      
      {/* Quick Search Buttons */}
      <div className="mt-3 flex flex-wrap gap-1">
        {['accommodation', 'food', 'healthcare', 'shopping'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedSearchCategory(category)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              selectedSearchCategory === category
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {searchCategories[category].name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBox;
