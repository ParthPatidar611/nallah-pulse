"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

interface FloodRiskData {
  riskLevel: "Low" | "Medium" | "High" | "Very High";
  description: string;
  recommendations: string[];
  elevation: number;
  distanceFromWater: number;
}

export default function FloodDetectionSystem() {
  const [inputLat, setInputLat] = useState("");
  const [inputLng, setInputLng] = useState("");
  const [floodRisk, setFloodRisk] = useState<FloodRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<"coordinates" | "image">(
    "coordinates"
  );
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | undefined>(undefined);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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
  }, []);

  // Default map center (Jammu, Jammu & Kashmir)
  const defaultCenter: [number, number] = [32.7266, 74.8570];

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number) => {
    setInputLat(lat.toString());
    setInputLng(lng.toString());
    setSelectedLocation([lat, lng]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 rounded-2xl mr-3 shadow-sm border border-blue-200">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                NallahPulse
              </h1>
              <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                Jammu Urban Waterlogging Intelligence
              </p>
            </div>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">
            NallahPulse is a prototype urban drainage intelligence system for Jammu that identifies waterlogging risk, explains contributing factors, and helps prioritize intervention.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Civic-Tech Prototype &bull; Demonstrative Data &bull; Not an Official Municipal System
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Analysis Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={analysisType}
                onValueChange={(value) =>
                  setAnalysisType(value as "coordinates" | "image")
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="coordinates"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Coordinates
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Image Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="coordinates" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="32.7266"
                        value={inputLat}
                        onChange={(e) => setInputLat(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="74.8570"
                        value={inputLng}
                        onChange={(e) => setInputLng(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCoordinateSubmit}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Analyze Coordinates
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {!imagePreview ? (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 mx-auto text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              Upload terrain image
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              JPG, PNG, or GIF up to 10MB
                            </p>
                          </div>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            size="sm"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Choose Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg shadow-sm"
                          />
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                              size="sm"
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Change Image
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview("");
                              }}
                              variant="outline"
                              size="sm"
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
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Image className="mr-2 h-4 w-4" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Waterlogging Risk Assessment (Prototype)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-slate-600">
                    {analysisType === "coordinates"
                      ? "Evaluating drainage & waterlogging indicators..."
                      : "Analyzing terrain imagery..."}
                  </p>
                </div>
              )}

              {floodRisk && !isLoading && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(floodRisk.riskLevel)}
                      <span className="font-semibold">Risk Level</span>
                    </div>
                    <Badge
                      variant={getRiskVariant(floodRisk.riskLevel)}
                      className="text-sm"
                    >
                      {floodRisk.riskLevel}
                    </Badge>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {floodRisk.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {floodRisk.elevation}m
                      </div>
                      <div className="text-xs text-slate-500">Elevation</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {floodRisk.distanceFromWater}m
                      </div>
                      <div className="text-xs text-slate-500">From Drainage / Water</div>
                    </div>
                  </div>

                  {aiAnalysis && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-slate-700 mb-3">
                          AI Analysis
                        </h4>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">
                            {aiAnalysis}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {floodRisk.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!floodRisk && !isLoading && (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a location on the Jammu map or enter coordinates to evaluate drainage risk</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Jammu Drainage &amp; Waterlogging Map
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Click anywhere in Jammu to select coordinates, or use the input fields above
            </p>
          </CardHeader>
          <CardContent>
            <InteractiveMap
              center={defaultCenter}
              zoom={12}
              selectedLocation={selectedLocation}
              riskLevel={floodRisk?.riskLevel}
              onLocationSelect={handleLocationSelect}
            />
          </CardContent>
        </Card>

        {/* Civic-Tech Prototype Disclaimer */}
        <footer className="mt-8 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
          <p>
            NallahPulse is a civic-technology prototype for research and evaluation purposes. All indicators and scores are demonstrative and not official Jammu Municipal Corporation (JMC) warnings or flood advisories.
          </p>
        </footer>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Input Error</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
