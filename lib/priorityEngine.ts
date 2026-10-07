/**
 * NallahPulse Phase 4 – Municipal Intervention Priority Engine
 *
 * Translates changing waterlogging risk and urban vulnerability into an
 * actionable, explainable municipal intervention priority score (0–100)
 * and triage ranking.
 *
 * PROTOTYPE / DEMONSTRATION METHODOLOGY:
 * This is a decision-support prototype weighting formula.
 * It is NOT an official Jammu Municipal Corporation (JMC) prioritization formula.
 */

import { JammuHotspot, RiskCategory } from "@/lib/data/jammuHotspots";
import { HotspotRiskResult, ScenarioParams, AlertStatus } from "@/lib/riskEngine";

// ─────────────────────────────────────────────────────────────
// Priority Types & Definitions
// ─────────────────────────────────────────────────────────────

export type PriorityTier = "IMMEDIATE" | "HIGH_PRIORITY" | "MONITOR" | "LOW_PRIORITY";

export interface PriorityDriverBreakdown {
  riskComponent: number;        // riskScore * 0.60
  populationComponent: number;  // populationImpactProxy * 0.20
  blockageComponent: number;    // blockageFactor * 0.10
  drainageComponent: number;    // drainageVulnerability * 0.10
}

export interface HotspotPriorityResult {
  hotspotId: string;
  hotspotName: string;
  locality: string;
  wardZone: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;

  /** Dynamic rank derived from current scenario (1 = highest urgency) */
  rank: number;

  /** Composite Municipal Priority Score (0–100) */
  priorityScore: number;

  /** Priority tier category */
  priorityTier: PriorityTier;

  /** Human-readable tier label */
  priorityLabel: string;

  /** LIVE risk score consumed from the Risk Engine */
  riskScore: number;

  /** LIVE risk category from the Risk Engine */
  riskCategory: RiskCategory;

  /** City alert tier */
  alertStatus: AlertStatus;

  // Contributing vulnerability indicators
  populationImpactProxy: number;
  blockageFactor: number;
  drainageVulnerability: number;

  /** Primary driver of current prioritization */
  primaryDriver: string;

  /** Transparent 4-factor numerical breakdown */
  driverBreakdown: PriorityDriverBreakdown;

  /** Concise action tag for compact lists/tables */
  shortAction: string;

  /** Contextual prototype intervention recommendation */
  recommendedAction: string;

  /** Plain-language deterministic justification of priority */
  priorityExplanation: string;

  primaryDrainageCorridor: string;
  riskExplanation: string;
}

export interface PriorityCitySummary {
  immediateCount: number;
  highPriorityCount: number;
  monitorCount: number;
  lowPriorityCount: number;
  topPriorityHotspot: HotspotPriorityResult | null;
}

