import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SpacecraftRig } from './SpacecraftRig';
import { Starfield } from './Starfield';
import { WebGLFallback } from './WebGLFallback';
import { getComponentById } from '../simulation/physics';
import { RotateCcw } from 'lucide-react';

interface SpacecraftBuilder3DProps {
  installedComponentIds: string[];
  selectedComponentId?: string | null;
}

export function SpacecraftBuilder3D({
  installedComponentIds,
  selectedComponentId,
}: SpacecraftBuilder3DProps) {
  const [hasError, setHasError] = React.useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const selectedComp = selectedComponentId
    ? getComponentById(selectedComponentId)
    : null;
  const isInstalled = selectedComponentId
    ? installedComponentIds.includes(selectedComponentId)
    : false;

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

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
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={2.5}
            maxDistance={12}
            autoRotate={false}
          />
        </Canvas>
      </Suspense>

      {/* Selected Component Inspection Badge */}
      {selectedComp && (
        <div className="absolute top-3 left-3 pointer-events-none text-[10px] font-mono bg-space-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-cyan/40 flex items-center gap-2 shadow-lg">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isInstalled ? 'bg-emerald-400 animate-ping' : 'bg-cyan'
            }`}
          ></span>
          <span className="text-slate-400">
            {isInstalled ? 'INSPECTING:' : 'CATALOG FOCUS:'}
          </span>
          <strong className="text-slate-100">{selectedComp.name}</strong>
        </div>
      )}

      {/* Reset Camera Button */}
      <button
        onClick={handleResetCamera}
        className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 hover:text-cyan bg-space-900/80 hover:bg-space-850 px-2 py-1 rounded border border-space-700/60 transition-colors flex items-center gap-1 backdrop-blur"
        title="Reset 3D Staging Bay Camera View"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset View</span>
      </button>

      {/* Builder camera guidance pill */}
      <div className="absolute bottom-3 left-3 pointer-events-none text-[11px] font-mono text-slate-400 bg-space-900/80 backdrop-blur px-2.5 py-1 rounded border border-space-700/60 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
        <span>LMB: Orbit • Scroll: Zoom</span>
      </div>
    </div>
  );
}
