/**
 * NallahPulse - Jammu Urban Waterlogging Intelligence
 * Central Source-of-Truth Dataset for Jammu Prototype Hotspots
 *
 * NOTE: All indicators, historical tendencies, and blockage factors are
 * PROTOTYPE / DEMONSTRATION VALUES for decision-support modeling.
 * They are NOT official measurements or official flood advisories from
 * Jammu Municipal Corporation (JMC).
 */

export type RiskCategory = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export interface JammuHotspot {
  id: string;
  name: string;
  locality: string;
  wardZone: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;

  // Normalized risk indicator factors (0 - 100)
  rainfallFactor: number;
  drainageVulnerability: number;
  historicalRisk: number;
  terrainVulnerability: number;
  blockageFactor: number;
  populationImpactProxy: number;

  primaryDrainageCorridor: string;
  riskExplanation: string;
  recommendedAction: string;
  dataClassification: "PROTOTYPE_DEMONSTRATION";
}

export interface JammuDrainageCorridor {
  id: string;
  name: string;
  description: string;
  riskContext: string;
  coordinates: [number, number][]; // Lat, Lng polyline
}

/**
 * 10 Curated Prototype Hotspots across Jammu Urban Area
 */
export const JAMMU_HOTSPOTS: JammuHotspot[] = [
  {
    id: "hotspot-krishna-nagar",
    name: "Krishna Nagar",
    locality: "Krishna Nagar & Science College Area",
    wardZone: "Central Ward 12",
    latitude: 32.7285,
    longitude: 74.8522,
    elevationMeters: 312,
    rainfallFactor: 88,
    drainageVulnerability: 94,
    historicalRisk: 92,
    terrainVulnerability: 80,
    blockageFactor: 90,
    populationImpactProxy: 92,
    primaryDrainageCorridor: "Science College Main Trunk Nallah",
    riskExplanation:
      "Low-lying topographic depression along the Science College nallah route. Severe channel narrowing at railway/road culverts causes chronic backwater accumulation during sudden showers.",
    recommendedAction:
      "Immediate pre-storm channel dredging, deployment of heavy de-watering pumps, and placement of intake debris interceptors.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-muthi",
    name: "Muthi",
    locality: "Muthi Gaon & Barnai Link",
    wardZone: "West Ward 36",
    latitude: 32.7562,
    longitude: 74.8085,
    elevationMeters: 345,
    rainfallFactor: 72,
    drainageVulnerability: 88,
    historicalRisk: 85,
    terrainVulnerability: 60,
    blockageFactor: 82,
    populationImpactProxy: 70,
    primaryDrainageCorridor: "Muthi-Barnai Natural Nallah",
    riskExplanation:
      "Rapid foothill sheet-runoff converges into an unlined natural nallah. Heavy silt deposition and culvert narrowing at market crossings restrict hydraulic capacity.",
    recommendedAction:
      "Clear silt traps at Barnai intake, desilt road culverts, and mobilize rapid-response trash clearing teams.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-jewel-chowk",
    name: "Jewel Chowk",
    locality: "Jewel Commercial Nexus & Prem Nagar",
    wardZone: "Central Ward 14",
    latitude: 32.7188,
    longitude: 74.8582,
    elevationMeters: 318,
    rainfallFactor: 78,
    drainageVulnerability: 80,
    historicalRisk: 86,
    terrainVulnerability: 65,
    blockageFactor: 75,
    populationImpactProxy: 96,
    primaryDrainageCorridor: "Jewel-Gumat Deep Outfall Channel",
    riskExplanation:
      "Critical transit crossroads receiving steep surface runoff from higher Gumat and Old City slopes into undersized roadside drainage grates.",
    recommendedAction:
      "Station municipal suction machinery on standby, implement traffic diversion protocols, and clear arterial curb inlets.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-nai-basti",
    name: "Nai Basti",
    locality: "Nai Basti - Shastri Nagar Lowland",
    wardZone: "South Ward 23",
    latitude: 32.7008,
    longitude: 74.8565,
    elevationMeters: 308,
    rainfallFactor: 72,
    drainageVulnerability: 84,
    historicalRisk: 80,
    terrainVulnerability: 68,
    blockageFactor: 76,
    populationImpactProxy: 82,
    primaryDrainageCorridor: "Shastri Nagar-Nai Basti Nallah",
    riskExplanation:
      "Depressed residential basin subject to reverse-gradient waterlogging whenever the primary carrier nallah reaches peak capacity.",
    recommendedAction:
      "Inspect one-way stormwater flap gates, station trailer-mounted high-flow suction pumps, and clear vegetation from nallah bed.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-preet-nagar",
    name: "Preet Nagar",
    locality: "Preet Nagar - Digiana Border",
    wardZone: "South-East Ward 44",
    latitude: 32.6935,
    longitude: 74.8725,
    elevationMeters: 305,
    rainfallFactor: 70,
    drainageVulnerability: 82,
    historicalRisk: 79,
    terrainVulnerability: 66,
    blockageFactor: 86,
    populationImpactProxy: 74,
    primaryDrainageCorridor: "Digiana-Preet Nagar Link Canal",
    riskExplanation:
      "Solid waste choke-points and shallow cross-drains severely restrict runoff conveyance before joining the downstream industrial bypass.",
    recommendedAction:
      "Mechanical desilting of choked culverts, installation of floating trash barriers, and community anti-dumping enforcement.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-patta-bohri",
    name: "Patta Bohri",
    locality: "Patta Bohri & Talab Tillo Road",
    wardZone: "West Ward 40",
    latitude: 32.7245,
    longitude: 74.8152,
    elevationMeters: 322,
    rainfallFactor: 68,
    drainageVulnerability: 76,
    historicalRisk: 72,
    terrainVulnerability: 58,
    blockageFactor: 70,
    populationImpactProxy: 84,
    primaryDrainageCorridor: "Talab Tillo Secondary Carrier",
    riskExplanation:
      "Low hydraulic gradient combined with high commercial pavement density generates extensive street waterlogging along primary market frontage.",
    recommendedAction:
      "Clear curb inlets along Talab Tillo road, mobilize mobile pump trailers, and clear discharge outfalls.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-dogra-chowk",
    name: "Dogra Chowk",
    locality: "Dogra Chowk & Tawi Bridge Approach",
    wardZone: "East Ward 19",
    latitude: 32.7215,
    longitude: 74.8645,
    elevationMeters: 315,
    rainfallFactor: 75,
    drainageVulnerability: 72,
    historicalRisk: 70,
    terrainVulnerability: 62,
    blockageFactor: 60,
    populationImpactProxy: 90,
    primaryDrainageCorridor: "Tawi Bank Outfall Drain",
    riskExplanation:
      "Arterial approach grade before River Tawi bridge collects localized runoff, leading to traffic bottlenecks during sudden downpours.",
    recommendedAction:
      "Ensure outfall flap readiness to River Tawi, clear bridge apron collection traps, and coordinate traffic wardens.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-rajinder-nagar",
    name: "Rajinder Nagar",
    locality: "Rajinder Nagar - Canal Road Fringe",
    wardZone: "North Ward 9",
    latitude: 32.7292,
    longitude: 74.8415,
    elevationMeters: 330,
    rainfallFactor: 85,
    drainageVulnerability: 74,
    historicalRisk: 68,
    terrainVulnerability: 52,
    blockageFactor: 65,
    populationImpactProxy: 78,
    primaryDrainageCorridor: "Ranbir Canal Auxiliary Drain",
    riskExplanation:
      "High sensitivity to short intense bursts due to high roof and asphalt coverage; runoff quickly overwhelms collector masonry drains.",
    recommendedAction:
      "Install high-capacity runoff bypass screens and routinely dredge secondary stormwater lines.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-gangyal",
    name: "Gangyal",
    locality: "Gangyal Industrial Complex",
    wardZone: "South Ward 56",
    latitude: 32.6785,
    longitude: 74.8692,
    elevationMeters: 298,
    rainfallFactor: 62,
    drainageVulnerability: 70,
    historicalRisk: 65,
    terrainVulnerability: 48,
    blockageFactor: 78,
    populationImpactProxy: 68,
    primaryDrainageCorridor: "Gangyal Industrial Storm Corridor",
    riskExplanation:
      "Flat plain topography with industrial sedimentation and runoff; cross-drainage culverts constrained by legacy structures.",
    recommendedAction:
      "Excavator clearance of industrial culverts, industrial sediment entrapment, and inspection of outfall culverts.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
  {
    id: "hotspot-bantalab",
    name: "Bantalab",
    locality: "Bantalab Upper Ridge",
    wardZone: "North Ward 63",
    latitude: 32.7835,
    longitude: 74.8210,
    elevationMeters: 382,
    rainfallFactor: 45,
    drainageVulnerability: 35,
    historicalRisk: 28,
    terrainVulnerability: 45,
    blockageFactor: 30,
    populationImpactProxy: 55,
    primaryDrainageCorridor: "Kheri-Bantalab Upland Ravine",
    riskExplanation:
      "Elevated ridge topography with good natural slope drainage. Vulnerability is primarily restricted to brief flash runoff along unpaved shoulder drains.",
    recommendedAction:
      "Routine roadside ditch maintenance and prevention of loose gravel accumulation in catch basins.",
    dataClassification: "PROTOTYPE_DEMONSTRATION",
  },
];

/**
 * 4 Illustrative Drainage / Nallah Corridors for Geographic Visual Context
 * (Illustrative Prototype Layer - NOT official engineering survey lines)
 */
export const JAMMU_DRAINAGE_CORRIDORS: JammuDrainageCorridor[] = [
  {
    id: "corridor-science-college",
    name: "Science College - Krishna Nagar Trunk Nallah",
    description: "Primary central natural stormwater artery discharging toward River Tawi",
    riskContext: "Chronic backwater vulnerability due to low slope gradient and dense residential encroachment.",
    coordinates: [
      [32.7380, 74.8420],
      [32.7330, 74.8475],
      [32.7285, 74.8522],
      [32.7230, 74.8570],
      [32.7160, 74.8630],
    ],
  },
  {
    id: "corridor-muthi-barnai",
    name: "Muthi - Barnai Natural Drainage Corridor",
    description: "North-western foothill storm channel channeling runoff to western agricultural floodplains",
    riskContext: "Prone to sudden debris choking at roadside culverts during heavy rainfall spells.",
    coordinates: [
      [32.7720, 74.8000],
      [32.7630, 74.8040],
      [32.7562, 74.8085],
      [32.7480, 74.8130],
      [32.7370, 74.8190],
    ],
  },
  {
    id: "corridor-jewel-gumat",
    name: "Jewel - Gumat Transit Storm Channel",
    description: "Old City southern ravine draining into the main River Tawi basin",
    riskContext: "High velocity downhill discharge entering restricted urban culverts.",
    coordinates: [
      [32.7265, 74.8520],
      [32.7210, 74.8550],
      [32.7188, 74.8582],
      [32.7205, 74.8635],
      [32.7225, 74.8690],
    ],
  },
  {
    id: "corridor-gangyal-digiana",
    name: "Gangyal - Digiana - Preet Nagar Carrier",
    description: "South Jammu industrial corridor draining southward toward the plains",
    riskContext: "Susceptible to industrial debris blockages and limited channel bed slope.",
    coordinates: [
      [32.7050, 74.8580],
      [32.6980, 74.8650],
      [32.6935, 74.8725],
      [32.6850, 74.8710],
      [32.6785, 74.8692],
    ],
  },
];

/**
 * Temporary Display Level Classifier
 * Derived from prototype contributing factors.
 * Designed to be replaced cleanly by the Phase 3 Risk Engine.
 */
export function getInitialDisplayLevel(hotspot: JammuHotspot): RiskCategory {
  // Weighted prototype composite index
  const composite =
    hotspot.drainageVulnerability * 0.35 +
    hotspot.historicalRisk * 0.35 +
    hotspot.blockageFactor * 0.15 +
    hotspot.terrainVulnerability * 0.15;

  if (composite >= 80) return "CRITICAL";
  if (composite >= 68) return "HIGH";
  if (composite >= 48) return "MODERATE";
  return "LOW";
}

/**
 * Visual styling token mapping for Risk Categories
 */
export function getRiskCategoryStyles(category: RiskCategory) {
  switch (category) {
    case "CRITICAL":
      return {
        label: "CRITICAL",
        color: "#DC2626", // Red
        bgLight: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        badgeClass: "bg-red-100 text-red-800 border-red-300",
        ringClass: "ring-red-400",
      };
    case "HIGH":
      return {
        label: "HIGH",
        color: "#EA580C", // Orange
        bgLight: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
        ringClass: "ring-orange-400",
      };
    case "MODERATE":
      return {
        label: "MODERATE",
        color: "#D97706", // Amber / Yellow
        bgLight: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
        ringClass: "ring-amber-400",
      };
    case "LOW":
      return {
        label: "LOW",
        color: "#16A34A", // Green
        bgLight: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
        ringClass: "ring-emerald-400",
      };
  }
}

/**
 * Dynamic KPI Aggregator
 */
export function getHotspotKPIs(
  hotspots: JammuHotspot[] = JAMMU_HOTSPOTS,
  riskResults?: { hotspotId: string; riskCategory: RiskCategory }[]
) {
  let criticalCount = 0;
  let highCount = 0;
  let moderateCount = 0;
  let lowCount = 0;

  let totalDrainageVuln = 0;
  let totalBlockage = 0;

  for (const h of hotspots) {
    const dynamicMatch = riskResults?.find((r) => r.hotspotId === h.id);
    const level = dynamicMatch ? dynamicMatch.riskCategory : getInitialDisplayLevel(h);
    if (level === "CRITICAL") criticalCount++;
    else if (level === "HIGH") highCount++;
    else if (level === "MODERATE") moderateCount++;
    else if (level === "LOW") lowCount++;

    totalDrainageVuln += h.drainageVulnerability;
    totalBlockage += h.blockageFactor;
  }

  const count = hotspots.length;
  const attentionCount = criticalCount + highCount;
  const avgDrainageVulnerability = count > 0 ? Math.round(totalDrainageVuln / count) : 0;
  const avgBlockageFactor = count > 0 ? Math.round(totalBlockage / count) : 0;

  return {
    totalMonitored: count,
    criticalCount,
    highCount,
    moderateCount,
    lowCount,
    attentionCount,
    avgDrainageVulnerability,
    avgBlockageFactor,
  };
}
