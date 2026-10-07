"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";

// Create a completely client-side only map component with no SSR
const ClientOnlyMap = dynamic(() => import("./ClientMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-slate-600">Loading map...</p>
      </div>
    </div>
  ),
});

import { JammuHotspot, JammuDrainageCorridor } from "@/lib/data/jammuHotspots";
import { HotspotRiskResult } from "@/lib/riskEngine";
import { HotspotPriorityResult } from "@/lib/priorityEngine";

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
  riskResults?: HotspotRiskResult[];
  priorityResults?: HotspotPriorityResult[];
}

export default function InteractiveMap(props: MapProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-80 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    }>
      <ClientOnlyMap {...props} />
    </Suspense>
  );
}
