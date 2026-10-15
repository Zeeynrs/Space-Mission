import { create } from 'zustand';
import { ComponentCategory, SpacecraftConfiguration } from '../types/component';
import { EngineeringStatistics, ValidationResult } from '../types/mission';
import { calculateEngineeringStats, getComponentById } from '../simulation/physics';
import { validateSpacecraftConfiguration } from '../simulation/validator';
import { loadSpacecraftConfig, saveSpacecraftConfig } from '../utils/storage';
import { PRESET_CONFIGURATIONS } from '../data/presets';
import { playComponentInstall, playComponentRemove, playUiClick } from '../utils/audio';

interface SpacecraftState {
  currentConfig: SpacecraftConfiguration;
  stats: EngineeringStatistics;
  validation: ValidationResult;
  selectedComponentId: string | null;
  activeCategory: ComponentCategory;

  // Actions
  installComponent: (componentId: string) => void;
  removeComponent: (componentId: string) => void;
  loadPreset: (presetId: string) => void;
  resetToDefault: () => void;
  setSelectedComponentId: (id: string | null) => void;
  setActiveCategory: (cat: ComponentCategory) => void;
  setSpacecraftName: (name: string) => void;
}

const initialConfig = loadSpacecraftConfig();
const initialStats = calculateEngineeringStats(initialConfig.installedComponentIds);
const initialValidation = validateSpacecraftConfiguration(
  initialConfig.installedComponentIds,
  initialStats
);

export const useSpacecraftStore = create<SpacecraftState>((set, get) => ({
  currentConfig: initialConfig,
  stats: initialStats,
  validation: initialValidation,
  selectedComponentId: initialConfig.installedComponentIds[0] || null,
  activeCategory: 'bus',

  installComponent: (componentId: string) => {
    const comp = getComponentById(componentId);
    if (!comp) return;

    const { currentConfig } = get();
    let updatedIds = [...currentConfig.installedComponentIds];

    if (comp.slotType === 'single') {
      // Replace existing component in the same category if one exists
      updatedIds = updatedIds.filter((id) => {
        const existing = getComponentById(id);
        return existing?.category !== comp.category;
      });
      updatedIds.push(componentId);
    } else {
      // Multi-slot (e.g. science instruments) - toggle or add if not already present
      if (!updatedIds.includes(componentId)) {
        updatedIds.push(componentId);
      }
    }

    const updatedConfig: SpacecraftConfiguration = {
      ...currentConfig,
      installedComponentIds: updatedIds,
    };

    const newStats = calculateEngineeringStats(updatedIds);
    const newValidation = validateSpacecraftConfiguration(updatedIds, newStats);

    saveSpacecraftConfig(updatedConfig);
    playComponentInstall();

    set({
      currentConfig: updatedConfig,
      stats: newStats,
      validation: newValidation,
      selectedComponentId: componentId,
    });
  },

  removeComponent: (componentId: string) => {
    const { currentConfig } = get();
    const updatedIds = currentConfig.installedComponentIds.filter(
      (id) => id !== componentId
    );

    const updatedConfig: SpacecraftConfiguration = {
      ...currentConfig,
      installedComponentIds: updatedIds,
    };

    const newStats = calculateEngineeringStats(updatedIds);
    const newValidation = validateSpacecraftConfiguration(updatedIds, newStats);

    saveSpacecraftConfig(updatedConfig);
    playComponentRemove();

    set({
      currentConfig: updatedConfig,
      stats: newStats,
      validation: newValidation,
      selectedComponentId: updatedIds[0] || null,
    });
  },

  loadPreset: (presetId: string) => {
    const found = PRESET_CONFIGURATIONS.find((p) => p.presetId === presetId);
    if (!found) return;

    const updatedConfig: SpacecraftConfiguration = {
      ...found.config,
      createdAt: Date.now(),
    };

    const newStats = calculateEngineeringStats(updatedConfig.installedComponentIds);
    const newValidation = validateSpacecraftConfiguration(
      updatedConfig.installedComponentIds,
      newStats
    );

    saveSpacecraftConfig(updatedConfig);
    playUiClick();

    set({
      currentConfig: updatedConfig,
      stats: newStats,
      validation: newValidation,
      selectedComponentId: updatedConfig.installedComponentIds[0] || null,
    });
  },

  resetToDefault: () => {
    const baseline = PRESET_CONFIGURATIONS[0].config;
    get().loadPreset(baseline.id);
  },

  setSelectedComponentId: (id: string | null) => {
    set({ selectedComponentId: id });
  },

  setActiveCategory: (cat: ComponentCategory) => {
    set({ activeCategory: cat });
  },

  setSpacecraftName: (name: string) => {
    const { currentConfig } = get();
    const updated = { ...currentConfig, name };
    saveSpacecraftConfig(updated);
    set({ currentConfig: updated });
  },
}));
