"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Cpu, Workflow, BarChart3, Globe } from "lucide-react";

export default function ThreeHeroObject() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 450;
    const height = containerRef.current.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    // High performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      precision: "mediump",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    // Balanced Fixed Lighting (zero per-frame light matrix recalculation)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x4f7cff, 14, 30);
    blueLight.position.set(4, 4, 4);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 10, 30);
    purpleLight.position.set(-4, -4, 4);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 8, 20);
    cyanLight.position.set(0, 4, -4);
    scene.add(cyanLight);

    // Main Group
    const group = new THREE.Group();
    scene.add(group);

    // Central Monolith (Inner Cube)
    const cubeGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);

    // Optimized 256x256 canvas for the glowing Tech Infinix logo texture (4x less memory & instant raster)
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Sleek cyber gradient background
      const bgGrad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
      bgGrad.addColorStop(0, "#0e1526");
      bgGrad.addColorStop(1, "#030611");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 256, 256);

      // Subtle tech circuit grid
      ctx.strokeStyle = "rgba(79, 124, 255, 0.12)";
      ctx.lineWidth = 1;
      for (let i = 32; i < 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }

      // Outer bounding border
      ctx.strokeStyle = "rgba(79, 124, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 236, 236);

      // Inner tech border
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, 220, 220);

      // Corner brackets (cyber aesthetic)
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 6;
      const corner = 22;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(15, 15 + corner);
      ctx.lineTo(15, 15);
      ctx.lineTo(15 + corner, 15);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(241 - corner, 15);
      ctx.lineTo(241, 15);
      ctx.lineTo(241, 15 + corner);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(15, 241 - corner);
      ctx.lineTo(15, 241);
      ctx.lineTo(15 + corner, 241);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(241 - corner, 241);
      ctx.lineTo(241, 241);
      ctx.lineTo(241, 241 - corner);
      ctx.stroke();

      // Soft luminous central glow disc
      const glowGrad = ctx.createRadialGradient(128, 128, 5, 128, 128, 80);
      glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      glowGrad.addColorStop(0.6, "rgba(99, 102, 241, 0.12)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(128, 128, 80, 0, Math.PI * 2);
      ctx.fill();
    }
    const nTexture = new THREE.CanvasTexture(canvas);
    nTexture.colorSpace = THREE.SRGBColorSpace;

    // Official Favicon Brand Logo with luminous glow
    if (typeof window !== "undefined") {
      const logoImg = new window.Image();
      logoImg.src = "/favicon.png";
      logoImg.onload = () => {
        if (ctx) {
          ctx.save();
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 16;
          ctx.drawImage(logoImg, 64, 64, 128, 128);
          ctx.restore();
          nTexture.needsUpdate = true;
        }
      };
    }

    // MeshStandardMaterial: Same stunning cyber sheen with ~5x faster fragment evaluation than physical
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: nTexture,
      emissive: 0x3b82f6,
      emissiveMap: nTexture,
      emissiveIntensity: 0.9,
      metalness: 0.2,
      roughness: 0.25,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    group.add(cube);

    // Outer Glass Sphere (lightweight standard material with transparency)
    const sphereGeometry = new THREE.SphereGeometry(1.85, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.16,
    });
    const glassSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(glassSphere);

    // Orbiting Rings
    const createOrbitRing = (radius: number, color: number, opacity: number) => {
      const ringGeom = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;
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

    // Smooth Mouse Interactivity
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible || !isTabVisible) return;
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Resize Handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight || 450;
        const mobile = w < 640;
        camera.fov = mobile ? 46 : 45;
        camera.position.z = mobile ? 6.5 : 7;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 100);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Render Loop state
    let animId = 0;
    let isTabVisible = !document.hidden;
    let isVisible = true;

    const startAnimation = () => {
      if (!animId && isVisible && isTabVisible) {
        animId = requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    // Tab Visibility Tracking to completely sleep when backgrounded
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Viewport Visibility Tracking via IntersectionObserver — halts WebGL completely when scrolled past hero
    const observer = new IntersectionObserver(
      (entries) => {
        const wasVisible = isVisible;
        isVisible = entries[0].isIntersecting;
        if (isVisible && !wasVisible) {
          startAnimation();
        } else if (!isVisible) {
          stopAnimation();
        }
      },
      { threshold: 0 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Precompile shaders to eliminate first-frame compilation stutter
    renderer.compile(scene, camera);

    // Render Loop (constant 60fps with zero scroll contention)
    const startTime = performance.now();

    const animate = () => {
      if (!isVisible || !isTabVisible) {
        animId = 0;
        return;
      }

      animId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      cube.rotation.y = elapsedTime * 0.12;
      cube.rotation.x = elapsedTime * 0.06;
      glassSphere.rotation.y = -elapsedTime * 0.05;

      ring1.rotation.y = elapsedTime * 0.15;
      ring2.rotation.y = -elapsedTime * 0.2;
      ring3.rotation.x = elapsedTime * 0.1;

      group.position.y = Math.sin(elapsedTime * 0.7) * 0.1;

      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      group.rotation.y = currentX * 0.3;
      group.rotation.x = -currentY * 0.3;

      renderer.render(scene, camera);
    };

    // Start animation loop
    startAnimation();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      cubeGeometry.dispose();
      cubeMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      nTexture.dispose();

      [ring1, ring2, ring3].forEach((r) => {
        r.geometry.dispose();
        if (Array.isArray(r.material)) {
          r.material.forEach((m) => m.dispose());
        } else {
          r.material.dispose();
        }
      });

      renderer.dispose();
    };
  }, []);

  // Floating cards — Desktop only (md+)
  const floatingCards = [
    {
      title: "AI AUTOMATION",
      desc: "Workflows that work for you",
      icon: Workflow,
      position: "top-8 right-2 lg:right-[-40px]",
      pulseColor: "bg-blue-500",
    },
    {
      title: "AI AGENTS",
      desc: "Intelligent agents that get things done",
      icon: Cpu,
      position: "top-[32%] left-2 lg:left-[-60px]",
      pulseColor: "bg-purple-500",
    },
    {
      title: "LEAD GENERATION",
      desc: "Find, engage & convert high-quality leads",
      icon: BarChart3,
      position: "bottom-[20%] left-6 lg:left-[-20px]",
      pulseColor: "bg-indigo-500",
    },
    {
      title: "WEB DEVELOPMENT",
      desc: "Fast, modern & high-converting sites",
      icon: Globe,
      position: "bottom-[12%] right-6 lg:right-[-40px]",
      pulseColor: "bg-cyan-500",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center relative select-none">
      {/* 3D WebGL Canvas Wrapper */}
      <div
        ref={containerRef}
        className="w-full h-[250px] sm:h-[320px] md:h-[450px] lg:h-[560px] flex items-center justify-center relative"
      >
        {/* 3D WebGL Canvas */}
        <canvas ref={canvasRef} className="w-full h-full max-w-full outline-none z-10" />

        {/* Ambient background glow */}
        <div className="absolute inset-0 w-[80%] h-[80%] rounded-full bg-accent-glow blur-[80px] pointer-events-none opacity-40 mix-blend-screen scale-75 m-auto z-0" />

        {/* Floating DOM Cards — Desktop only (md+) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden md:block">
          {floatingCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`absolute ${card.position} w-[220px] md:w-[260px] pointer-events-auto border border-border-custom/50 dark:border-border-custom bg-surface/90 dark:bg-surface/80 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl hover:border-accent-custom hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 group flex flex-row items-center gap-3`}
              >
                <div className="w-8 h-8 rounded-lg bg-surface border border-border-custom flex items-center justify-center text-accent-custom shrink-0 group-hover:bg-accent-custom group-hover:text-white transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="text-left overflow-hidden">
                  <h4 className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase truncate">
                    {card.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-foreground/90 mt-1 leading-snug truncate sm:whitespace-normal">
                    {card.desc}
                  </p>
                </div>

                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full flex items-center justify-center bg-background border border-border-custom shadow">
                  <span className={`w-1.5 h-1.5 rounded-full ${card.pulseColor} animate-ping`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Responsive 2x2 Feature Grid */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 px-1 block md:hidden z-20">
        {floatingCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="border border-border-custom bg-surface/90 dark:bg-surface/80 backdrop-blur-md p-2.5 rounded-xl flex items-center gap-2 shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-surface border border-border-custom flex items-center justify-center text-accent-custom shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <h4 className="text-[9px] font-mono font-bold tracking-wider text-accent-custom uppercase truncate">
                  {card.title}
                </h4>
                <p className="text-[10px] text-foreground/80 font-medium truncate leading-tight">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
