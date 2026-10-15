import { useMissionStore } from '../../store/useMissionStore';
import { useSpacecraftStore } from '../../store/useSpacecraftStore';
import { SpacecraftBuilder3D } from '../../scene3d/SpacecraftBuilder3D';
import { PRESET_CONFIGURATIONS } from '../../data/presets';
import { Compass, BookOpen, Wrench, ChevronRight } from 'lucide-react';

export function TitleScreen() {
  const { setActiveScreen } = useMissionStore();
  const { currentConfig, loadPreset, stats } = useSpacecraftStore();

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
            NASA Space Apps Exploration Challenge
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 uppercase">
              ORBITAL
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-cyan font-mono tracking-wide">
              MISSION ARCHITECT
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl pt-2">
              Step into the role of a planetary mission engineer. Design and configure an exploration orbiter for{' '}
              <strong className="text-slate-200">Project AURORA</strong>, balance mass, power at 1.52 AU, propulsion delta-v, and Deep Space Network communications, then launch a simulated mission to survey Mars.
            </p>
          </div>

          {/* Quick Mission Stat Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-md text-xs font-mono">
            <div className="bg-space-900 border border-space-800 rounded p-2.5">
              <span className="text-slate-500 block text-[10px]">TARGET BODY</span>
              <span className="text-amber font-bold">MARS</span>
            </div>
            <div className="bg-space-900 border border-space-800 rounded p-2.5">
              <span className="text-slate-500 block text-[10px]">BUDGET CAP</span>
              <span className="text-slate-200 font-bold">$400M USD</span>
            </div>
            <div className="bg-space-900 border border-space-800 rounded p-2.5">
              <span className="text-slate-500 block text-[10px]">LAUNCH MASS</span>
              <span className="text-slate-200 font-bold">≤ 2,400 KG</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => setActiveScreen('builder')}
              className="px-6 py-3 rounded-lg bg-cyan text-space-950 font-bold text-sm tracking-wide uppercase hover:bg-cyan/90 transition-all flex items-center gap-2 glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan"
            >
              <Wrench className="w-4 h-4" />
              <span>Enter Spacecraft Builder</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveScreen('briefing')}
              className="px-5 py-3 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700 text-slate-200 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan" />
              <span>Mission Briefing</span>
            </button>

            <button
              onClick={() => setActiveScreen('sources')}
              className="px-4 py-3 rounded-lg bg-space-900 hover:bg-space-800 border border-space-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Scientific Data</span>
            </button>
          </div>

          {/* Architecture Presets Bar */}
          <div className="pt-4 border-t border-space-800/80">
            <span className="text-xs font-mono text-slate-400 block mb-2">
              QUICK ARCHITECTURE TEMPLATES:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_CONFIGURATIONS.map((preset) => (
                <button
                  key={preset.presetId}
                  onClick={() => loadPreset(preset.presetId)}
                  className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
                    currentConfig.id === preset.config.id
                      ? 'border-cyan text-cyan bg-cyan/10'
                      : 'border-space-700/80 text-slate-400 hover:text-slate-200 hover:border-space-600'
                  }`}
                >
                  {preset.badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Staging Viewport Preview */}
        <div className="lg:col-span-6 h-[380px] sm:h-[460px] relative rounded-2xl overflow-hidden border border-space-700/60 shadow-2xl bg-space-950">
          <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              {currentConfig.name}
            </span>
          </div>

          <SpacecraftBuilder3D
            installedComponentIds={currentConfig.installedComponentIds}
          />

          <div className="absolute bottom-3 left-4 right-4 z-10 bg-space-900/85 backdrop-blur-md rounded-lg p-2.5 border border-space-700/70 flex items-center justify-between font-mono text-xs text-slate-300">
            <div>
              <span className="text-slate-500 text-[10px] block">DELTA-V</span>
              <span className="text-cyan font-bold">{stats.deltaVMs} m/s</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">DRY MASS</span>
              <span>{stats.dryMassKg} kg</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">EST. COST</span>
              <span className="text-amber font-bold">${stats.totalCostM}M</span>
            </div>
            <button
              onClick={() => setActiveScreen('builder')}
              className="px-3 py-1 rounded bg-cyan/20 border border-cyan/40 text-cyan text-xs hover:bg-cyan/30"
            >
              Modify
            </button>
          </div>
        </div>
      </div>

      {/* Footer attribution disclaimer */}
      <footer className="text-center text-xs text-slate-500 pt-8 border-t border-space-800">
        Educational space exploration simulation • Inspired by NASA Mars Reconnaissance Orbiter (MRO) and JPL planetary missions • Not an official NASA flight certification.
      </footer>
    </div>
  );
}
