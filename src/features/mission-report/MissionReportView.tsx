import { useState } from 'react';
import { useMissionStore } from '../../store/useMissionStore';
import { useSpacecraftStore } from '../../store/useSpacecraftStore';
import { loadMissionHistory, StoredRunRecord } from '../../utils/storage';
import {
  Trophy,
  AlertOctagon,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Target,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  History,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Check,
  Award,
  X,
} from 'lucide-react';

export function MissionReportView() {
  const { debriefReport, redesignSpacecraft, setActiveScreen } = useMissionStore();
  const { currentConfig } = useSpacecraftStore();
  const [history] = useState<StoredRunRecord[]>(() => loadMissionHistory());
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!debriefReport) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-slate-400 font-mono">
        NO DEBRIEF REPORT GENERATED YET.
      </div>
    );
  }

  const {
    outcome,
    headline,
    narrative,
    primaryObjectiveMet,
    objectivesSummary,
    score,
    stats,
    eventLog,
    failureReasons,
    recommendations,
    simulationSeed,
  } = debriefReport;

  const isSuccess = outcome === 'success';
  const isPartial = outcome === 'partial';

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(debriefReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `orbital-flight-certificate-${currentConfig.name.toLowerCase().replace(/\s+/g, '-')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyMarkdown = () => {
    const md = [
      `# PROJECT AURORA — FLIGHT DEBRIEF CERTIFICATE`,
      `**Spacecraft:** ${currentConfig.name}`,
      `**Outcome:** ${outcome.toUpperCase()} (${headline})`,
      `**Overall Mission Score:** ${score.totalScore} / 1000 PTS`,
      `**Primary Objective Met:** ${primaryObjectiveMet ? 'YES (Mars Orbit Achieved)' : 'NO (Failed Orbit Capture)'}`,
      `**Science Yield:** ${score.scienceScore} / 400 PTS`,
      `**Budget Efficiency:** ${score.budgetEfficiencyScore} / 100 PTS ($${stats.totalCostM}M)`,
      `**Safety Margin:** ${score.engineeringSafetyScore} / 100 PTS`,
      `**Simulation Seed:** ${simulationSeed}`,
      ``,
      `## Flight Narrative`,
      `${narrative}`,
      ``,
      `## Planetary Objectives Summary`,
      ...objectivesSummary.map(
        (obj) => `- [${obj.completed ? 'x' : ' '}] ${obj.title}: ${obj.pointsEarned}/${obj.maxPoints} pts`
      ),
      ``,
      `## Post-Flight Engineering Recommendations`,
      ...recommendations.map((rec, i) => `${i + 1}. ${rec}`),
    ].join('\n');

    navigator.clipboard.writeText(md).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* ================= OUTCOME BANNER ================= */}
      <div
        className={`rounded-2xl p-6 border-2 relative overflow-hidden shadow-2xl ${
          isSuccess
            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
            : isPartial
            ? 'bg-amber-950/40 border-amber/60 shadow-[0_0_30px_rgba(255,183,3,0.15)]'
            : 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl border ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : isPartial
                  ? 'bg-amber/20 text-amber border-amber/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {isSuccess ? (
                <Trophy className="w-8 h-8" />
              ) : isPartial ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <AlertOctagon className="w-8 h-8" />
              )}
            </div>
            <div>
              <span
                className={`text-xs font-mono font-bold tracking-widest uppercase block ${
                  isSuccess
                    ? 'text-emerald-400'
                    : isPartial
                    ? 'text-amber'
                    : 'text-rose-400'
                }`}
              >
                MISSION OUTCOME: {outcome.toUpperCase()}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 uppercase tracking-tight mt-0.5">
                {headline}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {narrative}
              </p>
            </div>
          </div>

          {/* Total Score Badge & Certificate Action */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="bg-space-950/80 border border-space-800 rounded-xl p-4 text-center min-w-[140px]">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                MISSION SCORE
              </span>
              <span
                className={`text-3xl font-extrabold font-mono ${
                  isSuccess ? 'text-emerald-400' : isPartial ? 'text-amber' : 'text-rose-400'
                }`}
              >
                {score.totalScore}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block">/ 1,000 PTS</span>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="w-full py-1.5 px-3 rounded-lg bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Flight Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SCORE BREAKDOWN GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-space-900 border border-space-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase">PRIMARY MISSION</span>
            <Target className="w-3.5 h-3.5 text-cyan" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {score.primaryScore} / 400
          </div>
          <span className="text-[10px] text-slate-400">
            {primaryObjectiveMet ? 'Mars Orbit Achieved' : 'Orbit Burn Failed'}
          </span>
        </div>

        <div className="bg-space-900 border border-space-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase">SCIENCE RETURN</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
          </div>
          <div className="text-xl font-bold text-cyan">
            {score.scienceScore} / 400
          </div>
          <span className="text-[10px] text-slate-400">
            {objectivesSummary.filter((o) => o.completed).length} Objectives Met
          </span>
        </div>

        <div className="bg-space-900 border border-space-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase">BUDGET EFFICIENCY</span>
            <DollarSign className="w-3.5 h-3.5 text-amber" />
          </div>
          <div className="text-xl font-bold text-amber">
            {score.budgetEfficiencyScore} / 100
          </div>
          <span className="text-[10px] text-slate-400">Cost: ${stats.totalCostM}M</span>
        </div>

        <div className="bg-space-900 border border-space-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase">SAFETY MARGIN</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {score.engineeringSafetyScore} / 100
          </div>
          <span className="text-[10px] text-slate-400">Reserve Buffers</span>
        </div>
      </div>

      {/* ================= CAUSE & EFFECT DEBRIEF & RECOMMENDATIONS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cause & Effect Analysis */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-3">
          <div className="text-xs font-mono text-cyan uppercase tracking-wider font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>POST-FLIGHT CAUSE-AND-EFFECT AUDIT</span>
          </div>

          {failureReasons.length > 0 ? (
            <div className="space-y-2">
              {failureReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5"
                >
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Nominal Subsystem Execution</span>
                <p className="leading-relaxed text-slate-300">
                  Propulsion delta-v ({stats.deltaVMs} m/s) cleanly executed the capture burn. Power generated at 1.52 AU ({stats.powerGenerationMarsW} W) and battery reserves safely handled the 38-minute orbital eclipse.
                </p>
              </div>
            </div>
          )}

          {/* Operational Events Log */}
          {eventLog.length > 0 && (
            <div className="pt-2 border-t border-space-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                OPERATIONAL DECISIONS RECORD:
              </span>
              {eventLog.map((log, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2 rounded bg-space-950 border border-space-800 text-slate-300 font-mono"
                >
                  <span className="text-cyan font-bold">[{log.title}]</span>: {log.impact}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Engineering Recommendations */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-3">
          <div className="text-xs font-mono text-amber uppercase tracking-wider font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>ACTIONABLE DESIGN ITERATIONS</span>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-space-950 border border-space-800 text-slate-300 text-xs flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-cyan/15 text-cyan flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                  {idx + 1}
                </div>
                <p className="leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-space-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>DETERMINISTIC SEED: {simulationSeed}</span>
            <button
              onClick={() => setActiveScreen('sources')}
              className="text-cyan hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Inspect Science Sources</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECONDARY OBJECTIVES CHECKLIST ================= */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
          PLANETARY SCIENCE DISCOVERIES BREAKDOWN
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {objectivesSummary.map((obj) => (
            <div
              key={obj.id}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                obj.completed
                  ? 'bg-space-950 border-emerald-500/40 text-slate-200'
                  : 'bg-space-950/60 border-space-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-semibold">{obj.title}</div>
                </div>
              </div>
              <div className="font-mono text-xs text-right">
                <span className={obj.completed ? 'text-cyan font-bold' : 'text-slate-600'}>
                  {obj.pointsEarned} / {obj.maxPoints} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PREVIOUS RUNS COMPARISON ================= */}
      {history.length > 0 && (
        <div className="bg-space-900 border border-space-800 rounded-xl p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 uppercase font-bold tracking-wider">
            <History className="w-4 h-4 text-cyan" />
            <span>FLIGHT LOG COMPARISON (LAST {history.length} ATTEMPTS)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-space-800 text-slate-500 text-[10px]">
                  <th className="py-2">VEHICLE</th>
                  <th className="py-2">OUTCOME</th>
                  <th className="py-2">SCORE</th>
                  <th className="py-2">SCIENCE</th>
                  <th className="py-2">COST</th>
                  <th className="py-2">MASS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-800/60">
                {history.map((rec) => (
                  <tr key={rec.runId} className="hover:bg-space-850/50">
                    <td className="py-2 font-semibold text-slate-200">{rec.spacecraftName}</td>
                    <td className="py-2 uppercase">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          rec.outcome === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : rec.outcome === 'partial'
                            ? 'bg-amber/20 text-amber'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {rec.outcome}
                      </span>
                    </td>
                    <td className="py-2 text-cyan font-bold">{rec.totalScore}</td>
                    <td className="py-2 text-slate-300">{rec.sciencePoints} pts</td>
                    <td className="py-2 text-amber">${rec.totalCostM}M</td>
                    <td className="py-2 text-slate-400">{rec.launchMassKg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= BOTTOM CTA: REDESIGN SPACECRAFT ================= */}
      <div className="p-4 bg-space-900 border border-space-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-100">
            Iterate and Redesign {currentConfig.name}
          </h4>
          <p className="text-xs text-slate-400">
            Return to the spacecraft builder with your current configuration intact to apply flight recommendations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-4 py-2.5 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-amber" />
            <span>Flight Certificate</span>
          </button>

          <button
            onClick={redesignSpacecraft}
            className="px-6 py-2.5 rounded-lg bg-cyan text-space-950 font-bold text-xs uppercase tracking-wider hover:bg-cyan/90 transition-all flex items-center gap-2 glow-cyan"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Redesign Spacecraft</span>
          </button>
        </div>
      </div>

      {/* ================= FLIGHT CERTIFICATE MODAL ================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-space-900 border-2 border-cyan/40 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 font-mono">
            {/* Close Button */}
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-space-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header Banner */}
            <div className="text-center space-y-1.5 border-b border-space-800 pb-4">
              <div className="text-[10px] text-cyan uppercase tracking-widest font-extrabold flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan"></span>
                <span>PROJECT AURORA • DEEP SPACE EXPLORATION OFFICE</span>
                <span className="w-2 h-2 rounded-full bg-cyan"></span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 uppercase tracking-tight">
                CERTIFICATE OF MISSION FLIGHT COMPLETION
              </h2>
              <div className="text-xs text-slate-400">
                This document certifies the orbital simulation record of vehicle:
              </div>
              <div className="text-lg font-bold text-amber tracking-wider uppercase">
                {currentConfig.name}
              </div>
            </div>

            {/* Certificate Core Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
              <div className="bg-space-950 p-2.5 rounded border border-space-800">
                <span className="text-[9px] text-slate-500 block">FLIGHT OUTCOME</span>
                <span
                  className={`font-extrabold uppercase ${
                    isSuccess ? 'text-emerald-400' : isPartial ? 'text-amber' : 'text-rose-400'
                  }`}
                >
                  {outcome}
                </span>
              </div>
              <div className="bg-space-950 p-2.5 rounded border border-space-800">
                <span className="text-[9px] text-slate-500 block">TOTAL SCORE</span>
                <span className="text-cyan font-bold text-sm">{score.totalScore} PTS</span>
              </div>
              <div className="bg-space-950 p-2.5 rounded border border-space-800">
                <span className="text-[9px] text-slate-500 block">PROGRAM COST</span>
                <span className="text-amber font-bold text-sm">${stats.totalCostM}M</span>
              </div>
              <div className="bg-space-950 p-2.5 rounded border border-space-800">
                <span className="text-[9px] text-slate-500 block">LAUNCH MASS</span>
                <span className="text-slate-200 font-bold text-sm">{stats.launchMassKg} kg</span>
              </div>
            </div>

            {/* Certificate Narrative Extract */}
            <div className="bg-space-950/70 p-3 rounded-lg border border-space-800 text-xs text-slate-300 leading-relaxed italic">
              "{narrative}"
            </div>

            {/* Footer Sign-off & Seed */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-space-800 pt-3">
              <span>SEED VERIFICATION HASH: {simulationSeed}</span>
              <span>ORBITAL FLIGHT REPRODUCIBILITY: 100% DETERMINISTIC</span>
            </div>

            {/* Action Buttons: Copy Markdown & Download JSON */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                onClick={handleCopyMarkdown}
                className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Markdown!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan" />
                    <span>Copy Markdown Report</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadJson}
                className="px-4 py-2 rounded-lg bg-cyan text-space-950 hover:bg-cyan/90 text-xs font-bold flex items-center gap-1.5 transition-colors glow-cyan"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
