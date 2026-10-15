import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface MartianLandmark {
  id: string;
  name: string;
  type: string;
  elevation: string;
  description: string;
  lat: number;
  long: number;
}

export const MARTIAN_LANDMARKS: MartianLandmark[] = [
  {
    id: 'olympus-mons',
    name: 'Olympus Mons',
    type: 'Shield Volcano',
    elevation: '21.9 km altitude',
    description: 'Largest volcano in the solar system, spanning 600 km across Tharsis plateau.',
    lat: 18.65,
    long: -133.8,
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris',
    type: 'Canyon Rift System',
    elevation: '7 km depth',
    description: 'Grand 4,000 km tectonic canyon system spanning nearly a quarter of Mars circumference.',
    lat: -14.0,
    long: -59.2,
  },
  {
    id: 'jezero-crater',
    name: 'Jezero Crater',
    type: 'Ancient Lake Delta',
    elevation: '2.5 km below datum',
    description: 'NASA Perseverance rover landing site with river delta deposits and biosignature targets.',
    lat: 18.38,
    long: 77.58,
  },
  {
    id: 'gale-crater',
    name: 'Gale Crater (Mt. Sharp)',
    type: 'Impact Basin',
    elevation: '5.5 km central mound',
    description: 'NASA Curiosity rover mission investigating habitability and stratigraphy of ancient lakes.',
    lat: -5.4,
    long: 137.8,
  },
  {
    id: 'planum-boreum',
    name: 'Planum Boreum',
    type: 'North Polar Ice Cap',
    elevation: '2 km thickness',
    description: 'Perennial water ice cap overlaid with seasonal dry ice (CO2) sublimation layers.',
    lat: 84.0,
    long: 0,
  },
];

function latLongToCartesian(lat: number, long: number, r: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  const theta = (long * Math.PI) / 180;
  const x = r * Math.cos(phi) * Math.sin(theta);
  const y = r * Math.sin(phi);
  const z = r * Math.cos(phi) * Math.cos(theta);
  return [x, y, z];
}

interface MarsPlanetProps {
  radius?: number;
  position?: [number, number, number];
  rotationSpeed?: number;
  showAtmosphere?: boolean;
  showLandmarks?: boolean;
}

export function MarsPlanet({
  radius = 12,
  position = [0, 0, 0],
  rotationSpeed = 0.05,
  showAtmosphere = true,
  showLandmarks = true,
}: MarsPlanetProps) {
  const planetGroupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [activeLandmarkId, setActiveLandmarkId] = useState<string | null>(null);

  // Generate a procedural Mars surface texture on an offscreen canvas
  const marsTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base Martian terrain (rusty red ochre)
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#e5d7c3'); // North polar ice cap
    gradient.addColorStop(0.12, '#9a472c'); // High latitude rusty dunes
    gradient.addColorStop(0.35, '#c15a36'); // Tharsis plateau / Arabia Terra
    gradient.addColorStop(0.5, '#5a2518'); // Valles Marineris canyon / Syrtis Major dark basalt
    gradient.addColorStop(0.7, '#b24f2e'); // Southern cratered highlands
    gradient.addColorStop(0.9, '#833920'); // South sub-polar
    gradient.addColorStop(1.0, '#e8dcce'); // South polar ice cap
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Procedural crater and canyon surface details
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * 1024;
      const y = 80 + Math.random() * 350;
      const rad = 2 + Math.random() * 25;
      const dark = Math.random() > 0.4;

      ctx.beginPath();
      ctx.arc(x, y, rad, 0, 2 * Math.PI);
      ctx.fillStyle = dark ? 'rgba(50, 18, 12, 0.35)' : 'rgba(215, 115, 80, 0.3)';
      ctx.fill();

      // Crater rim highlight
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(235, 160, 120, 0.2)';
      ctx.stroke();
    }

    // Valles Marineris Canyon feature across equator
    ctx.beginPath();
    ctx.moveTo(350, 255);
    ctx.bezierCurveTo(450, 265, 550, 245, 680, 260);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(40, 12, 8, 0.65)';
    ctx.stroke();

    // Syrtis Major dark basaltic volcanic shield
    ctx.beginPath();
    ctx.ellipse(750, 240, 60, 40, Math.PI / 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(45, 15, 10, 0.55)';
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  useFrame((_, delta) => {
    if (planetGroupRef.current) {
      planetGroupRef.current.rotation.y += delta * rotationSpeed * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Rotating Mars Group (Sphere + Synced Landmark Pins) */}
      <group ref={planetGroupRef}>
        {/* Principal Mars Solid Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial
            map={marsTexture || undefined}
            color={marsTexture ? '#ffffff' : '#c15a36'}
            roughness={0.88}
            metalness={0.05}
          />
        </mesh>

        {/* 3D Interactive Martian Landmarks */}
        {showLandmarks &&
          MARTIAN_LANDMARKS.map((landmark) => {
            const pos = latLongToCartesian(landmark.lat, landmark.long, radius * 1.015);
            const isSelected = activeLandmarkId === landmark.id;

            return (
              <group key={landmark.id} position={pos}>
                {/* Surface Beacon Target Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.15, 0.28, 16]} />
                  <meshBasicMaterial
                    color={isSelected ? '#ffb703' : '#00e5ff'}
                    transparent
                    opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Vertical Elevation Beacon Needle */}
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
                  <meshBasicMaterial color={isSelected ? '#ffb703' : '#00e5ff'} />
                </mesh>

                {/* Sci-Fi Target Label Overlay */}
                <Html
                  position={[0, 0.75, 0]}
                  distanceFactor={radius * 2.2}
                  center
                  className="pointer-events-auto select-none"
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLandmarkId(isSelected ? null : landmark.id);
                    }}
                    onMouseEnter={() => setActiveLandmarkId(landmark.id)}
                    className="cursor-pointer group flex flex-col items-center"
                  >
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight whitespace-nowrap transition-all border backdrop-blur-md flex items-center gap-1 shadow-lg ${
                        isSelected
                          ? 'bg-amber/90 border-amber text-space-950 scale-105'
                          : 'bg-space-950/80 border-cyan/40 text-cyan group-hover:border-cyan group-hover:bg-space-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                      <span>{landmark.name}</span>
                    </div>

                    {/* Popover Detail Card on Click/Hover */}
                    {isSelected && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 w-48 p-2.5 rounded-lg bg-space-950/95 border border-amber/70 text-slate-100 text-[10px] font-mono shadow-2xl backdrop-blur-md space-y-1 text-left"
                      >
                        <div className="flex justify-between items-center border-b border-space-800 pb-1">
                          <span className="text-amber font-bold uppercase">{landmark.type}</span>
                          <span className="text-slate-400 text-[9px]">{landmark.elevation}</span>
                        </div>
                        <p className="text-slate-300 text-[10px] leading-tight pt-0.5">
                          {landmark.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Html>
              </group>
            );
          })}
      </group>

      {/* Subtle Atmospheric Limb / Rayleigh Glow */}
      {showAtmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[radius * 1.025, 32, 32]} />
          <meshBasicMaterial
            color="#e08d6b"
            transparent
            opacity={0.16}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}
