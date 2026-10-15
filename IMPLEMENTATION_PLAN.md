# ORBITAL: Mission Architect — Implementation Plan

## Overview
ORBITAL: Mission Architect is a 3D space mission strategy and educational simulation game built with React, TypeScript, Three.js, React Three Fiber, Drei, Zustand, and Tailwind CSS. The player assumes the role of a spacecraft mission architect for **Project AURORA: Mars Orbiter Survey**, balancing engineering constraints (mass, cost, power, propulsion, communications, thermal) to design a viable Mars probe, simulate its journey through 8 mission phases, respond to operational emergencies, and debrief on scientific discoveries.

---

## Phases & Deliverables Checklist

### Phase 0: Inspect & Plan (Current)
- [x] Full analysis of `PRD.md` and user requirements
- [x] Workspace & environment inspection (Node v24, npm 11, Git 2.50)
- [x] `IMPLEMENTATION_PLAN.md`: Roadmap, acceptance criteria, test plan, risks
- [x] `ARCHITECTURE.md`: Module separation, data flow, state management, directory structure
- [x] `docs/SIMULATION_MODEL.md`: Physical equations, orbital approximations, power/propulsion models
- [x] `docs/DATA_SOURCES.md`: NASA references (MRO, MAVEN, PDS, JPL Horizon, DSN), attribution, assumptions

### Phase 1: Working Foundation
- [x] Initialize Vite + React 18 + TypeScript strict project
- [x] Install dependencies: Three.js, @types/three, @react-three/fiber, @react-three/drei, zustand, tailwindcss, lucide-react, vitest
- [x] Tailwind CSS configuration with dark space aesthetic (cyan/amber accents, high contrast)
- [x] Screen navigation system (Title/Entry, Briefing, Builder, Validation, Mission Sim/Ops, Debrief, Data Sources)
- [x] Global store setup with Zustand (clean boundary between simulation state and UI state)
- [x] WebGL fallback detection & graceful degradation screen
- [x] Base responsive layout with header, audio/effects toggles, reset control
- **Gate:** `npm run build` succeeds, app boots with zero console errors, navigation works.

### Phase 2: Domain Model & Simulation Engine
- [x] Component catalog data (`src/data/components.ts`): buses, engines, tanks, solar arrays, batteries, antennas, computers, thermal systems, science payloads, RTG nuclear power, DSOC laser
- [x] Mission definitions (`src/data/mission.ts`): Project AURORA constraints (budget $400M, launch mass limit 2,400 kg, target delta-v 1,450 m/s, science objectives)
- [x] Pure simulation calculations (`src/simulation/physics.ts`):
  - Tsiolkovsky rocket equation: $\Delta v = I_{sp} \cdot g_0 \cdot \ln(m_{wet} / m_{dry})$
  - Solar irradiance at Mars distance (1.524 AU): $S_{Mars} = S_0 / r^2 \approx 586 \text{ W/m}^2$ (43% of 1 AU)
  - Power balance: generation at cruise vs Mars orbit, day vs eclipse, active instruments vs sleep
  - Battery capacity and eclipse survival duration
  - Communication link margin (carrier frequency, dish diameter, EIRP, path loss, data rate)
  - Mass & cost aggregation
- [x] Validation engine (`src/simulation/validator.ts`):
  - Mandatory systems check (bus, propulsion, computer, power, battery, antenna)
  - Launch mass limit, budget ceiling check
  - Delta-v margin for Mars orbit insertion (MOI)
  - Power deficit warnings (daytime and eclipse)
  - Science capability check
- [x] Mission state machine & event engine (`src/simulation/engine.ts`):
  - 8 distinct phases: Launch, Deployment, Cruise, Mars Arrival, Orbital Insertion, Orbital Operations, Science Collection, Mission Debrief
  - Deterministic random number generator (PRNG / Mulberry32) with customizable seed
  - Operational event catalog (Solar Storm, Eclipse Battery Drain, Engine Overheat, Antenna Gimbal Glitch, Opportunity Science, Star Tracker Glitch, Dust Storm)
  - Player decision resolution with realistic resource tradeoffs
  - Multi-dimensional scoring (Primary objectives, Science yield, Budget efficiency, Vehicle health)
