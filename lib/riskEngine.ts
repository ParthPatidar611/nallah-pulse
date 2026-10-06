/**
 * NallahPulse Phase 3 – Risk Engine
 *
 * Translates operator-controlled scenario parameters (rainfall intensity,
 * duration, season, blockage override, terrain saturation) into a composite
 * Dynamic Risk Score (0-100) for every hotspot.
 *
 * All models are PROTOTYPE / DEMONSTRATION ONLY.
 * Not an official JMC engineering assessment.
 */

import { JammuHotspot, RiskCategory } from "@/lib/data/jammuHotspots";

// ─────────────────────────────────────────────────────────
// Scenario Parameter Types
// ─────────────────────────────────────────────────────────

export type Season = "Pre-Monsoon" | "Peak-Monsoon" | "Post-Monsoon" | "Winter";
export type BlockageOverride = "Normal" | "Partially Cleared" | "Blocked";
export type AlertStatus = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export interface ScenarioParams {
  /** mm/hour – simulated sustained rainfall intensity */
  rainfallIntensityMmH: number;
  /** Hours of continuous rainfall */
  durationHours: number;
  /** Season modifies base drainage capacity */
  season: Season;
  /** Operator assessment of current blockage state */
  blockageState: BlockageOverride;
  /** 0-100: current soil / ground saturation level */
  antecedentMoisture: number;
  /** Whether current scenario is in rapid-onset (flash) or prolonged */
  isFlashEvent: boolean;
}

export interface HotspotRiskResult {
  hotspotId: string;
  hotspotName: string;
  dynamicScore: number;
  riskCategory: RiskCategory;
  alertStatus: AlertStatus;
  estimatedInundationDepthCm: number;
  estimatedResponseTimeMin: number;
  scoreBreakdown: ScoreBreakdown;
  triggerThresholdExceeded: boolean;
  trendIndicator: "WORSENING" | "STABLE" | "IMPROVING";
}

export interface ScoreBreakdown {
  rainfallContribution: number;
  drainageContribution: number;
  historicalContribution: number;
  blockageContribution: number;
  terrainContribution: number;
  antecedentContribution: number;
}

export interface EngineOutput {
  scenarioParams: ScenarioParams;
  results: HotspotRiskResult[];
  cityAlertStatus: AlertStatus;
  cityWideScore: number;
  criticalHotspots: HotspotRiskResult[];
  recommendedDeployments: string[];
  computedAt: string;
}

// Season drainage capacity modifiers
const SEASON_DRAINAGE_CAPACITY_FACTOR: Record<Season, number> = {
  "Pre-Monsoon":   0.85,
  "Peak-Monsoon":  0.65,
  "Post-Monsoon":  0.90,
  "Winter":        1.00,
};

const SEASON_ANTECEDENT_BOOST: Record<Season, number> = {
  "Pre-Monsoon":   5,
  "Peak-Monsoon":  20,
  "Post-Monsoon":  10,
  "Winter":        0,
};

const BLOCKAGE_MULTIPLIER: Record<BlockageOverride, number> = {
  "Normal":            1.00,
  "Partially Cleared": 1.25,
  "Blocked":           1.60,
};

function rainfallScore(intensityMmH: number, durationHours: number, isFlash: boolean): number {
  const baseScore = Math.min(100, (intensityMmH / 80) * 100);
  const durationMultiplier = isFlash ? 1.0 : Math.min(1.4, 1 + (durationHours - 1) * 0.15);
  return Math.min(100, baseScore * durationMultiplier);
}

