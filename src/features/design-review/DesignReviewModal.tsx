import { useSpacecraftStore } from '../../store/useSpacecraftStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AURORA_MISSION } from '../../data/mission';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Rocket,
  X,
  FileCheck,
} from 'lucide-react';

interface DesignReviewModalProps {
  onClose: () => void;
  onConfirmLaunch: () => void;
}

export function DesignReviewModal({ onClose, onConfirmLaunch }: DesignReviewModalProps) {
  const { currentConfig, stats, validation } = useSpacecraftStore();
  const { deterministicSeed } = useSettingsStore();

  return (
    <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-space-900 border border-space-700/80 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-space-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-cyan font-mono text-xs uppercase tracking-widest mb-1">
            <FileCheck className="w-4 h-4" />
            FLIGHT READINESS REVIEW (FRR) • PRE-LAUNCH AUDIT
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 uppercase tracking-tight">
            {currentConfig.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verify spacecraft engineering envelope against Project AURORA mission constraints before initiating launch countdown.
          </p>
        </div>

        {/* Telemetry Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-space-950 border border-space-800 rounded-lg p-3 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">TOTAL COST</span>
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

          <div>
            <span className="text-slate-500 block text-[10px]">LAUNCH MASS</span>
            <span
              className={
                stats.launchMassKg > AURORA_MISSION.maxLaunchMassKg
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-200 font-bold'
              }
            >
              {stats.launchMassKg} / {AURORA_MISSION.maxLaunchMassKg} kg
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">INSERTION ΔV</span>
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

          <div>
            <span className="text-slate-500 block text-[10px]">DOWNLINK</span>
            <span className="text-slate-200">{stats.dataRateMarsKbps} kbps</span>
          </div>
        </div>

        {/* Findings Section */}
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {/* Critical Blockers */}
          {validation.blockers.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-1"
            >
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>CRITICAL BLOCKER: {b.title}</span>
              </div>
              <p className="text-slate-300 pl-6 leading-relaxed">{b.message}</p>
              <p className="text-rose-300/80 font-mono text-[11px] pl-6">
                Action: {b.recommendation}
              </p>
            </div>
          ))}

          {/* Warnings */}
          {validation.warnings.map((w) => (
            <div
              key={w.id}
              className="p-3 rounded-lg bg-amber/10 border border-amber/30 text-amber-200 text-xs space-y-1"
            >
              <div className="flex items-center gap-2 font-bold text-amber">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>OPERATIONAL RISK: {w.title}</span>
              </div>
              <p className="text-slate-300 pl-6 leading-relaxed">{w.message}</p>
              <p className="text-amber-200/80 font-mono text-[11px] pl-6">
                Recommendation: {w.recommendation}
              </p>
            </div>
          ))}

          {/* All Passed Confirmation */}
          {validation.isValid && validation.warnings.length === 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-emerald-400 text-sm">
                  Flight Clearance Granted (100% Nominal)
                </div>
                <div className="text-slate-300 mt-1 leading-relaxed">
                  All mandatory subsystems are verified. Budget, mass, power, propulsion delta-v, and communications satisfy NASA standards for Trans-Mars Injection.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-space-800">
          <div className="text-xs font-mono text-slate-500">
            SIMULATION SEED: <span className="text-cyan font-bold">{deterministicSeed}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-space-700 text-slate-300 hover:text-slate-100 text-xs font-medium w-full sm:w-auto"
            >
              Return to Builder
            </button>

            <button
              onClick={onConfirmLaunch}
              disabled={!validation.canLaunch}
              className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
                validation.canLaunch
                  ? 'bg-cyan text-space-950 hover:bg-cyan/90 glow-cyan'
                  : 'bg-space-800 text-slate-500 border border-space-700 cursor-not-allowed'
              }`}
            >
              <Rocket className="w-4 h-4 transform -rotate-45" />
              <span>Authorize Launch Sequence</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
