import { describe, it, expect } from 'vitest';
import { calculateEngineeringStats } from '../simulation/physics';
import { validateSpacecraftConfiguration } from '../simulation/validator';
import { evaluateMissionOutcome } from '../simulation/scoring';
import { createPrng } from '../simulation/prng';
import {
  initializeSimulation,
  computeTelemetryAtPhase,
  checkPhaseEvent,
  applyEventChoiceToState,
} from '../simulation/engine';
import { MISSION_EVENTS_CATALOG } from '../simulation/events';
import { PRESET_CONFIGURATIONS } from '../data/presets';
import { AURORA_MISSION } from '../data/mission';

describe('Physics & Engineering Calculations', () => {
  it('calculates mass, cost, and delta-v correctly for AURORA baseline', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);

    expect(stats.hasMandatoryComponents).toBe(true);
    expect(stats.missingCategories).toHaveLength(0);
    expect(stats.dryMassKg).toBeGreaterThan(400);
    expect(stats.propellantMassKg).toBe(650);
    expect(stats.launchMassKg).toBe(stats.dryMassKg + stats.propellantMassKg);
    expect(stats.launchMassKg).toBeLessThanOrEqual(AURORA_MISSION.maxLaunchMassKg);
    expect(stats.totalCostM).toBeLessThanOrEqual(AURORA_MISSION.budgetCeilingM);

    // Delta-v via Tsiolkovsky rocket equation: Isp * 9.80665 * ln(M_wet / M_dry)
    // For Isp=315s, M_dry ~ 585 kg, M_wet ~ 1235 kg -> delta-v ~ 2300 m/s
    expect(stats.deltaVMs).toBeGreaterThanOrEqual(AURORA_MISSION.minDeltaVMs);
  });

  it('correctly models solar flux drop at Mars (1.524 AU)', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);

    // Solar power at Mars should be ~43.1% of Earth 1 AU output
    const expectedRatio = AURORA_MISSION.solarFluxMarsRatio;
    const computedRatio = stats.powerGenerationMarsW / stats.powerGenerationEarthW;
    expect(Math.abs(computedRatio - expectedRatio)).toBeLessThan(0.01);
  });

  it('accurately computes battery eclipse requirement in 38-minute Mars shadow', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);

    expect(stats.eclipseDurationHours).toBeCloseTo(0.633, 2);
    expect(stats.eclipseEnergyRequiredWh).toBeGreaterThan(0);
    // Deep battery (980 Wh) should have ample positive margin
    expect(stats.eclipseMarginPercent).toBeGreaterThan(0);
  });

  it('handles component additions and removals dynamically', () => {
    const baselineIds = [...PRESET_CONFIGURATIONS[0].config.installedComponentIds];
    const initialStats = calculateEngineeringStats(baselineIds);

    // Remove Hi-Res Camera (45 kg, $48M, 65W)
    const withoutCameraIds = baselineIds.filter((id) => id !== 'sensor-camera-hires');
    const modifiedStats = calculateEngineeringStats(withoutCameraIds);

    expect(modifiedStats.dryMassKg).toBe(initialStats.dryMassKg - 45);
    expect(modifiedStats.totalCostM).toBe(initialStats.totalCostM - 48);
    expect(modifiedStats.launchMassKg).toBe(initialStats.launchMassKg - 45);
    // Lighter dry mass with same fuel slightly increases delta-v
    expect(modifiedStats.deltaVMs).toBeGreaterThan(initialStats.deltaVMs);
  });
});

