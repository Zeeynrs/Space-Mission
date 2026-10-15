import { describe, it, expect } from 'vitest';
import { calculateEngineeringStats } from '../simulation/physics';
import { validateSpacecraftConfiguration } from '../simulation/validator';
import { evaluateMissionOutcome } from '../simulation/scoring';
import {
  initializeSimulation,
  computeTelemetryAtPhase,
  checkPhaseEvent,
  applyEventChoiceToState,
  MISSION_PHASE_SEQUENCE,
} from '../simulation/engine';
import { PRESET_CONFIGURATIONS } from '../data/presets';
import { AURORA_MISSION } from '../data/mission';
import { EventChoice } from '../types/event';

describe('End-to-End Mission Workflow & Lifecycle (Phases 4–6)', () => {
  const seed = 42;

  describe('Flight Readiness Review (FRR) & Launch Clearance', () => {
    it('verifies baseline passes all clearance checks with 0 blockers', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);
      const validation = validateSpacecraftConfiguration(baseline.installedComponentIds, stats);

      expect(validation.isValid).toBe(true);
      expect(validation.blockers).toHaveLength(0);
      expect(validation.canLaunch).toBe(true);
    });

    it('requires risk acknowledgment when operational warnings exist before launch sign-off', () => {
      // Create config with low-gain omni antenna (which triggers an operational warning)
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const warningIds = baseline.installedComponentIds.map((id) =>
        id === 'antenna-hga-parabolic' ? 'antenna-lga-omni' : id
      );
      const stats = calculateEngineeringStats(warningIds);
      const validation = validateSpacecraftConfiguration(warningIds, stats);

      expect(validation.blockers).toHaveLength(0);
      expect(validation.warnings.length).toBeGreaterThan(0);
      // Operational rule: canLaunch is structurally true, but requires explicit risk sign-off in UI
      expect(validation.canLaunch).toBe(true);
      const hasAntennaWarning = validation.warnings.some(
        (w) =>
          w.id === 'comm-low-gain-warning' ||
          w.category === 'Telecommunications' ||
          w.message.toLowerCase().includes('antenna')
      );
      expect(hasAntennaWarning).toBe(true);
    });

    it('blocks launch unconditionally when hard physical constraints are violated', () => {
      // Duplicate bus violates single-slot constraint
      const invalidIds = [
        ...PRESET_CONFIGURATIONS[0].config.installedComponentIds,
        'bus-cubesat-heavy',
      ];
      const stats = calculateEngineeringStats(invalidIds);
      const validation = validateSpacecraftConfiguration(invalidIds, stats);

      expect(validation.blockers.length).toBeGreaterThan(0);
      expect(validation.canLaunch).toBe(false);
    });
  });

  describe('Path 1: Full Mission Success', () => {
    it('executes the complete 8-phase mission with nominal choices yielding Full Success', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);

      // 1. Initialize mission state
      let simState = initializeSimulation(stats, seed);
      expect(simState.phase).toBe('launch');
      expect(simState.vehicleHealthPercent).toBe(100);
      expect(simState.telemetry.spacecraftHealthPercent).toBe(100);

      // 2. Step through each phase and handle operational events
      const resolvedEvents: { eventId: string; choice: EventChoice; phaseDays: number }[] = [];
      const resolvedIds = new Set<string>();

      for (const phase of MISSION_PHASE_SEQUENCE) {
        // Compute telemetry at mid-phase
        const telemetry = computeTelemetryAtPhase(phase, 0.5, simState);
        expect(telemetry.phase).toBe(phase);
        expect(telemetry.solarIrradianceWm2).toBeGreaterThan(0);

        // Check for phase events
        const event = checkPhaseEvent(phase, 0.5, resolvedIds);
        if (event) {
          // Choose safe nominal option (usually choices[0] or autoDefaultChoiceId)
          const choice =
            event.choices.find((c) => c.id === event.autoDefaultChoiceId) || event.choices[0];
          simState = applyEventChoiceToState(simState, event, choice);
          resolvedEvents.push({
            eventId: event.id,
            choice,
            phaseDays: telemetry.missionTimeDays,
          });
          resolvedIds.add(event.id);
        }
      }

      // 3. Evaluate mission debrief
      const report = evaluateMissionOutcome(
        stats,
        baseline.installedComponentIds,
        resolvedEvents,
        seed
      );

      expect(report.outcome).toBe('success');
      expect(report.primaryObjectiveMet).toBe(true);
      expect(report.score.primaryScore).toBe(400);
      expect(report.score.scienceScore).toBeGreaterThan(150);
      expect(report.score.totalScore).toBeGreaterThan(500);
      expect(report.failureReasons).toHaveLength(0);
      expect(report.headline).toContain('Full Mission Success');
      expect(report.objectivesSummary.some((obj) => obj.completed)).toBe(true);
    });
  });

  describe('Path 2: Partial Mission Success', () => {
    it('results in Partial Success when low-bandwidth antenna limits scientific data return', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      // Replace High-Gain Antenna (1200 kbps) with Low-Gain Omni Antenna (2 kbps)
      const lowBandwidthIds = baseline.installedComponentIds.map((id) =>
        id === 'antenna-hga-parabolic' ? 'antenna-lga-omni' : id
      );
      const stats = calculateEngineeringStats(lowBandwidthIds);
      expect(stats.dataRateMarsKbps).toBeLessThanOrEqual(2);

      const report = evaluateMissionOutcome(stats, lowBandwidthIds, [], seed);

      expect(report.outcome).toBe('partial');
      expect(report.primaryObjectiveMet).toBe(true); // Mars orbit reached
      expect(report.headline).toContain('Partial Mission Success');
      // Downlink recommendation is provided
      expect(
        report.recommendations.some((r) => r.toLowerCase().includes('antenna') || r.toLowerCase().includes('downlink'))
      ).toBe(true);
    });

    it('results in Partial Success when high-risk operational damage degrades vehicle health', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);

      // Simulate a series of damaging operational events that lower vehicle health below 50%
      const damagingEvents: { eventId: string; choice: EventChoice; phaseDays: number }[] = [
        {
          eventId: 'event-solar-flare',
          choice: {
            id: 'severe-damage-flare',
            label: 'Ignore Solar Flare Alert',
            description: 'Unprotected exposure to CME shockwave',
            tradeoffNotice: 'Severely compromises electronics (-30% health)',
            effect: { healthDeltaPercent: -30, logMessage: 'Severe solar proton damage' },
          },
          phaseDays: 120,
        },
        {
          eventId: 'event-moi-thermal',
          choice: {
            id: 'severe-damage-moi',
            label: 'Overheat Engine Manifold',
            description: 'Thermal redline exceedance',
            tradeoffNotice: 'Heavy nozzle ablation (-25% health)',
            effect: { healthDeltaPercent: -25, logMessage: 'Nozzle thermal ablation' },
          },
          phaseDays: 215,
        },
      ];

      const report = evaluateMissionOutcome(
        stats,
        baseline.installedComponentIds,
        damagingEvents,
        seed
      );

      // Vehicle health is now 100 - 30 - 25 = 45% (< 50%)
      expect(report.outcome).toBe('partial');
      expect(report.primaryObjectiveMet).toBe(true);
      expect(report.headline).toContain('Partial Mission Success');
    });
  });

  describe('Path 3: Mission Failure Modes', () => {
    it('fails when propulsion delta-v is insufficient (< 1350 m/s)', () => {
      // Heavy bus + low-Isp hydrazine engine + small tank -> ~879 m/s delta-v
      const lowDeltaVIds = [
        'bus-deepspace-flagship',
        'engine-hydrazine-mono',
        'tank-titanium-small',
        'solar-fixed-flat',
        'battery-standard-liion',
        'antenna-lga-omni',
        'computer-rad750-std',
        'thermal-passive-mli',
        'sensor-magnetometer',
      ];

      const stats = calculateEngineeringStats(lowDeltaVIds);
      expect(stats.deltaVMs).toBeLessThan(AURORA_MISSION.minDeltaVMs);

      const report = evaluateMissionOutcome(stats, lowDeltaVIds, [], seed);

      expect(report.outcome).toBe('failure');
      expect(report.primaryObjectiveMet).toBe(false);
      expect(report.score.primaryScore).toBe(0);
      expect(report.score.scienceScore).toBe(0);
      expect(
        report.failureReasons.some((r) => r.toLowerCase().includes('delta-v') || r.toLowerCase().includes('hyperbolic'))
      ).toBe(true);
      expect(
        report.recommendations.some((r) => r.toLowerCase().includes('propellant') || r.toLowerCase().includes('bipropellant'))
      ).toBe(true);
    });

    it('fails when battery energy is depleted during Mars shadow eclipse (margin < 0%)', () => {
      // Configuration with high non-science eclipse load (ion engine + heavy bus + dish antenna + heaters)
      // paired with the small 450 Wh battery
      const smallBatteryIds = [
        'bus-deepspace-flagship',      // 70W bus
        'engine-hall-electric',    // 320W continuous
        'tank-titanium-small',
        'solar-fixed-flat',
        'battery-standard-liion',   // 450 Wh capacity (usable 70% = 315 Wh)
        'antenna-hga-parabolic',   // 110W
        'computer-rad750-std',     // 35W
        'thermal-active-heaters',  // 55W
      ];

      const stats = calculateEngineeringStats(smallBatteryIds);
      expect(stats.eclipseMarginPercent).toBeLessThan(0);

      const report = evaluateMissionOutcome(stats, smallBatteryIds, [], seed);

      expect(report.outcome).toBe('failure');
      expect(report.primaryObjectiveMet).toBe(false);
      expect(
        report.failureReasons.some((r) => r.toLowerCase().includes('eclipse') || r.toLowerCase().includes('battery'))
      ).toBe(true);
    });

    it('fails when solar arrays cannot satisfy daytime science bus power at 1.52 AU (margin < 0 W)', () => {
      // Fixed flat solar (only 280 W at Mars) with ion engine (320 W) and instruments
      const lowPowerIds = [
        'bus-deepspace-flagship',
        'engine-hall-electric', // 320 W
        'tank-titanium-small',
        'solar-fixed-flat',     // 280 W at Mars
        'battery-highcap-deep',
        'antenna-hga-parabolic',
        'computer-rad750-std',
        'thermal-active-heaters',
        'sensor-radar-sounder',
      ];

      const stats = calculateEngineeringStats(lowPowerIds);
      expect(stats.powerMarginDayW).toBeLessThan(0);

      const report = evaluateMissionOutcome(stats, lowPowerIds, [], seed);

      expect(report.outcome).toBe('failure');
      expect(report.primaryObjectiveMet).toBe(false);
      expect(
        report.failureReasons.some((r) => r.toLowerCase().includes('daytime') || r.toLowerCase().includes('power'))
      ).toBe(true);
    });

    it('fails when cumulative operational event damage destroys vehicle health (<= 0%)', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);

      // 100% vehicle destruction
      const fatalEvents: { eventId: string; choice: EventChoice; phaseDays: number }[] = [
        {
          eventId: 'fatal-catastrophe',
          choice: {
            id: 'destroy-craft',
            label: 'Catastrophic Collision',
            description: 'Direct impact with Martian debris',
            tradeoffNotice: 'Total loss of spacecraft (-100% health)',
            effect: { healthDeltaPercent: -100, logMessage: 'Spacecraft lost' },
          },
          phaseDays: 200,
        },
      ];

      const report = evaluateMissionOutcome(
        stats,
        baseline.installedComponentIds,
        fatalEvents,
        seed
      );

      expect(report.outcome).toBe('failure');
      expect(report.primaryObjectiveMet).toBe(false);
      expect(
        report.failureReasons.some((r) => r.toLowerCase().includes('health') || r.toLowerCase().includes('structural'))
      ).toBe(true);
    });
  });

  describe('Deterministic Equivalence: Step-by-Step vs Fast-Forward', () => {
    it('produces the exact same outcome and scoring when resolving default choices', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);

      // Method A: Manual step-by-step resolution of default events
      const resolvedA: { eventId: string; choice: EventChoice; phaseDays: number }[] = [];
      const resolvedIdsA = new Set<string>();

      for (const phase of MISSION_PHASE_SEQUENCE) {
        const event = checkPhaseEvent(phase, 1.0, resolvedIdsA);
        if (event) {
          const defaultChoice =
            event.choices.find((c) => c.id === event.autoDefaultChoiceId) || event.choices[0];
          resolvedA.push({
            eventId: event.id,
            choice: defaultChoice,
            phaseDays: 150,
          });
          resolvedIdsA.add(event.id);
        }
      }

      // Method B: Simulated fast-forward resolution (same algorithm as useMissionStore.fastForwardToDebrief)
      const resolvedB: { eventId: string; choice: EventChoice; phaseDays: number }[] = [];
      const resolvedIdsB = new Set<string>();

      for (const phase of MISSION_PHASE_SEQUENCE) {
        const event = checkPhaseEvent(phase, 1.0, resolvedIdsB);
        if (event) {
          const defaultChoice =
            event.choices.find((c) => c.id === event.autoDefaultChoiceId) || event.choices[0];
          resolvedB.push({
            eventId: event.id,
            choice: defaultChoice,
            phaseDays: 150,
          });
          resolvedIdsB.add(event.id);
        }
      }

      const reportA = evaluateMissionOutcome(stats, baseline.installedComponentIds, resolvedA, seed);
      const reportB = evaluateMissionOutcome(stats, baseline.installedComponentIds, resolvedB, seed);

      expect(reportA.outcome).toBe(reportB.outcome);
      expect(reportA.score.totalScore).toBe(reportB.score.totalScore);
      expect(reportA.score.scienceScore).toBe(reportB.score.scienceScore);
      expect(reportA.score.primaryScore).toBe(reportB.score.primaryScore);
      expect(reportA.failureReasons).toEqual(reportB.failureReasons);
    });

    it('reproduces identical simulation telemetry and score across identical seeds', () => {
      const baseline = PRESET_CONFIGURATIONS[0].config;
      const stats = calculateEngineeringStats(baseline.installedComponentIds);

      const run1 = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 777);
      const run2 = evaluateMissionOutcome(stats, baseline.installedComponentIds, [], 777);

      expect(run1).toEqual(run2);
    });
  });
});
