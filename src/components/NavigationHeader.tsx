import React, { useState } from 'react';
import { useMissionStore, ScreenType } from '../store/useMissionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useSpacecraftStore } from '../store/useSpacecraftStore';
import {
  Rocket,
  Compass,
  Wrench,
  Activity,
  FileText,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  X,
  Menu,
  Eye,
  Shuffle,
  Keyboard,
} from 'lucide-react';

export function NavigationHeader() {
  const { activeScreen, setActiveScreen } = useMissionStore();
  const {
    soundEnabled,
    toggleSound,
    reducedMotion,
    toggleReducedMotion,
    deterministicSeed,
    setDeterministicSeed,
    resetSettings,
  } = useSettingsStore();
  const { resetToDefault } = useSpacecraftStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: ScreenType; label: string; icon: React.ElementType }[] = [
    { id: 'briefing', label: 'Briefing', icon: Compass },
    { id: 'builder', label: 'Spacecraft Builder', icon: Wrench },
    { id: 'operations', label: 'Mission Ops', icon: Activity },
    { id: 'debrief', label: 'Debrief', icon: FileText },
    { id: 'sources', label: 'NASA Data', icon: BookOpen },
  ];

  const handleRandomizeSeed = () => {
    const randomSeed = Math.floor(1000 + Math.random() * 9000);
    setDeterministicSeed(randomSeed);
  };

  return (
    <>
      <header className="w-full bg-space-900/95 border-b border-space-800 backdrop-blur sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between text-slate-200">
        {/* Brand & Project Code */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveScreen('title');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 group focus:outline-none focus:ring-1 focus:ring-cyan rounded p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/40 flex items-center justify-center text-cyan group-hover:bg-cyan/20 transition-all">
              <Rocket className="w-4 h-4 transform -rotate-45" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm tracking-wider uppercase flex items-center gap-1.5 text-slate-100">
                <span>ORBITAL</span>
                <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.2 rounded border border-cyan/30">
                  AURORA
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                MARS MISSION ARCHITECT
              </div>
            </div>
          </button>
        </div>

        {/* Desktop Screen Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-space-950/80 p-1 rounded-lg border border-space-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_10px_rgba(0,229,255,0.2)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Controls: Audio, Settings, Reset, Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Seed Indicator */}
          <div className="hidden lg:flex items-center gap-1 bg-space-950 px-2 py-1 rounded border border-space-800 text-[11px] font-mono">
            <span className="text-slate-500">SEED:</span>
            <input
              type="number"
              value={deterministicSeed}
              onChange={(e) => setDeterministicSeed(Number(e.target.value))}
              className="w-14 bg-transparent text-cyan focus:outline-none text-right font-mono"
              title="Deterministic Random Seed"
            />
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg border border-space-700 hover:border-cyan/50 text-slate-300 hover:text-cyan transition-colors"
            title={soundEnabled ? 'Mute Audio (Press M)' : 'Enable Audio (Press M)'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Settings & Accessibility Modal Toggle */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg border border-space-700 hover:border-cyan/50 text-slate-300 hover:text-cyan transition-colors"
            title="Settings, Accessibility & Shortcuts"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Reset Configuration Button */}
          <button
            onClick={resetToDefault}
            className="p-1.5 rounded-lg border border-space-700 hover:border-amber/50 text-slate-300 hover:text-amber transition-colors"
            title="Reset Spacecraft to Default Aurora Baseline"
            aria-label="Reset Spacecraft"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mobile Navigation Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-space-700 hover:border-cyan/50 text-slate-300 hover:text-cyan transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-space-900 border-b border-space-800 p-3 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveScreen(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan/15 text-cyan border border-cyan/40 font-bold'
                    : 'text-slate-300 hover:bg-space-800'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ================= SETTINGS & ACCESSIBILITY MODAL ================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-space-900 border border-space-700 rounded-2xl shadow-2xl p-6 space-y-5 font-mono">
            {/* Close Button */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-space-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <div className="flex items-center gap-2 text-cyan text-xs uppercase tracking-widest font-bold mb-1">
                <Sliders className="w-4 h-4 text-cyan" />
                <span>MISSION ARCHITECT SETTINGS</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-100 uppercase tracking-tight">
                Preferences & Accessibility
              </h3>
            </div>

            {/* Sound Toggle */}
            <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span>Sound Effects</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Synthesized telemetry beeps, UI clicks, and thruster audio
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  soundEnabled
                    ? 'bg-cyan text-space-950'
                    : 'bg-space-800 text-slate-400 border border-space-700'
                }`}
              >
                {soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber" />
                  <span>Reduced Motion</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Minimizes 3D rotation jerks and camera orbiting animations
                </div>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reducedMotion
                    ? 'bg-amber text-space-950'
                    : 'bg-space-800 text-slate-400 border border-space-700'
                }`}
              >
                {reducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Deterministic Simulation Seed */}
            <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Deterministic Seed</span>
                <span className="text-cyan font-bold">{deterministicSeed}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Controls pseudo-random operational event sequencing. Identical seeds reproduce 100% identical flight telemetry.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  value={deterministicSeed}
                  onChange={(e) => setDeterministicSeed(Number(e.target.value))}
                  className="w-full bg-space-900 border border-space-700 rounded px-2.5 py-1 text-slate-100 text-xs font-mono"
                />
                <button
                  onClick={handleRandomizeSeed}
                  className="px-3 py-1 rounded bg-space-800 hover:bg-space-750 border border-space-700 text-cyan text-xs font-bold flex items-center gap-1 shrink-0"
                  title="Generate Random Seed"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Random</span>
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Guide */}
            <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px] uppercase">
                <Keyboard className="w-3.5 h-3.5 text-cyan" />
                <span>Keyboard Shortcuts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div><span className="text-cyan font-bold">Space:</span> Pause / Resume Sim</div>
                <div><span className="text-cyan font-bold">1 / 2 / 5:</span> Sim Speed (1x, 2x, 5x)</div>
                <div><span className="text-cyan font-bold">M:</span> Toggle Audio Mute</div>
                <div><span className="text-cyan font-bold">Esc:</span> Close Active Modal</div>
              </div>
            </div>

            {/* Reset Settings Button */}
            <div className="flex items-center justify-between pt-2 border-t border-space-800 text-xs">
              <button
                onClick={resetSettings}
                className="text-slate-500 hover:text-slate-300 text-[11px] underline"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 rounded-lg bg-cyan text-space-950 hover:bg-cyan/90 font-bold text-xs uppercase tracking-wider glow-cyan"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
