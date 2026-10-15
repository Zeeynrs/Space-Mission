import { describe, it, expect } from 'vitest';
import { calculateEngineeringStats } from '../simulation/physics';
import { validateSpacecraftConfiguration } from '../simulation/validator';
import { evaluateMissionOutcome } from '../simulation/scoring';
import { createPrng } from '../simulation/prng';
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
});

describe('Design Validation Engine', () => {
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
});

describe('Mission Scoring & Outcome Evaluation', () => {
  it('awards Full Mission Success for AURORA baseline with positive margins', () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    const stats = calculateEngineeringStats(baseline.installedComponentIds);
    const debrief = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 42);

    expect(debrief.outcome).toBe('success');
    expect(debrief.primaryObjectiveMet).toBe(true);
    expect(debrief.score.totalScore).toBeGreaterThan(600);
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

  it('guarantees deterministic PRNG outputs for identical seeds', () => {
    const prng1 = createPrng(12345);
    const prng2 = createPrng(12345);

    const values1 = [prng1(), prng1(), prng1(), prng1()];
    const values2 = [prng2(), prng2(), prng2(), prng2()];

    expect(values1).toEqual(values2);
  });
});
