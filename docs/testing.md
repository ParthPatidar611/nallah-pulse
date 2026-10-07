# NallahPulse — Testing & Verification Documentation

**Product:** NallahPulse — Jammu Urban Waterlogging Intelligence  
**Document Version:** 1.0 (MVP Baseline)  
**Target:** Hack for a Social Cause (HSC) 2027 / Viksit Bharat Young Leaders Dialogue (VBYLD) 2027  

---

## 1. Automated Acceptance Testing

NallahPulse includes automated TypeScript test suites to verify the deterministic mathematical engines and scenario simulations.

### Running the Test Suite:
```bash
npx tsx scripts/test-phase4.ts
```

---

## 2. Core Scenario Test Matrix

The test suite evaluates 5 canonical civic-tech operational scenarios:

| Scenario | Parameters | City Alert Tier | Top Priority Node | Immediate Count | High Count | Monitor Count | Low Count |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **A: Low Rainfall** | 5 mm/h, 1h, 10% Moist, Normal Blockage, Peak-Monsoon | **ORANGE (Score 60)** | Krishna Nagar (#1, Score: 78) | 0 | 9 | 0 | 1 |
| **B: Heavy Rainfall** | 60 mm/h, 2h, 40% Moist, Normal Blockage, Peak-Monsoon | **RED (Score 80)** | Krishna Nagar (#1, Score: 92) | 5 | 4 | 1 | 0 |
| **C: High Rain + Saturation** | 80 mm/h, 1h, 90% Moist, Normal Blockage, Peak-Monsoon | **RED (Score 87)** | Krishna Nagar (#1, Score: 97) | 8 | 1 | 1 | 0 |
| **D: Blocked Drainage** | 50 mm/h, 1h, 40% Moist, Blocked Override, Peak-Monsoon | **RED (Score 95)** | Krishna Nagar (#1, Score: 97) | 9 | 0 | 1 | 0 |
| **E: Flash Storm Event** | 75 mm/h, 1h, 40% Moist, Normal Blockage, Flash Mode ON | **RED (Score 81)** | Krishna Nagar (#1, Score: 93) | 8 | 1 | 1 | 0 |

---

## 3. Boundary & Extreme Value Testing

An exhaustive combinatorial test was executed across all parameter dimensions:
* **Seasons:** Pre-Monsoon, Peak-Monsoon, Post-Monsoon, Winter (4)
* **Blockage States:** Normal, Partially Cleared, Blocked (3)
* **Rainfall Intensities:** 0, 5, 25, 60, 80, 120 mm/h (6)
* **Durations:** 0.5, 1, 2, 6, 12 hours (5)
* **Soil Saturations:** 0%, 10%, 40%, 70%, 100% (5)
* **Flash Event Modes:** OFF, ON (2)

$$\text{Total Tested Permutations} = 4 \times 3 \times 6 \times 5 \times 5 \times 2 = \mathbf{3,600\text{ Scenarios}}$$

### Verification Results:
* **$\text{NaN}$ / $\pm\infty$ Count:** $0$
* **Out-of-Bounds Scores ($<0$ or $>100$):** $0$
* **Uncaught Exceptions / Crashes:** $0$
* **Score Clamping Reliability:** $100.0\%$

---

## 4. Key Behavioral Assertions

1. **Monotonicity with Rainfall:** As simulated rainfall intensity increases, the city-wide score and top priority score strictly monotonically increase or remain clamped at 100.
2. **Elevated Node Safeguard:** Elevated suburban nodes with low base vulnerability (e.g. *Bantalab*, 340m elevation) consistently remain in low/moderate tiers during normal rain and never rank above severely vulnerable low-lying urban nodes (*Krishna Nagar*, *Muthi*, *Jewel Chowk*).
3. **Blockage Sensitivity:** Activating the "Blocked" override increases drainage and blockage contributions across all nodes, correctly promoting desilting action recommendations (`"Clear culvert intake obstructions..."`).
4. **Flash Storm Surge:** Activating Flash Storm mode eliminates duration dampening and triggers rapid-response field deployment guidance (`"Mobilize rapid-response dewatering crew..."`).

---

## 5. Build & Runtime Verification

* **Build Command:** `npm run build`
* **Result:** Exit code 0, 8 static/dynamic routes compiled cleanly with 0 TypeScript/ESLint fatal errors.
* **Development Server:** Runs on Next.js Turbopack (`npm run dev`) at `http://localhost:3000/`.
* **Zero Offline Dependency:** Full operational dashboard functions offline without network connectivity or API keys.
