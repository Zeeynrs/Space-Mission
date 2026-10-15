import { useMemo } from 'react';

export function Starfield({ count = 1200 }: { count?: number }) {
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 250 + Math.random() * 300;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Subtle star color variance: pure white, slight blue, slight warm tint
      const tint = Math.random();
      if (tint > 0.85) {
        col[i * 3] = 0.8;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 1.0; // Cool bluish star
      } else if (tint > 0.7) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 0.75; // Warm yellowish star
      } else {
        col[i * 3] = 0.95;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 0.95; // Crisp white star
      }
    }
    return [pos, col];
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.6}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation={false}
      />
    </points>
  );
}
