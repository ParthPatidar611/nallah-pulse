"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  JammuHotspot,
  JammuDrainageCorridor,
  getInitialDisplayLevel,
  getRiskCategoryStyles,
  RiskCategory,
} from "@/lib/data/jammuHotspots";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  center: [number, number];
  zoom: number;
  selectedLocation?: [number, number];
  riskLevel?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  hotspots?: JammuHotspot[];
  selectedHotspot?: JammuHotspot | null;
  onHotspotSelect?: (hotspot: JammuHotspot) => void;
  drainageCorridors?: JammuDrainageCorridor[];
  showDrainageCorridors?: boolean;
}

// Map updater to smoothly navigate to selected points
function MapUpdater({
  center,
  zoom,
  selectedLocation,
  selectedHotspot,
}: {
  center: [number, number];
  zoom: number;
  selectedLocation?: [number, number];
  selectedHotspot?: JammuHotspot | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedHotspot) {
      map.flyTo([selectedHotspot.latitude, selectedHotspot.longitude], 14, {
        duration: 0.75,
      });
    } else if (selectedLocation) {
      map.setView(selectedLocation, 14);
    }
  }, [selectedHotspot, selectedLocation, map]);

  useEffect(() => {
    if (!selectedHotspot && !selectedLocation) {
      map.setView(center, zoom);
    }
  }, [center, zoom, selectedHotspot, selectedLocation, map]);

  return null;
}

// Map click handler for selecting arbitrary coordinates
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
  });

  return null;
}

