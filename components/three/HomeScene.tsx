'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { HomeSceneContent } from './HomeSceneContent';

export function HomeScene() {
  return (
    <div className="three-canvas">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          if (typeof window !== 'undefined') {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <HomeSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}

function LoadingFallback() {
  return (
    <Html
      className="absolute inset-0 flex items-center justify-center text-dark-400 dark:text-dark-500"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading 3D scene...</p>
      </div>
    </Html>
  );
}