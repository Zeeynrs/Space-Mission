import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadSpacecraftConfig,
  saveSpacecraftConfig,
  loadMissionHistory,
  saveMissionReportToHistory,
} from '../utils/storage';
import { PRESET_CONFIGURATIONS } from '../data/presets';
import { MissionDebriefReport } from '../types/mission';

class MockStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

describe('Storage & Persistence Layer', () => {
  beforeEach(() => {
    (globalThis as unknown as { localStorage: MockStorage }).localStorage = new MockStorage();
  });

  it('falls back safely to default baseline configuration when storage is empty', () => {
    const config = loadSpacecraftConfig();
    expect(config.id).toBe(PRESET_CONFIGURATIONS[0].config.id);
    expect(config.installedComponentIds.length).toBeGreaterThan(0);
  });

  it('recovers gracefully from corrupted JSON in localStorage', () => {
    localStorage.setItem('orbital_spacecraft_config_v1', '{ invalid json garbage ###');
    const config = loadSpacecraftConfig();
    expect(config.id).toBe(PRESET_CONFIGURATIONS[0].config.id);
  });

  it('filters out obsolete or nonexistent component IDs', () => {
    const custom = {
      id: 'test-custom',
      name: 'Custom Probe',
      installedComponentIds: ['bus-medium-survey', 'fake-nonexistent-component-123'],
      createdAt: Date.now(),
    };
    saveSpacecraftConfig(custom);
    const loaded = loadSpacecraftConfig();
    expect(loaded.installedComponentIds).toContain('bus-medium-survey');
    expect(loaded.installedComponentIds).not.toContain('fake-nonexistent-component-123');
  });

  it('saves and retrieves run history records correctly', () => {
    const mockReport: MissionDebriefReport = {
      outcome: 'success',
      headline: 'Mission Success',
      narrative: 'Nominal survey',
      primaryObjectiveMet: true,
      objectivesSummary: [],
      score: {
        primaryScore: 400,
        scienceScore: 350,
        budgetEfficiencyScore: 80,
        engineeringSafetyScore: 75,
        totalScore: 905,
      },
      stats: {
        dryMassKg: 500,
        propellantMassKg: 650,
        launchMassKg: 1150,
        totalCostM: 320,
        totalThrustN: 650,
        effectiveIspS: 315,
        deltaVMs: 2300,
        powerGenerationEarthW: 1400,
        powerGenerationMarsW: 600,
        powerConsumptionCruiseW: 300,
        powerConsumptionScienceW: 350,
        powerMarginDayW: 250,
        batteryCapacityWh: 980,
        eclipseDurationHours: 0.633,
        eclipseEnergyRequiredWh: 150,
        eclipseMarginPercent: 60,
        dataRateMarsKbps: 1200,
        totalSciencePotential: 400,
        hasMandatoryComponents: true,
        missingCategories: [],
      },
      eventLog: [],
      failureReasons: [],
      recommendations: [],
      simulationSeed: 42,
    };

    saveMissionReportToHistory(mockReport, 'AURORA Test');
    const history = loadMissionHistory();
    expect(history).toHaveLength(1);
    expect(history[0].spacecraftName).toBe('AURORA Test');
    expect(history[0].totalScore).toBe(905);
  });
});
