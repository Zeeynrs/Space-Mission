import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SpacecraftRig } from './SpacecraftRig';
import { MarsPlanet } from './MarsPlanet';
import { Starfield } from './Starfield';
import { MissionPhase, MissionTelemetry } from '../types/mission';
import { WebGLFallback } from './WebGLFallback';

interface MissionTimeline3DProps {
  phase: MissionPhase;
  phaseProgress: number;
  installedComponentIds: string[];
  telemetry?: MissionTelemetry | null;
}

function PhaseSceneContent({
  phase,
  phaseProgress,
  installedComponentIds,
}: {
  phase: MissionPhase;
  phaseProgress: number;
  installedComponentIds: string[];
}) {
  const craftGroupRef = useRef<THREE.Group>(null);
  const scanConeRef = useRef<THREE.Mesh>(null);

  // Position coordinates per phase
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (craftGroupRef.current) {
      if (phase === 'launch') {
        // Ascending upward
        craftGroupRef.current.position.set(0, -2 + phaseProgress * 4, 0);
        craftGroupRef.current.rotation.z = Math.sin(t * 2) * 0.05;
      } else if (phase === 'deployment') {
        craftGroupRef.current.position.set(0, 0, 0);
        craftGroupRef.current.rotation.y = t * 0.2;
      } else if (phase === 'cruise') {
        craftGroupRef.current.position.set(0, Math.sin(t * 0.5) * 0.15, 0);
        craftGroupRef.current.rotation.y = t * 0.08;
      } else if (phase === 'arrival') {
        craftGroupRef.current.position.set(0, 0, 5 - phaseProgress * 2);
        craftGroupRef.current.rotation.y = t * 0.15;
      } else if (phase === 'insertion') {
        // Retrograde burn angle
        craftGroupRef.current.position.set(0, 0, 2);
        craftGroupRef.current.rotation.set(0.4, Math.PI + Math.sin(t * 3) * 0.02, 0);
      } else if (phase === 'operations' || phase === 'science') {
        // Orbit around Mars at radius ~18
        const angle = t * 0.3 + phaseProgress * Math.PI * 2;
        const orbitRadius = 16;
        craftGroupRef.current.position.set(
          Math.cos(angle) * orbitRadius,
          Math.sin(angle * 0.5) * 2,
          Math.sin(angle) * orbitRadius
        );
        // Nadir pointing towards Mars center [0,0,0]
        craftGroupRef.current.lookAt(0, 0, 0);
      }
    }

    if (scanConeRef.current && phase === 'science') {
      // Pulse science scanner cone opacity
      scanConeRef.current.scale.set(
        1 + Math.sin(t * 4) * 0.1,
        1,
        1 + Math.sin(t * 4) * 0.1
      );
    }
  });

  const isFiring = phase === 'insertion' || phase === 'launch';
  const showMars = phase === 'arrival' || phase === 'insertion' || phase === 'operations' || phase === 'science';

  return (
    <>
      <ambientLight intensity={phase === 'operations' && phaseProgress > 0.4 && phaseProgress < 0.7 ? 0.08 : 0.4} />
      <directionalLight
        position={[40, 20, 30]}
        intensity={1.6}
        castShadow
      />
      <directionalLight
        position={[-30, -10, -20]}
        intensity={0.2}
        color="#3a506b"
      />

      <Starfield count={1500} />

      {/* Mars in Orbit / Arrival Phases */}
      {showMars && (
        <MarsPlanet
          radius={phase === 'arrival' ? 6 : 10}
          position={phase === 'arrival' ? [0, 0, -25] : [0, 0, 0]}
          rotationSpeed={0.06}
        />
      )}

      {/* Earth surface rim (during launch phase) */}
      {phase === 'launch' && (
        <group position={[0, -16, 0]}>
          <mesh>
            <sphereGeometry args={[14, 32, 32]} />
            <meshStandardMaterial color="#1b4965" roughness={0.7} />
          </mesh>
          <mesh>
            <sphereGeometry args={[14.3, 32, 32]} />
            <meshBasicMaterial color="#64dfdf" transparent opacity={0.2} side={THREE.BackSide} />
          </mesh>
        </group>
      )}

      {/* Spacecraft Rig */}
      <group ref={craftGroupRef}>
        <SpacecraftRig
          installedComponentIds={installedComponentIds}
          interactive={false}
          scale={0.9}
          engineFiring={isFiring}
        />

        {/* Science Scan Cone Pulse (during science phase) */}
        {phase === 'science' && (
          <mesh
            ref={scanConeRef}
            position={[0, 0, -3]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[1.5, 6, 16, 1, true]} />
            <meshBasicMaterial
              color="#00e5ff"
              transparent
              opacity={0.18}
              side={THREE.DoubleSide}
              wireframe={false}
            />
          </mesh>
        )}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={45}
        autoRotate={phase === 'deployment' || phase === 'cruise'}
        autoRotateSpeed={0.4}
      />
    </>
  );
}

export function MissionTimeline3D(props: MissionTimeline3DProps) {
  const [hasWebGlError, setHasWebGlError] = React.useState(false);

  if (hasWebGlError) {
    return (
      <WebGLFallback
        installedComponentIds={props.installedComponentIds}
        telemetry={props.telemetry}
        phase={props.phase}
        reason="WebGL Context Lost"
      />
    );
  }

  return (
    <div className="w-full h-full relative min-h-[360px] bg-space-950 rounded-xl overflow-hidden border border-space-800">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-cyan font-mono text-sm">
            INITIALIZING 3D TELEMETRY SENSORS...
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 2, 8], fov: 48 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#030509');
          }}
          onError={() => setHasWebGlError(true)}
        >
          <PhaseSceneContent
            phase={props.phase}
            phaseProgress={props.phaseProgress}
            installedComponentIds={props.installedComponentIds}
          />
        </Canvas>
      </Suspense>

      {/* Subtle HUD camera hint */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-space-900/60 px-2 py-0.5 rounded">
        Orbit Camera Active • Drag to Inspect
      </div>
    </div>
  );
}
