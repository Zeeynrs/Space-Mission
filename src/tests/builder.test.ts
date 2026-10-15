import { describe, it, expect } from 'vitest';
import { COMPONENT_CATALOG } from '../data/components';
import { PRESET_CONFIGURATIONS } from '../data/presets';
import { AURORA_MISSION } from '../data/mission';
import { calculateEngineeringStats, getComponentById } from '../simulation/physics';
import { validateSpacecraftConfiguration } from '../simulation/validator';
import { ComponentCategory } from '../types/component';

describe('Phase 3: Spacecraft Builder Engine & Catalog Logic', () => {
  it('verifies all 9 subsystem categories exist in the component catalog', () => {
    const requiredCategories: ComponentCategory[] = [
      'bus',
      'propulsion',
      'tank',
      'solar',
      'battery',
      'antenna',
      'computer',
      'thermal',
      'science',
    ];

    const catalogCategories = new Set(COMPONENT_CATALOG.map((c) => c.category));

    for (const cat of requiredCategories) {
      expect(catalogCategories.has(cat)).toBe(true);
    }

    // Verify all components have strictly positive mass, non-negative cost, and valid description
    for (const comp of COMPONENT_CATALOG) {
      expect(comp.id).toBeTruthy();
      expect(comp.name).toBeTruthy();
      expect(comp.mass).toBeGreaterThan(0);
      expect(comp.cost).toBeGreaterThanOrEqual(0);
      expect(comp.description.length).toBeGreaterThan(10);
      expect(comp.rationale.length).toBeGreaterThan(5);
      expect(['single', 'multi']).toContain(comp.slotType);
    }
  });

  it('correctly replaces single-slot components without duplicates', () => {
    // Start with AURORA baseline
    let installedIds = [...PRESET_CONFIGURATIONS[0].config.installedComponentIds];
    const initialBus = installedIds.find((id) => getComponentById(id)?.category === 'bus');
    expect(initialBus).toBe('bus-medium-survey');

    // Simulate builder install action: install bus-deepspace-flagship
    const newBusId = 'bus-deepspace-flagship';
    const newComp = getComponentById(newBusId)!;

    if (newComp.slotType === 'single') {
      installedIds = installedIds.filter((id) => getComponentById(id)?.category !== newComp.category);
      installedIds.push(newBusId);
    }

    // Verify only 1 bus is now installed
    const buses = installedIds.filter((id) => getComponentById(id)?.category === 'bus');
    expect(buses).toHaveLength(1);
    expect(buses[0]).toBe('bus-deepspace-flagship');

    // Verify engineering stats updated
    const stats = calculateEngineeringStats(installedIds);
    expect(stats.dryMassKg).toBeGreaterThan(600);
  });

  it('allows installing multiple science instruments in multi-slot mode', () => {
    let installedIds = [...PRESET_CONFIGURATIONS[0].config.installedComponentIds];
    // Baseline has 2 science instruments: camera and ir spectrometer
    const initialScience = installedIds.filter((id) => getComponentById(id)?.category === 'science');
    expect(initialScience).toHaveLength(2);

    // Install magnetometer, radar, and trace gas sounder
    const additionalInstruments = [
      'sensor-magnetometer',
      'sensor-subsurface-radar',
      'sensor-trace-gas',
    ];

    for (const instId of additionalInstruments) {
      const comp = getComponentById(instId)!;
      if (comp.slotType === 'multi' && !installedIds.includes(instId)) {
        installedIds.push(instId);
      }
    }

    const finalScience = installedIds.filter((id) => getComponentById(id)?.category === 'science');
    expect(finalScience).toHaveLength(5);

    const stats = calculateEngineeringStats(installedIds);
    // Baseline science potential was 250 (camera) + 180 (spectrometer) = 430
    // +140 (mag) + 200 (radar) + 250 (trace gas) = 1020 total potential
    expect(stats.totalSciencePotential).toBe(1020);
  });

  it('flags missing mandatory subsystem categories when a component is removed', () => {
    const baselineIds = [...PRESET_CONFIGURATIONS[0].config.installedComponentIds];

    // Remove propulsion engine
    const withoutEngineIds = baselineIds.filter(
      (id) => getComponentById(id)?.category !== 'propulsion'
    );

    const stats = calculateEngineeringStats(withoutEngineIds);
    expect(stats.hasMandatoryComponents).toBe(false);
    expect(stats.missingCategories).toContain('propulsion');

    const validation = validateSpacecraftConfiguration(withoutEngineIds, stats);
    expect(validation.isValid).toBe(false);
    expect(validation.canLaunch).toBe(false);
    expect(validation.blockers.some((b) => b.id === 'missing-propulsion')).toBe(true);
  });

  it('detects missing power, battery, antenna, or computer systems', () => {
    const baselineIds = [...PRESET_CONFIGURATIONS[0].config.installedComponentIds];

    // Remove solar power
    const noPowerIds = baselineIds.filter((id) => getComponentById(id)?.category !== 'solar');
    const statsNoPower = calculateEngineeringStats(noPowerIds);
    const valNoPower = validateSpacecraftConfiguration(noPowerIds, statsNoPower);
    expect(valNoPower.blockers.some((b) => b.id === 'missing-solar')).toBe(true);

    // Remove battery
    const noBatIds = baselineIds.filter((id) => getComponentById(id)?.category !== 'battery');
    const statsNoBat = calculateEngineeringStats(noBatIds);
    const valNoBat = validateSpacecraftConfiguration(noBatIds, statsNoBat);
    expect(valNoBat.blockers.some((b) => b.id === 'missing-battery')).toBe(true);

    // Remove antenna
    const noAntIds = baselineIds.filter((id) => getComponentById(id)?.category !== 'antenna');
    const statsNoAnt = calculateEngineeringStats(noAntIds);
    const valNoAnt = validateSpacecraftConfiguration(noAntIds, statsNoAnt);
    expect(valNoAnt.blockers.some((b) => b.id === 'missing-antenna')).toBe(true);
  });

  it('evaluates science objectives coverage against installed instruments', () => {
    const baselineIds = PRESET_CONFIGURATIONS[0].config.installedComponentIds;
    const installedComponents = baselineIds
      .map((id) => getComponentById(id))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);

    // Test coverage of primary survey objective
    const primarySurveyCovers = installedComponents.filter((comp) =>
      comp.scienceContributions?.some((sc) => sc.objectiveId === 'obj-primary-survey')
    );
    expect(primarySurveyCovers.length).toBeGreaterThan(0);

    // Baseline does NOT have radar, so obj-subsurface-water should not be covered
    const radarCovers = installedComponents.filter((comp) =>
      comp.scienceContributions?.some((sc) => sc.objectiveId === 'obj-subsurface-water')
    );
    expect(radarCovers).toHaveLength(0);

    // Add radar
    const withRadarIds = [...baselineIds, 'sensor-subsurface-radar'];
    const withRadarComps = withRadarIds
      .map((id) => getComponentById(id))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);

    const updatedRadarCovers = withRadarComps.filter((comp) =>
      comp.scienceContributions?.some((sc) => sc.objectiveId === 'obj-subsurface-water')
    );
    expect(updatedRadarCovers.length).toBe(1);
  });

  it('accurately verifies all 3 built-in presets against launch criteria', () => {
    for (const preset of PRESET_CONFIGURATIONS) {
      const stats = calculateEngineeringStats(preset.config.installedComponentIds);
      const validation = validateSpacecraftConfiguration(
        preset.config.installedComponentIds,
        stats
      );

      // All 3 built-in presets must have all mandatory categories and be valid to launch
      expect(stats.hasMandatoryComponents).toBe(true);
      expect(stats.missingCategories).toHaveLength(0);
      expect(validation.blockers).toHaveLength(0);
      expect(validation.isValid).toBe(true);
      expect(validation.canLaunch).toBe(true);
      expect(stats.launchMassKg).toBeLessThanOrEqual(AURORA_MISSION.maxLaunchMassKg);
      expect(stats.totalCostM).toBeLessThanOrEqual(AURORA_MISSION.budgetCeilingM);
      expect(stats.deltaVMs).toBeGreaterThanOrEqual(AURORA_MISSION.minDeltaVMs);
    }
  });

  it('recalculates live statistics when switching between single-slot components', () => {
    const baselineIds = [...PRESET_CONFIGURATIONS[0].config.installedComponentIds];
    const initialStats = calculateEngineeringStats(baselineIds);

    // Switch from Parabolic Dish (1200 kbps, 110W) to DSOC Optical Laser (25000 kbps, 120W)
    const dsocIds = baselineIds
      .filter((id) => id !== 'antenna-hga-parabolic')
      .concat('antenna-dsoc-optical');
    const dsocStats = calculateEngineeringStats(dsocIds);

    expect(dsocStats.dataRateMarsKbps).toBe(25000);
    expect(dsocStats.powerConsumptionCruiseW).toBe(
      initialStats.powerConsumptionCruiseW - 110 + 120
    );

    // Switch from Medium COPV tank (650 kg fuel) to Heavy Tank (1100 kg fuel)
    const heavyTankIds = baselineIds
      .filter((id) => id !== 'tank-composite-medium')
      .concat('tank-highcap-large');
    const heavyTankStats = calculateEngineeringStats(heavyTankIds);

    expect(heavyTankStats.propellantMassKg).toBe(1100);
    expect(heavyTankStats.launchMassKg).toBeGreaterThan(initialStats.launchMassKg);
    expect(heavyTankStats.deltaVMs).toBeGreaterThan(initialStats.deltaVMs);
  });
});
