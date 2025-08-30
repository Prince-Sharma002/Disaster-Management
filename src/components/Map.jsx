
// src/components/Map.jsx
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import {
  FiLayers,
  FiSettings,
  FiAlertCircle,
  FiMapPin,
  FiHome,
  FiPlus,
  FiMinus,
  FiCompass,
  FiFilter,
  FiMenu,
  FiX
} from "react-icons/fi";
import { db, storage } from "../firebase"; // Import Firestore and Storage
import { collection, addDoc, onSnapshot, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import area from "@turf/area";


// ⚠️ Replace with your own token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYWlzaGNoYW1hcnRoaSIsImEiOiJjbHB1Yjk2djcwajBlMmluenJvdGlucG54In0.1nBG1ilIoMJlD1xJ4mzIoA";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const geocoderRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLayer, setActiveLayer] = useState("streets");
  const [polygons, setPolygons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPolygon, setNewPolygon] = useState(null);
  const [polygonName, setPolygonName] = useState("");
  const [polygonImage, setPolygonImage] = useState(null);

  const [layers, setLayers] = useState({
    hospitals: { visible: true, name: "Hospitals" },
    police: { visible: true, name: "Police Stations" },
    shelters: { visible: true, name: "Shelters" },
    traffic: { visible: false, name: "Traffic" },
    satellite: { visible: false, name: "Satellite" }
  });

  // Map styles
  const mapStyles = {
    streets: "mapbox://styles/mapbox/streets-v11",
    satellite: "mapbox://styles/mapbox/satellite-streets-v11",
    dark: "mapbox://styles/mapbox/dark-v10",
    light: "mapbox://styles/mapbox/light-v10"
  };

  useEffect(() => {
    // Fetch polygons from Firestore
    const unsubscribe = onSnapshot(collection(db, "polygons"), (snapshot) => {
      const fetchedPolygons = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolygons(fetchedPolygons);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[activeLayer],
      center: [0, 20], // 🌍 Start centered globally
      zoom: 2,
      attributionControl: false
    });

    // demo comment
    // Navigation controls (zoom + compass)
    const nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: false
    });
    map.current.addControl(nav, "top-right");

    // Scale & Fullscreen
    map.current.addControl(new mapboxgl.ScaleControl());
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // User Geolocation
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    });
    map.current.addControl(geolocate, "top-right");

    // ✅ Mount Geocoder (Global Search)
    const mountGeocoder = () => {
      if (geocoderRef.current && typeof geocoderRef.current.onRemove === "function") {
        try {
          geocoderRef.current.onRemove(map.current);
        } catch (_) {}
      }

      geocoderRef.current = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: "Search location...",
        flyTo: { zoom: 10 },
        limit: 5
        // 🚫 Do not set localGeocoderOnly → ensures WORLDWIDE search
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

    mountGeocoder();
    map.current.on("style.load", mountGeocoder);

    // Draw Tool (Polygon, Line, Point)
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        line_string: true,
        point: true
      }
    });
    map.current.addControl(draw, "top-right");

    map.current.on("draw.create", (e) => {
        const newPolygonData = e.features[0];
        setNewPolygon(newPolygonData);
        setShowModal(true);
      });

    // Add hospital layer
    map.current.on("load", () => {
        map.current.addSource("polygons", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: polygons,
            },
          });
    
          map.current.addLayer({
            id: "polygons-layer",
            type: "fill",
            source: "polygons",
            paint: {
              "fill-color": "#088",
              "fill-opacity": 0.5,
            },
          });

          map.current.on("click", "polygons-layer", (e) => {
            const feature = e.features[0];
            const { name, time, area, imageUrl } = feature.properties;
            const coordinates = e.lngLat;
      
            const popupContent = `
              <h3 class="font-bold">${name}</h3>
              <p>Time: ${new Date(time).toLocaleString()}</p>
              <p>Area: ${area.toFixed(2)} sq. meters</p>
              ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="w-full h-auto mt-2">` : ""}
            `;
      
            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(popupContent)
              .addTo(map.current);
          });
      
          map.current.on("mouseenter", "polygons-layer", () => {
            map.current.getCanvas().style.cursor = "pointer";
          });
      
          map.current.on("mouseleave", "polygons-layer", () => {
            map.current.getCanvas().style.cursor = "";
          });


      map.current.addSource("hospitals", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "AIIMS Hospital" },
              geometry: { type: "Point", coordinates: [77.2107, 28.5672] }
            },
            {
              type: "Feature",
              properties: { name: "Safdarjung Hospital" },
              geometry: { type: "Point", coordinates: [77.1909, 28.5646] }
            }
          ]
        }
      });

      map.current.addLayer({
        id: "hospitals",
        type: "circle",
        source: "hospitals",
        paint: {
          "circle-radius": 8,
          "circle-color": "#ff0000",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff"
        }
      });

      map.current.on("click", "hospitals", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `<h3 class="font-bold">${name}</h3><p>Hospital Location</p>`
          )
          .addTo(map.current);
      });

      map.current.on("mouseenter", "hospitals", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "hospitals", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });

    return () => {
      const sc = document.getElementById("geocoder");
      if (sc) while (sc.firstChild) sc.removeChild(sc.firstChild);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && map.current.getSource("polygons")) {
      map.current.getSource("polygons").setData({
        type: "FeatureCollection",
        features: polygons,
      });
    }
  }, [polygons]);

  // Update map style when activeLayer changes
  useEffect(() => {
    if (map.current && activeLayer) {
      map.current.setStyle(mapStyles[activeLayer]);
    }
  }, [activeLayer]);

  const handlePolygonSubmit = async () => {
    if (!polygonName || !newPolygon) return;
  
    const polygonArea = area(newPolygon);
    let imageUrl = "";
  
    if (polygonImage) {
      const imageRef = ref(storage, `polygon-images/${Date.now()}_${polygonImage.name}`);
      await uploadBytes(imageRef, polygonImage);
      imageUrl = await getDownloadURL(imageRef);
    }
  
    await addDoc(collection(db, "polygons"), {
      name: polygonName,
      time: new Date().toISOString(),
      area: polygonArea,
      geometry: newPolygon.geometry,
      imageUrl,
    });
  
    setShowModal(false);
    setPolygonName("");
    setPolygonImage(null);
    setNewPolygon(null);
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

  const zoomIn = () => map.current.zoomIn();
  const zoomOut = () => map.current.zoomOut();

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
        {showModal && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-4">New Polygon</h2>
            <input
              type="text"
              placeholder="Polygon Name"
              value={polygonName}
              onChange={(e) => setPolygonName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="file"
              onChange={(e) => setPolygonImage(e.target.files[0])}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePolygonSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
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
        <div className="p-4 border-b border-gray-200">
          <div id="geocoder" className="w-full"></div>
        </div>

        {/* Layers */}
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

        {/* Alerts */}
        <div className="p-4 border-t border-gray-200 bg-red-50 sticky bottom-0">
          <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
            <FiAlertCircle className="mr-2" /> Emergency Alerts
          </h3>
          <p className="text-xs text-red-600">No active alerts.</p>
        </div>
      </div>

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

          {/* Custom Zoom Controls */}
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
              onClick={() => map.current.resetNorth()}
              className="p-2 hover:bg-gray-100 block w-10 h-10 flex items-center justify-center text-gray-700"
              title="Reset North"
            >
              <FiCompass className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
