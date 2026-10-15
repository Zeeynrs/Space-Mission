import { PRESET_CONFIGURATIONS } from '../data/presets';
import { COMPONENT_CATALOG } from '../data/components';
import { SpacecraftConfiguration } from '../types/component';
import { MissionDebriefReport } from '../types/mission';

const STORAGE_KEYS = {
  SPACECRAFT_CONFIG: 'orbital_spacecraft_config_v1',
  MISSION_HISTORY: 'orbital_mission_history_v1',
  SETTINGS: 'orbital_settings_v1',
};

export interface StoredRunRecord {
  runId: string;
  timestamp: number;
  spacecraftName: string;
  totalCostM: number;
  launchMassKg: number;
  deltaVMs?: number;
  installedComponentIds?: string[];
  sciencePoints: number;
  totalScore: number;
  outcome: 'success' | 'partial' | 'failure';
  headline: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  deterministicSeed: number;
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return null;
}

export function saveSpacecraftConfig(config: SpacecraftConfiguration): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEYS.SPACECRAFT_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save spacecraft configuration to localStorage:', err);
  }
}

export function loadSpacecraftConfig(): SpacecraftConfiguration {
  const fallback = PRESET_CONFIGURATIONS[0].config;
  try {
    const storage = getStorage();
    if (!storage) return fallback;
    const raw = storage.getItem(STORAGE_KEYS.SPACECRAFT_CONFIG);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.installedComponentIds)) {
      return fallback;
    }

    // Filter out unknown component IDs in case catalog changed
    const validIds = new Set(COMPONENT_CATALOG.map((c) => c.id));
    const filteredIds = parsed.installedComponentIds.filter((id: unknown) =>
      typeof id === 'string' && validIds.has(id)
    );

    return {
      id: typeof parsed.id === 'string' ? parsed.id : 'custom-craft',
      name: typeof parsed.name === 'string' ? parsed.name : 'Custom Orbiter',
      installedComponentIds: filteredIds,
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    };
  } catch (err) {
    console.warn('Error reading spacecraft config from storage, using baseline:', err);
    return fallback;
  }
}

export function saveMissionReportToHistory(
  report: MissionDebriefReport,
  spacecraftName: string,
  installedComponentIds?: string[]
): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    const history = loadMissionHistory();
    const record: StoredRunRecord = {
      runId: `run-${Date.now()}`,
      timestamp: Date.now(),
      spacecraftName,
      totalCostM: report.stats.totalCostM,
      launchMassKg: report.stats.launchMassKg,
      deltaVMs: report.stats.deltaVMs,
      installedComponentIds: installedComponentIds || [],
      sciencePoints: report.score.scienceScore,
      totalScore: report.score.totalScore,
      outcome: report.outcome,
      headline: report.headline,
    };

    // Keep last 10 runs
    const updated = [record, ...history].slice(0, 10);
    storage.setItem(STORAGE_KEYS.MISSION_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save mission report to history:', err);
  }
}

export function loadMissionHistory(): StoredRunRecord[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(STORAGE_KEYS.MISSION_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read mission history:', err);
    return [];
  }
}

export function clearMissionHistory(): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEYS.MISSION_HISTORY);
  } catch (err) {
    console.warn('Failed to clear mission history:', err);
  }
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

export function loadUserSettings(): UserSettings {
  const fallback: UserSettings = {
    soundEnabled: true,
    reducedMotion: false,
    deterministicSeed: 42,
  };
  try {
    const storage = getStorage();
    if (!storage) return fallback;
    const raw = storage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: typeof parsed?.soundEnabled === 'boolean' ? parsed.soundEnabled : fallback.soundEnabled,
      reducedMotion: typeof parsed?.reducedMotion === 'boolean' ? parsed.reducedMotion : fallback.reducedMotion,
      deterministicSeed: typeof parsed?.deterministicSeed === 'number' ? parsed.deterministicSeed : fallback.deterministicSeed,
    };
  } catch (err) {
    console.warn('Failed to read user settings from storage:', err);
    return fallback;
  }
}

export function clearAllSavedData(): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEYS.SPACECRAFT_CONFIG);
    storage.removeItem(STORAGE_KEYS.MISSION_HISTORY);
    storage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (err) {
    console.warn('Failed to clear storage:', err);
  }
}

