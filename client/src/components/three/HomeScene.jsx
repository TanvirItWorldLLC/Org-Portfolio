import { useFrame, useThree } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import { useRef, useEffect, useState, Suspense } from 'react'
import * as THREE from 'three'
import { FloatingShapes, ParticleField, GridFloor, AmbientLights } from './Scene3D'

export function HomeScene() {
  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  useFrame((state) => {
    targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.05
    targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.05
    
    camera.position.x = targetRef.current.x * 5
    camera.position.y = targetRef.current.y * 3
    camera.lookAt(0, 0, 0)
  })
  
  return (
    <>
      <AmbientLights />
      <GridFloor />
      <ParticleField count={800} />
      <FloatingShapes count={20} />
      
      <Html
        className="absolute inset-0 pointer-events-none z-10"
        style={{ transform: 'translateZ(50px)' }}
      >
        <div className="container-custom h-full flex flex-col items-center justify-center pt-20 lg:pt-24 px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                New: 3D Interactive Portfolio v2.0
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 leading-tight"
            >
              <span className="block text-dark-900 dark:text-white">Crafting</span>
              <span className="block gradient-text">Immersive 3D</span>
              <span className="block text-dark-900 dark:text-white">Digital Experiences</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="text-lg sm:text-xl text-dark-600 dark:text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              We build stunning three-dimensional web experiences that captivate audiences and elevate brands. From interactive portfolios to immersive product showcases.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <a href="/portfolio" className="btn-primary text-base px-8 py-3">
                View Portfolio
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
              <a href="/order" className="btn-secondary text-base px-8 py-3">
                Start a Project
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-dark-500 dark:text-dark-400"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Available for freelance</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>hello@orgportfolio.com</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Typically responds in 24h</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-400 dark:text-dark-500"
          >
            <span className="text-xs uppercase tracking-wider font-medium">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-dark-300 dark:border-dark-600 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </Html>
      
      <Html
        className="absolute bottom-6 right-6 pointer-events-none z-10"
        style={{ transform: 'translateZ(50px)' }}
      >
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" aria-label="GitHub">
            <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" aria-label="Twitter">
            <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" aria-label="LinkedIn">
            <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </Html>
    </>
  )
}

// Simple motion wrapper for animation
function motion({ children, initial, animate, transition, className, ...props }) {
  const ref = useRef(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  
  useEffect(() => {
    if (!ref.current) return
    const element = ref.current
    element.style.opacity = initial?.opacity ?? 1
    element.style.transform = `translateY(${initial?.y ?? 0}px)`
    element.style.transition = `all ${transition?.duration ?? 0.5}s ${transition?.ease ?? 'easeOut'} ${transition?.delay ?? 0}s`
    
    requestAnimationFrame(() => {
      element.style.opacity = animate?.opacity ?? 1
      element.style.transform = `translateY(${animate?.y ?? 0}px)`
    })
  }, [])
  
  return <div ref={ref} className={className} {...props}>{children}</div>
}