// Custom DivIcon generator for differentiated risk markers
function createHotspotIcon(category: RiskCategory, isSelected: boolean) {
  const styles = getRiskCategoryStyles(category);
  const size = isSelected ? 32 : 24;
  const innerDot = isSelected ? 10 : 8;

  return L.divIcon({
    className: "nallahpulse-custom-marker",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background-color: ${styles.color};
          opacity: ${isSelected ? "0.45" : "0.25"};
          transform: scale(${isSelected ? "1.4" : "1.15"});
        "></div>
        <div style="
          width: ${size - 4}px;
          height: ${size - 4}px;
          border-radius: 9999px;
          background-color: ${styles.color};
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: ${innerDot}px;
            height: ${innerDot}px;
            border-radius: 9999px;
            background-color: #ffffff;
          "></div>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

export default function ClientMap({
  center,
  zoom,
  selectedLocation,
  riskLevel,
  onLocationSelect,
  hotspots = [],
  selectedHotspot,
  onHotspotSelect,
  drainageCorridors = [],
  showDrainageCorridors = true,
}: MapProps) {
  const [clickedLocation, setClickedLocation] = useState<[number, number] | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClientReady, setIsClientReady] = useState(false);

  const getRiskColor = useCallback((level?: string) => {
    switch (level) {
      case "Very High":
      case "CRITICAL":
        return "#DC2626";
      case "High":
      case "HIGH":
        return "#EA580C";
      case "Medium":
      case "MODERATE":
        return "#D97706";
      case "Low":
      case "LOW":
        return "#16A34A";
      default:
        return "#2563EB";
    }
  }, []);

  useEffect(() => {
    setIsClientReady(true);
    return () => {
      if (containerRef.current) {
        const mapContainer = containerRef.current.querySelector(".leaflet-container") as any;
        if (mapContainer && mapContainer._leaflet_id) {
          mapContainer._leaflet_id = null;
        }
      }
    };
  }, []);

  if (!isClientReady) {
    return (
      <div className="w-full h-[460px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600 text-sm">Initializing Jammu drainage map...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[460px] lg:h-[500px] rounded-lg border border-slate-200 overflow-hidden relative"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Illustrative Drainage Corridors Layer */}
        {showDrainageCorridors &&
          drainageCorridors.map((corridor) => (
            <Polyline
              key={corridor.id}
              positions={corridor.coordinates}
              pathOptions={{
                color: "#0284C7",
                weight: 4,
                opacity: 0.85,
                dashArray: "6, 6",
              }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <span className="font-semibold text-blue-900">
                    🌊 {corridor.name}
                  </span>
                  <div className="text-slate-600">
                    Illustrative Prototype Nallah Corridor
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs max-w-[240px] space-y-1.5 p-0.5">
                  <div className="font-bold text-sm text-blue-900">
                    {corridor.name}
                  </div>
                  <div className="text-slate-600">{corridor.description}</div>
                  <div className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 text-[11px]">
                    <strong>Risk Context:</strong> {corridor.riskContext}
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Illustrative Prototype Drainage Layer &bull; Research Model
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}

        {/* Prototype Hotspot Markers */}
        {hotspots.map((hotspot) => {
          const category = getInitialDisplayLevel(hotspot);
          const styles = getRiskCategoryStyles(category);
          const isSelected = selectedHotspot?.id === hotspot.id;
          const markerIcon = createHotspotIcon(category, isSelected);

          return (
            <Marker
              key={hotspot.id}
              position={[hotspot.latitude, hotspot.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onHotspotSelect) {
                    onHotspotSelect(hotspot);
                  }
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                <div className="text-xs font-medium flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: styles.color }}
                  ></span>
                  <span>{hotspot.name}</span>
                  <span
                    className="text-[10px] font-bold px-1 py-0.2 rounded"
                    style={{
                      color: styles.color,
                      backgroundColor: `${styles.color}15`,
                    }}
                  >
                    {category}
                  </span>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs space-y-2 p-1 max-w-[230px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {hotspot.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {hotspot.locality}
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${styles.color}20`,
                        color: styles.color,
                      }}
                    >
                      {category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] bg-slate-50 p-1.5 rounded">
                    <div>
                      Drainage: <strong>{hotspot.drainageVulnerability}/100</strong>
                    </div>
                    <div>
                      Historical: <strong>{hotspot.historicalRisk}/100</strong>
                    </div>
                    <div>
                      Blockage: <strong>{hotspot.blockageFactor}/100</strong>
                    </div>
                    <div>
                      Elevation: <strong>{hotspot.elevationMeters}m</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-tight">
                    {hotspot.riskExplanation}
                  </p>

                  <button
                    onClick={() => {
                      if (onHotspotSelect) {
                        onHotspotSelect(hotspot);
                      }
                    }}
                    className="w-full text-center py-1 px-2 text-[11px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Inspect Factor Breakdown
                  </button>

                  <div className="text-[10px] text-slate-400 text-center">
                    Prototype Data &bull; Demonstrative Hotspot
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Selected Hotspot Highlight Circle */}
        {selectedHotspot && (
          <Circle
            center={[selectedHotspot.latitude, selectedHotspot.longitude]}
            radius={550}
            pathOptions={{
              color: getRiskCategoryStyles(getInitialDisplayLevel(selectedHotspot)).color,
              fillColor: getRiskCategoryStyles(getInitialDisplayLevel(selectedHotspot)).color,
              fillOpacity: 0.18,
              weight: 2,
              dashArray: "4, 4",
            }}
          />
        )}

        {/* Arbitrary Clicked / Selected Location Marker */}
        {selectedLocation && !selectedHotspot && (
          <Marker position={selectedLocation}>
            <Popup>
              <div className="text-center text-xs">
                <p className="font-semibold text-slate-900">Custom Selected Coordinate</p>
                <p className="text-slate-600">
                  Lat: {selectedLocation[0].toFixed(5)}, Lng: {selectedLocation[1].toFixed(5)}
                </p>
                {riskLevel && (
                  <div className="mt-1.5">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-800 rounded">
                      Risk: {riskLevel}
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Risk Assessment Circle for analyzed custom coordinates */}
        {selectedLocation && riskLevel && !selectedHotspot && (
          <Circle
            center={selectedLocation}
            radius={800}
            pathOptions={{
              color: getRiskColor(riskLevel),
              fillColor: getRiskColor(riskLevel),
              fillOpacity: 0.25,
              weight: 2,
            }}
          />
        )}

        {/* Arbitrary Map Click Event Handler */}
        <MapClickHandler
          onLocationSelect={(lat, lng) => {
            setClickedLocation([lat, lng]);
            if (onLocationSelect) {
              onLocationSelect(lat, lng);
            }
          }}
        />

        {/* Dynamic Map Navigation */}
        <MapUpdater
          center={center}
          zoom={zoom}
          selectedLocation={selectedLocation}
          selectedHotspot={selectedHotspot}
        />
      </MapContainer>
    </div>
  );
}
