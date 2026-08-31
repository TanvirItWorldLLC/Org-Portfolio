'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Project {
  color: string;
}

export function ProjectDetailScene({ project }: { project: Project }) {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-dark-100 dark:bg-dark-800">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ProjectDetailSceneContent color={project.color || '#0ea5e9'} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function ProjectDetailSceneContent({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: 0.2,
      roughness: 0.3,
      transmission: 0.2,
      thickness: 1,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      ior: 1.5,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    groupRef.current.add(mesh);

    const wireGeometry = new THREE.IcosahedronGeometry(2.05, 2);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    groupRef.current.add(wireMesh);

    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c = new THREE.Color(color);
    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    groupRef.current.add(particles);

    return () => {
      groupRef.current?.clear();
      geometry.dispose();
      material.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [color]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <ambientLight color="#ffffff" intensity={0.5} />
      <directionalLight color="#ffffff" intensity={1.5} position={[5, 10, 5]} />
      <directionalLight color={color} intensity={0.5} position={[-5, 5, -5]} />
      <hemisphereLight color={color} groundColor="#1e293b" intensity={0.5} />
    </group>
  );
}