export interface PriorityEngineOutput {
  results: HotspotPriorityResult[];
  summary: PriorityCitySummary;
  computedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Calculation Utilities
// ─────────────────────────────────────────────────────────────

/**
 * Priority Scoring Weights (Prototype Methodology):
 * - Live Waterlogging Risk = 60%
 * - Population / Affected-Area Proxy = 20%
 * - Blockage Severity = 10%
 * - Drainage Vulnerability = 10%
 */
export function calculatePriorityScore(
  riskScore: number,
  populationImpactProxy: number,
  blockageFactor: number,
  drainageVulnerability: number
): { score: number; breakdown: PriorityDriverBreakdown } {
  const safeRisk = Math.max(0, Math.min(100, riskScore));
  const safePop = Math.max(0, Math.min(100, populationImpactProxy));
  const safeBlock = Math.max(0, Math.min(100, blockageFactor));
  const safeDrain = Math.max(0, Math.min(100, drainageVulnerability));

  const riskComponent = safeRisk * 0.60;
  const populationComponent = safePop * 0.20;
  const blockageComponent = safeBlock * 0.10;
  const drainageComponent = safeDrain * 0.10;

  const rawTotal = riskComponent + populationComponent + blockageComponent + drainageComponent;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  return {
    score: clampedScore,
    breakdown: {
      riskComponent: Math.round(riskComponent * 10) / 10,
      populationComponent: Math.round(populationComponent * 10) / 10,
      blockageComponent: Math.round(blockageComponent * 10) / 10,
      drainageComponent: Math.round(drainageComponent * 10) / 10,
    },
  };
}

/**
 * Priority Tiers:
 * 80–100: IMMEDIATE
 * 60–79:  HIGH PRIORITY
 * 40–59:  MONITOR / PREPARE
 * 0–39:   LOW PRIORITY
 */
export function getPriorityTier(score: number): PriorityTier {
  if (score >= 80) return "IMMEDIATE";
  if (score >= 60) return "HIGH_PRIORITY";
  if (score >= 40) return "MONITOR";
  return "LOW_PRIORITY";
}

export function getPriorityLabel(tier: PriorityTier): string {
  switch (tier) {
    case "IMMEDIATE":
      return "IMMEDIATE";
    case "HIGH_PRIORITY":
      return "HIGH PRIORITY";
    case "MONITOR":
      return "MONITOR / PREPARE";
    case "LOW_PRIORITY":
      return "LOW PRIORITY";
  }
}

export function getPriorityStyles(tier: PriorityTier) {
  switch (tier) {
    case "IMMEDIATE":
      return {
        label: "IMMEDIATE",
        badge: "bg-red-600 text-white border-red-700 shadow-sm",
        lightBadge: "bg-red-100 text-red-800 border border-red-300",
        color: "#DC2626",
        dot: "bg-red-600",
        border: "border-red-500",
        bgLight: "bg-red-50/70",
        text: "text-red-700",
      };
    case "HIGH_PRIORITY":
      return {
        label: "HIGH PRIORITY",
        badge: "bg-orange-500 text-white border-orange-600 shadow-sm",
        lightBadge: "bg-orange-100 text-orange-800 border border-orange-300",
        color: "#EA580C",
        dot: "bg-orange-500",
        border: "border-orange-500",
        bgLight: "bg-orange-50/70",
        text: "text-orange-700",
      };
    case "MONITOR":
      return {
        label: "MONITOR / PREPARE",
        badge: "bg-amber-400 text-amber-950 border-amber-500 shadow-sm",
        lightBadge: "bg-amber-100 text-amber-900 border border-amber-300",
        color: "#D97706",
        dot: "bg-amber-400",
        border: "border-amber-400",
        bgLight: "bg-amber-50/70",
        text: "text-amber-800",
      };
    case "LOW_PRIORITY":
    default:
      return {
        label: "LOW PRIORITY",
        badge: "bg-emerald-600 text-white border-emerald-700 shadow-sm",
        lightBadge: "bg-emerald-100 text-emerald-800 border border-emerald-300",
        color: "#16A34A",
        dot: "bg-emerald-500",
        border: "border-emerald-500",
        bgLight: "bg-emerald-50/70",
        text: "text-emerald-700",
      };
  }
}

/**
 * Deterministically identifies the primary vulnerability driver
 */
function determinePrimaryDriver(
  hotspot: JammuHotspot,
  riskResult: HotspotRiskResult,
  scenarioParams: ScenarioParams
): string {
  if (scenarioParams.blockageState === "Blocked" || hotspot.blockageFactor >= 85) {
    return "Severe Silt & Channel Blockage";
  }
  if (scenarioParams.isFlashEvent && riskResult.dynamicScore >= 70) {
    return "Rapid Flash Surge / Inflow";
  }
  if (hotspot.drainageVulnerability >= 85) {
    return "Severe Drainage Vulnerability";
  }
  if (hotspot.populationImpactProxy >= 90) {
    return "Dense Urban Population Exposure";
  }
  if (riskResult.dynamicScore >= 75) {
    return "High Live Waterlogging Risk";
  }
  if (hotspot.blockageFactor >= 75) {
    return "Channel Obstruction";
  }
  if (hotspot.drainageVulnerability >= 75) {
    return "Drainage Conduit Bottleneck";
  }
  if (hotspot.terrainVulnerability >= 75) {
    return "Low-Lying Terrain Depression";
  }
  return "Baseline Drainage Inadequacy";
}

/**
 * Deterministically generates recommended prototype intervention
 */
export function getRecommendedAction(
  hotspot: JammuHotspot,
  riskResult: HotspotRiskResult,
  priorityScore: number,
  scenarioParams: ScenarioParams
): { shortAction: string; recommendedAction: string } {
  // Scenario 1: Blocked condition active or severe physical blockage
  if (scenarioParams.blockageState === "Blocked" || hotspot.blockageFactor >= 85) {
    return {
      shortAction: "Clear Blockage",
      recommendedAction:
        "Emergency mechanical desilting required. Clear culvert intake obstructions and trash grates along " +
        hotspot.primaryDrainageCorridor + ".",
    };
  }

  // Scenario 2: Flash storm active and high dynamic risk
  if (scenarioParams.isFlashEvent && riskResult.dynamicScore >= 65) {
    return {
      shortAction: "Deploy Rapid Crew",
      recommendedAction:
        "Mobilize rapid-response dewatering crew and establish traffic diversion at low points along " +
        hotspot.locality + ".",
    };
  }

  // Scenario 3: High Priority / Immediate with high drainage vulnerability
  if (priorityScore >= 80) {
    if (hotspot.populationImpactProxy >= 85) {
      return {
        shortAction: "Deploy Response Team",
        recommendedAction:
          "Immediate deployment of high-capacity pump units and field response crew. Prioritize transit intersections and high-density residential corridors.",
      };
    }
    return {
      shortAction: "Inspect & Dredge",
      recommendedAction:
        "Inspect drainage segment and clear intake bottlenecks along " +
        hotspot.primaryDrainageCorridor +
        ". Pre-position mobile pumping assets.",
    };
  }

  // Scenario 4: High Priority (60–79)
  if (priorityScore >= 60) {
    if (hotspot.drainageVulnerability >= 80) {
      return {
        shortAction: "Inspect Drainage",
        recommendedAction:
          "Inspect drainage conduit outfall and verify roadside gutter flow capacity. Station standby dewatering units.",
      };
    }
    return {
      shortAction: "Stage Dewatering",
      recommendedAction:
        "Inspect downstream road culverts and stage portable pump trailers at identified low-lying junctions.",
    };
  }

  // Scenario 5: Moderate Priority (40–59)
  if (priorityScore >= 40) {
    return {
      shortAction: "Monitor Inflow",
      recommendedAction:
        "Monitor conduit water level and clear floating debris at culvert screens. Prepare for escalation if rainfall continues.",
    };
  }

  // Scenario 6: Low Priority (0–39)
  return {
    shortAction: "Routine Monitoring",
    recommendedAction:
      "Maintain scheduled routine monitoring. Check silt levels during routine ward maintenance patrol.",
  };
}

/**
 * Deterministically explains why a hotspot has its current priority score
 */
export function getPriorityExplanation(
  hotspot: JammuHotspot,
  riskResult: HotspotRiskResult,
  priorityScore: number,
  tier: PriorityTier
): string {
  const parts: string[] = [];

  if (tier === "IMMEDIATE") {
    parts.push(
      `Priority is elevated to IMMEDIATE (Score: ${priorityScore}/100) because live waterlogging risk is critical (${riskResult.dynamicScore}/100)`
    );
  } else if (tier === "HIGH_PRIORITY") {
    parts.push(
      `Priority is designated as HIGH (Score: ${priorityScore}/100) driven by elevated scenario risk (${riskResult.dynamicScore}/100)`
    );
  } else if (tier === "MONITOR") {
    parts.push(
      `Priority is categorized as MONITOR / PREPARE (Score: ${priorityScore}/100). Simulated risk is moderate (${riskResult.dynamicScore}/100)`
    );
  } else {
    parts.push(
      `Priority is currently LOW (Score: ${priorityScore}/100) with moderate baseline conditions (${riskResult.dynamicScore}/100)`
    );
  }

  if (hotspot.drainageVulnerability >= 80) {
    parts.push(`drainage vulnerability is severe (${hotspot.drainageVulnerability}/100)`);
  }
  if (hotspot.blockageFactor >= 75) {
    parts.push(`channel obstruction tendency is high (${hotspot.blockageFactor}/100)`);
  }
  if (hotspot.populationImpactProxy >= 85) {
    parts.push(`urban population exposure is significant (${hotspot.populationImpactProxy}/100)`);
  }

  if (parts.length > 1) {
    return parts.join(", alongside ") + ". Prototype intervention prioritized accordingly.";
  }
  return parts[0] + ". Standard preventive protocol advised.";
}

// ─────────────────────────────────────────────────────────────
// Central Priority Engine Execution
// ─────────────────────────────────────────────────────────────

/**
 * Executes the Priority Engine against all monitored hotspots,
 * strictly consuming the live risk engine output.
 *
 * Deterministic Sorting:
 * 1. priorityScore (descending)
 * 2. riskScore (descending)
 * 3. blockageFactor (descending)
 * 4. hotspotName (alphabetical tie-breaker)
 */
export function runPriorityEngine(
  hotspots: JammuHotspot[],
  riskResults: HotspotRiskResult[],
  scenarioParams: ScenarioParams
): PriorityEngineOutput {
  // Map every hotspot to its priority calculation
  const mapped = hotspots.map((h) => {
    const risk = riskResults.find((r) => r.hotspotId === h.id);
    const liveRiskScore = risk ? risk.dynamicScore : 0;
    const liveRiskCategory = risk ? risk.riskCategory : ("LOW" as RiskCategory);
    const liveAlertStatus = risk ? risk.alertStatus : ("GREEN" as AlertStatus);

    const { score, breakdown } = calculatePriorityScore(
      liveRiskScore,
      h.populationImpactProxy,
      h.blockageFactor,
      h.drainageVulnerability
    );

    const tier = getPriorityTier(score);
    const label = getPriorityLabel(tier);
    const primaryDriver = determinePrimaryDriver(h, risk || ({} as any), scenarioParams);
    const { shortAction, recommendedAction } = getRecommendedAction(
      h,
      risk || ({} as any),
      score,
      scenarioParams
    );
    const priorityExplanation = getPriorityExplanation(h, risk || ({} as any), score, tier);

    return {
      hotspotId: h.id,
      hotspotName: h.name,
      locality: h.locality,
      wardZone: h.wardZone,
      latitude: h.latitude,
      longitude: h.longitude,
      elevationMeters: h.elevationMeters,
      rank: 0, // Assigned after sorting
      priorityScore: score,
      priorityTier: tier,
      priorityLabel: label,
      riskScore: liveRiskScore,
      riskCategory: liveRiskCategory,
      alertStatus: liveAlertStatus,
      populationImpactProxy: h.populationImpactProxy,
      blockageFactor: h.blockageFactor,
      drainageVulnerability: h.drainageVulnerability,
      primaryDriver,
      driverBreakdown: breakdown,
      shortAction,
      recommendedAction,
      priorityExplanation,
      primaryDrainageCorridor: h.primaryDrainageCorridor,
      riskExplanation: h.riskExplanation,
    };
  });

  // Deterministic stable sort
  mapped.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    if (b.riskScore !== a.riskScore) {
      return b.riskScore - a.riskScore;
    }
    if (b.blockageFactor !== a.blockageFactor) {
      return b.blockageFactor - a.blockageFactor;
    }
    return a.hotspotName.localeCompare(b.hotspotName);
  });

  // Assign dynamic ranks
  const results: HotspotPriorityResult[] = mapped.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  // Summary counts
  const immediateCount = results.filter((r) => r.priorityTier === "IMMEDIATE").length;
  const highPriorityCount = results.filter((r) => r.priorityTier === "HIGH_PRIORITY").length;
  const monitorCount = results.filter((r) => r.priorityTier === "MONITOR").length;
  const lowPriorityCount = results.filter((r) => r.priorityTier === "LOW_PRIORITY").length;
  const topPriorityHotspot = results.length > 0 ? results[0] : null;

  return {
    results,
    summary: {
      immediateCount,
      highPriorityCount,
      monitorCount,
      lowPriorityCount,
      topPriorityHotspot,
    },
    computedAt: new Date().toISOString(),
  };
}
