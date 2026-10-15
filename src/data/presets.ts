import { SpacecraftConfiguration } from '../types/component';

export const PRESET_CONFIGURATIONS: {
  presetId: string;
  label: string;
  badge: string;
  description: string;
  config: SpacecraftConfiguration;
}[] = [
  {
    presetId: 'aurora-baseline',
    label: 'AURORA Baseline (Recommended)',
    badge: 'Balanced Workhorse',
    description: 'Standard survey configuration modeled after Mars Global Surveyor. Excellent balance of cost, delta-v, and science yield.',
    config: {
      id: 'aurora-baseline',
      name: 'AURORA-1 Survey Orbiter',
      installedComponentIds: [
        'bus-medium-survey', // 260 kg, $65M, 50W
        'engine-biprop-leros', // 75 kg, $45M, 35W, Isp: 315s
        'tank-composite-medium', // 42 kg dry, 650 kg fuel, $30M
        'solar-articulated-wings', // 75 kg, $42M, ~625W Mars
        'battery-highcap-deep', // 55 kg, $28M, 980 Wh
        'antenna-hga-parabolic', // 48 kg, $55M, 110W, 1200 kbps
        'computer-rad750-std', // 12 kg, $25M, 35W
        'thermal-active-heaters', // 38 kg, $25M, 55W
        'sensor-camera-hires', // 45 kg, $48M, 65W
        'sensor-spectrometer-ir', // 28 kg, $36M, 45W
      ],
      createdAt: Date.now(),
    },
  },
  {
    presetId: 'budget-scout',
    label: 'Compact Scout (Low Cost)',
    badge: 'Cost Conscious',
    description: 'Minimalist architecture maximizing cost savings ($237M) for high budget efficiency score, with modest instruments.',
    config: {
      id: 'budget-scout',
      name: 'Mars Pathfinder-X',
      installedComponentIds: [
        'bus-cubesat-heavy', // 120 kg, $35M, 25W
        'engine-biprop-leros', // 75 kg, $45M, 35W, Isp: 315s
        'tank-composite-medium', // 42 kg dry, 650 kg fuel, $30M
        'solar-fixed-flat', // 35 kg, $18M, ~280W Mars
        'battery-standard-liion', // 28 kg, $14M, 450 Wh
        'antenna-mga-horn', // 18 kg, $22M, 35W, 45 kbps
        'computer-rad750-std', // 12 kg, $25M, 35W
        'thermal-passive-mli', // 16 kg, $10M, 15W
        'sensor-magnetometer', // 14 kg, $22M, 20W
      ],
      createdAt: Date.now(),
    },
  },
  {
    presetId: 'flagship-surveyor',
    label: 'Odyssey Heavy Flagship',
    badge: 'Flagship Platform',
    description: 'Heavy flagship platform on the reinforced deep-space bus with dual science payloads and generous engineering margins.',
    config: {
      id: 'flagship-surveyor',
      name: 'Odyssey Flagship',
      installedComponentIds: [
        'bus-deepspace-flagship', // 480 kg, $110M
        'engine-biprop-leros', // 75 kg, $45M
        'tank-composite-medium', // 42 kg dry, 650 kg fuel, $30M
        'solar-articulated-wings', // 75 kg, $42M
        'battery-highcap-deep', // 55 kg, $28M
        'antenna-mga-horn', // 18 kg, $22M
        'computer-rad750-std', // 12 kg, $25M
        'thermal-passive-mli', // 16 kg, $10M
        'sensor-camera-hires', // 45 kg, $48M
        'sensor-spectrometer-ir', // 28 kg, $36M
      ],
      createdAt: Date.now(),
    },
  },
];