describe('Design Validation Engine & Compatibility', () => {
  it('validates AURORA Baseline as fully launch-ready with 0 blockers', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    const validation = validateSpacecraftConfiguration(baseline.installedComponentIds, stats);

    expect(validation.isValid).toBe(true);
    expect(validation.canLaunch).toBe(true);
    expect(validation.blockers).toHaveLength(0);
  });

  it('detects missing mandatory subsystems', () => {
    // Missing engine and antenna
    const badConfigIds = [
      'bus-medium-survey',
      'tank-composite-medium',
      'solar-articulated-wings',
      'battery-highcap-deep',
      'computer-rad750-std',
      'thermal-active-heaters',
    ];
    const stats = calculateEngineeringStats(badConfigIds);
    const validation = validateSpacecraftConfiguration(badConfigIds, stats);

    expect(validation.isValid).toBe(false);
    expect(stats.hasMandatoryComponents).toBe(false);
    expect(stats.missingCategories).toContain('propulsion');
    expect(stats.missingCategories).toContain('antenna');
    expect(validation.blockers.some((b) => b.id.includes('missing-propulsion'))).toBe(true);
    expect(validation.blockers.some((b) => b.id.includes('missing-antenna'))).toBe(true);
  });

  it('flags budget ceiling violations', () => {
    // Intentionally construct an over-budget spacecraft
    const expensiveIds = [
      'bus-deepspace-flagship', // $110M
      'engine-hall-electric', // $80M
      'tank-highcap-large', // $50M
      'solar-ultraflex-advanced', // $75M
      'battery-highcap-deep', // $28M
      'antenna-hga-parabolic', // $55M
      'computer-fault-tolerant-dual', // $50M
      'thermal-active-heaters', // $25M
      'sensor-camera-hires', // $48M
    ]; // Sum = $521M > $400M ceiling
    const stats = calculateEngineeringStats(expensiveIds);
    const validation = validateSpacecraftConfiguration(expensiveIds, stats);

    expect(stats.totalCostM).toBeGreaterThan(AURORA_MISSION.budgetCeilingM);
    expect(validation.blockers.some((b) => b.id === 'budget-exceeded')).toBe(true);
  });

  it('flags launch mass capacity violations', () => {
    // Flagship bus + large tank + heavy instruments that exceed 2,400 kg
    const heavyIds = [
      'bus-deepspace-flagship', // 480 kg
      'engine-biprop-leros', // 75 kg
      'tank-highcap-large', // 70 kg dry + 1100 kg propellant = 1170 kg
      'solar-ultraflex-advanced', // 95 kg
      'battery-highcap-deep', // 55 kg
      'antenna-hga-parabolic', // 48 kg
      'computer-fault-tolerant-dual', // 24 kg
      'thermal-active-heaters', // 38 kg
      'sensor-camera-hires', // 45 kg
      'sensor-spectrometer-ir', // 28 kg
      'sensor-subsurface-radar', // 38 kg
      'sensor-magnetometer', // 14 kg
    ];
    const stats = calculateEngineeringStats(heavyIds);
    // Artificially test launch mass exceeding limit
    const overMassStats = { ...stats, launchMassKg: 2480 };
    const validation = validateSpacecraftConfiguration(heavyIds, overMassStats);

    expect(validation.blockers.some((b) => b.id === 'mass-exceeded')).toBe(true);
  });

  it('flags insufficient delta-v when low-Isp engine has inadequate fuel', () => {
    // Hydrazine engine (Isp=220) with small tank (300 kg) on heavy bus
    const underpoweredIds = [
      'bus-deepspace-flagship', // 480 kg
      'engine-hydrazine-mono', // 40 kg, Isp=220
      'tank-titanium-small', // 25 kg dry, 300 kg fuel
      'solar-fixed-flat',
      'battery-standard-liion',
      'antenna-mga-horn',
      'computer-rad750-std',
      'thermal-passive-mli',
    ];
    const stats = calculateEngineeringStats(underpoweredIds);
    const validation = validateSpacecraftConfiguration(underpoweredIds, stats);

    // Delta-v will be ~ 220 * 9.80665 * ln(954 / 654) ~ 812 m/s < 1350 m/s
    expect(stats.deltaVMs).toBeLessThan(AURORA_MISSION.minDeltaVMs);
    expect(validation.blockers.some((b) => b.id === 'propulsion-insufficient-delta-v')).toBe(true);
  });

  it('prevents duplicate single-slot subsystems', () => {
    const duplicateBuses = [
      'bus-medium-survey',
      'bus-cubesat-heavy', // duplicate bus!
      'engine-biprop-leros',
      'tank-composite-medium',
      'solar-articulated-wings',
      'battery-highcap-deep',
      'antenna-hga-parabolic',
      'computer-rad750-std',
      'thermal-active-heaters',
    ];
    const stats = calculateEngineeringStats(duplicateBuses);
    const validation = validateSpacecraftConfiguration(duplicateBuses, stats);

    expect(validation.isValid).toBe(false);
    expect(validation.blockers.some((b) => b.id === 'dup-bus')).toBe(true);
  });

  it('enforces structural volume compatibility between Compact Bus and Large Tank', () => {
    const incompatibleIds = [
      'bus-cubesat-heavy', // Small compact bus
      'engine-biprop-leros',
      'tank-highcap-large', // 1100 kg tank cannot fit!
      'solar-articulated-wings',
      'battery-highcap-deep',
      'antenna-mga-horn',
      'computer-rad750-std',
      'thermal-passive-mli',
    ];
    const stats = calculateEngineeringStats(incompatibleIds);
    const validation = validateSpacecraftConfiguration(incompatibleIds, stats);

    expect(validation.isValid).toBe(false);
    expect(validation.blockers.some((b) => b.id === 'compat-bus-tank-mismatch')).toBe(true);
  });

  it('enforces electrical power compatibility between Ion Thruster and Solar Panels', () => {
    const incompatiblePowerIds = [
      'bus-medium-survey',
      'engine-hall-electric', // 320 W continuous draw
      'tank-titanium-small',
      'solar-fixed-flat', // only 280 W at Mars!
      'battery-standard-liion',
      'antenna-mga-horn',
      'computer-rad750-std',
      'thermal-passive-mli',
    ];
    const stats = calculateEngineeringStats(incompatiblePowerIds);
    const validation = validateSpacecraftConfiguration(incompatiblePowerIds, stats);

    expect(validation.isValid).toBe(false);
    expect(validation.blockers.some((b) => b.id === 'compat-electric-prop-power')).toBe(true);
  });
});

