'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const GradientMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color(0x0ea5e9),
    uColor2: new THREE.Color(0x8b5cf6),
    uColor3: new THREE.Color(0xec4899),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float n = noise(vUv * 10.0 + uTime * 0.1);
      vec3 color = mix(uColor1, uColor2, vUv.y + n * 0.3);
      color = mix(color, uColor3, vUv.x * 0.5 + sin(uTime + vPosition.x) * 0.2);

      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      color += vec3(0.1, 0.2, 0.4) * fresnel;

      gl_FragColor = vec4(color, 0.85);
    }
  `,
);

// Cast to any so JSX accepts it — TS sees the Drei class but it's used as a primitive component
const GradientMaterialAny = GradientMaterial as unknown as React.ComponentType<{
  attach?: string;
  transparent?: boolean;
  depthWrite?: boolean;
  uColor1?: THREE.Color;
  uColor2?: THREE.Color;
  uColor3?: THREE.Color;
}>;

export function FloatingShapes({ count = 15 }: { count?: number }) {
  const shapes = useMemo(() => {
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(1, 32, 16),
      new THREE.ConeGeometry(1, 2, 6),
      new THREE.TorusGeometry(1, 0.4, 8, 16),
      new THREE.TorusKnotGeometry(1, 0.3, 64, 16),
    ];

    return Array.from({ length: count }, () => {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const size = 0.5 + Math.random() * 1.5;
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 40 - 20,
      ];
      const rotation: [number, number, number] = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ];
      const rotationSpeed: [number, number, number] = [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
      ];
      const floatOffset = Math.random() * Math.PI * 2;
      const floatSpeed = 0.5 + Math.random() * 1;
      const floatAmplitude = 1 + Math.random() * 2;

      return {
        geometry,
        size,
        position,
        rotation,
        rotationSpeed,
        floatOffset,
        floatSpeed,
        floatAmplitude,
        colorIndex: Math.floor(Math.random() * 3),
      };
    });
  }, [count]);

  return (
    <group>
      {shapes.map((s, i) => (
        <FloatingShape key={i} {...s} />
      ))}
    </group>
  );
}

function FloatingShape({
  geometry,
  size,
  position,
  rotation,
  rotationSpeed,
  floatOffset,
  floatSpeed,
  floatAmplitude,
  colorIndex,
}: {
  geometry: THREE.BufferGeometry;
  size: number;
  position: [number, number, number];
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  floatOffset: number;
  floatSpeed: number;
  floatAmplitude: number;
  colorIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPosition = useRef(position);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += rotationSpeed[0];
    meshRef.current.rotation.y += rotationSpeed[1];
    meshRef.current.rotation.z += rotationSpeed[2];
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y =
      initialPosition.current[1] + Math.sin(time * floatSpeed + floatOffset) * floatAmplitude;
    meshRef.current.position.x =
      initialPosition.current[0] +
      Math.cos(time * floatSpeed * 0.7 + floatOffset) * floatAmplitude * 0.5;
  });

  const colors = [
    new THREE.Color(0x0ea5e9),
    new THREE.Color(0x8b5cf6),
    new THREE.Color(0xec4899),
  ];

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={size}>
      <primitive object={geometry} attach="geometry" />
      <GradientMaterialAny
        attach="material"
        uColor1={colors[colorIndex]}
        uColor2={colors[(colorIndex + 1) % 3]}
        uColor3={colors[(colorIndex + 2) % 3]}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export function ParticleField({ count = 500 }: { count?: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const colorOptions = [
      new THREE.Color(0x0ea5e9),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xec4899),
      new THREE.Color(0x22d3ee),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xf472b6),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 80 - 30;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      sizes[i] = Math.random() * 2 + 0.5;

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    positionsRef.current = positions;
    velocitiesRef.current = velocities;
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current || !positionsRef.current || !velocitiesRef.current) return;
    const positions = positionsRef.current;
    const velocities = velocitiesRef.current;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1] + Math.sin(time + i) * 0.005;
      positions[i3 + 2] += velocities[i3 + 2];

      if (positions[i3] > 40) positions[i3] = -40;
      if (positions[i3] < -40) positions[i3] = 40;
      if (positions[i3 + 1] > 30) positions[i3 + 1] = -30;
      if (positions[i3 + 1] < -30) positions[i3 + 1] = 30;
      if (positions[i3 + 2] > 10) positions[i3 + 2] = -50;
      if (positions[i3 + 2] < -50) positions[i3 + 2] = 10;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    const mat = particlesRef.current.material as THREE.ShaderMaterial;
    if (mat.uniforms?.uTime) mat.uniforms.uTime.value = time;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(count * 3), 3]} />
        <bufferAttribute attach="attributes-size" args={[new Float32Array(count), 1]} />
        <bufferAttribute attach="attributes-color" args={[new Float32Array(count * 3), 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={`
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha *= 0.6 + 0.4 * sin(uTime * 3.0 + gl_PointCoord.x * 10.0);
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}

export function GridFloor({ size = 100, divisions = 50 }: { size?: number; divisions?: number }) {
  const gridRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    const mat = gridRef.current.material as THREE.ShaderMaterial;
    if (mat.uniforms?.uTime) mat.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, -10]} renderOrder={-1}>
      <planeGeometry args={[size, size, divisions, divisions]} />
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vPosition;
          float grid(vec2 uv, float scale) {
            uv *= scale;
            vec2 f = fract(uv);
            vec2 d = min(f, 1.0 - f);
            float grid = step(0.02, d.x) * step(0.02, d.y);
            return grid;
          }
          void main() {
            float g = grid(vUv, 10.0);
            float pulse = sin(uTime * 0.5 + vPosition.x * 0.1 + vPosition.z * 0.1) * 0.5 + 0.5;
            vec3 color = mix(vec3(0.05, 0.1, 0.2), vec3(0.1, 0.2, 0.4), g * pulse);
            float alpha = 0.1 + 0.3 * g * pulse;
            gl_FragColor = vec4(color, alpha);
          }
        `}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export function AmbientLights() {
  return (
    <>
      <ambientLight color="#ffffff" intensity={0.3} />
      <directionalLight color="#ffffff" intensity={1} position={[10, 20, 10]} />
      <directionalLight color="#0ea5e9" intensity={0.3} position={[-10, 10, -10]} />
      <directionalLight color="#8b5cf6" intensity={0.3} position={[10, -10, 10]} />
      <directionalLight color="#ec4899" intensity={0.2} position={[-10, -10, -10]} />
      <hemisphereLight color="#0ea5e9" groundColor="#1e293b" intensity={0.5} />
    </>
  );
}