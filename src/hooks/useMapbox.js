// src/hooks/useMapbox.js
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import area from "@turf/area";

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiYWlzaGNoYW1hcnRoaSIsImEiOiJjbHB1Yjk2djcwajBlMmluenJvdGlucG54In0.1nBG1ilIoMJlD1xJ4mzIoA";

const useMapbox = (mapContainer, activeLayer, polygons, setNewPolygon, setShowModal) => {
  const map = useRef(null);

  // Map styles
  const mapStyles = {
    streets: "mapbox://styles/mapbox/streets-v11",
    satellite: "mapbox://styles/mapbox/satellite-streets-v11",
    dark: "mapbox://styles/mapbox/dark-v10",
    light: "mapbox://styles/mapbox/light-v10"
  };

  useEffect(() => {
    if (map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[activeLayer],
      center: [0, 20],
      zoom: 2,
      attributionControl: false
    });

    // Navigation controls
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

    // Draw Tool
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

    // Add layers on load
    map.current.on("load", () => {
      // Add polygons source and layer
      if (!map.current.getSource("polygons")) {
        map.current.addSource("polygons", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });
      }

      if (!map.current.getLayer("polygons-layer")) {
        map.current.addLayer({
          id: "polygons-layer",
          type: "fill",
          source: "polygons",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.6,
          },
        });
      }

      // Add polygon outline
      if (!map.current.getLayer("polygons-outline")) {
        map.current.addLayer({
          id: "polygons-outline",
          type: "line",
          source: "polygons",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2,
            "line-opacity": 0.8,
          },
        });
      }

      // Polygon click events
      map.current.on("click", "polygons-layer", (e) => {
        const feature = e.features[0];
        const { name, time, area, imageUrl } = feature.properties;
        const coordinates = e.lngLat;

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">${name}</h3>
            <p class="text-sm text-gray-600 mb-1">Created: ${new Date(time).toLocaleString()}</p>
            <p class="text-sm text-gray-600 mb-2">Area: ${area.toFixed(2)} sq. meters</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="w-full h-auto mt-2 rounded border">` : ""}
          </div>
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

      // Add hospitals layer
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

      // Hospital click events
      map.current.on("click", "hospitals", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3 class="font-bold">${name}</h3><p>Hospital Location</p>`)
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
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update polygons data
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && map.current.getSource("polygons")) {
      console.log('Updating polygons on map:', polygons.length, 'polygons');
      map.current.getSource("polygons").setData({
        type: "FeatureCollection",
        features: polygons,
      });
    }
  }, [polygons]);

  // Update map style
  useEffect(() => {
    if (map.current && activeLayer) {
      map.current.setStyle(mapStyles[activeLayer]);
      
      // Re-add polygon layers after style change
      map.current.once('styledata', () => {
        if (!map.current.getSource("polygons")) {
          map.current.addSource("polygons", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: polygons,
            },
          });
        }

        if (!map.current.getLayer("polygons-layer")) {
          map.current.addLayer({
            id: "polygons-layer",
            type: "fill",
            source: "polygons",
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": 0.6,
            },
          });
        }

        if (!map.current.getLayer("polygons-outline")) {
          map.current.addLayer({
            id: "polygons-outline",
            type: "line",
            source: "polygons",
            paint: {
              "line-color": ["get", "color"],
              "line-width": 2,
              "line-opacity": 0.8,
            },
          });
        }

        // Re-add polygon click events
        map.current.on("click", "polygons-layer", (e) => {
            const feature = e.features[0];
            const { name, time, area, imageUrl } = feature.properties;
            const coordinates = e.lngLat;

            const popupContent = `
              <div class="p-2">
                <h3 class="font-bold text-lg mb-2">${name}</h3>
                <p class="text-sm text-gray-600 mb-1">Created: ${new Date(time).toLocaleString()}</p>
                <p class="text-sm text-gray-600 mb-2">Area: ${area.toFixed(2)} sq. meters</p>
                ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="w-full h-auto mt-2 rounded border">` : ""}
              </div>
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
      });
    }
  }, [activeLayer, polygons]);

  return map;
};

export default useMapbox;
