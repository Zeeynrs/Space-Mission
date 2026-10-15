# ORBITAL: Mission Architect — Simulation Model & Engineering Assumptions

## 1. Scope & Educational Context

ORBITAL: Mission Architect implements a physically grounded, deterministic engineering model designed for educational exploration. While inspired by real mission design principles from NASA JPL and ESA, the simulation uses simplified analytical formulations rather than high-fidelity numerical N-body integrators. This ensures instant feedback, predictable determinism, and 60+ FPS browser execution.

All formulas, constants, and simplifications are explicitly documented below.

---

## 2. Mass Aggregation

A spacecraft configuration consists of discrete subsystem modules: Structure/Bus, Propulsion Engine, Propellant Tank, Solar Arrays, Batteries, Communications, Avionics/Computer, Thermal Control, and Science Instruments.

$$\text{Dry Mass } (M_{\text{dry}}) = \sum_{i \in \text{components}} m_i$$

$$\text{Propellant Mass } (M_{\text{prop}}) = m_{\text{propellant\_tank\_capacity}}$$

$$\text{Total Wet / Launch Mass } (M_{\text{wet}}) = M_{\text{dry}} + M_{\text{prop}}$$

### Launch Constraint:
The chosen launch vehicle class for Project AURORA provides a maximum payload capacity to Trans-Mars Injection (TMI) of:
$$M_{\text{wet}} \le M_{\text{launch\_max}} = 2,400 \text{ kg}$$

---

## 3. Propulsion & Delta-V Capability

Spacecraft maneuver capability is calculated strictly via the classical **Tsiolkovsky Rocket Equation**:

$$\Delta v = I_{\text{sp}} \cdot g_0 \cdot \ln\left(\frac{M_{\text{wet}}}{M_{\text{dry}}}\right)$$

Where:
- $g_0 = 9.80665 \text{ m/s}^2$ (standard Earth gravitational acceleration)
- $I_{\text{sp}}$ is the specific impulse of the installed engine (in seconds):
  - **Hydrazine Monopropellant Thrusters:** $I_{\text{sp}} \approx 220 \text{ s}$ (Low cost, highly reliable, low efficiency)
  - **Bipropellant (NTO/MMH) Main Engine:** $I_{\text{sp}} \approx 315 \text{ s}$ (Balanced industry workhorse, high thrust)
  - **Next-Gen Electric / Hall Thruster:** $I_{\text{sp}} \approx 1,800 \text{ s}$ (Ultra-high efficiency, high electrical power demand)
- $M_{\text{wet}}$ is total launch mass
- $M_{\text{dry}}$ is dry mass (spacecraft structure without usable propellant)

### Mission Delta-V Budget for Project AURORA:
1. **Trajectory Correction Maneuvers (TCM 1-3):** ~75 m/s
2. **Mars Orbit Insertion (MOI) Capture Burn:** ~1,050 m/s (from hyperbolic arrival to capture ellipse)
3. **Orbit Circularization & Trim:** ~275 m/s
4. **Attitude Control & Reserve Margin:** ~100 m/s

**Target Required $\Delta v$:** $1,500 \text{ m/s}$ (with minimum allowable capture threshold of $1,350 \text{ m/s}$).

---

## 4. Power Generation & Energy Storage

### 4.1 Solar Irradiance Model
Solar irradiance decreases following the inverse-square law with distance $r$ from the Sun in Astronomical Units (AU):

$$S(r) = \frac{S_0}{r^2}$$

Where:
- $S_0 = 1,361 \text{ W/m}^2$ (Solar constant at 1.0 AU / Earth)
- At Mars mean orbital distance ($r_{\text{Mars}} = 1.524 \text{ AU}$):
  $$S_{\text{Mars}} = \frac{1,361}{(1.524)^2} \approx 586 \text{ W/m}^2 \quad (\approx 43.1\% \text{ of Earth orbit irradiance})$$

Solar array rated output $P_{\text{rated}}$ is specified at 1 AU. At Mars orbit, daylight electrical generation is modeled as:
$$P_{\text{solar}}(r_{\text{Mars}}) = P_{\text{rated}} \cdot 0.431 \cdot \eta_{\text{temp\_pointing}}$$
Where $\eta_{\text{temp\_pointing}} \approx 0.92$ accounts for average cell temperature degradation and sun-tracking pointing jitter.

