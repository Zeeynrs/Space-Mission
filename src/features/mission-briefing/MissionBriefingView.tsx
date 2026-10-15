import { useMissionStore } from '../../store/useMissionStore';
import { AURORA_MISSION } from '../../data/mission';
import {
  Compass,
  Target,
  DollarSign,
  Scale,
  Zap,
  Radio,
  ChevronRight,
  BookOpen,
  Info,
} from 'lucide-react';

export function MissionBriefingView() {
  const { setActiveScreen } = useMissionStore();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Briefing Header Banner */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-800 pb-4">
          <div>
            <div className="text-xs font-mono text-cyan tracking-widest uppercase mb-1 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              FLIGHT READINESS DIRECTIVE • {AURORA_MISSION.codename}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 uppercase tracking-tight">
              {AURORA_MISSION.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveScreen('sources')}
              className="px-3.5 py-2 rounded-lg bg-space-800 border border-space-700 hover:border-cyan/50 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan" />
              <span>Scientific Sources</span>
            </button>
            <button
              onClick={() => setActiveScreen('builder')}
              className="px-5 py-2 rounded-lg bg-cyan text-space-950 font-bold text-xs tracking-wider uppercase hover:bg-cyan/90 transition-all flex items-center gap-1.5 glow-cyan"
            >
              <span>Open Builder</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-3xl">
          {AURORA_MISSION.description}
        </p>

        <div className="mt-4 p-3 bg-space-950/70 border border-space-800 rounded-lg text-xs text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Educational Context: </span>
            {AURORA_MISSION.educationalPurpose}
          </div>
        </div>
      </div>

      {/* Constraints Grid */}
      <div>
        <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>PROGRAM ENGINEERING ENVELOPE</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-space-900 border border-space-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-mono">BUDGET CEILING</span>
              <DollarSign className="w-4 h-4 text-amber" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">
              ${AURORA_MISSION.budgetCeilingM}M USD
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              NASA Discovery-class cost cap. Exceeding blocks launch authorization.
            </p>
          </div>

          <div className="bg-space-900 border border-space-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-mono">MAX LAUNCH MASS</span>
              <Scale className="w-4 h-4 text-cyan" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {AURORA_MISSION.maxLaunchMassKg.toLocaleString()} kg
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Medium-lift rocket payload capacity to Trans-Mars Injection (TMI).
            </p>
          </div>

          <div className="bg-space-900 border border-space-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-mono">REQUIRED DELTA-V</span>
              <Zap className="w-4 h-4 text-amber" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {AURORA_MISSION.minDeltaVMs} m/s
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum burn needed for Mars Orbit Insertion (MOI) capture. Recommended: {AURORA_MISSION.recommendedDeltaVMs} m/s.
            </p>
          </div>

          <div className="bg-space-900 border border-space-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-mono">SOLAR FLUX AT MARS</span>
              <Radio className="w-4 h-4 text-cyan" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">
              43.1% (586 W/m²)
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Inverse-square solar irradiance drop at 1.52 AU from the Sun.
            </p>
          </div>
        </div>
      </div>

      {/* Objectives Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan" />
          <span>MISSION OBJECTIVES & SCIENCE DISCOVERY MATRIX</span>
        </h2>

        {/* Primary Objective Card */}
        <div className="bg-space-900 border-2 border-cyan/40 rounded-xl p-5 relative shadow-[0_0_20px_rgba(0,229,255,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan/20 border border-cyan text-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                PRIMARY OBJECTIVE
              </span>
              <h3 className="font-bold text-base text-slate-100">
                {AURORA_MISSION.primaryObjective.title}
              </h3>
            </div>
            <span className="font-mono text-sm text-cyan font-bold">
              +{AURORA_MISSION.primaryObjective.points} PTS
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {AURORA_MISSION.primaryObjective.description}
          </p>
        </div>

        {/* Secondary Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AURORA_MISSION.secondaryObjectives.map((obj) => (
            <div
              key={obj.id}
              className="bg-space-900/90 border border-space-800 rounded-lg p-4 flex flex-col justify-between hover:border-space-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-amber font-semibold uppercase">
                    OPTIONAL SCIENCE OBJECTIVE
                  </span>
                  <span className="font-mono text-xs text-amber font-bold">
                    +{obj.points} PTS
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-slate-100 mb-1">
                  {obj.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {obj.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-space-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Requires Sensor:</span>
                <span className="text-cyan">
                  {obj.requiredInstrumentIds.join(', ') || 'Any Instrument'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="p-6 bg-space-900 border border-space-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-100">
            Ready to Architect Spacecraft Configuration?
          </h3>
          <p className="text-xs text-slate-400">
            Select bus structure, propulsion, solar panels, and scientific instruments to meet all mission constraints.
          </p>
        </div>
        <button
          onClick={() => setActiveScreen('builder')}
          className="px-6 py-2.5 rounded-lg bg-cyan text-space-950 font-bold text-xs tracking-wider uppercase hover:bg-cyan/90 transition-all flex items-center gap-2 glow-cyan"
        >
          <span>Proceed to Builder</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
