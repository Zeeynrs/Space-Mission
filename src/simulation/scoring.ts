import { AURORA_MISSION } from '../data/mission';
import {
  EngineeringStatistics,
  MissionDebriefReport,
  MissionOutcome,
  MissionScore,
} from '../types/mission';
import { EventChoice } from '../types/event';

export function evaluateMissionOutcome(
  stats: EngineeringStatistics,
  installedComponentIds: string[],
  resolvedEvents: { eventId: string; choice: EventChoice; phaseDays: number }[],
  simulationSeed: number
): MissionDebriefReport {
  const failureReasons: string[] = [];
  const recommendations: string[] = [];

  // 1. Evaluate Primary Capture Objective
  let primaryObjectiveMet = true;

  if (stats.deltaVMs < AURORA_MISSION.minDeltaVMs) {
    primaryObjectiveMet = false;
    failureReasons.push(
      `Insufficient Delta-V for Mars Orbital Insertion (${stats.deltaVMs} m/s vs minimum ${AURORA_MISSION.minDeltaVMs} m/s required). The spacecraft lacked the velocity change to overcome Martian hyperbolic excess velocity and flew past Mars into deep heliocentric space.`
    );
    recommendations.push(
      'Upgrade from hydrazine monopropellant to a bipropellant engine (Isp 315s) or increase propellant tank volume.'
    );
  }

  if (stats.eclipseMarginPercent < 0) {
    primaryObjectiveMet = false;
    failureReasons.push(
      `Battery Exhaustion During Mars Eclipse: The 450 Wh battery was fully depleted after 28 minutes in Mars shadow (38 minutes needed). Flight computer frozen and propellant lines froze during thermal blackout.`
    );
    recommendations.push(
      'Install the 980 Wh Deep-Discharge Li-Ion Battery pack and active thermal control heaters.'
    );
  }

  if (stats.powerMarginDayW < 0) {
    primaryObjectiveMet = false;
    failureReasons.push(
      `Continuous Daytime Power Starvation at 1.52 AU: Solar arrays generated only ${stats.powerGenerationMarsW} W against a constant load of ${stats.powerConsumptionScienceW} W. Power distribution bus dropped below critical operating voltage.`
    );
    recommendations.push(
      'Upgrade to Articulated Tracking Wings or UltraFlex multi-junction solar panels to generate at least 600 W at Mars distance.'
    );
  }

  // 2. Evaluate Vehicle Health and Event Effects
  let vehicleHealth = 100;
  let scienceMultiplier = 1.0;
  let bonusSciencePoints = 0;

  for (const item of resolvedEvents) {
    const effect = item.choice.effect;
    if (effect.healthDeltaPercent) {
      vehicleHealth = Math.max(0, Math.min(100, vehicleHealth + effect.healthDeltaPercent));
    }
    if (effect.scienceBonusPoints) {
      bonusSciencePoints += effect.scienceBonusPoints;
    }
    if (effect.scienceMultiplier) {
      scienceMultiplier *= effect.scienceMultiplier;
    }
  }

  if (vehicleHealth <= 0) {
    primaryObjectiveMet = false;
    failureReasons.push(
      'Spacecraft Structural / Electrical Failure: Vehicle health degraded to 0% during mission operations.'
    );
    recommendations.push(
      'Choose more conservative operational decisions during extreme space weather and engine thermal warnings.'
    );
  }

  // 3. Bandwidth scaling factor
  let bandwidthFactor = 1.0;
  if (stats.dataRateMarsKbps <= 2) {
    bandwidthFactor = 0.25; // LGA omni can only send minimal compressed telemetry
  } else if (stats.dataRateMarsKbps <= 50) {
    bandwidthFactor = 0.70; // MGA horn can send atmospheric data and low-res images
  } else {
    bandwidthFactor = 1.0; // HGA 1.2 Mbps sends full raw science packages
  }

  // 4. Secondary Objectives Evaluation
  const installedIds = new Set(installedComponentIds);
  let rawScienceScore = 0;
  let maxPossibleScience = 0;

  const objectivesSummary = AURORA_MISSION.secondaryObjectives.map((obj) => {
    maxPossibleScience += obj.points;
    const hasRequired =
      obj.requiredInstrumentIds.length > 0 &&
      obj.requiredInstrumentIds.every((reqId) => installedIds.has(reqId));

    if (!primaryObjectiveMet) {
      return {
        id: obj.id,
        title: obj.title,
        completed: false,
        pointsEarned: 0,
        maxPoints: obj.points,
      };
    }

    if (hasRequired) {
      const earned = Math.round(obj.points * bandwidthFactor * scienceMultiplier);
      rawScienceScore += earned;
      return {
        id: obj.id,
        title: obj.title,
        completed: true,
        pointsEarned: earned,
        maxPoints: obj.points,
      };
    } else {
      return {
        id: obj.id,
        title: obj.title,
        completed: false,
        pointsEarned: 0,
        maxPoints: obj.points,
      };
    }
  });

  const finalScienceScore = primaryObjectiveMet
    ? Math.min(400, Math.round(rawScienceScore * 0.6 + bonusSciencePoints))
    : 0;

  // 5. Budget Efficiency Score (0 to 100)
  const costDiff = AURORA_MISSION.budgetCeilingM - stats.totalCostM;
  const budgetScore = primaryObjectiveMet
    ? Math.max(0, Math.min(100, Math.round((costDiff / AURORA_MISSION.budgetCeilingM) * 100) + 50))
    : 0;

  // 6. Engineering Safety Score (0 to 100)
  let safetyScore = 0;
  if (primaryObjectiveMet) {
    const deltaVBonus = Math.min(25, Math.max(0, (stats.deltaVMs - AURORA_MISSION.minDeltaVMs) / 10));
    const powerBonus = Math.min(25, Math.max(0, stats.powerMarginDayW / 8));
    const healthBonus = Math.min(30, vehicleHealth * 0.3);
    const eclipseBonus = Math.min(20, Math.max(0, stats.eclipseMarginPercent * 0.4));
    safetyScore = Math.round(deltaVBonus + powerBonus + healthBonus + eclipseBonus);
  }

  const primaryScore = primaryObjectiveMet ? 400 : 0;
  const totalScore = primaryScore + finalScienceScore + budgetScore + safetyScore;

  const score: MissionScore = {
    primaryScore,
    scienceScore: finalScienceScore,
    budgetEfficiencyScore: budgetScore,
    engineeringSafetyScore: safetyScore,
    totalScore,
  };

  // 7. Outcome Classification
  let outcome: MissionOutcome = 'failure';
  let headline = '';
  let narrative = '';

  if (!primaryObjectiveMet) {
    outcome = 'failure';
    headline = 'Mission Loss: Failed to Establish Mars Survey Orbit';
    narrative =
      'Project AURORA was unable to achieve a stable science orbit around Mars. Critical constraints were breached, preventing primary mission objectives from being fulfilled.';
  } else if (finalScienceScore < 150 || vehicleHealth < 50 || stats.dataRateMarsKbps <= 2) {
    outcome = 'partial';
    headline = 'Partial Mission Success: Mars Capture Achieved with Constraints';
    narrative =
      'The orbiter successfully inserted into Mars orbit and remains operational. However, communications bottlenecks, vehicle wear, or limited science payloads constrained total mission data return.';
    if (stats.dataRateMarsKbps <= 2) {
      recommendations.push(
        'Upgrade communications antenna from Low-Gain Omni to High-Gain Dish (1.2 Mbps) to unlock full scientific downlink throughput.'
      );
    }
    if (finalScienceScore < 150) {
      recommendations.push(
        'Equip complementary sensors (such as the Atmospheric IR Sounder and Subsurface Radar) to satisfy higher-value scientific objectives.'
      );
    }
  } else {
    outcome = 'success';
    headline = 'Full Mission Success: AURORA Survey Orbit Established';
    narrative =
      'Outstanding engineering execution! The spacecraft executed a flawless orbital capture, maintained robust power and thermal margins, and downlinked extraordinary multi-spectral datasets to the Deep Space Network.';
    recommendations.push(
      'Architecture is flight-qualified! For subsequent iterations, explore swapping in heavier instruments or reducing budget to optimize overall score.'
    );
  }

  const eventLog = resolvedEvents.map((e) => ({
    phase: 'science' as const, // will be populated dynamically from event definitions
    timestampDays: e.phaseDays,
    title: e.choice.label,
    choiceMade: e.choice.label,
    impact: e.choice.effect.logMessage,
  }));

  return {
    outcome,
    headline,
    narrative,
    primaryObjectiveMet,
    objectivesSummary,
    score,
    stats,
    eventLog,
    failureReasons,
    recommendations,
    simulationSeed,
  };
}
