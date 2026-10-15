import { EngineeringStatistics, MissionPhase, MissionTelemetry } from '../types/mission';
import { MissionEvent, EventChoice } from '../types/event';
import { MISSION_EVENTS_CATALOG } from './events';

export const MISSION_PHASE_SEQUENCE: MissionPhase[] = [
  'launch',
  'deployment',
  'cruise',
  'arrival',
  'insertion',
  'operations',
  'science',
  'debrief',
];

export const PHASE_DURATIONS_DAYS: Record<MissionPhase, number> = {
  launch: 1.0,
  deployment: 1.5,
  cruise: 210.0,
  arrival: 2.0,
  insertion: 1.5,
  operations: 15.0,
  science: 90.0,
  debrief: 0.0,
};

export interface ActiveSimulationState {
  seed: number;
  phase: MissionPhase;
  phaseProgress: number; // 0.0 to 1.0
  missionTimeDays: number;
  stats: EngineeringStatistics;
  telemetry: MissionTelemetry;
  vehicleHealthPercent: number;
  batteryLevelWh: number;
  propellantRemainingKg: number;
  deltaVRemainingMs: number;
  scienceDataCollectedGb: number;
  activeEvent: MissionEvent | null;
  resolvedEvents: {
    eventId: string;
    choice: EventChoice;
    phaseDays: number;
  }[];
  isComplete: boolean;
  isPaused: boolean;
  timeScale: number; // 1x, 2x, 5x, etc.
}

export function initializeSimulation(
  stats: EngineeringStatistics,
  seed: number = 42
): ActiveSimulationState {
  // Initial values at launch pad
  const initialBatteryWh = stats.batteryCapacityWh;
  const initialPropellantKg = stats.propellantMassKg;
  const initialDeltaVMs = stats.deltaVMs;

  const telemetry: MissionTelemetry = {
    phase: 'launch',
    phaseProgress: 0,
    missionTimeDays: 0,
    distanceToMarsKm: 225_000_000, // Mean opposition distance ~225M km
    velocityKps: 11.2, // Earth escape velocity ~11.2 km/s
    solarIrradianceWm2: 1361,
    powerGeneratedW: stats.powerGenerationEarthW,
    powerRequiredW: stats.powerConsumptionCruiseW,
    powerBalanceW: stats.powerGenerationEarthW - stats.powerConsumptionCruiseW,
    batteryLevelWh: initialBatteryWh,
    batteryPercent: 100,
    propellantRemainingKg: initialPropellantKg,
    propellantPercent: 100,
    deltaVRemainingMs: initialDeltaVMs,
    commDataRateKbps: stats.dataRateMarsKbps,
    lightTimeDelaySeconds: 4.2 * 60, // ~4.2 mins at 0.5 AU
    scienceDataCollectedGb: 0,
    spacecraftHealthPercent: 100,
    currentAnomalyText: undefined,
  };

  return {
    seed,
    phase: 'launch',
    phaseProgress: 0,
    missionTimeDays: 0,
    stats,
    telemetry,
    vehicleHealthPercent: 100,
    batteryLevelWh: initialBatteryWh,
    propellantRemainingKg: initialPropellantKg,
    deltaVRemainingMs: initialDeltaVMs,
    scienceDataCollectedGb: 0,
    activeEvent: null,
    resolvedEvents: [],
    isComplete: false,
    isPaused: false,
    timeScale: 1,
  };
}

