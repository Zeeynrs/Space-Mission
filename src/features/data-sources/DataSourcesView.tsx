import { useMissionStore } from '../../store/useMissionStore';
import { SCIENTIFIC_CITATIONS } from '../../data/scientificSources';
import {
  BookOpen,
  ExternalLink,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';

export function DataSourcesView() {
  const { setActiveScreen } = useMissionStore();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-space-800 pb-4">
        <div>
          <button
            onClick={() => setActiveScreen('builder')}
            className="text-xs font-mono text-cyan hover:underline flex items-center gap-1 mb-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Return to Mission</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan" />
            <span>NASA Data Sources & Scientific Assumptions</span>
          </h1>
        </div>
      </div>

      {/* Attribution & Educational Disclosure Banner */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-amber font-bold uppercase">
          <ShieldCheck className="w-4 h-4 text-amber" />
          <span>ATTRIBUTION & EDUCATIONAL SIMULATION DISCLOSURE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          ORBITAL: Mission Architect is an educational spaceflight strategy game inspired by actual NASA Jet Propulsion Laboratory (JPL) and Goddard Space Flight Center mission architectures. All calculations (Tsiolkovsky delta-v, solar flux drop at 1.52 AU, battery depth of discharge, radio light-time delay) use physically grounded analytical equations.
        </p>
        <p className="text-[11px] text-slate-500 italic">
          Disclaimer: This product is an independent educational tool. It is not officially endorsed, certified, or sponsored by NASA, the Jet Propulsion Laboratory, or the United States Government.
        </p>
      </div>

      {/* Separation of Real vs Illustrative Parameters */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-3 font-mono text-xs">
        <h2 className="text-xs text-slate-400 uppercase tracking-wider font-bold">
          SEPARATION OF DATA CATEGORIES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-space-950 border border-space-800">
            <span className="text-emerald-400 font-bold block mb-1">
              1. REAL SCIENTIFIC DATA
            </span>
            <p className="text-[11px] text-slate-400">
              Mars mean radius (3,389.5 km), gravitational parameter mu (42,828 km³/s²), solar constant (1,361 W/m²), speed of light radio delay, bipropellant Isp (315s).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-space-950 border border-space-800">
            <span className="text-cyan font-bold block mb-1">
              2. DERIVED ANALYTICAL VALUES
            </span>
            <p className="text-[11px] text-slate-400">
              Solar irradiance at Mars orbit via inverse-square law (586 W/m²), orbital period at 400 km (~118 min), eclipse duration (~38 min), delta-v via rocket equation.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-space-950 border border-space-800">
            <span className="text-amber font-bold block mb-1">
              3. ILLUSTRATIVE GAME PARAMETERS
            </span>
            <p className="text-[11px] text-slate-400">
              Project AURORA $400M budget ceiling, 2,400 kg launch vehicle mass cap, science point scoring matrix, and curated operational event triggers.
            </p>
          </div>
        </div>
      </div>

      {/* Authoritative Citations Catalog */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
          AUTHORITATIVE SCIENTIFIC REFERENCES
        </h2>

        <div className="space-y-3">
          {SCIENTIFIC_CITATIONS.map((cit) => (
            <div
              key={cit.id}
              className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-2 hover:border-space-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-space-800 pb-2">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>{cit.title}</span>
                </h3>
                <a
                  href={cit.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan hover:underline text-xs font-mono flex items-center gap-1 shrink-0"
                >
                  <span>Visit NASA Archive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-1">
                <div>
                  <span className="text-slate-500">Provider:</span>{' '}
                  <span className="text-slate-200">{cit.provider}</span>
                </div>
                <div>
                  <span className="text-slate-500">Used In:</span>{' '}
                  <span className="text-cyan">{cit.usedInFeature}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {cit.summary}
              </p>

              {cit.formulaOrData && (
                <div className="p-2.5 rounded bg-space-950 border border-space-800 text-xs font-mono text-amber">
                  Formula / Data: {cit.formulaOrData}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
