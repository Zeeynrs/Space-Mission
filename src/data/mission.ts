import { MissionObjective } from '../types/mission';

export interface MissionDefinition {
  id: string;
  codename: string;
  name: string;
  targetBody: 'Mars';
  description: string;
  educationalPurpose: string;
  budgetCeilingM: number;
  maxLaunchMassKg: number;
  minDeltaVMs: number;
  recommendedDeltaVMs: number;
  minEclipseSurvivalMinutes: number;
  marsDistanceAU: number;
  solarFluxMarsRatio: number; // 0.431
  primaryObjective: MissionObjective;
  secondaryObjectives: MissionObjective[];
}

export const AURORA_MISSION: MissionDefinition = {
  id: 'mission-aurora-mars',
  codename: 'Project AURORA',
  name: 'Mars Orbiter Survey',
  targetBody: 'Mars',
  description:
    'Design, validate, and launch an exploration orbiter to Mars. Balance payload mass, electrical generation at 1.52 AU, propulsion delta-v for orbit insertion, and radio link budget back to Earth.',
  educationalPurpose:
    'Demonstrates real trade-offs in deep space engineering: why spacecraft are power-constrained at Mars distance, how Tsiolkovsky rocket equation governs fuel mass, and how operational anomalies demand autonomous flight software.',
  budgetCeilingM: 400.0,
  maxLaunchMassKg: 2400.0,
  minDeltaVMs: 1350.0,
  recommendedDeltaVMs: 1500.0,
  minEclipseSurvivalMinutes: 38.0,
  marsDistanceAU: 1.524,
  solarFluxMarsRatio: 0.431, // (1 / 1.524)^2
  primaryObjective: {
    id: 'obj-primary-capture',
    title: 'Achieve Stable Mars Science Orbit',
    description: 'Survive trans-Mars cruise, execute Mars Orbit Insertion (MOI) burn, and stabilize in survey orbit.',
    isPrimary: true,
    requiredInstrumentIds: [],
    points: 400,
  },
  secondaryObjectives: [
    {
      id: 'obj-primary-survey',
      title: 'High-Resolution Geomorphic Surface Mapping',
      description: 'Acquire sub-meter imaging of prospective landing sites, sand dunes, and tectonic rifts.',
      isPrimary: false,
      requiredInstrumentIds: ['sensor-camera-hires'],
      points: 150,
    },
    {
      id: 'obj-atmosphere-trace',
      title: 'Atmospheric Trace Gas & Methane Sounding',
      description: 'Profile atmospheric temperature columns and scan for localized trace methane plumes.',
      isPrimary: false,
      requiredInstrumentIds: ['sensor-spectrometer-ir'],
      points: 180,
    },
    {
      id: 'obj-space-weather',
      title: 'Crustal Remnant Magnetism & Solar Wind Stripping',
      description: 'Map localized magnetic anomalies and measure atmospheric ion escape driven by solar storms.',
      isPrimary: false,
      requiredInstrumentIds: ['sensor-magnetometer'],
      points: 140,
    },
    {
      id: 'obj-subsurface-water',
      title: 'Shallow Subsurface Glacial Ice Sounding',
      description: 'Transmit radar pulses through the top 1 km of Martian regolith to locate buried pure water ice sheets.',
      isPrimary: false,
      requiredInstrumentIds: ['sensor-subsurface-radar'],
      points: 200,
    },
    {
      id: 'obj-polar-ice',
      title: 'Seasonal Polar Cap Volatiles Dynamics',
      description: 'Observe sublimation and deposition cycles of carbon dioxide and water ice at Martian poles.',
      isPrimary: false,
      requiredInstrumentIds: ['sensor-camera-hires'],
      points: 100,
    },
  ],
};
