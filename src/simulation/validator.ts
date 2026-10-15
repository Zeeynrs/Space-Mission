import { AURORA_MISSION } from '../data/mission';
import { COMPONENT_CATALOG } from '../data/components';
import { EngineeringStatistics, ValidationIssue, ValidationResult } from '../types/mission';
import { ComponentCategory } from '../types/component';

const CATEGORY_NAMES: Record<ComponentCategory, string> = {
  bus: 'Structure / Bus',
  propulsion: 'Propulsion Engine',
  tank: 'Propellant Tank',
  solar: 'Solar Power System',
  battery: 'Battery Storage',
  antenna: 'Communication Antenna',
  computer: 'Flight Computer & Avionics',
  thermal: 'Thermal Control System',
  science: 'Science Instrument',
};

export function validateSpacecraftConfiguration(
  installedComponentIds: string[],
  stats: EngineeringStatistics
): ValidationResult {
  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const infos: ValidationIssue[] = [];

  const components = installedComponentIds
    .map((id) => COMPONENT_CATALOG.find((c) => c.id === id))
    .filter(Boolean);

  // 1. Check duplicate installations of single-slot categories
  const singleSlotCategories: ComponentCategory[] = [
    'bus',
    'propulsion',
    'tank',
    'solar',
    'battery',
    'antenna',
    'computer',
    'thermal',
  ];

  const categoryCounts = new Map<ComponentCategory, number>();
  for (const comp of components) {
    if (!comp) continue;
    const current = categoryCounts.get(comp.category) || 0;
    categoryCounts.set(comp.category, current + 1);
  }

  for (const cat of singleSlotCategories) {
    const count = categoryCounts.get(cat) || 0;
    if (count > 1) {
      blockers.push({
        id: `dup-${cat}`,
        severity: 'blocker',
        category: CATEGORY_NAMES[cat],
        title: `Multiple ${CATEGORY_NAMES[cat]}s Installed`,
        message: `Only 1 ${CATEGORY_NAMES[cat]} subsystem is permitted per spacecraft architecture. Currently ${count} are installed.`,
        recommendation: `Remove duplicate components in the ${CATEGORY_NAMES[cat]} category.`,
      });
    }
  }

  // 2. Missing Mandatory Subsystems
  for (const cat of stats.missingCategories) {
    blockers.push({
      id: `missing-${cat}`,
      severity: 'blocker',
      category: CATEGORY_NAMES[cat],
      title: `Missing ${CATEGORY_NAMES[cat]}`,
      message: `The spacecraft lacks a designated ${CATEGORY_NAMES[cat]} subsystem, making mission execution physically impossible.`,
      recommendation: `Install a valid component from the ${CATEGORY_NAMES[cat]} catalog.`,
    });
  }

  // 3. Launch Mass Constraint
  if (stats.launchMassKg > AURORA_MISSION.maxLaunchMassKg) {
    const excess = Math.round(stats.launchMassKg - AURORA_MISSION.maxLaunchMassKg);
    blockers.push({
      id: 'mass-exceeded',
      severity: 'blocker',
      category: 'Launch Vehicle',
      title: 'Payload Mass Exceeds Launch Vehicle Capacity',
      message: `Total launch mass (${stats.launchMassKg} kg) exceeds the maximum Trans-Mars Injection capacity of ${AURORA_MISSION.maxLaunchMassKg} kg by ${excess} kg.`,
      recommendation:
        'Select lighter structural bus, reduce propellant tank capacity, or choose lighter science instruments.',
    });
  }

  // 4. Budget Ceiling Constraint
  if (stats.totalCostM > AURORA_MISSION.budgetCeilingM) {
    const excess = Math.round((stats.totalCostM - AURORA_MISSION.budgetCeilingM) * 10) / 10;
    blockers.push({
      id: 'budget-exceeded',
      severity: 'blocker',
      category: 'Program Budget',
      title: 'Cost Exceeds Project AURORA Budget Ceiling',
      message: `Estimated program cost ($${stats.totalCostM}M) exceeds the NASA Discovery-class cap of $${AURORA_MISSION.budgetCeilingM}M by $${excess}M.`,
      recommendation:
        'Replace expensive components (e.g. UltraFlex solar wings, Heavy Flagship bus, Dual redundant avionics) with economical alternatives.',
    });
  }

  // 5. Delta-V for Mars Orbital Insertion
  if (stats.hasMandatoryComponents) {
    if (stats.deltaVMs < AURORA_MISSION.minDeltaVMs) {
      blockers.push({
        id: 'propulsion-insufficient-delta-v',
        severity: 'blocker',
        category: 'Astrodynamics',
        title: 'Insufficient Delta-V for Mars Orbital Capture',
        message: `Calculated delta-v (${stats.deltaVMs} m/s) is below the minimum orbital insertion requirement of ${AURORA_MISSION.minDeltaVMs} m/s. The vehicle will fly past Mars into deep space.`,
        recommendation:
          'Upgrade to a higher specific impulse engine (e.g. Bipropellant Leros with Isp=315s) or install a larger propellant tank.',
      });
    } else if (stats.deltaVMs < AURORA_MISSION.recommendedDeltaVMs) {
      warnings.push({
        id: 'propulsion-low-delta-v-margin',
        severity: 'warning',
        category: 'Astrodynamics',
        title: 'Tight Delta-V Maneuvering Reserve',
        message: `Delta-v (${stats.deltaVMs} m/s) meets capture threshold (${AURORA_MISSION.minDeltaVMs} m/s) but leaves less than 150 m/s margin for trajectory trim and attitude control maneuvers.`,
        recommendation:
          'Consider slightly higher propellant reserve to safely withstand engine burn timing variances.',
      });
    }
  }

  // 6. Power Generation at Mars Distance (Daylight)
  if (stats.hasMandatoryComponents) {
    if (stats.powerMarginDayW < 0) {
      blockers.push({
        id: 'power-shortfall-daylight',
        severity: 'blocker',
        category: 'Electrical Power',
        title: 'Net Electrical Power Deficit at Mars',
        message: `Solar array generates only ${stats.powerGenerationMarsW} W at Mars distance (1.52 AU), while continuous subsystem load is ${stats.powerConsumptionScienceW} W (Deficit: ${Math.abs(
          stats.powerMarginDayW
        )} W).`,
        recommendation:
          'Install Articulated Tracking Wings or UltraFlex arrays to boost daylight generation above total demand.',
      });
    } else if (stats.powerMarginDayW < 40) {
      warnings.push({
        id: 'power-low-margin-daylight',
        severity: 'warning',
        category: 'Electrical Power',
        title: 'Narrow Daylight Power Reserve',
        message: `Daylight power margin is only +${stats.powerMarginDayW} W. Any solar panel pointing inaccuracy or cell dust deposition could trigger safe-mode load shedding.`,
        recommendation:
          'Increase solar array area or disable secondary high-draw payloads.',
      });
    }
  }

  // 7. Battery Storage during Mars Orbital Night (Eclipse)
  if (stats.hasMandatoryComponents) {
    if (stats.eclipseMarginPercent < 0) {
      blockers.push({
        id: 'battery-eclipse-blackout',
        severity: 'blocker',
        category: 'Energy Storage',
        title: 'Battery Exhaustion During Mars Eclipse',
        message: `Usable battery capacity (${Math.round(
          stats.batteryCapacityWh * 0.7
        )} Wh) cannot sustain critical vehicle heaters and computers across the 38-minute orbital eclipse (${stats.eclipseEnergyRequiredWh} Wh required).`,
        recommendation:
          'Install the Deep-Discharge High-Capacity Battery (980 Wh) to prevent vehicle death in the dark.',
      });
    } else if (stats.eclipseMarginPercent < 25) {
      warnings.push({
        id: 'battery-tight-eclipse-reserve',
        severity: 'warning',
        category: 'Energy Storage',
        title: 'Low Battery Eclipse Reserve',
        message: `Battery reserves reach ${100 - stats.eclipseMarginPercent}% depth of discharge during eclipse passes, increasing long-term cell degradation risk.`,
        recommendation:
          'Upgrade to a higher capacity battery pack or reduce thermal heater power.',
      });
    }
  }

  // 8. Communication Downlink Rate
  if (stats.hasMandatoryComponents) {
    if (stats.dataRateMarsKbps <= 2) {
      warnings.push({
        id: 'comm-low-gain-warning',
        severity: 'warning',
        category: 'Telecommunications',
        title: 'Severe Science Downlink Bottleneck',
        message: `Low-Gain Antenna provides only 2 kbps bandwidth from Mars. Downlinking full-resolution camera imagery or radar profiles will be severely restricted.`,
        recommendation:
          'Upgrade to a Steerable Horn (45 kbps) or Parabolic High-Gain Dish (1.2 Mbps).',
      });
    }
  }

  // 9. Science Payload Check
  const scienceComponents = components.filter((c) => c?.category === 'science');
  if (scienceComponents.length === 0) {
    warnings.push({
      id: 'science-none-installed',
      severity: 'warning',
      category: 'Science Return',
      title: 'No Science Instruments Installed',
      message:
        'The spacecraft carries no scientific sensors. The mission can achieve orbital capture but will return 0 science discovery points.',
      recommendation:
        'Equip at least one scientific sensor (e.g. Hi-Res Camera or Atmospheric IR Sounder).',
    });
  } else {
    infos.push({
      id: 'science-payload-ready',
      severity: 'info',
      category: 'Science Return',
      title: `${scienceComponents.length} Scientific Instruments Configured`,
      message: `Payload suite yields up to ${stats.totalSciencePotential} potential science discovery points across planetary objectives.`,
      recommendation: 'Ensure communications bandwidth and electrical power can support full payload operation.',
    });
  }

  const isValid = blockers.length === 0;
  const canLaunch = blockers.length === 0;

  return {
    isValid,
    canLaunch,
    blockers,
    warnings,
    infos,
  };
}
