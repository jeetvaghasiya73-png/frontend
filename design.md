# Tech Infinix Design System & UI Guidelines (`design.md`)

This document is the **single source of truth** for all visual styling, typography, component geometry, and design constraints across the Tech Infinix website. 
All future features, pages, and components **must adhere strictly** to these specifications.

---

## 1. Core Visual Philosophy: Sharp Geometric Tech Aesthetic

The website follows a high-end, precise **engineering / systems architecture aesthetic** (inspired by MadeWithGSAP and linear developer tools):
- **Crisp Geometry:** Subtle, sharp borders — **NEVER** large, bubble-like rounded corners on structural cards.
- **Hairline Borders:** Clean 1px borders (`border-border-custom`) that define grids and information hierarchies without heavy shadows.
- **Subtle Glassmorphism:** Micro-transparency with backdrop blur (`bg-surface/30 backdrop-blur-md`) rather than heavy frosted overlays.
- **Theme-First Adaptability:** Seamless support for both Dark Mode (default deep black `#000000`) and Light Mode (`#FAFAFA`).

---

## 2. Border Radius Standards (STRICT CONSTRAINT)

> [!CAUTION]
> **DO NOT** convert cards to `rounded-2xl` or `rounded-3xl`. The site's signature look is defined by crisp, structured, rectangular geometric precision.

| Component Type | Permitted Tailwind Radius | Example Usage |
| :--- | :--- | :--- |
| **Main Content Cards** | `rounded-md` (or `rounded-lg` max) | Service cards, blueprint tiles, process steps, FAQ items |
| **Form Cards & Containers** | `rounded-lg` | Contact form container, multi-step review box |
| **Small Icons / Badges** | `rounded-sm` or `rounded-xs` | Number tags `[01]`, small icon squares `w-8 h-8 rounded-sm` |
| **Status Pills & Action CTAs** | `rounded-full` | Diode pills (`[01] Core Services`), header pill buttons, primary hero CTAs |
| **Input Fields & Textareas** | `rounded-md` | Contact form inputs, newsletter subscription inputs |

---

## 3. Typography Architecture: Poppins Standard

The website standardizes on **Poppins** for all titles, headings, navigational labels, and body text, with monospace accents for technical telemetry.

### Font Pairing:
1. **Primary Font:** **Poppins** (`next/font/google`)
   - Configured globally via `--font-poppins` and applied to `<html>`, `<body>`, and all heading tags (`h1` - `h6`).
   - Weights in use: `300` (Light), `400` (Regular), `500` (Medium), `600` (Semi-Bold), `700` (Bold), `800` (Extra Bold).
2. **Telemetry & Code Font:** **JetBrains Mono** (`--font-mono`)
   - Used for step numbers (`01`, `02`), technical metrics (`99.9%`, `+340%`), query prompts, and terminal tags.

### Typographic Scale:
- **Hero Title (`h1`):** `text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight leading-[1.18]`
- **Section Heading (`h2`):** `text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3`
- **Card Title (`h3`):** `text-base sm:text-lg font-bold tracking-tight text-foreground`
- **Body Text (`p`):** `text-xs sm:text-sm text-secondary-custom leading-relaxed`
- **Diode Badges:** `text-[10px] uppercase tracking-widest font-mono font-bold text-foreground`
- **Pill / Button Text:** `text-xs uppercase tracking-wider font-semibold`

---

## 4. Color Palette & Semantic Tokens

Always use theme variables defined in `src/app/globals.css`. **Never hardcode** `text-white` or `bg-black` for core elements so both Light and Dark themes render with optimal contrast.

| Token | Dark Mode Value | Light Mode Value | Description |
| :--- | :--- | :--- | :--- |
| `var(--background)` | `#000000` | `#FAFAFA` | Main page background |
| `var(--foreground)` | `#EDEDED` | `#111111` | Primary text and dark/light inversion |
| `var(--surface)` | `#0A0A0A` | `#FFFFFF` | Card surface backgrounds |
| `var(--border-custom)` | `#222222` | `#E6E6E6` | Subtle 1px structural borders |
| `var(--secondary-custom)` | `#A1A1AA` | `#666666` | Muted subtitle, paragraph, and meta text |
| `var(--accent-custom)` | `#6366F1` (Indigo) | `#2962FF` (Royal Blue) | Primary brand accents, active states, glowing diodes |

---

## 5. Component Construction Rules

1. **Card Hover States:**
   - Use subtle border brightening: `hover:border-foreground/30` or `hover:border-indigo-400/40`.
   - Never use dramatic elevation or heavy drop-shadows. Maintain flat, crisp layering.
2. **Icons:**
   - Render icons at `w-3.5 h-3.5` or `w-4 h-4` inside small square frames (`w-7 h-7 rounded-sm` or `w-8 h-8 rounded-sm`).
3. **Animations:**
   - Use subtle GSAP reveals (`hero-smooth-reveal`) and `<SplitText />` word reveals on main headlines.
   - Respect `prefers-reduced-motion` for accessibility.
4. **Forms:**
   - Clean 1px bordered inputs with dark/light background switches, clear error states, and responsive multi-step wizards.