function computeHotspotScore(
  hotspot: JammuHotspot,
  params: ScenarioParams
): { total: number; breakdown: ScoreBreakdown } {
  const seasonCapFactor = SEASON_DRAINAGE_CAPACITY_FACTOR[params.season];
  const blockageMultiplier = BLOCKAGE_MULTIPLIER[params.blockageState];
  const antecedentBoost = SEASON_ANTECEDENT_BOOST[params.season];

  const rawRainfall = rainfallScore(params.rainfallIntensityMmH, params.durationHours, params.isFlashEvent);
  const rainfallContrib = rawRainfall * (hotspot.rainfallFactor / 100) * 0.28;

  const effectiveDrainage = hotspot.drainageVulnerability * (1 / seasonCapFactor);
  const drainageContrib = Math.min(100, effectiveDrainage) * blockageMultiplier * 0.30;

  const historicalContrib = hotspot.historicalRisk * 0.20;
  const blockageContrib = hotspot.blockageFactor * blockageMultiplier * 0.12;
  const terrainContrib = hotspot.terrainVulnerability * 0.06;

  const antecedentLevel = Math.min(100, params.antecedentMoisture + antecedentBoost);
  const antecedentContrib = (antecedentLevel / 100) * 12;

  const breakdown: ScoreBreakdown = {
    rainfallContribution: Math.round(rainfallContrib),
    drainageContribution: Math.round(drainageContrib),
    historicalContribution: Math.round(historicalContrib),
    blockageContribution: Math.round(blockageContrib),
    terrainContribution: Math.round(terrainContrib),
    antecedentContribution: Math.round(antecedentContrib),
  };

  const total = Math.min(
    100,
    Math.round(
      rainfallContrib + drainageContrib + historicalContrib +
      blockageContrib + terrainContrib + antecedentContrib
    )
  );

  return { total, breakdown };
}

function scoreToCategory(score: number): RiskCategory {
  if (score >= 78) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 38) return "MODERATE";
  return "LOW";
}

function scoreToAlertStatus(score: number): AlertStatus {
  if (score >= 78) return "RED";
  if (score >= 60) return "ORANGE";
  if (score >= 38) return "YELLOW";
  return "GREEN";
}

function estimateInundationDepth(score: number, intensityMmH: number, terrainVuln: number): number {
  if (score < 38) return 0;
  const base = (score / 100) * (intensityMmH / 80) * 60;
  const terrainFactor = 0.5 + (terrainVuln / 100) * 0.8;
  return Math.round(base * terrainFactor);
}

function estimateResponseWindow(score: number): number {
  if (score >= 85) return 15;
  if (score >= 78) return 30;
  if (score >= 65) return 60;
  if (score >= 50) return 120;
  if (score >= 38) return 240;
  return 999;
}

function computeCityAlertStatus(results: HotspotRiskResult[]): AlertStatus {
  const critical = results.filter((r) => r.alertStatus === "RED").length;
  const orange = results.filter((r) => r.alertStatus === "ORANGE").length;
  const yellow = results.filter((r) => r.alertStatus === "YELLOW").length;
  if (critical >= 2) return "RED";
  if (critical >= 1 || orange >= 3) return "ORANGE";
  if (orange >= 1 || yellow >= 3) return "YELLOW";
  return "GREEN";
}

function generateDeployments(
  cityAlert: AlertStatus,
  criticalHotspots: HotspotRiskResult[],
  params: ScenarioParams
): string[] {
  const msgs: string[] = [];
  if (cityAlert === "RED") {
    msgs.push("FULL DEPLOYMENT: All available JMC pump units to be dispatched to RED-status zones immediately.");
    msgs.push("Activate emergency traffic diversion at all critical crossroads identified below.");
  } else if (cityAlert === "ORANGE") {
    msgs.push("PARTIAL DEPLOYMENT: Pre-position pump trailer units at ORANGE-status zones within 60 minutes.");
  } else if (cityAlert === "YELLOW") {
    msgs.push("STANDBY: Keep maintenance teams on alert; inspect silt traps at YELLOW zones.");
  } else {
    msgs.push("ROUTINE: No immediate deployment required. Continue scheduled monitoring.");
  }
  if (params.blockageState === "Blocked") {
    msgs.push("Prioritise emergency mechanical desilting units - blockage override is active.");
  }
  if (params.isFlashEvent && params.rainfallIntensityMmH >= 50) {
    msgs.push("Flash storm protocol: Implement rapid-response pre-positioning within 15 minutes of event onset.");
  }
  if (criticalHotspots.length > 0) {
    const names = criticalHotspots.slice(0, 3).map((h) => h.hotspotName).join(", ");
    msgs.push("Priority zones requiring immediate attention: " + names + ".");
  }
  if (params.season === "Peak-Monsoon") {
    msgs.push("Peak-Monsoon protocol active: Increase patrol frequency across all corridors.");
  }
  return msgs;
}

