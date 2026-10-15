export type ComponentCategory =
  | 'bus'
  | 'propulsion'
  | 'tank'
  | 'solar'
  | 'battery'
  | 'antenna'
  | 'computer'
  | 'thermal'
  | 'science';

export interface ScienceContribution {
  objectiveId: string;
  points: number;
  description: string;
}

export interface SpacecraftComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  mass: number; // kg
  cost: number; // Millions USD ($M)
  powerRequired: number; // Watts (W) baseline draw
  powerGenerated?: number; // Watts (W) at 1 AU daylight
  batteryCapacity?: number; // Watt-hours (Wh)
  propellantCapacity?: number; // kg of fuel/oxidizer
  thrust?: number; // Newtons (N)
  isp?: number; // Specific Impulse in seconds (s)
  dataRate?: number; // Effective downlink rate at Mars distance (kbps)
  scienceContributions?: ScienceContribution[];
  description: string;
  rationale: string;
  pros: string[];
  cons: string[];
  visualMesh: string;
  slotType: 'single' | 'multi'; // Whether multiple can be installed (e.g. multiple instruments)
}

export interface SpacecraftConfiguration {
  id: string;
  name: string;
  installedComponentIds: string[];
  createdAt: number;
}
