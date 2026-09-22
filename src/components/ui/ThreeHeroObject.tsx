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
    const height = containerRef.current.clientHeight || 450;
    const isMobile = width < 640;

    // Scene
    const scene = new THREE.Scene();

    // Camera — responsive framing (tight zoom on mobile so orb fills canvas nicely)
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 46 : 45,
      width / height,
      0.1,
      100
    );
    camera.position.z = isMobile ? 6.5 : 7;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

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

    // Central Monolith (Inner Cube)
    const cubeGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);

    // Create high-res dynamic canvas for the glowing Tech Infinix logo texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Sleek cyber gradient background
      const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
      bgGrad.addColorStop(0, "#0e1526");
      bgGrad.addColorStop(1, "#030611");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Subtle tech circuit grid
      ctx.strokeStyle = "rgba(79, 124, 255, 0.12)";
      ctx.lineWidth = 2;
      for (let i = 64; i < 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }

      // Outer bounding border
      ctx.strokeStyle = "rgba(79, 124, 255, 0.35)";
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 472, 472);

      // Inner tech border
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 8;
      ctx.strokeRect(36, 36, 440, 440);

      // Corner brackets (cyber aesthetic)
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 12;
      const corner = 45;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(30, 30 + corner);
      ctx.lineTo(30, 30);
      ctx.lineTo(30 + corner, 30);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(482 - corner, 30);
      ctx.lineTo(482, 30);
      ctx.lineTo(482, 30 + corner);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(30, 482 - corner);
      ctx.lineTo(30, 482);
      ctx.lineTo(30 + corner, 482);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(482 - corner, 482);
      ctx.lineTo(482, 482);
      ctx.lineTo(482, 482 - corner);
      ctx.stroke();

      // Soft luminous central glow disc
      const glowGrad = ctx.createRadialGradient(256, 256, 10, 256, 256, 160);
      glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      glowGrad.addColorStop(0.6, "rgba(99, 102, 241, 0.12)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(256, 256, 160, 0, Math.PI * 2);
      ctx.fill();

      // Bold Luminous "TI" Logo with Cyan Glow (centered perfectly on every face)
      ctx.save();
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 36;
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 200px -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TI", 256, 256);
      ctx.restore();
    }
    const nTexture = new THREE.CanvasTexture(canvas);
    nTexture.colorSpace = THREE.SRGBColorSpace;

    const cubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: nTexture,
      emissive: 0x3b82f6,
      emissiveMap: nTexture,
      emissiveIntensity: 0.85,
      metalness: 0.2,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    group.add(cube);

    // Outer Glass Sphere (optimized for ultra-high FPS without framebuffer copies)
    const sphereGeometry = new THREE.SphereGeometry(1.85, 40, 40);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      metalness: 0.1,
      roughness: 0.08,
      transparent: true,
      opacity: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9,
    });
    const glassSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(glassSphere);

    // Orbiting Rings
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
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Scroll mapping
    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Resize Handler — responsive camera adjustment
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      const mobile = w < 640;
      camera.fov = mobile ? 46 : 45;
      camera.position.z = mobile ? 6.5 : 7;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Tab Visibility Tracking to completely sleep when backgrounded
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Viewport Visibility Tracking via IntersectionObserver
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

    // Precompile shaders to eliminate first-frame compilation stutter
    renderer.compile(scene, camera);

    // Render Loop (using performance.now for smooth 60fps)
    const startTime = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible || !isTabVisible) return;

      const elapsedTime = (performance.now() - startTime) * 0.001;

      cube.rotation.y = elapsedTime * 0.12;
      cube.rotation.x = elapsedTime * 0.06;
      glassSphere.rotation.y = -elapsedTime * 0.05;

      ring1.rotation.y = elapsedTime * 0.15;
      ring2.rotation.y = -elapsedTime * 0.2;
      ring3.rotation.x = elapsedTime * 0.1;

      group.position.y = Math.sin(elapsedTime * 0.7) * 0.12;

      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      group.rotation.y = currentX * 0.35;
      group.rotation.x = -currentY * 0.35;

      const scrollScale = Math.max(0.7, 1 - scrollY * 0.0005);
      group.scale.set(scrollScale, scrollScale, scrollScale);
      group.rotation.z = scrollY * 0.0008;

      blueLight.position.x = Math.sin(elapsedTime * 0.5) * 5;
      blueLight.position.z = Math.cos(elapsedTime * 0.5) * 5;
      purpleLight.position.x = -Math.sin(elapsedTime * 0.4) * 5;
      purpleLight.position.y = Math.cos(elapsedTime * 0.4) * 5;

      renderer.render(scene, camera);
    };

    // Defer start by a micro-tick to let React finish hydrating smoothly
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
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

  // Floating cards — HIDDEN below md breakpoint to prevent overlap on mobile
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
        <div className="absolute inset-0 w-[80%] h-[80%] rounded-full bg-accent-glow blur-[100px] sm:blur-[120px] pointer-events-none opacity-40 mix-blend-screen scale-75 m-auto z-0" />

        {/* Floating DOM Cards — Desktop only (md+) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden md:block">
          {floatingCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`absolute ${card.position} w-[220px] md:w-[260px] pointer-events-auto border border-border-custom/50 dark:border-border-custom bg-surface/90 dark:bg-surface/80 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl hover:border-accent-custom hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-500 group flex flex-row items-center gap-3 animate-float-card`}
                style={{
                  animationDelay: `${idx * 0.7}s`,
                }}
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

      {/* Mobile Responsive 2x2 Feature Grid — Perfectly fills responsive space without empty gaps */}
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
