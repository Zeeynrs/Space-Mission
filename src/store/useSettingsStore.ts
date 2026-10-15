import { create } from 'zustand';
import { setAudioMuted } from '../utils/audio';
import { loadUserSettings, saveUserSettings, UserSettings } from '../utils/storage';

interface SettingsState extends UserSettings {
  toggleSound: () => void;
  toggleReducedMotion: () => void;
  setDeterministicSeed: (seed: number) => void;
  resetSettings: () => void;
}

const initialSettings = loadUserSettings();
setAudioMuted(!initialSettings.soundEnabled);

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: initialSettings.soundEnabled,
  reducedMotion: initialSettings.reducedMotion,
  deterministicSeed: initialSettings.deterministicSeed,

  toggleSound: () => {
    set((state) => {
      const next = !state.soundEnabled;
      setAudioMuted(!next);
      const updated = { ...state, soundEnabled: next };
      saveUserSettings({
        soundEnabled: next,
        reducedMotion: updated.reducedMotion,
        deterministicSeed: updated.deterministicSeed,
      });
      return { soundEnabled: next };
    });
  },

  toggleReducedMotion: () => {
    set((state) => {
      const next = !state.reducedMotion;
      const updated = { ...state, reducedMotion: next };
      saveUserSettings({
        soundEnabled: updated.soundEnabled,
        reducedMotion: next,
        deterministicSeed: updated.deterministicSeed,
      });
      return { reducedMotion: next };
    });
  },

  setDeterministicSeed: (seed: number) => {
    const validSeed = Math.floor(Math.abs(seed)) || 42;
    set((state) => {
      const updated = { ...state, deterministicSeed: validSeed };
      saveUserSettings({
        soundEnabled: updated.soundEnabled,
        reducedMotion: updated.reducedMotion,
        deterministicSeed: validSeed,
      });
      return { deterministicSeed: validSeed };
    });
  },

  resetSettings: () => {
    const defaultSettings: UserSettings = {
      soundEnabled: true,
      reducedMotion: false,
      deterministicSeed: 42,
    };
    setAudioMuted(false);
    saveUserSettings(defaultSettings);
    set(defaultSettings);
  },
}));