export function runRiskEngine(
  hotspots: JammuHotspot[],
  params: ScenarioParams
): EngineOutput {
  const results: HotspotRiskResult[] = hotspots.map((h) => {
    const { total, breakdown } = computeHotspotScore(h, params);
    const category = scoreToCategory(total);
    const alertStatus = scoreToAlertStatus(total);
    const depthCm = estimateInundationDepth(total, params.rainfallIntensityMmH, h.terrainVulnerability);
    const responseMins = estimateResponseWindow(total);
    const exceeded = total >= 78;
    const trendIndicator: "WORSENING" | "STABLE" | "IMPROVING" =
      params.rainfallIntensityMmH > 60 && params.durationHours > 2
        ? "WORSENING"
        : params.rainfallIntensityMmH < 20
        ? "IMPROVING"
        : "STABLE";
    return {
      hotspotId: h.id,
      hotspotName: h.name,
      dynamicScore: total,
      riskCategory: category,
      alertStatus,
      estimatedInundationDepthCm: depthCm,
      estimatedResponseTimeMin: responseMins,
      scoreBreakdown: breakdown,
      triggerThresholdExceeded: exceeded,
      trendIndicator,
    };
  });

  results.sort((a, b) => b.dynamicScore - a.dynamicScore);

  const cityAlertStatus = computeCityAlertStatus(results);
  const cityWideScore = Math.round(results.reduce((s, r) => s + r.dynamicScore, 0) / results.length);
  const criticalHotspots = results.filter((r) => r.alertStatus === "RED" || r.alertStatus === "ORANGE");
  const recommendedDeployments = generateDeployments(cityAlertStatus, criticalHotspots, params);

  return {
    scenarioParams: params,
    results,
    cityAlertStatus,
    cityWideScore,
    criticalHotspots,
    recommendedDeployments,
    computedAt: new Date().toISOString(),
  };
}

export const DEFAULT_SCENARIO_PARAMS: ScenarioParams = {
  rainfallIntensityMmH: 25,
  durationHours: 1,
  season: "Peak-Monsoon",
  blockageState: "Normal",
  antecedentMoisture: 40,
  isFlashEvent: false,
};

export function getAlertStatusStyles(status: AlertStatus) {
  switch (status) {
    case "RED":
      return {
        label: "RED ALERT",
        bg: "bg-red-600",
        text: "text-white",
        light: "bg-red-50 border-red-200",
        lightText: "text-red-800",
        dot: "bg-red-500",
        glow: "shadow-red-200",
        badge: "bg-red-100 text-red-800 border border-red-300",
      };
    case "ORANGE":
      return {
        label: "ORANGE ALERT",
        bg: "bg-orange-500",
        text: "text-white",
        light: "bg-orange-50 border-orange-200",
        lightText: "text-orange-800",
        dot: "bg-orange-500",
        glow: "shadow-orange-200",
        badge: "bg-orange-100 text-orange-800 border border-orange-300",
      };
    case "YELLOW":
      return {
        label: "YELLOW ALERT",
        bg: "bg-amber-400",
        text: "text-amber-900",
        light: "bg-amber-50 border-amber-200",
        lightText: "text-amber-800",
        dot: "bg-amber-400",
        glow: "shadow-amber-200",
        badge: "bg-amber-100 text-amber-800 border border-amber-300",
      };
    case "GREEN":
    default:
      return {
        label: "ALL CLEAR",
        bg: "bg-emerald-500",
        text: "text-white",
        light: "bg-emerald-50 border-emerald-200",
        lightText: "text-emerald-800",
        dot: "bg-emerald-500",
        glow: "shadow-emerald-200",
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      };
  }
}
