import { SpacecraftComponent } from '../types/component';
import { COMPONENT_CATALOG } from '../data/components';
import { MissionPhase, MissionTelemetry } from '../types/mission';
import { ShieldAlert } from 'lucide-react';

interface WebGLFallbackProps {
  installedComponentIds: string[];
  telemetry?: MissionTelemetry | null;
  phase?: MissionPhase;
  reason?: string;
}

export function WebGLFallback({
  installedComponentIds,
  telemetry,
  phase = 'cruise',
  reason = '3D Hardware Acceleration Unavailable',
}: WebGLFallbackProps) {
  const installedComps = installedComponentIds
    .map((id) => COMPONENT_CATALOG.find((c) => c.id === id))
    .filter((c): c is SpacecraftComponent => Boolean(c));

  return (
    <div className="w-full h-full min-h-[350px] bg-space-900 border border-space-700/80 rounded-xl p-6 flex flex-col justify-between text-slate-200 mission-grid">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-space-700 pb-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber" />
          <div>
            <h3 className="font-semibold text-sm tracking-wide text-slate-100 uppercase">
              2D Mission Schematic Mode
            </h3>
            <p className="text-xs text-slate-400">{reason} — Full simulation active</p>
          </div>
        </div>
        <div className="text-right font-mono text-xs text-cyan">
          PHASE: <span className="uppercase font-bold">{phase}</span>
        </div>
      </div>

      {/* Center 2D Vehicle Schematic Grid */}
      <div className="my-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {installedComps.map((comp) => (
          <div
            key={comp.id}
            className="bg-space-850 border border-space-700/80 rounded p-3 flex flex-col justify-between hover:border-cyan/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-mono text-cyan-dim font-bold">
                {comp.category}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{comp.mass} kg</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 line-clamp-1">
              {comp.name}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>${comp.cost}M</span>
              <span>•</span>
              <span>{comp.powerRequired} W</span>
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Strip (if in mission) */}
      {telemetry && (
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">TIME ELAPSED</span>
            <span className="text-cyan font-bold">{telemetry.missionTimeDays} Days</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">DISTANCE TO MARS</span>
            <span>{telemetry.distanceToMarsKm.toLocaleString()} km</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">POWER BALANCE</span>
            <span className={telemetry.powerBalanceW >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {telemetry.powerBalanceW > 0 ? '+' : ''}
              {telemetry.powerBalanceW} W
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">VEHICLE HEALTH</span>
            <span className="text-amber">{telemetry.spacecraftHealthPercent}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
