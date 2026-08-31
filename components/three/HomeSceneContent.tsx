'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { FloatingShapes, ParticleField, GridFloor, AmbientLights } from './Scene3D';

export function HomeSceneContent() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.05;
    targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.05;
    camera.position.x = targetRef.current.x * 5;
    camera.position.y = targetRef.current.y * 3;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <AmbientLights />
      <GridFloor />
      <ParticleField count={500} />
      <FloatingShapes count={15} />

      <Html
        className="absolute inset-0 pointer-events-none z-10"
        style={{ transform: 'translateZ(50px)' }}
      >
        <div className="container-custom h-full flex flex-col items-center justify-center pt-20 lg:pt-24 px-4">
          <div className="text-center max-w-4xl mx-auto">
            <FadeIn delay={0}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                New: 3D Interactive Portfolio v2.0
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 leading-tight mt-8">
                <span className="block text-dark-900 dark:text-white">Crafting</span>
                <span className="block gradient-text">Immersive 3D</span>
                <span className="block text-dark-900 dark:text-white">Digital Experiences</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-dark-600 dark:text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                We build stunning three-dimensional web experiences that captivate audiences and elevate brands. From interactive portfolios to immersive product showcases.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <a href="/portfolio" className="btn-primary text-base px-8 py-3">
                  View Portfolio
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a href="/order" className="btn-secondary text-base px-8 py-3">
                  Start a Project
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-dark-500 dark:text-dark-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Available for freelance</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>hello@orgportfolio.com</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.5}>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-400 dark:text-dark-500">
              <span className="text-xs uppercase tracking-wider font-medium">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-dark-300 dark:border-dark-600 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" />
              </div>
            </div>
          </FadeIn>
        </div>
      </Html>
    </>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      setShown(true);
    });
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}