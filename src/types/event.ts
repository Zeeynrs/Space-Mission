import { MissionPhase } from './mission';

export interface EventEffect {
  batteryDeltaWh?: number;
  propellantDeltaKg?: number;
  healthDeltaPercent?: number;
  scienceBonusPoints?: number;
  scienceMultiplier?: number;
  thrustPenalty?: number;
  logMessage: string;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  tradeoffNotice: string;
  effect: EventEffect;
}

export interface MissionEvent {
  id: string;
  phase: MissionPhase;
  triggerTimeFraction: number; // 0.0 to 1.0 within the phase
  title: string;
  description: string;
  historicalContext: string;
  severity: 'moderate' | 'critical' | 'opportunity';
  choices: EventChoice[];
  autoDefaultChoiceId: string;
}
