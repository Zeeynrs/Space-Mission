import { MissionEvent } from '../../types/event';
import { AlertTriangle, Sparkles, Compass } from 'lucide-react';

interface OperationalEventModalProps {
  event: MissionEvent;
  missionTimeDays: number;
  onSelectChoice: (choiceId: string) => void;
}

export function OperationalEventModal({
  event,
  missionTimeDays,
  onSelectChoice,
}: OperationalEventModalProps) {
  const isOpportunity = event.severity === 'opportunity';

  return (
    <div className="fixed inset-0 z-50 bg-space-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-space-900 border-2 border-amber/70 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Event Header Banner */}
        <div className="flex items-start justify-between gap-3 border-b border-space-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isOpportunity
                  ? 'bg-cyan/15 text-cyan border border-cyan/40'
                  : 'bg-amber/15 text-amber border border-amber/40 animate-pulse'
              }`}
            >
              {isOpportunity ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber font-bold tracking-widest uppercase block">
                MISSION ANOMALY ALERT • MET DAY {missionTimeDays.toFixed(1)}
              </span>
              <h3 className="font-bold text-base sm:text-lg text-slate-100">
                {event.title}
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
            {event.phase}
          </span>
        </div>

        {/* Narrative & Description */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {event.description}
        </p>

        {/* Real NASA Mission Parallel Context */}
        <div className="p-3 bg-space-950/80 border border-space-800 rounded-lg text-xs text-slate-400">
          <div className="font-mono text-[10px] text-cyan font-bold uppercase mb-0.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            HISTORICAL SPACE MISSION PRECEDENT
          </div>
          <p className="italic text-slate-300/90">{event.historicalContext}</p>
        </div>

        {/* Action Choices */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
            AUTHORIZE FLIGHT CONTROLLER DIRECTIVE:
          </span>

          {event.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onSelectChoice(choice.id)}
              className="w-full text-left p-3.5 rounded-xl bg-space-850 hover:bg-space-800 border border-space-700 hover:border-cyan/60 transition-all group flex flex-col space-y-1 focus:outline-none focus:ring-1 focus:ring-cyan"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-100 group-hover:text-cyan transition-colors">
                  {choice.label}
                </span>
                <span className="text-[10px] font-mono text-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  Execute Directive →
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                {choice.description}
              </p>
              <div className="text-[10px] font-mono text-amber/90 pt-1">
                Trade-off: {choice.tradeoffNotice}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
