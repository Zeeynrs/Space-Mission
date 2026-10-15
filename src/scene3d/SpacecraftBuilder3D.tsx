import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { SpacecraftRig } from './SpacecraftRig';
import { Starfield } from './Starfield';
import { WebGLFallback } from './WebGLFallback';

interface SpacecraftBuilder3DProps {
  installedComponentIds: string[];
  selectedComponentId?: string | null;
}

export function SpacecraftBuilder3D({
  installedComponentIds,
  selectedComponentId,
}: SpacecraftBuilder3DProps) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <WebGLFallback
        installedComponentIds={installedComponentIds}
        reason="WebGL Renderer Error"
      />
    );
  }

  return (
    <div className="w-full h-full relative min-h-[380px] bg-space-950 rounded-xl overflow-hidden border border-space-800">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-cyan font-mono text-sm">
            CALIBRATING VEHICLE STAGING BAY...
          </div>
        }
      >
        <Canvas
          camera={{ position: [2.5, 2.0, 5.0], fov: 45 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#030509');
          }}
          onError={() => setHasError(true)}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 15, 10]} intensity={1.8} castShadow />
          <directionalLight position={[-10, -5, -8]} intensity={0.3} color="#48cae4" />

          <Starfield count={800} />

          <SpacecraftRig
            installedComponentIds={installedComponentIds}
            selectedComponentId={selectedComponentId}
            interactive={true}
            scale={1.05}
          />

          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.6}
            scale={12}
            blur={2.5}
            far={4}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2.5}
            maxDistance={12}
            autoRotate={false}
          />
        </Canvas>
      </Suspense>

      {/* Builder camera guidance pill */}
      <div className="absolute bottom-3 left-3 pointer-events-none text-[11px] font-mono text-slate-400 bg-space-900/80 backdrop-blur px-2.5 py-1 rounded border border-space-700/60 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
        <span>LMB: Orbit • Scroll: Zoom</span>
      </div>
    </div>
  );
}
