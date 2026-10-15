import { MissionEvent } from '../types/event';

export const MISSION_EVENTS_CATALOG: MissionEvent[] = [
  {
    id: 'event-solar-flare',
    phase: 'cruise',
    triggerTimeFraction: 0.5,
    title: 'Space Weather Alert: Coronal Mass Ejection',
    description:
      'Deep space tracking detects an intense coronal mass ejection (CME) sweeping across the Earth-Mars transit vector. High-energy solar proton flux is escalating rapidly.',
    historicalContext:
      'Similar to the Halloween Solar Storms of 2003 encountered by Mars Odyssey and SOHO, which tested deep-space avionics radiation tolerance.',
    severity: 'critical',
    autoDefaultChoiceId: 'flare-safe-mode',
    choices: [
      {
        id: 'flare-safe-mode',
        label: 'Enter Autonomous Safe Mode',
        description:
          'Stow secondary sensor booms, point narrow bus profile toward Sun, and cycle non-critical bus components into standby.',
        tradeoffNotice:
          'Protects avionics and sensor detectors from radiation damage. Halts interplanetary cruise science data collection.',
        effect: {
          healthDeltaPercent: 0,
          scienceBonusPoints: 0,
          logMessage:
            'Autonomous safe mode engaged. All avionics survived solar proton event without memory corruption.',
        },
      },
      {
        id: 'flare-observe',
        label: 'Maintain Active Cruise Science',
        description:
          'Keep magnetometer and particle detectors energized to record the shockwave boundary layer in real-time.',
        tradeoffNotice:
          'Yields rare space weather observations (+45 science pts), but risks single-event upsets on unhardened processors (-10% health).',
        effect: {
          healthDeltaPercent: -10,
          scienceBonusPoints: 45,
          logMessage:
            'Interplanetary shockwave measured successfully (+45 science pts). Flight computer registered minor memory bit-flips.',
        },
      },
    ],
  },
  {
    id: 'event-moi-thermal',
    phase: 'insertion',
    triggerTimeFraction: 0.6,
    title: 'Engine Injector Chamber Thermal Spike',
    description:
      '3 minutes into the critical Mars Orbit Insertion (MOI) retrograde burn, injector manifold temperature sensors alarm near redline (980°C).',
    historicalContext:
      'During Mars Global Surveyor insertion in 1997, structural and thermal stresses on propulsion hardware dictated exact burn profiles.',
    severity: 'critical',
    autoDefaultChoiceId: 'moi-burn-through',
    choices: [
      {
        id: 'moi-burn-through',
        label: 'Commit & Burn Through at Full Thrust',
        description:
          'Maintain 100% thrust to achieve nominal circular capture orbit despite thermal warning indications.',
        tradeoffNotice:
          'Guarantees optimal science orbit insertion. Thermal stress inflicts minor nozzle ablation (-8% health).',
        effect: {
          healthDeltaPercent: -8,
          propellantDeltaKg: 0,
          scienceMultiplier: 1.0,
          logMessage:
            'Burn completed nominal capture into 400 km survey orbit. Main engine thruster nozzle experienced slight thermal wear.',
        },
      },
      {
        id: 'moi-throttle-down',
        label: 'Throttle Engine to 70% & Extend Duration',
        description:
          'Derate engine thrust to cool the injector chamber, accepting a slightly more elliptical capture orbit.',
        tradeoffNotice:
          'Protects propulsion system integrity, but the higher apoapsis reduces optical imaging resolution (-15% science yield).',
        effect: {
          healthDeltaPercent: 0,
          propellantDeltaKg: -15,
          scienceMultiplier: 0.85,
          logMessage:
            'Engine throttled down safely. Captured into elliptical 400x1200 km orbit; camera resolution reduced slightly.',
        },
      },
    ],
  },
  {
    id: 'event-eclipse-drain',
    phase: 'operations',
    triggerTimeFraction: 0.4,
    title: 'Mars Shadow Eclipse: Power Depletion Warning',
    description:
      'The spacecraft enters the cold umbral shadow of Mars. Solar generation drops to 0 W. Battery Depth-of-Discharge (DoD) is tracking higher than predicted.',
    historicalContext:
      'Mars Express and Mars Odyssey carefully orchestrate battery load-shedding during seasonal long-eclipse seasons.',
    severity: 'moderate',
    autoDefaultChoiceId: 'eclipse-load-shed',
    choices: [
      {
        id: 'eclipse-load-shed',
        label: 'Execute Automated Load Shedding',
        description:
          'Turn off instrument survival heaters and power down transmitter amplifier until dawn terminator breakout.',
        tradeoffNotice:
          'Protects battery reserve margins. Instruments must undergo thermal recalibration at sunrise.',
        effect: {
          batteryDeltaWh: 50,
          healthDeltaPercent: 0,
          scienceBonusPoints: 0,
          logMessage:
            'Load shedding conserved battery power through eclipse. Subsystems reactivated nominally at Martian dawn.',
        },
      },
      {
        id: 'eclipse-keep-powered',
        label: 'Sustain Active Heater Circuitry',
        description:
          'Draw deeper upon battery reserves to keep scientific optics warm and ready for immediate imaging at dawn.',
        tradeoffNotice:
          'Keeps instruments warm for instant imaging (+25 science pts), but strains battery cells with deep discharge.',
        effect: {
          batteryDeltaWh: -60,
          healthDeltaPercent: -5,
          scienceBonusPoints: 25,
          logMessage:
            'Instruments kept warm for dawn passes (+25 science pts). Battery experienced heavy discharge cycle (-5% health).',
        },
      },
    ],
  },
  {
    id: 'event-antenna-stiction',
    phase: 'operations',
    triggerTimeFraction: 0.8,
    title: 'High-Gain Antenna Gimbal Tracking Resistance',
    description:
      'Fine azimuth position sensor indicates slight mechanical drag on the High-Gain Antenna gimbal drive, likely due to atmospheric dust or cold lubrication.',
    historicalContext:
      'Gimbal stiction issues affected Magellan and Mars Reconnaissance Orbiter antenna tracking mechanisms.',
    severity: 'moderate',
    autoDefaultChoiceId: 'gimbal-thruster-jog',
    choices: [
      {
        id: 'gimbal-thruster-jog',
        label: 'Fire RCS Thruster Jolt to Clear Drive',
        description:
          'Pulse reaction control thrusters in counter-torque direction to mechanically dislodge the gimbal detent.',
        tradeoffNotice:
          'Restores 100% antenna articulation. Consumes 10 kg of reserve propellant.',
        effect: {
          propellantDeltaKg: -10,
          healthDeltaPercent: 0,
          logMessage:
            'RCS thruster pulse dislodged the antenna gimbal mechanism. Earth-pointing lock restored with 100% throughput.',
        },
      },
      {
        id: 'gimbal-switch-mga',
        label: 'Lock Gimbal & Fallback to Secondary Antenna',
        description:
          'Park the main dish and switch high-rate telemetry to the medium-gain horn antenna.',
        tradeoffNotice:
          'Saves precious propellant, but downlinking high-res optical imagery will be throttled (-20% science data).',
        effect: {
          scienceMultiplier: 0.8,
          propellantDeltaKg: 0,
          logMessage:
            'Antenna locked in place. Downlink switched to medium-gain horn, preserving propellant but reducing science bitrate.',
        },
      },
    ],
  },
  {
    id: 'event-star-tracker-glitch',
    phase: 'arrival',
    triggerTimeFraction: 0.4,
    title: 'Star Tracker Optical Flare & Attitude Stray',
    description:
      'A high-energy galactic cosmic ray transient strikes the star tracker CCD array, producing false stellar centroids and triggering an attitude lock warning.',
    historicalContext:
      'Experienced by Mars Reconnaissance Orbiter and Cassini during planetary encounter phases.',
    severity: 'moderate',
    autoDefaultChoiceId: 'tracker-gyro-inertial',
    choices: [
      {
        id: 'tracker-gyro-inertial',
        label: 'Switch to Inertial Ring-Laser Gyros',
        description:
          'Maintain attitude reference using internal inertial measurement units while the optical star tracker autonomous self-test resets.',
        tradeoffNotice:
          'Protects approach trajectory without propellant expenditure. Gyro drift imposes slight attitude error (-2% vehicle integrity).',
        effect: {
          healthDeltaPercent: -2,
          logMessage:
            'Inertial gyros held spacecraft approach attitude nominally. Optical star tracker re-acquired lock after 4 minutes.',
        },
      },
      {
        id: 'tracker-recalibrate-sun',
        label: 'Fire RCS Slew to Coarse Sun Vector',
        description:
          'Execute a programmed reaction control thruster slew to re-verify attitude using coarse analog sun sensors.',
        tradeoffNotice:
          'Guarantees immediate positive attitude lock, but expends 6 kg of critical reserve propellant.',
        effect: {
          propellantDeltaKg: -6,
          healthDeltaPercent: 0,
          logMessage:
            'Coarse sun-sensor slew verified 3-axis pointing lock. 6 kg propellant expended.',
        },
      },
    ],
  },
  {
    id: 'event-dust-storm',
    phase: 'science',
    triggerTimeFraction: 0.25,
    title: 'Planetary Dust Storm Eruption in Chryse Planitia',
    description:
      'Global thermal sounders detect a violent regional dust storm rising into the upper atmosphere, degrading optical surface visibility across the northern lowlands.',
    historicalContext:
      'Inspired by the 2018 Martian global dust storm observed in multi-wavelength detail by NASA MRO, MAVEN, and ESA Mars Express.',
    severity: 'moderate',
    autoDefaultChoiceId: 'storm-radar-pivot',
    choices: [
      {
        id: 'storm-radar-pivot',
        label: 'Pivot to Radar Sounding & Atmospheric Profiling',
        description:
          'Re-allocate observation schedule and downlink priority to subsurface radar sounders and atmospheric IR spectrometers to study dust lofting dynamics.',
        tradeoffNotice:
          'Captures high-value atmospheric science (+40 bonus pts) while optical cameras are obscured.',
        effect: {
          scienceBonusPoints: 40,
          healthDeltaPercent: 0,
          logMessage:
            'Infrared spectrometers and radar mapped dust column optical density and convective lofting plumes (+40 bonus science pts).',
        },
      },
      {
        id: 'storm-high-res-wait',
        label: 'Maintain Optical Imaging at Storm Margins',
        description:
          'Keep high-resolution visible camera active to photograph dust devil tracks and dune migration along the clearer storm perimeter.',
        tradeoffNotice:
          'Portions of the camera survey are obscured by atmospheric haze (-10% science data yield).',
        effect: {
          scienceMultiplier: 0.9,
          healthDeltaPercent: 0,
          logMessage:
            'High-resolution cameras imaged vortex perimeter winds, though thick dust obscured central canyon floors.',
        },
      },
    ],
  },
  {
    id: 'event-methane-plume',
    phase: 'science',
    triggerTimeFraction: 0.5,
    title: 'Science Opportunity: Transient Methane Detection',
    description:
      'Spectrometer passes over Nili Fossae detect an unexpected localized spike in atmospheric methane (CH4) concentrations (up to 45 ppbv).',
    historicalContext:
      'Inspired by methane detections by Mars Express and Curiosity, an intensely debated signature of possible subsurface biological or geothermal activity.',
    severity: 'opportunity',
    autoDefaultChoiceId: 'plume-surge',
    choices: [
      {
        id: 'plume-surge',
        label: 'Surge Targeted Multi-Sensor Survey',
        description:
          'Re-orient spacecraft to execute three rapid-succession scanning passes directly across the plume coordinates.',
        tradeoffNotice:
          'Massive scientific return (+75 bonus points)! Consumes 8 kg of propellant and stresses thermal margins.',
        effect: {
          scienceBonusPoints: 75,
          propellantDeltaKg: -8,
          healthDeltaPercent: -3,
          logMessage:
            'Spectacular scientific breakthrough! Methane plume mapped across Nili Fossae (+75 bonus science points).',
        },
      },
      {
        id: 'plume-standard',
        label: 'Maintain Baseline Survey Orbit',
        description:
          'Record standard scheduled observation pass without perturbing orbital timeline or expending propellant.',
        tradeoffNotice:
          'Conserves remaining propellant and battery life. Captures basic baseline data without bonus yield.',
        effect: {
          scienceBonusPoints: 20,
          propellantDeltaKg: 0,
          logMessage:
            'Standard survey pass completed. Baseline methane reading logged safely (+20 science points).',
        },
      },
    ],
  },
];
