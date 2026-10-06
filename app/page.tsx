"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import InteractiveMap from "@/components/InteractiveMap";
import RainfallSimulator from "@/components/RainfallSimulator";
import {
  JAMMU_HOTSPOTS,
  JAMMU_DRAINAGE_CORRIDORS,
  JammuHotspot,
  getInitialDisplayLevel,
  getRiskCategoryStyles,
  getHotspotKPIs,
} from "@/lib/data/jammuHotspots";
import {
  runRiskEngine,
  DEFAULT_SCENARIO_PARAMS,
  ScenarioParams,
  EngineOutput,
  getAlertStatusStyles,
} from "@/lib/riskEngine";
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Globe,
  Shield,
  TrendingUp,
  Map,
  Upload,
  Image,
  Camera,
  Activity,
  Droplets,
  Layers,
  ChevronRight,
  Sliders,
  Check,
  Zap,
} from "lucide-react";

interface FloodRiskData {
  riskLevel: "Low" | "Medium" | "High" | "Very High";
  description: string;
  recommendations: string[];
  elevation: number;
  distanceFromWater: number;
}

export default function NallahPulseDashboard() {
  const [inputLat, setInputLat] = useState("32.7285");
  const [inputLng, setInputLng] = useState("74.8522");
  const [floodRisk, setFloodRisk] = useState<FloodRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<"coordinates" | "image">(
    "coordinates"
  );
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | undefined>(undefined);
  const [selectedHotspot, setSelectedHotspot] = useState<JammuHotspot | null>(
    JAMMU_HOTSPOTS[0] // Default to Krishna Nagar
  );
  const [showDrainageCorridors, setShowDrainageCorridors] = useState(true);
  const [activePanelTab, setActivePanelTab] = useState<"hotspot" | "custom" | "engine">("engine");

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phase 3: Risk Engine state
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>(DEFAULT_SCENARIO_PARAMS);
  const [engineOutput, setEngineOutput] = useState<EngineOutput>(() =>
    runRiskEngine(JAMMU_HOTSPOTS, DEFAULT_SCENARIO_PARAMS)
  );

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // Dynamic KPIs derived from the central dataset and simulated scenario risk output
  const kpiData = useMemo(
    () => getHotspotKPIs(JAMMU_HOTSPOTS, engineOutput.results),
    [engineOutput.results]
  );

  // Re-run risk engine whenever scenario params change
  useEffect(() => {
    const output = runRiskEngine(JAMMU_HOTSPOTS, scenarioParams);
    setEngineOutput(output);
  }, [scenarioParams]);

  // Check backend connectivity on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          console.log("NallahPulse API is running and healthy");
        } else {
          console.warn("Backend responded but not healthy");
        }
      } catch (error) {
        console.error("Backend is not accessible:", error);
      }
    };
    checkBackendHealth();
  }, [API_BASE_URL]);

  // Select hotspot by ID (used by risk engine triage list)
  const handleHotspotSelectById = useCallback((hotspotId: string) => {
    const h = JAMMU_HOTSPOTS.find((hs) => hs.id === hotspotId);
    if (h) {
      setSelectedHotspot(h);
      setSelectedLocation([h.latitude, h.longitude]);
      setInputLat(h.latitude.toFixed(6));
      setInputLng(h.longitude.toFixed(6));
    }
  }, []);

  // Default map center (Jammu, Jammu & Kashmir)
  const defaultCenter: [number, number] = [32.7266, 74.8570];

  // Handle location selection from map clicks
  const handleLocationSelect = (lat: number, lng: number) => {
    setInputLat(lat.toFixed(6));
    setInputLng(lng.toFixed(6));
    setSelectedLocation([lat, lng]);
    setSelectedHotspot(null);
    setActivePanelTab("custom");
  };

  // Handle selecting a prototype hotspot
  const handleHotspotSelect = (hotspot: JammuHotspot) => {
    setSelectedHotspot(hotspot);
    setSelectedLocation([hotspot.latitude, hotspot.longitude]);
    setInputLat(hotspot.latitude.toFixed(6));
    setInputLng(hotspot.longitude.toFixed(6));
    setActivePanelTab("hotspot");
  };

  // API calls
  const callAPI = async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: endpoint.includes("coordinates")
        ? { "Content-Type": "application/json" }
        : {},
      body: endpoint.includes("coordinates") ? JSON.stringify(data) : data,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  };

  // Analysis handlers
  const handleCoordinateSubmit = async () => {
    if (!inputLat || !inputLng) {
      setAlertMessage("Please enter both latitude and longitude");
      setShowAlert(true);
      return;
    }

    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setAlertMessage(
        "Please enter valid coordinates (Lat: -90 to 90, Lng: -180 to 180)"
      );
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const apiResponse = await callAPI("/api/analyze/coordinates", {
        latitude: lat,
        longitude: lng,
      });
      const riskData: FloodRiskData = {
        riskLevel: apiResponse.risk_level,
        description: apiResponse.description,
        recommendations: apiResponse.recommendations,
        elevation: apiResponse.elevation,
        distanceFromWater: apiResponse.distance_from_water,
      };
      setFloodRisk(riskData);
      setAiAnalysis(apiResponse.ai_analysis || "");
      setSelectedLocation([lat, lng]);
    } catch (error) {
      console.error("Error analyzing coordinates:", error);
      setAlertMessage(
        "Error analyzing coordinates. Please try again or verify connectivity."
      );
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024 || !file.type.startsWith("image/")) {
        setAlertMessage(
          file.size > 10 * 1024 * 1024
            ? "Image size must be less than 10MB"
            : "Please select a valid image file"
        );
        setShowAlert(true);
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) {
      setAlertMessage("Please select an image first");
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      const apiResponse = await callAPI("/api/analyze/image", formData);
      const riskData: FloodRiskData = {
        riskLevel: apiResponse.risk_level,
        description: apiResponse.description,
        recommendations: apiResponse.recommendations,
        elevation: apiResponse.elevation,
        distanceFromWater: apiResponse.distance_from_water,
      };
      setFloodRisk(riskData);
      setAiAnalysis(apiResponse.ai_analysis || "");
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAlertMessage(
        "Error analyzing image. Please try again or verify connectivity."
      );
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getRiskVariant = (riskLevel: string) =>
    riskLevel === "Very High" || riskLevel === "High"
      ? "destructive"
      : riskLevel === "Medium"
      ? "secondary"
      : "default";

  const getRiskIcon = (riskLevel: string) =>
    riskLevel === "Very High" || riskLevel === "High" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : riskLevel === "Medium" ? (
      <Info className="h-4 w-4" />
    ) : (
      <CheckCircle className="h-4 w-4" />
    );

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  NallahPulse
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  MVP v0.2
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Jammu Urban Waterlogging Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Civic-Tech Prototype &bull; Demonstrative Data</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Subtitle & Mission Statement */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            <strong className="text-slate-800 font-semibold">NallahPulse</strong> is a prototype urban drainage intelligence system for Jammu that evaluates drainage vulnerability, identifies waterlogging tendencies, and helps prioritize municipal intervention.
          </p>
          <div className="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Region: <span className="text-blue-700 font-bold">Jammu Municipal Area (JMC)</span>
          </div>
        </div>

        {/* KPI Operations Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monitored Hotspots
                </span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                  <MapPin className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {kpiData.totalMonitored}
                </span>
                <span className="text-xs text-slate-500">prototype nodes</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Across Jammu urban wards</p>
            </CardContent>
          </Card>

          <Card className="border-red-200/80 bg-red-50/30 shadow-sm hover:border-red-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                  Critical Zones
                </span>
                <div className="p-1.5 bg-red-100 text-red-600 rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-700">
                  {kpiData.criticalCount}
                </span>
                <span className="text-xs text-red-600 font-medium">high vulnerability</span>
              </div>
              <p className="text-[11px] text-red-600/80 mt-1">Requires preventive desilting</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200/80 bg-orange-50/30 shadow-sm hover:border-orange-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
                  High Risk Zones
                </span>
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-orange-700">
                  {kpiData.highCount}
                </span>
                <span className="text-xs text-orange-600 font-medium">elevated tendency</span>
              </div>
              <p className="text-[11px] text-orange-600/80 mt-1">Watchlist for monsoon surge</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/30 shadow-sm hover:border-blue-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Immediate Attention
                </span>
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-800">
                  {kpiData.attentionCount}
                </span>
                <span className="text-xs text-blue-600">Critical + High priority</span>
              </div>
              <p className="text-[11px] text-blue-600 mt-1">Priority intervention cohort</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Operational Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Center - Interactive Jammu Map (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    Jammu Drainage &amp; Waterlogging Map
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any marker or natural drainage line to inspect contributing factors
                  </p>
                </div>

                {/* Map Layer Controls */}
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md cursor-pointer hover:bg-slate-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={showDrainageCorridors}
                      onChange={(e) => setShowDrainageCorridors(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-blue-600" />
                      Nallah Corridors Layer
                    </span>
                  </label>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <InteractiveMap
                  center={defaultCenter}
                  zoom={12}
                  selectedLocation={selectedLocation}
                  riskLevel={floodRisk?.riskLevel}
                  onLocationSelect={handleLocationSelect}
                  hotspots={JAMMU_HOTSPOTS}
                  selectedHotspot={selectedHotspot}
                  onHotspotSelect={handleHotspotSelect}
                  drainageCorridors={JAMMU_DRAINAGE_CORRIDORS}
                  showDrainageCorridors={showDrainageCorridors}
                  riskResults={engineOutput.results}
                />
              </CardContent>

              {/* Map Footer & Color Legend */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                    Marker Risk Tiers:
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                    <span>Low</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">
                  Illustrative Prototype Drainage Layer
                </span>
              </div>
            </Card>

            {/* Quick Hotspot Selector Bar - now shows DYNAMIC risk scores from engine */}
            <Card className="border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                  Live Risk Index ({JAMMU_HOTSPOTS.length} nodes)
                </span>
                <span className="text-[11px] text-slate-500">
                  Dynamic scores from scenario
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {engineOutput.results.map((result) => {
                  const alertStyles = getAlertStatusStyles(result.alertStatus);
                  const isSelected = selectedHotspot?.id === result.hotspotId;
                  const h = JAMMU_HOTSPOTS.find((hs) => hs.id === result.hotspotId)!;

                  return (
                    <button
                      key={result.hotspotId}
                      onClick={() => {
                        handleHotspotSelect(h);
                        setActivePanelTab("engine");
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${result.alertStatus === "RED" ? "animate-pulse" : ""}`}
                        style={{ backgroundColor: isSelected ? "#ffffff" : undefined }}
                        data-status={result.alertStatus}
                      >
                        {/* colored dot via inline style when not selected */}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full -ml-3.5"
                        style={{
                          backgroundColor: isSelected
                            ? "#ffffff"
                            : result.alertStatus === "RED" ? "#dc2626"
                            : result.alertStatus === "ORANGE" ? "#f97316"
                            : result.alertStatus === "YELLOW" ? "#f59e0b"
                            : "#10b981",
                        }}
                      />
                      <span>{result.hotspotName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? "bg-blue-700 text-blue-100" : alertStyles.badge
                        }`}
                      >
                        {result.dynamicScore}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Intelligence Panel (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-4 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-base font-bold text-slate-900">
                      Intelligence &amp; Assessment
                    </CardTitle>
                  </div>
                  <Tabs
                    value={activePanelTab}
                    onValueChange={(val) => setActivePanelTab(val as "hotspot" | "custom" | "engine")}
                    className="w-auto"
                  >
                    <TabsList className="h-7 text-xs bg-slate-100 p-0.5">
                      <TabsTrigger value="engine" className="text-xs px-2 py-1 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        Risk Engine
                      </TabsTrigger>
                      <TabsTrigger value="hotspot" className="text-xs px-2 py-1">
                        Hotspot
                      </TabsTrigger>
                      <TabsTrigger value="custom" className="text-xs px-2 py-1">
                        Coordinates
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Phase 3: Risk Engine + Rainfall Simulator Tab */}
                {activePanelTab === "engine" && (
                  <RainfallSimulator
                    params={scenarioParams}
                    engineOutput={engineOutput}
                    onParamsChange={setScenarioParams}
                    onSelectHotspot={(id) => {
                      handleHotspotSelectById(id);
                    }}
                    selectedHotspotId={selectedHotspot?.id}
                  />
                )}

                {activePanelTab === "hotspot" && selectedHotspot ? (
                  /* Hotspot Detail Panel */
                  <div className="space-y-4">
                    {/* Hotspot Header */}
                    <div className="flex items-start justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-900 leading-tight">
                            {selectedHotspot.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedHotspot.locality} &bull; {selectedHotspot.wardZone}
                        </p>
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                          Coordinates: {selectedHotspot.latitude.toFixed(4)}°N, {selectedHotspot.longitude.toFixed(4)}°E
                        </div>
                      </div>

                      <div className="text-right">
                        {(() => {
                          const selectedRisk = engineOutput.results.find((r) => r.hotspotId === selectedHotspot.id);
                          const cat = selectedRisk ? selectedRisk.riskCategory : getInitialDisplayLevel(selectedHotspot);
                          const styles = getRiskCategoryStyles(cat);
                          return (
                            <>
                              <span
                                className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${styles.badgeClass}`}
                              >
                                {cat} RISK
                              </span>
                              {selectedRisk && (
                                <div className="text-[11px] font-bold text-slate-700 mt-1">
                                  Simulated Score: {selectedRisk.dynamicScore}/100
                                </div>
                              )}
                            </>
                          );
                        })()}
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Elev: {selectedHotspot.elevationMeters}m MSL
                        </div>
                      </div>
                    </div>

                    {/* Prototype Data Notice Banner */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-md p-2 text-[11px] text-amber-800 flex items-start gap-1.5">
                      <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Prototype Demonstration Dataset:</strong> Factors below are synthetic operational indicators for decision-support prototyping, not official JMC measurements.
                      </div>
                    </div>

                    {/* Contributing Factors Meter Breakdown */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Contributing Vulnerability Factors</span>
                        <span className="text-[11px] font-normal text-slate-400">Scale: 0–100</span>
                      </h4>

                      <div className="space-y-2 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                        {/* Drainage Vulnerability */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-700">Drainage Vulnerability</span>
                            <span className="font-bold text-slate-900">
                              {selectedHotspot.drainageVulnerability}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${selectedHotspot.drainageVulnerability}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Historical Risk */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-700">Historical Waterlogging Tendency</span>
                            <span className="font-bold text-slate-900">
                              {selectedHotspot.historicalRisk}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${selectedHotspot.historicalRisk}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Blockage Factor */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-700">Blockage &amp; Silt Obstruction</span>
                            <span className="font-bold text-slate-900">
                              {selectedHotspot.blockageFactor}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-orange-500 h-full rounded-full"
                              style={{ width: `${selectedHotspot.blockageFactor}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Rainfall Sensitivity */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-700">Rainfall Intensity Factor</span>
                            <span className="font-bold text-slate-900">
                              {selectedHotspot.rainfallFactor}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-cyan-600 h-full rounded-full"
                              style={{ width: `${selectedHotspot.rainfallFactor}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Terrain Vulnerability */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-700">Terrain Slope &amp; Low-bowl Factor</span>
                            <span className="font-bold text-slate-900">
                              {selectedHotspot.terrainVulnerability}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${selectedHotspot.terrainVulnerability}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Population Impact Proxy */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-700">Urban Impact / Exposure Proxy</span>
                            <span className="font-bold text-slate-900">
                              {selectedHotspot.populationImpactProxy}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-slate-700 h-full rounded-full"
                              style={{ width: `${selectedHotspot.populationImpactProxy}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Antecedent Moisture (Scenario Condition) */}
                        <div>
                          {(() => {
                            const selectedRisk = engineOutput.results.find((r) => r.hotspotId === selectedHotspot.id);
                            const contrib = selectedRisk ? selectedRisk.scoreBreakdown.antecedentContribution : 0;
                            return (
                              <>
                                <div className="flex justify-between text-[11px] mb-1">
                                  <span className="font-medium text-slate-700">
                                    Antecedent Moisture (Soil Saturation)
                                  </span>
                                  <span className="font-bold text-cyan-700">
                                    {scenarioParams.antecedentMoisture}% (+{contrib} pts)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${scenarioParams.antecedentMoisture}%` }}
                                  ></div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Primary Corridor & Context */}
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs space-y-1">
                      <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5 text-blue-600" />
                        Linked Drainage Conduit:
                      </div>
                      <div className="text-slate-700 font-medium pl-5">
                        {selectedHotspot.primaryDrainageCorridor}
                      </div>
                    </div>

                    {/* Risk Explanation */}
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                        Drainage Risk Explanation
                      </h4>
                      <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-md border border-slate-200 text-xs">
                        {selectedHotspot.riskExplanation}
                      </p>
                    </div>

                    {/* Recommended Action */}
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                        Recommended Municipal Action (Prototype)
                      </h4>
                      <div className="p-2.5 rounded-md bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{selectedHotspot.recommendedAction}</span>
                      </div>
                    </div>

                    {/* Optional Quick Action to trigger coordinate evaluation */}
                    <Button
                      onClick={handleCoordinateSubmit}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Running AI Evaluation...
                        </>
                      ) : (
                        <>
                          <Activity className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                          Evaluate AI Narrative for this Hotspot
                        </>
                      )}
                    </Button>
                  </div>
                ) : activePanelTab === "hotspot" && !selectedHotspot ? (
                  <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                    <MapPin className="h-8 w-8 mx-auto text-slate-300" />
                    <p className="font-medium text-slate-600">No Hotspot Selected</p>
                    <p>Select any pin on the map or click a hotspot from the index below.</p>
                  </div>
                ) : activePanelTab !== "engine" ? (
                  /* Custom Coordinates & Image Analysis Tab */
                  <div className="space-y-4">
                    <Tabs
                      value={analysisType}
                      onValueChange={(value) =>
                        setAnalysisType(value as "coordinates" | "image")
                      }
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 text-xs">
                        <TabsTrigger value="coordinates" className="flex items-center gap-1.5 text-xs">
                          <MapPin className="h-3.5 w-3.5" />
                          Coordinates
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex items-center gap-1.5 text-xs">
                          <Image className="h-3.5 w-3.5" />
                          Image Analysis
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="coordinates" className="space-y-3 mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                            <Input
                              id="latitude"
                              type="number"
                              step="any"
                              placeholder="32.7266"
                              value={inputLat}
                              onChange={(e) => setInputLat(e.target.value)}
                              className="text-xs h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                            <Input
                              id="longitude"
                              type="number"
                              step="any"
                              placeholder="74.8570"
                              value={inputLng}
                              onChange={(e) => setInputLng(e.target.value)}
                              className="text-xs h-8"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleCoordinateSubmit}
                          disabled={isLoading}
                          className="w-full text-xs h-9 bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              Evaluating Coordinates...
                            </>
                          ) : (
                            <>
                              <MapPin className="mr-2 h-3.5 w-3.5" />
                              Analyze Coordinates
                            </>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="image" className="space-y-3 mt-3">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          {!imagePreview ? (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 mx-auto text-slate-400" />
                              <div>
                                <p className="text-xs font-medium text-slate-700">
                                  Upload terrain or drain image
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  JPG, PNG up to 10MB
                                </p>
                              </div>
                              <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                              >
                                <Camera className="mr-1.5 h-3 w-3" />
                                Choose Image
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-36 mx-auto rounded-lg shadow-sm"
                              />
                              <div className="flex gap-2 justify-center">
                                <Button
                                  onClick={() => fileInputRef.current?.click()}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                >
                                  Change
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview("");
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={handleImageAnalysis}
                          disabled={isLoading || !selectedImage}
                          className="w-full text-xs h-9 bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              Analyzing Image...
                            </>
                          ) : (
                            <>
                              <Image className="mr-2 h-3.5 w-3.5" />
                              Analyze Terrain Image
                            </>
                          )}
                        </Button>
                      </TabsContent>
                    </Tabs>

                    {/* AI Assessment Result if analyzed */}
                    {floodRisk && (
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRiskIcon(floodRisk.riskLevel)}
                            <span className="font-semibold text-xs">Evaluated Risk</span>
                          </div>
                          <Badge
                            variant={getRiskVariant(floodRisk.riskLevel)}
                            className="text-xs"
                          >
                            {floodRisk.riskLevel}
                          </Badge>
                        </div>

                        <p className="text-slate-600 text-xs leading-relaxed">
                          {floodRisk.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {floodRisk.elevation}m
                            </div>
                            <div className="text-[10px] text-slate-500">Elevation</div>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {floodRisk.distanceFromWater}m
                            </div>
                            <div className="text-[10px] text-slate-500">Distance to Outfall</div>
                          </div>
                        </div>

                        {aiAnalysis && (
                          <div className="text-xs">
                            <h4 className="font-semibold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">
                              Reasoning Narrative
                            </h4>
                            <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] whitespace-pre-wrap">
                              {aiAnalysis}
                            </p>
                          </div>
                        )}

                        <div className="text-xs">
                          <h4 className="font-semibold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">
                            Recommended Measures
                          </h4>
                          <ul className="space-y-1">
                            {floodRisk.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Civic-Tech Prototype Disclaimer Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-600">
            NallahPulse &bull; Jammu Urban Waterlogging Intelligence &bull; Civic-Technology Prototype
          </p>
          <p className="text-[11px] text-slate-400 max-w-3xl mx-auto">
            All numerical factors, elevation estimates, and illustrative drainage layers are synthetic demonstration values intended for decision-support prototyping and research. This application is not an official municipal dispatch system or official flood warning from the Jammu Municipal Corporation (JMC).
          </p>
        </footer>
      </main>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Notice</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
