# ORBITAL: Mission Architect

> **An educational 3D space mission strategy and spacecraft engineering simulation game.**  
> Developed for the **NASA Space Apps Exploration Challenge**.

![Project Status](https://img.shields.io/badge/Status-Complete%20%26%20Verified-00E5FF?style=flat-square)
![Tests](https://img.shields.io/badge/Vitest-16%2F16%20Passing-10B981?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6?style=flat-square)
![Three.js](https://img.shields.io/badge/Three.js-R3F%2FDrei-black?style=flat-square)

---

## 1. Executive Summary

In **ORBITAL: Mission Architect**, players act as mission engineers designing an exploration spacecraft for **Project AURORA: Mars Orbiter Survey**. Players assemble a modular orbiter from flight-proven components, balance real physical constraints (Tsiolkovsky delta-v, solar flux drop at 1.52 AU, battery depth of discharge during Mars shadow eclipse, and radio link budget back to Earth's Deep Space Network), guide the probe across 8 mission phases, respond to operational space weather anomalies, and debrief on planetary science discoveries.

Every gameplay decision is consequential: components alter real engineering parameters, the deterministic simulation engine calculates mission progression based on those parameters, and the final report explains the exact root causes of success or failure.

---

## 2. Core Player Experience & Gameplay Loop

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CONTINUOUS DECISION LOOP                        │
│                                                                        │
│   DESIGN ──► VALIDATE ──► LAUNCH ──► OPERATE ──► DEBRIEF ──► REDESIGN  │
│     ▲                                                          │       │
│     └──────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Title Screen & Quick Start:** Inspect the 3D vehicle staging bay, choose an architecture template (AURORA Baseline, Budget Scout, Flagship), or jump straight into the builder.
2. **Mission Briefing:** Review Project AURORA objectives, budget ceiling ($400M), maximum launch mass (2,400 kg), required delta-v (~1,450 m/s), and optional scientific investigations (surface imaging, trace methane plumes, crustal magnetism, subsurface ice radar).
3. **Spacecraft Builder:** Curated component catalog grouped by engineering category:
   - **Structure / Bus:** Discovery Compact, AURORA Standard, Odyssey Heavy Flagship
   - **Propulsion:** Hydrazine Monopropellant Cluster, Bipropellant Hypergolic Main Engine, NEXT-Gen Hall-Effect Ion Thruster
   - **Propellant Tank:** 300 kg Titanium, 650 kg COPV Composite, 1100 kg Cryo Heavy Tank
   - **Solar Power:** Fixed Body Panels, Dual Articulated Tracking Wings, UltraFlex Multi-Junction Wings
   - **Battery Storage:** 450 Wh Standard Li-Ion, 980 Wh Deep-Discharge Li-Ion
   - **Communications:** Low-Gain Omni (2 kbps), Medium-Gain Horn (45 kbps), High-Gain 2.4m Parabolic Dish (1.2 Mbps)
   - **Flight Computer / Avionics:** RAD750 Single Board Computer, Dual Redundant Fault-Tolerant Avionics
   - **Thermal Control:** Passive Multi-Layer Insulation (MLI), Active Heat Pipe Loop & Electric Heaters
   - **Science Instruments (Multi-Slot):** Hi-Res Surface Imager (HR-VIS), Atmospheric IR Sounder (AIRS), Fluxgate Magnetometer (MAG), Shallow Subsurface Sounder (SHARAD)
4. **Flight Readiness Review (FRR):** Comprehensive pre-launch audit highlighting blockers (preventing launch) and warnings (operational risks), preventing invalid configurations from silently passing.
5. **3D Mission Operations:** Observe the spacecraft in an 8-phase mission timeline:
   1. *Launch:* Atmospheric ascent from Earth
   2. *Deployment:* Solar wings and high-gain antenna unfurling
   3. *Cruise:* Heliocentric transfer to Mars with solar flux dimming
   4. *Arrival:* Mars gravitational capture approach
   5. *Insertion:* Retrograde Mars Orbit Insertion (MOI) main burn
   6. *Operations:* Orbit trimming and 38-minute orbital eclipse shadow
   7. *Science Collection:* Targeted nadir scanning over Olympus Mons, Valles Marineris, and polar ice caps
   8. *Debrief:* Final flight evaluation
6. **Operational Anomalies & Choices:** Respond to rule-driven events with real historical NASA parallels:
   - *Coronal Mass Ejection (Cruise):* Enter Autonomous Safe Mode vs Maintain Active Telemetry
   - *Engine Thermal Spike (Insertion):* Commit to Full Burn vs Throttle Down
   - *Eclipse Battery Strain (Operations):* Shed Non-Essential Loads vs Deep Battery Discharge
   - *Antenna Gimbal Drag (Operations):* RCS Thruster Jolt vs Fallback to Medium-Gain Horn
   - *Target of Opportunity (Science):* Surge Observation Mode over Methane Plume vs Standard Survey
7. **Scientific Debrief & Root-Cause Audit:** Clear outcome classification (Full Mission Success, Partial Success, or Mission Failure), multi-dimensional score breakdown (Primary, Science, Budget Efficiency, Safety Margin), cause-and-effect explanations, and run-to-run comparison table.

---

## 3. Technology Stack & Architecture

- **React 18:** Modern functional component architecture
- **TypeScript:** Strict type checking with zero `any` shortcuts
- **Vite:** High-performance bundler and dev server
- **Three.js & React Three Fiber & Drei:** Procedural 3D spacecraft staging, celestial Mars sphere, atmospheric limb glow, and starfield
- **Zustand:** Unidirectional decoupled state management
- **Tailwind CSS:** Dark mission-control aesthetic with cyan and warm amber accents
- **Vitest:** Automated unit testing for physics, validation, scoring, and storage
- **Web Audio API:** Pure procedural sound synthesizer for UI clicks, alarm klaxons, and victory fanfares (zero external audio file dependencies)

---

## 4. Scientific Provenance & Physical Assumptions

ORBITAL grounds all simulation logic in established astrodynamics and planetary physics:

1. **Tsiolkovsky Rocket Equation:**
   $$\Delta v = I_{\text{sp}} \cdot g_0 \cdot \ln\left(\frac{M_{\text{wet}}}{M_{\text{dry}}}\right)$$
   Where $g_0 = 9.80665 \text{ m/s}^2$. Mars Orbit Insertion requires $\ge 1,350 \text{ m/s}$ (recommended: $1,500 \text{ m/s}$).
2. **Solar Irradiance Drop at Mars (1.524 AU):**
   $$S(r) = \frac{S_0}{r^2} = \frac{1,361}{(1.524)^2} \approx 586 \text{ W/m}^2 \quad (\approx 43.1\% \text{ of Earth flux})$$
   Solar array output drops to $43.1\%$ at Mars, requiring tracking arrays or oversized panels.
3. **Eclipse Duration & Energy Storage:**
   Low Mars science orbit period $T \approx 118 \text{ min}$, eclipse shadow duration $t_{\text{eclipse}} \approx 38 \text{ min}$ ($0.633 \text{ h}$). Usable battery energy ($70\%$ depth of discharge) must exceed critical bus heater draw.
4. **Communications Link & Light-Time Delay:**
   Light travel time $\tau = d/c$ ranges from $4.2$ to $21.3$ minutes. High-gain parabolic antenna ($1.2 \text{ Mbps}$) is required to downlink raw high-resolution optical and radar data.

Full citations are available in [`docs/DATA_SOURCES.md`](./docs/DATA_SOURCES.md) and [`docs/SIMULATION_MODEL.md`](./docs/SIMULATION_MODEL.md).

---

## 5. Verification & Test Results

The simulation engine and persistence adapters are thoroughly tested using Vitest:

```bash
> orbital-mission-architect@1.0.0 test
> vitest run

 RUN  v1.6.1 D:/Test Game

 ✓ src/tests/storage.test.ts  (4 tests)
 ✓ src/tests/simulation.test.ts  (12 tests)

 Test Files  2 passed (2)
      Tests  16 passed (16)
   Duration  1.09s
```

All 16 unit tests verify:
- Mass and cost aggregation
- Rocket equation delta-v calculations
- Solar irradiance inverse-square derating
- Battery eclipse energy margins
- Mandatory subsystem completeness
- Launch mass ($2,400 \text{ kg}$) and budget ceiling ($\$400\text{M}$) enforcement
- Delta-v insufficiency detection
- Duplicate subsystem prevention
- Outcome classifications (Success, Partial, Failure)
- Deterministic PRNG reproducibility (same seed yields identical results)
- LocalStorage corrupt data recovery and run history persistence

TypeScript strict mode (`npm run typecheck`) and production build (`npm run build`) pass cleanly with 0 errors.

---

## 6. Installation & Quick Start

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Setup Commands
```bash
# Clone or navigate to the workspace
cd "d:/Test Game"

# Install dependencies
npm install

# Run automated test suite
npm test

# Verify TypeScript strict type-checking
npm run typecheck

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 7. Known Limitations & Roadmap

- **N-Body Gravity:** The simulation uses analytical Keplerian orbital velocity and Tsiolkovsky delta-v budgets rather than real-time numerical Runge-Kutta N-body integrators.
- **External Textures:** Mars planetary surface and spacecraft materials are procedurally rendered in Three.js Canvas to ensure 100% offline capability without external CDN dependencies.
- **Single Campaign:** The MVP is centered on Project AURORA (Mars Orbiter). Planned future campaigns include Europa Clipper and Titan Atmospheric Probe.