describe('Mission Scoring & Outcome Evaluation', () => {
  it('awards Full Mission Success for AURORA baseline with positive margins', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    const debrief = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 42);

    expect(debrief.outcome).toBe('success');
    expect(debrief.primaryObjectiveMet).toBe(true);
    expect(debrief.score.totalScore).toBeGreaterThan(600);
    expect(debrief.score.primaryScore).toBe(400);
    expect(debrief.failureReasons).toHaveLength(0);
    expect(debrief.recommendations.length).toBeGreaterThan(0);
  });

  it('evaluates Mission Failure when delta-v is insufficient for Mars capture', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    // Artificially test low delta-v
    const lowDvStats = { ...stats, deltaVMs: 900 };
    const debrief = evaluateMissionOutcome(lowDvStats, baseline.installedComponentIds, [], 42);

    expect(debrief.outcome).toBe('failure');
    expect(debrief.primaryObjectiveMet).toBe(false);
    expect(debrief.score.primaryScore).toBe(0);
    expect(debrief.failureReasons.some((r) => r.includes('Delta-V'))).toBe(true);
  });

  it('evaluates Mission Failure when eclipse battery margin is negative', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    const blackoutStats = { ...stats, eclipseMarginPercent: -15 };
    const debrief = evaluateMissionOutcome(blackoutStats, baseline.installedComponentIds, [], 42);

    expect(debrief.outcome).toBe('failure');
    expect(debrief.primaryObjectiveMet).toBe(false);
    expect(debrief.score.primaryScore).toBe(0);
    expect(debrief.failureReasons.some((r) => r.includes('Battery Exhaustion'))).toBe(true);
  });

  it('evaluates Mission Failure when daylight power margin is negative at Mars', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    const powerStarvedStats = { ...stats, powerMarginDayW: -45 };
    const debrief = evaluateMissionOutcome(powerStarvedStats, baseline.installedComponentIds, [], 42);

    expect(debrief.outcome).toBe('failure');
    expect(debrief.primaryObjectiveMet).toBe(false);
    expect(debrief.score.primaryScore).toBe(0);
    expect(debrief.failureReasons.some((r) => r.includes('Daytime Power Starvation'))).toBe(true);
  });

  it('prevents high science bonus points from overriding a failed primary mission', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    // Low delta-v failure, but huge science bonus
    const failedStats = { ...stats, deltaVMs: 850 };
    const debrief = evaluateMissionOutcome(
      failedStats,
      baseline.installedComponentIds,
      [
        {
          eventId: 'event-solar-flare',
          choice: {
            id: 'flare-observe',
            label: 'Observe',
            description: '',
            tradeoffNotice: '',
            effect: { scienceBonusPoints: 100, logMessage: '' },
          },
          phaseDays: 100,
        },
      ],
      42
    );

    // Primary failed -> outcome MUST be failure, primary score MUST be 0
    expect(debrief.outcome).toBe('failure');
    expect(debrief.primaryObjectiveMet).toBe(false);
    expect(debrief.score.primaryScore).toBe(0);
  });

  it('evaluates Partial Success when communications bandwidth restricts science return', () => {
    // Config with Low-Gain omni antenna (2 kbps)
    const lowCommIds = [
      'bus-medium-survey',
      'engine-biprop-leros',
      'tank-composite-medium',
      'solar-articulated-wings',
      'battery-highcap-deep',
      'antenna-lga-omni', // only 2 kbps!
      'computer-rad750-std',
      'thermal-active-heaters',
      'sensor-camera-hires',
    ];
    const stats = calculateEngineeringStats(lowCommIds);
    const debrief = evaluateMissionOutcome(stats, lowCommIds, [], 42);

    expect(debrief.outcome).toBe('partial');
    expect(debrief.primaryObjectiveMet).toBe(true);
    expect(debrief.recommendations.some((r) => r.includes('antenna') || r.includes('High-Gain'))).toBe(true);
  });

  it('evaluates Partial Success when vehicle health is degraded below 50%', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    // Severe damage events
    const damageEvents = [
      {
        eventId: 'event-1',
        choice: {
          id: 'dmg-1',
          label: '',
          description: '',
          tradeoffNotice: '',
          effect: { healthDeltaPercent: -30, logMessage: '' },
        },
        phaseDays: 50,
      },
      {
        eventId: 'event-2',
        choice: {
          id: 'dmg-2',
          label: '',
          description: '',
          tradeoffNotice: '',
          effect: { healthDeltaPercent: -25, logMessage: '' },
        },
        phaseDays: 150,
      },
    ];

    const debrief = evaluateMissionOutcome(stats, baseline.installedComponentIds, damageEvents, 42);
    expect(debrief.outcome).toBe('partial');
    expect(debrief.primaryObjectiveMet).toBe(true);
  });
});

