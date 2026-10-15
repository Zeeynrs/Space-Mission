import { useEffect, useRef } from 'react';
import { useMissionStore } from '../../store/useMissionStore';
import { MissionTimeline3D } from '../../scene3d/MissionTimeline3D';
import { MISSION_PHASE_SEQUENCE } from '../../simulation/engine';
import { OperationalEventModal } from './OperationalEventModal';
import {
  formatDistance,
  formatLightTime,
  formatPower,
  formatDataRate,
} from '../../utils/formatters';
import {
  Play,
  Pause,
  FastForward,
  SkipForward,
  Activity,
  Battery,
  Flame,
  Radio,
  Zap,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export function MissionOperationsView() {
  const {
    simulationState,
    installedComponentIds,
    spacecraftName,
    tickSimulation,
    togglePause,
    setTimeScale,
    skipPhase,
    fastForwardToDebrief,
    resolveEventChoice,
  } = useMissionStore();

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // RAF simulation loop
  useEffect(() => {
    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Cap delta time to prevent physics explosion on tab-switching
      if (dt > 0 && dt < 0.25) {
        tickSimulation(dt);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [tickSimulation]);

  if (!simulationState) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-slate-400 font-mono">
        NO ACTIVE MISSION SIMULATION LOADED. RETURN TO BUILDER.
      </div>
    );
  }

  const { telemetry, phase, phaseProgress, isPaused, timeScale, activeEvent } = simulationState;
  const currentPhaseIndex = MISSION_PHASE_SEQUENCE.indexOf(phase);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-4">
      {/* ================= TOP TIMELINE & CONTROLS BAR ================= */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-3 sm:p-4 space-y-3">
        {/* Playback Controls & Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan/15 text-cyan border border-cyan/40">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-slate-100 uppercase tracking-tight">
                  {spacecraftName} • FLIGHT TELEMETRY
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/30 font-bold">
                  PHASE {currentPhaseIndex + 1} OF 8: {phase}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>MISSION ELAPSED TIME:</span>
                <span className="text-cyan font-bold">{telemetry.missionTimeDays} DAYS</span>
              </div>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePause}
              className={`p-2 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${
                isPaused
                  ? 'bg-amber/20 border-amber text-amber font-bold'
                  : 'bg-space-800 border-space-700 text-slate-200 hover:border-cyan'
              }`}
              title={isPaused ? 'Resume Mission Timeline' : 'Pause Simulation'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>

            {/* Time Scales */}
            <div className="flex items-center bg-space-950 p-1 rounded-lg border border-space-800 text-xs font-mono">
              {[1, 2, 5].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setTimeScale(scale)}
                  className={`px-2 py-1 rounded transition-colors ${
                    timeScale === scale
                      ? 'bg-cyan/20 text-cyan font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>

            {/* Skip Phase */}
            <button
              onClick={skipPhase}
              className="px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-slate-300 text-xs font-mono flex items-center gap-1 hover:border-cyan/50"
              title="Fast-forward to next phase"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Next Phase</span>
            </button>

            {/* Skip to Debrief */}
            <button
              onClick={fastForwardToDebrief}
              className="px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-slate-300 text-xs font-mono flex items-center gap-1 hover:border-amber/50"
              title="Fast-forward simulation to final report"
            >
              <SkipForward className="w-3.5 h-3.5 text-amber" />
              <span className="hidden sm:inline">Skip to Debrief</span>
            </button>
          </div>
        </div>

        {/* 8-Phase Step Timeline Progress Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
          {MISSION_PHASE_SEQUENCE.map((p, idx) => {
            const isCompleted = currentPhaseIndex > idx;
            const isCurrent = currentPhaseIndex === idx;

            return (
              <div key={p} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase">
                  <span>{idx + 1}. {p}</span>
                  {isCompleted && <span className="text-emerald-400">✓</span>}
                </div>
                <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-space-800">
                  <div
                    className={`h-full transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 w-full'
                        : isCurrent
                        ? 'bg-cyan'
                        : 'w-0'
                    }`}
                    style={isCurrent ? { width: `${phaseProgress * 100}%` } : undefined}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MAIN 3D SIMULATION & TELEMETRY GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Mission Scene Viewport */}
        <div className="lg:col-span-8 h-[440px] sm:h-[540px] relative rounded-xl overflow-hidden border border-space-800 bg-space-950 shadow-2xl">
          <MissionTimeline3D
            phase={phase}
            phaseProgress={phaseProgress}
            installedComponentIds={installedComponentIds}
            telemetry={telemetry}
          />
        </div>

        {/* Real-Time Telemetry HUD Panel */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="bg-space-900 border border-space-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <span className="text-slate-400 uppercase tracking-wider font-bold">
                ORBITAL TELEMETRY HUD
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LINK LOCK
              </span>
            </div>

            {/* Distance & Velocity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-space-950 p-2.5 rounded border border-space-800">
                <span className="text-[10px] text-slate-500 block">MARS DISTANCE</span>
                <span className="text-slate-100 font-bold text-sm">
                  {formatDistance(telemetry.distanceToMarsKm)}
                </span>
              </div>
              <div className="bg-space-950 p-2.5 rounded border border-space-800">
                <span className="text-[10px] text-slate-500 block">VELOCITY</span>
                <span className="text-slate-100 font-bold text-sm">
                  {telemetry.velocityKps} km/s
                </span>
              </div>
            </div>

            {/* Power & Solar Irradiance */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan" /> POWER BALANCE:
                </span>
                <span
                  className={
                    telemetry.powerBalanceW >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                  }
                >
                  {formatPower(telemetry.powerBalanceW)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Solar: {telemetry.powerGeneratedW} W ({telemetry.solarIrradianceWm2} W/m²)</span>
                <span>Load: {telemetry.powerRequiredW} W</span>
              </div>
            </div>

            {/* Battery Level */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" /> BATTERY STORAGE:
                </span>
                <span className="text-slate-200">
                  {telemetry.batteryPercent}% ({telemetry.batteryLevelWh} Wh)
                </span>
              </div>
              <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-space-800">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${telemetry.batteryPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Propellant & Delta-V */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber" /> PROPELLANT RESERVE:
                </span>
                <span className="text-amber">
                  {telemetry.propellantRemainingKg} kg ({telemetry.propellantPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-space-800">
                <div
                  className="h-full bg-amber transition-all"
                  style={{ width: `${telemetry.propellantPercent}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Delta-V Remaining:</span>
                <span className="text-cyan font-bold">{telemetry.deltaVRemainingMs} m/s</span>
              </div>
            </div>

            {/* Communications & Delay */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-cyan" /> LIGHT-TIME DELAY:
                </span>
                <span className="text-slate-300">
                  {formatLightTime(telemetry.lightTimeDelaySeconds)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Downlink Bandwidth:</span>
                <span className="text-cyan">{formatDataRate(telemetry.commDataRateKbps)}</span>
              </div>
            </div>

            {/* Science Data Collected */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan" /> SCIENCE RETURN:
                </span>
                <span className="text-cyan font-bold">
                  {telemetry.scienceDataCollectedGb} GB
                </span>
              </div>
            </div>

            {/* Vehicle Integrity */}
            <div className="space-y-1 pt-1 border-t border-space-800">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> SPACECRAFT HEALTH:
                </span>
                <span
                  className={
                    telemetry.spacecraftHealthPercent > 70
                      ? 'text-emerald-400 font-bold'
                      : 'text-amber font-bold'
                  }
                >
                  {telemetry.spacecraftHealthPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Anomaly Event Modal */}
      {activeEvent && (
        <OperationalEventModal
          event={activeEvent}
          missionTimeDays={telemetry.missionTimeDays}
          onSelectChoice={resolveEventChoice}
        />
      )}
    </div>
  );
}