- [x] Vitest unit test suite (`src/tests/simulation.test.ts`):
  - Mass, cost, delta-v, power balance calculations
  - Validation rule enforcement (violations vs passes)
  - Deterministic seed verification (identical inputs => identical outputs)
  - Success, Partial Success, and Failure outcomes
- **Gate:** All Vitest unit tests pass with 100% assertions green (32/32 tests).

### Phase 3: Spacecraft Builder UI & 3D Visualizer
- [x] 3-column builder layout:
  - Left: Categorized component catalog with detailed specs, mass, cost, power, $I_{sp}$, and descriptions
  - Center: Interactive 3D spacecraft viewport with orbit controls, lighting, component attachment nodes
  - Right: Real-time telemetry & engineering stats panel with live validation badges
- [x] Procedural 3D spacecraft assembly:
  - Bus chassis meshes (Cylindrical, Hexagonal, Rectangular)
  - Articulated solar array wings (tracking panels, multi-junction blue photovoltaic textures) & MMRTG nuclear generator
  - Main thruster nozzle & RCS attitude control quads
  - High-gain parabolic dish antenna with feed horn & DSOC optical laser terminal
  - Instrument booms and optical telescope / spectrometer pods / radar dipoles / trace gas sounders
- [x] Component install/remove/replace actions with instant reactive updates
- [x] Preset configurations (Aurora Baseline, Budget Scout, Heavy Science Laboratory)
- [x] Reset to default configuration button
- **Gate:** Changing any component immediately updates 3D mesh, stats, and validation panel.

### Phase 4: Mission Briefing & Design Review
- [x] Mission Briefing screen:
  - Project AURORA background and NASA-inspired context
  - Primary objective: achieve stable orbit around Mars and conduct baseline global survey
  - Secondary objectives: Atmospheric trace gas analysis, High-resolution polar ice mapping, Subsurface water radar
  - Hard constraints: Budget <= $400M, Launch Vehicle Mass <= 2,400 kg
  - Scientific questions, scoring criteria, and launch window context
- [x] Pre-Launch Design Review modal:
  - Summary of vehicle architecture
  - Critical blockers (prevent launch)
  - Risk warnings (player can launch at their own risk with clear trade-off warnings)
  - Launch countdown authorization
- **Gate:** Consistent validation between Builder and Briefing Review; cannot launch critical failure without acknowledgement.

### Phase 5: 3D Mission Simulation & Timeline
- [x] Interactive 3D Mission Scene:
  - Realistic procedural Mars sphere with atmosphere glow, polar ice caps, and elevation shading
  - 5 Interactive 3D Martian Landmarks (Olympus Mons, Valles Marineris, Jezero Crater, Gale Crater, Planum Boreum)
  - Earth-to-Mars trajectory curve & orbital ellipses
  - Spacecraft model placed in dynamic orientations per phase
  - Directional Sun lighting with realistic Mars distance illumination
  - Background starfield with celestial depth
  - Multi-Angle Camera Director (Orbital View, Chase Cam, Nadir Survey, Vehicle Close-up)
- [x] Mission Timeline & Phase Coordinator:
  - Step through 8 phases with smooth camera transitions:
    - Phase 1: Launch & Stage Separation
    - Phase 2: Array & Antenna Deployment
    - Phase 3: Deep Space Cruise (Heliocentric transfer)
    - Phase 4: Mars Gravitational Well Arrival
    - Phase 5: Mars Orbit Insertion (MOI) main burn
    - Phase 6: Aerobraking & Orbit Trimming
    - Phase 7: Scientific Observation Orbit
    - Phase 8: Final Mission Evaluation
  - Playback controls: Play, Pause, Speed (1x, 2x, 5x), Step/Fast-Forward
  - Skipping cinematics runs simulation state machine synchronously to preserve exact outcome
- [x] Real-time Mission Control HUD:
  - Live MET (Mission Elapsed Time), Orbital Altitude, Velocity, Delta-V remaining, Battery %, Power margin, Light-time comm delay, Accumulated Science Data (GB)
- **Gate:** Player can watch full mission progression with accurate telemetry updates in sync with simulation.

