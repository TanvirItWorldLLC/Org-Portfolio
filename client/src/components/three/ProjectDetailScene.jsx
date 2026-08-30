import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function ProjectDetailScene({ project }) {
  const groupRef = useRef()
  const { scene } = useThree()
  
  useEffect(() => {
    if (!groupRef.current) return
    
    // Create a more complex scene based on project type
    const geometry = new THREE.IcosahedronGeometry(2, 2)
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(project.color || '#0ea5e9'),
      metalness: 0.2,
      roughness: 0.3,
      transmission: 0.2,
      thickness: 1,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      ior: 1.5,
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    groupRef.current.add(mesh)
    
    // Add wireframe
    const wireGeometry = new THREE.IcosahedronGeometry(2.05, 2)
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(project.color || '#0ea5e9'),
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial)
    groupRef.current.add(wireMesh)
    
    // Add particles around
    const particleCount = 200
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSizes = new Float32Array(particleCount)
    const particleColors = new Float32Array(particleCount * 3)
    
    const color = new THREE.Color(project.color || '#0ea5e9')
    
    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = radius * Math.cos(phi)
      
      particleSizes[i] = Math.random() * 0.1 + 0.02
      
      particleColors[i * 3] = color.r
      particleColors[i * 3 + 1] = color.g
      particleColors[i * 3 + 2] = color.b
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    groupRef.current.add(particles)
    groupRef.current.userData.particles = particles
    groupRef.current.userData.wireMesh = wireMesh
    
    return () => {
      groupRef.current.clear()
      geometry.dispose()
      material.dispose()
      wireGeometry.dispose()
      wireMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
    }
  }, [project.color])
  
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    groupRef.current.rotation.y += delta * 0.05
    groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
    
    if (groupRef.current.userData.wireMesh) {
      groupRef.current.userData.wireMesh.rotation.y -= delta * 0.03
      groupRef.current.userData.wireMesh.rotation.x = Math.cos(time * 0.5) * 0.1
    }
    
    if (groupRef.current.userData.particles) {
      groupRef.current.userData.particles.rotation.y += delta * 0.02
      const positions = groupRef.current.userData.particles.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + i) * 0.001
      }
      groupRef.current.userData.particles.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <group ref={groupRef}>
      <ambientLight color="#ffffff" intensity={0.5} />
      <directionalLight
        color="#ffffff"
        intensity={1.5}
        position={[5, 10, 5]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight color={project.color || '#0ea5e9'} intensity={0.5} position={[-5, 5, -5]} />
      <hemisphereLight color={project.color || '#0ea5e9'} groundColor="#1e293b" intensity={0.5} />
    </group>
  )
}