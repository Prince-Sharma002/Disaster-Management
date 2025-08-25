// Map.jsx
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// ⚠️ Replace with your Mapbox Access Token
mapboxgl.accessToken = "pk.eyJ1IjoiYWlzaGNoYW1hcnRoaSIsImEiOiJjbHB1Yjk2djcwajBlMmluenJvdGlucG54In0.1nBG1ilIoMJlD1xJ4mzIoA";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // prevent re-initialization

    // Init Map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [77.209, 28.6139], // New Delhi
      zoom: 10,
    });

    // Navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Search (Geocoder)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });
    map.current.addControl(geocoder, "top-left");

    // Draw Tool (Polygon, Line, Point)
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        point: true,
        line_string: true,
      },
    });
    map.current.addControl(draw, "top-right");

    // Example Marker
    const marker = new mapboxgl.Marker({ color: "red" })
      .setLngLat([77.209, 28.6139])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h1 class="font-bold">New Delhi</h1><p>Marker Example</p>`
        )
      )
      .addTo(map.current);

    // On Draw Create Event
    map.current.on("draw.create", (e) => {
      console.log("Polygon/Shape created: ", e.features);
    });
  }, []);

  return (
    <div className="w-full h-[600px] relative">
      <div ref={mapContainer} className="w-full h-full rounded-xl shadow-lg" />
    </div>
  );
};

export default Map;