### Phase 6: Operational Events & Decisions
- [x] Operational Event triggers during simulation:
  - Solar Flare radiation hazard in cruise -> choose Safe Mode vs maintain telemetry
  - Star Tracker Glitch during arrival -> choose Inertial Gyros vs RCS Slew
  - Battery discharge in Mars shadow -> choose Load Shedding vs sustain heaters
  - Main engine thermal warning during MOI -> throttle down vs burn through
  - High-Gain Antenna stiction -> fire RCS pulse vs switch to medium gain
  - Regional Dust Storm in science phase -> pivot to Radar/Atmospheric sounders vs optical wait
  - Methane plume science opportunity -> surge observation mode vs preserve power
- [x] Modal / HUD decision interface with countdown and clear engineering consequence previews
- [x] Outcomes directly affect fuel, battery health, instrument availability, and final science yield
- **Gate:** Decision paths alter final debrief and score reproducibly.

### Phase 7: Scientific Results & Mission Debrief
- [x] Comprehensive Mission Debrief report:
  - Outcome badge: Full Mission Success, Partial Success, or Mission Failure
  - Primary & Secondary objectives achievement breakdown
  - Total Science Points and scientific discovery log (e.g. "Mapped 450 km² polar ice deposit", "Detected localized atmospheric methane plume")
  - Budget & mass efficiency index
  - Critical event timeline log
  - Cause-and-effect post-flight analysis (identifying exact component bottlenecks)
  - Actionable design recommendations for next attempt
- [x] Run-to-Run Comparison tool:
  - Compare current vehicle vs previous attempt (cost, mass, science yield, survival rate)
- [x] Flight Certificate Export:
  - One-click Download JSON Flight Certificate
  - One-click Copy Markdown Debrief Report to clipboard
- [x] "Redesign Spacecraft" action returning to builder with previous configuration preserved
- **Gate:** Report reflects real simulation data, deterministically identical on repeat with same seed.

### Phase 8: NASA Data Sources & Scientific Assumptions View
- [x] In-game reference modal / screen:
  - Curated NASA missions (MRO, Mars Global Surveyor, MAVEN, Mars Express)
  - Real physical parameters and formulas (Solar constant at Mars, rocket equation, radio loss)
  - PDS (Planetary Data System) and JPL Horizons citations
  - Clear educational disclosure and assumptions list
- **Gate:** All references verified and accessible directly in-game.

### Phase 9: Persistence, Usability, Accessibility & Polish
- [x] LocalStorage persistence for vehicle design, previous runs, and user preferences
- [x] Graceful corrupted state recovery
- [x] Keyboard navigation support (Space to pause/play, 1-3-5 for speed, Tab navigation)
- [x] Audio effects (subtle sci-fi UI clicks, engine hum, telemetry beeps synthesized via Web Audio API, with mute toggle)
- [x] Reduced-motion mode toggle
- [x] High-contrast, clean typography and tooltips for all engineering terms
- **Gate:** State survives page refresh; audio can be toggled; layout is responsive on desktop and laptops.

### Phase 10: Quality Assurance & Verification
- [x] Vitest test suite verification (32/32 tests green)
- [x] TypeScript strict mode (`tsc --noEmit`) passes with zero errors
- [x] Production build (`npm run build`) generates clean bundle
- [x] Full end-to-end workflow manual check across all 3 outcome types (Success, Partial, Failure)
- [x] Final README and documentation review
- **Gate:** 100% verified gameplay loop.

---

## Known Risks & Mitigations

1. **Risk:** React 19 peer dependency conflicts with Three.js / React Three Fiber / Drei.  
   **Mitigation:** Use React 18 (`react@^18.3.1`, `react-dom@^18.3.1`, `@react-three/fiber@^8.17.10`, `@react-three/drei@^9.121.0`), which has battle-tested compatibility.

2. **Risk:** WebGL not supported or failing in low-spec environments.  
   **Mitigation:** Add an explicit WebGL capability detector and fallback view that renders schematic 2D telemetry and vehicle diagrams so the game remains 100% playable.

3. **Risk:** Disconnect between 3D animation timeline and simulation logic.  
   **Mitigation:** Simulation logic is executed by a decoupled state machine; 3D scenes read from authoritative simulation state and interpolation timestamps. Skipping immediately synchronizes to the simulation state.

4. **Risk:** Overly complex orbital math causing performance issues or bugs.  
   **Mitigation:** Use physically grounded analytical models (Tsiolkovsky equation, Keplerian orbital parameters, inverse-square solar irradiance) rather than numerical N-body integrators, preserving 100% determinism and 60+ FPS.
