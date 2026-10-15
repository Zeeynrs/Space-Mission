# ORBITAL: Mission Architect — Scientific Data Sources & Attribution

## 1. Compliance & Educational Attribution Policy

ORBITAL: Mission Architect is an educational space mission strategy game developed for the NASA Space Apps Challenge context. It utilizes publicly available mission architectures, physical constants, and planetary science data published by NASA, the Jet Propulsion Laboratory (JPL), and academic planetary science consortia.

**Disclaimer:** This product is an independent educational simulation. It is not officially endorsed, certified, or sponsored by NASA, the Jet Propulsion Laboratory, or the United States Government. All calculations and models are simplified approximations designed for game design and teaching purposes.

---

## 2. Authoritative Data References

### Reference 1: Mars Reconnaissance Orbiter (MRO) Subsystem Specifications
- **Provider:** NASA / Jet Propulsion Laboratory (JPL) / California Institute of Technology
- **Canonical URL:** `https://mars.nasa.gov/mro/mission/spacecraft/`
- **Retrieval Date:** October 2023 / Reference Verification 2024
- **Used In:** Spacecraft Bus dimensions, High-Gain Antenna (3.0 m dish, X-band/Ka-band specs), Solar Array power output (2,000 W Earth / 1,000 W Mars), battery specifications, HiRISE camera and CRISM spectrometer power/mass models.
- **Attribution:** NASA/JPL-Caltech public mission information.

### Reference 2: NASA Planetary Data System (PDS) — Mars Geodesy & Cartography
- **Provider:** NASA Planetary Data System (PDS) Geosciences Node / USGS Astrogeology Science Center
- **Canonical URL:** `https://pds-geosciences.wustl.edu/missions/mro/`
- **Retrieval Date:** 2024
- **Used In:** Mars planetary physical constants (Mean radius $R = 3,389.5 \text{ km}$, Standard gravitational parameter $\mu = 4.282837 \times 10^{13} \text{ m}^3/\text{s}^2$, Mean distance from Sun $1.52368 \text{ AU}$).
- **Attribution:** NASA Planetary Data System / Mars Global Surveyor MOLA & MRO science teams.

### Reference 3: MAVEN (Mars Atmosphere and Volatile EvolutioN) Mission
- **Provider:** NASA Goddard Space Flight Center / Laboratory for Atmospheric and Space Physics (LASP)
- **Canonical URL:** `https://www.nasa.gov/mission_pages/maven/overview/index.html`
- **Retrieval Date:** 2024
- **Used In:** Atmospheric escape instrument modeling (Magnetometer, Neutral Gas and Ion Mass Spectrometer), elliptical science orbit parameters, and solar storm event triggers.
- **Attribution:** NASA GSFC / University of Colorado Boulder LASP.

### Reference 4: NASA Deep Space Network (DSN) Telecommunications Link Guidelines
- **Provider:** NASA JPL DSN Telecommunications Link Design Handbook (810-005)
- **Canonical URL:** `https://deepspace.jpl.nasa.gov/dsndocs/810-005/`
- **Retrieval Date:** 2024
- **Used In:** Simplified link margin calculation, carrier frequency bands (X-band ~8.4 GHz, Ka-band ~32 GHz), parabolic dish gain curves, and light-time propagation delay modeling ($\tau = d/c$).
- **Attribution:** NASA/JPL Deep Space Network.

### Reference 5: Solar Radiation at Mars & Photovoltaic Performance
- **Provider:** NASA Technical Reports Server (NTRS) — "Solar Power for Mars Missions", NASA/TM-2004-213076
- **Canonical URL:** `https://ntrs.nasa.gov/citations/20040084042`
- **Retrieval Date:** 2024
- **Used In:** Solar constant at Mars ($586 \text{ W/m}^2$, $\sim 43.1\%$ of 1 AU), multi-junction solar cell temperature derating coefficients in Mars orbit.
- **Attribution:** NASA Glenn Research Center Photovoltaic and Space Power Technology Branch.

---

## 3. Separation of Real Data, Derived Values, and Illustrative Game Parameters

| Parameter | Type | Source / Justification |
| :--- | :--- | :--- |
| **Mars Radius ($3,389.5 \text{ km}$)** | Real Datum | NASA Planetary Fact Sheet / PDS |
| **Mars Standard Gravity ($\mu = 42,828 \text{ km}^3/\text{s}^2$)** | Real Datum | NASA JPL Horizons Ephemeris |
| **Solar Constant at Earth ($1,361 \text{ W/m}^2$)** | Real Datum | WMO / NASA SORCE Satellite Data |
| **Solar Irradiance at Mars ($586 \text{ W/m}^2$)** | Derived Value | $1361 / (1.524)^2$ via inverse-square law |
| **Bipropellant Engine $I_{\text{sp}}$ ($315 \text{ s}$)** | Real Datum | Aerojet Rocketdyne / Leros-1b class apogee engines |
| **Project AURORA Budget Ceiling ($400M)** | Illustrative Game Parameter | Calibrated for Mars Scout / Discovery class cost cap |
| **Launch Vehicle Mass Limit ($2,400 \text{ kg}$)** | Illustrative Game Parameter | Calibrated for medium-lift expendable vehicle to TMI |
| **Science Discovery Points Matrix** | Illustrative Game Parameter | Balanced for progressive player scoring and debrief feedback |
| **Radio Light-Time Delay ($4 - 21 \text{ min}$)** | Real Datum | Earth-Mars orbital mechanics ($0.5 - 2.5 \text{ AU} / c$) |

---

## 4. In-Game Transparency

The application provides an interactive **Data Sources & Scientific Assumptions** panel directly accessible from both the Title Screen, Mission Briefing, and Debrief Screen, allowing players, students, and evaluators to inspect the origin of every calculation.
