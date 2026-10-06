"use client";

/**
 * NallahPulse - Rainfall Scenario Simulator Panel (Phase 3)
 * Interactive operator control panel that feeds the risk engine.
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
  Droplets,
  Clock,
  CloudRain,
  Sliders,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Wind,
  Activity,
  Info,
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
}

function SliderControl({
  label, value, min, max, step, unit, icon, onChange, color = "#3b82f6",
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
        <span>{min}</span>
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

function ButtonGroup<T extends string>({ label, options, value, onChange, icon }: ButtonGroupProps<T>) {
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
// Sub-component: City Alert Banner
// ─────────────────────────────────────────────────────────────

function CityAlertBanner({ status, cityScore }: { status: AlertStatus; cityScore: number }) {
  const styles = getAlertStatusStyles(status);
  const pulse = status === "RED" || status === "ORANGE";
  return (
    <div className={`${styles.light} border rounded-xl p-3 flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-3">
        <span
          className={`w-3 h-3 rounded-full ${styles.dot} ${pulse ? "animate-pulse" : ""} flex-shrink-0`}
        />
        <div>
          <div className={`text-sm font-extrabold ${styles.lightText} uppercase tracking-wide`}>
            {styles.label}
          </div>
          <div className="text-[11px] text-slate-500">City-wide composite score</div>
        </div>
      </div>
      <div className={`text-2xl font-black ${styles.lightText} tabular-nums`}>{cityScore}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Hotspot Risk Row in triage list
// ─────────────────────────────────────────────────────────────

function HotspotRiskRow({
  result,
  isSelected,
  onClick,
}: {
  result: EngineOutput["results"][number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const styles = getAlertStatusStyles(result.alertStatus);
  const TrendIcon =
    result.trendIndicator === "WORSENING"
      ? TrendingUp
      : result.trendIndicator === "IMPROVING"
      ? TrendingDown
      : Minus;
  const trendColor =
    result.trendIndicator === "WORSENING"
      ? "text-red-500"
      : result.trendIndicator === "IMPROVING"
      ? "text-emerald-500"
      : "text-slate-400";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
        isSelected
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot} ${
              result.alertStatus === "RED" ? "animate-pulse" : ""
            }`}
          />
          <span className="font-semibold text-slate-800 truncate">{result.hotspotName}</span>
          <TrendIcon className={`h-3 w-3 flex-shrink-0 ${trendColor}`} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {result.estimatedInundationDepthCm > 0 && (
            <span className="text-[10px] text-blue-600 font-medium">
              ~{result.estimatedInundationDepthCm}cm
            </span>
          )}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${styles.badge}`}
          >
            {result.dynamicScore}
          </span>
        </div>
      </div>
      {result.estimatedResponseTimeMin < 999 && (
        <div className="mt-1 text-[10px] text-slate-500 pl-4">
          Response window:{" "}
          <span className="font-semibold text-slate-700">
            {result.estimatedResponseTimeMin}min
          </span>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

interface RainfallSimulatorProps {
  params: ScenarioParams;
  engineOutput: EngineOutput;
  onParamsChange: (params: ScenarioParams) => void;
  onSelectHotspot: (hotspotId: string) => void;
  selectedHotspotId?: string;
}

export default function RainfallSimulator({
  params,
  engineOutput,
  onParamsChange,
  onSelectHotspot,
  selectedHotspotId,
}: RainfallSimulatorProps) {
  const update = (partial: Partial<ScenarioParams>) =>
    onParamsChange({ ...params, ...partial });

  const seasons: Season[] = ["Pre-Monsoon", "Peak-Monsoon", "Post-Monsoon", "Winter"];
  const blockageOptions: BlockageOverride[] = ["Normal", "Partially Cleared", "Blocked"];

  // Rainfall intensity label helper
  const rainfallLabel = (mmh: number): string => {
    if (mmh === 0) return "Dry";
    if (mmh <= 5) return "Light";
    if (mmh <= 20) return "Moderate";
    if (mmh <= 40) return "Heavy";
    if (mmh <= 60) return "Very Heavy";
    if (mmh <= 80) return "Extreme";
    return "Catastrophic";
  };

  const selectedResult = engineOutput.results.find((r) => r.hotspotId === selectedHotspotId);

  return (
    <div className="space-y-4">
      {/* City Alert Status Banner */}
      <CityAlertBanner
        status={engineOutput.cityAlertStatus}
        cityScore={engineOutput.cityWideScore}
      />

      {/* Scenario Controls */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Rainfall Scenario Simulator</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-semibold ml-auto">
            PROTOTYPE
          </span>
        </div>

        <div className="p-4 space-y-4">
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

          {/* Season */}
          <ButtonGroup
            label="Season"
            options={seasons}
            value={params.season}
            onChange={(v) => update({ season: v })}
            icon={<CloudRain className="h-3.5 w-3.5 text-sky-500" />}
          />

          {/* Blockage State */}
          <ButtonGroup
            label="Nallah Blockage State"
            options={blockageOptions}
            value={params.blockageState}
            onChange={(v) => update({ blockageState: v })}
            icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
          />

          {/* Flash Event Toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Zap className="h-3.5 w-3.5 text-yellow-500" />
              Flash Storm Event
            </span>
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
              Recommended Actions
            </span>
          </div>
          {engineOutput.recommendedDeployments.map((msg, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
              <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-500 mt-1" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Priority Triage List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">Priority Triage</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Sorted by dynamic risk score
          </span>
        </div>
        <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
          {engineOutput.results.map((result) => (
            <HotspotRiskRow
              key={result.hotspotId}
              result={result}
              isSelected={selectedHotspotId === result.hotspotId}
              onClick={() => onSelectHotspot(result.hotspotId)}
            />
          ))}
        </div>
      </div>

      {/* Selected Hotspot Score Breakdown */}
      {selectedResult && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">
              Score Breakdown — {selectedResult.hotspotName}
            </span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Rainfall Contribution", val: selectedResult.scoreBreakdown.rainfallContribution, color: "#3b82f6" },
              { label: "Drainage Vulnerability", val: selectedResult.scoreBreakdown.drainageContribution, color: "#f97316" },
              { label: "Historical Risk", val: selectedResult.scoreBreakdown.historicalContribution, color: "#6366f1" },
              { label: "Blockage Factor", val: selectedResult.scoreBreakdown.blockageContribution, color: "#f59e0b" },
              { label: "Terrain Factor", val: selectedResult.scoreBreakdown.terrainContribution, color: "#10b981" },
              { label: "Antecedent Moisture", val: selectedResult.scoreBreakdown.antecedentContribution, color: "#06b6d4" },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-bold text-slate-900">+{val}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (val / 30) * 100)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
              <span className="text-slate-700">Total Dynamic Score</span>
              <span className="text-slate-900">{selectedResult.dynamicScore} / 100</span>
            </div>
            {selectedResult.estimatedInundationDepthCm > 0 && (
              <div className="mt-1 p-2 bg-blue-50 rounded-lg text-[11px] text-blue-800 border border-blue-200">
                <span className="font-bold">Est. inundation depth:</span>{" "}
                ~{selectedResult.estimatedInundationDepthCm} cm (prototype proxy)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prototype Disclaimer */}
      <p className="text-[10px] text-slate-400 text-center">
        Prototype demonstration model — not official engineering data.
      </p>
    </div>
  );
}
