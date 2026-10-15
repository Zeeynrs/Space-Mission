import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COMPONENT_CATALOG } from '../data/components';

interface SpacecraftRigProps {
  installedComponentIds: string[];
  selectedComponentId?: string | null;
  interactive?: boolean;
  scale?: number;
  engineFiring?: boolean;
}

export function SpacecraftRig({
  installedComponentIds,
  selectedComponentId,
  interactive = true,
  scale = 1.0,
  engineFiring = false,
}: SpacecraftRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  const installedSet = useMemo(() => new Set(installedComponentIds), [installedComponentIds]);

  // Find installed components
  const bus = COMPONENT_CATALOG.find((c) => c.category === 'bus' && installedSet.has(c.id));
  const engine = COMPONENT_CATALOG.find((c) => c.category === 'propulsion' && installedSet.has(c.id));
  const tank = COMPONENT_CATALOG.find((c) => c.category === 'tank' && installedSet.has(c.id));
  const solar = COMPONENT_CATALOG.find((c) => c.category === 'solar' && installedSet.has(c.id));
  const antenna = COMPONENT_CATALOG.find((c) => c.category === 'antenna' && installedSet.has(c.id));
  const battery = COMPONENT_CATALOG.find((c) => c.category === 'battery' && installedSet.has(c.id));
  const computer = COMPONENT_CATALOG.find((c) => c.category === 'computer' && installedSet.has(c.id));
  const thermal = COMPONENT_CATALOG.find((c) => c.category === 'thermal' && installedSet.has(c.id));

  // Science instruments (can be multiple)
  const scienceList = COMPONENT_CATALOG.filter(
    (c) => c.category === 'science' && installedSet.has(c.id)
  );

  // Materials
  const mliGoldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4af37',
        metalness: 0.85,
        roughness: 0.25,
      }),
    []
  );

  const metalAluminumMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b0bec5',
        metalness: 0.9,
        roughness: 0.2,
      }),
    []
  );

  const solarCellMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0d2b45',
        metalness: 0.6,
        roughness: 0.15,
        emissive: '#051329',
      }),
    []
  );

  const antennaDishMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f0f4f8',
        metalness: 0.3,
        roughness: 0.3,
      }),
    []
  );

  const thrusterCopperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b87333',
        metalness: 0.95,
        roughness: 0.15,
      }),
    []
  );

  const highlightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#00e5ff',
        emissive: '#00e5ff',
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.2,
      }),
    []
  );

  useFrame((state, delta) => {
    if (interactive && groupRef.current) {
      // Gentle idle floating pitch & yaw
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }

    if (flameRef.current) {
      // Engine exhaust flicker
      const pulse = 0.8 + Math.random() * 0.4;
      flameRef.current.scale.set(pulse, 1.2 * pulse, pulse);
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* ================= 1. BUS / STRUCTURE ================= */}
      {bus && (
        <group>
          {bus.id === 'bus-cubesat-heavy' && (
            <mesh
              material={selectedComponentId === bus.id ? highlightMat : mliGoldMat}
              castShadow
            >
              <boxGeometry args={[1.2, 1.4, 1.2]} />
            </mesh>
          )}

          {bus.id === 'bus-medium-survey' && (
            <mesh
              material={selectedComponentId === bus.id ? highlightMat : mliGoldMat}
              castShadow
            >
              <cylinderGeometry args={[0.9, 0.9, 1.8, 8]} />
            </mesh>
          )}

          {bus.id === 'bus-deepspace-flagship' && (
            <group>
              <mesh
                material={selectedComponentId === bus.id ? highlightMat : mliGoldMat}
                castShadow
              >
                <boxGeometry args={[1.8, 2.2, 1.6]} />
              </mesh>
              {/* Heavy corner structural trusses */}
              {[-0.95, 0.95].map((x) =>
                [-0.85, 0.85].map((z) => (
                  <mesh key={`${x}-${z}`} position={[x, 0, z]} material={metalAluminumMat}>
                    <cylinderGeometry args={[0.06, 0.06, 2.3, 8]} />
                  </mesh>
                ))
              )}
            </group>
          )}
        </group>
      )}

      {/* ================= 2. PROPELLANT TANK ================= */}
      {tank && (
        <mesh
          position={[0, 0, 0]}
          material={selectedComponentId === tank.id ? highlightMat : metalAluminumMat}
          castShadow
        >
          {tank.id === 'tank-titanium-small' && <sphereGeometry args={[0.55, 24, 24]} />}
          {tank.id === 'tank-composite-medium' && <sphereGeometry args={[0.75, 24, 24]} />}
          {tank.id === 'tank-highcap-large' && <cylinderGeometry args={[0.75, 0.75, 1.6, 16]} />}
        </mesh>
      )}

      {/* ================= 3. PROPULSION ENGINE ================= */}
      {engine && (
        <group position={[0, -1.05, 0]}>
          {engine.id === 'engine-hydrazine-mono' && (
            <group>
              {[-0.3, 0.3].map((x) =>
                [-0.3, 0.3].map((z) => (
                  <mesh
                    key={`hydra-${x}-${z}`}
                    position={[x, 0, z]}
                    material={selectedComponentId === engine.id ? highlightMat : thrusterCopperMat}
                    rotation={[Math.PI, 0, 0]}
                  >
                    <coneGeometry args={[0.12, 0.3, 12]} />
                  </mesh>
                ))
              )}
            </group>
          )}

          {engine.id === 'engine-biprop-leros' && (
            <group>
              <mesh
                material={selectedComponentId === engine.id ? highlightMat : thrusterCopperMat}
                rotation={[Math.PI, 0, 0]}
                castShadow
              >
                <coneGeometry args={[0.42, 0.75, 24]} />
              </mesh>
              {/* Engine Throat Collar */}
              <mesh position={[0, 0.2, 0]} material={metalAluminumMat}>
                <cylinderGeometry args={[0.16, 0.2, 0.25, 16]} />
              </mesh>
            </group>
          )}

          {engine.id === 'engine-hall-electric' && (
            <group>
              {[-0.25, 0.25].map((x) => (
                <mesh
                  key={`hall-${x}`}
                  position={[x, 0, 0]}
                  material={selectedComponentId === engine.id ? highlightMat : metalAluminumMat}
                  rotation={[Math.PI, 0, 0]}
                >
                  <cylinderGeometry args={[0.2, 0.24, 0.35, 16]} />
                </mesh>
              ))}
            </group>
          )}

          {/* Engine Exhaust Flame (when burning) */}
          {engineFiring && (
            <mesh ref={flameRef} position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.3, 1.4, 16]} />
              <meshBasicMaterial
                color={engine.id === 'engine-hall-electric' ? '#00e5ff' : '#ff9100'}
                transparent
                opacity={0.85}
              />
            </mesh>
          )}
        </group>
      )}

      {/* ================= 4. SOLAR POWER WINGS ================= */}
      {solar && (
        <group>
          {solar.id === 'solar-fixed-flat' && (
            // Flush mounted body panels
            <group>
              <mesh
                position={[0.92, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                material={selectedComponentId === solar.id ? highlightMat : solarCellMat}
              >
                <boxGeometry args={[1.0, 1.4, 0.04]} />
              </mesh>
              <mesh
                position={[-0.92, 0, 0]}
                rotation={[0, -Math.PI / 2, 0]}
                material={selectedComponentId === solar.id ? highlightMat : solarCellMat}
              >
                <boxGeometry args={[1.0, 1.4, 0.04]} />
              </mesh>
            </group>
          )}

          {solar.id === 'solar-articulated-wings' && (
            // Dual extended articulated solar panels
            <group>
              {/* Right Wing */}
              <group position={[1.0, 0, 0]}>
                <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={metalAluminumMat}>
                  <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
                </mesh>
                <mesh
                  position={[1.8, 0, 0]}
                  material={selectedComponentId === solar.id ? highlightMat : solarCellMat}
                  castShadow
                >
                  <boxGeometry args={[2.0, 1.2, 0.04]} />
                </mesh>
              </group>

              {/* Left Wing */}
              <group position={[-1.0, 0, 0]}>
                <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={metalAluminumMat}>
                  <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
                </mesh>
                <mesh
                  position={[-1.8, 0, 0]}
                  material={selectedComponentId === solar.id ? highlightMat : solarCellMat}
                  castShadow
                >
                  <boxGeometry args={[2.0, 1.2, 0.04]} />
                </mesh>
              </group>
            </group>
          )}

          {solar.id === 'solar-ultraflex-advanced' && (
            // High-capacity circular deployable solar fans
            <group>
              <group position={[1.4, 0, 0]}>
                <mesh
                  material={selectedComponentId === solar.id ? highlightMat : solarCellMat}
                  rotation={[0, Math.PI / 2, 0]}
                  castShadow
                >
                  <cylinderGeometry args={[1.4, 1.4, 0.04, 24]} />
                </mesh>
              </group>
              <group position={[-1.4, 0, 0]}>
                <mesh
                  material={selectedComponentId === solar.id ? highlightMat : solarCellMat}
                  rotation={[0, Math.PI / 2, 0]}
                  castShadow
                >
                  <cylinderGeometry args={[1.4, 1.4, 0.04, 24]} />
                </mesh>
              </group>
            </group>
          )}
        </group>
      )}

      {/* ================= 5. COMMUNICATION ANTENNA ================= */}
      {antenna && (
        <group position={[0, 1.1, 0]}>
          {antenna.id === 'antenna-lga-omni' && (
            <mesh
              position={[0, 0.3, 0]}
              material={selectedComponentId === antenna.id ? highlightMat : metalAluminumMat}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            </mesh>
          )}

          {antenna.id === 'antenna-mga-horn' && (
            <mesh
              position={[0, 0.25, 0.3]}
              material={selectedComponentId === antenna.id ? highlightMat : thrusterCopperMat}
              rotation={[Math.PI / 4, 0, 0]}
            >
              <coneGeometry args={[0.22, 0.45, 4]} />
            </mesh>
          )}

          {antenna.id === 'antenna-hga-parabolic' && (
            <group position={[0, 0.3, 0.4]} rotation={[0.4, 0.3, 0]}>
              {/* Steerable gimbal pedestal */}
              <mesh position={[0, -0.15, 0]} material={metalAluminumMat}>
                <cylinderGeometry args={[0.08, 0.1, 0.3, 12]} />
              </mesh>
              {/* Parabolic Dish (concave shell) */}
              <mesh
                material={selectedComponentId === antenna.id ? highlightMat : antennaDishMat}
                castShadow
              >
                <sphereGeometry args={[1.1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
              </mesh>
              {/* Sub-reflector feed horn */}
              <mesh position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]} material={thrusterCopperMat}>
                <coneGeometry args={[0.06, 0.15, 8]} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ================= 6. BATTERIES & AVIONICS ================= */}
      {battery && (
        <mesh
          position={[0, -0.3, 0.85]}
          material={selectedComponentId === battery.id ? highlightMat : metalAluminumMat}
        >
          <boxGeometry args={[0.45, 0.35, 0.25]} />
        </mesh>
      )}

      {computer && (
        <mesh
          position={[0, 0.3, -0.85]}
          material={selectedComponentId === computer.id ? highlightMat : metalAluminumMat}
        >
          <boxGeometry args={[0.4, 0.4, 0.2]} />
        </mesh>
      )}

      {/* ================= 7. THERMAL RADIATORS ================= */}
      {thermal && (
        <group>
          {thermal.id === 'thermal-active-heaters' ? (
            <mesh
              position={[-0.88, 0.4, 0]}
              rotation={[0, 0, Math.PI / 2]}
              material={selectedComponentId === thermal.id ? highlightMat : metalAluminumMat}
            >
              <boxGeometry args={[0.8, 0.05, 0.6]} />
            </mesh>
          ) : (
            <mesh
              position={[-0.88, 0.4, 0]}
              rotation={[0, 0, Math.PI / 2]}
              material={selectedComponentId === thermal.id ? highlightMat : mliGoldMat}
            >
              <boxGeometry args={[0.6, 0.04, 0.5]} />
            </mesh>
          )}
        </group>
      )}

      {/* ================= 8. SCIENCE INSTRUMENT SUITE ================= */}
      {scienceList.map((inst) => {
        const isSelected = selectedComponentId === inst.id;
        const mat = isSelected ? highlightMat : metalAluminumMat;

        if (inst.id === 'sensor-camera-hires') {
          // Hi-Res optical telescope barrel looking down/forward
          return (
            <group key={inst.id} position={[0.4, 0.3, 0.75]} rotation={[0.3, 0, 0]}>
              <mesh material={mat} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.7, 16]} />
              </mesh>
              {/* Lens Aperture */}
              <mesh position={[0, 0.36, 0]} material={solarCellMat}>
                <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
              </mesh>
            </group>
          );
        }

        if (inst.id === 'sensor-spectrometer-ir') {
          // Rectangular optical spectrometer box with sensor aperture
          return (
            <group key={inst.id} position={[-0.45, 0.3, 0.7]}>
              <mesh material={mat} castShadow>
                <boxGeometry args={[0.35, 0.35, 0.45]} />
              </mesh>
            </group>
          );
        }

        if (inst.id === 'sensor-magnetometer') {
          // Deployable magnetometer boom extending out
          return (
            <group key={inst.id} position={[0, -0.6, -0.8]} rotation={[-0.8, 0, 0]}>
              <mesh material={mat}>
                <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
              </mesh>
              {/* Sensor Pod at tip */}
              <mesh position={[0, 0.9, 0]} material={thrusterCopperMat}>
                <boxGeometry args={[0.14, 0.14, 0.14]} />
              </mesh>
            </group>
          );
        }

        if (inst.id === 'sensor-subsurface-radar') {
          // Dual dipole radar booms extending horizontally below
          return (
            <group key={inst.id} position={[0, -0.9, 0]}>
              <mesh material={mat} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 2.8, 8]} />
              </mesh>
            </group>
          );
        }

        return null;
      })}
    </group>
  );
}
