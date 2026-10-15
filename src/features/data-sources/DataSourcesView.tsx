import { useState } from 'react';
import { useMissionStore } from '../../store/useMissionStore';
import { CitationCategory, SCIENTIFIC_CITATIONS } from '../../data/scientificSources';
import {
  BookOpen,
  ExternalLink,
  ChevronLeft,
  ShieldCheck,
  Calculator,
  Compass,
  Radio,
  Sun,
  Flame,
  MapPin,
} from 'lucide-react';

export function DataSourcesView() {
  const { setActiveScreen } = useMissionStore();
  const [selectedCategory, setSelectedCategory] = useState<CitationCategory>('all');

  // Interactive Calculator State
  const [calcIsp, setCalcIsp] = useState(315);
  const [calcDryMass, setCalcDryMass] = useState(585);
  const [calcFuelMass, setCalcFuelMass] = useState(650);
  const [calcDistanceAu, setCalcDistanceAu] = useState(1.524);

  // Computed Values
  const computedDeltaV = Math.round(
    calcIsp * 9.80665 * Math.log((calcDryMass + calcFuelMass) / calcDryMass)
  );

  const computedSolarFlux = Math.round(1361 / (calcDistanceAu * calcDistanceAu));
  const computedMarsRatio = Math.round((computedSolarFlux / 1361) * 100);

  // Speed of light: 299,792 km/s. 1 AU = 149,597,870 km
  const computedLightDelaySec = Math.round((calcDistanceAu * 149597870) / 299792);
  const computedLightDelayMin = (computedLightDelaySec / 60).toFixed(1);

  const filteredCitations =
    selectedCategory === 'all'
      ? SCIENTIFIC_CITATIONS
      : SCIENTIFIC_CITATIONS.filter((c) => c.category === selectedCategory);

  const categoryButtons: { id: CitationCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Sources', icon: BookOpen },
    { id: 'propulsion', label: 'Propulsion & ΔV', icon: Flame },
    { id: 'power', label: 'Solar & Nuclear Power', icon: Sun },
    { id: 'comm', label: 'Deep Space Comm', icon: Radio },
    { id: 'payload', label: 'Science Payloads', icon: Compass },
    { id: 'geodesy', label: 'Mars Geodesy', icon: MapPin },
  ];

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
          <p className="text-xs text-slate-400 mt-1">
            Authoritative datasets, astrophysical constants, analytical models, and citations backing ORBITAL.
          </p>
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

      {/* ================= INTERACTIVE PHYSICS VERIFICATION CALCULATOR ================= */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-cyan font-bold uppercase tracking-wider">
          <Calculator className="w-4 h-4 text-cyan" />
          <span>INTERACTIVE PHYSICS VERIFICATION CALCULATOR</span>
        </div>
        <p className="text-slate-400 text-xs">
          Verify the authoritative analytical equations used by ORBITAL's simulation engine in real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Tsiolkovsky Rocket Equation Sandbox */}
          <div className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-3">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber" />
                <span>Tsiolkovsky Rocket Equation</span>
              </span>
              <span className="text-[10px] text-amber">ΔV = Isp · g₀ · ln(M_wet / M_dry)</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block">Isp (s)</label>
                <input
                  type="number"
                  value={calcIsp}
                  onChange={(e) => setCalcIsp(Number(e.target.value))}
                  className="w-full bg-space-900 border border-space-700 rounded px-2 py-1 text-slate-200 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Dry Mass (kg)</label>
                <input
                  type="number"
                  value={calcDryMass}
                  onChange={(e) => setCalcDryMass(Number(e.target.value))}
                  className="w-full bg-space-900 border border-space-700 rounded px-2 py-1 text-slate-200 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Fuel Mass (kg)</label>
                <input
                  type="number"
                  value={calcFuelMass}
                  onChange={(e) => setCalcFuelMass(Number(e.target.value))}
                  className="w-full bg-space-900 border border-space-700 rounded px-2 py-1 text-slate-200 text-xs mt-1"
                />
              </div>
            </div>

            <div className="p-2.5 rounded bg-space-900 border border-space-800 flex items-center justify-between">
              <span className="text-slate-400">Calculated Insertion Velocity:</span>
              <span className="text-cyan font-bold text-sm">{computedDeltaV} m/s</span>
            </div>
          </div>

          {/* Inverse-Square Solar & Light Delay Sandbox */}
          <div className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-3">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-cyan" />
                <span>Solar Flux & Light-Time Delay</span>
              </span>
              <span className="text-[10px] text-cyan">S(r) = S₀ / r² & τ = d / c</span>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Distance from Sun / Earth:</span>
                <span className="text-cyan font-bold">{calcDistanceAu.toFixed(3)} AU</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.6"
                step="0.01"
                value={calcDistanceAu}
                onChange={(e) => setCalcDistanceAu(Number(e.target.value))}
                className="w-full accent-cyan cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-space-900 border border-space-800">
                <span className="text-[10px] text-slate-500 block">SOLAR IRRADIANCE</span>
                <span className="text-amber font-bold">{computedSolarFlux} W/m²</span>
                <span className="text-[10px] text-slate-500 block">({computedMarsRatio}% of 1 AU)</span>
              </div>

              <div className="p-2 rounded bg-space-900 border border-space-800">
                <span className="text-[10px] text-slate-500 block">LIGHT-TIME DELAY</span>
                <span className="text-cyan font-bold">{computedLightDelayMin} minutes</span>
                <span className="text-[10px] text-slate-500 block">({computedLightDelaySec} seconds)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CATEGORY FILTER BUTTONS ================= */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {categoryButtons.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                isSelected
                  ? 'bg-cyan text-space-950 font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                  : 'bg-space-900 text-slate-400 hover:text-slate-200 border border-space-800 hover:border-space-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Authoritative Citations Catalog */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
          AUTHORITATIVE SCIENTIFIC REFERENCES ({filteredCitations.length} CITATIONS)
        </h2>

        <div className="space-y-3">
          {filteredCitations.map((cit) => (
            <div
              key={cit.id}
              className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-2.5 hover:border-space-700 transition-colors"
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