describe('Deterministic Simulation Engine & State Machine', () => {
  it('guarantees deterministic PRNG outputs for identical seeds', () => {
    const prng1 = createPrng(12345);
    const prng2 = createPrng(12345);

    const values1 = [prng1(), prng1(), prng1(), prng1()];
    const values2 = [prng2(), prng2(), prng2(), prng2()];

    expect(values1).toEqual(values2);
  });

  it('produces identical debrief reports when run twice with the same seed and decisions', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);

    const report1 = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 9999);
    const report2 = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 9999);

    expect(report1.score.totalScore).toBe(report2.score.totalScore);
    expect(report1.score.scienceScore).toBe(report2.score.scienceScore);
    expect(report1.outcome).toBe(report2.outcome);
    expect(report1.failureReasons).toEqual(report2.failureReasons);
    expect(report1.recommendations).toEqual(report2.recommendations);
  });

  it('initializes mission telemetry and scales distance and solar flux across cruise', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    const sim = initializeSimulation(stats, 42);

    expect(sim.phase).toBe('launch');
    expect(sim.telemetry.solarIrradianceWm2).toBe(1361);
    expect(sim.telemetry.distanceToMarsKm).toBe(225_000_000);

    // Compute telemetry midway through cruise (progress = 0.5)
    const cruiseTelemetry = computeTelemetryAtPhase('cruise', 0.5, sim);
    expect(cruiseTelemetry.solarIrradianceWm2).toBeLessThan(1361);
    expect(cruiseTelemetry.solarIrradianceWm2).toBeGreaterThan(586);
    expect(cruiseTelemetry.distanceToMarsKm).toBeLessThan(225_000_000);

    // Compute telemetry at Mars arrival (progress = 1.0)
    const arrivalTelemetry = computeTelemetryAtPhase('arrival', 1.0, sim);
    expect(arrivalTelemetry.solarIrradianceWm2).toBe(586);
    expect(arrivalTelemetry.powerGeneratedW).toBe(stats.powerGenerationMarsW);
  });

  it('triggers operational events at their defined phase and progress fractions', () => {
    const resolved = new Set<string>();
    // Cruise phase has CME event at 0.5 progress fraction
    const eventAtQuarter = checkPhaseEvent('cruise', 0.2, resolved);
    expect(eventAtQuarter).toBeNull();

    const eventAtHalf = checkPhaseEvent('cruise', 0.5, resolved);
    expect(eventAtHalf).not.toBeNull();
    expect(eventAtHalf?.id).toBe('event-solar-flare');
  });

  it('correctly applies operational choice effects to active simulation state', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    const sim = initializeSimulation(stats, 42);

    const event = MISSION_EVENTS_CATALOG[0]; // Solar flare
    const observeChoice = event.choices.find((c) => c.id === 'flare-observe')!;

    const nextState = applyEventChoiceToState(sim, event, observeChoice);
    // flare-observe applies healthDeltaPercent: -10
    expect(nextState.vehicleHealthPercent).toBe(90);
    expect(nextState.resolvedEvents).toHaveLength(1);
    expect(nextState.resolvedEvents[0].choice.id).toBe('flare-observe');
  });

  it('triggers star tracker glitch in arrival phase and dust storm in science phase', () => {
    const resolved = new Set<string>();

    const arrivalEvent = checkPhaseEvent('arrival', 0.45, resolved);
    expect(arrivalEvent).not.toBeNull();
    expect(arrivalEvent?.id).toBe('event-star-tracker-glitch');

    const scienceStormEvent = checkPhaseEvent('science', 0.3, resolved);
    expect(scienceStormEvent).not.toBeNull();
    expect(scienceStormEvent?.id).toBe('event-dust-storm');
  });
});

