"use client";

/**
 * NallahPulse - Rainfall Scenario Simulator & Municipal Intervention Priority Panel (Phase 5)
 * Interactive decision-support operator interface that feeds the risk and priority engines.
 */

import React from "react";
import {
  ScenarioParams,
  Season,
  BlockageOverride,
  EngineOutput,
  getAlertStatusStyles,
  AlertStatus,
} from "@/lib/riskEngine";
import {
  PriorityEngineOutput,
  HotspotPriorityResult,
  getPriorityStyles,
} from "@/lib/priorityEngine";
import {
  Droplets,
  Clock,
  CloudRain,
  Sliders,
  AlertTriangle,
  TrendingUp,
  Zap,
  Wind,
  Activity,
  Info,
  Shield,
  Check,
  Flame,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Sub-component: Slider Control
// ─────────────────────────────────────────────────────────────

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: React.ReactNode;
  onChange: (v: number) => void;
  color?: string;
  helperText?: string;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  icon,
  onChange,
  color = "#3b82f6",
  helperText,
}: SliderControlProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          {icon}
          {label}
        </span>
        <span className="font-bold text-slate-900 tabular-nums">
          {value} {unit}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{min} {unit}</span>
        {helperText && <span className="text-slate-500 font-medium">{helperText}</span>}
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Toggle Button Group
// ─────────────────────────────────────────────────────────────

interface ButtonGroupProps<T extends string> {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  icon?: React.ReactNode;
}

function ButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  icon,
}: ButtonGroupProps<T>) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        {icon}
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`text-[11px] px-2.5 py-1 rounded-md font-medium border transition-all ${
              value === opt
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: City Alert Banner (Part 2 - City Alert Tier)
// ─────────────────────────────────────────────────────────────

function CityAlertBanner({ status, cityScore }: { status: AlertStatus; cityScore: number }) {
  const styles = getAlertStatusStyles(status);
  const pulse = status === "RED" || status === "ORANGE";
  return (
    <div className={`${styles.light} border rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm`}>
      <div className="flex items-center gap-3">
        <span
          className={`w-3.5 h-3.5 rounded-full ${styles.dot} ${pulse ? "animate-pulse" : ""} flex-shrink-0`}
        />
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            City Alert Tier
          </div>
          <div className={`text-base font-extrabold ${styles.lightText} tracking-tight`}>
            {styles.label}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-semibold text-slate-500 uppercase">Composite Index</div>
        <div className={`text-2xl font-black ${styles.lightText} tabular-nums leading-none`}>
          {cityScore}<span className="text-xs text-slate-400 font-normal">/100</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Municipal Priority Row (Part 6)
// ─────────────────────────────────────────────────────────────

function MunicipalPriorityRow({
  priority,
  isSelected,
  onClick,
}: {
  priority: HotspotPriorityResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const styles = getPriorityStyles(priority.priorityTier);
  const isRank1 = priority.rank === 1;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
        isSelected
          ? "bg-blue-50/90 border-blue-400 shadow-sm ring-1 ring-blue-300"
          : isRank1
          ? "bg-red-50/30 border-red-200 hover:bg-red-50/60"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-black text-white ${styles.badge} flex-shrink-0 ${
              isRank1 ? "ring-2 ring-red-400 ring-offset-1" : ""
            }`}
          >
            #{priority.rank}
          </span>
          <div className="truncate">
            <span className="font-bold text-slate-900">{priority.hotspotName}</span>
            <span className="text-[10px] text-slate-500 ml-1.5">({priority.locality})</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Risk: {priority.riskScore}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${styles.badge}`}>
            Priority: {priority.priorityScore}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-600 pl-7">
        <div className="truncate">
          <span className="text-slate-400">Driver:</span>{" "}
          <span className="font-semibold text-slate-700">{priority.primaryDriver}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
            {priority.shortAction}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

interface RainfallSimulatorProps {
  params: ScenarioParams;
  engineOutput: EngineOutput;
  priorityOutput: PriorityEngineOutput;
  onParamsChange: (params: ScenarioParams) => void;
  onSelectHotspot: (hotspotId: string) => void;
  selectedHotspotId?: string;
}

export default function RainfallSimulator({
  params,
  engineOutput,
  priorityOutput,
  onParamsChange,
  onSelectHotspot,
  selectedHotspotId,
}: RainfallSimulatorProps) {
  const update = (partial: Partial<ScenarioParams>) =>
    onParamsChange({ ...params, ...partial });

  const seasons: Season[] = ["Pre-Monsoon", "Peak-Monsoon", "Post-Monsoon", "Winter"];
  const blockageOptions: BlockageOverride[] = ["Normal", "Partially Cleared", "Blocked"];

  const rainfallLabel = (mmh: number): string => {
    if (mmh === 0) return "Dry";
    if (mmh <= 5) return "Light Rain";
    if (mmh <= 20) return "Moderate Rain";
    if (mmh <= 40) return "Heavy Rain";
    if (mmh <= 60) return "Very Heavy";
    if (mmh <= 80) return "Severe Torrent";
    return "Cloudburst Level";
  };

  const selectedResult = engineOutput.results.find((r) => r.hotspotId === selectedHotspotId);
  const selectedPriority = priorityOutput.results.find((r) => r.hotspotId === selectedHotspotId);

  // Preset scenarios for live demo efficiency (Part 9)
  const applyPreset = (name: string) => {
    switch (name) {
      case "normal":
        onParamsChange({
          rainfallIntensityMmH: 25,
          durationHours: 1,
          antecedentMoisture: 40,
          season: "Peak-Monsoon",
          blockageState: "Normal",
          isFlashEvent: false,
        });
        break;
      case "heavy":
        onParamsChange({
          rainfallIntensityMmH: 60,
          durationHours: 2,
          antecedentMoisture: 70,
          season: "Peak-Monsoon",
          blockageState: "Normal",
          isFlashEvent: false,
        });
        break;
      case "blocked":
        onParamsChange({
          rainfallIntensityMmH: 50,
          durationHours: 2,
          antecedentMoisture: 60,
          season: "Peak-Monsoon",
          blockageState: "Blocked",
          isFlashEvent: false,
        });
        break;
      case "cloudburst":
        onParamsChange({
          rainfallIntensityMmH: 85,
          durationHours: 1,
          antecedentMoisture: 85,
          season: "Peak-Monsoon",
          blockageState: "Partially Cleared",
          isFlashEvent: true,
        });
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* City Alert Status Banner (Part 2 - City Alert Tier) */}
      <CityAlertBanner
        status={engineOutput.cityAlertStatus}
        cityScore={engineOutput.cityWideScore}
      />

      {/* Scenario Controls (Part 8 & 9) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">Rainfall Scenario Simulator</span>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
            PROTOTYPE SCENARIO
          </span>
        </div>

        {/* Demo Preset Buttons (Part 9) */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Scenario Presets:
          </span>
          <button
            onClick={() => applyPreset("normal")}
            className="text-[10px] px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition-colors"
          >
            Normal Monsoon
          </button>
          <button
            onClick={() => applyPreset("heavy")}
            className="text-[10px] px-2 py-1 rounded bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 font-semibold transition-colors"
          >
            Heavy Rain (60mm/h)
          </button>
          <button
            onClick={() => applyPreset("blocked")}
            className="text-[10px] px-2 py-1 rounded bg-white hover:bg-slate-100 text-amber-800 border border-amber-300 font-semibold transition-colors"
          >
            Blockage Crisis
          </button>
          <button
            onClick={() => applyPreset("cloudburst")}
            className="text-[10px] px-2 py-1 rounded bg-white hover:bg-slate-100 text-red-700 border border-red-300 font-bold transition-colors"
          >
            Cloudburst / Flash
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Group 1: Environment (Part 8) */}
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Environmental Forcing
            </span>

            {/* Rainfall Intensity */}
            <SliderControl
              label={`Rainfall Intensity (${rainfallLabel(params.rainfallIntensityMmH)})`}
              value={params.rainfallIntensityMmH}
              min={0}
              max={120}
              step={5}
              unit="mm/h"
              icon={<Droplets className="h-3.5 w-3.5 text-blue-500" />}
              onChange={(v) => update({ rainfallIntensityMmH: v })}
              color={
                params.rainfallIntensityMmH > 80
                  ? "#dc2626"
                  : params.rainfallIntensityMmH > 40
                  ? "#f97316"
                  : "#3b82f6"
              }
            />

            {/* Duration */}
            <SliderControl
              label="Rainfall Duration"
              value={params.durationHours}
              min={0.5}
              max={12}
              step={0.5}
              unit="hr"
              icon={<Clock className="h-3.5 w-3.5 text-indigo-500" />}
              onChange={(v) => update({ durationHours: v })}
              color="#6366f1"
            />

            {/* Antecedent Moisture */}
            <SliderControl
              label="Antecedent Moisture (Soil Saturation)"
              value={params.antecedentMoisture}
              min={0}
              max={100}
              step={5}
              unit="%"
              icon={<Wind className="h-3.5 w-3.5 text-cyan-500" />}
              onChange={(v) => update({ antecedentMoisture: v })}
              color={
                params.antecedentMoisture > 70
                  ? "#0891b2"
                  : params.antecedentMoisture > 40
                  ? "#22d3ee"
                  : "#94a3b8"
              }
            />
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3.5">
            {/* Group 2: Conditions (Part 8) */}
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              2. Drainage Network Conditions
            </span>

            {/* Season */}
            <ButtonGroup
              label="Season Baseline"
              options={seasons}
              value={params.season}
              onChange={(v) => update({ season: v })}
              icon={<CloudRain className="h-3.5 w-3.5 text-sky-500" />}
            />

            {/* Blockage State */}
            <ButtonGroup
              label="Nallah Blockage Override"
              options={blockageOptions}
              value={params.blockageState}
              onChange={(v) => update({ blockageState: v })}
              icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            />
          </div>

          <div className="border-t border-slate-100 pt-3">
            {/* Group 3: Event Mode (Part 8) */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  Flash Storm Event Mode
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Simulates rapid-onset convective cloudburst surge
                </span>
              </div>
              <button
                onClick={() => update({ isFlashEvent: !params.isFlashEvent })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  params.isFlashEvent ? "bg-yellow-400" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    params.isFlashEvent ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Recommendations */}
      {engineOutput.recommendedDeployments.length > 0 && (
        <div
          className={`border rounded-xl p-3 space-y-1.5 ${
            getAlertStatusStyles(engineOutput.cityAlertStatus).light
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Field Deployment Guidance
            </span>
          </div>
          {engineOutput.recommendedDeployments.map((msg, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* City Response Overview (Part 7) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            City Response Overview
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Dynamic Triage Summary</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2 rounded-lg bg-red-50 border border-red-200">
            <div className="text-lg font-black text-red-700 leading-none">
              {priorityOutput.summary.immediateCount}
            </div>
            <div className="text-[10px] font-bold text-red-800 mt-1 uppercase">Immediate</div>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
            <div className="text-lg font-black text-orange-700 leading-none">
              {priorityOutput.summary.highPriorityCount}
            </div>
            <div className="text-[10px] font-bold text-orange-800 mt-1 uppercase">High</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-lg font-black text-amber-700 leading-none">
              {priorityOutput.summary.monitorCount}
            </div>
            <div className="text-[10px] font-bold text-amber-800 mt-1 uppercase">Monitor</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-lg font-black text-emerald-700 leading-none">
              {priorityOutput.summary.lowPriorityCount}
            </div>
            <div className="text-[10px] font-bold text-emerald-800 mt-1 uppercase">Low</div>
          </div>
        </div>
      </div>

      {/* Municipal Intervention Priority List (Part 6) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                MUNICIPAL INTERVENTION PRIORITY
              </span>
              <span className="text-[10px] text-slate-500">
                Actionable triage ranked by prototype priority score
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
            10 Monitored Hotspots
          </span>
        </div>
        <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
          {priorityOutput.results.map((priority) => (
            <MunicipalPriorityRow
              key={priority.hotspotId}
              priority={priority}
              isSelected={selectedHotspotId === priority.hotspotId}
              onClick={() => onSelectHotspot(priority.hotspotId)}
            />
          ))}
        </div>
      </div>

      {/* Selected Hotspot Decision Card & Breakdown (Part 4 & 5) */}
      {selectedPriority && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">
                Decision Support — {selectedPriority.hotspotName}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                getPriorityStyles(selectedPriority.priorityTier).badge
              }`}
            >
              Rank #{selectedPriority.rank} &bull; {selectedPriority.priorityLabel}
            </span>
          </div>

          <div className="p-4 space-y-3.5">
            {/* Risk vs Priority Side-by-Side Comparison (Part 2 & Part 5) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Box A: Waterlogging Risk Level */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Waterlogging Risk
                  </span>
                  <span className="text-[9px] text-slate-400">Physical Model</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-slate-900">
                    {selectedPriority.riskScore}
                  </span>
                  <span className="text-[10px] text-slate-500">/ 100</span>
                </div>
                <div className="text-[11px] font-bold text-red-600 mt-0.5">
                  {selectedPriority.riskCategory} RISK
                </div>
                <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                  Modeled flood vulnerability under current scenario
                </p>
              </div>

              {/* Box B: Municipal Intervention Priority */}
              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                    Municipal Priority
                  </span>
                  <span className="text-[9px] text-blue-500 font-semibold">Triage Score</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-blue-900">
                    {selectedPriority.priorityScore}
                  </span>
                  <span className="text-[10px] text-slate-500">/ 100</span>
                </div>
                <div
                  className="text-[11px] font-extrabold mt-0.5"
                  style={{ color: getPriorityStyles(selectedPriority.priorityTier).color }}
                >
                  {selectedPriority.priorityLabel}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                  Urgency weighting risk (60%) &amp; urban impact (40%)
                </p>
              </div>
            </div>

            {/* Prototype Weighting Breakdown */}
            <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Priority Drivers (Prototype Formula Weights)</span>
                <span className="text-[10px] text-slate-400">Total: {selectedPriority.priorityScore}/100</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-600">
                <div>
                  Live Risk (60%):{" "}
                  <strong className="text-slate-900">+{selectedPriority.driverBreakdown.riskComponent} pts</strong>
                </div>
                <div>
                  Urban Impact (20%):{" "}
                  <strong className="text-slate-900">+{selectedPriority.driverBreakdown.populationComponent} pts</strong>
                </div>
                <div>
                  Blockage (10%):{" "}
                  <strong className="text-slate-900">+{selectedPriority.driverBreakdown.blockageComponent} pts</strong>
                </div>
                <div>
                  Drainage Vuln (10%):{" "}
                  <strong className="text-slate-900">+{selectedPriority.driverBreakdown.drainageComponent} pts</strong>
                </div>
              </div>
            </div>

            {/* Deterministic Prioritization Rationale (Part 17) */}
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong className="font-bold">Prioritization Rationale:</strong>{" "}
              {selectedPriority.priorityExplanation}
            </div>

            {/* Suggested Prototype Action (Part 16) */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Suggested Prototype Action
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {selectedPriority.recommendedAction}
              </p>
            </div>

            {/* Detailed Risk Factor Contributions */}
            {selectedResult && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Physical Factor Breakdown
                  </span>
                  {selectedResult.estimatedInundationDepthCm > 0 && (
                    <span className="text-[10px] text-blue-700 font-bold">
                      Est. Inundation: ~{selectedResult.estimatedInundationDepthCm} cm
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Rainfall Contribution", val: selectedResult.scoreBreakdown.rainfallContribution, color: "#3b82f6" },
                    { label: "Drainage Vulnerability", val: selectedResult.scoreBreakdown.drainageContribution, color: "#f97316" },
                    { label: "Historical Risk", val: selectedResult.scoreBreakdown.historicalContribution, color: "#6366f1" },
                    { label: "Blockage Factor", val: selectedResult.scoreBreakdown.blockageContribution, color: "#f59e0b" },
                    { label: "Terrain Factor", val: selectedResult.scoreBreakdown.terrainContribution, color: "#10b981" },
                    { label: "Antecedent Moisture", val: selectedResult.scoreBreakdown.antecedentContribution, color: "#06b6d4" },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-bold text-slate-900">+{val}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (val / 30) * 100)}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prototype Disclaimer (Part 3) */}
      <p className="text-[10px] text-slate-400 text-center">
        Prototype system for demonstrating urban waterlogging risk assessment and intervention prioritization. Values shown are demonstration data and are not official municipal warnings or forecasts.
      </p>
    </div>
  );
}
