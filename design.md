# Tech Infinix Design System & Architecture Specification (`design.md`)

This document is the **authoritative single source of truth** for all visual styling, typography, component geometry, performance standards, and UX architecture across the Tech Infinix website.

> [!IMPORTANT]
> Whenever you plan, design, or create any new page, section, or component, **you must strictly follow this design specification**. Do not deviate from these tokens, radii, or architectural constraints.

---

## 1. Design Philosophy: Sharp Geometric Tech Aesthetic

The Tech Infinix aesthetic is inspired by high-end developer platforms and creative engineering showcases (e.g. MadeWithGSAP, Linear, Vercel):
- **Crisp Geometric Precision:** Clean rectangular cards with subtle 1px hairline borders (`border-border-custom`).
- **Zero "Bubble" Bloat:** Never use large, playful, rounded-2xl or rounded-3xl corners on structural cards or containers.
- **Dual-Theme Contrast:** Native support for Dark Mode (obsidian `#000000` / `#0A0A0A`) and Light Mode (`#FAFAFA` / `#FFFFFF`).
- **Telemetry & Micro-Badges:** Monospace status pills, blinking live diodes, and structured numerical labels (`[01]`, `[02]`).
- **High-Velocity Performance:** Pages must feel instantaneous. Never use synthetic blocking loaders, heavy unoptimized materials, or autofocus attributes that hijack user scrolling.

---

## 2. Border Radius Standards (STRICT CONSTRAINT)

| Component Type | Permitted Tailwind Class | Purpose & Examples |
| :--- | :--- | :--- |
| **Main Content Cards** | `rounded-md` (or `rounded-lg` max) | Service cards, blueprints, process cards, FAQ items, testimonials |
| **Form Containers** | `rounded-lg` or `rounded-md` | Contact form wrapper, multi-step review box |
| **Pill Tags & Action Buttons** | `rounded-full` | Primary CTAs, status badges, diode tags, header capsule bar |
| **Micro-Badges & Icon Boxes** | `rounded-sm` or `rounded-xs` | Number tags `[01]`, icon squares `w-7 h-7 rounded-sm` |
| **Form Inputs & Textareas** | `rounded-md` | Text fields, select chips, email & phone inputs |

> [!CAUTION]
> **PROHIBITED:** `rounded-2xl` or `rounded-3xl` on content cards, sections, or layout wrappers. Keep geometry sharp, disciplined, and architectural.

---

## 3. Typography Architecture: Poppins + JetBrains Mono

We utilize a two-font architecture:
1. **Primary Typography: Poppins** (`--font-poppins` / `font-sans`)
   - Used for all headlines, subheadings, navigation links, and body copy.
   - Clean geometric grotesque look with balanced legibility.
2. **Telemetry & Code Font: JetBrains Mono** (`--font-mono` / `font-mono`)
   - Used for technical data, percentages (`99.9%`), step numbers (`[01]`), service tags, code snippets, and diode pills.

### Typographic Scale & Classes

| Role | HTML Tag | Tailwind Classes | Example |
| :--- | :--- | :--- | :--- |
| **Hero Display** | `h1` | `text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight leading-[1.18] text-foreground` | "Trusted IT Solutions Provider..." |
| **Section Title** | `h2` | `text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground` | "What We Build for Growing Businesses" |
| **Card Heading** | `h3` | `text-sm sm:text-base md:text-lg font-bold text-foreground` | "SEO & Digital Marketing" |
| **Lead Subtitle** | `p` | `text-xs sm:text-sm md:text-base text-secondary-custom leading-relaxed max-w-2xl` | Section intro paragraphs |
| **Body Text** | `p` | `text-xs sm:text-sm text-secondary-custom leading-relaxed` | Card descriptions, blog article text |
| **Diode Badge** | `span` / `div` | `text-[10px] uppercase tracking-widest font-mono font-bold text-foreground` | `[01] Core Services` |
| **Button Text** | `button` / `Link` | `text-xs font-mono uppercase tracking-wider font-bold` | `Get a Free Quote` |

