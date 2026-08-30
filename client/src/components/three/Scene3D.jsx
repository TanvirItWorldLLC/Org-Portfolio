import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Stars, shaderMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect, Suspense, lazy } from 'react'
import * as THREE from 'three'
import { HomeScene } from './HomeScene'

export function Scene3D({ className = '', interactive = false, fallback = null }) {
  return (
    <div className={`three-canvas ${interactive ? 'interactive' : ''} ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }}
      >
        <Suspense fallback={fallback || <LoadingFallback />}>
          <HomeScene />
        </Suspense>
      </Canvas>
    </div>
  )
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
  )
}

const GradientMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color(0x0ea5e9),
    uColor2: new THREE.Color(0x8b5cf6),
    uColor3: new THREE.Color(0xec4899),
  },
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
  `
)

export function FloatingShapes({ count = 15 }) {
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
    ]
    
    return Array.from({ length: count }, (_, i) => {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)]
      const size = 0.5 + Math.random() * 1.5
      const position = [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 40 - 20,
      ]
      const rotation = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ]
      const rotationSpeed = [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
      ]
      const floatOffset = Math.random() * Math.PI * 2
      const floatSpeed = 0.5 + Math.random() * 1
      const floatAmplitude = 1 + Math.random() * 2
      
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
      }
    })
  }, [count])

  return (
    <group>
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
    </group>
  )
}

function FloatingShape({ geometry, size, position, rotation, rotationSpeed, floatOffset, floatSpeed, floatAmplitude, colorIndex }) {
  const meshRef = useRef()
  const initialPosition = useRef(position)
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    meshRef.current.rotation.x += rotationSpeed[0]
    meshRef.current.rotation.y += rotationSpeed[1]
    meshRef.current.rotation.z += rotationSpeed[2]
    
    const time = state.clock.getElapsedTime()
    meshRef.current.position.y = initialPosition.current[1] + Math.sin(time * floatSpeed + floatOffset) * floatAmplitude
    meshRef.current.position.x = initialPosition.current[0] + Math.cos(time * floatSpeed * 0.7 + floatOffset) * floatAmplitude * 0.5
  })
  
  const colors = [
    new THREE.Color(0x0ea5e9),
    new THREE.Color(0x8b5cf6),
    new THREE.Color(0xec4899),
  ]
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={size}
      castShadow
      receiveShadow
    >
      {geometry}
      <GradientMaterial
        attach="material"
        uColor1={colors[colorIndex]}
        uColor2={colors[(colorIndex + 1) % 3]}
        uColor3={colors[(colorIndex + 2) % 3]}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export function ParticleField({ count = 500 }) {
  const particlesRef = useRef()
  const positionsRef = useRef()
  const velocitiesRef = useRef()
  const sizesRef = useRef()
  const colorsRef = useRef()
  
  useEffect(() => {
    if (!particlesRef.current) return
    
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    
    const colorOptions = [
      new THREE.Color(0x0ea5e9),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xec4899),
      new THREE.Color(0x22d3ee),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xf472b6),
    ]
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 80
      positions[i3 + 1] = (Math.random() - 0.5) * 60
      positions[i3 + 2] = (Math.random() - 0.5) * 80 - 30
      
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
      
      sizes[i] = Math.random() * 2 + 0.5
      
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }
    
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesRef.current.geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    particlesRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    positionsRef.current = positions
    velocitiesRef.current = velocities
    sizesRef.current = sizes
    colorsRef.current = colors
  }, [count])
  
  useFrame((state) => {
    if (!particlesRef.current || !positionsRef.current) return
    
    const positions = positionsRef.current
    const velocities = velocitiesRef.current
    const time = state.clock.getElapsedTime()
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      positions[i3] += velocities[i3]
      positions[i3 + 1] += velocities[i3 + 1] + Math.sin(time + i) * 0.005
      positions[i3 + 2] += velocities[i3 + 2]
      
      if (positions[i3] > 40) positions[i3] = -40
      if (positions[i3] < -40) positions[i3] = 40
      if (positions[i3 + 1] > 30) positions[i3 + 1] = -30
      if (positions[i3 + 1] < -30) positions[i3 + 1] = 30
      if (positions[i3 + 2] > 10) positions[i3 + 2] = -50
      if (positions[i3 + 2] < -50) positions[i3 + 2] = 10
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
    particlesRef.current.material.uniforms.uTime.value = time
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count * 3} itemSize={3} />
        <bufferAttribute attach="attributes-velocity" count={count * 3} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} itemSize={1} />
        <bufferAttribute attach="attributes-color" count={count * 3} itemSize={3} />
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
        uniforms={{ uTime: 0 }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  )
}

export function GridFloor({ size = 100, divisions = 50 }) {
  const gridRef = useRef()
  
  useFrame((state) => {
    if (!gridRef.current) return
    const time = state.clock.getElapsedTime()
    gridRef.current.material.uniforms.uTime.value = time
  })
  
  return (
    <mesh
      ref={gridRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -15, -10]}
      renderOrder={-1}
    >
      <planeGeometry args={[size, size, divisions, divisions]} />
      <shaderMaterial
        attach="material"
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
        uniforms={{ uTime: 0 }}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export function AmbientLights() {
  return (
    <>
      <ambientLight color="#ffffff" intensity={0.3} />
      <directionalLight
        color="#ffffff"
        intensity={1}
        position={[10, 20, 10]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.001}
      />
      <directionalLight color="#0ea5e9" intensity={0.3} position={[-10, 10, -10]} />
      <directionalLight color="#8b5cf6" intensity={0.3} position={[10, -10, 10]} />
      <directionalLight color="#ec4899" intensity={0.2} position={[-10, -10, -10]} />
      <hemisphereLight color="#0ea5e9" groundColor="#1e293b" intensity={0.5} />
    </>
  )
}

function group({ children }) {
  return <group>{children}</group>
}