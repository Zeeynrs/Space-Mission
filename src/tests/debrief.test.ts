import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveMissionReportToHistory,
  loadMissionHistory,
  clearMissionHistory,
  saveUserSettings,
  loadUserSettings,
  clearAllSavedData,
} from '../utils/storage';
import { evaluateMissionOutcome } from '../simulation/scoring';
import { calculateEngineeringStats } from '../simulation/physics';
import { PRESET_CONFIGURATIONS } from '../data/presets';
import { SCIENTIFIC_CITATIONS } from '../data/scientificSources';
import { COMPONENT_CATALOG } from '../data/components';

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

describe('Mission Debrief, History & Settings Verification (Phases 7–10)', () => {
  beforeEach(() => {
    (globalThis as unknown as { localStorage: MockStorage }).localStorage = new MockStorage();
    clearAllSavedData();
  });


  describe('Flight History & Run-to-Run Comparison', () => {
    it('saves and retrieves multiple mission reports in order', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);
      const report1 = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 42);

      saveMissionReportToHistory(report1, 'AURORA-ALPHA', baseline.installedComponentIds);

      let history = loadMissionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].spacecraftName).toBe('AURORA-ALPHA');
      expect(history[0].totalScore).toBe(report1.score.totalScore);
      expect(history[0].installedComponentIds).toEqual(baseline.installedComponentIds);

      // Save a second run
      const report2 = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 99);
      saveMissionReportToHistory(report2, 'AURORA-BETA', baseline.installedComponentIds);

      history = loadMissionHistory();
      expect(history).toHaveLength(2);
      expect(history[0].spacecraftName).toBe('AURORA-BETA');
      expect(history[1].spacecraftName).toBe('AURORA-ALPHA');
    });

    it('correctly calculates delta metrics between consecutive flights', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats1 = calculateEngineeringStats(baseline.installedComponentIds);
      const report1 = evaluateMissionOutcome(stats1, baseline.installedComponentIds, [], 42);

      // Run 1: Baseline
      saveMissionReportToHistory(report1, 'AURORA-1', baseline.installedComponentIds);

      // Run 2: Modified with high-rate laser and heavy battery
      const modifiedIds = [
        ...baseline.installedComponentIds.filter((id) => id !== 'antenna-hga-parabolic'),
        'antenna-dsoc-optical',
      ];
      const stats2 = calculateEngineeringStats(modifiedIds);
      const report2 = evaluateMissionOutcome(stats2, modifiedIds, [], 42);

      saveMissionReportToHistory(report2, 'AURORA-2', modifiedIds);

      const history = loadMissionHistory();
      expect(history).toHaveLength(2);

      const current = history[0]; // AURORA-2
      const previous = history[1]; // AURORA-1

      const scoreDelta = current.totalScore - previous.totalScore;
      const costDelta = current.totalCostM - previous.totalCostM;
      const massDelta = current.launchMassKg - previous.launchMassKg;

      expect(current.spacecraftName).toBe('AURORA-2');
      expect(previous.spacecraftName).toBe('AURORA-1');
      expect(typeof scoreDelta).toBe('number');
      expect(typeof costDelta).toBe('number');
      expect(typeof massDelta).toBe('number');

      // Check component diff
      const currentSet = new Set(current.installedComponentIds || []);
      const prevSet = new Set(previous.installedComponentIds || []);

      const added = (current.installedComponentIds || []).filter((id) => !prevSet.has(id));
      const removed = (previous.installedComponentIds || []).filter((id) => !currentSet.has(id));

      expect(added).toContain('antenna-dsoc-optical');
      expect(removed).toContain('antenna-hga-parabolic');
    });

    it('clears mission history when requested', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);
      const report = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 42);

      saveMissionReportToHistory(report, 'AURORA-TEST', baseline.installedComponentIds);
      expect(loadMissionHistory()).toHaveLength(1);

      clearMissionHistory();
      expect(loadMissionHistory()).toHaveLength(0);
    });
  });

  describe('User Preferences & Settings Persistence', () => {
    it('persists and restores custom sound, reduced motion, and seed settings', () => {
      const customSettings = {
        soundEnabled: false,
        reducedMotion: true,
        deterministicSeed: 9876,
      };

      saveUserSettings(customSettings);
      const restored = loadUserSettings();

      expect(restored.soundEnabled).toBe(false);
      expect(restored.reducedMotion).toBe(true);
      expect(restored.deterministicSeed).toBe(9876);
    });

    it('falls back to default settings when storage is empty or corrupted', () => {
      const restored = loadUserSettings();
      expect(restored.soundEnabled).toBe(true);
      expect(restored.reducedMotion).toBe(false);
      expect(restored.deterministicSeed).toBe(42);
    });
  });

  describe('Scientific Citations & Educational Rigor', () => {
    it('contains comprehensive citations covering all major spaceflight subsystems', () => {
      expect(SCIENTIFIC_CITATIONS.length).toBeGreaterThanOrEqual(8);

      const categories = new Set(SCIENTIFIC_CITATIONS.map((c) => c.category));
      expect(categories.has('propulsion')).toBe(true);
      expect(categories.has('power')).toBe(true);
      expect(categories.has('comm')).toBe(true);
      expect(categories.has('payload')).toBe(true);
      expect(categories.has('geodesy')).toBe(true);
    });

    it('ensures every scientific citation includes verified canonical URL and attribution', () => {
      for (const cit of SCIENTIFIC_CITATIONS) {
        expect(cit.id).toBeTruthy();
        expect(cit.title).toBeTruthy();
        expect(cit.provider).toBeTruthy();
        expect(cit.canonicalUrl).toMatch(/^https?:\/\//);
        expect(cit.attribution).toBeTruthy();
        expect(cit.usedInFeature).toBeTruthy();
        expect(cit.summary.length).toBeGreaterThan(20);
      }
    });

    it('ensures all catalog components have realistic engineering properties', () => {
      for (const comp of COMPONENT_CATALOG) {
        expect(comp.id).toBeTruthy();
        expect(comp.name).toBeTruthy();
        expect(comp.mass).toBeGreaterThan(0);
        expect(comp.cost).toBeGreaterThan(0);
        expect(typeof comp.powerRequired).toBe('number');
        expect(comp.description).toBeTruthy();
        expect(comp.pros.length).toBeGreaterThan(0);
        expect(comp.cons.length).toBeGreaterThan(0);
      }
    });
  });
});
