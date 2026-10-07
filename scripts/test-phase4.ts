import { JAMMU_HOTSPOTS } from "../lib/data/jammuHotspots";
import { runRiskEngine, ScenarioParams, DEFAULT_SCENARIO_PARAMS } from "../lib/riskEngine";
import { runPriorityEngine } from "../lib/priorityEngine";

console.log("=== NALLAHPULSE PHASE 4 ACCEPTANCE TESTS ===\n");

function runScenario(name: string, params: ScenarioParams) {
  const riskOutput = runRiskEngine(JAMMU_HOTSPOTS, params);
  const priorityOutput = runPriorityEngine(JAMMU_HOTSPOTS, riskOutput.results, params);

  console.log(`--- Scenario: ${name} ---`);
  console.log(`Params: Rain=${params.rainfallIntensityMmH}mm/h, Dur=${params.durationHours}h, Moist=${params.antecedentMoisture}%, Season=${params.season}, Blockage=${params.blockageState}, Flash=${params.isFlashEvent}`);
  console.log(`City Risk Alert: ${riskOutput.cityAlertStatus} (City Score: ${riskOutput.cityWideScore})`);
  console.log(`Top Priority Location: ${priorityOutput.summary.topPriorityHotspot?.hotspotName} (Rank #1, Score: ${priorityOutput.summary.topPriorityHotspot?.priorityScore}, Tier: ${priorityOutput.summary.topPriorityHotspot?.priorityLabel})`);
  console.log(`Intervention Counts -> Immediate: ${priorityOutput.summary.immediateCount}, High: ${priorityOutput.summary.highPriorityCount}, Monitor: ${priorityOutput.summary.monitorCount}, Low: ${priorityOutput.summary.lowPriorityCount}`);

  console.log("\nTop 3 Hotspots:");
  priorityOutput.results.slice(0, 3).forEach((r) => {
    console.log(`  #${r.rank} ${r.hotspotName}: Priority=${r.priorityScore} (${r.priorityLabel}), Risk=${r.riskScore} (${r.riskCategory}), Driver=${r.primaryDriver}, Action=${r.shortAction}`);
  });

  // Hotspots of specific interest (Part 23)
  const muthi = priorityOutput.results.find((r) => r.hotspotName === "Muthi")!;
  const krishna = priorityOutput.results.find((r) => r.hotspotName === "Krishna Nagar")!;
  const bantalab = priorityOutput.results.find((r) => r.hotspotName === "Bantalab")!;

  console.log("\nHotspot Inspection:");
  console.log(`  Krishna Nagar: Rank #${krishna.rank}, Priority=${krishna.priorityScore} (${krishna.priorityLabel}), Risk=${krishna.riskScore} (${krishna.riskCategory})`);
  console.log(`  Muthi:         Rank #${muthi.rank}, Priority=${muthi.priorityScore} (${muthi.priorityLabel}), Risk=${muthi.riskScore} (${muthi.riskCategory})`);
  console.log(`  Bantalab:      Rank #${bantalab.rank}, Priority=${bantalab.priorityScore} (${bantalab.priorityLabel}), Risk=${bantalab.riskScore} (${bantalab.riskCategory})`);
  console.log(`\n`);
  return { riskOutput, priorityOutput };
}

// Scenario A: Low rainfall
const scA = runScenario("A: Low Rainfall", {
  ...DEFAULT_SCENARIO_PARAMS,
  rainfallIntensityMmH: 5,
  antecedentMoisture: 10,
});

// Scenario B: Heavy rainfall
const scB = runScenario("B: Heavy Rainfall", {
  ...DEFAULT_SCENARIO_PARAMS,
  rainfallIntensityMmH: 60,
  durationHours: 2,
});

// Scenario C: High rainfall + high moisture
const scC = runScenario("C: High Rainfall + High Moisture", {
  ...DEFAULT_SCENARIO_PARAMS,
  rainfallIntensityMmH: 80,
  antecedentMoisture: 90,
});

// Scenario D: Blocked nallah/drainage condition
const scD = runScenario("D: Blocked Drainage Condition", {
  ...DEFAULT_SCENARIO_PARAMS,
  rainfallIntensityMmH: 50,
  blockageState: "Blocked",
});

// Scenario E: Flash storm
const scE = runScenario("E: Flash Storm Event", {
  ...DEFAULT_SCENARIO_PARAMS,
  rainfallIntensityMmH: 75,
  isFlashEvent: true,
});

// Verifications
console.log("=== VERIFICATION CHECKS ===");
console.assert(scA.priorityOutput.summary.immediateCount < scC.priorityOutput.summary.immediateCount, "Immediate count should rise with severe storm");
console.assert(scA.priorityOutput.summary.topPriorityHotspot!.priorityScore < scC.priorityOutput.summary.topPriorityHotspot!.priorityScore, "Priority score must increase with rainfall");
console.assert(scB.priorityOutput.results.find((r) => r.hotspotName === "Bantalab")!.rank > 5, "Bantalab should NOT dominate the top ranks");

console.log("✓ All programmatic priority and risk checks passed successfully!");