### 4.2 Power Consumption Modes
Active subsystems draw continuous baseline power:
- **Avionics & Flight Computer:** $40 - 90 \text{ W}$
- **Communications Transponder (Standby / High-Gain Tx):** $25 \text{ W}$ standby / $90 - 160 \text{ W}$ transmitting
- **Thermal Heaters:** $30 - 80 \text{ W}$ (varies with thermal control choice)
- **Active Science Instruments:** $45 - 220 \text{ W}$ (depending on payload package)

### 4.3 Eclipse Energy & Battery Storage
In a typical low Mars science orbit (~400 km altitude, circular):
- Orbital period $T \approx 118 \text{ minutes}$
- Eclipse duration (Mars shadow / Umbra) $t_{\text{eclipse}} \approx 38 \text{ minutes}$ ($0.633 \text{ hours}$)

During eclipse, $P_{\text{solar}} = 0 \text{ W}$. The spacecraft must operate exclusively from onboard batteries:
$$E_{\text{required\_eclipse}} = P_{\text{baseline}} \cdot t_{\text{eclipse}} \quad (\text{Watt-hours})$$

Maximum allowable Depth of Discharge (DoD) to avoid permanent battery failure is modeled as $70\%$:
$$E_{\text{battery\_usable}} = C_{\text{battery}} \cdot 0.70$$

If $E_{\text{required\_eclipse}} > E_{\text{battery\_usable}}$, a critical power shortfall occurs during orbital night.

---

## 5. Communications & Downlink Model

Data link performance from Mars to the NASA Deep Space Network (DSN) depends on antenna gain, transmitter RF power, and distance (which ranges from $0.5 \text{ AU}$ at conjunction to $2.6 \text{ AU}$ at opposition, with nominal mission operations modeled at $\sim 1.5 \text{ AU}$).

$$\text{Downlink Capability Index} = \frac{P_{\text{RF}} \cdot G_{\text{antenna}}}{L_{\text{free\_space}}}$$

Simplified operational downlink rates:
- **Low-Gain Omni Antenna:** $0.5 - 2.0 \text{ kbps}$ (Telemetry and emergency beacon only, cannot downlink high-res science images)
- **Medium-Gain Horn Antenna:** $15 - 50 \text{ kbps}$ (Standard telemetry, basic sensor readings)
- **High-Gain 2.4m Parabolic Dish:** $250 - 2,000 \text{ kbps}$ (Full scientific payload data downlink)

Light-time delay for one-way radio communication:
$$\tau = \frac{d}{c} \approx 4 \text{ to } 21 \text{ minutes}$$
This real-world latency explains why autonomous fault protection and predefined responses are mandatory for deep-space probes.

---

## 6. Science Observation Model

Science value is accumulated during Phase 7 (Science Collection) based on installed instruments and mission operating conditions:
1. **High-Resolution Optical Camera (e.g. HiRISE class):** Surface geomorphology, crater dating, landing site reconnaissance. Yields visual survey points.
2. **Atmospheric Infrared Spectrometer (e.g. CRISM/MCS class):** Atmospheric temperature profiles, water vapor, methane trace gas detection.
3. **Fluxgate Magnetometer & Plasma Sounder (e.g. MAVEN class):** Remnant crustal magnetism, solar wind atmospheric stripping.
4. **Subsurface Radar Sounder (e.g. SHARAD class):** Radar penetration of polar layered deposits to map subsurface water ice.

Science yield is scaled by:
- Instrument power availability (insufficient power forces instrument duty-cycling)
- Communications bandwidth (untransmitted data stored in flash memory, subject to buffer overflow risk)
- Orbit stability and precision achieved during Mars Orbit Insertion.

---

## 7. Operational Events & Decision Model

Events trigger deterministically based on pseudo-random generation initialized with a player or preset seed:
- **Solar Particle Event:** Tests flight computer radiation shielding. Safe mode reduces power and pauses science, avoiding bit-flips.
- **Eclipse Battery Stress:** Triggered if battery margin is $< 20\%$. Player can shed non-essential heaters or risk battery cell degradation.
- **Engine Thermal Spike:** During MOI burn. Player can throttle down (saving engine but ending in elliptical orbit) or burn through (completing circularization with thermal risk).
- **Antenna Gimbal Stalling:** Dust or mechanical sticking. Choice to use reaction wheels (uses propellant) or switch to backup medium-gain antenna.
- **Transient Science Opportunity:** Plume or dust storm detection. Choice to surge instrument power for 2x science points or hold conservative baseline.
