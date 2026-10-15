import { create } from 'zustand';
import {
  ActiveSimulationState,
  applyEventChoiceToState,
  checkPhaseEvent,
  computeTelemetryAtPhase,
  initializeSimulation,
  MISSION_PHASE_SEQUENCE,
} from '../simulation/engine';
import { evaluateMissionOutcome } from '../simulation/scoring';
import { EngineeringStatistics, MissionDebriefReport } from '../types/mission';
import { saveMissionReportToHistory } from '../utils/storage';
import { playEventAlarm, playMissionSuccess, playUiClick } from '../utils/audio';

export type ScreenType =
  | 'title'
  | 'briefing'
  | 'builder'
  | 'review'
  | 'operations'
  | 'debrief'
  | 'sources';

interface MissionStoreState {
  activeScreen: ScreenType;
  simulationState: ActiveSimulationState | null;
  debriefReport: MissionDebriefReport | null;
  installedComponentIds: string[];
  spacecraftName: string;

  // Actions
  setActiveScreen: (screen: ScreenType) => void;
  startMission: (
    stats: EngineeringStatistics,
    installedIds: string[],
    name: string,
    seed: number
  ) => void;
  togglePause: () => void;
  setTimeScale: (scale: number) => void;
  tickSimulation: (dtSeconds: number) => void;
  resolveEventChoice: (choiceId: string) => void;
  skipPhase: () => void;
  fastForwardToDebrief: () => void;
  redesignSpacecraft: () => void;
}

