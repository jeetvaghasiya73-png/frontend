"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { Database, Cpu, Send, RefreshCw } from "lucide-react";

/* ─── Data ────────────────────────────────────────────────── */

interface PhaseData {
  id: string;
  number: string;
  label: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  accentColor: string;
  accentGlow: string;
}

const phases: PhaseData[] = [
  {
    id: "ingest",
    number: "01",
    label: "INGEST",
    title: "Connect and Aggregate Data Silos",
    desc: "Our automated systems extract, sanitize, and unify data from unstructured emails, web platforms, and legacy CRM networks directly into your pipelines.",
    icon: Database,
    accentColor: "#3B82F6",
    accentGlow: "rgba(59, 130, 246, 0.35)",
  },
  {
    id: "reason",
    number: "02",
    label: "REASON",
    title: "Intelligent Multi-Agent Processing",
    desc: "Raw inputs are mapped to semantic vectors. Autonomous AI agents evaluate context, run predictive models, and determine optimal workflows.",
    icon: Cpu,
    accentColor: "#A855F7",
    accentGlow: "rgba(168, 85, 247, 0.35)",
  },
  {
    id: "activate",
    number: "03",
    label: "ACTIVATE",
    title: "Zero-Touch Automation & Growth",
    desc: "Instantly trigger downstream logic, issue custom API webhooks, update client databases, push notifications to Slack, and initiate outbound flows.",
    icon: Send,
    accentColor: "#EF4444",
    accentGlow: "rgba(239, 68, 68, 0.35)",
  },
];

/* ─── Detail Panels ───────────────────────────────────────── */

function IngestPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {[
        { label: "CRM Sync Node", val: "Salesforce Active", metric: "99.9% deduplicated", accent: "from-blue-500/10 to-blue-500/5 border-blue-500/20" },
        { label: "Web Scraping Node", val: "Playwright Active", metric: "24/7 rotations", accent: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20" },
        { label: "Document Parser", val: "PDF Extractor Ingest", metric: "244 records/min", accent: "from-teal-500/10 to-teal-500/5 border-teal-500/20" },
      ].map((m, i) => (
        <div key={i} className={`border bg-gradient-to-br ${m.accent} p-5 rounded-2xl text-left flex flex-col justify-between h-[130px] shadow-lg backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold tracking-wider text-foreground/50 uppercase">{m.label}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground mb-1">{m.val}</h4>
            <span className="text-[10px] text-foreground/60 font-mono">{m.metric}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReasonPanel() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full border border-border-custom bg-surface/40 backdrop-blur-lg px-5 py-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
          <span className="text-xs font-mono font-bold text-foreground">Dashboard / Processing Node</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-md text-[10px] font-bold text-purple-400">
            Temperature: 0.2
          </div>
          <button className="bg-foreground text-background font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg">Run Agent</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        {["Context Lookup", "Vector Indexing", "Prompt Assembly", "Model Validation"].map((t, i) => (
          <div key={i} className="border border-border-custom bg-surface/20 p-3.5 rounded-xl text-left">
            <span className="text-[9px] font-mono text-purple-400 font-bold block mb-1">NODE 0{i + 1}</span>
            <span className="text-xs font-bold text-foreground">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivatePanel() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-12 gap-4">
      <div className="sm:col-span-5 border border-border-custom bg-surface/30 backdrop-blur-md p-5 rounded-2xl text-left space-y-3">
        <span className="text-[9px] font-mono text-red-400 font-bold tracking-wider uppercase block">API Endpoints Fired</span>
        <div className="space-y-2.5 font-mono text-[10px]">
          {[
            { method: "POST /leads", status: "200 OK" },
            { method: "POST /webhooks", status: "201 Created" },
            { method: "POST /messages", status: "200 OK" },
          ].map((e, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border-custom/50 pb-2 last:border-b-0">
              <span className="text-emerald-400 font-bold">{e.method}</span>
              <span className="text-foreground/60">{e.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sm:col-span-7 border border-border-custom bg-background/60 backdrop-blur-md p-5 rounded-2xl text-left font-mono overflow-hidden">
        <span className="text-[9px] text-foreground/40 font-bold block mb-3">payload.json</span>
        <pre className="text-[10px] text-emerald-400 leading-relaxed overflow-x-auto">
{`{
  "status": "success",
  "client": "Apex Growth",
  "data": {
    "leads_processed": 55420,
    "slack_delivered": true,
    "deduplication_rate": "100%"
  }
}`}
        </pre>
      </div>
    </div>
  );
}

const panelComponents = [IngestPanel, ReasonPanel, ActivatePanel];

/* ─── Particle Network (Three.js) ─────────────────────────── */

function useParticleNetwork(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  activeColor: string,
  resolvedTheme?: string
) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const colorRef = useRef(activeColor);

  useEffect(() => {
    colorRef.current = activeColor;
  }, [activeColor]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Determine particle count based on viewport
    const isMobile = width < 768;
    const isTablet = width < 1024;
    // Reduced particle count significantly for performance
    const particleCount = isMobile ? 40 : isTablet ? 60 : 80;
    const connectionDistance = isMobile ? 120 : 180;

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, width, 0, height, -100, 100);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio to 1.5 for performance

    // Theme specific overrides
    const isLight = resolvedTheme === "light";
    const particleOpacity = isLight ? 0.3 : 0.6;
    const lineOpacity = isLight ? 0.1 : 0.25;
    const blendingMode = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;

    // Particles
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = Math.random() * width;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = 0;
      velocities.push({
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.3,
      });
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const pointMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(colorRef.current),
      size: isMobile ? 2 : 2.5,
      transparent: true,
      opacity: particleOpacity,
      blending: blendingMode,
      depthWrite: false,
    });

    const points = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(points);

    // Connection lines
    // Reduced max connections significantly for performance
    const maxConnections = Math.floor(particleCount * 1.5);
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: lineOpacity,
      blending: blendingMode,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Visibility Tracking for Performance
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    // Animation
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return; // Pause rendering if not in viewport
      const elapsed = clock.getElapsedTime();
      const posArray = pointGeometry.attributes.position.array as Float32Array;

      // Update particle color smoothly
      const targetColor = new THREE.Color(colorRef.current);
      pointMaterial.color.lerp(targetColor, 0.03);

      // Move particles
      if (!prefersReducedMotion) {
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;

          posArray[ix] += velocities[i].x;
          posArray[iy] += velocities[i].y;

          // Soft sine wave
          posArray[iy] += Math.sin(elapsed * 0.4 + i * 0.1) * 0.05;

          // Boundary wrap
          if (posArray[ix] < -10) posArray[ix] = width + 10;
          if (posArray[ix] > width + 10) posArray[ix] = -10;
          if (posArray[iy] < -10) posArray[iy] = height + 10;
          if (posArray[iy] > height + 10) posArray[iy] = -10;

          // Mouse attraction (desktop only)
          if (!isMobile) {
            const dx = mouseRef.current.x - posArray[ix];
            const dy = mouseRef.current.y - posArray[iy];
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
              const force = (180 - dist) / 180 * 0.008;
              posArray[ix] += dx * force;
              posArray[iy] += dy * force;
            }
          }
        }
      }

      pointGeometry.attributes.position.needsUpdate = true;

      // Update connections
      let lineIdx = 0;
      const cColor = new THREE.Color(colorRef.current);
      const r = cColor.r, g = cColor.g, b = cColor.b;

      for (let i = 0; i < particleCount && lineIdx < maxConnections; i++) {
        for (let j = i + 1; j < particleCount && lineIdx < maxConnections; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = 1 - dist / connectionDistance;
            const li = lineIdx * 6;

            linePositions[li] = posArray[i * 3];
            linePositions[li + 1] = posArray[i * 3 + 1];
            linePositions[li + 2] = 0;
            linePositions[li + 3] = posArray[j * 3];
            linePositions[li + 4] = posArray[j * 3 + 1];
            linePositions[li + 5] = 0;

            lineColors[li] = r * alpha;
            lineColors[li + 1] = g * alpha;
            lineColors[li + 2] = b * alpha;
            lineColors[li + 3] = r * alpha;
            lineColors[li + 4] = g * alpha;
            lineColors[li + 5] = b * alpha;

            lineIdx++;
          }
        }
      }

      // Zero out unused
      for (let i = lineIdx * 6; i < linePositions.length; i++) {
        linePositions[i] = 0;
        lineColors[i] = 0;
      }

      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIdx * 2);

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      const r = container.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      camera.right = w;
      camera.bottom = h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      if (!isMobile) window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      pointGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ─── Main Component ──────────────────────────────────────── */

export default function DataFlowShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const activePhase = phases[activeIdx];
  const ActivePanel = panelComponents[activeIdx];

  // Particle network
  useParticleNetwork(canvasRef, containerRef, activePhase.accentColor);

  // ─── Entrance animation ──────────────────────────────────
  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(".dfs-entrance", { opacity: 1, y: 0, filter: "blur(0px)" });
        return;
      }

      // Initial set to prevent FOUC before animation starts
      gsap.set(".dfs-entrance", { opacity: 0, y: 40, filter: "blur(8px)", willChange: "transform, opacity, filter" });

      gsap.to(".dfs-entrance", {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.1,
      });

      // Canvas fade
      if (canvasRef.current) {
        gsap.fromTo(canvasRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.out" });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ─── Tab content transition ──────────────────────────────
  useEffect(() => {
    if (!contentRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(contentRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
    );
  }, [activeIdx]);

  // ─── Auto-cycle ──────────────────────────────────────────
  const CYCLE_MS = 6000;

  const startCycle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % phases.length);
    }, CYCLE_MS);
  }, []);

  useEffect(() => {
    startCycle();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCycle]);

  // Reset progress bar animation when tab changes
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.animation = "none";
      void progressRef.current.offsetHeight;
      progressRef.current.style.animation = `progress-fill ${CYCLE_MS}ms linear forwards`;
    }
  }, [activeIdx]);

  const handleTabClick = (idx: number) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    startCycle();
  };

  // ─── Cursor parallax on card ─────────────────────────────
  useEffect(() => {
    if (!cardRef.current) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    if (sectionRef.current) observer.observe(sectionRef.current);

    const handleMove = (e: MouseEvent) => {
      if (!cardRef.current || !isVisible) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) / rect.width * 8;
      targetY = (e.clientY - cy) / rect.height * 6;
    };

    const lerp = () => {
      rafId = requestAnimationFrame(lerp);
      if (!isVisible) return;
      
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) perspective(1000px) rotateY(${currentX * 0.15}deg) rotateX(${-currentY * 0.15}deg)`;
      }
    };

    window.addEventListener("mousemove", handleMove);
    rafId = requestAnimationFrame(lerp);

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
      if (cardRef.current) {
        cardRef.current.style.transform = "";
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 md:py-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/30 via-background to-background dark:from-[#10131f] dark:via-[#050505] dark:to-[#050505]"
    >
      {/* ─── Particle Canvas ─── */}
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* ─── Animated Gradient Blobs (Optimized blurs) ─── */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.15] dark:opacity-20 animate-float-blob-1 will-change-transform"
          style={{ background: activePhase.accentGlow, top: "10%", left: "5%", transition: "background 1.5s ease" }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.1] dark:opacity-10 animate-float-blob-2 will-change-transform"
          style={{ background: activePhase.accentGlow, bottom: "20%", right: "10%", transition: "background 1.5s ease" }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full blur-3xl opacity-[0.08] dark:opacity-10 animate-float-blob-3 will-change-transform"
          style={{ background: "rgba(6, 182, 212, 0.2)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="dfs-entrance inline-flex items-center gap-2 border border-border-custom bg-surface/50 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: activePhase.accentColor, transition: "background 0.6s ease" }} />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-secondary-custom">
              Data Flow Engine
            </span>
          </div>
          <h2 className="dfs-entrance text-3xl md:text-5xl xl:text-6xl font-bold tracking-tight mb-5 max-w-4xl mx-auto">
            From Raw Data to{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Autonomous Growth
            </span>
          </h2>
          <p className="dfs-entrance text-base md:text-lg text-secondary-custom max-w-2xl mx-auto leading-relaxed">
            See how our three-phase intelligence pipeline transforms raw business inputs into fully automated, revenue-driving operations.
          </p>
        </div>

        {/* ─── Tab Navigation ─── */}
        <div className="dfs-entrance flex flex-col items-center mb-10">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl border border-border-custom bg-surface/40 backdrop-blur-lg shadow-lg">
            {phases.map((phase, idx) => {
              const Icon = phase.icon;
              const isActive = idx === activeIdx;
              return (
                <button
                  key={phase.id}
                  onClick={() => handleTabClick(idx)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className={`
                    relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider
                    transition-all duration-400 ease-out cursor-pointer select-none
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-custom
                    ${isActive
                      ? "text-foreground shadow-lg"
                      : "text-secondary-custom hover:text-foreground"
                    }
                  `}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${phase.accentColor}18, ${phase.accentColor}08)`,
                    boxShadow: `0 0 20px ${phase.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                    border: `1px solid ${phase.accentColor}30`,
                  } : undefined}
                >
                  <Icon className="w-3.5 h-3.5" style={isActive ? { color: phase.accentColor } : undefined} />
                  <span className="hidden sm:inline">{phase.label}</span>
                  <span className="sm:hidden">{phase.number}</span>

                  {/* Progress bar under active tab */}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full overflow-hidden bg-foreground/10">
                      <div
                        ref={progressRef}
                        className="h-full rounded-full"
                        style={{
                          background: phase.accentColor,
                          animation: `progress-fill ${CYCLE_MS}ms linear forwards`,
                          animationPlayState: isHovering ? "paused" : "running",
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Main Card ─── */}
        <div
          ref={cardRef}
          className="dfs-entrance will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Reduced backdrop blur from xl to md for better performance */}
          <div className="relative rounded-3xl border border-border-custom bg-surface/30 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Card inner glow */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 transition-all duration-1000"
              style={{
                background: `radial-gradient(ellipse at 30% 20%, ${activePhase.accentGlow}, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.08), transparent 50%)`,
              }}
            />

            {/* Glassmorphism top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div ref={contentRef} className="relative z-10 p-8 md:p-12 lg:p-14">
              {/* Phase header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500"
                      style={{
                        background: `${activePhase.accentColor}15`,
                        borderColor: `${activePhase.accentColor}30`,
                        boxShadow: `0 0 25px ${activePhase.accentGlow}`,
                      }}
                    >
                      <activePhase.icon className="w-4.5 h-4.5" style={{ color: activePhase.accentColor }} />
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold tracking-widest uppercase"
                      style={{ color: activePhase.accentColor }}
                    >
                      {activePhase.number} / {activePhase.label}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 max-w-xl">
                    {activePhase.title}
                  </h3>
                  <p className="text-sm md:text-base text-secondary-custom leading-relaxed max-w-lg">
                    {activePhase.desc}
                  </p>
                </div>

                {/* Phase indicator dots */}
                <div className="flex md:flex-col gap-2 items-center">
                  {phases.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to phase ${i + 1}`}
                      className="w-2 h-2 rounded-full transition-all duration-500 cursor-pointer"
                      onClick={() => handleTabClick(i)}
                      style={{
                        background: i === activeIdx ? activePhase.accentColor : "var(--border-custom)",
                        boxShadow: i === activeIdx ? `0 0 10px ${activePhase.accentGlow}` : "none",
                        transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Detail panel */}
              <div className="relative">
                <ActivePanel />
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between border-t border-border-custom/50 pt-5 mt-8">
                <span className="text-[10px] font-mono text-secondary-custom tracking-wider">
                  NEXORA DATA FLOW ENGINE
                </span>
                <span
                  className="text-5xl md:text-7xl font-black font-mono tracking-tight select-none leading-none transition-colors duration-500"
                  style={{ color: `${activePhase.accentColor}12` }}
                >
                  {activePhase.number}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
