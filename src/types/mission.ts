import { ComponentCategory } from './component';

export type MissionPhase =
  | 'launch'
  | 'deployment'
  | 'cruise'
  | 'arrival'
  | 'insertion'
  | 'operations'
  | 'science'
  | 'debrief';

export type MissionOutcome = 'success' | 'partial' | 'failure';

export interface MissionTelemetry {
  phase: MissionPhase;
  phaseProgress: number; // 0 to 1
  missionTimeDays: number;
  distanceToMarsKm: number;
  velocityKps: number;
  solarIrradianceWm2: number;
  powerGeneratedW: number;
  powerRequiredW: number;
  powerBalanceW: number;
  batteryLevelWh: number;
  batteryPercent: number;
  propellantRemainingKg: number;
  propellantPercent: number;
  deltaVRemainingMs: number;
  commDataRateKbps: number;
  lightTimeDelaySeconds: number;
  scienceDataCollectedGb: number;
  spacecraftHealthPercent: number;
  currentAnomalyText?: string;
}

export interface EngineeringStatistics {
  dryMassKg: number;
  propellantMassKg: number;
  launchMassKg: number;
  totalCostM: number;
  totalThrustN: number;
  effectiveIspS: number;
  deltaVMs: number;
  powerGenerationEarthW: number;
  powerGenerationMarsW: number;
  powerConsumptionCruiseW: number;
  powerConsumptionScienceW: number;
  powerMarginDayW: number;
  batteryCapacityWh: number;
  eclipseDurationHours: number;
  eclipseEnergyRequiredWh: number;
  eclipseMarginPercent: number;
  dataRateMarsKbps: number;
  totalSciencePotential: number;
  hasMandatoryComponents: boolean;
  missingCategories: ComponentCategory[];
}

export interface ValidationIssue {
  id: string;
  severity: 'blocker' | 'warning' | 'info';
  category: string;
  title: string;
  message: string;
  recommendation: string;
}

export interface ValidationResult {
  isValid: boolean;
  canLaunch: boolean;
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  isPrimary: boolean;
  requiredInstrumentIds: string[];
  points: number;
}

export interface MissionScore {
  primaryScore: number; // 0 or 400
  scienceScore: number; // 0 to 400
  budgetEfficiencyScore: number; // 0 to 100
  engineeringSafetyScore: number; // 0 to 100
  totalScore: number; // 0 to 1000
}

export interface MissionDebriefReport {
  outcome: MissionOutcome;
  headline: string;
  narrative: string;
  primaryObjectiveMet: boolean;
  objectivesSummary: {
    id: string;
    title: string;
    completed: boolean;
    pointsEarned: number;
    maxPoints: number;
  }[];
  score: MissionScore;
  stats: EngineeringStatistics;
  eventLog: {
    phase: MissionPhase;
    timestampDays: number;
    title: string;
    choiceMade?: string;
    impact: string;
  }[];
  failureReasons: string[];
  recommendations: string[];
  simulationSeed: number;
}
