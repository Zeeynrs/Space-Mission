import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MarsPlanetProps {
  radius?: number;
  position?: [number, number, number];
  rotationSpeed?: number;
  showAtmosphere?: boolean;
}

export function MarsPlanet({
  radius = 12,
  position = [0, 0, 0],
  rotationSpeed = 0.05,
  showAtmosphere = true,
}: MarsPlanetProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

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
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * rotationSpeed * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Principal Mars Solid Sphere */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          map={marsTexture || undefined}
          color={marsTexture ? '#ffffff' : '#c15a36'}
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

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
