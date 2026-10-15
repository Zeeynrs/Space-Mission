import { useState } from 'react';
import { useSpacecraftStore } from '../../store/useSpacecraftStore';
import { useMissionStore } from '../../store/useMissionStore';
import { COMPONENT_CATALOG } from '../../data/components';
import { ComponentCategory } from '../../types/component';
import { SpacecraftBuilder3D } from '../../scene3d/SpacecraftBuilder3D';
import { AURORA_MISSION } from '../../data/mission';
import { PRESET_CONFIGURATIONS } from '../../data/presets';
import { DesignReviewModal } from '../design-review/DesignReviewModal';
import {
  formatPower,
  formatDataRate,
} from '../../utils/formatters';
import {
  Wrench,
  Cpu,
  Zap,
  Radio,
  Flame,
  Battery,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Box,
  Compass,
} from 'lucide-react';

const CATEGORIES: { id: ComponentCategory; label: string; icon: React.ElementType }[] = [
  { id: 'bus', label: 'Structure / Bus', icon: Box },
  { id: 'propulsion', label: 'Propulsion', icon: Flame },
  { id: 'tank', label: 'Propellant Tank', icon: Compass },
  { id: 'solar', label: 'Power (Solar / RTG)', icon: Zap },
  { id: 'battery', label: 'Battery Storage', icon: Battery },
  { id: 'antenna', label: 'Antenna / Comm', icon: Radio },
  { id: 'computer', label: 'Avionics', icon: Cpu },
  { id: 'thermal', label: 'Thermal Control', icon: ShieldAlert },
  { id: 'science', label: 'Science Instruments', icon: Sparkles },
];

