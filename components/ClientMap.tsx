"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  center: [number, number];
  zoom: number;
  selectedLocation?: [number, number];
  riskLevel?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

// Component to handle map updates when props change
function MapUpdater({ center, zoom, selectedLocation, riskLevel }: MapProps) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.setView(selectedLocation, 15);
    }
  }, [selectedLocation, map]);

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export default function ClientMap({ 
  center, 
  zoom, 
  selectedLocation, 
  riskLevel,
  onLocationSelect 
}: MapProps) {
  const [clickedLocation, setClickedLocation] = useState<[number, number] | undefined>(undefined);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setClickedLocation([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case "Very High":
        return "#FF0000";
      case "High":
        return "#FF6600";
      case "Medium":
        return "#FFCC00";
      case "Low":
        return "#00FF00";
      default:
        return "#3B82F6";
    }
  };

  return (
    <div className="w-full h-80 rounded-lg border border-slate-200 overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        onClick={handleMapClick}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Clicked location marker */}
        {clickedLocation && (
          <Marker position={clickedLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Clicked Location</p>
                <p className="text-sm text-gray-600">
                  Lat: {clickedLocation[0].toFixed(6)}
                </p>
                <p className="text-sm text-gray-600">
                  Lng: {clickedLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={selectedLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Selected Location</p>
                <p className="text-sm text-gray-600">
                  Lat: {selectedLocation[0].toFixed(6)}
                </p>
                <p className="text-sm text-gray-600">
                  Lng: {selectedLocation[1].toFixed(6)}
                </p>
                {riskLevel && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Risk: {riskLevel}
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Risk assessment circle */}
        {selectedLocation && riskLevel && (
          <Circle
            center={selectedLocation}
            radius={1000}
            pathOptions={{
              color: getRiskColor(riskLevel),
              fillColor: getRiskColor(riskLevel),
              fillOpacity: 0.3,
              weight: 2,
            }}
          />
        )}

        <MapUpdater 
          center={center} 
          zoom={zoom} 
          selectedLocation={selectedLocation}
          riskLevel={riskLevel}
        />
      </MapContainer>
    </div>
  );
}