---

## 4. Color Palette & Semantic Design Tokens

Always use Tailwind variables defined in `src/app/globals.css`. **Never hardcode** raw colors like `text-white` or `bg-black` on structural elements so theme toggling remains 100% harmonious.

### Core Semantic Variables

```css
:root {
  --background: #FAFAFA;
  --foreground: #111111;
  --surface: #FFFFFF;
  --border-custom: #E6E6E6;
  --secondary-custom: #666666;
  --accent-custom: #2962FF;       /* Royal Blue */
  --accent-glow: rgba(41, 98, 255, 0.08);
}

.dark {
  --background: #000000;
  --foreground: #EDEDED;
  --surface: #0A0A0A;
  --border-custom: #222222;
  --secondary-custom: #A1A1AA;
  --accent-custom: #6366F1;       /* Electric Indigo */
  --accent-glow: rgba(99, 102, 241, 0.1);
}
```

### Service Pillar Accent Colors

Each core service has a dedicated signature accent color:
- **SEO & Digital Marketing:** Emerald (`emerald-500`, border `hover:border-emerald-500/40`)
- **Web App Development:** Sky (`sky-500`, border `hover:border-sky-500/40`)
- **Web Scraping & Data Extraction:** Amber (`amber-500`, border `hover:border-amber-500/40`)
- **WhatsApp & Workflow Automation:** Indigo / Purple (`indigo-500`, border `hover:border-indigo-500/40`)

---

## 5. Standard Page Anatomy & Layout Rules

Every standard landing or feature page must follow this anatomical sequence:

```
┌───────────────────────────────────────────────────────────┐
│ 1. Floating Capsule Header (Navbar.tsx)                   │
├───────────────────────────────────────────────────────────┤
│ 2. Diode Ticker Bar (Live Status & Top CTA)              │
├───────────────────────────────────────────────────────────┤
│ 3. Hero / Page Header (Headline + Badges + 3D/Visual Mesh)│
├───────────────────────────────────────────────────────────┤
│ 4. Metrics & KPI Strip (Geometric Rectangular Tiles)      │
├───────────────────────────────────────────────────────────┤
│ 5. Feature & Blueprint Sections (Cards with 1px border)  │
├───────────────────────────────────────────────────────────┤
│ 6. Process / Step-by-Step Architecture                   │
├───────────────────────────────────────────────────────────┤
│ 7. Proof & Social Validation (Testimonials / Case Studies)│
├───────────────────────────────────────────────────────────┤
│ 8. FAQ Section (Accordion with sharp borders)             │
├───────────────────────────────────────────────────────────┤
│ 9. Contact / Lead Conversion Form (ContactSection.tsx)    │
├───────────────────────────────────────────────────────────┤
│ 10. Footer Section (FooterSection.tsx)                    │
└───────────────────────────────────────────────────────────┘
```

### Standard Container Constraints
- **Section Spacing:** `pt-16 sm:pt-20 pb-12 sm:pb-16`
- **Max Content Width:** `max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full`
- **Grid Background:** Apply `grid-bg` class to hero and banner sections for the signature subtle developer grid.

---

## 6. Critical UX & Performance Rules

### A. Navigation & Scroll Rule (ZERO AUTO-SCROLL HIJACKING)
> [!IMPORTANT]
> **NEVER** add `autoFocus` to `<input>` or `<textarea>` elements inside components mounted on full pages (like `ContactSection`).
> Browser native `autoFocus` forces the viewport to instantly jump down to the input on initial load or route transition, bypassing the top of the page.
> All page transitions must start at coordinates `(0, 0)` at the very top.

### B. Smooth Scroll & Input Latency
- Lenis smooth scroll is configured at `duration: 0.6` with `wheelMultiplier: 1.0` to preserve instant user wheel response while keeping momentum silky smooth.
- GSAP ticker lag smoothing is maintained at `gsap.ticker.lagSmoothing(500, 33)` so background frame drops never cause visual jumping.

