# NallahPulse

## Jammu Urban Waterlogging Intelligence

> **Civic-Tech Decision-Support Prototype**  
> Developed for **Hack for a Social Cause (HSC) 2027** under the **Viksit Bharat Young Leaders Dialogue (VBYLD) 2027**.

---

## Overview

**NallahPulse** is an open-source civic-technology decision-support prototype engineered for the city of Jammu, Jammu & Kashmir. It demonstrates how localized urban topography, natural stormwater drainage channels (*nallahs*), and interactive environmental scenarios can be modeled together to anticipate urban waterlogging vulnerability and dynamically prioritize municipal interventions.

During intense monsoon storms and localized cloudburst events, urban corridors in Jammu—such as low-lying basins along Canal Road, Krishna Nagar, Muthi, and Jewel Chowk—experience severe stormwater stagnation, culvert intake choking, and drainage overflows. NallahPulse provides city engineers, ward officers, and municipal operators with an intuitive, real-time scenario simulator that translates meteorological and drainage conditions into actionable risk scores and prioritized operational actions.

The platform is designed around transparent, deterministic mathematical indexing rather than opaque "black-box" models. By giving operators direct control over rainfall intensity, storm duration, antecedent soil moisture, season baselines, and drainage blockage states, NallahPulse serves as an exploratory decision-support interface for municipal emergency preparedness and infrastructure maintenance planning.

---

## Problem Context

Urban waterlogging in Jammu is characterized by a combination of steep topography shedding runoff rapidly into low-elevation alluvial basins, expanding impervious surface area, and severe solid-waste or silt blockage in natural *nallah* conduits (such as Landoi Choi Nallah and the Muthi/Canal drainage network).

Key operational challenges faced during extreme weather include:
1. **Lack of Localized Granularity:** General city weather forecasts fail to pinpoint which specific intersections or ward low-points will inundate first.
2. **Delayed Intervention Triage:** Municipal emergency assets (portable dewatering pumps, mechanical desilting excavators, traffic diversion units) are often deployed reactively rather than pre-positioned based on compound risk factors.
3. **Blockage Sensitivity:** Even moderate rainfall causes severe localized inundation if culvert intake screens are choked with silt or debris.

---

## Solution

NallahPulse addresses these challenges through a unified decision-support dashboard featuring:

1. **Jammu-Centered Interactive Map:** An interactive Leaflet map rendering 10 monitored prototype hotspot nodes across Jammu Municipal Corporation (JMC) wards, alongside illustrative natural drainage corridor alignments.
2. **Interactive Scenario Simulator:** Instant operator controls for rainfall intensity (0–120 mm/h), duration (0.5–12 hrs), soil moisture saturation (0–100%), seasonal baseline conditions, and drainage blockage overrides.
3. **Deterministic Waterlogging Risk Engine:** A multi-factor mathematical model computing dynamic risk scores (0–100) and risk tiers (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
4. **City Alert Tier Aggregator:** Automatic city-wide alert level synthesis (`GREEN`, `YELLOW`, `ORANGE`, `RED`) with live field deployment guidance.
5. **Municipal Intervention Priority Engine:** A transparent triage model weighting physical risk (60%) with urban population impact (20%), channel blockage (10%), and drainage vulnerability (10%) into a 1–10 priority ranking (`LOW PRIORITY`, `MONITOR / PREPARE`, `HIGH PRIORITY`, `IMMEDIATE`).
6. **Decision Support Cards:** Contextual cards providing deterministic rationale breakdowns and actionable *"Suggested Prototype Actions"* per hotspot.

---

## How It Works

The operational decision pipeline flows deterministically from scenario input to municipal recommendation:

```
[ Operator Scenario Parameters ]
(Rainfall Intensity, Duration, Soil Saturation, Season, Blockage, Flash Mode)
                    ↓
        [ Waterlogging Risk Engine ]
   (Evaluates 6 Local Physical & Hydraulic Factors)
                    ↓
        [ Waterlogging Risk Level ]
      (LOW • MODERATE • HIGH • CRITICAL)
                    ↓
     [ Municipal Priority Engine ]
(Weights Live Risk [60%] + Population [20%] + Blockage [10%] + Drainage [10%])
                    ↓
  [ Municipal Intervention Priority ]
 (IMMEDIATE • HIGH PRIORITY • MONITOR / PREPARE • LOW PRIORITY)
                    ↓
     [ Suggested Prototype Action ]
(Targeted Mechanical Desilting, Pump Pre-Positioning, or Routine Patrol)
```

---

## Architecture

```mermaid
flowchart TD
    subgraph Frontend_Client [Next.js 15 App Router Frontend]
        Dashboard[NallahPulse Operator Dashboard]
        ScenarioControls[Scenario Simulator Controls]
        LeafletMap[Jammu Leaflet Geographic Map]
        PriorityTable[Municipal Intervention Priority List]
        DecisionCard[Hotspot Decision Support Card]
        KPIs[Executive KPI Summary Row]
    end

    subgraph Deterministic_Engines [Client-Side Deterministic Engines]
        Dataset[(10 Jammu Hotspots & Drainage Layers)]
        RiskEngine[Waterlogging Risk Engine]
        PriorityEngine[Municipal Priority Engine]
    end

    subgraph Optional_Backend [Optional Next.js API Routes]
        GeminiRoute[/api/analyze/coordinates]
    end

    ScenarioControls -->|Scenario Parameters| RiskEngine
    Dataset --> RiskEngine
    RiskEngine -->|Dynamic Risk Scores & Alert Status| PriorityEngine
    Dataset --> PriorityEngine

    RiskEngine --> LeafletMap
    RiskEngine --> KPIs
    PriorityEngine --> PriorityTable
    PriorityEngine --> DecisionCard
    
    Dashboard -.->|Optional Narrative Evaluation| GeminiRoute
```

---

## Technology Stack

* **Core Framework:** Next.js 15.4.5 (React 18.3.1, TypeScript 5)
* **Styling & UI:** Tailwind CSS, Radix UI Primitives, Lucide React Icons
* **Mapping & GIS:** Leaflet 1.9.4, React Leaflet 4.2.1
* **AI Narrative (Optional):** `@google/generative-ai` (Google Gemini Pro)
* **Build & Dev Tooling:** Turbopack, PostCSS, Autoprefixer, TSX

---

## Project Structure

```
flood-analyzer/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   ├── coordinates/route.ts  # Optional coordinate AI route
│   │   │   └── image/route.ts        # Optional image AI route
│   │   └── health/route.ts           # Backend health check
│   ├── globals.css                   # Global styles & Tailwind utilities
│   ├── layout.tsx                    # Root layout with metadata
│   └── page.tsx                      # Primary NallahPulse operational dashboard
├── components/
│   ├── ClientMap.tsx                 # Leaflet map with hotspot markers & corridors
│   ├── InteractiveMap.tsx            # Dynamic SSR-safe map container wrapper
│   ├── RainfallSimulator.tsx         # Scenario controls, presets, priority table & cards
│   └── ui/                           # Reusable UI components (buttons, cards, badges, tabs)
├── docs/
│   ├── architecture.md               # Detailed system architecture specification
│   ├── testing.md                    # Comprehensive test matrices & verification logs
│   └── submission-readiness.md       # HSC 2027 / VBYLD competition checklist
├── lib/
│   ├── data/
│   │   └── jammuHotspots.ts          # 10 Jammu prototype hotspots & drainage corridors
│   ├── gemini.ts                     # Gemini client with built-in offline fallbacks
│   ├── priorityEngine.ts             # 60/20/10/10 municipal triage prioritization engine
│   ├── riskEngine.ts                 # 6-factor deterministic waterlogging risk engine
│   └── utils.ts                      # Class-name merge utility
├── scripts/
│   └── test-phase4.ts                # Programmatic scenario acceptance test suite
├── .env.example                      # Template for optional environment variables
├── LICENSE                           # MIT License with upstream attribution
└── README.md                         # Project documentation
```

---

## Installation & Setup

### Prerequisites
* **Node.js:** v18.17.0 or higher
* **npm:** v9.0.0 or higher

### Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ParthPatidar611/nallah-pulse.git
   cd nallah-pulse
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   ```bash
   cp .env.example .env.local
   ```
   *(Note: The core NallahPulse simulation and prioritization engines work 100% offline without any API keys).*

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Optional | Google Gemini API key used only for narrative coordinate and image analysis under the "Coordinates" tab. If omitted, built-in fallback data is returned. |
| `NEXT_PUBLIC_API_BASE_URL` | Optional | Custom backend URL if hosting API routes externally (leave blank for local Next.js API routes). |

---

## Prototype Risk Methodology

The **Waterlogging Risk Engine** (`lib/riskEngine.ts`) computes a deterministic composite score ($0 \le S \le 100$) for each hotspot node:

$$\text{Risk Score} = \text{clamp}_{0}^{100}\Big(C_{\text{rain}} + C_{\text{drain}} + C_{\text{hist}} + C_{\text{block}} + C_{\text{terr}} + C_{\text{moist}}\Big)$$

### Factor Breakdown:
* **Rainfall ($C_{\text{rain}}$, Max ~28 pts):** Normalized intensity modulated by storm duration and flash event mode:
  $$\text{Score}_{\text{rain}} = \min\left(100, \frac{\text{Intensity (mm/h)}}{80} \times 100 \times \text{DurationMultiplier}\right) \times \left(\frac{\text{HotspotRainfallFactor}}{100}\right) \times 0.28$$
* **Drainage ($C_{\text{drain}}$, Max ~30 pts):** Base vulnerability scaled by seasonal capacity reduction and channel blockage multiplier:
  $$C_{\text{drain}} = \min\left(100, \text{DrainageVuln} \times \frac{1}{\text{SeasonFactor}}\right) \times \text{BlockageMultiplier} \times 0.30$$
* **Historical Vulnerability ($C_{\text{hist}}$, Max ~20 pts):** Historical inundation record proxy $\times 0.20$.
* **Blockage Obstruction ($C_{\text{block}}$, Max ~12 pts):** Channel debris factor $\times \text{BlockageMultiplier} \times 0.12$.
* **Terrain Depression ($C_{\text{terr}}$, Max ~6 pts):** Topographic basin score $\times 0.06$.
* **Antecedent Soil Moisture ($C_{\text{moist}}$, Max ~12 pts):** Ground saturation level with seasonal soil moisture baseline boost $\times 0.12$.

### Risk Categories:
* **CRITICAL:** $S \ge 78$
* **HIGH:** $60 \le S < 78$
* **MODERATE:** $38 \le S < 60$
* **LOW:** $S < 38$

---

## Municipal Priority Methodology

The **Municipal Intervention Priority Engine** (`lib/priorityEngine.ts`) translates physical waterlogging risk into actionable municipal triage urgency:

$$\text{Priority Score} = \text{clamp}_{0}^{100}\Big(\text{RiskScore} \times 0.60 + \text{PopulationProxy} \times 0.20 + \text{BlockageFactor} \times 0.10 + \text{DrainageVuln} \times 0.10\Big)$$

### Priority Tiers:
* **IMMEDIATE ($P \ge 80$):** High-urgency mechanical desilting, mobile pumping unit dispatch, and intersection traffic diversion.
* **HIGH PRIORITY ($60 \le P < 80$):** Standby pump staging and culvert intake monitoring.
* **MONITOR / PREPARE ($40 \le P < 60$):** Conduit debris screen inspection and inflow tracking.
* **LOW PRIORITY ($P < 40$):** Routine scheduled ward patrol and maintenance.

---

## Scenario Controls & Demonstration Presets

NallahPulse includes 4 instant demonstration presets:
1. **Normal Monsoon:** 25 mm/h rain, 1 hr duration, 40% soil moisture, Peak-Monsoon baseline.
2. **Heavy Rain:** 60 mm/h sustained rain, 2 hrs duration, 70% soil moisture.
3. **Blockage Crisis:** 50 mm/h rain, 2 hrs duration, 60% soil moisture, Blocked nallah override active.
4. **Cloudburst / Flash Storm:** 85 mm/h extreme torrent, 1 hr duration, 85% soil moisture, Flash storm surge mode active.

---

## Prototype Demonstration Dataset

The repository includes 10 prototype urban nodes across Jammu Municipal Corporation wards:
* **Krishna Nagar** (Canal Road basin)
* **Muthi** (Muthi Nallah / Canal area)
* **Jewel Chowk** (Commercial junction)
* **Dogra Chowk** (Tawi bridge roadway approach)
* **Nai Basti** (R.S. Pura Road drain convergence)
* **Talab Tillo** (Main road commercial corridor)
* **Bikram Chowk** (University road transit junction)
* **Preet Nagar** (Low-lying industrial / residential basin)
* **Janipur** (High Court Road runoff zone)
* **Bantalab** (Elevated suburban control node)

*Note: All numerical factor values and coordinates in this dataset are research demonstration values for prototype validation and do not represent official JMC measurements.*

---

## Limitations

1. **Demonstration Data:** Datasets and factor weights are prototype proxies calibrated for scenario exploration, not official municipal measurements.
2. **Simplified Hydrology:** Uses a deterministic index model; it is not a full 2D hydrodynamic Saint-Venant hydraulic solver.
3. **Illustrative Geographic Layers:** Drainage alignments represent conceptual drainage corridors rather than certified CAD engineering drawings.
4. **Non-Governmental Prototype:** NallahPulse is an academic/hackathon decision-support prototype and is not an official government warning or operational dispatch system.

---

## Future Scope

* **Hydrological Integration:** Ingest real-time rainfall feeds from IMD automatic weather stations (AWS) in Jammu.
* **GIS Infrastructure Layers:** Ingest official municipal storm sewer GIS shapefiles and elevation DEMs.
* **Computer Vision Silt Detection:** AI-assisted camera analysis of culvert trash racks to automatically detect physical blockage.
* **Citizen Reporting Integration:** Verified crowdsourced citizen reports of localized street waterlogging.
* **Multi-City Adaptation:** Reusable engine configuration for other vulnerable Himalayan foothill urban centers (e.g., Srinagar, Dehradun, Shimla).

---

## AI Usage Disclosure

In compliance with the official **Hack for a Social Cause (HSC) 2027 / Viksit Bharat Young Leaders Dialogue (VBYLD)** submission guidelines:

* **AI Assistance Scope:** AI tools (including Google DeepMind Antigravity and Gemini LLM) were utilized as coding and design assistants during development for code refactoring, TypeScript type definitions, UI styling, test scripting, and draft documentation.
* **Core Algorithm Design:** The underlying 6-factor deterministic risk formula and 60/20/10/10 municipal priority model were conceptualized and structured specifically for the Jammu civic-technology problem statement.
* **Estimated Proportion of Final Work Involving AI Assistance / Generation:** `[TO BE COMPLETED HONESTLY BY TEAM]`

---

## Open Source & Attribution

NallahPulse is released under the **MIT License**.

This project originated as an adaptation and civic-tech transformation of the open-source *Flood Analyser* repository by **DonOmbisi** and **mendsalbert** (2025). We gratefully acknowledge their original baseline contribution under the MIT License. See [`LICENSE`](./LICENSE) for full legal text and copyright details.