describe('Advanced Deep Space Hardware (RTG, DSOC, Trace Gas)', () => {
  it('models MMRTG nuclear power without solar flux decay at Mars', () => {
    const baselineIds = PRESET_CONFIGURATIONS[0].config.installedComponentIds;
    // Replace solar array with MMRTG
    const rtgIds = baselineIds
      .filter((id) => !id.startsWith('solar-'))
      .concat('power-rtg-mmrtg');

    const stats = calculateEngineeringStats(rtgIds);

    expect(stats.powerGenerationEarthW).toBe(125);
    // Nuclear power is 100% constant at Mars, not scaled down by 0.431!
    expect(stats.powerGenerationMarsW).toBe(125);
    // With 285W critical load and 125W RTG, net load in eclipse is 160W, leaving 85% battery reserve
    expect(stats.eclipseMarginPercent).toBe(85);
  });

  it('correctly calculates 25 Mbps optical bandwidth for DSOC laser terminal', () => {
    const baselineIds = PRESET_CONFIGURATIONS[0].config.installedComponentIds;
    // Replace antenna with DSOC optical laser
    const dsocIds = baselineIds
      .filter((id) => !id.startsWith('antenna-'))
      .concat('antenna-dsoc-optical');

    const stats = calculateEngineeringStats(dsocIds);

    expect(stats.dataRateMarsKbps).toBe(25000);
  });

  it('aggregates science potential for Trace Gas Spectrometer (TGO-ACS)', () => {
    const baselineIds = PRESET_CONFIGURATIONS[0].config.installedComponentIds;
    const initialStats = calculateEngineeringStats(baselineIds);

    const withTraceGasIds = [...baselineIds, 'sensor-trace-gas'];
    const statsWithGas = calculateEngineeringStats(withTraceGasIds);

    // sensor-trace-gas contributes 200 + 50 = 250 points
    expect(statsWithGas.totalSciencePotential).toBe(
      initialStats.totalSciencePotential + 250
    );
  });
});