export const useMissionStore = create<MissionStoreState>((set, get) => ({
  activeScreen: 'title',
  simulationState: null,
  debriefReport: null,
  installedComponentIds: [],
  spacecraftName: 'AURORA-1',

  setActiveScreen: (screen: ScreenType) => {
    playUiClick();
    set({ activeScreen: screen });
  },

  startMission: (
    stats: EngineeringStatistics,
    installedIds: string[],
    name: string,
    seed: number
  ) => {
    const simState = initializeSimulation(stats, seed);
    playUiClick();
    set({
      simulationState: simState,
      debriefReport: null,
      installedComponentIds: installedIds,
      spacecraftName: name,
      activeScreen: 'operations',
    });
  },

  togglePause: () => {
    const { simulationState } = get();
    if (!simulationState) return;
    playUiClick();
    set({
      simulationState: {
        ...simulationState,
        isPaused: !simulationState.isPaused,
      },
    });
  },

  setTimeScale: (scale: number) => {
    const { simulationState } = get();
    if (!simulationState) return;
    playUiClick();
    set({
      simulationState: {
        ...simulationState,
        timeScale: scale,
      },
    });
  },

  tickSimulation: (dtSeconds: number) => {
    const { simulationState, installedComponentIds, spacecraftName } = get();
    if (!simulationState || simulationState.isPaused || simulationState.activeEvent || simulationState.isComplete) {
      return;
    }

    // Step rate: each phase takes roughly 7-12 visual seconds in real time at 1x
    const phaseStepRate = 0.08 * simulationState.timeScale;
    let newProgress = simulationState.phaseProgress + dtSeconds * phaseStepRate;
    let currentPhase = simulationState.phase;

    // Check if an operational event triggers at this progress fraction
    const resolvedIds = new Set(simulationState.resolvedEvents.map((r) => r.eventId));
    const pendingEvent = checkPhaseEvent(currentPhase, newProgress, resolvedIds);

    if (pendingEvent) {
      playEventAlarm();
      const updatedTelemetry = computeTelemetryAtPhase(currentPhase, pendingEvent.triggerTimeFraction, {
        ...simulationState,
        phaseProgress: pendingEvent.triggerTimeFraction,
      });
      set({
        simulationState: {
          ...simulationState,
          phaseProgress: pendingEvent.triggerTimeFraction,
          activeEvent: pendingEvent,
          isPaused: true,
          telemetry: updatedTelemetry,
        },
      });
      return;
    }

    // Advance to next phase if progress completes
    if (newProgress >= 1.0) {
      const currentIndex = MISSION_PHASE_SEQUENCE.indexOf(currentPhase);
      if (currentIndex >= 0 && currentIndex < MISSION_PHASE_SEQUENCE.length - 1) {
        currentPhase = MISSION_PHASE_SEQUENCE[currentIndex + 1];
        newProgress = 0;
      } else {
        // Reached end of mission timeline! Evaluate debrief
        const report = evaluateMissionOutcome(
          simulationState.stats,
          installedComponentIds,
          simulationState.resolvedEvents,
          simulationState.seed
        );
        saveMissionReportToHistory(report, spacecraftName);
        if (report.outcome === 'success') {
          playMissionSuccess();
        }
        set({
          simulationState: {
            ...simulationState,
            isComplete: true,
            phase: 'debrief',
            phaseProgress: 1.0,
          },
          debriefReport: report,
          activeScreen: 'debrief',
        });
        return;
      }
    }

    const updatedTelemetry = computeTelemetryAtPhase(currentPhase, newProgress, simulationState);

    set({
      simulationState: {
        ...simulationState,
        phase: currentPhase,
        phaseProgress: newProgress,
        telemetry: updatedTelemetry,
      },
    });
  },

  resolveEventChoice: (choiceId: string) => {
    const { simulationState } = get();
    if (!simulationState || !simulationState.activeEvent) return;

    const event = simulationState.activeEvent;
    const choice = event.choices.find((c) => c.id === choiceId) || event.choices[0];

    playUiClick();
    const updatedState = applyEventChoiceToState(simulationState, event, choice);
    set({ simulationState: updatedState });
  },

  skipPhase: () => {
    const { simulationState } = get();
    if (!simulationState || simulationState.isComplete) return;

    playUiClick();
    const currentIndex = MISSION_PHASE_SEQUENCE.indexOf(simulationState.phase);
    if (currentIndex >= 0 && currentIndex < MISSION_PHASE_SEQUENCE.length - 2) {
      // Auto-resolve any event in skipped phase with default choice
      let resolved = [...simulationState.resolvedEvents];
      const resolvedIds = new Set(resolved.map((r) => r.eventId));
      const phaseEvent = checkPhaseEvent(simulationState.phase, 1.0, resolvedIds);
      if (phaseEvent) {
        const defaultChoice =
          phaseEvent.choices.find((c) => c.id === phaseEvent.autoDefaultChoiceId) ||
          phaseEvent.choices[0];
        resolved.push({
          eventId: phaseEvent.id,
          choice: defaultChoice,
          phaseDays: simulationState.telemetry.missionTimeDays,
        });
      }

      const nextPhase = MISSION_PHASE_SEQUENCE[currentIndex + 1];
      const nextTelemetry = computeTelemetryAtPhase(nextPhase, 0.05, {
        ...simulationState,
        resolvedEvents: resolved,
      });

      set({
        simulationState: {
          ...simulationState,
          phase: nextPhase,
          phaseProgress: 0.05,
          activeEvent: null,
          resolvedEvents: resolved,
          telemetry: nextTelemetry,
        },
      });
    } else {
      get().fastForwardToDebrief();
    }
  },

  fastForwardToDebrief: () => {
    const { simulationState, installedComponentIds, spacecraftName } = get();
    if (!simulationState) return;

    playUiClick();
    // Resolve all remaining unhandled events with defaults
    let resolved = [...simulationState.resolvedEvents];
    const resolvedIds = new Set(resolved.map((r) => r.eventId));

    for (const phase of MISSION_PHASE_SEQUENCE) {
      const event = checkPhaseEvent(phase, 1.0, resolvedIds);
      if (event) {
        const defaultChoice =
          event.choices.find((c) => c.id === event.autoDefaultChoiceId) || event.choices[0];
        resolved.push({
          eventId: event.id,
          choice: defaultChoice,
          phaseDays: 150,
        });
        resolvedIds.add(event.id);
      }
    }

    const report = evaluateMissionOutcome(
      simulationState.stats,
      installedComponentIds,
      resolved,
      simulationState.seed
    );

    saveMissionReportToHistory(report, spacecraftName);
    if (report.outcome === 'success') {
      playMissionSuccess();
    }

    set({
      simulationState: {
        ...simulationState,
        isComplete: true,
        phase: 'debrief',
        phaseProgress: 1.0,
        resolvedEvents: resolved,
      },
      debriefReport: report,
      activeScreen: 'debrief',
    });
  },

  redesignSpacecraft: () => {
    playUiClick();
    set({
      activeScreen: 'builder',
    });
  },
}));
