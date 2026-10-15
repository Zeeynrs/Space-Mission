# ORBITAL: Mission Architect — System Architecture

## 1. High-Level Architecture Overview

ORBITAL: Mission Architect strictly decouples simulation logic from 3D visualization and UI rendering. The application follows a unidirectional data flow pattern powered by Zustand, where pure simulation functions govern spacecraft physics, mission progression, event resolution, and scoring.

```
┌────────────────────────────────────────────────────────────────────────┐
│                               UI LAYER                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ ┌──────────────┐  │
│  │ BriefingView │ │ BuilderView  │ │ MissionOpsHUD │ │  DebriefView │  │
│  └───────┬──────┘ └──────┬───────┘ └───────┬───────┘ └──────┬───────┘  │
└──────────┼───────────────┼─────────────────┼────────────────┼──────────┘
           │               │                 │                │
           ▼               ▼                 ▼                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        STATE & CONTROL (Zustand)                       │
│  - Spacecraft Store (configuration, active selection, modifications)   │
│  - Mission Store (phase, telemetry, timeline clock, playback speed)    │
│  - Settings Store (audio, high-contrast, deterministic seed)           │
│  - Persistence Adapter (localStorage sync & schema migration)          │
└──────────┬─────────────────────────────────┬───────────────────────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────────────┐  ┌──────────────────────────────────────┐
│      SIMULATION ENGINE       │  │        3D PRESENTATION LAYER         │
│  (Pure TypeScript, Decoupled)│  │        (Three.js / R3F / Drei)       │
│  - Rocket Equation / Delta-V │  │  - Spacecraft Procedural Rig         │
│  - Solar Irradiance Model    │  │  - Mars Planet & Atmosphere Shader   │
│  - Power & Battery Balance   │  │  - Orbit & Trajectory Curves         │
│  - Communication Link Budget │  │  - Cinematic Camera Transitions      │
│  - Design Validator          │  │  - WebGL Fallback Schematic View     │
│  - 8-Phase State Machine     │  └──────────────────────────────────────┘
│  - Seeded PRNG Event Engine  │
│  - Scientific Scoring Matrix │
└──────────┬───────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                │
│  - Component Catalog (Buses, Engines, Tanks, Solar, Antennas, Payloads)│
│  - Project AURORA Mission Constraints & Objectives                     │
│  - NASA Scientific Citations, Physical Constants, PDS Archives         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```text
d:/Test Game/
├── docs/
│   ├── SIMULATION_MODEL.md       # Physics, rocket equation, solar, link budget
│   └── DATA_SOURCES.md           # NASA MRO/MAVEN data, citations, assumptions
├── src/
│   ├── app/                      # Application entry, layout, header, footer, modal container
│   ├── components/               # Shared UI atoms/molecules (Button, Card, Badge, Tooltip, Modal)
│   ├── data/
│   │   ├── components.ts         # Authoritative catalog of spacecraft components
│   │   ├── mission.ts            # Project AURORA mission definition and constraints
│   │   ├── presets.ts            # Validated baseline spacecraft configurations
│   │   └── scientificSources.ts  # Curated NASA references and citations
│   ├── features/
│   │   ├── mission-briefing/     # Briefing screen, objective summaries, target orbit
│   │   ├── spacecraft-builder/   # Component catalog, 3D staging, live telemetry panel
│   │   ├── design-review/        # Launch readiness review, blocker/warning checks
│   │   ├── mission-operations/   # Real-time mission control HUD, event prompt dialogs
│   │   ├── mission-report/       # Scientific debrief, score breakdown, run comparisons
│   │   └── data-sources/         # Educational reference screen with interactive citations
│   ├── scene3d/                  # 3D presentation (React Three Fiber)
│   │   ├── SpacecraftRig.tsx     # Procedural 3D spacecraft assembled from active components
│   │   ├── MarsPlanet.tsx        # Mars celestial sphere with atmosphere and surface shading
│   │   ├── MissionTimeline3D.tsx # Orbital paths, cruise trajectory, Sun lighting
│   │   ├── Starfield.tsx         # Restrained deep-space star background
│   │   └── WebGLFallback.tsx     # 2D schematic renderer when WebGL is unavailable
│   ├── simulation/               # Pure simulation algorithms (independent of React & Three)
│   │   ├── physics.ts            # Delta-v, power irradiance, battery discharge, comms
│   │   ├── validator.ts          # Engineering constraint verification rules
│   │   ├── events.ts             # Curated event triggers, decision trees, effect handlers
│   │   ├── scoring.ts            # Objective scoring, discovery rewards, outcome rules
│   │   ├── engine.ts             # 8-phase mission coordinator & deterministic clock
│   │   └── prng.ts               # Mulberry32 deterministic pseudo-random number generator
│   ├── store/
│   │   ├── useSpacecraftStore.ts # Spacecraft design state, install/remove actions
│   │   ├── useMissionStore.ts    # Simulation progression, telemetry, event queue
│   │   └── useSettingsStore.ts   # Audio volume, reduced motion, deterministic seed
│   ├── types/
│   │   ├── component.ts          # Component specifications, categories, slots
│   │   ├── mission.ts            # Mission parameters, phases, telemetry, score
│   │   └── event.ts              # Event types, decision options, resolution impact
│   ├── utils/
│   │   ├── formatters.ts         # Engineering units formatting (kg, W, Wh, m/s, kbps, $M)
│   │   ├── audio.ts              # Web Audio API procedural UI sound synthesis
│   │   └── storage.ts            # Safe LocalStorage serialization & schema validator
│   ├── tests/                    # Vitest test suites
│   │   ├── physics.test.ts       # Physical calculations testing
│   │   ├── validator.test.ts     # Validation rules and edge case testing
│   │   ├── engine.test.ts        # Phase transitions, event triggers, determinism
│   │   └── storage.test.ts       # Persistence and corrupt data recovery testing
│   ├── App.tsx                   # Main router and screen state manager
│   ├── index.css                 # Tailwind directives, mission-control styling
│   └── main.tsx                  # React DOM mount point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 3. Core Architectural Boundaries

### 3.1 Pure Simulation Layer (`src/simulation/`)
- Zero dependencies on React, DOM, or Three.js.
- Deterministic: Same input configuration + same operational decisions + same seed $\to$ identically reproducible telemetry, events, science discoveries, and score.
- Easily testable in headless Vitest node environment.

### 3.2 Authoritative Data Models (`src/types/` & `src/data/`)
- Every component is immutable and indexed by a unique `id`.
- Spacecraft configuration stores installed component IDs mapped to structural slots.
- Derived statistics (total mass, cost, power balance, delta-v, antenna gain) are computed via pure functions, never stored as stale redundant state.

### 3.3 3D Presentation Layer (`src/scene3d/`)
- Listens to store state reactively via lightweight selectors.
- Does not modify simulation state directly; sends actions (e.g., `play()`, `pause()`, `stepPhase()`) to the store.
- Procedural geometry ensures zero external asset loading dependencies and 100% offline capability.

### 3.4 Persistence & Recovery (`src/utils/storage.ts`)
- Local storage saves user designs and run history under versioned keys.
- Zod-like or strict manual runtime validation ensures corrupted or legacy JSON payloads fail gracefully and restore defaults rather than crashing the application.