### C. 3D & WebGL Performance Budget
- Any 3D component (Three.js) must use `MeshStandardMaterial` rather than heavy PBR physical materials.
- Fixed strategic point lights only (avoid recalculating light positions every single frame).
- Pixel ratio must be clamped: `Math.min(window.devicePixelRatio || 1, 1.25)`.
- Use `IntersectionObserver` with `threshold: 0` to immediately cancel animation frames when the 3D canvas is scrolled out of the viewport.

### D. No Artificial Blocking Loaders
- Do not block initial user interaction with artificial full-screen skeleton delays.
- Use the non-blocking top progress bar (`PageLoader.tsx`) that completes in under 200ms.

---

## 7. Reusable Component Patterns & Code Blueprints

### A. Diode Tag / Pill Badge
```tsx
<div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
    [01] SECTION_NAME
  </span>
</div>
```

### B. Standard Section Title Block
```tsx
<div className="flex flex-col items-start text-left mb-8 sm:mb-12">
  <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-3">
    <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
    <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
      OVERVIEW
    </span>
  </div>
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
    Structured Heading for the Section
  </h2>
  <p className="text-xs sm:text-sm text-secondary-custom max-w-2xl leading-relaxed">
    Clean, concise explanation of the value provided in this section.
  </p>
</div>
```

### C. Standard Geometric Content Card
```tsx
<div className="border border-border-custom bg-surface p-5 sm:p-6 rounded-md hover:border-foreground/30 transition-all duration-300 flex flex-col justify-between group">
  <div className="flex items-center justify-between mb-4">
    <div className="w-8 h-8 rounded-sm bg-background border border-border-custom flex items-center justify-center text-foreground group-hover:border-accent-custom group-hover:text-accent-custom transition-colors">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-secondary-custom px-2 py-0.5 rounded-xs border border-border-custom bg-background">
      [01] BADGE
    </span>
  </div>
  <div>
    <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 group-hover:text-accent-custom transition-colors">
      Card Title Here
    </h3>
    <p className="text-xs text-secondary-custom leading-relaxed">
      Card description explaining the feature or deliverable with precision.
    </p>
  </div>
</div>
```

### D. Primary & Secondary CTA Buttons
```tsx
{/* Primary CTA */}
<Link
  href="/contact"
  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-mono uppercase tracking-wider font-bold transition duration-200 group shadow-xs cursor-pointer"
>
  <span>Get a Free Quote</span>
  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
</Link>

{/* Secondary Outline CTA */}
<Link
  href="/services"
  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border-custom bg-surface hover:bg-surface/80 text-foreground text-xs font-mono uppercase tracking-wider font-semibold transition duration-200 group shadow-xs cursor-pointer"
>
  <span>Explore Services</span>
  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
</Link>
```

---

## 8. New Page Creation Checklist

When creating any new route or page in the application, verify each item before publishing:

- [ ] **Design Tokens:** Are all backgrounds, cards, borders, and text using semantic CSS tokens (`bg-background`, `bg-surface`, `border-border-custom`, `text-foreground`, `text-secondary-custom`)?
- [ ] **Border Radii:** Are cards `rounded-md` or `rounded-lg`? Are pills `rounded-full`? Are `rounded-2xl` and `rounded-3xl` avoided?
- [ ] **Typography:** Are headlines using Poppins and telemetry tags using JetBrains Mono?
- [ ] **Scroll to Top:** Does navigating to this page start cleanly at `(0, 0)` without jumping down?
- [ ] **No Autofocus:** Are there **zero** `autoFocus` attributes on inputs or forms on the page?
- [ ] **SEO Meta:** Are `metadata` or dynamic `generateMetadata` defined with descriptive title and openGraph image?
- [ ] **Performance:** Is below-the-fold content lazy-loaded or dynamically imported if heavy?
- [ ] **Mobile Responsiveness:** Does the layout collapse cleanly on screens below 640px?
