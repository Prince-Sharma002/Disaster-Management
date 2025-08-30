
// src/components/Map.jsx
import React, { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { FiSettings, FiHome, FiMenu } from "react-icons/fi";
import { polygonService } from "../lib/supabase";
import area from "@turf/area";

// Components
import Sidebar from "./Sidebar";
import PolygonModal from "./PolygonModal";
import MapControls from "./MapControls";
import useMapbox from "../hooks/useMapbox";

const Map = () => {
  const mapContainer = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLayer, setActiveLayer] = useState("streets");
  const [polygons, setPolygons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPolygon, setNewPolygon] = useState(null);
  const [polygonName, setPolygonName] = useState("");
  const [polygonColor, setPolygonColor] = useState("#088888");
  const [polygonImage, setPolygonImage] = useState(null);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const [layers, setLayers] = useState({
    hospitals: { visible: true, name: "Hospitals" },
    police: { visible: true, name: "Police Stations" },
    shelters: { visible: true, name: "Shelters" },
    traffic: { visible: false, name: "Traffic" },
    satellite: { visible: false, name: "Satellite" }
  });

  // Initialize map using custom hook
  const map = useMapbox(mapContainer, activeLayer, polygons, setNewPolygon, setShowModal);

  useEffect(() => {
    // Fetch polygons from Supabase
    const fetchPolygons = async () => {
      try {
        const data = await polygonService.getPolygons();
        console.log('Fetched polygons from Supabase:', data);
        
        // Transform data to GeoJSON format for Mapbox
        const geoJsonPolygons = data.map(polygon => ({
          type: "Feature",
          properties: {
            id: polygon.id,
            name: polygon.name,
            color: polygon.color,
            area: polygon.area,
            time: polygon.created_at,
            imageUrl: polygon.image_url
          },
          geometry: polygon.geometry
        }));
        
        console.log('Transformed to GeoJSON:', geoJsonPolygons);
        setPolygons(geoJsonPolygons);
      } catch (error) {
        console.error('Error fetching polygons:', error);
      }
    };

    // Add delay to ensure map is loaded
    const timer = setTimeout(fetchPolygons, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePolygonSubmit = async () => {
    if (!polygonName.trim() || !newPolygon) return;
    
    setIsLoading(true);
    
    try {
      const polygonArea = area(newPolygon);
      let imageUrl = "";
      
      // Upload image to Supabase Storage if provided
      if (polygonImage) {
        const fileName = `${Date.now()}_${polygonImage.name}`;
        imageUrl = await polygonService.uploadImage(polygonImage, fileName);
      }
      
      // Create polygon data
      const polygonData = {
        name: polygonName.trim(),
        color: polygonColor,
        area: polygonArea,
        coordinates: newPolygon.geometry.coordinates,
        geometry: newPolygon.geometry,
        image_url: imageUrl
      };
      
      // Save to Supabase
      const savedPolygon = await polygonService.createPolygon(polygonData);
      
      // Add to local state as GeoJSON
      const geoJsonPolygon = {
        type: "Feature",
        properties: {
          id: savedPolygon.id,
          name: savedPolygon.name,
          color: savedPolygon.color,
          area: savedPolygon.area,
          time: savedPolygon.created_at,
          imageUrl: savedPolygon.image_url
        },
        geometry: savedPolygon.geometry
      };
      
      setPolygons(prev => [geoJsonPolygon, ...prev]);
      
      // Reset form
      setShowModal(false);
      setPolygonName("");
      setPolygonColor("#088888");
      setPolygonImage(null);
      setNewPolygon(null);
      
    } catch (error) {
      console.error('Error saving polygon:', error);
      alert('Failed to save polygon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLayer = (layerId) => {
    if (!map.current) return;

    const newLayers = { ...layers };
    newLayers[layerId].visible = !newLayers[layerId].visible;
    setLayers(newLayers);

    if (map.current.getLayer(layerId)) {
      map.current.setLayoutProperty(
        layerId,
        "visibility",
        newLayers[layerId].visible ? "visible" : "none"
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      <PolygonModal 
        showModal={showModal}
        setShowModal={setShowModal}
        polygonName={polygonName}
        setPolygonName={setPolygonName}
        polygonColor={polygonColor}
        setPolygonColor={setPolygonColor}
        polygonImage={polygonImage}
        setPolygonImage={setPolygonImage}
        handlePolygonSubmit={handlePolygonSubmit}
        isLoading={isLoading}
      />

      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedSearchCategory={selectedSearchCategory}
        setSelectedSearchCategory={setSelectedSearchCategory}
        map={map}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        layers={layers}
        toggleLayer={toggleLayer}
      />

      {/* Map */}
      <div className="flex-1 flex flex-col h-screen w-full">
        <div className="bg-white border-b border-gray-200 p-2 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <FiMenu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <FiSettings className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <FiHome className="mr-2" /> Home
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full">
          <div
            ref={mapContainer}
            className="absolute top-0 bottom-0 left-0 right-0 w-full h-full z-0"
          />

          <MapControls map={map} />
        </div>
      </div>
    </div>
  );
};

export default Map;
