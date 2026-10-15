import React from 'react';
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
} from 'lucide-react';

export function NavigationHeader() {
  const { activeScreen, setActiveScreen } = useMissionStore();
  const { soundEnabled, toggleSound, deterministicSeed, setDeterministicSeed } = useSettingsStore();
  const { resetToDefault } = useSpacecraftStore();

  const navItems: { id: ScreenType; label: string; icon: React.ElementType }[] = [
    { id: 'briefing', label: 'Briefing', icon: Compass },
    { id: 'builder', label: 'Spacecraft Builder', icon: Wrench },
    { id: 'operations', label: 'Mission Ops', icon: Activity },
    { id: 'debrief', label: 'Debrief', icon: FileText },
    { id: 'sources', label: 'NASA Data', icon: BookOpen },
  ];

  return (
    <header className="w-full bg-space-900/95 border-b border-space-800 backdrop-blur sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between text-slate-200">
      {/* Brand & Project Code */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveScreen('title')}
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

      {/* Screen Navigation Tabs */}
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
                  ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Controls: Audio, Reset, Seed */}
      <div className="flex items-center gap-3">
        {/* Seed Input for Deterministic Evaluation */}
        <div className="hidden sm:flex items-center gap-1 bg-space-950 px-2 py-1 rounded border border-space-800 text-[11px] font-mono">
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
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
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
      </div>
    </header>
  );
}
