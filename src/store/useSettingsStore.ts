import { create } from 'zustand';
import { setAudioMuted } from '../utils/audio';

interface SettingsState {
  soundEnabled: boolean;
  reducedMotion: boolean;
  deterministicSeed: number;
  toggleSound: () => void;
  toggleReducedMotion: () => void;
  setDeterministicSeed: (seed: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: true,
  reducedMotion: false,
  deterministicSeed: 42,

  toggleSound: () => {
    set((state) => {
      const next = !state.soundEnabled;
      setAudioMuted(!next);
      return { soundEnabled: next };
    });
  },

  toggleReducedMotion: () => {
    set((state) => ({ reducedMotion: !state.reducedMotion }));
  },

  setDeterministicSeed: (seed: number) => {
    set({ deterministicSeed: Math.floor(Math.abs(seed)) || 42 });
  },
}));
