"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Cpu, Workflow, BarChart3, Globe } from "lucide-react";

export default function ThreeHeroObject() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Glowing blue and purple spotlights to cast specular highlights on glass and cube
    const blueLight = new THREE.PointLight(0x4f7cff, 12, 30);
    blueLight.position.set(4, 4, 4);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 8, 30);
    purpleLight.position.set(-4, -4, 4);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 6, 20);
    cyanLight.position.set(0, 4, -4);
    scene.add(cyanLight);

    // Main Group
    const group = new THREE.Group();
    scene.add(group);

    // 1. Central 3D Dark Glossy Cube with "N" Texture
    // Generate Canvas Texture for "N"
    const createNTexture = () => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, "#08080c");
        grad.addColorStop(1, "#12131a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Border Glow
        ctx.strokeStyle = "rgba(79, 124, 255, 0.4)";
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, size - 12, size - 12);

        // Letter "N"
        ctx.font = "bold 150px Arial, Inter, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Add subtle shadow to "N"
        ctx.shadowColor = "rgba(79, 124, 255, 0.8)";
        ctx.shadowBlur = 15;
        ctx.fillText("N", size / 2, size / 2);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const nTexture = createNTexture();
    const cubeGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    
    // Physical materials to capture the light reflections beautifully
    const cubeMaterial = new THREE.MeshPhysicalMaterial({
      map: nTexture,
      roughness: 0.15,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      bumpScale: 0.05,
    });
    
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    group.add(cube);

    // 2. Outer Physical Glass Sphere
    const sphereGeometry = new THREE.SphereGeometry(1.85, 48, 48);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.08,
      transparent: true,
      opacity: 0.08,
      transmission: 0.9,
      ior: 1.5,
      thickness: 1.2,
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const glassSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(glassSphere);

    // 3. Orbiting Rings (Synapse paths)
    const createOrbitRing = (radius: number, color: number, opacity: number) => {
      const ringGeom = new THREE.BufferGeometry();
      const points = [];
      const segments = 80;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      ringGeom.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      });
      return new THREE.Line(ringGeom, ringMat);
    };

    const ring1 = createOrbitRing(2.1, 0x4f7cff, 0.45);
    ring1.rotation.x = Math.PI / 4;
    ring1.rotation.z = Math.PI / 6;
    group.add(ring1);

    const ring2 = createOrbitRing(2.35, 0xa855f7, 0.35);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = Math.PI / 8;
    group.add(ring2);

    const ring3 = createOrbitRing(2.6, 0x06b6d4, 0.25);
    ring3.rotation.x = Math.PI / 2.2;
    ring3.rotation.z = -Math.PI / 4;
    group.add(ring3);

    // Interactivity
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Scroll mapping
    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Visibility Tracking for Performance
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // OPTIMIZED RENDER LOOP (Locked 60fps - Zero allocation runtime)
    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      if (!isVisible) return; // Skip rendering when off-screen

      const elapsedTime = clock.getElapsedTime();

      // Slow Continuous Rotation
      cube.rotation.y = elapsedTime * 0.12;
      cube.rotation.x = elapsedTime * 0.06;

      glassSphere.rotation.y = -elapsedTime * 0.05;

      // Orbit rotations at varied frequencies
      ring1.rotation.y = elapsedTime * 0.15;
      ring2.rotation.y = -elapsedTime * 0.2;
      ring3.rotation.x = elapsedTime * 0.1;

      // Smooth floating translation
      group.position.y = Math.sin(elapsedTime * 0.7) * 0.12;

      // Inertial mouse movement interpolation (lerp)
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      group.rotation.y = currentX * 0.35;
      group.rotation.x = -currentY * 0.35;

      // Scroll scaling & extra rotation
      const scrollScale = Math.max(0.7, 1 - scrollY * 0.0005);
      group.scale.set(scrollScale, scrollScale, scrollScale);
      group.rotation.z = scrollY * 0.0008;

      // Soft rotating lights
      blueLight.position.x = Math.sin(elapsedTime * 0.5) * 5;
      blueLight.position.z = Math.cos(elapsedTime * 0.5) * 5;

      purpleLight.position.x = -Math.sin(elapsedTime * 0.4) * 5;
      purpleLight.position.y = Math.cos(elapsedTime * 0.4) * 5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      
      // Memory cleanup
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      nTexture.dispose();
      
      [ring1, ring2, ring3].forEach(r => {
        r.geometry.dispose();
        if (Array.isArray(r.material)) {
          r.material.forEach(m => m.dispose());
        } else {
          r.material.dispose();
        }
      });
      
      renderer.dispose();
    };
  }, []);

  // Connected card details
  const floatingCards = [
    {
      title: "AI AUTOMATION",
      desc: "Workflows that work for you",
      icon: Workflow,
      position: "top-2 right-0 md:top-8 md:right-2 lg:right-[-40px]",
      pulseColor: "bg-blue-500",
      linePath: "M0,10 C40,10 60,60 100,60"
    },
    {
      title: "AI AGENTS",
      desc: "Intelligent agents that get things done",
      icon: Cpu,
      position: "top-[26%] left-0 md:top-[32%] md:left-2 lg:left-[-60px]",
      pulseColor: "bg-purple-500",
      linePath: "M100,10 C60,10 40,60 0,60"
    },
    {
      title: "LEAD GENERATION",
      desc: "Find, engage & convert high-quality leads",
      icon: BarChart3,
      position: "bottom-[26%] left-0 md:bottom-[20%] md:left-6 lg:left-[-20px]",
      pulseColor: "bg-indigo-500",
      linePath: "M100,90 C60,90 40,30 0,30"
    },
    {
      title: "WEB DEVELOPMENT",
      desc: "Fast, modern & high-converting sites",
      icon: Globe,
      position: "bottom-2 right-0 md:bottom-[12%] md:right-6 lg:right-[-40px]",
      pulseColor: "bg-cyan-500",
      linePath: "M0,90 C40,90 60,30 100,30"
    }
  ];

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[450px] lg:min-h-[580px] flex items-center justify-center relative select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full max-w-full outline-none z-10" />

      {/* Ambient background glow beam */}
      <div className="absolute inset-0 w-[80%] h-[80%] rounded-full bg-accent-glow blur-[120px] pointer-events-none opacity-40 mix-blend-screen scale-75 m-auto z-0" />

      {/* Floating DOM Cards */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {floatingCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`absolute ${card.position} w-[150px] min-[400px]:w-[180px] sm:w-[220px] md:w-[260px] pointer-events-auto border border-border-custom/50 dark:border-border-custom bg-surface/90 dark:bg-surface/80 backdrop-blur-md p-2.5 sm:p-3 md:p-4 rounded-xl shadow-xl hover:border-accent-custom hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-500 group flex flex-row items-center gap-2 sm:gap-3`}
              style={{
                animation: `float-card 5s ease-in-out infinite`,
                animationDelay: `${idx * 0.7}s`
              }}
            >
              {/* Floating CSS animation */}
              <style>{`
                @keyframes float-card {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                  100% { transform: translateY(0px); }
                }
              `}</style>

              {/* Left Card Icon */}
              <div className="w-8 h-8 rounded-lg bg-surface border border-border-custom flex items-center justify-center text-accent-custom shrink-0 group-hover:bg-accent-custom group-hover:text-white transition-all duration-300">
                <Icon className="w-4 h-4" />
              </div>

              {/* Right Card Text */}
              <div className="text-left overflow-hidden">
                <h4 className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase truncate">
                  {card.title}
                </h4>
                <p className="hidden min-[400px]:block text-[10px] sm:text-[11px] font-semibold text-foreground/90 mt-0.5 sm:mt-1 leading-snug truncate sm:whitespace-normal">
                  {card.desc}
                </p>
              </div>

              {/* Pulsing indicator node */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full flex items-center justify-center bg-background border border-border-custom shadow">
                <span className={`w-1.5 h-1.5 rounded-full ${card.pulseColor} animate-ping`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