export function SpacecraftBuilderView() {
  const {
    currentConfig,
    stats,
    validation,
    selectedComponentId,
    activeCategory,
    installComponent,
    removeComponent,
    loadPreset,
    resetToDefault,
    setSelectedComponentId,
    setActiveCategory,
    setSpacecraftName,
  } = useSpacecraftStore();

  const { startMission } = useMissionStore();
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Active category components
  const categoryComponents = COMPONENT_CATALOG.filter(
    (c) => c.category === activeCategory
  );

  const installedSet = new Set(currentConfig.installedComponentIds);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-4">
      {/* Builder Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-space-900 border border-space-800 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => setSpacecraftName(e.target.value)}
                className="bg-transparent font-bold text-base text-slate-100 border-b border-dashed border-space-700 hover:border-cyan focus:border-cyan focus:outline-none tracking-tight"
                title="Click to rename spacecraft"
              />
              <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.5 rounded border border-cyan/20">
                ACTIVE RIG
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {currentConfig.installedComponentIds.length} subsystems integrated • Project AURORA
            </div>
          </div>
        </div>

        {/* Preset Selectors & Reset */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 hidden md:inline">PRESET:</span>
          {PRESET_CONFIGURATIONS.map((preset) => (
            <button
              key={preset.presetId}
              onClick={() => loadPreset(preset.presetId)}
              className={`text-xs px-2.5 py-1.5 rounded font-mono border transition-all ${
                currentConfig.id === preset.config.id
                  ? 'border-cyan text-cyan bg-cyan/10 font-bold'
                  : 'border-space-800 text-slate-400 hover:text-slate-200 hover:border-space-700'
              }`}
            >
              {preset.badge}
            </button>
          ))}

          <button
            onClick={resetToDefault}
            className="p-1.5 rounded-lg border border-space-700 hover:border-amber/50 text-slate-400 hover:text-amber transition-colors ml-1"
            title="Reset to default baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================= LEFT COLUMN: CATALOG ================= */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none border-b border-space-800">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = COMPONENT_CATALOG.filter(
                (c) => c.category === cat.id && installedSet.has(c.id)
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'border-cyan text-cyan bg-space-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-space-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] font-mono px-1 rounded-full bg-cyan/20 text-cyan">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Component List */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {categoryComponents.map((comp) => {
              const isInstalled = installedSet.has(comp.id);
              const isSelected = selectedComponentId === comp.id;

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedComponentId(comp.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan bg-space-850/90 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                      : 'border-space-800 bg-space-900/80 hover:border-space-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                        {comp.name}
                        {isInstalled && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            INSTALLED
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {comp.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isInstalled ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(comp.id);
                          }}
                          className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-[11px] font-mono flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            installComponent(comp.id);
                          }}
                          className="px-2.5 py-1 rounded bg-cyan/20 hover:bg-cyan/30 border border-cyan/40 text-cyan text-[11px] font-mono font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Install</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Component Spec Badges */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-space-800 text-[10px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block">MASS</span>
                      <span>{comp.mass} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">COST</span>
                      <span className="text-amber">${comp.cost}M</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">POWER</span>
                      <span>
                        {comp.powerGenerated
                          ? `+${comp.powerGenerated} W`
                          : `-${comp.powerRequired} W`}
                      </span>
                    </div>
                  </div>

                  {/* Extra Specs: Isp, Thrust, Battery, Fuel, Downlink */}
                  {(comp.isp || comp.propellantCapacity || comp.batteryCapacity || comp.dataRate) && (
                    <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono text-cyan-dim">
                      {comp.isp && <span>Isp: {comp.isp} s</span>}
                      {comp.thrust && <span>Thrust: {comp.thrust} N</span>}
                      {comp.propellantCapacity && <span>Fuel: {comp.propellantCapacity} kg</span>}
                      {comp.batteryCapacity && <span>Battery: {comp.batteryCapacity} Wh</span>}
                      {comp.dataRate && <span>Downlink: {comp.dataRate} kbps</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= CENTER COLUMN: 3D VIEWPORT ================= */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="h-[420px] lg:h-[580px] relative rounded-xl overflow-hidden border border-space-800 bg-space-950">
            <SpacecraftBuilder3D
              installedComponentIds={currentConfig.installedComponentIds}
              selectedComponentId={selectedComponentId}
            />
          </div>
        </div>

        {/* ================= RIGHT COLUMN: TELEMETRY & VALIDATION ================= */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          {/* Engineering Statistics Card */}
          <div className="bg-space-900 border border-space-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                ENGINEERING TELEMETRY
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  validation.isValid
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {validation.isValid ? 'FLIGHT READY' : `${validation.blockers.length} BLOCKERS`}
              </span>
            </div>

            {/* Launch Mass Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">LAUNCH MASS</span>
                <span
                  className={
                    stats.launchMassKg > AURORA_MISSION.maxLaunchMassKg
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-200'
                  }
                >
                  {stats.launchMassKg} / {AURORA_MISSION.maxLaunchMassKg} kg
                </span>
              </div>
              <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-space-800">
                <div
                  className={`h-full transition-all ${
                    stats.launchMassKg > AURORA_MISSION.maxLaunchMassKg
                      ? 'bg-rose-500'
                      : 'bg-cyan'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (stats.launchMassKg / AURORA_MISSION.maxLaunchMassKg) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Dry: {stats.dryMassKg} kg</span>
                <span>Fuel: {stats.propellantMassKg} kg</span>
              </div>
            </div>

            {/* Program Cost Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ESTIMATED BUDGET</span>
                <span
                  className={
                    stats.totalCostM > AURORA_MISSION.budgetCeilingM
                      ? 'text-rose-400 font-bold'
                      : 'text-amber font-bold'
                  }
                >
                  ${stats.totalCostM}M / ${AURORA_MISSION.budgetCeilingM}M
                </span>
              </div>
              <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-space-800">
                <div
                  className={`h-full transition-all ${
                    stats.totalCostM > AURORA_MISSION.budgetCeilingM
                      ? 'bg-rose-500'
                      : 'bg-amber'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (stats.totalCostM / AURORA_MISSION.budgetCeilingM) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Delta-V Burn Capability */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ORBIT INSERTION ΔV</span>
                <span
                  className={
                    stats.deltaVMs < AURORA_MISSION.minDeltaVMs
                      ? 'text-rose-400 font-bold'
                      : 'text-cyan font-bold'
                  }
                >
                  {stats.deltaVMs} m/s
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>Capture Min: {AURORA_MISSION.minDeltaVMs} m/s</span>
                <span>Isp: {stats.effectiveIspS}s</span>
              </div>
            </div>

            {/* Power Balance at Mars (1.52 AU) */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">MARS POWER (1.52 AU)</span>
                <span
                  className={
                    stats.powerMarginDayW >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                  }
                >
                  {formatPower(stats.powerMarginDayW)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>Solar: {stats.powerGenerationMarsW} W</span>
                <span>Load: {stats.powerConsumptionScienceW} W</span>
              </div>
            </div>

            {/* Battery Eclipse Margin */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ECLIPSE MARGIN</span>
                <span
                  className={
                    stats.eclipseMarginPercent >= 0 ? 'text-slate-200' : 'text-rose-400 font-bold'
                  }
                >
                  {stats.eclipseMarginPercent}%
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>Battery: {stats.batteryCapacityWh} Wh</span>
                <span>38m Night: {stats.eclipseEnergyRequiredWh} Wh</span>
              </div>
            </div>

            {/* Downlink Bandwidth */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">DOWNLINK BANDWIDTH</span>
                <span className="text-cyan font-bold">
                  {formatDataRate(stats.dataRateMarsKbps)}
                </span>
              </div>
            </div>

            {/* Science Objectives Supported Panel */}
            <div className="space-y-1.5 pt-2 border-t border-space-800">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-cyan" /> SCIENCE OBJECTIVES
                </span>
                <span className="text-cyan font-bold">
                  {stats.totalSciencePotential} PTS
                </span>
              </div>
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5">
                {AURORA_MISSION.secondaryObjectives.map((obj) => {
                  const contributingInstruments = COMPONENT_CATALOG.filter(
                    (comp) =>
                      installedSet.has(comp.id) &&
                      comp.scienceContributions?.some((sc) => sc.objectiveId === obj.id)
                  );
                  const isCovered = contributingInstruments.length > 0;
                  const pointsContributed = contributingInstruments.reduce((acc, comp) => {
                    const sc = comp.scienceContributions?.find((s) => s.objectiveId === obj.id);
                    return acc + (sc ? sc.points : 0);
                  }, 0);

                  return (
                    <div
                      key={obj.id}
                      className={`p-1.5 rounded text-[10px] font-mono flex items-center justify-between border ${
                        isCovered
                          ? 'bg-space-950 border-cyan/30 text-slate-200'
                          : 'bg-space-950/40 border-space-850 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isCovered ? (
                          <CheckCircle2 className="w-3 h-3 text-cyan shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-slate-700 shrink-0"></span>
                        )}
                        <span className="truncate">{obj.title}</span>
                      </div>
                      <span className={isCovered ? 'text-cyan font-bold shrink-0 ml-1' : 'text-slate-600 shrink-0 ml-1'}>
                        {pointsContributed}/{obj.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Validation Warnings / Blockers List */}
          <div className="bg-space-900 border border-space-800 rounded-xl p-3.5 space-y-2 max-h-[220px] overflow-y-auto">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-1">
              DESIGN AUDIT
            </div>

            {validation.blockers.map((b) => (
              <div
                key={b.id}
                className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-[10px] text-rose-200/80 mt-0.5">{b.message}</div>
                </div>
              </div>
            ))}

            {validation.warnings.map((w) => (
              <div
                key={w.id}
                className="p-2 rounded bg-amber/10 border border-amber/30 text-amber-200 text-xs flex items-start gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{w.title}</div>
                  <div className="text-[10px] text-amber-200/80 mt-0.5">{w.message}</div>
                </div>
              </div>
            ))}

            {validation.isValid && validation.warnings.length === 0 && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All engineering constraints fully satisfied!</span>
              </div>
            )}
          </div>

          {/* Launch / Review Action Button */}
          <button
            onClick={() => setShowReviewModal(true)}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              validation.canLaunch
                ? 'bg-cyan text-space-950 hover:bg-cyan/90 glow-cyan'
                : 'bg-space-800 text-slate-500 border border-space-700 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Flight Review</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flight Readiness Review Modal */}
      {showReviewModal && (
        <DesignReviewModal
          onClose={() => setShowReviewModal(false)}
          onConfirmLaunch={() => {
            setShowReviewModal(false);
            startMission(stats, currentConfig.installedComponentIds, currentConfig.name, 42);
          }}
        />
      )}
    </div>
  );
}
