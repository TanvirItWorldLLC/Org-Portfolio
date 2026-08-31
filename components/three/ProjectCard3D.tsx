'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Eye, Star } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug?: string;
  description: string;
  color: string;
  featured: boolean;
  views: number;
  tags: string[];
  category: { name: string; color: string; slug: string } | null;
}

export function ProjectCard3D({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/portfolio/${project.id}`}
      className="card group h-full flex flex-col overflow-hidden relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-dark-100 dark:bg-dark-800">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <ProjectCardScene color={project.color} hovered={hovered} />
          </Suspense>
        </Canvas>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {project.featured && (
            <span className="w-8 h-8 rounded-xl bg-yellow-500/90 backdrop-blur text-white flex items-center justify-center">
              <Star className="w-4 h-4" />
            </span>
          )}
          <span className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 pt-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.category && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {project.category.name}
            </span>
          )}
          {project.featured && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
          {project.title}
        </h3>

        <p className="text-sm text-dark-600 dark:text-dark-400 mb-4 line-clamp-2 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tags?.slice(0, 4).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded text-xs bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400">
              {tag}
            </span>
          ))}
          {project.tags && project.tags.length > 4 && (
            <span className="px-2 py-0.5 rounded text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              +{project.tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProjectCardScene({ color, hovered }: { color: string; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    if (hovered) {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.x = Math.sin(time * 2) * 0.1;
      const s = 1 + Math.sin(time * 3) * 0.02;
      groupRef.current.scale.setScalar(s);
    } else {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x = Math.sin(time) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshPhysicalMaterial
          color={color || '#0ea5e9'}
          metalness={0.3}
          roughness={0.4}
          transmission={0.1}
          thickness={0.5}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>

      <mesh position={[0, -1.5, 0]} scale={[2, 0.1, 2]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.1} depthWrite={false} />
      </mesh>

      <pointLight color={color || '#0ea5e9'} intensity={hovered ? 2 : 1} position={[0, 3, 3]} distance={10} decay={2} />
    </group>
  );
}