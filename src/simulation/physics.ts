import { COMPONENT_CATALOG } from '../data/components';
import { AURORA_MISSION } from '../data/mission';
import { ComponentCategory, SpacecraftComponent } from '../types/component';
import { EngineeringStatistics } from '../types/mission';

const STANDARD_GRAVITY_G0 = 9.80665; // m/s^2

export function getComponentById(id: string): SpacecraftComponent | undefined {
  return COMPONENT_CATALOG.find((c) => c.id === id);
}

export function calculateEngineeringStats(
  installedComponentIds: string[]
): EngineeringStatistics {
  const components: SpacecraftComponent[] = [];
  for (const id of installedComponentIds) {
    const comp = getComponentById(id);
    if (comp) {
      components.push(comp);
    }
  }

  // Mandatory category verification
  const mandatoryCategories: ComponentCategory[] = [
    'bus',
    'propulsion',
    'tank',
    'solar',
    'battery',
    'antenna',
    'computer',
    'thermal',
  ];

  const presentCategories = new Set<ComponentCategory>(
    components.map((c) => c.category)
  );

  const missingCategories = mandatoryCategories.filter(
    (cat) => !presentCategories.has(cat)
  );
  const hasMandatoryComponents = missingCategories.length === 0;

  // Mass & Cost Aggregation
  let dryMassKg = 0;
  let propellantMassKg = 0;
  let totalCostM = 0;
  let totalThrustN = 0;
  let effectiveIspS = 0;
  let powerGenerationEarthW = 0;
  let batteryCapacityWh = 0;
  let powerConsumptionCruiseW = 0;
  let powerConsumptionScienceW = 0;
  let dataRateMarsKbps = 0;
  let totalSciencePotential = 0;

  for (const comp of components) {
    dryMassKg += comp.mass;
    totalCostM += comp.cost;

    if (comp.propellantCapacity) {
      propellantMassKg += comp.propellantCapacity;
    }

    if (comp.thrust) {
      totalThrustN += comp.thrust;
    }

    if (comp.isp) {
      // If multiple engines, take thrust-weighted or max
      effectiveIspS = Math.max(effectiveIspS, comp.isp);
    }

    if (comp.powerGenerated) {
      powerGenerationEarthW += comp.powerGenerated;
    }

    if (comp.batteryCapacity) {
      batteryCapacityWh += comp.batteryCapacity;
    }

    // Baseline draw applies to all phases
    powerConsumptionCruiseW += comp.powerRequired;

    if (comp.category === 'science') {
      // Science instruments draw power during active science passes
      powerConsumptionScienceW += comp.powerRequired;
      if (comp.scienceContributions) {
        for (const sc of comp.scienceContributions) {
          totalSciencePotential += sc.points;
        }
      }
    }

    if (comp.category === 'antenna' && comp.dataRate) {
      dataRateMarsKbps = comp.dataRate;
    }
  }

  // Science phase total draw includes cruise baseline
  const totalSciencePowerW = powerConsumptionCruiseW;

  const launchMassKg = dryMassKg + propellantMassKg;

  // Tsiolkovsky Rocket Equation: Delta-V = Isp * g0 * ln(M_wet / M_dry)
  let deltaVMs = 0;
  if (effectiveIspS > 0 && dryMassKg > 0 && launchMassKg > dryMassKg) {
    deltaVMs = Math.round(
      effectiveIspS * STANDARD_GRAVITY_G0 * Math.log(launchMassKg / dryMassKg)
    );
  }

  // Solar flux drops with inverse-square law at Mars (1.524 AU)
  // S_Mars = S_Earth * (1 / 1.524)^2 ~ S_Earth * 0.431
  const powerGenerationMarsW = Math.round(
    powerGenerationEarthW * AURORA_MISSION.solarFluxMarsRatio
  );

  // Power margin in daylight at Mars during full science operations
  const powerMarginDayW = Math.round(powerGenerationMarsW - totalSciencePowerW);

  // Eclipse duration in low Mars orbit (400 km) is ~38 minutes (0.633 hours)
  const eclipseDurationHours = AURORA_MISSION.minEclipseSurvivalMinutes / 60.0; // ~0.633h

  // During eclipse, non-essential science instruments are shut down or duty-cycled.
  // Critical bus load needed to keep computer, thermal heaters, and transponder alive:
  const criticalEclipseLoadW = components.reduce((acc, comp) => {
    if (comp.category === 'science') return acc; // science is powered off in darkness
    return acc + comp.powerRequired;
  }, 0);

  const eclipseEnergyRequiredWh = Math.round(
    criticalEclipseLoadW * eclipseDurationHours
  );

  // Battery safe depth of discharge is 70%
  const usableBatteryWh = batteryCapacityWh * 0.7;
  const eclipseMarginPercent =
    usableBatteryWh > 0
      ? Math.round(((usableBatteryWh - eclipseEnergyRequiredWh) / usableBatteryWh) * 100)
      : -100;

  return {
    dryMassKg: Math.round(dryMassKg),
    propellantMassKg: Math.round(propellantMassKg),
    launchMassKg: Math.round(launchMassKg),
    totalCostM: Math.round(totalCostM * 10) / 10,
    totalThrustN,
    effectiveIspS,
    deltaVMs,
    powerGenerationEarthW,
    powerGenerationMarsW,
    powerConsumptionCruiseW,
    powerConsumptionScienceW: totalSciencePowerW,
    powerMarginDayW,
    batteryCapacityWh,
    eclipseDurationHours,
    eclipseEnergyRequiredWh,
    eclipseMarginPercent,
    dataRateMarsKbps,
    totalSciencePotential,
    hasMandatoryComponents,
    missingCategories,
  };
}