export function computeTelemetryAtPhase(
  phase: MissionPhase,
  progress: number,
  state: ActiveSimulationState
): MissionTelemetry {
  const { stats } = state;
  let missionTimeDays = 0;

  // Compute accumulated elapsed days up to current phase
  for (const p of MISSION_PHASE_SEQUENCE) {
    if (p === phase) {
      missionTimeDays += progress * (PHASE_DURATIONS_DAYS[p] || 0);
      break;
    }
    missionTimeDays += PHASE_DURATIONS_DAYS[p] || 0;
  }

  // Distance and Solar Flux curve
  let distanceToMarsKm = 225_000_000;
  let solarIrradianceWm2 = 1361;
  let velocityKps = 11.2;
  let powerGeneratedW = stats.powerGenerationEarthW;
  let powerRequiredW = stats.powerConsumptionCruiseW;
  let lightTimeDelaySeconds = 250;

  if (phase === 'launch' || phase === 'deployment') {
    distanceToMarsKm = 225_000_000 - progress * 5_000_000;
    solarIrradianceWm2 = 1361;
    velocityKps = 11.2 - progress * 4.0;
    powerGeneratedW = stats.powerGenerationEarthW;
    powerRequiredW = stats.powerConsumptionCruiseW;
    lightTimeDelaySeconds = 250;
  } else if (phase === 'cruise') {
    distanceToMarsKm = 220_000_000 * (1 - progress);
    // Interpolate irradiance from 1361 W/m² (Earth) down to 586 W/m² (Mars)
    solarIrradianceWm2 = Math.round(1361 - progress * (1361 - 586));
    const powerRatio = solarIrradianceWm2 / 1361;
    powerGeneratedW = Math.round(stats.powerGenerationEarthW * powerRatio);
    powerRequiredW = stats.powerConsumptionCruiseW;
    velocityKps = 24.5 - Math.sin(progress * Math.PI) * 5.0; // heliocentric orbital velocity
    lightTimeDelaySeconds = Math.round(250 + progress * (1200 - 250));
  } else if (phase === 'arrival') {
    distanceToMarsKm = Math.round(50_000 * (1 - progress) + 1_000);
    solarIrradianceWm2 = 586;
    powerGeneratedW = stats.powerGenerationMarsW;
    powerRequiredW = stats.powerConsumptionCruiseW;
    velocityKps = 5.7; // Hyperbolic approach velocity
    lightTimeDelaySeconds = 1200;
  } else if (phase === 'insertion') {
    distanceToMarsKm = Math.round(1_000 - progress * 600); // 400 km target altitude
    solarIrradianceWm2 = 586;
    powerGeneratedW = stats.powerGenerationMarsW;
    powerRequiredW = stats.powerConsumptionCruiseW + 40; // propulsion valves energized
    velocityKps = Math.max(3.4, 5.7 - progress * 2.3); // MOI burn slows down into orbit
    lightTimeDelaySeconds = 1200;
  } else if (phase === 'operations' || phase === 'science' || phase === 'debrief') {
    distanceToMarsKm = 400; // In stable 400 km orbit
    solarIrradianceWm2 = 586;
    powerGeneratedW = stats.powerGenerationMarsW;
    powerRequiredW = stats.powerConsumptionScienceW;
    velocityKps = 3.53; // Circular Mars orbital velocity at 400 km
    lightTimeDelaySeconds = 1240;
  }

  // Propellant and Delta-V evolution
  let propKg = state.propellantRemainingKg;
  let dVMs = state.deltaVRemainingMs;

  if (phase === 'insertion') {
    // 80% of propellant is consumed during MOI burn
    const burnedProp = stats.propellantMassKg * 0.8 * progress;
    propKg = Math.max(0, stats.propellantMassKg - burnedProp);
    dVMs = Math.max(0, stats.deltaVMs - Math.round(1350 * progress));
  } else if (phase === 'operations' || phase === 'science' || phase === 'debrief') {
    propKg = Math.max(0, state.propellantRemainingKg);
    dVMs = Math.max(0, state.deltaVRemainingMs);
  }

  // Science Data Collection (accumulates during operations and science phases)
  let scienceGb = state.scienceDataCollectedGb;
  if (phase === 'science') {
    const maxScienceGb = (stats.totalSciencePotential / 10) * (stats.dataRateMarsKbps / 500);
    scienceGb = Math.round(progress * Math.max(25, maxScienceGb) * 10) / 10;
  } else if (phase === 'debrief') {
    scienceGb = Math.max(25, (stats.totalSciencePotential / 10) * (stats.dataRateMarsKbps / 500));
  }

  const powerBalanceW = powerGeneratedW - powerRequiredW;
  const batteryPercent = Math.min(100, Math.round((state.batteryLevelWh / (stats.batteryCapacityWh || 1)) * 100));
  const propPercent = stats.propellantMassKg > 0 ? Math.min(100, Math.round((propKg / stats.propellantMassKg) * 100)) : 100;

  return {
    phase,
    phaseProgress: progress,
    missionTimeDays: Math.round(missionTimeDays * 10) / 10,
    distanceToMarsKm: Math.round(distanceToMarsKm),
    velocityKps: Math.round(velocityKps * 100) / 100,
    solarIrradianceWm2,
    powerGeneratedW,
    powerRequiredW,
    powerBalanceW,
    batteryLevelWh: state.batteryLevelWh,
    batteryPercent,
    propellantRemainingKg: Math.round(propKg),
    propellantPercent: propPercent,
    deltaVRemainingMs: Math.round(dVMs),
    commDataRateKbps: stats.dataRateMarsKbps,
    lightTimeDelaySeconds,
    scienceDataCollectedGb: scienceGb,
    spacecraftHealthPercent: Math.round(state.vehicleHealthPercent),
    currentAnomalyText: state.activeEvent ? state.activeEvent.title : undefined,
  };
}

export function checkPhaseEvent(
  phase: MissionPhase,
  progress: number,
  resolvedEventIds: Set<string>
): MissionEvent | null {
  for (const event of MISSION_EVENTS_CATALOG) {
    if (event.phase === phase && !resolvedEventIds.has(event.id)) {
      if (progress >= event.triggerTimeFraction) {
        return event;
      }
    }
  }
  return null;
}

export function applyEventChoiceToState(
  state: ActiveSimulationState,
  event: MissionEvent,
  choice: EventChoice
): ActiveSimulationState {
  const effect = choice.effect;
  const newHealth = Math.max(
    0,
    Math.min(100, state.vehicleHealthPercent + (effect.healthDeltaPercent || 0))
  );
  const newPropellant = Math.max(
    0,
    state.propellantRemainingKg + (effect.propellantDeltaKg || 0)
  );
  const newBattery = Math.max(
    0,
    Math.min(state.stats.batteryCapacityWh, state.batteryLevelWh + (effect.batteryDeltaWh || 0))
  );

  const resolved = [
    ...state.resolvedEvents,
    {
      eventId: event.id,
      choice,
      phaseDays: state.telemetry.missionTimeDays,
    },
  ];

  return {
    ...state,
    vehicleHealthPercent: newHealth,
    propellantRemainingKg: newPropellant,
    batteryLevelWh: newBattery,
    resolvedEvents: resolved,
    activeEvent: null, // cleared
    isPaused: false, // resume playback
  };
}
